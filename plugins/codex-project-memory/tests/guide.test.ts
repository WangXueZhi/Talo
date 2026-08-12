import { describe, expect, test } from "vitest";
import { analyzeKnowledgeGraph } from "../src/guide.js";
import type { CitationRole, MemoryRecord, MemoryRelationRecord } from "../src/types.js";

const projectId = "amazon-project";

function citation(sourcePath: string, role: CitationRole = "reference") {
  return {
    sourceProjectId: projectId,
    sourceProjectName: "示例电商项目",
    sourcePath,
    role,
    locator: null,
    note: null,
    sourceCommit: null,
    sourceFileHash: `hash:${sourcePath}`,
    stale: false,
    staleReason: null,
    accessible: true,
    fileUrl: null,
  };
}

function memory(id: string, overrides: Partial<MemoryRecord> = {}): MemoryRecord {
  return {
    id,
    projectId,
    projectName: "示例电商项目",
    kind: "decision",
    title: `记忆 ${id}`,
    summary: `记忆 ${id} 摘要`,
    topic: "第一批货诊断",
    briefRole: null,
    content: `记忆 ${id} 内容`,
    tags: [],
    sourceProjectId: null,
    sourcePath: null,
    sourceCommit: null,
    sourceFileHash: null,
    citations: [],
    confidence: "verified",
    status: "active",
    createdAt: "2026-07-14T00:00:00.000Z",
    updatedAt: "2026-07-14T00:00:00.000Z",
    stale: false,
    staleReason: null,
    ...overrides,
  };
}

function relation(fromMemoryId: string, toMemoryId: string): MemoryRelationRecord {
  return {
    id: `relation:${fromMemoryId}:${toMemoryId}`,
    ownerProjectId: projectId,
    fromMemoryId,
    fromProjectId: projectId,
    toMemoryId,
    toProjectId: projectId,
    type: "supports",
    rationale: "已审核关系",
    confidence: "verified",
    sourceProposalId: "proposal",
    status: "active",
    createdAt: "2026-07-14T00:00:00.000Z",
    updatedAt: "2026-07-14T00:00:00.000Z",
  };
}

describe("knowledge graph guide", () => {
  test("summarizes components, isolated memories, highlights, and stale evidence", () => {
    const memories = [
      memory("a", { citations: [citation("a.csv", "evidence"), citation("report.md", "report")] }),
      memory("b", { updatedAt: "2026-07-14T03:00:00.000Z", citations: [citation("b.csv")] }),
      memory("c", {
        stale: true,
        staleReason: "来源变化",
        citations: [{ ...citation("old.csv", "evidence"), stale: true, staleReason: "哈希变化" }],
      }),
      memory("d"),
      memory("e"),
    ];
    const guide = analyzeKnowledgeGraph(projectId, "示例电商项目", {
      nodes: memories,
      relations: [relation("a", "b")],
    });
    expect(guide.summary).toMatchObject({
      memoryCount: 5,
      formalRelationCount: 1,
      citationCount: 4,
      staleMemoryCount: 1,
      staleCitationCount: 1,
      componentCount: 4,
      isolatedCount: 3,
    });
    expect(
      guide.highlights.some((item) => item.kind === "connected" && item.memoryId === "a"),
    ).toBe(true);
    expect(guide.highlights.some((item) => item.kind === "recent" && item.memoryId === "b")).toBe(
      true,
    );
    expect(guide.gaps.filter((item) => item.kind === "isolated")).toHaveLength(3);
    expect(
      guide.gaps.some((item) => item.kind === "stale_citation" && item.memoryIds[0] === "c"),
    ).toBe(true);
  });

  test("suppresses ubiquitous citations and existing formal endpoint pairs", () => {
    const common = citation("reports/final-report.md", "report");
    const memories = Array.from({ length: 5 }, (_, index) =>
      memory(String(index), { topic: `主题 ${index}`, citations: [common] }),
    );
    const empty = analyzeKnowledgeGraph(projectId, "示例电商项目", {
      nodes: memories,
      relations: [],
    });
    expect(empty.relationSuggestions).toHaveLength(0);

    memories[0] = memory("0", { topic: "共同主题", citations: [common] });
    memories[1] = memory("1", { topic: "共同主题", citations: [common] });
    const withFormal = analyzeKnowledgeGraph(projectId, "示例电商项目", {
      nodes: memories,
      relations: [relation("0", "1")],
    });
    expect(
      withFormal.relationSuggestions.some(
        (item) => item.fromMemoryId === "0" && item.toMemoryId === "1",
      ),
    ).toBe(false);
  });

  test("uses rare tags and stable signal hashes, then enforces the requested limit", () => {
    const memories = [
      memory("a", { topic: null, tags: ["rare-one", "rare-two", "global"] }),
      memory("b", { topic: null, tags: ["rare-one", "rare-two", "global"] }),
      memory("c", { topic: "T", tags: ["global"] }),
      memory("d", { topic: "T", tags: ["global"] }),
      memory("e", { topic: "T", tags: ["global"] }),
    ];
    const first = analyzeKnowledgeGraph(
      projectId,
      "示例电商项目",
      { nodes: memories, relations: [] },
      "2026-07-14T00:00:00.000Z",
      2,
    );
    const second = analyzeKnowledgeGraph(
      projectId,
      "示例电商项目",
      { nodes: [...memories].reverse(), relations: [] },
      "2026-07-14T01:00:00.000Z",
      2,
    );
    expect(first.relationSuggestions).toHaveLength(2);
    expect(first.relationSuggestions.map((item) => item.id)).toEqual(
      second.relationSuggestions.map((item) => item.id),
    );
    const rareTagCandidate = first.relationSuggestions.find(
      (item) => item.fromMemoryId === "a" && item.toMemoryId === "b",
    );
    expect(rareTagCandidate?.score).toBe(2);
    expect(rareTagCandidate?.signals.map((signal) => signal.kind)).toEqual([
      "shared_tag",
      "shared_tag",
    ]);
  });

  test("keeps the Amazon 5/1/25/3 baseline sparse when every memory cites the final report", () => {
    const commonReport = citation("reports/final.html", "report");
    const memories = Array.from({ length: 5 }, (_, index) => {
      const id = String(index + 1);
      const citations = [
        commonReport,
        citation(`evidence/${id}-a.csv`, "evidence"),
        citation(`evidence/${id}-b.csv`, "evidence"),
        citation(`workflow/${id}.ts`, "workflow"),
        citation(`reference/${id}.md`, "reference"),
      ];
      return memory(id, { topic: `主题 ${id}`, citations });
    });
    memories[1] = memory("2", {
      topic: "主题 2",
      citations: [
        commonReport,
        citation("evidence/1-a.csv", "evidence"),
        citation("evidence/2-b.csv", "evidence"),
        citation("workflow/2.ts", "workflow"),
        citation("reference/2.md", "reference"),
      ],
    });
    const guide = analyzeKnowledgeGraph(projectId, "示例电商项目", {
      nodes: memories,
      relations: [relation("1", "2")],
    });
    expect(guide.summary).toMatchObject({
      memoryCount: 5,
      formalRelationCount: 1,
      citationCount: 25,
      isolatedCount: 3,
    });
    expect(guide.relationSuggestions).toHaveLength(0);
    expect(
      guide.relationSuggestions
        .flatMap((item) => item.signals)
        .some((signal) => signal.sourcePath?.endsWith("reports/final.html")),
    ).toBe(false);
  });
});
