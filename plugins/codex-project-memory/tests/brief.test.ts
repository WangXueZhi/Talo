import { describe, expect, test } from "vitest";
import { buildProjectBrief, resolvedBriefRole } from "../src/brief.js";
import type { GraphGuide, MemoryRecord } from "../src/types.js";

function memory(id: string, overrides: Partial<MemoryRecord> = {}): MemoryRecord {
  return {
    id,
    projectId: "project",
    projectName: "示例项目",
    kind: "status",
    title: `记忆 ${id}`,
    summary: `摘要 ${id}`,
    topic: null,
    briefRole: null,
    content: `内容 ${id}`,
    tags: [],
    sourceProjectId: null,
    sourcePath: null,
    sourceCommit: null,
    sourceFileHash: null,
    citations: [],
    confidence: "verified",
    status: "active",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    stale: false,
    staleReason: null,
    ...overrides,
  };
}

function guide(overrides: Partial<GraphGuide> = {}): GraphGuide {
  return {
    projectId: "project",
    projectName: "示例项目",
    generatedAt: "2026-07-20T00:00:00.000Z",
    summary: {
      memoryCount: 0,
      formalRelationCount: 0,
      citationCount: 0,
      staleMemoryCount: 0,
      staleCitationCount: 0,
      componentCount: 0,
      isolatedCount: 0,
    },
    topics: [],
    highlights: [],
    gaps: [],
    suggestedQuestions: [],
    relationSuggestions: [],
    ...overrides,
  };
}

describe("project brief", () => {
  test("prefers reviewed roles and deterministically classifies legacy memories", () => {
    expect(resolvedBriefRole(memory("decision", { kind: "decision" }))).toEqual({
      role: "conclusion",
      source: "inferred",
    });
    expect(resolvedBriefRole(memory("workflow", { kind: "workflow" })).role).toBe("progress");
    expect(resolvedBriefRole(memory("pitfall", { kind: "pitfall" })).role).toBe("risk");
    expect(
      resolvedBriefRole(memory("reviewed", { kind: "status", briefRole: "next_step" })),
    ).toEqual({ role: "next_step", source: "reviewed" });
  });

  test("builds fixed sections, deduplicates recommendations, and hides singleton topics", () => {
    const memories = [
      memory("conclusion", { kind: "decision", topic: "共同主题" }),
      memory("progress", { kind: "workflow", topic: "共同主题" }),
      memory("risk", { kind: "pitfall", topic: "单独主题" }),
      memory("next", { briefRole: "next_step", updatedAt: "2026-07-02T00:00:00.000Z" }),
    ];
    const result = buildProjectBrief(
      "project",
      "示例项目",
      { nodes: memories },
      guide({
        highlights: [
          {
            id: "connected",
            kind: "connected",
            memoryId: "conclusion",
            title: "记忆 conclusion",
            reason: "关系最完整",
            value: 2,
          },
          {
            id: "evidence",
            kind: "evidence",
            memoryId: "conclusion",
            title: "记忆 conclusion",
            reason: "来源最完整",
            value: 3,
          },
        ],
      }),
      "2026-07-20T00:00:00.000Z",
    );

    expect(result.currentConclusions.map((item) => item.memoryId)).toEqual(["conclusion"]);
    expect(result.completedWork.map((item) => item.memoryId)).toEqual(["progress"]);
    expect(result.risks.map((item) => item.memoryId)).toEqual(["risk"]);
    expect(result.nextSteps.map((item) => item.memoryId)).toEqual(["next"]);
    expect(result.systemSuggestions).toEqual([]);
    expect(result.recommendedReading).toEqual([
      {
        displayTitle: "已确认：共同主题",
        memoryId: "conclusion",
        title: "记忆 conclusion",
        reasons: ["关系最完整", "来源最完整"],
      },
    ]);
    expect(result.topics).toEqual([
      { name: "共同主题", memoryIds: ["conclusion", "progress"], memoryCount: 2 },
    ]);
  });

  test("separates unreviewed system suggestions from confirmed next steps", () => {
    const result = buildProjectBrief(
      "project",
      "示例项目",
      { nodes: [memory("risk", { kind: "pitfall" })] },
      guide(),
      "2026-07-20T00:00:00.000Z",
    );
    expect(result.nextSteps).toEqual([]);
    expect(result.systemSuggestions).toMatchObject([
      {
        id: "suggestion:resolve-risk:risk",
        memoryIds: ["risk"],
      },
    ]);
  });

  test("builds a handoff timeline from reviewed narratives and never invents old work details", () => {
    const complete = memory("complete", {
      kind: "workflow",
      briefRole: "progress",
      narrative: {
        occurredAt: "2026-07-18T09:00:00.000Z",
        reason: "需要核对数据范围",
        action: "整理并核验商品数据",
        outcome: "生成核验报告",
        conclusion: "诊断可以基于已核验的数据继续进行",
        outputs: [],
      },
    });
    const next = memory("next", {
      briefRole: "next_step",
      narrative: {
        occurredAt: "2026-07-19T09:00:00.000Z",
        reason: "诊断已经完成",
        action: "复核后续动作",
        outcome: "待执行清单",
        conclusion: "需要确认执行计划",
        outputs: [],
      },
    });
    const legacy = memory("legacy", { kind: "status", updatedAt: "2026-07-20T00:00:00.000Z" });
    const result = buildProjectBrief(
      "project",
      "示例项目",
      { nodes: [legacy, complete, next] },
      guide(),
    );
    expect(result.handoff.startHere[0]).toMatchObject({
      memoryId: "next",
      reason: "这是当前已确认要做的事。",
    });
    expect(result.handoff.recentWork.map((item) => item.memoryId)).toEqual([
      "next",
      "complete",
      "legacy",
    ]);
    expect(result.handoff.history.find((item) => item.memoryId === "legacy")?.isLegacy).toBe(true);
    expect(result.handoff.coverage).toContain("根据已保存记录整理");
  });
});
