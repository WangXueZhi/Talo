import { describe, expect, test } from "vitest";
import {
  buildGetResult,
  buildRecallResult,
  estimateTokens,
  rankMemories,
  temporarySummary,
  tokenizeRecallText,
} from "../src/retrieval.js";
import type { MemoryRecord, MemoryRelationRecord } from "../src/types.js";

const CURRENT_PROJECT = "project-current";

function memory(
  id: string,
  overrides: Partial<MemoryRecord> & Pick<MemoryRecord, "title" | "content">,
): MemoryRecord {
  const { title, content, ...rest } = overrides;
  return {
    id,
    projectId: CURRENT_PROJECT,
    projectName: "Test project",
    kind: "decision",
    title,
    summary: null,
    topic: null,
    briefRole: null,
    content,
    tags: [],
    sourceProjectId: null,
    sourcePath: null,
    sourceCommit: null,
    sourceFileHash: null,
    citations: [],
    confidence: "observed",
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    stale: false,
    staleReason: null,
    ...rest,
  };
}

function relation(fromMemoryId: string, toMemoryId: string): MemoryRelationRecord {
  return {
    id: `relation-${fromMemoryId}-${toMemoryId}`,
    ownerProjectId: CURRENT_PROJECT,
    fromMemoryId,
    fromProjectId: CURRENT_PROJECT,
    toMemoryId,
    toProjectId: CURRENT_PROJECT,
    type: "related_to",
    rationale: "Reviewed relation",
    confidence: "verified",
    sourceProposalId: "proposal",
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("token-aware retrieval", () => {
  test("tokenizes Chinese bigrams and normalized English, numbers, and paths", () => {
    expect(tokenizeRecallText("第一批货 Non-Ads report_v2/Final.md")).toEqual(
      expect.arrayContaining([
        "第一批货",
        "第一",
        "一批",
        "批货",
        "non",
        "ads",
        "report",
        "v2",
        "final",
        "md",
      ]),
    );
  });

  test("weights fields, exact phrases, confidence, staleness, and linked projects", () => {
    const records = [
      memory("title", { title: "release workflow", content: "unrelated" }),
      memory("summary", {
        title: "other",
        summary: "release workflow",
        content: "unrelated",
      }),
      memory("content", {
        title: "other",
        summary: "unrelated summary",
        content: "release workflow",
      }),
      memory("stale", {
        title: "release workflow",
        content: "unrelated",
        stale: true,
        staleReason: "source_file_changed",
      }),
      memory("linked", {
        projectId: "project-linked",
        projectName: "Linked",
        title: "release workflow",
        content: "unrelated",
      }),
      memory("verified", {
        title: "release workflow",
        content: "unrelated",
        confidence: "verified",
      }),
      memory("inferred", {
        title: "release workflow",
        content: "unrelated",
        confidence: "inferred",
      }),
    ];
    const ranked = rankMemories({
      currentProjectId: CURRENT_PROJECT,
      memories: records,
      relations: [],
      mode: "query",
      query: "release workflow",
    });
    const scores = new Map(ranked.map((entry) => [entry.memory.id, entry.score]));
    expect(scores.get("title")).toBeGreaterThan(scores.get("summary") ?? 0);
    expect(scores.get("summary")).toBeGreaterThan(scores.get("content") ?? 0);
    expect(scores.get("verified")).toBeGreaterThan(scores.get("title") ?? 0);
    expect(scores.get("title")).toBeGreaterThan(scores.get("inferred") ?? 0);
    expect(scores.get("title")).toBeGreaterThan(scores.get("linked") ?? 0);
    expect(scores.get("title")).toBeGreaterThan(scores.get("stale") ?? 0);
    expect(ranked.find((entry) => entry.memory.id === "title")?.matchReasons).toContain(
      "exact_phrase:title",
    );
  });

  test("adds at most ten percent for a matching reviewed neighbor", () => {
    const records = [
      memory("a", { title: "checkout architecture", content: "gateway" }),
      memory("b", { title: "checkout gateway", content: "architecture" }),
      memory("c", { title: "checkout architecture", content: "gateway" }),
    ];
    const withoutRelation = rankMemories({
      currentProjectId: CURRENT_PROJECT,
      memories: records,
      relations: [],
      mode: "query",
      query: "checkout architecture",
    });
    const withRelation = rankMemories({
      currentProjectId: CURRENT_PROJECT,
      memories: records,
      relations: [relation("a", "b")],
      mode: "query",
      query: "checkout architecture",
    });
    const base = withoutRelation.find((entry) => entry.memory.id === "a")?.score ?? 0;
    const boosted = withRelation.find((entry) => entry.memory.id === "a");
    expect(boosted?.score).toBeGreaterThan(base);
    expect(boosted?.score).toBeLessThanOrEqual(base * 1.1 + Number.EPSILON);
    expect(boosted?.matchReasons).toContain("reviewed_relation_neighbor");
  });

  test("sorts ties deterministically and returns no lexical results for an unrelated query", () => {
    const records = [
      memory("b", { title: "same", content: "same" }),
      memory("a", { title: "same", content: "same" }),
    ];
    expect(
      rankMemories({
        currentProjectId: CURRENT_PROJECT,
        memories: records,
        relations: [],
        mode: "query",
        query: "same",
      }).map((entry) => entry.memory.id),
    ).toEqual(["a", "b"]);
    expect(
      rankMemories({
        currentProjectId: CURRENT_PROJECT,
        memories: records,
        relations: [],
        mode: "query",
        query: "unmatched",
      }),
    ).toEqual([]);
  });

  test("uses a temporary excerpt for v1/v2 memories without a summary", () => {
    const record = memory("legacy", {
      title: "Legacy",
      content: `${"long content ".repeat(30)}end`,
    });
    expect(temporarySummary(record)).toHaveLength(220);
    expect(temporarySummary(record)).toMatch(/\.\.\.$/);
    expect(record.summary).toBeNull();
  });

  test("reserves ten percent for the envelope and omits whole items over budget", () => {
    const records = Array.from({ length: 12 }, (_, index) =>
      memory(`memory-${index.toString().padStart(2, "0")}`, {
        title: `release workflow ${index}`,
        summary: `Compact release summary ${index}`,
        content: "release workflow details",
      }),
    );
    const recall = buildRecallResult({
      currentProjectId: CURRENT_PROJECT,
      memories: records,
      relations: [],
      mode: "query",
      query: "release workflow",
      limit: 8,
      recommend: 3,
      budgetTokens: 800,
    });
    expect(recall.candidates.length).toBeLessThanOrEqual(8);
    expect(recall.recommendedMemoryIds.length).toBeLessThanOrEqual(3);
    expect(recall.estimatedTokens).toBeLessThanOrEqual(800);
    expect(recall.estimationNote).toContain("not billing");
    expect(recall.omissions.length).toBeGreaterThan(0);

    const oversized = memory("oversized", {
      title: "Oversized",
      content: "正".repeat(3000),
    });
    const small = memory("small", { title: "Small", content: "Short complete body." });
    const result = buildGetResult([oversized, small], 1700);
    expect(result.omittedMemoryIds).toContain("oversized");
    expect(result.memories.map((item) => item.id)).toEqual(["small"]);
    expect(result.memories[0]?.content).toBe("Short complete body.");
    expect(result.estimatedTokens).toBeLessThanOrEqual(1700);
    expect(recall.budgetTokens + result.budgetTokens).toBe(2500);
  });

  test("ranks the intended memory in the top three of a 100-item bilingual corpus", () => {
    const corpus = Array.from({ length: 100 }, (_, index) =>
      memory(`corpus-${index.toString().padStart(3, "0")}`, {
        title: index === 73 ? "第一批货非广告诊断结论" : `Routine project note ${index}`,
        summary:
          index === 73
            ? "第一批商品在不依赖广告指标时的诊断方法和结论。"
            : `General workflow checkpoint ${index}`,
        topic: index === 73 ? "第一批货诊断" : "General",
        content:
          index === 73
            ? "分析第一批货的自然流量、转化和库存证据。"
            : `Unrelated bilingual fixture 例行记录 ${index}`,
      }),
    );
    const result = buildRecallResult({
      currentProjectId: CURRENT_PROJECT,
      memories: corpus,
      relations: [],
      mode: "query",
      query: "第一批货非广告诊断",
      limit: 8,
      recommend: 3,
      budgetTokens: 800,
    });
    expect(result.recommendedMemoryIds).toContain("corpus-073");
  });

  test("token estimates distinguish CJK and non-CJK text", () => {
    expect(estimateTokens("中文测试")).toBe(4);
    expect(estimateTokens("abcd")).toBe(1);
  });
});
