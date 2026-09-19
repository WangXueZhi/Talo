import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";

const cleanups: Array<() => void> = [];
afterEach(() => {
  while (cleanups.length > 0) cleanups.pop()?.();
});

function runCli(cwd: string, dataDir: string, args: string[], input?: unknown) {
  const result = spawnSync(process.execPath, [path.resolve("dist/project-memory.mjs"), ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, CODEX_PROJECT_MEMORY_HOME: dataDir },
    input: input === undefined ? undefined : JSON.stringify(input),
  });
  return { ...result, json: result.status === 0 ? JSON.parse(result.stdout) : null };
}

describe("Policy CLI", () => {
  test("supports machine-readable update and bridge status", () => {
    const root = mkdtempSync(path.join(tmpdir(), "talo-policy-cli-"));
    cleanups.push(() => rmSync(root, { recursive: true, force: true }));
    const project = path.join(root, "project");
    const data = path.join(root, "data");
    mkdirSync(project);
    const cwd = path.resolve(".");
    const registered = runCli(cwd, data, ["register", "--path", project]);
    const projectId = registered.json.id as string;
    const updated = runCli(cwd, data, ["policy", "update", "--project-id", projectId], {
      summary: "CLI policy",
      rules: [
        {
          id: "cli",
          triggerTopics: [],
          requiredActions: ["run tests"],
          forbiddenActions: [],
          priority: 1,
        },
      ],
      actor: { platform: "codex", adapterVersion: "test" },
    });
    expect(updated.status).toBe(0);
    const enabled = runCli(cwd, data, [
      "integration",
      "enable",
      "--project-id",
      projectId,
      "--confirm",
      "true",
    ]);
    expect(enabled.status).toBe(0);
    expect(existsSync(path.join(project, "AGENTS.md"))).toBe(true);
    const status = runCli(cwd, data, ["integration", "status", "--project-id", projectId]);
    expect(status.status).toBe(0);
    expect(status.json.policy.status).toBe("effective");
    expect(readFileSync(path.join(project, "AGENTS.md"), "utf8")).toContain("Policy version: 1");
  });
});
