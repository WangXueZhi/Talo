import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import {
  type CommandResult,
  installDesktopIntegration,
  removeDesktopIntegration,
  scanDesktopIntegrations,
  statusActions,
} from "../../../packages/project-memory-core/src/desktop-integration.js";

const cleanups: string[] = [];

afterEach(() => {
  while (cleanups.length > 0) rmSync(cleanups.pop() as string, { recursive: true, force: true });
});

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), "project-memory-desktop-integration-"));
  cleanups.push(root);
  const homeDir = path.join(root, "home");
  const codexPath = path.join(root, "bin", "codex");
  const claudePath = path.join(root, "bin", "claude");
  const claudeAppPath = path.join(root, "Claude.app", "Contents", "MacOS", "Claude");
  const antigravityPath = path.join(root, "Antigravity.app", "Contents", "MacOS", "Antigravity");
  const marketplaceRoot = path.join(root, "marketplace");
  mkdirSync(path.dirname(codexPath), { recursive: true });
  mkdirSync(path.dirname(claudeAppPath), { recursive: true });
  mkdirSync(path.dirname(antigravityPath), { recursive: true });
  mkdirSync(path.join(marketplaceRoot, ".agents", "plugins"), { recursive: true });
  mkdirSync(path.join(marketplaceRoot, "plugins", "codex-project-memory", ".codex-plugin"), {
    recursive: true,
  });
  mkdirSync(path.join(marketplaceRoot, ".claude-plugin"), { recursive: true });
  mkdirSync(path.join(marketplaceRoot, "adapters", "claude-code", ".claude-plugin"), {
    recursive: true,
  });
  writeFileSync(codexPath, "codex");
  writeFileSync(claudePath, "claude");
  writeFileSync(claudeAppPath, "claude desktop");
  writeFileSync(antigravityPath, "antigravity");
  writeFileSync(
    path.join(marketplaceRoot, ".agents", "plugins", "marketplace.json"),
    JSON.stringify({ name: "project-memory-desktop", plugins: [] }),
  );
  writeFileSync(
    path.join(marketplaceRoot, "plugins", "codex-project-memory", ".codex-plugin", "plugin.json"),
    JSON.stringify({ version: "2.0.0" }),
  );
  writeFileSync(
    path.join(marketplaceRoot, ".claude-plugin", "marketplace.json"),
    JSON.stringify({ name: "project-memory", plugins: [] }),
  );
  writeFileSync(
    path.join(marketplaceRoot, "adapters", "claude-code", ".claude-plugin", "plugin.json"),
    JSON.stringify({ version: "3.0.0" }),
  );
  return {
    root,
    homeDir,
    codexPath,
    claudePath,
    claudeAppPath,
    antigravityPath,
    marketplaceRoot,
  };
}

function runner(
  installed: { marketplaceName: string; version: string } | null,
  claudeInstalled: { marketplaceName: string; version: string } | null = null,
) {
  const calls: string[][] = [];
  const commandRunner = (_command: string, args: string[]): CommandResult => {
    calls.push(args);
    if (args[0] === "--version") {
      return { status: 0, stdout: "codex-cli 1.0.0\n", stderr: "" };
    }
    if (args.join(" ") === "plugin list --available --json") {
      return {
        status: 0,
        stdout: JSON.stringify({
          installed: installed
            ? [
                {
                  pluginId: `codex-project-memory@${installed.marketplaceName}`,
                  name: "codex-project-memory",
                  marketplaceName: installed.marketplaceName,
                  version: installed.version,
                  installed: true,
                },
              ]
            : [],
          available: [],
        }),
        stderr: "",
      };
    }
    if (args.join(" ") === "plugin list --json") {
      return {
        status: 0,
        stdout: JSON.stringify(
          claudeInstalled
            ? [
                {
                  id: `project-memory@${claudeInstalled.marketplaceName}`,
                  name: "project-memory",
                  marketplaceName: claudeInstalled.marketplaceName,
                  version: claudeInstalled.version,
                  scope: "user",
                },
              ]
            : [],
        ),
        stderr: "",
      };
    }
    return { status: 0, stdout: "{}", stderr: "" };
  };
  return { calls, commandRunner };
}

describe("desktop integration management", () => {
  test("does not expose Codex sandbox repair for Antigravity", () => {
    expect(statusActions("found", "installed")).toEqual(["remove", "rescan"]);
    expect(statusActions("found", "installed", "missing")).toContain("repair");
  });

  test("detects all products and reports absent managed plugins", () => {
    const paths = fixture();
    const fake = runner(null);
    const statuses = scanDesktopIntegrations({
      platform: "darwin",
      homeDir: paths.homeDir,
      codexPath: paths.codexPath,
      claudePath: paths.claudePath,
      antigravityPath: paths.antigravityPath,
      marketplaceRoot: paths.marketplaceRoot,
      commandRunner: fake.commandRunner,
      antigravity: {
        antigravityHome: path.join(paths.root, "gemini"),
        configHome: path.join(paths.root, "config"),
      },
    });
    expect(statuses[0]).toMatchObject({
      platform: "codex",
      productState: "found",
      integrationState: "absent",
      currentVersion: "2.0.0",
    });
    expect(statuses[1]).toMatchObject({
      platform: "claude",
      productState: "found",
      integrationState: "absent",
      currentVersion: "3.0.0",
    });
    expect(statuses[2]).toMatchObject({
      platform: "antigravity",
      productState: "found",
      integrationState: "absent",
    });
    expect(fake.calls.filter((args) => args[0] === "--version")).toHaveLength(2);
  });

  test("detects Claude Desktop Code mode when no Claude CLI is on PATH", () => {
    const paths = fixture();
    const fake = runner(null);
    const claude = scanDesktopIntegrations({
      platform: "darwin",
      homeDir: paths.homeDir,
      env: { PATH: path.join(paths.root, "empty-bin") },
      codexPath: paths.codexPath,
      claudeAppPath: paths.claudeAppPath,
      antigravityPath: paths.antigravityPath,
      marketplaceRoot: paths.marketplaceRoot,
      commandRunner: fake.commandRunner,
      claude: {
        claudeHome: path.join(paths.root, "claude-home"),
        configHome: path.join(paths.root, "config"),
      },
      antigravity: {
        antigravityHome: path.join(paths.root, "gemini"),
        configHome: path.join(paths.root, "config"),
      },
    })[1];

    expect(claude).toMatchObject({
      platform: "claude",
      productState: "found",
      executablePath: paths.claudeAppPath,
      integrationState: "absent",
    });
    expect(fake.calls.some((args) => args.join(" ") === "plugin list --json")).toBe(false);
  });

  test("detects Windows executables with PATHEXT and uses APPDATA for integration data", () => {
    const paths = fixture();
    const windowsBin = path.join(paths.root, "Windows Tools With Spaces");
    const windowsCodex = path.join(windowsBin, "codex.CMD");
    const windowsClaude = path.join(windowsBin, "claude.CMD");
    const windowsAntigravity = path.join(windowsBin, "Antigravity.exe");
    const appData = path.join(paths.root, "AppData", "Roaming");
    mkdirSync(windowsBin, { recursive: true });
    writeFileSync(windowsCodex, "codex");
    writeFileSync(windowsClaude, "claude");
    writeFileSync(windowsAntigravity, "antigravity");
    const fake = runner(null);
    const statuses = scanDesktopIntegrations({
      platform: "win32",
      homeDir: paths.homeDir,
      env: {
        PATH: `${path.join(paths.root, "Missing Tools")};${windowsBin}`,
        PATHEXT: ".COM;.EXE;.BAT;.CMD",
        APPDATA: appData,
      },
      marketplaceRoot: paths.marketplaceRoot,
      commandRunner: fake.commandRunner,
      antigravity: {
        antigravityHome: path.join(paths.root, "gemini"),
        configHome: path.join(paths.root, "config"),
      },
    });

    expect(statuses[0]?.executablePath?.toLocaleLowerCase()).toBe(windowsCodex.toLocaleLowerCase());
    expect(statuses[1]?.executablePath?.toLocaleLowerCase()).toBe(
      windowsClaude.toLocaleLowerCase(),
    );
    expect(statuses[2]?.executablePath?.toLocaleLowerCase()).toBe(
      windowsAntigravity.toLocaleLowerCase(),
    );
    expect(statuses[0]?.memoryDataRoot).toBe(path.join(appData, ".project-memory", "v1"));
    expect(fake.calls.filter((args) => args[0] === "--version")).toHaveLength(2);
  });

  test("detects the versioned CLI installed by Codex Desktop", () => {
    const paths = fixture();
    const localAppData = path.join(paths.root, "AppData", "Local");
    const desktopCodex = path.join(
      localAppData,
      "OpenAI",
      "Codex",
      "bin",
      "desktop-build",
      "codex.exe",
    );
    mkdirSync(path.dirname(desktopCodex), { recursive: true });
    writeFileSync(desktopCodex, "codex");
    const fake = runner(null);

    const codex = scanDesktopIntegrations({
      platform: "win32",
      homeDir: paths.homeDir,
      env: {
        PATH: path.join(paths.root, "empty-bin"),
        LOCALAPPDATA: localAppData,
      },
      marketplaceRoot: paths.marketplaceRoot,
      commandRunner: fake.commandRunner,
      antigravity: {
        antigravityHome: path.join(paths.root, "gemini"),
        configHome: path.join(paths.root, "config"),
      },
    })[0];

    expect(codex).toMatchObject({
      platform: "codex",
      productState: "found",
      executablePath: desktopCodex,
      productVersion: "codex-cli 1.0.0",
    });
  });

  test("detects Claude Desktop installed from the Microsoft Store", () => {
    const paths = fixture();
    const appxRoot = path.join(paths.root, "WindowsApps", "Claude_1.0.0.0_x64");
    const claudeApp = path.join(appxRoot, "app", "Claude.exe");
    mkdirSync(path.dirname(claudeApp), { recursive: true });
    writeFileSync(claudeApp, "claude desktop");
    const fake = runner(null);
    const commandRunner = (command: string, args: string[]): CommandResult => {
      if (command.toLocaleLowerCase() === "powershell.exe") {
        return { status: 0, stdout: `${appxRoot}\n`, stderr: "" };
      }
      return fake.commandRunner(command, args);
    };

    const claude = scanDesktopIntegrations({
      platform: "win32",
      homeDir: paths.homeDir,
      env: {
        PATH: path.join(paths.root, "empty-bin"),
        LOCALAPPDATA: path.join(paths.root, "AppData", "Local"),
      },
      marketplaceRoot: paths.marketplaceRoot,
      commandRunner,
      claude: {
        claudeHome: path.join(paths.root, "claude-home"),
        configHome: path.join(paths.root, "config"),
      },
      antigravity: {
        antigravityHome: path.join(paths.root, "gemini"),
        configHome: path.join(paths.root, "config"),
      },
    })[1];

    expect(claude).toMatchObject({
      platform: "claude",
      productState: "found",
      executablePath: claudeApp,
      integrationState: "absent",
    });
    expect(fake.calls.some((args) => args.join(" ") === "plugin list --json")).toBe(false);
  });

  test("installs and removes the managed Claude Code plugin at user scope", () => {
    const paths = fixture();
    const fake = runner(null);
    installDesktopIntegration("claude", {
      platform: "darwin",
      homeDir: paths.homeDir,
      claudePath: paths.claudePath,
      marketplaceRoot: paths.marketplaceRoot,
      commandRunner: fake.commandRunner,
    });
    expect(fake.calls).toContainEqual(["plugin", "marketplace", "add", paths.marketplaceRoot]);
    expect(fake.calls).toContainEqual([
      "plugin",
      "install",
      "project-memory@project-memory",
      "--scope",
      "user",
    ]);

    const installed = runner(null, { marketplaceName: "project-memory", version: "3.0.0" });
    removeDesktopIntegration("claude", {
      platform: "darwin",
      homeDir: paths.homeDir,
      claudePath: paths.claudePath,
      marketplaceRoot: paths.marketplaceRoot,
      commandRunner: installed.commandRunner,
    });
    expect(installed.calls).toContainEqual([
      "plugin",
      "uninstall",
      "project-memory@project-memory",
      "--scope",
      "user",
    ]);
  });

  test("marks plugins from another marketplace as external", () => {
    const paths = fixture();
    const fake = runner({ marketplaceName: "old-market", version: "1.0.0" });
    const codex = scanDesktopIntegrations({
      platform: "darwin",
      homeDir: paths.homeDir,
      codexPath: paths.codexPath,
      marketplaceRoot: paths.marketplaceRoot,
      commandRunner: fake.commandRunner,
      antigravity: {
        antigravityHome: path.join(paths.root, "gemini"),
        configHome: path.join(paths.root, "config"),
      },
    })[0];
    expect(codex).toMatchObject({
      integrationState: "external",
      managedBy: "external",
      externalPluginId: "codex-project-memory@old-market",
    });
  });

  test("treats adapter build metadata as compatible with the same base version", () => {
    const paths = fixture();
    writeFileSync(
      path.join(
        paths.marketplaceRoot,
        "plugins",
        "codex-project-memory",
        ".codex-plugin",
        "plugin.json",
      ),
      JSON.stringify({ version: "0.14.0" }),
    );
    const fake = runner({
      marketplaceName: "project-memory-desktop",
      version: "0.14.0+codex.20260808004353",
    });
    const codex = scanDesktopIntegrations({
      platform: "darwin",
      homeDir: paths.homeDir,
      codexPath: paths.codexPath,
      marketplaceRoot: paths.marketplaceRoot,
      version: "0.14.0",
      commandRunner: fake.commandRunner,
    })[0];
    expect(codex).toMatchObject({
      integrationState: "installed",
      installedVersion: "0.14.0+codex.20260808004353",
    });
  });

  test("repairs known broken Codex marketplace paths and retries inspection", () => {
    const paths = fixture();
    const codexHome = path.join(paths.homeDir, ".codex");
    const curatedRoot = path.join(paths.root, "codex-curated");
    const oldDesktopRoot = path.join(paths.root, "old-project-memory-marketplace");
    mkdirSync(path.join(codexHome), { recursive: true });
    mkdirSync(path.join(curatedRoot, ".agents", "plugins"), { recursive: true });
    mkdirSync(path.join(oldDesktopRoot, ".agents", "plugins"), { recursive: true });
    writeFileSync(
      path.join(curatedRoot, ".agents", "plugins", "marketplace.json"),
      JSON.stringify({ name: "openai-curated", plugins: [] }),
    );
    writeFileSync(
      path.join(oldDesktopRoot, ".agents", "plugins", "marketplace.json"),
      JSON.stringify({ name: "project-memory-desktop", plugins: [] }),
    );
    const malformedCuratedRoot = `\\\\?\\${curatedRoot}`;
    const configPath = path.join(codexHome, "config.toml");
    writeFileSync(
      configPath,
      [
        "[marketplaces.openai-curated]",
        'source_type = "local"',
        `source = '${malformedCuratedRoot}'`,
        "",
        "[marketplaces.project-memory-desktop]",
        'source_type = "local"',
        `source = ${JSON.stringify(oldDesktopRoot)}`,
        "",
      ].join("\n"),
    );

    const calls: string[][] = [];
    const commandRunner = (_command: string, args: string[]): CommandResult => {
      calls.push(args);
      if (args[0] === "--version") {
        return { status: 0, stdout: "codex-cli 1.0.0\n", stderr: "" };
      }
      if (args.join(" ") === "plugin list --available --json") {
        if (readFileSync(configPath, "utf8").includes(malformedCuratedRoot)) {
          return {
            status: 1,
            stdout: "",
            stderr: "marketplace root does not contain a supported manifest",
          };
        }
        return {
          status: 0,
          stdout: JSON.stringify({
            installed: [
              {
                pluginId: "codex-project-memory@project-memory-desktop",
                name: "codex-project-memory",
                marketplaceName: "project-memory-desktop",
                version: "2.0.0",
                installed: true,
              },
            ],
            available: [],
          }),
          stderr: "",
        };
      }
      return { status: 0, stdout: "{}", stderr: "" };
    };

    const codex = scanDesktopIntegrations({
      platform: "darwin",
      homeDir: paths.homeDir,
      codexPath: paths.codexPath,
      marketplaceRoot: paths.marketplaceRoot,
      commandRunner,
    })[0];

    expect(codex).toMatchObject({ integrationState: "installed", installedVersion: "2.0.0" });
    expect(
      calls.filter((args) => args.join(" ") === "plugin list --available --json"),
    ).toHaveLength(2);
    const repaired = readFileSync(configPath, "utf8");
    expect(repaired).toContain(`source = ${JSON.stringify(curatedRoot)}`);
    expect(repaired).toContain(`source = ${JSON.stringify(paths.marketplaceRoot)}`);
    expect(readFileSync(`${configPath}.project-memory-marketplace-backup`, "utf8")).toContain(
      malformedCuratedRoot,
    );
  });

  test("installs and removes the managed Codex selector", () => {
    const paths = fixture();
    const fake = runner(null);
    installDesktopIntegration("codex", {
      platform: "darwin",
      homeDir: paths.homeDir,
      codexPath: paths.codexPath,
      marketplaceRoot: paths.marketplaceRoot,
      commandRunner: fake.commandRunner,
    });
    expect(fake.calls).toContainEqual([
      "plugin",
      "marketplace",
      "add",
      paths.marketplaceRoot,
      "--json",
    ]);
    expect(readFileSync(path.join(paths.homeDir, ".codex", "config.toml"), "utf8")).toContain(
      JSON.stringify(path.join(paths.homeDir, ".project-memory", "v1")),
    );
    expect(fake.calls).toContainEqual([
      "plugin",
      "add",
      "codex-project-memory@project-memory-desktop",
      "--json",
    ]);

    const installed = runner({ marketplaceName: "project-memory-desktop", version: "2.0.0" });
    removeDesktopIntegration("codex", {
      platform: "darwin",
      homeDir: paths.homeDir,
      codexPath: paths.codexPath,
      marketplaceRoot: paths.marketplaceRoot,
      commandRunner: installed.commandRunner,
    });
    expect(installed.calls).toContainEqual([
      "plugin",
      "remove",
      "codex-project-memory@project-memory-desktop",
      "--json",
    ]);
  });
});
