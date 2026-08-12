import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import type { MemoryRelationCandidate, RelationType } from "../src/types.js";
import { createTestContext, makeProject } from "./helpers.js";

const cleanups: Array<() => void> = [];

afterEach(() => {
  while (cleanups.length > 0) cleanups.pop()?.();
});

describe("memory knowledge graph", () => {
  test("commits all fixed relation types and resolves same-proposal candidate refs", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const project = context.service.registerProject(makeProject(context.root, "graph-project"));
    const types: RelationType[] = [
      "related_to",
      "observes",
      "causes",
      "depends_on",
      "supports",
      "contradicts",
      "supersedes",
      "derived_from",
    ];
    const candidates = Array.from({ length: types.length + 1 }, (_, index) => ({
      ref: `memory-${index}`,
      kind: "decision" as const,
      title: `Memory ${index}`,
      content: `Durable fact ${index}.`,
    }));
    const relations: MemoryRelationCandidate[] = types.map((type, index) => ({
      from: { candidateRef: `memory-${index}` },
      to: { candidateRef: `memory-${index + 1}` },
      type,
      rationale: `关系 ${index}`,
      confidence: "verified",
    }));
    const proposal = context.service.proposeMemory(project.id, candidates, relations) as {
      id: string;
      items: Array<{ id: string }>;
      relationItems: Array<{ id: string }>;
    };
    const committed = context.service.commitMemory(
      proposal.id,
      proposal.items.map((item) => item.id),
      proposal.relationItems.map((item) => item.id),
    );

    expect(committed.memories).toHaveLength(types.length + 1);
    expect(committed.relations.map((relation) => relation.type)).toEqual(types);
    expect(committed.rejectedRelationItems).toEqual([]);
    const relationPath = path.join(context.dataDir, "projects", project.id, "RELATIONS.json");
    expect(JSON.parse(readFileSync(relationPath, "utf8")).relations).toHaveLength(types.length);

    const first = committed.memories[0];
    const related = context.service.listMemoryRelations(project.id, first?.id ?? "", "in");
    expect((related.relations as unknown[]).length).toBe(1);
  });

  test("requires relation coverage for every event in a multi-event work unit", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const project = context.service.registerProject(makeProject(context.root, "event-chain"));
    const events = [
      {
        ref: "daily-observation",
        kind: "workflow" as const,
        title: "执行广告日观察",
        content: "执行当天的广告观察任务。",
        workUnitId: "amazon-daily-2026-08-09",
        phase: "data_collection" as const,
        sequence: 1,
      },
      {
        ref: "missing-data",
        kind: "pitfall" as const,
        title: "发现观察数据缺失",
        content: "缺失数据可能导致日报误判业务状态。",
        workUnitId: "amazon-daily-2026-08-09",
        phase: "risk" as const,
        sequence: 2,
      },
      {
        ref: "contract-driven",
        kind: "decision" as const,
        title: "每日观察改为契约驱动采集",
        content: "使用数据契约约束观察数据采集。",
        workUnitId: "amazon-daily-2026-08-09",
        phase: "decision" as const,
        sequence: 3,
      },
    ];

    expect(() => context.service.proposeMemory(project.id, events)).toThrowError(
      /participate in at least one proposed relation/,
    );

    const proposal = context.service.proposeMemory(project.id, events, [
      {
        from: { candidateRef: "daily-observation" },
        to: { candidateRef: "missing-data" },
        type: "observes",
        rationale: "广告日观察执行过程中发现输入数据存在缺失。",
        confidence: "verified",
      },
      {
        from: { candidateRef: "missing-data" },
        to: { candidateRef: "contract-driven" },
        type: "causes",
        rationale: "数据缺失和状态误判风险促成了契约驱动采集改造。",
        confidence: "verified",
      },
    ]) as { relationItems: Array<{ id: string }> };

    expect(proposal.relationItems).toHaveLength(2);
  });

  test("rejects self relations and rejects duplicate or unresolved accepted edges", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const project = context.service.registerProject(
      makeProject(context.root, "validation-project"),
    );

    expect(() =>
      context.service.proposeMemory(
        project.id,
        [{ ref: "same", kind: "status", title: "Same", content: "Same memory." }],
        [
          {
            from: { candidateRef: "same" },
            to: { candidateRef: "same" },
            type: "related_to",
            rationale: "不能指向自身",
          },
        ],
      ),
    ).toThrowError(/itself/);

    const proposal = context.service.proposeMemory(
      project.id,
      [
        { ref: "left", kind: "status", title: "Left", content: "Left memory." },
        { ref: "right", kind: "status", title: "Right", content: "Right memory." },
      ],
      [
        {
          from: { candidateRef: "left" },
          to: { candidateRef: "right" },
          type: "related_to",
          rationale: "第一条",
        },
        {
          from: { candidateRef: "right" },
          to: { candidateRef: "left" },
          type: "related_to",
          rationale: "对称重复",
        },
      ],
    ) as {
      id: string;
      items: Array<{ id: string }>;
      relationItems: Array<{ id: string }>;
    };
    const result = context.service.commitMemory(
      proposal.id,
      proposal.items.map((item) => item.id),
      proposal.relationItems.map((item) => item.id),
    );
    expect(result.relations).toHaveLength(1);
    expect(result.rejectedRelationItems[0]?.rejectionReason).toBe("duplicate_relation");

    const partial = context.service.proposeMemory(
      project.id,
      [
        { ref: "kept", kind: "status", title: "Kept", content: "Kept memory." },
        { ref: "dropped", kind: "status", title: "Dropped", content: "Dropped memory." },
      ],
      [
        {
          from: { candidateRef: "kept" },
          to: { candidateRef: "dropped" },
          type: "depends_on",
          rationale: "未接受端点",
        },
      ],
    ) as {
      id: string;
      items: Array<{ id: string }>;
      relationItems: Array<{ id: string }>;
    };
    const partialResult = context.service.commitMemory(
      partial.id,
      [partial.items[0]?.id ?? ""],
      [partial.relationItems[0]?.id ?? ""],
    );
    expect(partialResult.relations).toEqual([]);
    expect(partialResult.rejectedRelationItems[0]?.rejectionReason).toBe("endpoint_unavailable");
  });

  test("enforces linked-project graph access and suspends edges after unlink", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectA = context.service.registerProject(makeProject(context.root, "project-a"));
    const projectB = context.service.registerProject(makeProject(context.root, "project-b"));
    const proposalA = context.service.proposeMemory(
      projectA.id,
      [
        { ref: "api", kind: "architecture", title: "Shared API", content: "A owns the API." },
        {
          ref: "contract",
          kind: "decision",
          title: "API contract",
          content: "A defines the API contract.",
        },
      ],
      [
        {
          from: { candidateRef: "api" },
          to: { candidateRef: "contract" },
          type: "depends_on",
          rationale: "API 依赖协议。",
        },
      ],
    ) as {
      id: string;
      items: Array<{ id: string }>;
      relationItems: Array<{ id: string }>;
    };
    const committedA = context.service.commitMemory(
      proposalA.id,
      proposalA.items.map((item) => item.id),
      proposalA.relationItems.map((item) => item.id),
    );
    const memoryA = committedA.memories[0];
    const proposalB = context.service.proposeMemory(projectB.id, [
      { kind: "workflow", title: "API client", content: "B calls the API." },
    ]) as { id: string; items: Array<{ id: string }> };
    const memoryB = context.service.commitMemory(proposalB.id, [proposalB.items[0]?.id ?? ""])
      .memories[0];

    expect(() =>
      context.service.proposeMemory(
        projectB.id,
        [],
        [
          {
            from: { memoryId: memoryB?.id ?? "" },
            to: { memoryId: memoryA?.id ?? "" },
            type: "depends_on",
            rationale: "B 依赖 A",
          },
        ],
      ),
    ).toThrowError(/read-only project link/);

    context.service.linkProjects(projectB.id, projectA.id);
    const relationProposal = context.service.proposeMemory(
      projectB.id,
      [],
      [
        {
          from: { memoryId: memoryB?.id ?? "" },
          to: { memoryId: memoryA?.id ?? "" },
          type: "depends_on",
          rationale: "B 依赖 A",
        },
      ],
    ) as { id: string; relationItems: Array<{ id: string }> };
    context.service.commitMemory(
      relationProposal.id,
      [],
      [relationProposal.relationItems[0]?.id ?? ""],
    );
    expect(
      (
        context.service.listMemoryRelations(projectB.id, memoryB?.id ?? "", "both", [], true)
          .relations as unknown[]
      ).length,
    ).toBe(1);
    expect(
      (
        context.service.listMemoryRelations(projectB.id, memoryA?.id ?? "", "both", [], true)
          .relations as unknown[]
      ).length,
    ).toBe(2);

    context.service.unlinkProjects(projectB.id, projectA.id);
    expect(
      (context.service.listMemoryRelations(projectB.id, memoryB?.id ?? "").relations as unknown[])
        .length,
    ).toBe(0);
    expect(context.service.store.doctor()).toMatchObject({
      ok: true,
      counts: { suspendedRelations: 1 },
    });
    context.service.linkProjects(projectB.id, projectA.id);
    expect(
      (
        context.service.listMemoryRelations(projectB.id, memoryB?.id ?? "", "both", [], true)
          .relations as unknown[]
      ).length,
    ).toBe(1);
  });

  test("finds directed paths, renders safe Mermaid, and cascades relation deletion", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const project = context.service.registerProject(makeProject(context.root, "path-project"));
    const proposal = context.service.proposeMemory(
      project.id,
      [
        { ref: "a", kind: "decision", title: 'A "quoted"', content: "A." },
        { ref: "b", kind: "decision", title: "B\nline", content: "B." },
        { ref: "c", kind: "decision", title: "C", content: "C." },
      ],
      [
        {
          from: { candidateRef: "a" },
          to: { candidateRef: "b" },
          type: "supports",
          rationale: "A 支持 B",
        },
        {
          from: { candidateRef: "b" },
          to: { candidateRef: "c" },
          type: "depends_on",
          rationale: "B 依赖 C",
        },
        {
          from: { candidateRef: "c" },
          to: { candidateRef: "a" },
          type: "derived_from",
          rationale: "形成环",
        },
      ],
    ) as {
      id: string;
      items: Array<{ id: string }>;
      relationItems: Array<{ id: string }>;
    };
    const committed = context.service.commitMemory(
      proposal.id,
      proposal.items.map((item) => item.id),
      proposal.relationItems.map((item) => item.id),
    );
    const [a, , c] = committed.memories;
    const pathResult = context.service.findRelationPath(project.id, a?.id ?? "", c?.id ?? "");
    expect(pathResult.found).toBe(true);
    expect(pathResult.relations as unknown[]).toHaveLength(2);

    const graph = context.service.buildGraph(project.id, a?.id ?? "", 2);
    expect(graph.nodes).toHaveLength(3);
    expect(graph.relations).toHaveLength(3);
    const mermaid = context.service.renderGraphMermaid(graph);
    expect(mermaid).toContain("graph TD");
    expect(mermaid).toContain("A 'quoted'");
    expect(mermaid).not.toContain("B\nline");

    context.service.store.forgetMemories(project.id, [c?.id ?? ""]);
    expect(context.service.store.getRelations(project.id)).toHaveLength(1);
  });

  test("caps whole-project graph output at one hundred nodes", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const project = context.service.registerProject(makeProject(context.root, "large-project"));
    for (let offset = 0; offset < 101; offset += 20) {
      const candidates = Array.from({ length: Math.min(20, 101 - offset) }, (_, index) => ({
        kind: "status" as const,
        title: `Memory ${offset + index}`,
        content: `Fact ${offset + index}.`,
      }));
      const proposal = context.service.proposeMemory(project.id, candidates) as {
        id: string;
        items: Array<{ id: string }>;
      };
      context.service.commitMemory(
        proposal.id,
        proposal.items.map((item) => item.id),
      );
    }
    expect(context.service.buildGraph(project.id, null).nodes).toHaveLength(100);
  });
});
