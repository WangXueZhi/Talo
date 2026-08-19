import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { loadLocalConfig, setReviewPolicy } from "../src/paths.js";
import { ProjectMemoryService } from "../src/service.js";
import { MemoryStore } from "../src/store.js";
import { createTestContext, makeProject } from "./helpers.js";

const cleanups: Array<() => void> = [];

afterEach(() => {
  while (cleanups.length > 0) cleanups.pop()?.();
});

function smartService(dataDir: string): { service: ProjectMemoryService; store: MemoryStore } {
  setReviewPolicy(dataDir, "smart");
  const store = new MemoryStore(dataDir);
  return { service: new ProjectMemoryService(store, dataDir), store };
}

describe("memory review policy", () => {
  test("persists smart mode without discarding other local config", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    writeFileSync(
      path.join(context.dataDir, "config.json"),
      `${JSON.stringify({ denyPatterns: ["private/**"] }, null, 2)}\n`,
    );

    expect(setReviewPolicy(context.dataDir, "smart")).toEqual({
      denyPatterns: ["private/**"],
      reviewPolicy: "smart",
    });
    expect(loadLocalConfig(context.dataDir).reviewPolicy).toBe("smart");
    expect(JSON.parse(readFileSync(path.join(context.dataDir, "config.json"), "utf8"))).toEqual({
      denyPatterns: ["private/**"],
      reviewPolicy: "smart",
    });
  });

  test("automatically commits a bounded same-project proposal", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectPath = makeProject(context.root, "smart-project");
    const project = context.service.registerProject(projectPath);
    context.service.store.close();
    const smart = smartService(context.dataDir);
    cleanups.push(() => smart.store.close());

    const result = smart.service.proposeMemory(
      project.id,
      [
        {
          kind: "status",
          title: "Smart save enabled",
          content: "Low-risk project progress can be saved without a second prompt.",
          confidence: "observed",
        },
      ],
      [],
      [],
      { platform: "codex", adapterVersion: "test" },
    );

    expect(result.autoReview).toMatchObject({
      policy: "smart",
      outcome: "auto_committed",
      reasons: [],
    });
    expect(result.autoReview.committedMemoryIds).toHaveLength(1);
    expect(smart.service.store.countPendingProposals(project.id)).toBe(0);
    expect(smart.service.getContext(project.id)).toHaveLength(1);
  });

  test("keeps inferred or ungrounded high-impact changes pending", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectPath = makeProject(context.root, "guarded-project");
    const project = context.service.registerProject(projectPath);
    context.service.store.close();
    const smart = smartService(context.dataDir);
    cleanups.push(() => smart.store.close());

    const inferred = smart.service.proposeMemory(
      project.id,
      [
        {
          kind: "status",
          title: "Possible future direction",
          content: "The project may adopt a different runtime.",
          confidence: "inferred",
        },
      ],
      [],
      [],
      { platform: "codex", adapterVersion: "test" },
    );
    const decision = smart.service.proposeMemory(
      project.id,
      [
        {
          kind: "decision",
          title: "Replace the runtime",
          content: "The project will replace the runtime without cited evidence.",
          confidence: "verified",
        },
      ],
      [],
      [],
      { platform: "codex", adapterVersion: "test" },
    );

    expect(inferred.autoReview).toMatchObject({
      outcome: "pending",
      reasons: ["inferred_memory"],
    });
    expect(decision.autoReview).toMatchObject({
      outcome: "pending",
      reasons: ["ungrounded_high_impact_memory"],
    });
    expect(smart.service.store.countPendingProposals(project.id)).toBe(2);
    expect(smart.service.getContext(project.id)).toHaveLength(0);
  });

  test("keeps updates to existing memory pending", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectPath = makeProject(context.root, "update-project");
    const project = context.service.registerProject(projectPath);
    const initial = context.service.proposeMemory(project.id, [
      {
        kind: "status",
        title: "Initial status",
        content: "The initial state is recorded.",
      },
    ]);
    const memory = context.service.commitMemory(initial.id, [initial.items[0]?.id ?? ""])
      .memories[0];
    context.service.store.close();
    const smart = smartService(context.dataDir);
    cleanups.push(() => smart.store.close());

    const update = smart.service.proposeMemory(
      project.id,
      [],
      [],
      [{ memoryId: memory?.id ?? "", summary: "Updated summary" }],
      { platform: "codex", adapterVersion: "test" },
    );

    expect(update.autoReview).toMatchObject({
      outcome: "pending",
      reasons: expect.arrayContaining(["no_new_memory", "updates_existing_memory"]),
    });
  });
});
