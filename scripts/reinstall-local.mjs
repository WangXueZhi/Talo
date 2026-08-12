import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sourceApp = path.join(
  root,
  "apps",
  "desktop",
  "src-tauri",
  "target",
  "release",
  "bundle",
  "macos",
  "Talo.app",
);
const targetApp = path.resolve(
  process.env.TALO_APP_TARGET ?? process.env.PROJECT_MEMORY_APP_TARGET ?? "/Applications/Talo.app",
);
const legacyTargetApp = "/Applications/Project Memory.app";

function run(command, args, cwd = root) {
  execFileSync(command, args, { cwd, stdio: "inherit" });
}

function runJson(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(result.stderr || `${command} exited with ${result.status}`);
  }
  return JSON.parse(result.stdout);
}

function replaceApplication() {
  if (!existsSync(sourceApp)) throw new Error(`Built application is missing: ${sourceApp}`);
  mkdirSync(path.dirname(targetApp), { recursive: true });
  const staging = `${targetApp}.staging-${process.pid}`;
  const backup = `${targetApp}.backup-${process.pid}`;
  rmSync(staging, { recursive: true, force: true });
  rmSync(backup, { recursive: true, force: true });
  cpSync(sourceApp, staging, { recursive: true, preserveTimestamps: true });
  try {
    if (existsSync(targetApp)) renameSync(targetApp, backup);
    renameSync(staging, targetApp);
    rmSync(backup, { recursive: true, force: true });
    if (legacyTargetApp !== targetApp) rmSync(legacyTargetApp, { recursive: true, force: true });
  } catch (error) {
    rmSync(staging, { recursive: true, force: true });
    if (!existsSync(targetApp) && existsSync(backup)) renameSync(backup, targetApp);
    throw error;
  }
}

run("pnpm", ["build"]);
run("pnpm", ["--dir", "packages/project-memory-core", "build"]);
run("pnpm", ["--dir", "apps/desktop", "tauri:build", "--bundles", "app"]);
replaceApplication();

const appNode = path.join(targetApp, "Contents", "MacOS", "project-memory-node");
const appCli = path.join(
  targetApp,
  "Contents",
  "Resources",
  "resources",
  "runtime",
  "project-memory.mjs",
);
const marketplaceRoot = path.join(
  targetApp,
  "Contents",
  "Resources",
  "resources",
  "runtime",
  "marketplace",
);

run(appNode, [appCli, "integration", "install", "codex", "--marketplace-root", marketplaceRoot]);
run(appNode, [appCli, "integration", "install", "antigravity"]);
const claude = runJson(appNode, [
  appCli,
  "integration",
  "status",
  "claude",
  "--marketplace-root",
  marketplaceRoot,
]);
if (claude.productState === "found") {
  run(appNode, [appCli, "integration", "install", "claude", "--marketplace-root", marketplaceRoot]);
} else {
  process.stdout.write("Claude Code was not found; skipping automatic Claude integration install.\n");
}

const shortcutCandidates = [
  path.join(homedir(), "Applications", "Talo.app"),
  path.join(homedir(), "Applications", "Project Memory.app"),
];
if (shortcutCandidates.some((shortcut) => existsSync(shortcut))) {
  run(appNode, [appCli, "shortcut", "install"]);
}

run(appNode, [appCli, "integration", "status", "codex", "--marketplace-root", marketplaceRoot]);
run(appNode, [appCli, "integration", "status", "antigravity"]);
if (claude.productState === "found") {
  run(appNode, [appCli, "integration", "status", "claude", "--marketplace-root", marketplaceRoot]);
}

process.stdout.write(`Reinstalled Talo at ${targetApp}\n`);
