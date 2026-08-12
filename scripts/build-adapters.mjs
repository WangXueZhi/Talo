import { chmodSync, copyFileSync, cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const version = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")).version;
const skill = path.join(root, "skills", "project-memory");
const coreDist = path.join(root, "packages", "project-memory-core", "dist");
const appIcon = path.join(root, "plugins", "codex-project-memory", "assets", "logo.png");
const targets = [
  path.join(root, "plugins", "codex-project-memory", "skills", "project-memory"),
  path.join(root, "adapters", "claude-code", "skills", "project-memory"),
  path.join(root, "adapters", "antigravity", "project-memory"),
  path.join(root, "adapters", "generic", "project-memory")
];

for (const target of targets) {
  rmSync(target, { recursive: true, force: true });
  cpSync(skill, target, { recursive: true });
  chmodSync(path.join(target, "scripts", "project-memory.mjs"), 0o755);
}

for (const adapter of ["claude-code", "antigravity", "generic"]) {
  const bin = path.join(root, "adapters", adapter, "bin");
  const browser = path.join(bin, "browser");
  const assets = path.join(root, "adapters", adapter, "assets");
  const selfContainedBin = path.join(root, "adapters", adapter, "project-memory", "bin");
  const selfContainedBrowser = path.join(selfContainedBin, "browser");
  const selfContainedAssets = path.join(root, "adapters", adapter, "project-memory", "assets");
  mkdirSync(browser, { recursive: true });
  mkdirSync(assets, { recursive: true });
  mkdirSync(selfContainedBrowser, { recursive: true });
  mkdirSync(selfContainedAssets, { recursive: true });
  copyFileSync(path.join(coreDist, "talo.mjs"), path.join(bin, "talo.mjs"));
  copyFileSync(path.join(coreDist, "project-memory.mjs"), path.join(bin, "project-memory.mjs"));
  copyFileSync(path.join(coreDist, "browser", "graph-app.js"), path.join(browser, "graph-app.js"));
  copyFileSync(path.join(coreDist, "browser", "graph-app.css"), path.join(browser, "graph-app.css"));
  copyFileSync(appIcon, path.join(assets, "logo.png"));
  copyFileSync(
    path.join(coreDist, "talo.mjs"),
    path.join(selfContainedBin, "talo.mjs"),
  );
  copyFileSync(
    path.join(coreDist, "project-memory.mjs"),
    path.join(selfContainedBin, "project-memory.mjs"),
  );
  copyFileSync(
    path.join(coreDist, "browser", "graph-app.js"),
    path.join(selfContainedBrowser, "graph-app.js"),
  );
  copyFileSync(
    path.join(coreDist, "browser", "graph-app.css"),
    path.join(selfContainedBrowser, "graph-app.css"),
  );
  copyFileSync(appIcon, path.join(selfContainedAssets, "logo.png"));
  chmodSync(path.join(bin, "talo.mjs"), 0o755);
  chmodSync(path.join(bin, "project-memory.mjs"), 0o755);
  chmodSync(path.join(selfContainedBin, "talo.mjs"), 0o755);
  chmodSync(path.join(selfContainedBin, "project-memory.mjs"), 0o755);
}

const claudePluginManifestPath = path.join(
  root,
  "adapters",
  "claude-code",
  ".claude-plugin",
  "plugin.json",
);
const claudePluginManifest = JSON.parse(readFileSync(claudePluginManifestPath, "utf8"));
claudePluginManifest.version = version;
writeFileSync(claudePluginManifestPath, `${JSON.stringify(claudePluginManifest, null, 2)}\n`);

const releaseDir = path.join(root, "release");
mkdirSync(releaseDir, { recursive: true });
const zipPath = path.join(releaseDir, `project-memory-agent-skill-${version}.zip`);
rmSync(zipPath, { force: true });
const genericRoot = path.join(root, "adapters", "generic");
const archiveEntries = ["project-memory", "bin", "assets", "rules", "README.md"];
if (process.platform === "win32") {
  const quote = (value) => `'${value.replaceAll("'", "''")}'`;
  const sources = archiveEntries.map((entry) => quote(path.join(genericRoot, entry))).join(", ");
  execFileSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      `Compress-Archive -Path @(${sources}) -DestinationPath ${quote(zipPath)} -Force`,
    ],
    { stdio: "inherit" },
  );
} else {
  execFileSync("zip", ["-qr", zipPath, ...archiveEntries], { cwd: genericRoot });
}
