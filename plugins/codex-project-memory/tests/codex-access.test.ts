import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import {
  ensureCodexMemoryAccess,
  inspectCodexMemoryAccess,
} from "../../../packages/project-memory-core/src/codex-access.js";

const cleanups: string[] = [];

afterEach(() => {
  while (cleanups.length > 0) rmSync(cleanups.pop() as string, { recursive: true, force: true });
});

function fixture(config = "") {
  const root = mkdtempSync(path.join(tmpdir(), "project-memory-codex-access-"));
  cleanups.push(root);
  const homeDir = path.join(root, "home");
  const configPath = path.join(homeDir, ".codex", "config.toml");
  const dataRoot = path.join(homeDir, ".project-memory", "v1");
  if (config) {
    mkdirSync(path.dirname(configPath), { recursive: true });
    writeFileSync(configPath, config);
  }
  return { homeDir, configPath, dataRoot };
}

describe("Codex Talo sandbox access", () => {
  test("creates a minimal writable root configuration", () => {
    const paths = fixture();
    const result = ensureCodexMemoryAccess({ ...paths, platform: "linux" });
    expect(result).toMatchObject({ state: "configured", changed: true, restartRequired: true });
    expect(readFileSync(paths.configPath, "utf8")).toContain(
      `writable_roots = [${JSON.stringify(paths.dataRoot)}]`,
    );
    expect(readFileSync(result.launcherPath, "utf8")).toContain("Talo.app");
    expect(readFileSync(result.launcherPath, "utf8")).toContain("Project Memory.app");
    expect(readFileSync(result.rulesPath, "utf8")).toContain('"detect"');
    expect(readFileSync(result.rulesPath, "utf8")).not.toContain('"forget"');
    expect(inspectCodexMemoryAccess({ ...paths, platform: "linux" }).state).toBe("configured");
  });

  test("preserves existing settings and appends to writable roots", () => {
    const paths = fixture(
      `model = "gpt-5.5"\n\n[sandbox_workspace_write]\nwritable_roots = ["/tmp/shared"]\n`,
    );
    const result = ensureCodexMemoryAccess(paths);
    const config = readFileSync(paths.configPath, "utf8");
    expect(result.backupPath).toBe(`${paths.configPath}.project-memory-backup`);
    expect(config).toContain('model = "gpt-5.5"');
    expect(config).toContain('"/tmp/shared"');
    expect(config).toContain(JSON.stringify(paths.dataRoot));
  });

  test("supports dotted writable root configuration and is idempotent", () => {
    const paths = fixture(
      `sandbox_workspace_write.writable_roots = [${JSON.stringify("/tmp/shared")}]\n`,
    );
    expect(ensureCodexMemoryAccess(paths).changed).toBe(true);
    expect(ensureCodexMemoryAccess(paths).changed).toBe(false);
    const config = readFileSync(paths.configPath, "utf8");
    expect(config.split(JSON.stringify(paths.dataRoot))).toHaveLength(2);
  });

  test("repairs a stale managed launcher after the desktop app is renamed", () => {
    const paths = fixture();
    const installed = ensureCodexMemoryAccess({ ...paths, platform: "linux" });
    writeFileSync(
      installed.launcherPath,
      "#!/bin/sh\nexec '/Applications/Project Memory.app/Contents/MacOS/project-memory-node' \"$@\"\n",
    );

    expect(inspectCodexMemoryAccess({ ...paths, platform: "linux" }).state).toBe("missing");
    const repaired = ensureCodexMemoryAccess({ ...paths, platform: "linux" });
    expect(repaired).toMatchObject({ state: "configured", changed: true });
    expect(readFileSync(repaired.launcherPath, "utf8")).toContain("/Applications/Talo.app");
    expect(inspectCodexMemoryAccess({ ...paths, platform: "linux" }).state).toBe("configured");
  });

  test("uses a Windows cmd launcher and removes the legacy shell launcher", () => {
    const paths = fixture();
    const legacyPath = path.join(paths.homeDir, ".project-memory", "bin", "project-memory");
    mkdirSync(path.dirname(legacyPath), { recursive: true });
    writeFileSync(legacyPath, "#!/bin/sh\nexec node project-memory.mjs\n");

    const installed = ensureCodexMemoryAccess({
      ...paths,
      platform: "win32",
      nodePath: "C:\\Program Files\\nodejs\\node.exe",
      cliPath: "C:\\Talo\\project-memory.mjs",
    });

    expect(installed.launcherPath).toBe(
      path.join(paths.homeDir, ".project-memory", "bin", "project-memory.cmd"),
    );
    expect(readFileSync(installed.launcherPath, "utf8")).toBe(
      '@echo off\r\n"C:\\Program Files\\nodejs\\node.exe" "C:\\Talo\\project-memory.mjs" %*\r\n',
    );
    expect(existsSync(legacyPath)).toBe(false);
    expect(readFileSync(installed.rulesPath, "utf8")).toContain(
      JSON.stringify(installed.launcherPath),
    );
    expect(
      inspectCodexMemoryAccess({
        ...paths,
        platform: "win32",
        nodePath: "C:\\Program Files\\nodejs\\node.exe",
        cliPath: "C:\\Talo\\project-memory.mjs",
      }).state,
    ).toBe("configured");
  });

  test("adds the key to an existing sandbox table without duplicating it", () => {
    const paths = fixture(`[sandbox_workspace_write]\nnetwork_access = false\n`);
    ensureCodexMemoryAccess(paths);
    const config = readFileSync(paths.configPath, "utf8");
    expect(config.match(/\[sandbox_workspace_write\]/g)).toHaveLength(1);
    expect(config).toContain(`writable_roots = [${JSON.stringify(paths.dataRoot)}]`);
    expect(config).toContain("network_access = false");
  });

  test("fails safely for non-array writable roots", () => {
    const paths = fixture(`[sandbox_workspace_write]\nwritable_roots = "all"\n`);
    expect(inspectCodexMemoryAccess(paths).state).toBe("conflict");
    expect(() => ensureCodexMemoryAccess(paths)).toThrow(/字符串数组|cannot be updated safely/);
  });
});
