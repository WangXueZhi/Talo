import {
  chmodSync,
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { ProjectMemoryError } from "./errors.js";
import { resolveConfigRoot } from "./paths.js";
import { sha256 } from "./security.js";

const INTEGRATION_VERSION = "0.14.1";
const INTEGRATION_SCHEMA_VERSION = 1;
const RULE_START = "<!-- project-memory:start -->";
const RULE_END = "<!-- project-memory:end -->";

const ANTIGRAVITY_RULE = `${RULE_START}
Before substantial work in a local workspace, use the global Talo Skill to detect the current project. If the project is registered, recall only task-relevant reviewed memories and deep-read only the recommended memory IDs. If the project is not registered and the user did not explicitly ask about Talo, continue silently without registering or relinking it. Propose durable updates with actor.platform set to antigravity and resolve them through the shared review workflow. Never parse or edit Talo storage files directly.
${RULE_END}`;

interface IntegrationManifest {
  schemaVersion: number;
  platform: "antigravity";
  version: string;
  installedAt: string;
  updatedAt: string;
  skillPath: string;
  rulePath: string;
  files: Record<string, string>;
  ruleHash: string;
}

export interface AntigravityIntegrationOptions {
  antigravityHome?: string;
  configHome?: string;
  sourceSkillDir?: string;
  sourceCliPath?: string;
  sourceBrowserDir?: string;
  version?: string;
}

export interface IntegrationStatus {
  platform: "antigravity";
  state: "absent" | "installed" | "outdated" | "partial" | "conflict";
  version: string | null;
  currentVersion: string;
  skillPath: string;
  rulePath: string;
  manifestPath: string;
  issues: string[];
}

interface IntegrationPaths {
  antigravityHome: string;
  configHome: string;
  skillPath: string;
  rulePath: string;
  manifestPath: string;
}

interface IntegrationSources {
  skillDir: string;
  cliPath: string;
  browserDir: string;
}

interface ClaudeIntegrationManifest {
  schemaVersion: number;
  platform: "claude";
  version: string;
  installedAt: string;
  updatedAt: string;
  skillPath: string;
  files: Record<string, string>;
}

export interface ClaudeIntegrationOptions {
  claudeHome?: string;
  configHome?: string;
  sourceSkillDir?: string;
  sourceCliPath?: string;
  sourceBrowserDir?: string;
  version?: string;
}

export interface ClaudeIntegrationStatus {
  platform: "claude";
  state: "absent" | "installed" | "outdated" | "partial" | "conflict";
  version: string | null;
  currentVersion: string;
  skillPath: string;
  manifestPath: string;
  issues: string[];
}

function integrationPaths(options: AntigravityIntegrationOptions = {}): IntegrationPaths {
  const antigravityHome = path.resolve(
    options.antigravityHome ??
      process.env.PROJECT_MEMORY_ANTIGRAVITY_HOME ??
      path.join(homedir(), ".gemini"),
  );
  const configHome = path.resolve(options.configHome ?? resolveConfigRoot());
  return {
    antigravityHome,
    configHome,
    skillPath: path.join(antigravityHome, "config", "skills", "project-memory"),
    rulePath: path.join(antigravityHome, "GEMINI.md"),
    manifestPath: path.join(configHome, "integrations", "antigravity.json"),
  };
}

function firstExisting(candidates: Array<string | undefined>, label: string): string {
  const match = candidates
    .filter((candidate): candidate is string => Boolean(candidate))
    .find(existsSync);
  if (!match) {
    throw new ProjectMemoryError("STORAGE_ERROR", `${label} is not available for installation.`, {
      candidates: candidates.filter(Boolean),
    });
  }
  return realpathSync(match);
}

function integrationSources(options: AntigravityIntegrationOptions = {}): IntegrationSources {
  const cliPath = firstExisting(
    [options.sourceCliPath, process.env.PROJECT_MEMORY_CLI_SOURCE, process.argv[1]],
    "Talo CLI",
  );
  const cliDir = path.dirname(cliPath);
  const skillDir = firstExisting(
    [
      options.sourceSkillDir,
      process.env.PROJECT_MEMORY_SKILL_SOURCE,
      path.resolve(cliDir, "skills/project-memory"),
      path.resolve(cliDir, "../skills/project-memory"),
      path.resolve(cliDir, "../project-memory"),
      path.resolve(cliDir, "../../../skills/project-memory"),
    ],
    "Talo Skill source",
  );
  const browserDir = firstExisting(
    [
      options.sourceBrowserDir,
      process.env.PROJECT_MEMORY_BROWSER_SOURCE,
      path.resolve(cliDir, "browser"),
      path.resolve(cliDir, "../dist/browser"),
      path.resolve(cliDir, "../../../packages/project-memory-core/dist/browser"),
    ],
    "Talo browser assets",
  );
  return { skillDir, cliPath, browserDir };
}

function claudeIntegrationPaths(options: ClaudeIntegrationOptions = {}): {
  skillPath: string;
  manifestPath: string;
} {
  const claudeHome = path.resolve(
    options.claudeHome ?? process.env.CLAUDE_HOME ?? path.join(homedir(), ".claude"),
  );
  const configHome = path.resolve(options.configHome ?? resolveConfigRoot());
  return {
    skillPath: path.join(claudeHome, "skills", "project-memory"),
    manifestPath: path.join(configHome, "integrations", "claude.json"),
  };
}

function claudeIntegrationSources(options: ClaudeIntegrationOptions = {}): IntegrationSources {
  return integrationSources(options);
}

function writeAtomic(filePath: string, content: string, mode = 0o600): void {
  mkdirSync(path.dirname(filePath), { recursive: true, mode: 0o700 });
  const temporary = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(temporary, content, { encoding: "utf8", mode });
  if (process.platform !== "win32") chmodSync(temporary, mode);
  renameSync(temporary, filePath);
  if (process.platform !== "win32") chmodSync(filePath, mode);
}

function readManifest(manifestPath: string): IntegrationManifest | null {
  if (!existsSync(manifestPath)) return null;
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as IntegrationManifest;
    if (
      manifest.schemaVersion !== INTEGRATION_SCHEMA_VERSION ||
      manifest.platform !== "antigravity" ||
      typeof manifest.version !== "string" ||
      typeof manifest.skillPath !== "string" ||
      typeof manifest.rulePath !== "string" ||
      !manifest.files ||
      typeof manifest.files !== "object" ||
      typeof manifest.ruleHash !== "string"
    ) {
      throw new Error("invalid manifest shape");
    }
    return manifest;
  } catch (error) {
    throw new ProjectMemoryError(
      "INTEGRATION_CONFLICT",
      "Antigravity integration manifest is invalid.",
      {
        path: manifestPath,
        cause: error instanceof Error ? error.message : String(error),
      },
    );
  }
}

function readClaudeManifest(manifestPath: string): ClaudeIntegrationManifest | null {
  if (!existsSync(manifestPath)) return null;
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as ClaudeIntegrationManifest;
    if (
      manifest.schemaVersion !== INTEGRATION_SCHEMA_VERSION ||
      manifest.platform !== "claude" ||
      !manifest.version ||
      !manifest.skillPath ||
      !manifest.files
    ) {
      return null;
    }
    return manifest;
  } catch {
    return null;
  }
}

function locateManagedBlock(content: string): { start: number; end: number; block: string } | null {
  const start = content.indexOf(RULE_START);
  const endMarker = content.indexOf(RULE_END);
  if (start === -1 && endMarker === -1) return null;
  if (start === -1 || endMarker === -1 || endMarker < start) {
    throw new ProjectMemoryError("INTEGRATION_CONFLICT", "Talo rule markers are incomplete.");
  }
  const end = endMarker + RULE_END.length;
  if (
    content.indexOf(RULE_START, start + RULE_START.length) !== -1 ||
    content.indexOf(RULE_END, end) !== -1
  ) {
    throw new ProjectMemoryError("INTEGRATION_CONFLICT", "Multiple Talo rule blocks were found.");
  }
  return { start, end, block: content.slice(start, end) };
}

function upsertManagedBlock(content: string): string {
  const located = locateManagedBlock(content);
  if (located) {
    return `${content.slice(0, located.start)}${ANTIGRAVITY_RULE}${content.slice(located.end)}`;
  }
  const prefix = content.trimEnd();
  return prefix ? `${prefix}\n\n${ANTIGRAVITY_RULE}\n` : `${ANTIGRAVITY_RULE}\n`;
}

function removeManagedBlock(content: string): string {
  const located = locateManagedBlock(content);
  if (!located) return content;
  const before = content.slice(0, located.start);
  const after = content.slice(located.end);
  if (!before.trim() && !after.trim()) return "";
  if (!after.trim()) return `${before.trimEnd()}\n`;
  if (!before.trim()) return after.trimStart();
  return `${before.trimEnd()}\n${after.trimStart()}`;
}

function walkFiles(root: string, current = ""): string[] {
  const directory = path.join(root, current);
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const relative = path.join(current, entry.name);
    const absolute = path.join(root, relative);
    if (entry.isSymbolicLink()) {
      throw new ProjectMemoryError(
        "INTEGRATION_CONFLICT",
        "Managed Skill files cannot be symbolic links.",
        {
          path: absolute,
        },
      );
    }
    if (entry.isDirectory()) files.push(...walkFiles(root, relative));
    else if (entry.isFile()) files.push(relative);
  }
  return files.sort();
}

function hashFiles(root: string): Record<string, string> {
  return Object.fromEntries(
    walkFiles(root).map((relative) => [
      relative.replaceAll("\\", "/"),
      sha256(readFileSync(path.join(root, relative))),
    ]),
  );
}

function compareManagedFiles(skillPath: string, files: Record<string, string>): string[] {
  const issues: string[] = [];
  if (!existsSync(skillPath)) return ["managed Skill directory is missing"];
  for (const [relative, expectedHash] of Object.entries(files)) {
    const target = path.join(skillPath, relative);
    if (!existsSync(target)) issues.push(`managed file is missing: ${relative}`);
    else if (lstatSync(target).isSymbolicLink())
      issues.push(`managed file became a symbolic link: ${relative}`);
    else if (!lstatSync(target).isFile()) issues.push(`managed path is not a file: ${relative}`);
    else if (sha256(readFileSync(target)) !== expectedHash)
      issues.push(`managed file changed: ${relative}`);
  }
  if (issues.length === 0) {
    const actualFiles = Object.keys(hashFiles(skillPath));
    const unexpected = actualFiles.filter((relative) => !(relative in files));
    for (const relative of unexpected)
      issues.push(`unmanaged file exists in Skill directory: ${relative}`);
  }
  return issues;
}

function inspectRule(rulePath: string, expectedHash?: string): string[] {
  if (!existsSync(rulePath)) return ["managed Antigravity rule is missing"];
  const located = locateManagedBlock(readFileSync(rulePath, "utf8"));
  if (!located) return ["managed Antigravity rule is missing"];
  if (expectedHash && sha256(located.block) !== expectedHash) {
    return ["managed Antigravity rule changed"];
  }
  return [];
}

function prepareSkill(target: string, sources: IntegrationSources): Record<string, string> {
  cpSync(sources.skillDir, target, { recursive: true, errorOnExist: true });
  const binDir = path.join(target, "bin");
  rmSync(binDir, { recursive: true, force: true });
  mkdirSync(path.join(binDir, "browser"), { recursive: true, mode: 0o700 });
  cpSync(sources.cliPath, path.join(binDir, "project-memory.mjs"));
  cpSync(
    path.join(sources.browserDir, "graph-app.js"),
    path.join(binDir, "browser", "graph-app.js"),
  );
  cpSync(
    path.join(sources.browserDir, "graph-app.css"),
    path.join(binDir, "browser", "graph-app.css"),
  );
  if (process.platform !== "win32") {
    chmodSync(path.join(target, "scripts", "project-memory.mjs"), 0o755);
    chmodSync(path.join(binDir, "project-memory.mjs"), 0o755);
  }
  return hashFiles(target);
}

export function antigravityIntegrationStatus(
  options: AntigravityIntegrationOptions = {},
): IntegrationStatus {
  const paths = integrationPaths(options);
  const currentVersion = options.version ?? INTEGRATION_VERSION;
  const manifest = readManifest(paths.manifestPath);
  if (!manifest) {
    const issues: string[] = [];
    if (existsSync(paths.skillPath)) issues.push("an unmanaged Talo Skill already exists");
    if (existsSync(paths.rulePath)) {
      const located = locateManagedBlock(readFileSync(paths.rulePath, "utf8"));
      if (located) issues.push("an unmanaged Talo rule block already exists");
    }
    return {
      platform: "antigravity",
      state: issues.length > 0 ? "conflict" : "absent",
      version: null,
      currentVersion,
      skillPath: paths.skillPath,
      rulePath: paths.rulePath,
      manifestPath: paths.manifestPath,
      issues,
    };
  }
  const issues = [
    ...(path.resolve(manifest.skillPath) === paths.skillPath
      ? []
      : ["manifest Skill path does not match"]),
    ...(path.resolve(manifest.rulePath) === paths.rulePath
      ? []
      : ["manifest rule path does not match"]),
    ...compareManagedFiles(paths.skillPath, manifest.files),
    ...inspectRule(paths.rulePath, manifest.ruleHash),
  ];
  return {
    platform: "antigravity",
    state:
      issues.length > 0
        ? issues.some(
            (issue) =>
              issue.includes("changed") ||
              issue.includes("unmanaged") ||
              issue.includes("does not match"),
          )
          ? "conflict"
          : "partial"
        : manifest.version === currentVersion
          ? "installed"
          : "outdated",
    version: manifest.version,
    currentVersion,
    skillPath: paths.skillPath,
    rulePath: paths.rulePath,
    manifestPath: paths.manifestPath,
    issues,
  };
}

export function installAntigravityIntegration(
  options: AntigravityIntegrationOptions = {},
): Record<string, unknown> {
  const paths = integrationPaths(options);
  const sources = integrationSources(options);
  const version = options.version ?? INTEGRATION_VERSION;
  const existingManifest = readManifest(paths.manifestPath);
  const status = antigravityIntegrationStatus(options);
  if (status.state === "conflict" || status.state === "partial") {
    throw new ProjectMemoryError(
      "INTEGRATION_CONFLICT",
      "Antigravity integration cannot be updated safely.",
      {
        ...status,
      },
    );
  }

  mkdirSync(path.dirname(paths.skillPath), { recursive: true, mode: 0o700 });
  const temporarySkill = `${paths.skillPath}.${process.pid}.${Date.now()}.tmp`;
  const backupSkill = `${paths.skillPath}.${process.pid}.${Date.now()}.bak`;
  rmSync(temporarySkill, { recursive: true, force: true });
  let desiredFiles: Record<string, string>;
  try {
    desiredFiles = prepareSkill(temporarySkill, sources);
  } catch (error) {
    rmSync(temporarySkill, { recursive: true, force: true });
    throw error;
  }
  const previousRule = existsSync(paths.rulePath) ? readFileSync(paths.rulePath, "utf8") : null;
  const previousManifest = existsSync(paths.manifestPath)
    ? readFileSync(paths.manifestPath, "utf8")
    : null;
  const nextRule = upsertManagedBlock(previousRule ?? "");
  const desiredRuleHash = sha256(ANTIGRAVITY_RULE);
  if (
    existingManifest &&
    existingManifest.version === version &&
    JSON.stringify(existingManifest.files) === JSON.stringify(desiredFiles) &&
    existingManifest.ruleHash === desiredRuleHash &&
    previousRule === nextRule
  ) {
    rmSync(temporarySkill, { recursive: true, force: true });
    return { ...status, changed: false, action: "unchanged", restartRequired: false };
  }

  const timestamp = new Date().toISOString();
  const manifest: IntegrationManifest = {
    schemaVersion: INTEGRATION_SCHEMA_VERSION,
    platform: "antigravity",
    version,
    installedAt: existingManifest?.installedAt ?? timestamp,
    updatedAt: timestamp,
    skillPath: paths.skillPath,
    rulePath: paths.rulePath,
    files: desiredFiles,
    ruleHash: desiredRuleHash,
  };

  let movedExistingSkill = false;
  try {
    if (existsSync(paths.skillPath)) {
      renameSync(paths.skillPath, backupSkill);
      movedExistingSkill = true;
    }
    renameSync(temporarySkill, paths.skillPath);
    writeAtomic(paths.rulePath, nextRule);
    writeAtomic(paths.manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    rmSync(backupSkill, { recursive: true, force: true });
  } catch (error) {
    rmSync(temporarySkill, { recursive: true, force: true });
    rmSync(paths.skillPath, { recursive: true, force: true });
    if (movedExistingSkill && existsSync(backupSkill)) renameSync(backupSkill, paths.skillPath);
    if (previousRule === null) rmSync(paths.rulePath, { force: true });
    else writeAtomic(paths.rulePath, previousRule);
    if (previousManifest === null) rmSync(paths.manifestPath, { force: true });
    else writeAtomic(paths.manifestPath, previousManifest);
    throw error;
  }

  return {
    ...antigravityIntegrationStatus(options),
    changed: true,
    action: existingManifest ? "updated" : "installed",
    restartRequired: true,
  };
}

export function removeAntigravityIntegration(
  options: AntigravityIntegrationOptions = {},
): Record<string, unknown> {
  const paths = integrationPaths(options);
  const manifest = readManifest(paths.manifestPath);
  if (!manifest) {
    const status = antigravityIntegrationStatus(options);
    if (status.state === "conflict") {
      throw new ProjectMemoryError(
        "INTEGRATION_CONFLICT",
        "Unmanaged Antigravity integration files cannot be removed.",
        {
          ...status,
        },
      );
    }
    return { ...status, changed: false, action: "absent", restartRequired: false };
  }
  const status = antigravityIntegrationStatus(options);
  if (status.state === "conflict" || status.state === "partial") {
    throw new ProjectMemoryError(
      "INTEGRATION_CONFLICT",
      "Antigravity integration was modified and cannot be removed safely.",
      {
        ...status,
      },
    );
  }
  const ruleContent = readFileSync(paths.rulePath, "utf8");
  const manifestContent = readFileSync(paths.manifestPath, "utf8");
  const nextRule = removeManagedBlock(ruleContent);
  const backupSkill = `${paths.skillPath}.${process.pid}.${Date.now()}.bak`;
  renameSync(paths.skillPath, backupSkill);
  try {
    if (nextRule) writeAtomic(paths.rulePath, nextRule);
    else rmSync(paths.rulePath, { force: true });
    rmSync(paths.manifestPath, { force: true });
  } catch (error) {
    writeAtomic(paths.rulePath, ruleContent);
    writeAtomic(paths.manifestPath, manifestContent);
    if (existsSync(backupSkill)) renameSync(backupSkill, paths.skillPath);
    throw error;
  }
  rmSync(backupSkill, { recursive: true, force: true });
  return {
    ...antigravityIntegrationStatus(options),
    changed: true,
    action: "removed",
    restartRequired: true,
  };
}

export function claudeIntegrationStatus(
  options: ClaudeIntegrationOptions = {},
): ClaudeIntegrationStatus {
  const paths = claudeIntegrationPaths(options);
  const currentVersion = options.version ?? INTEGRATION_VERSION;
  const manifest = readClaudeManifest(paths.manifestPath);
  if (!manifest) {
    const issues = existsSync(paths.skillPath) ? ["an unmanaged Talo Skill already exists"] : [];
    return {
      platform: "claude",
      state: issues.length > 0 ? "conflict" : "absent",
      version: null,
      currentVersion,
      skillPath: paths.skillPath,
      manifestPath: paths.manifestPath,
      issues,
    };
  }
  const issues = [
    ...(path.resolve(manifest.skillPath) === paths.skillPath
      ? []
      : ["manifest Skill path does not match"]),
    ...compareManagedFiles(paths.skillPath, manifest.files),
  ];
  return {
    platform: "claude",
    state:
      issues.length > 0
        ? issues.some(
            (issue) =>
              issue.includes("changed") ||
              issue.includes("unmanaged") ||
              issue.includes("does not match"),
          )
          ? "conflict"
          : "partial"
        : manifest.version === currentVersion
          ? "installed"
          : "outdated",
    version: manifest.version,
    currentVersion,
    skillPath: paths.skillPath,
    manifestPath: paths.manifestPath,
    issues,
  };
}

export function installClaudeIntegration(
  options: ClaudeIntegrationOptions = {},
): Record<string, unknown> {
  const paths = claudeIntegrationPaths(options);
  const sources = claudeIntegrationSources(options);
  const version = options.version ?? INTEGRATION_VERSION;
  const existingManifest = readClaudeManifest(paths.manifestPath);
  const status = claudeIntegrationStatus(options);
  if (status.state === "conflict" || status.state === "partial") {
    throw new ProjectMemoryError(
      "INTEGRATION_CONFLICT",
      "Claude Code integration cannot be updated safely.",
      { ...status },
    );
  }

  mkdirSync(path.dirname(paths.skillPath), { recursive: true, mode: 0o700 });
  const temporarySkill = `${paths.skillPath}.${process.pid}.${Date.now()}.tmp`;
  const backupSkill = `${paths.skillPath}.${process.pid}.${Date.now()}.bak`;
  rmSync(temporarySkill, { recursive: true, force: true });
  let desiredFiles: Record<string, string>;
  try {
    desiredFiles = prepareSkill(temporarySkill, sources);
  } catch (error) {
    rmSync(temporarySkill, { recursive: true, force: true });
    throw error;
  }
  if (
    existingManifest &&
    existingManifest.version === version &&
    JSON.stringify(existingManifest.files) === JSON.stringify(desiredFiles)
  ) {
    rmSync(temporarySkill, { recursive: true, force: true });
    return { ...status, changed: false, action: "unchanged", restartRequired: false };
  }

  const timestamp = new Date().toISOString();
  const manifest: ClaudeIntegrationManifest = {
    schemaVersion: INTEGRATION_SCHEMA_VERSION,
    platform: "claude",
    version,
    installedAt: existingManifest?.installedAt ?? timestamp,
    updatedAt: timestamp,
    skillPath: paths.skillPath,
    files: desiredFiles,
  };
  const previousManifest = existsSync(paths.manifestPath)
    ? readFileSync(paths.manifestPath, "utf8")
    : null;
  let movedExistingSkill = false;
  try {
    if (existsSync(paths.skillPath)) {
      renameSync(paths.skillPath, backupSkill);
      movedExistingSkill = true;
    }
    renameSync(temporarySkill, paths.skillPath);
    writeAtomic(paths.manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    rmSync(backupSkill, { recursive: true, force: true });
  } catch (error) {
    rmSync(temporarySkill, { recursive: true, force: true });
    rmSync(paths.skillPath, { recursive: true, force: true });
    if (movedExistingSkill && existsSync(backupSkill)) renameSync(backupSkill, paths.skillPath);
    if (previousManifest === null) rmSync(paths.manifestPath, { force: true });
    else writeAtomic(paths.manifestPath, previousManifest);
    throw error;
  }
  return {
    ...claudeIntegrationStatus(options),
    changed: true,
    action: existingManifest ? "updated" : "installed",
    restartRequired: true,
  };
}

export function removeClaudeIntegration(
  options: ClaudeIntegrationOptions = {},
): Record<string, unknown> {
  const paths = claudeIntegrationPaths(options);
  const manifest = readClaudeManifest(paths.manifestPath);
  if (!manifest) {
    const status = claudeIntegrationStatus(options);
    if (status.state === "conflict") {
      throw new ProjectMemoryError(
        "INTEGRATION_CONFLICT",
        "Unmanaged Claude Code integration files cannot be removed.",
        { ...status },
      );
    }
    return { ...status, changed: false, action: "absent", restartRequired: false };
  }
  const status = claudeIntegrationStatus(options);
  if (status.state === "conflict" || status.state === "partial") {
    throw new ProjectMemoryError(
      "INTEGRATION_CONFLICT",
      "Claude Code integration was modified and cannot be removed safely.",
      { ...status },
    );
  }
  const manifestContent = readFileSync(paths.manifestPath, "utf8");
  const backupSkill = `${paths.skillPath}.${process.pid}.${Date.now()}.bak`;
  renameSync(paths.skillPath, backupSkill);
  try {
    rmSync(paths.manifestPath, { force: true });
  } catch (error) {
    writeAtomic(paths.manifestPath, manifestContent);
    if (existsSync(backupSkill)) renameSync(backupSkill, paths.skillPath);
    throw error;
  }
  rmSync(backupSkill, { recursive: true, force: true });
  return {
    ...claudeIntegrationStatus(options),
    changed: true,
    action: "removed",
    restartRequired: true,
  };
}
