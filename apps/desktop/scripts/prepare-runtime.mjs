import { execFileSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  cpSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const desktopRoot = path.resolve(import.meta.dirname, "..");
const workspaceRoot = path.resolve(desktopRoot, "../..");
const tauriRoot = path.join(desktopRoot, "src-tauri");
const resourcesRoot = path.join(tauriRoot, "resources", "runtime");
const binariesRoot = path.join(tauriRoot, "binaries");
const iconsRoot = path.join(tauriRoot, "icons");
const coreDist = path.join(workspaceRoot, "packages", "project-memory-core", "dist");
const pluginRoot = path.join(workspaceRoot, "plugins", "codex-project-memory");
const claudeAdapterRoot = path.join(workspaceRoot, "adapters", "claude-code");

rmSync(resourcesRoot, { recursive: true, force: true });
mkdirSync(resourcesRoot, { recursive: true });
mkdirSync(binariesRoot, { recursive: true });
mkdirSync(iconsRoot, { recursive: true });

copyFileSync(path.join(coreDist, "talo.mjs"), path.join(resourcesRoot, "talo.mjs"));
copyFileSync(path.join(coreDist, "project-memory.mjs"), path.join(resourcesRoot, "project-memory.mjs"));
cpSync(path.join(coreDist, "browser"), path.join(resourcesRoot, "browser"), { recursive: true });
cpSync(path.join(workspaceRoot, "skills", "project-memory"), path.join(resourcesRoot, "skills", "project-memory"), { recursive: true });

const marketplaceRoot = path.join(resourcesRoot, "marketplace");
mkdirSync(path.join(marketplaceRoot, ".agents", "plugins"), { recursive: true });
writeFileSync(
  path.join(marketplaceRoot, ".agents", "plugins", "marketplace.json"),
  `${JSON.stringify(
    {
      name: "project-memory-desktop",
      interface: { displayName: "Talo Desktop" },
      plugins: [
        {
          name: "codex-project-memory",
          source: { source: "local", path: "./plugins/codex-project-memory" },
          policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
          category: "Productivity",
        },
      ],
    },
    null,
    2,
  )}\n`,
);
const bundledPlugin = path.join(marketplaceRoot, "plugins", "codex-project-memory");
for (const relative of [".codex-plugin", "assets", "dist", "hooks", "skills", "package.json"]) {
  cpSync(path.join(pluginRoot, relative), path.join(bundledPlugin, relative), { recursive: true });
}
cpSync(path.join(workspaceRoot, ".claude-plugin"), path.join(marketplaceRoot, ".claude-plugin"), {
  recursive: true,
});
cpSync(claudeAdapterRoot, path.join(marketplaceRoot, "adapters", "claude-code"), {
  recursive: true,
});

const rustVersion = execFileSync("rustc", ["-vV"], { encoding: "utf8" });
const target = rustVersion.match(/^host:\s*(.+)$/m)?.[1]?.trim();
if (!target) throw new Error("Unable to determine the Rust target triple.");
const binaryName = `project-memory-node-${target}${process.platform === "win32" ? ".exe" : ""}`;
const binaryPath = path.join(binariesRoot, binaryName);
if (process.platform === "darwin") {
  const architecture = target.startsWith("aarch64-") ? "arm64" : target.startsWith("x86_64-") ? "x86_64" : null;
  if (architecture) {
    execFileSync("lipo", [process.execPath, "-thin", architecture, "-output", binaryPath]);
  } else {
    copyFileSync(process.execPath, binaryPath);
  }
} else {
  copyFileSync(process.execPath, binaryPath);
}
if (process.platform !== "win32") chmodSync(binaryPath, 0o755);

const rootVersion = JSON.parse(readFileSync(path.join(workspaceRoot, "package.json"), "utf8")).version;
const desktopVersion = JSON.parse(readFileSync(path.join(desktopRoot, "package.json"), "utf8")).version;
if (rootVersion !== desktopVersion) {
  throw new Error(`Desktop version ${desktopVersion} does not match workspace version ${rootVersion}.`);
}

execFileSync("pnpm", ["exec", "tauri", "icon", path.join(pluginRoot, "assets", "brand-mark.svg"), "--output", iconsRoot], {
  cwd: desktopRoot,
  stdio: "ignore",
});

process.stdout.write(`Prepared Talo desktop runtime for ${target}.\n`);
