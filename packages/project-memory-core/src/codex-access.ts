import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { ProjectMemoryError } from "./errors.js";

export type CodexMemoryAccessState = "configured" | "missing" | "conflict";

export interface CodexMemoryAccessStatus {
  state: CodexMemoryAccessState;
  configPath: string;
  dataRoot: string;
  launcherPath: string;
  rulesPath: string;
  issue: string | null;
}

export interface CodexMemoryAccessResult extends CodexMemoryAccessStatus {
  changed: boolean;
  backupPath: string | null;
  restartRequired: boolean;
}

export interface CodexMemoryAccessOptions {
  homeDir?: string;
  env?: NodeJS.ProcessEnv;
  dataRoot: string;
  cliPath?: string;
  nodePath?: string;
}

const ESCALATED_MEMORY_COMMANDS = [
  "detect",
  "recall",
  "get",
  "load",
  "search",
  "brief",
  "story",
  "guide",
  "relations",
  "path",
  "graph",
  "hub",
  "proposals",
  "propose",
  "commit",
  "reject",
  "home",
] as const;

interface WritableRootsAssignment {
  arrayStart: number;
  arrayEnd: number;
  values: string[];
  indent: string;
  newline: string;
}

function codexConfigPath(options: CodexMemoryAccessOptions): string {
  const env = { ...process.env, ...options.env };
  const codexHome = env.CODEX_HOME
    ? path.resolve(env.CODEX_HOME)
    : path.join(options.homeDir ?? homedir(), ".codex");
  return path.join(codexHome, "config.toml");
}

function managedAccessPaths(options: CodexMemoryAccessOptions): {
  launcherPath: string;
  rulesPath: string;
} {
  const dataRoot = path.resolve(options.dataRoot);
  const codexHome = path.dirname(codexConfigPath(options));
  return {
    launcherPath: path.join(path.dirname(dataRoot), "bin", "project-memory"),
    rulesPath: path.join(codexHome, "rules", "project-memory.rules"),
  };
}

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'"'"'`)}'`;
}

function launcherContent(options: CodexMemoryAccessOptions): string {
  const nodePath = path.resolve(options.nodePath ?? process.execPath);
  const cliPath = path.resolve(options.cliPath ?? process.argv[1] ?? "project-memory.mjs");
  const appNode = "/Applications/Talo.app/Contents/MacOS/project-memory-node";
  const appCli = "/Applications/Talo.app/Contents/Resources/resources/runtime/project-memory.mjs";
  const legacyAppNode = "/Applications/Project Memory.app/Contents/MacOS/project-memory-node";
  const legacyAppCli =
    "/Applications/Project Memory.app/Contents/Resources/resources/runtime/project-memory.mjs";
  return `#!/bin/sh
set -eu
if [ -x ${shellQuote(appNode)} ] && [ -f ${shellQuote(appCli)} ]; then
  exec ${shellQuote(appNode)} ${shellQuote(appCli)} "$@"
fi
if [ -x ${shellQuote(legacyAppNode)} ] && [ -f ${shellQuote(legacyAppCli)} ]; then
  exec ${shellQuote(legacyAppNode)} ${shellQuote(legacyAppCli)} "$@"
fi
exec ${shellQuote(nodePath)} ${shellQuote(cliPath)} "$@"
`;
}

function rulesContent(launcherPath: string): string {
  const rules = ESCALATED_MEMORY_COMMANDS.map(
    (command) =>
      `prefix_rule(pattern=[${JSON.stringify(launcherPath)}, ${JSON.stringify(command)}], decision="allow")`,
  );
  return `# Managed by Talo. Destructive and integration commands remain approval-gated.\n${rules.join("\n")}\n`;
}

function writeManagedFile(filePath: string, content: string, mode: number): boolean {
  if (existsSync(filePath) && readFileSync(filePath, "utf8") === content) return false;
  mkdirSync(path.dirname(filePath), { recursive: true, mode: 0o700 });
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, content, { encoding: "utf8", mode });
  if (process.platform !== "win32") chmodSync(temporaryPath, mode);
  renameSync(temporaryPath, filePath);
  if (process.platform !== "win32") chmodSync(filePath, mode);
  return true;
}

function managedFallbackConfigured(options: CodexMemoryAccessOptions): boolean {
  const { launcherPath, rulesPath } = managedAccessPaths(options);
  return (
    existsSync(launcherPath) &&
    readFileSync(launcherPath, "utf8") === launcherContent(options) &&
    existsSync(rulesPath) &&
    readFileSync(rulesPath, "utf8") === rulesContent(launcherPath)
  );
}

function ensureManagedFallback(options: CodexMemoryAccessOptions): boolean {
  const { launcherPath, rulesPath } = managedAccessPaths(options);
  const launcherChanged = writeManagedFile(launcherPath, launcherContent(options), 0o700);
  const rulesChanged = writeManagedFile(rulesPath, rulesContent(launcherPath), 0o600);
  return launcherChanged || rulesChanged;
}

function skipSpaceAndComments(source: string, start: number): number {
  let index = start;
  while (index < source.length) {
    if (/\s/.test(source[index] ?? "")) {
      index += 1;
      continue;
    }
    if (source[index] === "#") {
      while (index < source.length && source[index] !== "\n") index += 1;
      continue;
    }
    break;
  }
  return index;
}

function parseBasicString(source: string, start: number): { value: string; end: number } | null {
  let index = start + 1;
  let escaped = false;
  while (index < source.length) {
    const character = source[index];
    if (!escaped && character === '"') {
      const raw = source.slice(start, index + 1);
      try {
        return { value: JSON.parse(raw) as string, end: index + 1 };
      } catch {
        return null;
      }
    }
    if (!escaped && character === "\\") escaped = true;
    else escaped = false;
    index += 1;
  }
  return null;
}

function parseLiteralString(source: string, start: number): { value: string; end: number } | null {
  const end = source.indexOf("'", start + 1);
  if (end === -1) return null;
  return { value: source.slice(start + 1, end), end: end + 1 };
}

function parseStringArray(
  source: string,
  arrayStart: number,
): { values: string[]; arrayEnd: number } | null {
  const values: string[] = [];
  let index = arrayStart + 1;
  while (index < source.length) {
    index = skipSpaceAndComments(source, index);
    if (source[index] === "]") return { values, arrayEnd: index + 1 };
    const parsed =
      source[index] === '"'
        ? parseBasicString(source, index)
        : source[index] === "'"
          ? parseLiteralString(source, index)
          : null;
    if (!parsed) return null;
    values.push(parsed.value);
    index = skipSpaceAndComments(source, parsed.end);
    if (source[index] === ",") {
      index += 1;
      continue;
    }
    if (source[index] === "]") return { values, arrayEnd: index + 1 };
    return null;
  }
  return null;
}

function assignmentFromMatch(
  source: string,
  match: RegExpExecArray,
): WritableRootsAssignment | null {
  const equals = source.indexOf("=", match.index);
  const arrayStart = skipSpaceAndComments(source, equals + 1);
  if (source[arrayStart] !== "[") return null;
  const parsed = parseStringArray(source, arrayStart);
  if (!parsed) return null;
  return {
    arrayStart,
    arrayEnd: parsed.arrayEnd,
    values: parsed.values,
    indent: match[1] ?? "",
    newline: source.includes("\r\n") ? "\r\n" : "\n",
  };
}

function findWritableRootsAssignment(source: string): WritableRootsAssignment | null | "conflict" {
  const dotted = /^([ \t]*)sandbox_workspace_write\.writable_roots[ \t]*=/gm.exec(source);
  if (dotted) return assignmentFromMatch(source, dotted) ?? "conflict";

  const table = /^[ \t]*\[sandbox_workspace_write\][ \t]*(?:#.*)?$/gm.exec(source);
  if (!table) return null;
  const sectionStart = table.index + table[0].length;
  const nextTable = /^[ \t]*\[\[?[^\r\n]+$/gm;
  nextTable.lastIndex = sectionStart;
  const next = nextTable.exec(source);
  const sectionEnd = next?.index ?? source.length;
  const section = source.slice(sectionStart, sectionEnd);
  const key = /^([ \t]*)writable_roots[ \t]*=/gm.exec(section);
  if (!key) return null;
  key.index += sectionStart;
  return assignmentFromMatch(source, key) ?? "conflict";
}

function renderArray(values: string[], assignment: WritableRootsAssignment): string {
  if (!assignment.values.length || !assignment.values.some((value) => value.includes("\n"))) {
    const multiline = assignment.arrayEnd - assignment.arrayStart > 88 || values.length > 2;
    if (!multiline) return `[${values.map((value) => JSON.stringify(value)).join(", ")}]`;
  }
  const itemIndent = `${assignment.indent}  `;
  return `[${assignment.newline}${values
    .map((value) => `${itemIndent}${JSON.stringify(value)},`)
    .join(assignment.newline)}${assignment.newline}${assignment.indent}]`;
}

function addWritableRoot(source: string, dataRoot: string): string {
  const assignment = findWritableRootsAssignment(source);
  if (assignment === "conflict") {
    throw new ProjectMemoryError(
      "INTEGRATION_CONFLICT",
      "Codex writable_roots uses an unsupported TOML value.",
      { dataRoot },
    );
  }
  if (assignment) {
    if (assignment.values.some((value) => path.resolve(value) === dataRoot)) return source;
    const replacement = renderArray([...assignment.values, dataRoot], assignment);
    return `${source.slice(0, assignment.arrayStart)}${replacement}${source.slice(assignment.arrayEnd)}`;
  }

  const newline = source.includes("\r\n") ? "\r\n" : "\n";
  const table = /^[ \t]*\[sandbox_workspace_write\][ \t]*(?:#.*)?$/gm.exec(source);
  if (table) {
    const headerEnd = table.index + table[0].length;
    const insertionPoint = source.startsWith(newline, headerEnd)
      ? headerEnd + newline.length
      : headerEnd;
    const prefix = insertionPoint === headerEnd ? newline : "";
    return `${source.slice(0, insertionPoint)}${prefix}writable_roots = [${JSON.stringify(dataRoot)}]${newline}${source.slice(insertionPoint)}`;
  }
  const suffix = source.length === 0 || source.endsWith(newline) ? "" : newline;
  const separator = source.trim().length === 0 ? "" : newline;
  return `${source}${suffix}${separator}[sandbox_workspace_write]${newline}writable_roots = [${JSON.stringify(dataRoot)}]${newline}`;
}

export function inspectCodexMemoryAccess(
  options: CodexMemoryAccessOptions,
): CodexMemoryAccessStatus {
  const configPath = codexConfigPath(options);
  const dataRoot = path.resolve(options.dataRoot);
  const { launcherPath, rulesPath } = managedAccessPaths(options);
  if (!existsSync(configPath)) {
    return { state: "missing", configPath, dataRoot, launcherPath, rulesPath, issue: null };
  }
  const source = readFileSync(configPath, "utf8");
  const assignment = findWritableRootsAssignment(source);
  if (assignment === "conflict") {
    return {
      state: "conflict",
      configPath,
      dataRoot,
      launcherPath,
      rulesPath,
      issue: "Codex writable_roots 不是可安全更新的字符串数组。",
    };
  }
  if (assignment?.values.some((value) => path.resolve(value) === dataRoot)) {
    if (managedFallbackConfigured(options)) {
      return { state: "configured", configPath, dataRoot, launcherPath, rulesPath, issue: null };
    }
    return {
      state: "missing",
      configPath,
      dataRoot,
      launcherPath,
      rulesPath,
      issue: "Codex 托管权限模式的 Talo 升级执行兜底尚未安装。",
    };
  }
  return { state: "missing", configPath, dataRoot, launcherPath, rulesPath, issue: null };
}

export function ensureCodexMemoryAccess(
  options: CodexMemoryAccessOptions,
): CodexMemoryAccessResult {
  const inspected = inspectCodexMemoryAccess(options);
  if (inspected.state === "configured") {
    return { ...inspected, changed: false, backupPath: null, restartRequired: false };
  }
  if (inspected.state === "conflict") {
    throw new ProjectMemoryError(
      "INTEGRATION_CONFLICT",
      inspected.issue ?? "Codex sandbox configuration cannot be updated safely.",
      { configPath: inspected.configPath, dataRoot: inspected.dataRoot },
    );
  }

  const source = existsSync(inspected.configPath) ? readFileSync(inspected.configPath, "utf8") : "";
  const updated = addWritableRoot(source, inspected.dataRoot);
  const configChanged = updated !== source;
  let backupPath: string | null = null;
  if (configChanged) {
    const directory = path.dirname(inspected.configPath);
    mkdirSync(directory, { recursive: true, mode: 0o700 });
    backupPath = `${inspected.configPath}.project-memory-backup`;
    if (source && !existsSync(backupPath)) {
      copyFileSync(inspected.configPath, backupPath);
      if (process.platform !== "win32") chmodSync(backupPath, 0o600);
    }
    const temporaryPath = `${inspected.configPath}.${process.pid}.tmp`;
    const existingMode = existsSync(inspected.configPath)
      ? statSync(inspected.configPath).mode & 0o777
      : 0o600;
    writeFileSync(temporaryPath, updated, { encoding: "utf8", mode: existingMode });
    if (process.platform !== "win32") chmodSync(temporaryPath, existingMode);
    renameSync(temporaryPath, inspected.configPath);
  }
  const fallbackChanged = ensureManagedFallback(options);
  return {
    state: "configured",
    configPath: inspected.configPath,
    dataRoot: inspected.dataRoot,
    launcherPath: inspected.launcherPath,
    rulesPath: inspected.rulesPath,
    issue: null,
    changed: configChanged || fallbackChanged,
    backupPath: source ? backupPath : null,
    restartRequired: configChanged || fallbackChanged,
  };
}
