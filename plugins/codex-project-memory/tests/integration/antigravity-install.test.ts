import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";

const cleanups: Array<() => void> = [];

afterEach(() => {
  while (cleanups.length > 0) cleanups.pop()?.();
});

function runJson(
  command: string,
  args: string[],
  env: NodeJS.ProcessEnv,
  input?: unknown,
): Record<string, unknown> {
  const result = spawnSync(process.execPath, [command, ...args], {
    encoding: "utf8",
    env: { ...process.env, ...env },
    input: input === undefined ? undefined : JSON.stringify(input),
  });
  if (result.status !== 0) throw new Error(result.stderr);
  return JSON.parse(result.stdout) as Record<string, unknown>;
}

describe("Antigravity installed Skill", () => {
  test("reads a project and memory registered through the Codex CLI", () => {
    const root = mkdtempSync(path.join(tmpdir(), "project-memory-antigravity-e2e-"));
    cleanups.push(() => rmSync(root, { recursive: true, force: true }));
    const pluginRoot = path.resolve(".");
    const cliPath = path.join(pluginRoot, "dist", "project-memory.mjs");
    const projectPath = path.join(root, "amazon-store");
    const dataDir = path.join(root, "shared-memory");
    const configHome = path.join(root, "project-memory-config");
    const antigravityHome = path.join(root, "gemini");
    mkdirSync(projectPath, { recursive: true });
    const env = {
      PROJECT_MEMORY_HOME: dataDir,
      PROJECT_MEMORY_CONFIG_HOME: configHome,
      PROJECT_MEMORY_ANTIGRAVITY_HOME: antigravityHome,
    };

    const installation = runJson(cliPath, ["integration", "install", "antigravity"], env);
    expect(installation).toMatchObject({ action: "installed", state: "installed" });

    const project = runJson(
      cliPath,
      ["register", "--path", projectPath, "--name", "Amazon Store"],
      env,
    );
    const proposal = runJson(cliPath, ["propose", "--path", projectPath], env, {
      actor: { platform: "codex", adapterVersion: "test" },
      candidates: [
        {
          ref: "amazon-ad-rule",
          kind: "workflow",
          title: "Amazon advertising review",
          summary: "Review Amazon advertising performance before changing bids.",
          topic: "Amazon operations",
          briefRole: "progress",
          narrative: {
            occurredAt: "2026-07-30T09:00:00.000Z",
            reason: "Advertising changes need a stable review workflow.",
            action: "Recorded the review order for campaigns and bids.",
            outcome: "The workflow is available to later tasks.",
            conclusion: "Review performance before changing bids.",
          },
          content: "Review campaign performance before changing Amazon advertising bids.",
          tags: ["amazon", "advertising"],
          confidence: "verified",
        },
      ],
    });
    const items = proposal.items as Array<{ id: string }>;
    runJson(
      cliPath,
      ["commit", "--proposal-id", proposal.id as string, "--accepted-item-ids", items[0]?.id ?? ""],
      env,
    );

    const installedWrapper = path.join(
      antigravityHome,
      "config",
      "skills",
      "project-memory",
      "scripts",
      "project-memory.mjs",
    );
    const detected = runJson(installedWrapper, ["detect", "--path", projectPath], env);
    expect((detected.registeredProject as { id: string }).id).toBe(project.id);
    const recalled = runJson(
      installedWrapper,
      ["recall", "--path", projectPath, "--query", "Amazon advertising bids"],
      env,
    );
    expect(recalled.recommendedMemoryIds).toHaveLength(1);

    const removed = runJson(cliPath, ["integration", "remove", "antigravity"], env);
    expect(removed).toMatchObject({ action: "removed", state: "absent" });
  });
});
