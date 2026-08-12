import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import {
  installShortcut,
  removeShortcut,
} from "../../../packages/project-memory-core/src/launcher.js";

const cleanups: string[] = [];

afterEach(() => {
  for (const target of cleanups.splice(0)) rmSync(target, { recursive: true, force: true });
});

function fixture(): {
  root: string;
  homeDir: string;
  cliPath: string;
  iconPath: string;
} {
  const root = mkdtempSync(path.join(tmpdir(), "project-memory-launcher-"));
  cleanups.push(root);
  const homeDir = path.join(root, "home");
  const cliPath = path.join(root, "bin", "project-memory.mjs");
  const browserDir = path.join(path.dirname(cliPath), "browser");
  const iconPath = path.join(root, "logo.png");
  mkdirSync(path.join(homeDir, "Desktop"), { recursive: true });
  mkdirSync(browserDir, { recursive: true });
  writeFileSync(cliPath, "console.log('v1');\n", "utf8");
  writeFileSync(path.join(browserDir, "graph-app.js"), "window.graph = true;\n", "utf8");
  writeFileSync(path.join(browserDir, "graph-app.css"), ".graph{}\n", "utf8");
  writeFileSync(iconPath, "icon", "utf8");
  return { root, homeDir, cliPath, iconPath };
}

describe("Talo launchers", () => {
  test("installs a self-contained macOS application and removes the legacy command", () => {
    const { root, homeDir, cliPath, iconPath } = fixture();
    const legacy = path.join(homeDir, "Desktop", "Project Memory.command");
    const legacyApplication = path.join(homeDir, "Applications", "Project Memory.app");
    mkdirSync(legacyApplication, { recursive: true });
    writeFileSync(legacy, "#!/bin/sh\n", { encoding: "utf8", mode: 0o700 });
    const iconCompiler = (sourcePath: string, targetPath: string) => {
      copyFileSync(sourcePath, targetPath);
      chmodSync(targetPath, 0o600);
    };

    const installed = installShortcut({
      platform: "darwin",
      homeDir,
      cliPath,
      nodePath: "/opt/project-memory/node",
      iconPath,
      iconCompiler,
    });
    const appPath = path.join(homeDir, "Applications", "Talo.app");
    const resources = path.join(appPath, "Contents", "Resources");
    const executable = path.join(appPath, "Contents", "MacOS", "project-memory-launcher");
    expect(installed).toMatchObject({
      installed: true,
      appPath,
      opens: "memory-hub",
      legacyShortcutRemoved: true,
      legacyApplicationRemoved: true,
      embeddedCli: path.join(resources, "project-memory.mjs"),
    });
    expect(existsSync(legacy)).toBe(false);
    expect(readFileSync(path.join(resources, "project-memory.mjs"), "utf8")).toContain("v1");
    expect(readFileSync(path.join(resources, "browser", "graph-app.js"), "utf8")).toContain(
      "window.graph",
    );
    expect(existsSync(legacyApplication)).toBe(false);
    expect(readFileSync(path.join(resources, "Talo.icns"), "utf8")).toBe("icon");
    expect(readFileSync(path.join(appPath, "Contents", "Info.plist"), "utf8")).toContain(
      "<string>Talo</string>",
    );
    expect(readFileSync(executable, "utf8")).toContain(
      '"$APP_ROOT/Contents/Resources/project-memory.mjs" open',
    );
    expect(statSync(executable).mode & 0o777).toBe(0o700);

    writeFileSync(cliPath, "console.log('v2');\n", "utf8");
    installShortcut({
      platform: "darwin",
      homeDir,
      cliPath,
      nodePath: "/opt/project-memory/node",
      iconPath,
      iconCompiler,
    });
    expect(readFileSync(path.join(resources, "project-memory.mjs"), "utf8")).toContain("v2");
    expect(readdirSync(path.join(homeDir, "Applications"))).toEqual(["Talo.app"]);
    expect(readdirSync(root).some((name) => name.includes("installing-"))).toBe(false);
  });

  test("removes both the macOS application and the legacy command", () => {
    const { homeDir, cliPath, iconPath } = fixture();
    const iconCompiler = (sourcePath: string, targetPath: string) =>
      copyFileSync(sourcePath, targetPath);
    installShortcut({
      platform: "darwin",
      homeDir,
      cliPath,
      iconPath,
      iconCompiler,
    });
    const legacy = path.join(homeDir, "Desktop", "Project Memory.command");
    writeFileSync(legacy, "legacy", "utf8");
    const result = removeShortcut({ platform: "darwin", homeDir });
    expect(result).toMatchObject({ removed: true });
    expect(existsSync(path.join(homeDir, "Applications", "Talo.app"))).toBe(false);
    expect(existsSync(legacy)).toBe(false);
  });

  test("preserves the existing Windows and Linux launcher formats", () => {
    const { homeDir, cliPath } = fixture();
    const windows = installShortcut({
      platform: "win32",
      homeDir,
      cliPath,
      nodePath: "C:\\Node\\node.exe",
    });
    expect(readFileSync(windows.shortcutPath as string, "utf8")).toContain("@echo off");
    const linux = installShortcut({
      platform: "linux",
      homeDir,
      cliPath,
      nodePath: "/usr/bin/node",
    });
    expect(readFileSync(linux.shortcutPath as string, "utf8")).toContain("Terminal=false");
  });
});
