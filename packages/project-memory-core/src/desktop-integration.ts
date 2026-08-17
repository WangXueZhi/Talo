import { spawnSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import {
  type CodexMemoryAccessState,
  ensureCodexMemoryAccess,
  inspectCodexMemoryAccess,
} from "./codex-access.js";
import { ProjectMemoryError } from "./errors.js";
import {
  type AntigravityIntegrationOptions,
  antigravityIntegrationStatus,
  type ClaudeIntegrationOptions,
  claudeIntegrationStatus,
  installAntigravityIntegration,
  installClaudeIntegration,
  removeAntigravityIntegration,
  removeClaudeIntegration,
} from "./integration.js";
import { resolveDataDir } from "./paths.js";

const DESKTOP_MARKETPLACE = "project-memory-desktop";
const PLUGIN_NAME = "codex-project-memory";
const DEFAULT_VERSION = "0.14.3";

export type AgentPlatform = "codex" | "claude" | "antigravity";
export type ProductState = "not_found" | "found" | "config_only";
export type DesktopIntegrationState =
  | "absent"
  | "installed"
  | "outdated"
  | "partial"
  | "conflict"
  | "external";
export type DesktopIntegrationAction =
  | "install"
  | "update"
  | "remove"
  | "migrate"
  | "repair"
  | "rescan";

export interface DesktopIntegrationStatus {
  platform: AgentPlatform;
  displayName: string;
  productState: ProductState;
  executablePath: string | null;
  productVersion: string | null;
  integrationState: DesktopIntegrationState;
  installedVersion: string | null;
  currentVersion: string;
  managedBy: "desktop" | "external" | null;
  externalPluginId: string | null;
  memoryAccessState: CodexMemoryAccessState | "not_applicable";
  memoryDataRoot: string | null;
  memoryConfigPath: string | null;
  issues: string[];
  actions: DesktopIntegrationAction[];
  restartRequired: boolean;
  successMessage: string;
  downloadUrl: string;
}

export interface CommandResult {
  status: number | null;
  stdout: string;
  stderr: string;
}

export interface DesktopIntegrationOptions {
  platform?: NodeJS.Platform;
  homeDir?: string;
  env?: NodeJS.ProcessEnv;
  codexPath?: string | null;
  claudePath?: string | null;
  claudeAppPath?: string | null;
  antigravityPath?: string | null;
  marketplaceRoot?: string | null;
  version?: string;
  migrateExternal?: boolean;
  dataRoot?: string;
  commandRunner?: (command: string, args: string[], env: NodeJS.ProcessEnv) => CommandResult;
  antigravity?: AntigravityIntegrationOptions;
  claude?: ClaudeIntegrationOptions;
}

interface DetectedProduct {
  state: ProductState;
  executablePath: string | null;
  commandPath: string | null;
  version: string | null;
}

interface CodexPluginRecord {
  pluginId?: string;
  name?: string;
  marketplaceName?: string;
  version?: string;
  installed?: boolean;
  enabled?: boolean;
}

interface CodexPluginList {
  installed?: CodexPluginRecord[];
  available?: CodexPluginRecord[];
}

interface ClaudePluginRecord {
  id?: string;
  name?: string;
  version?: string;
  scope?: string;
  marketplace?: string;
  marketplaceName?: string;
  enabled?: boolean;
}

export interface CodexMarketplaceRepairResult {
  changed: boolean;
  configPath: string;
  backupPath: string | null;
  repairedMarketplaces: string[];
}

function integrationDataRoot(options: DesktopIntegrationOptions): string {
  if (options.dataRoot) return path.resolve(options.dataRoot);
  if (options.homeDir) {
    const env = { ...process.env, ...options.env };
    const windowsAppData =
      options.platform === "win32"
        ? (env.APPDATA ??
          env.LOCALAPPDATA ??
          path.join(path.resolve(options.homeDir), "AppData", "Roaming"))
        : null;
    return path.join(windowsAppData ?? path.resolve(options.homeDir), ".project-memory", "v1");
  }
  return resolveDataDir();
}

function runCommand(
  command: string,
  args: string[],
  env: NodeJS.ProcessEnv,
  runner?: DesktopIntegrationOptions["commandRunner"],
): CommandResult {
  if (runner) return runner(command, args, env);
  const requiresShell = process.platform === "win32" && /\.(?:cmd|bat)$/i.test(command);
  const result = spawnSync(command, args, {
    encoding: "utf8",
    env,
    shell: requiresShell,
    timeout: 30_000,
    windowsHide: true,
  });
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? result.error?.message ?? "",
  };
}

function executableOnPath(
  name: string,
  env: NodeJS.ProcessEnv,
  platform: NodeJS.Platform,
): string | null {
  const pathValue = env.PATH ?? env.Path ?? env.path ?? "";
  const delimiter = platform === "win32" ? ";" : path.delimiter;
  const extensions =
    platform === "win32" ? (env.PATHEXT ?? ".EXE;.CMD;.BAT").split(";").filter(Boolean) : [""];
  for (const directory of pathValue.split(delimiter).filter(Boolean)) {
    for (const extension of extensions) {
      const candidate = path.join(directory, platform === "win32" ? `${name}${extension}` : name);
      if (existsSync(candidate)) return path.resolve(candidate);
      if (platform === "win32") {
        try {
          const expectedName = path.basename(candidate).toLocaleLowerCase();
          const matchedName = readdirSync(directory).find(
            (entry) => entry.toLocaleLowerCase() === expectedName,
          );
          if (matchedName) return path.resolve(directory, matchedName);
        } catch {}
      }
    }
  }
  return null;
}

function firstExisting(candidates: Array<string | null | undefined>): string | null {
  const match = candidates.find((candidate): candidate is string =>
    Boolean(candidate && existsSync(candidate)),
  );
  return match ? path.resolve(match) : null;
}

function windowsAppxInstallLocation(
  packageName: string,
  env: NodeJS.ProcessEnv,
  runner?: DesktopIntegrationOptions["commandRunner"],
): string | null {
  const result = runCommand(
    "powershell.exe",
    [
      "-NoLogo",
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      `(Get-AppxPackage -Name '${packageName}' -ErrorAction SilentlyContinue | Sort-Object Version -Descending | Select-Object -First 1).InstallLocation`,
    ],
    env,
    runner,
  );
  if (result.status !== 0) return null;
  const installLocation = result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);
  return installLocation ? path.resolve(installLocation) : null;
}

function compatibleIntegrationVersion(
  installedVersion: string | null,
  currentVersion: string,
): boolean {
  if (!installedVersion) return false;
  return installedVersion.split("+", 1)[0] === currentVersion.split("+", 1)[0];
}

function codexCandidates(
  platform: NodeJS.Platform,
  homeDir: string,
  env: NodeJS.ProcessEnv,
): string[] {
  if (platform === "darwin") {
    return [
      "/Applications/ChatGPT.app/Contents/Resources/codex",
      "/Applications/Codex.app/Contents/Resources/codex",
      path.join(homeDir, "Applications/ChatGPT.app/Contents/Resources/codex"),
      path.join(homeDir, "Applications/Codex.app/Contents/Resources/codex"),
    ];
  }
  if (platform === "win32") {
    const local = env.LOCALAPPDATA ?? path.join(homeDir, "AppData", "Local");
    const desktopBin = path.join(local, "OpenAI", "Codex", "bin");
    let desktopCliCandidates: string[] = [];
    try {
      desktopCliCandidates = readdirSync(desktopBin, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => path.join(desktopBin, entry.name, "codex.exe"))
        .filter((candidate) => existsSync(candidate))
        .sort((left, right) => statSync(right).mtimeMs - statSync(left).mtimeMs);
    } catch {}
    const programFiles = [env.ProgramFiles, env["ProgramFiles(x86)"]].filter(
      (value): value is string => Boolean(value),
    );
    return [
      ...desktopCliCandidates,
      path.join(local, "Programs", "Codex", "codex.exe"),
      path.join(local, "Programs", "ChatGPT", "resources", "codex.exe"),
      ...programFiles.flatMap((root) => [
        path.join(root, "Codex", "codex.exe"),
        path.join(root, "ChatGPT", "resources", "codex.exe"),
      ]),
    ];
  }
  return [];
}

function antigravityCandidates(
  platform: NodeJS.Platform,
  homeDir: string,
  env: NodeJS.ProcessEnv,
): string[] {
  if (platform === "darwin") {
    return [
      "/Applications/Antigravity.app/Contents/MacOS/Antigravity",
      path.join(homeDir, "Applications/Antigravity.app/Contents/MacOS/Antigravity"),
    ];
  }
  if (platform === "win32") {
    const local = env.LOCALAPPDATA ?? path.join(homeDir, "AppData", "Local");
    const programFiles = [env.ProgramFiles, env["ProgramFiles(x86)"]].filter(
      (value): value is string => Boolean(value),
    );
    return [
      path.join(local, "Programs", "Antigravity", "Antigravity.exe"),
      ...programFiles.map((root) => path.join(root, "Antigravity", "Antigravity.exe")),
    ];
  }
  return [];
}

function claudeCandidates(platform: NodeJS.Platform, homeDir: string): string[] {
  if (platform === "darwin") {
    return [
      path.join(homeDir, ".local", "bin", "claude"),
      path.join(homeDir, ".npm-global", "bin", "claude"),
    ];
  }
  if (platform === "win32") {
    return [
      path.join(homeDir, "AppData", "Roaming", "npm", "claude.cmd"),
      path.join(homeDir, "AppData", "Local", "Programs", "Claude", "claude.exe"),
    ];
  }
  return [path.join(homeDir, ".local", "bin", "claude")];
}

function claudeAppCandidates(
  platform: NodeJS.Platform,
  homeDir: string,
  env: NodeJS.ProcessEnv,
  runner?: DesktopIntegrationOptions["commandRunner"],
): string[] {
  if (platform === "darwin") {
    return [
      "/Applications/Claude.app/Contents/MacOS/Claude",
      path.join(homeDir, "Applications", "Claude.app", "Contents", "MacOS", "Claude"),
    ];
  }
  if (platform === "win32") {
    const local = env.LOCALAPPDATA ?? path.join(homeDir, "AppData", "Local");
    const appxRoot = windowsAppxInstallLocation("Claude", env, runner);
    const programFiles = [env.ProgramFiles, env["ProgramFiles(x86)"]].filter(
      (value): value is string => Boolean(value),
    );
    return [
      ...(appxRoot ? [path.join(appxRoot, "app", "Claude.exe")] : []),
      path.join(local, "Programs", "Claude", "Claude.exe"),
      ...programFiles.map((root) => path.join(root, "Claude", "Claude.exe")),
    ];
  }
  return [];
}

function detectProduct(
  platformName: AgentPlatform,
  options: DesktopIntegrationOptions,
): DetectedProduct {
  const platform = options.platform ?? process.platform;
  const homeDir = options.homeDir ?? homedir();
  const env = { ...process.env, ...options.env };
  const explicitCommand =
    platformName === "codex"
      ? options.codexPath
      : platformName === "claude"
        ? options.claudePath
        : options.antigravityPath;
  const onPath = executableOnPath(platformName, env, platform);
  const candidates =
    platformName === "codex"
      ? codexCandidates(platform, homeDir, env)
      : platformName === "claude"
        ? claudeCandidates(platform, homeDir)
        : antigravityCandidates(platform, homeDir, env);
  const commandPath = firstExisting([explicitCommand, onPath, ...candidates]);
  const executablePath =
    platformName === "claude"
      ? (commandPath ??
        firstExisting([
          options.claudeAppPath,
          ...claudeAppCandidates(platform, homeDir, env, options.commandRunner),
        ]))
      : commandPath;
  const configPath = path.join(
    homeDir,
    platformName === "codex" ? ".codex" : platformName === "claude" ? ".claude" : ".gemini",
  );
  const state: ProductState = executablePath
    ? "found"
    : existsSync(configPath)
      ? "config_only"
      : "not_found";
  if (!executablePath) return { state, executablePath: null, commandPath: null, version: null };
  if (platformName === "antigravity") {
    return { state, executablePath, commandPath, version: null };
  }
  if (!commandPath) return { state, executablePath, commandPath: null, version: null };
  const result = runCommand(commandPath, ["--version"], env, options.commandRunner);
  const version = result.status === 0 ? result.stdout.trim() || null : null;
  return { state, executablePath, commandPath, version };
}

function readBundledPluginVersion(marketplaceRoot: string | null, fallback: string): string {
  if (!marketplaceRoot) return fallback;
  const manifestPath = path.join(
    marketplaceRoot,
    "plugins",
    PLUGIN_NAME,
    ".codex-plugin",
    "plugin.json",
  );
  if (!existsSync(manifestPath)) return fallback;
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { version?: string };
    return manifest.version?.trim() || fallback;
  } catch {
    return fallback;
  }
}

function readBundledClaudePluginVersion(marketplaceRoot: string | null, fallback: string): string {
  if (!marketplaceRoot) return fallback;
  const manifestPath = path.join(
    marketplaceRoot,
    "adapters",
    "claude-code",
    ".claude-plugin",
    "plugin.json",
  );
  if (!existsSync(manifestPath)) return fallback;
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { version?: string };
    return manifest.version?.trim() || fallback;
  } catch {
    return fallback;
  }
}

function parseJson<T>(result: CommandResult, label: string): T {
  if (result.status !== 0) {
    throw new ProjectMemoryError("STORAGE_ERROR", `${label} failed.`, {
      status: result.status,
      stderr: result.stderr.trim(),
    });
  }
  try {
    return JSON.parse(result.stdout) as T;
  } catch {
    throw new ProjectMemoryError("STORAGE_ERROR", `${label} returned invalid JSON.`, {
      stdout: result.stdout.slice(0, 500),
    });
  }
}

function codexConfigPath(options: DesktopIntegrationOptions): string {
  const env = { ...process.env, ...options.env };
  const codexHome = env.CODEX_HOME
    ? path.resolve(env.CODEX_HOME)
    : path.join(options.homeDir ?? homedir(), ".codex");
  return path.join(codexHome, "config.toml");
}

function hasMarketplaceManifest(root: string): boolean {
  return existsSync(path.join(root, ".agents", "plugins", "marketplace.json"));
}

function normalizeBrokenLocalPath(source: string, platform: NodeJS.Platform): string {
  if (platform === "win32" || source.length < 4) return source;
  if (source[0] === "\\" && source[1] === "\\" && source[2] === "?") {
    if (source[3] === "\\") return source.slice(4);
    if (source[3] === "/") return source.slice(3);
  }
  return source;
}

function repairedMarketplaceSource(
  marketplaceName: string,
  source: string,
  options: DesktopIntegrationOptions,
): string | null {
  const bundledRoot = options.marketplaceRoot ? path.resolve(options.marketplaceRoot) : null;
  if (
    marketplaceName === DESKTOP_MARKETPLACE &&
    bundledRoot &&
    bundledRoot !== source &&
    hasMarketplaceManifest(bundledRoot)
  ) {
    return bundledRoot;
  }

  const normalized = normalizeBrokenLocalPath(source, options.platform ?? process.platform);
  if (normalized === source) return null;
  const resolved = path.resolve(normalized);
  return hasMarketplaceManifest(resolved) ? resolved : null;
}

export function repairCodexMarketplaceConfig(
  options: DesktopIntegrationOptions = {},
): CodexMarketplaceRepairResult {
  const configPath = codexConfigPath(options);
  if (!existsSync(configPath)) {
    return { changed: false, configPath, backupPath: null, repairedMarketplaces: [] };
  }

  const source = readFileSync(configPath, "utf8");
  const newline = source.includes("\r\n") ? "\r\n" : "\n";
  const lines = source.split(/\r?\n/);
  const repairedMarketplaces: string[] = [];
  let marketplaceName: string | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const table = /^\s*\[marketplaces\.([^\]]+)\]\s*(?:#.*)?$/.exec(line);
    if (table) {
      marketplaceName = table[1] ?? null;
      continue;
    }
    if (/^\s*\[/.test(line)) {
      marketplaceName = null;
      continue;
    }
    if (!marketplaceName) continue;
    const assignment = /^(\s*source\s*=\s*)(["'])(.*)\2(\s*(?:#.*)?)$/.exec(line);
    if (!assignment) continue;
    const repaired = repairedMarketplaceSource(marketplaceName, assignment[3] ?? "", options);
    if (!repaired) continue;
    lines[index] = `${assignment[1]}${JSON.stringify(repaired)}${assignment[4] ?? ""}`;
    repairedMarketplaces.push(marketplaceName);
  }

  if (repairedMarketplaces.length === 0) {
    return { changed: false, configPath, backupPath: null, repairedMarketplaces };
  }

  const updated = lines.join(newline);
  const backupPath = `${configPath}.project-memory-marketplace-backup`;
  if (!existsSync(backupPath)) {
    copyFileSync(configPath, backupPath);
    if ((options.platform ?? process.platform) !== "win32") chmodSync(backupPath, 0o600);
  }
  const existingMode = statSync(configPath).mode & 0o777;
  const temporaryPath = `${configPath}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, updated, { encoding: "utf8", mode: existingMode });
  if ((options.platform ?? process.platform) !== "win32") chmodSync(temporaryPath, existingMode);
  renameSync(temporaryPath, configPath);
  return { changed: true, configPath, backupPath, repairedMarketplaces };
}

function codexPluginList(
  executablePath: string,
  options: DesktopIntegrationOptions,
): CodexPluginList {
  const env = { ...process.env, ...options.env };
  const inspect = () =>
    parseJson<CodexPluginList>(
      runCommand(
        executablePath,
        ["plugin", "list", "--available", "--json"],
        env,
        options.commandRunner,
      ),
      "Codex plugin inspection",
    );
  try {
    return inspect();
  } catch (error) {
    const repair = repairCodexMarketplaceConfig(options);
    if (!repair.changed) throw error;
    return inspect();
  }
}

function claudePluginList(
  executablePath: string,
  options: DesktopIntegrationOptions,
): ClaudePluginRecord[] {
  const result = runCommand(
    executablePath,
    ["plugin", "list", "--json"],
    { ...process.env, ...options.env },
    options.commandRunner,
  );
  const parsed = parseJson<ClaudePluginRecord[] | { plugins?: ClaudePluginRecord[] }>(
    result,
    "Claude Code plugin inspection",
  );
  return Array.isArray(parsed) ? parsed : (parsed.plugins ?? []);
}

function claudePluginMatches(plugin: ClaudePluginRecord): boolean {
  return (
    plugin.name === "project-memory" ||
    plugin.id === "project-memory" ||
    plugin.id?.startsWith("project-memory@") === true
  );
}

function inspectionIssue(error: unknown): string {
  if (!(error instanceof ProjectMemoryError)) {
    return error instanceof Error ? error.message : String(error);
  }
  const stderr = typeof error.details.stderr === "string" ? error.details.stderr.trim() : "";
  if (!stderr) return error.message;
  return `${error.message} ${stderr.split(/\r?\n/).slice(0, 3).join(" ")}`;
}

export function statusActions(
  productState: ProductState,
  integrationState: DesktopIntegrationState,
  memoryAccessState: CodexMemoryAccessState | "not_applicable" = "not_applicable",
): DesktopIntegrationAction[] {
  if (productState !== "found") return ["rescan"];
  switch (integrationState) {
    case "absent":
      return ["install", "rescan"];
    case "outdated":
      return ["update", "remove", "rescan"];
    case "installed":
      if (memoryAccessState === "not_applicable") return ["remove", "rescan"];
      return memoryAccessState === "configured"
        ? ["remove", "rescan"]
        : ["repair", "remove", "rescan"];
    case "external":
      return ["migrate", "rescan"];
    default:
      return ["rescan"];
  }
}

function codexStatus(options: DesktopIntegrationOptions): DesktopIntegrationStatus {
  const product = detectProduct("codex", options);
  const marketplaceRoot = options.marketplaceRoot ? path.resolve(options.marketplaceRoot) : null;
  const currentVersion = readBundledPluginVersion(
    marketplaceRoot,
    options.version ?? DEFAULT_VERSION,
  );
  let integrationState: DesktopIntegrationState = "absent";
  let installedVersion: string | null = null;
  let managedBy: DesktopIntegrationStatus["managedBy"] = null;
  let externalPluginId: string | null = null;
  const issues: string[] = [];
  const dataRoot = integrationDataRoot(options);
  const memoryAccess = inspectCodexMemoryAccess({
    homeDir: options.homeDir,
    env: options.env,
    dataRoot,
  });
  if (product.executablePath) {
    try {
      const plugins = codexPluginList(product.executablePath, options);
      const installed = (plugins.installed ?? []).find((plugin) => plugin.name === PLUGIN_NAME);
      if (installed) {
        installedVersion = installed.version ?? null;
        if (installed.marketplaceName === DESKTOP_MARKETPLACE) {
          managedBy = "desktop";
          integrationState = compatibleIntegrationVersion(installedVersion, currentVersion)
            ? "installed"
            : "outdated";
        } else {
          managedBy = "external";
          integrationState = "external";
          externalPluginId = installed.pluginId ?? null;
          issues.push(`installed from ${installed.marketplaceName ?? "another marketplace"}`);
        }
      }
    } catch (error) {
      integrationState = "conflict";
      issues.push(inspectionIssue(error));
    }
  }
  if (
    ["installed", "outdated", "external"].includes(integrationState) &&
    memoryAccess.state !== "configured"
  ) {
    issues.push(
      memoryAccess.issue ?? `Codex sandbox has not allowed the Talo data directory: ${dataRoot}`,
    );
  }
  return {
    platform: "codex",
    displayName: "Codex",
    productState: product.state,
    executablePath: product.executablePath,
    productVersion: product.version,
    integrationState,
    installedVersion,
    currentVersion,
    managedBy,
    externalPluginId,
    memoryAccessState: memoryAccess.state,
    memoryDataRoot: dataRoot,
    memoryConfigPath: memoryAccess.configPath,
    issues,
    actions: statusActions(product.state, integrationState, memoryAccess.state),
    restartRequired: memoryAccess.state !== "configured",
    successMessage:
      memoryAccess.state === "configured"
        ? "已配置普通可写目录权限和托管沙箱升级执行兜底。"
        : "需要先修复 Talo 数据目录权限。",
    downloadUrl: "https://openai.com/codex/",
  };
}

function antigravityStatus(options: DesktopIntegrationOptions): DesktopIntegrationStatus {
  const product = detectProduct("antigravity", options);
  const integration = antigravityIntegrationStatus({
    ...options.antigravity,
    version: options.version ?? options.antigravity?.version,
  });
  return {
    platform: "antigravity",
    displayName: "Antigravity",
    productState: product.state,
    executablePath: product.executablePath,
    productVersion: product.version,
    integrationState: integration.state,
    installedVersion: integration.version,
    currentVersion: integration.currentVersion,
    managedBy: integration.state === "absent" ? null : integration.version ? "desktop" : "external",
    externalPluginId: null,
    memoryAccessState: "not_applicable",
    memoryDataRoot: null,
    memoryConfigPath: null,
    issues: integration.issues,
    actions: statusActions(product.state, integration.state),
    restartRequired: integration.state !== "absent",
    successMessage: "重启 Antigravity 后生效。",
    downloadUrl: "https://antigravity.google/",
  };
}

function claudeStatus(options: DesktopIntegrationOptions): DesktopIntegrationStatus {
  const product = detectProduct("claude", options);
  const marketplaceRoot = options.marketplaceRoot ? path.resolve(options.marketplaceRoot) : null;
  const currentVersion = readBundledClaudePluginVersion(
    marketplaceRoot,
    options.version ?? DEFAULT_VERSION,
  );
  if (!product.commandPath) {
    const integration = claudeIntegrationStatus({
      ...options.claude,
      version: currentVersion,
    });
    return {
      platform: "claude",
      displayName: "Claude Code",
      productState: product.state,
      executablePath: product.executablePath,
      productVersion: product.version,
      integrationState: integration.state,
      installedVersion: integration.version,
      currentVersion: integration.currentVersion,
      managedBy:
        integration.state === "absent" ? null : integration.version ? "desktop" : "external",
      externalPluginId: null,
      memoryAccessState: "not_applicable",
      memoryDataRoot: null,
      memoryConfigPath: integration.manifestPath,
      issues: integration.issues,
      actions: statusActions(product.state, integration.state),
      restartRequired: integration.state !== "absent",
      successMessage: "重启 Claude Code 后生效。",
      downloadUrl: "https://claude.ai/download",
    };
  }
  let integrationState: DesktopIntegrationState = "absent";
  let installedVersion: string | null = null;
  let managedBy: DesktopIntegrationStatus["managedBy"] = null;
  let externalPluginId: string | null = null;
  const issues: string[] = [];
  if (product.commandPath) {
    try {
      const installed = claudePluginList(product.commandPath, options).find(claudePluginMatches);
      if (installed) {
        installedVersion = installed.version ?? null;
        const marketplaceName = installed.marketplaceName ?? installed.marketplace ?? "";
        const managed =
          marketplaceName === "project-memory" ||
          marketplaceName === "project-memory-desktop" ||
          installed.id?.endsWith("@project-memory") === true;
        if (managed) {
          managedBy = "desktop";
          integrationState = compatibleIntegrationVersion(installedVersion, currentVersion)
            ? "installed"
            : "outdated";
        } else {
          managedBy = "external";
          integrationState = "external";
          externalPluginId = installed.id ?? installed.name ?? null;
          issues.push(`installed from ${marketplaceName || "another marketplace"}`);
        }
      }
    } catch (error) {
      integrationState = "conflict";
      issues.push(inspectionIssue(error));
    }
  }
  return {
    platform: "claude",
    displayName: "Claude Code",
    productState: product.state,
    executablePath: product.executablePath,
    productVersion: product.version,
    integrationState,
    installedVersion,
    currentVersion,
    managedBy,
    externalPluginId,
    memoryAccessState: "not_applicable",
    memoryDataRoot: null,
    memoryConfigPath: null,
    issues,
    actions: statusActions(product.state, integrationState),
    restartRequired: false,
    successMessage: "重启 Claude Code 后生效。",
    downloadUrl: "https://claude.ai/download",
  };
}

export function scanDesktopIntegrations(
  options: DesktopIntegrationOptions = {},
): DesktopIntegrationStatus[] {
  return [codexStatus(options), claudeStatus(options), antigravityStatus(options)];
}

function requireDetected(status: DesktopIntegrationStatus): string {
  if (status.productState !== "found" || !status.executablePath) {
    throw new ProjectMemoryError("FILE_NOT_FOUND", `${status.displayName} is not installed.`, {
      platform: status.platform,
      productState: status.productState,
    });
  }
  return status.executablePath;
}

function runCodexJson(
  executablePath: string,
  args: string[],
  options: DesktopIntegrationOptions,
  label: string,
): unknown {
  return parseJson(
    runCommand(executablePath, args, { ...process.env, ...options.env }, options.commandRunner),
    label,
  );
}

function runClaudeCommand(
  executablePath: string,
  args: string[],
  options: DesktopIntegrationOptions,
  label: string,
): CommandResult {
  const result = runCommand(
    executablePath,
    args,
    { ...process.env, ...options.env },
    options.commandRunner,
  );
  if (result.status !== 0) {
    throw new ProjectMemoryError("STORAGE_ERROR", `${label} failed.`, {
      status: result.status,
      stderr: result.stderr.trim(),
    });
  }
  return result;
}

export function installDesktopIntegration(
  platformName: AgentPlatform,
  options: DesktopIntegrationOptions = {},
): Record<string, unknown> {
  if (platformName === "antigravity") {
    requireDetected(antigravityStatus(options));
    return installAntigravityIntegration({
      ...options.antigravity,
      version: options.version ?? options.antigravity?.version,
    });
  }
  if (platformName === "claude") {
    const status = claudeStatus(options);
    requireDetected(status);
    const product = detectProduct("claude", options);
    if (!product.commandPath) {
      return installClaudeIntegration({
        ...options.claude,
        version: status.currentVersion,
      });
    }
    const executablePath = product.commandPath;
    const marketplaceRoot = options.marketplaceRoot ? path.resolve(options.marketplaceRoot) : null;
    if (
      !marketplaceRoot ||
      !existsSync(path.join(marketplaceRoot, ".claude-plugin", "marketplace.json"))
    ) {
      throw new ProjectMemoryError(
        "FILE_NOT_FOUND",
        "Bundled Claude Code marketplace is missing.",
        {
          marketplaceRoot,
        },
      );
    }
    if (status.integrationState === "external" && !options.migrateExternal) {
      throw new ProjectMemoryError(
        "INTEGRATION_CONFLICT",
        "Claude Code Talo is installed from another marketplace.",
        { externalPluginId: status.externalPluginId },
      );
    }
    if (status.integrationState === "conflict") {
      throw new ProjectMemoryError(
        "INTEGRATION_CONFLICT",
        "Claude Code integration cannot be changed safely.",
        {
          issues: status.issues,
        },
      );
    }
    if (status.externalPluginId) {
      runClaudeCommand(
        executablePath,
        ["plugin", "uninstall", status.externalPluginId, "--scope", "user"],
        options,
        "Claude Code external plugin removal",
      );
    }
    runClaudeCommand(
      executablePath,
      ["plugin", "marketplace", "add", marketplaceRoot],
      options,
      "Claude Code marketplace installation",
    );
    runClaudeCommand(
      executablePath,
      ["plugin", "install", "project-memory@project-memory", "--scope", "user"],
      options,
      "Claude Code plugin installation",
    );
    return {
      ...claudeStatus(options),
      changed: true,
      action: status.integrationState === "absent" ? "installed" : "updated",
      restartRequired: true,
    };
  }
  const status = codexStatus(options);
  const executablePath = requireDetected(status);
  const marketplaceRoot = options.marketplaceRoot ? path.resolve(options.marketplaceRoot) : null;
  if (
    !marketplaceRoot ||
    !existsSync(path.join(marketplaceRoot, ".agents", "plugins", "marketplace.json"))
  ) {
    throw new ProjectMemoryError("FILE_NOT_FOUND", "Bundled Codex marketplace is missing.", {
      marketplaceRoot,
    });
  }
  if (status.integrationState === "external" && !options.migrateExternal) {
    throw new ProjectMemoryError(
      "INTEGRATION_CONFLICT",
      "Codex Talo is installed from another marketplace.",
      { externalPluginId: status.externalPluginId },
    );
  }
  if (status.integrationState === "conflict") {
    throw new ProjectMemoryError(
      "INTEGRATION_CONFLICT",
      "Codex integration cannot be changed safely.",
      {
        issues: status.issues,
      },
    );
  }
  ensureCodexMemoryAccess({
    homeDir: options.homeDir,
    env: options.env,
    dataRoot: integrationDataRoot(options),
  });
  const removedExternal = status.integrationState === "external" ? status.externalPluginId : null;
  if (removedExternal) {
    runCodexJson(
      executablePath,
      ["plugin", "remove", removedExternal, "--json"],
      options,
      "Codex external plugin removal",
    );
  }
  try {
    runCodexJson(
      executablePath,
      ["plugin", "marketplace", "add", marketplaceRoot, "--json"],
      options,
      "Codex marketplace installation",
    );
    runCodexJson(
      executablePath,
      ["plugin", "add", `${PLUGIN_NAME}@${DESKTOP_MARKETPLACE}`, "--json"],
      options,
      "Codex plugin installation",
    );
  } catch (error) {
    if (removedExternal) {
      runCommand(
        executablePath,
        ["plugin", "add", removedExternal, "--json"],
        { ...process.env, ...options.env },
        options.commandRunner,
      );
    }
    throw error;
  }
  return {
    ...codexStatus(options),
    changed: true,
    action: status.integrationState === "absent" ? "installed" : "updated",
    restartRequired: false,
  };
}

export function repairDesktopIntegration(
  platformName: AgentPlatform,
  options: DesktopIntegrationOptions = {},
): Record<string, unknown> {
  if (platformName !== "codex") {
    throw new ProjectMemoryError(
      "INVALID_INPUT",
      "Sandbox access repair is only required for Codex.",
      { platform: platformName },
    );
  }
  requireDetected(codexStatus(options));
  const result = ensureCodexMemoryAccess({
    homeDir: options.homeDir,
    env: options.env,
    dataRoot: integrationDataRoot(options),
  });
  return {
    ...result,
    action: result.changed ? "repaired" : "already_configured",
    message: result.changed
      ? "Codex sandbox access is configured. Start a new Codex task to apply it."
      : "Codex sandbox access is already configured.",
  };
}

export function removeDesktopIntegration(
  platformName: AgentPlatform,
  options: DesktopIntegrationOptions = {},
): Record<string, unknown> {
  if (platformName === "antigravity") {
    return removeAntigravityIntegration({
      ...options.antigravity,
      version: options.version ?? options.antigravity?.version,
    });
  }
  if (platformName === "claude") {
    const status = claudeStatus(options);
    requireDetected(status);
    if (status.integrationState === "absent") {
      return { ...status, changed: false, action: "absent" };
    }
    if (status.managedBy !== "desktop") {
      throw new ProjectMemoryError(
        "INTEGRATION_CONFLICT",
        "Talo Desktop does not manage this Claude Code plugin.",
        { integrationState: status.integrationState },
      );
    }
    const product = detectProduct("claude", options);
    if (!product.commandPath) {
      return removeClaudeIntegration({
        ...options.claude,
        version: status.currentVersion,
      });
    }
    const executablePath = product.commandPath;
    runClaudeCommand(
      executablePath,
      ["plugin", "uninstall", "project-memory@project-memory", "--scope", "user"],
      options,
      "Claude Code plugin removal",
    );
    runClaudeCommand(
      executablePath,
      ["plugin", "marketplace", "remove", "project-memory"],
      options,
      "Claude Code marketplace removal",
    );
    return { ...claudeStatus(options), changed: true, action: "removed" };
  }
  const status = codexStatus(options);
  const executablePath = requireDetected(status);
  if (status.integrationState === "absent") {
    return { ...status, changed: false, action: "absent" };
  }
  if (status.managedBy !== "desktop") {
    throw new ProjectMemoryError(
      "INTEGRATION_CONFLICT",
      "Talo Desktop does not manage this Codex plugin.",
      { integrationState: status.integrationState },
    );
  }
  runCodexJson(
    executablePath,
    ["plugin", "remove", `${PLUGIN_NAME}@${DESKTOP_MARKETPLACE}`, "--json"],
    options,
    "Codex plugin removal",
  );
  runCommand(
    executablePath,
    ["plugin", "marketplace", "remove", DESKTOP_MARKETPLACE],
    { ...process.env, ...options.env },
    options.commandRunner,
  );
  return { ...codexStatus(options), changed: true, action: "removed" };
}
