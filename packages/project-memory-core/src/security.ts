import { createHash } from "node:crypto";
import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import path from "node:path";
import createIgnore from "ignore";
import { ProjectMemoryError } from "./errors.js";
import { listGitFiles } from "./git.js";
import { matchesCustomDeny } from "./paths.js";
import type { FileSearchResult, ReadFileResult } from "./types.js";

const MAX_FILE_BYTES = 1024 * 1024;
const MAX_SEARCH_RESULTS = 50;
const MAX_SEARCH_FILES = 10_000;
const MAX_EXCERPT_CHARS = 400;

const DENIED_SEGMENTS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "target",
  ".next",
  ".turbo",
  "coverage",
]);

const DENIED_BASENAMES = new Set([
  "id_rsa",
  "id_ed25519",
  "credentials",
  "credentials.json",
  "service-account.json",
]);

const DENIED_EXTENSIONS = new Set([".pem", ".key", ".p12", ".pfx", ".jks", ".keystore"]);

const SECRET_PATTERNS: RegExp[] = [
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/i,
  /\bsk-[A-Za-z0-9_-]{20,}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /(?:password|passwd|secret|token|api[_-]?key)\s*[:=]\s*["']?[A-Za-z0-9_./+=-]{16,}/i,
];

function normalizeRelative(relativePath: string): string {
  if (!relativePath || path.isAbsolute(relativePath)) {
    throw new ProjectMemoryError("PATH_DENIED", "Path must be relative to the project root.", {
      path: relativePath,
    });
  }

  const normalized = relativePath.replaceAll("\\", "/");
  const parts = normalized.split("/").filter(Boolean);
  if (parts.includes("..")) {
    throw new ProjectMemoryError("PATH_DENIED", "Parent path traversal is not allowed.", {
      path: relativePath,
    });
  }
  return parts.join("/");
}

export function isDeniedPath(relativePath: string, customPatterns: string[] = []): boolean {
  const normalized = relativePath.replaceAll("\\", "/");
  const parts = normalized.split("/").filter(Boolean);
  const basename = parts.at(-1)?.toLowerCase() ?? "";
  const extension = path.extname(basename);

  return (
    parts.some((part) => DENIED_SEGMENTS.has(part)) ||
    /^\.env(?:\.|$)/i.test(basename) ||
    DENIED_BASENAMES.has(basename) ||
    DENIED_EXTENSIONS.has(extension) ||
    matchesCustomDeny(normalized, customPatterns)
  );
}

export function containsSecret(text: string): boolean {
  return SECRET_PATTERNS.some((pattern) => pattern.test(text));
}

export function assertNoSecret(text: string, field: string): void {
  if (containsSecret(text)) {
    throw new ProjectMemoryError("SECRET_DETECTED", `Potential secret detected in ${field}.`, {
      field,
    });
  }
}

export function sha256(data: Buffer | string): string {
  return createHash("sha256").update(data).digest("hex");
}

function ensureInsideRoot(rootPath: string, candidatePath: string): void {
  const relative = path.relative(rootPath, candidatePath);
  if (relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative))) {
    return;
  }
  throw new ProjectMemoryError("PATH_DENIED", "Resolved path escapes the project root.", {
    path: candidatePath,
  });
}

export function resolveReadableFile(
  rootPath: string,
  relativePath: string,
  customPatterns: string[] = [],
): { absolutePath: string; relativePath: string } {
  const normalized = normalizeRelative(relativePath);
  if (isDeniedPath(normalized, customPatterns)) {
    throw new ProjectMemoryError("PATH_DENIED", "Path is blocked by the project memory policy.", {
      path: normalized,
    });
  }

  const realRoot = realpathSync(rootPath);
  const candidate = path.resolve(realRoot, normalized);
  if (!existsSync(candidate)) {
    throw new ProjectMemoryError("FILE_NOT_FOUND", "File does not exist.", { path: normalized });
  }

  const realCandidate = realpathSync(candidate);
  ensureInsideRoot(realRoot, realCandidate);
  if (!statSync(realCandidate).isFile()) {
    throw new ProjectMemoryError("PATH_DENIED", "Path is not a regular file.", {
      path: normalized,
    });
  }
  return { absolutePath: realCandidate, relativePath: normalized };
}

function isBinary(data: Buffer): boolean {
  const sample = data.subarray(0, Math.min(data.length, 8192));
  return sample.includes(0);
}

export function readProjectFile(
  rootPath: string,
  relativePath: string,
  commit: string | null,
  customPatterns: string[] = [],
): ReadFileResult {
  const resolved = resolveReadableFile(rootPath, relativePath, customPatterns);
  const size = statSync(resolved.absolutePath).size;
  if (size > MAX_FILE_BYTES) {
    throw new ProjectMemoryError("FILE_TOO_LARGE", "File exceeds the 1 MiB read limit.", {
      path: resolved.relativePath,
      size,
      limit: MAX_FILE_BYTES,
    });
  }
  const buffer = readFileSync(resolved.absolutePath);
  if (isBinary(buffer)) {
    throw new ProjectMemoryError("BINARY_FILE", "Binary files cannot be read.", {
      path: resolved.relativePath,
    });
  }

  return {
    path: resolved.relativePath,
    content: buffer.toString("utf8"),
    truncated: false,
    size,
    commit,
    fileHash: sha256(buffer),
  };
}

function walkNonGitFiles(rootPath: string): string[] {
  const matcher = createIgnore();
  const gitignore = path.join(rootPath, ".gitignore");
  if (existsSync(gitignore)) {
    matcher.add(readFileSync(gitignore, "utf8"));
  }

  const output: string[] = [];
  const queue = [""];
  while (queue.length > 0 && output.length < MAX_SEARCH_FILES) {
    const relativeDir = queue.shift() ?? "";
    const absoluteDir = path.join(rootPath, relativeDir);
    for (const entry of readdirSync(absoluteDir, { withFileTypes: true })) {
      const relative = path.posix.join(relativeDir.replaceAll("\\", "/"), entry.name);
      if (matcher.ignores(relative) || isDeniedPath(relative)) {
        continue;
      }
      if (entry.isSymbolicLink()) {
        continue;
      }
      if (entry.isDirectory()) {
        queue.push(relative);
      } else if (entry.isFile()) {
        output.push(relative);
      }
      if (output.length >= MAX_SEARCH_FILES) {
        break;
      }
    }
  }
  return output;
}

export function listSearchableFiles(rootPath: string, customPatterns: string[] = []): string[] {
  const gitFiles = listGitFiles(rootPath);
  const files = gitFiles ?? walkNonGitFiles(rootPath);
  return files
    .filter((relativePath) => !isDeniedPath(relativePath, customPatterns))
    .slice(0, MAX_SEARCH_FILES);
}

function excerpt(line: string, matchIndex: number, queryLength: number): string {
  const half = Math.floor((MAX_EXCERPT_CHARS - queryLength) / 2);
  const start = Math.max(0, matchIndex - half);
  const end = Math.min(line.length, matchIndex + queryLength + half);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < line.length ? "..." : "";
  return `${prefix}${line.slice(start, end)}${suffix}`;
}

export function searchProjectFiles(
  rootPath: string,
  query: string,
  commit: string | null,
  customPatterns: string[] = [],
): FileSearchResult[] {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) {
    throw new ProjectMemoryError("INVALID_INPUT", "Search query cannot be empty.");
  }

  const results: FileSearchResult[] = [];
  for (const relativePath of listSearchableFiles(rootPath, customPatterns)) {
    if (results.length >= MAX_SEARCH_RESULTS) {
      break;
    }
    let resolved: { absolutePath: string; relativePath: string };
    try {
      resolved = resolveReadableFile(rootPath, relativePath, customPatterns);
    } catch {
      continue;
    }
    const stats = lstatSync(resolved.absolutePath);
    if (stats.size > MAX_FILE_BYTES) {
      continue;
    }
    const buffer = readFileSync(resolved.absolutePath);
    if (isBinary(buffer)) {
      continue;
    }
    const text = buffer.toString("utf8");
    const lines = text.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index] ?? "";
      const matchIndex = line.toLocaleLowerCase().indexOf(needle);
      if (matchIndex === -1) {
        continue;
      }
      results.push({
        path: resolved.relativePath,
        line: index + 1,
        excerpt: excerpt(line, matchIndex, needle.length),
        commit,
        fileHash: sha256(buffer),
      });
      if (results.length >= MAX_SEARCH_RESULTS) {
        break;
      }
    }
  }
  return results;
}
