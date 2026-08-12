import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { ProjectMemoryError } from "../../../packages/project-memory-core/src/errors.js";
import {
  type AntigravityIntegrationOptions,
  antigravityIntegrationStatus,
  claudeIntegrationStatus,
  installAntigravityIntegration,
  installClaudeIntegration,
  removeAntigravityIntegration,
  removeClaudeIntegration,
} from "../../../packages/project-memory-core/src/integration.js";

const cleanups: Array<() => void> = [];

afterEach(() => {
  while (cleanups.length > 0) cleanups.pop()?.();
});

function fixture(version = "test-1"): { root: string; options: AntigravityIntegrationOptions } {
  const root = mkdtempSync(path.join(tmpdir(), "project-memory-integration-"));
  cleanups.push(() => rmSync(root, { recursive: true, force: true }));
  const sourceSkillDir = path.join(root, "source", "project-memory");
  const sourceCliPath = path.join(root, "source", "dist", "project-memory.mjs");
  const sourceBrowserDir = path.join(root, "source", "dist", "browser");
  mkdirSync(path.join(sourceSkillDir, "scripts"), { recursive: true });
  mkdirSync(path.join(sourceSkillDir, "agents"), { recursive: true });
  mkdirSync(sourceBrowserDir, { recursive: true });
  writeFileSync(path.join(sourceSkillDir, "SKILL.md"), "---\nname: project-memory\n---\n");
  writeFileSync(
    path.join(sourceSkillDir, "scripts", "project-memory.mjs"),
    [
      'import { existsSync } from "node:fs";',
      'import path from "node:path";',
      'import { fileURLToPath } from "node:url";',
      'import { spawnSync } from "node:child_process";',
      "const skillDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));",
      'const cliPath = path.join(skillDir, "bin", "project-memory.mjs");',
      "if (!existsSync(cliPath)) process.exit(2);",
      'const result = spawnSync(process.execPath, [cliPath, ...process.argv.slice(2)], { stdio: "inherit" });',
      "process.exitCode = result.status ?? 1;",
      "",
    ].join("\n"),
  );
  writeFileSync(path.join(sourceSkillDir, "agents", "openai.yaml"), "policy: {}\n");
  mkdirSync(path.dirname(sourceCliPath), { recursive: true });
  writeFileSync(
    sourceCliPath,
    "#!/usr/bin/env node\nprocess.stdout.write(JSON.stringify({ args: process.argv.slice(2) }));\n",
  );
  writeFileSync(path.join(sourceBrowserDir, "graph-app.js"), "console.log('fixture');\n");
  writeFileSync(path.join(sourceBrowserDir, "graph-app.css"), ":root {}\n");
  return {
    root,
    options: {
      antigravityHome: path.join(root, "gemini"),
      configHome: path.join(root, "project-memory"),
      sourceSkillDir,
      sourceCliPath,
      sourceBrowserDir,
      version,
    },
  };
}

describe("Antigravity integration management", () => {
  test("installs a self-contained Skill idempotently and preserves global rules", () => {
    const { root, options } = fixture();
    const rulePath = path.join(root, "gemini", "GEMINI.md");
    mkdirSync(path.dirname(rulePath), { recursive: true });
    writeFileSync(rulePath, "# Existing rules\n");

    const installed = installAntigravityIntegration(options);
    expect(installed).toMatchObject({ action: "installed", changed: true, restartRequired: true });
    expect(antigravityIntegrationStatus(options)).toMatchObject({
      state: "installed",
      version: "test-1",
    });
    const skillPath = path.join(root, "gemini", "config", "skills", "project-memory");
    expect(existsSync(path.join(skillPath, "bin", "project-memory.mjs"))).toBe(true);
    expect(readFileSync(rulePath, "utf8")).toContain("# Existing rules");
    expect(readFileSync(rulePath, "utf8").match(/<!-- project-memory:start -->/g)).toHaveLength(1);

    const wrapper = spawnSync(
      process.execPath,
      [path.join(skillPath, "scripts", "project-memory.mjs"), "detect"],
      {
        encoding: "utf8",
      },
    );
    expect(wrapper.status).toBe(0);
    expect(JSON.parse(wrapper.stdout)).toEqual({ args: ["detect"] });

    const unchanged = installAntigravityIntegration(options);
    expect(unchanged).toMatchObject({
      action: "unchanged",
      changed: false,
      restartRequired: false,
    });

    const removed = removeAntigravityIntegration(options);
    expect(removed).toMatchObject({ action: "removed", changed: true, restartRequired: true });
    expect(readFileSync(rulePath, "utf8")).toBe("# Existing rules\n");
    expect(antigravityIntegrationStatus(options).state).toBe("absent");
  });

  test("updates an unchanged managed installation", () => {
    const { options } = fixture("test-1");
    installAntigravityIntegration(options);
    writeFileSync(
      options.sourceCliPath as string,
      "#!/usr/bin/env node\nprocess.stdout.write('updated');\n",
    );
    const updated = installAntigravityIntegration({ ...options, version: "test-2" });
    expect(updated).toMatchObject({ action: "updated", changed: true });
    expect(antigravityIntegrationStatus({ ...options, version: "test-2" })).toMatchObject({
      state: "installed",
      version: "test-2",
    });
  });

  test("refuses to overwrite an unmanaged Skill", () => {
    const { root, options } = fixture();
    const skillPath = path.join(root, "gemini", "config", "skills", "project-memory");
    mkdirSync(skillPath, { recursive: true });
    writeFileSync(path.join(skillPath, "user.txt"), "keep me\n");

    expect(() => installAntigravityIntegration(options)).toThrowError(ProjectMemoryError);
    try {
      installAntigravityIntegration(options);
    } catch (error) {
      expect(error).toMatchObject({ code: "INTEGRATION_CONFLICT" });
    }
    expect(readFileSync(path.join(skillPath, "user.txt"), "utf8")).toBe("keep me\n");
  });

  test("refuses to remove a managed Skill after user modification", () => {
    const { root, options } = fixture();
    installAntigravityIntegration(options);
    const skillFile = path.join(root, "gemini", "config", "skills", "project-memory", "SKILL.md");
    writeFileSync(skillFile, `${readFileSync(skillFile, "utf8")}user edit\n`);

    expect(antigravityIntegrationStatus(options).state).toBe("conflict");
    expect(() => removeAntigravityIntegration(options)).toThrowError(ProjectMemoryError);
    expect(existsSync(skillFile)).toBe(true);
  });
});

describe("Claude Desktop integration management", () => {
  test("installs and removes a managed user-level Skill without a CLI", () => {
    const { root, options } = fixture();
    const claudeOptions = {
      claudeHome: path.join(root, "claude"),
      configHome: options.configHome,
      sourceSkillDir: options.sourceSkillDir,
      sourceCliPath: options.sourceCliPath,
      sourceBrowserDir: options.sourceBrowserDir,
      version: options.version,
    };

    expect(installClaudeIntegration(claudeOptions)).toMatchObject({
      action: "installed",
      changed: true,
      restartRequired: true,
    });
    const skillPath = path.join(root, "claude", "skills", "project-memory");
    expect(existsSync(path.join(skillPath, "bin", "project-memory.mjs"))).toBe(true);
    expect(claudeIntegrationStatus(claudeOptions)).toMatchObject({
      state: "installed",
      version: "test-1",
    });
    expect(removeClaudeIntegration(claudeOptions)).toMatchObject({
      action: "removed",
      changed: true,
    });
    expect(claudeIntegrationStatus(claudeOptions).state).toBe("absent");
  });
});
