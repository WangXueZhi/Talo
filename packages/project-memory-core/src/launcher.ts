import { spawnSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { ProjectMemoryError } from "./errors.js";

export interface ShortcutOptions {
  platform?: NodeJS.Platform;
  homeDir?: string;
  cliPath?: string;
  nodePath?: string;
  iconPath?: string | null;
  iconCompiler?: (sourcePath: string, targetPath: string) => void;
}

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}

function xmlText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function browserAssetPath(cliPath: string, name: "graph-app.css" | "graph-app.js"): string {
  const cliDir = path.dirname(cliPath);
  const candidates = [
    path.join(cliDir, "browser", name),
    path.resolve(cliDir, "..", "dist", "browser", name),
    path.resolve(cliDir, "../../../plugins/codex-project-memory/dist/browser", name),
    path.resolve(process.cwd(), "dist", "browser", name),
    path.resolve(process.cwd(), "packages/project-memory-core/dist/browser", name),
    path.resolve(process.cwd(), "plugins/codex-project-memory/dist/browser", name),
  ];
  const resolved = candidates.find((candidate) => existsSync(candidate));
  if (!resolved) {
    throw new ProjectMemoryError(
      "FILE_NOT_FOUND",
      `Browser asset ${name} is missing. Build Talo before installing the application.`,
      { candidates },
    );
  }
  return resolved;
}

function launcherIconPath(cliPath: string, explicitPath?: string | null): string {
  const cliDir = path.dirname(cliPath);
  const candidates = [
    explicitPath,
    process.env.PROJECT_MEMORY_APP_ICON,
    path.resolve(cliDir, "../assets/logo.png"),
    path.resolve(cliDir, "../../assets/logo.png"),
    path.resolve(cliDir, "../../../plugins/codex-project-memory/assets/logo.png"),
    path.resolve(process.cwd(), "plugins/codex-project-memory/assets/logo.png"),
  ].filter((candidate): candidate is string => Boolean(candidate));
  const resolved = candidates.find((candidate) => existsSync(candidate));
  if (!resolved) {
    throw new ProjectMemoryError("FILE_NOT_FOUND", "Talo application icon is missing.", {
      candidates,
    });
  }
  return resolved;
}

function compileMacIcon(sourcePath: string, targetPath: string): void {
  const iconsetPath = `${targetPath}.iconset`;
  rmSync(iconsetPath, { recursive: true, force: true });
  mkdirSync(iconsetPath, { recursive: true, mode: 0o700 });
  const sizes = [16, 32, 128, 256, 512] as const;
  try {
    for (const size of sizes) {
      const regular = path.join(iconsetPath, `icon_${size}x${size}.png`);
      const retina = path.join(iconsetPath, `icon_${size}x${size}@2x.png`);
      const regularResult = spawnSync(
        "sips",
        ["-z", String(size), String(size), sourcePath, "--out", regular],
        {
          stdio: "ignore",
        },
      );
      const retinaResult = spawnSync(
        "sips",
        ["-z", String(size * 2), String(size * 2), sourcePath, "--out", retina],
        { stdio: "ignore" },
      );
      if (regularResult.status !== 0 || retinaResult.status !== 0) {
        throw new ProjectMemoryError(
          "STORAGE_ERROR",
          "Unable to resize the macOS application icon.",
        );
      }
    }
    const result = spawnSync("iconutil", ["-c", "icns", iconsetPath, "-o", targetPath], {
      stdio: "ignore",
    });
    if (result.status !== 0) {
      throw new ProjectMemoryError(
        "STORAGE_ERROR",
        "Unable to compile the macOS application icon.",
      );
    }
    chmodSync(targetPath, 0o600);
  } finally {
    rmSync(iconsetPath, { recursive: true, force: true });
  }
}

function macApplicationPath(homeDir: string): string {
  return path.join(homeDir, "Applications", "Talo.app");
}

function legacyMacApplicationPath(homeDir: string): string {
  return path.join(homeDir, "Applications", "Project Memory.app");
}

function legacyMacShortcutPath(homeDir: string): string {
  return path.join(homeDir, "Desktop", "Project Memory.command");
}

function installMacApplication(
  options: Required<Pick<ShortcutOptions, "homeDir" | "cliPath" | "nodePath">> & ShortcutOptions,
): Record<string, unknown> {
  const target = macApplicationPath(options.homeDir);
  const legacyApplication = legacyMacApplicationPath(options.homeDir);
  const staging = `${target}.installing-${process.pid}`;
  const previous = `${target}.previous-${process.pid}`;
  const contents = path.join(staging, "Contents");
  const macos = path.join(contents, "MacOS");
  const resources = path.join(contents, "Resources");
  const browser = path.join(resources, "browser");
  const embeddedCli = path.join(resources, "project-memory.mjs");
  const executable = path.join(macos, "project-memory-launcher");
  const iconTarget = path.join(resources, "Talo.icns");
  const legacyShortcut = legacyMacShortcutPath(options.homeDir);
  rmSync(staging, { recursive: true, force: true });
  rmSync(previous, { recursive: true, force: true });
  mkdirSync(macos, { recursive: true, mode: 0o700 });
  mkdirSync(browser, { recursive: true, mode: 0o700 });
  copyFileSync(options.cliPath, embeddedCli);
  copyFileSync(
    browserAssetPath(options.cliPath, "graph-app.js"),
    path.join(browser, "graph-app.js"),
  );
  copyFileSync(
    browserAssetPath(options.cliPath, "graph-app.css"),
    path.join(browser, "graph-app.css"),
  );
  chmodSync(embeddedCli, 0o600);
  chmodSync(path.join(browser, "graph-app.js"), 0o600);
  chmodSync(path.join(browser, "graph-app.css"), 0o600);
  const compileIcon = options.iconCompiler ?? compileMacIcon;
  compileIcon(launcherIconPath(options.cliPath, options.iconPath), iconTarget);
  const launcher = `#!/bin/sh\nAPP_ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"\nexec ${shellQuote(options.nodePath)} "$APP_ROOT/Contents/Resources/project-memory.mjs" open\n`;
  writeFileSync(executable, launcher, { encoding: "utf8", mode: 0o700 });
  chmodSync(executable, 0o700);
  const plist = `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n<dict>\n  <key>CFBundleDisplayName</key><string>Talo</string>\n  <key>CFBundleExecutable</key><string>project-memory-launcher</string>\n  <key>CFBundleIconFile</key><string>Talo</string>\n  <key>CFBundleIdentifier</key><string>com.wangxuezhi.talo</string>\n  <key>CFBundleName</key><string>Talo</string>\n  <key>CFBundlePackageType</key><string>APPL</string>\n  <key>CFBundleShortVersionString</key><string>0.14.4</string>\n  <key>CFBundleVersion</key><string>1404</string>\n  <key>LSMinimumSystemVersion</key><string>12.0</string>\n  <key>NSHighResolutionCapable</key><true/>\n  <key>TaloCLI</key><string>${xmlText(options.cliPath)}</string>\n</dict>\n</plist>\n`;
  writeFileSync(path.join(contents, "Info.plist"), plist, { encoding: "utf8", mode: 0o600 });
  mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
  try {
    if (existsSync(target)) renameSync(target, previous);
    renameSync(staging, target);
    rmSync(previous, { recursive: true, force: true });
  } catch (error) {
    rmSync(staging, { recursive: true, force: true });
    if (!existsSync(target) && existsSync(previous)) renameSync(previous, target);
    throw error;
  }
  const legacyShortcutRemoved = existsSync(legacyShortcut);
  rmSync(legacyShortcut, { force: true });
  const legacyApplicationRemoved = existsSync(legacyApplication);
  rmSync(legacyApplication, { recursive: true, force: true });
  return {
    installed: true,
    shortcutPath: target,
    appPath: target,
    opens: "memory-hub",
    legacyShortcutRemoved,
    legacyApplicationRemoved,
    embeddedCli: path.join(target, "Contents", "Resources", "project-memory.mjs"),
  };
}

export function installShortcut(options: ShortcutOptions = {}): Record<string, unknown> {
  const platform = options.platform ?? process.platform;
  const homeDir = options.homeDir ?? homedir();
  const cliPath = path.resolve(options.cliPath ?? process.argv[1] ?? "project-memory.mjs");
  const nodePath = path.resolve(options.nodePath ?? process.execPath);
  if (platform === "darwin") {
    return installMacApplication({ ...options, homeDir, cliPath, nodePath });
  }
  const target =
    platform === "win32"
      ? path.join(homeDir, "Desktop", "Talo.cmd")
      : path.join(homeDir, ".local", "share", "applications", "project-memory.desktop");
  mkdirSync(path.dirname(target), { recursive: true });
  const command = `${JSON.stringify(nodePath)} ${JSON.stringify(cliPath)} open`;
  const content =
    platform === "win32"
      ? `@echo off\r\n${command}\r\n`
      : `[Desktop Entry]\nType=Application\nName=Talo\nExec=${command}\nTerminal=false\nCategories=Utility;Development;\n`;
  writeFileSync(target, content, { encoding: "utf8", mode: 0o700 });
  if (platform !== "win32") chmodSync(target, 0o700);
  return { installed: true, shortcutPath: target, command };
}

export function removeShortcut(options: ShortcutOptions = {}): Record<string, unknown> {
  const platform = options.platform ?? process.platform;
  const homeDir = options.homeDir ?? homedir();
  if (platform === "darwin") {
    const appPath = macApplicationPath(homeDir);
    const legacyAppPath = legacyMacApplicationPath(homeDir);
    const legacyShortcutPath = legacyMacShortcutPath(homeDir);
    rmSync(appPath, { recursive: true, force: true });
    rmSync(legacyAppPath, { recursive: true, force: true });
    rmSync(legacyShortcutPath, { force: true });
    return { removed: true, shortcutPath: appPath, appPath, legacyAppPath, legacyShortcutPath };
  }
  const target =
    platform === "win32"
      ? path.join(homeDir, "Desktop", "Talo.cmd")
      : path.join(homeDir, ".local", "share", "applications", "project-memory.desktop");
  rmSync(target, { force: true });
  return { removed: true, shortcutPath: target };
}
