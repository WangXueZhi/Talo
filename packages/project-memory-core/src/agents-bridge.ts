import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { ProjectMemoryError } from "./errors.js";
import { sha256 } from "./security.js";
import type { ProjectPolicyRecord } from "./types.js";

export const POLICY_START = "<!-- TALO_MANAGED_POLICY_START -->";
export const POLICY_END = "<!-- TALO_MANAGED_POLICY_END -->";

export interface AgentsFileInfo {
  path: string;
  exists: boolean;
  scope: "project-root" | "ancestor" | "nested";
  ownership: "preexisting" | "talo_created" | "user_claimed" | "unknown";
  wholeFileHash: string | null;
  managedBlockHash: string | null;
  managedBlock: string | null;
}

export interface AgentsDiscovery {
  projectRoot: string;
  target: AgentsFileInfo;
  affected: AgentsFileInfo[];
  potentialConflicts: string[];
}

function hashFile(filePath: string): string {
  return sha256(readFileSync(filePath));
}

function parseManagedBlock(content: string): { start: number; end: number; block: string } | null {
  const positions = (marker: string): number[] => {
    const found: number[] = [];
    let offset = 0;
    while (true) {
      const index = content.indexOf(marker, offset);
      if (index < 0) return found;
      found.push(index);
      offset = index + marker.length;
    }
  };
  const starts = positions(POLICY_START);
  const ends = positions(POLICY_END);
  if (starts.length === 0 && ends.length === 0) return null;
  const start = starts[0];
  const endMarker = ends[0];
  if (
    starts.length !== 1 ||
    ends.length !== 1 ||
    start === undefined ||
    endMarker === undefined ||
    start > endMarker
  ) {
    throw new ProjectMemoryError(
      "AGENTS_MARKERS_INVALID",
      "Talo Policy markers are incomplete, repeated, or nested.",
    );
  }
  const end = endMarker + POLICY_END.length;
  return { start, end, block: content.slice(start, end) };
}

function fileInfo(
  filePath: string,
  root: string,
  ownership: AgentsFileInfo["ownership"],
): AgentsFileInfo {
  const exists = existsSync(filePath);
  const scope =
    path.resolve(filePath) === path.join(path.resolve(root), "AGENTS.md")
      ? "project-root"
      : "ancestor";
  if (!exists)
    return {
      path: filePath,
      exists: false,
      scope,
      ownership,
      wholeFileHash: null,
      managedBlockHash: null,
      managedBlock: null,
    };
  if (!lstatSync(filePath).isFile())
    throw new ProjectMemoryError("AGENTS_NOT_WRITABLE", "AGENTS.md must be a regular file.", {
      path: filePath,
    });
  const content = readFileSync(filePath, "utf8");
  const block = parseManagedBlock(content);
  return {
    path: filePath,
    exists: true,
    scope,
    ownership,
    wholeFileHash: hashFile(filePath),
    managedBlockHash: block ? sha256(block.block) : null,
    managedBlock: block?.block ?? null,
  };
}

export function discoverAgents(
  projectRoot: string,
  currentPath = projectRoot,
  ownership: AgentsFileInfo["ownership"] = "unknown",
): AgentsDiscovery {
  const root = path.resolve(projectRoot);
  const targetPath = path.join(root, "AGENTS.md");
  const affected: AgentsFileInfo[] = [];
  let cursor = path.resolve(currentPath);
  while (true) {
    const candidate = path.join(cursor, "AGENTS.md");
    if (existsSync(candidate) && path.resolve(candidate) !== path.resolve(targetPath)) {
      const info = fileInfo(candidate, root, "unknown");
      info.scope =
        cursor === root
          ? "project-root"
          : path.relative(root, cursor).startsWith("..")
            ? "ancestor"
            : "nested";
      affected.push(info);
    }
    const parent = path.dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
    if (path.relative(root, cursor).startsWith("..")) {
      const candidateAbove = path.join(cursor, "AGENTS.md");
      if (existsSync(candidateAbove)) affected.push(fileInfo(candidateAbove, root, "unknown"));
      break;
    }
  }
  const target = fileInfo(targetPath, root, ownership);
  const potentialConflicts =
    affected.length > 0 ? affected.map((info) => `AGENTS.md may also apply: ${info.path}`) : [];
  return { projectRoot: root, target, affected, potentialConflicts };
}

export function renderPolicyBlock(policy: ProjectPolicyRecord): string {
  const lines = [
    POLICY_START,
    "由 Talo 管理。请勿手工修改本区块。",
    `Project: ${policy.projectId}`,
    `Policy: ${policy.policyId}`,
    `Policy version: ${policy.version}`,
    `Synced at: ${policy.bridge.lastSyncedAt ?? new Date().toISOString()}`,
    `Source fingerprint: ${policy.sourceFingerprint}`,
    "",
    "## Required actions",
    ...policy.rules.flatMap((rule) => rule.requiredActions.map((item) => `- ${item}`)),
    "",
    "## Forbidden actions",
    ...policy.rules.flatMap((rule) => rule.forbiddenActions.map((item) => `- ${item}`)),
    "",
    "## Trigger topics",
    ...policy.rules.flatMap((rule) => rule.triggerTopics.map((item) => `- ${item}`)),
    POLICY_END,
  ];
  return lines.join("\n");
}

function replaceBlock(content: string, block: string): string {
  const newline = content.includes("\r\n") ? "\r\n" : "\n";
  const normalized = block.replaceAll("\n", newline);
  const located = parseManagedBlock(content);
  if (located)
    return `${content.slice(0, located.start)}${normalized}${content.slice(located.end)}`;
  const prefix = content.trimEnd();
  return prefix
    ? `${prefix}${newline}${newline}${normalized}${newline}`
    : `${normalized}${newline}`;
}

function writeAtomic(filePath: string, content: string, mode: number): void {
  mkdirSync(path.dirname(filePath), { recursive: true });
  const temporary = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    writeFileSync(temporary, content, { encoding: "utf8", mode });
    if (process.platform !== "win32") chmodSync(temporary, mode);
    renameSync(temporary, filePath);
    if (process.platform !== "win32") chmodSync(filePath, mode);
  } finally {
    rmSync(temporary, { force: true });
  }
}

function withAgentsLock<T>(projectRoot: string, action: () => T): T {
  const lockPath = `${path.join(path.resolve(projectRoot), "AGENTS.md")}.talo.lock`;
  try {
    mkdirSync(lockPath, { mode: 0o700 });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    try {
      if (Date.now() - statSync(lockPath).mtimeMs > 5 * 60 * 1000) {
        rmSync(lockPath, { recursive: true, force: true });
        mkdirSync(lockPath, { mode: 0o700 });
      } else {
        throw new ProjectMemoryError(
          "PROJECT_LOCKED",
          "Another Talo process is synchronizing AGENTS.md.",
          { lockPath },
        );
      }
    } catch (lockError) {
      if (lockError instanceof ProjectMemoryError) throw lockError;
      throw new ProjectMemoryError(
        "PROJECT_LOCKED",
        "Another Talo process is synchronizing AGENTS.md.",
        { lockPath },
      );
    }
  }
  try {
    return action();
  } finally {
    rmSync(lockPath, { recursive: true, force: true });
  }
}

export interface SyncResult {
  path: string;
  changed: boolean;
  wholeFileHash: string;
  managedBlockHash: string;
  ownership: AgentsFileInfo["ownership"];
  potentialConflicts: string[];
}

export function syncAgentsPolicy(
  projectRoot: string,
  policy: ProjectPolicyRecord,
  ownership: AgentsFileInfo["ownership"],
  expectedWholeFileHash?: string | null,
): SyncResult {
  return withAgentsLock(projectRoot, () => {
    const targetPath = path.join(path.resolve(projectRoot), "AGENTS.md");
    if (existsSync(targetPath) && lstatSync(targetPath).isSymbolicLink()) {
      throw new ProjectMemoryError(
        "AGENTS_NOT_WRITABLE",
        "Talo will not write through an AGENTS.md symlink.",
        { path: targetPath },
      );
    }
    const discovery = discoverAgents(projectRoot, projectRoot, ownership);
    const existedBefore = existsSync(targetPath);
    const previous = existsSync(targetPath) ? readFileSync(targetPath, "utf8") : "";
    const currentHash = existsSync(targetPath) ? hashFile(targetPath) : null;
    if (expectedWholeFileHash && currentHash !== expectedWholeFileHash) {
      throw new ProjectMemoryError("AGENTS_DRIFTED", "AGENTS.md changed before synchronization.", {
        path: targetPath,
        expectedWholeFileHash,
        currentWholeFileHash: currentHash,
      });
    }
    const block = renderPolicyBlock(policy);
    const next = replaceBlock(previous, block);
    const mode = existsSync(targetPath) ? statSync(targetPath).mode & 0o777 : 0o644;
    const changed = next !== previous;
    if (changed) writeAtomic(targetPath, next, mode);
    const wholeFileHash = hashFile(targetPath);
    const managedBlockHash = sha256(block.replaceAll("\n", next.includes("\r\n") ? "\r\n" : "\n"));
    return {
      path: targetPath,
      changed,
      wholeFileHash,
      managedBlockHash,
      ownership: existedBefore ? ownership : "talo_created",
      potentialConflicts: discovery.potentialConflicts,
    };
  });
}

export function removeAgentsPolicy(
  projectRoot: string,
  ownership: AgentsFileInfo["ownership"],
  expectedWholeFileHash?: string | null,
): { removedBlock: boolean; deletedFile: boolean } {
  return withAgentsLock(projectRoot, () => {
    const targetPath = path.join(path.resolve(projectRoot), "AGENTS.md");
    if (!existsSync(targetPath)) return { removedBlock: false, deletedFile: false };
    if (lstatSync(targetPath).isSymbolicLink())
      throw new ProjectMemoryError(
        "AGENTS_NOT_WRITABLE",
        "Talo will not remove an AGENTS.md symlink.",
        { path: targetPath },
      );
    const currentHash = hashFile(targetPath);
    if (expectedWholeFileHash && currentHash !== expectedWholeFileHash)
      throw new ProjectMemoryError(
        "AGENTS_DRIFTED",
        "AGENTS.md changed before disabling the bridge.",
        { path: targetPath },
      );
    const content = readFileSync(targetPath, "utf8");
    const located = parseManagedBlock(content);
    if (!located) return { removedBlock: false, deletedFile: false };
    const before = content.slice(0, located.start);
    const after = content.slice(located.end);
    const newline = content.includes("\r\n") ? "\r\n" : "\n";
    const next = `${before.trimEnd()}${before.trim() && after.trim() ? newline : ""}${after.trimStart()}`;
    if (ownership === "talo_created" && !next.trim()) {
      rmSync(targetPath);
      return { removedBlock: true, deletedFile: true };
    }
    writeAtomic(targetPath, next ? `${next}${newline}` : "", statSync(targetPath).mode & 0o777);
    return { removedBlock: true, deletedFile: false };
  });
}
