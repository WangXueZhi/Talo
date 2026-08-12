import { describe, expect, test } from "vitest";
import {
  buildContextualEventTitles,
  buildEventCausalityView,
  buildEventPathView,
  buildGraphElements,
  buildTimelineDayGroups,
  buildTimelineWorkUnits,
  eventTime,
  localGraphMemories,
  matchesMemory,
  RELATION_META,
  reachableMemoryIds,
  relationSentence,
  submitterClass,
  submitterLabel,
  timelineTimeLabel,
  visibleMemories,
} from "../src/browser/model.js";
import type {
  BrowserGraphGuide,
  BrowserMemory,
  GraphViewData,
  RelationType,
} from "../src/browser/types.js";

function memory(id: string, overrides: Partial<BrowserMemory> = {}): BrowserMemory {
  return {
    id,
    projectId: "project",
    projectName: "Project",
    kind: "decision",
    title: `Memory ${id}`,
    displayTitle: overrides.displayTitle ?? overrides.title ?? `Memory ${id}`,
    summary: `Summary ${id}`,
    topic: "Topic",
    briefRole: null,
    content: `Content ${id}`,
    tags: [],
    citations: [],
    confidence: "verified",
    updatedAt: "2026-07-14T00:00:00.000Z",
    stale: false,
    staleReason: null,
    ...overrides,
  };
}

function guide(overrides: Partial<BrowserGraphGuide> = {}): BrowserGraphGuide {
  return {
    projectId: "project",
    projectName: "Project",
    generatedAt: "2026-07-14T00:00:00.000Z",
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

const relationTypes: RelationType[] = [
  "related_to",
  "observes",
  "causes",
  "depends_on",
  "supports",
  "contradicts",
  "supersedes",
  "derived_from",
];

describe("browser knowledge graph model", () => {
  test("labels event submitters without guessing historical records", () => {
    expect(
      submitterLabel(memory("codex", { submittedBy: { platform: "codex", adapterVersion: null } })),
    ).toBe("Codex 提交");
    expect(
      submitterLabel(
        memory("antigravity", { submittedBy: { platform: "antigravity", adapterVersion: "1" } }),
      ),
    ).toBe("Antigravity 提交");
    expect(
      submitterLabel(
        memory("claude", { submittedBy: { platform: "claude-code", adapterVersion: null } }),
      ),
    ).toBe("Claude Code 提交");
    expect(submitterLabel(memory("legacy", { submittedBy: null }))).toBe("历史记录");
    expect(
      submitterClass(
        memory("antigravity", { submittedBy: { platform: "antigravity", adapterVersion: null } }),
      ),
    ).toBe("submitter-antigravity");
  });

  test("creates readable unique titles for repeated topic-role events", () => {
    const memories = [
      memory("a", {
        title: "三份原始报表已落盘",
        displayTitle: "进展：亚马逊广告周度复盘",
        updatedAt: "2026-07-29T08:00:00.000Z",
      }),
      memory("b", {
        title: "五表对账已完成",
        displayTitle: "进展：亚马逊广告周度复盘",
        updatedAt: "2026-07-29T09:00:00.000Z",
      }),
    ];
    const titles = buildContextualEventTitles(memories);
    expect(titles.get("a")).toBe("2026-07-29｜三份原始报表已落盘");
    expect(titles.get("b")).toBe("2026-07-29｜五表对账已完成");
  });

  test("uses a readable event title instead of a unique topic title", () => {
    const titles = buildContextualEventTitles([
      memory("image-run", {
        title: "第二批新品图片生成",
        displayTitle: "进展：新品图片生成",
      }),
    ]);
    expect(titles.get("image-run")).toBe("第二批新品图片生成");
  });

  test("groups timeline events by work unit and counts only formal relations", () => {
    const data: GraphViewData = {
      projectName: "Project",
      generatedAt: "2026-07-29T10:00:00.000Z",
      memories: [
        memory("a", { workUnitId: "run:weekly", sequence: 1, phase: "data_collection" }),
        memory("b", { workUnitId: "run:weekly", sequence: 2, phase: "analysis" }),
        memory("c", { workUnitId: null, phase: "risk" }),
      ],
      relations: [
        {
          id: "ab",
          fromMemoryId: "a",
          toMemoryId: "b",
          type: "supports",
          rationale: "",
          confidence: "verified",
        },
      ],
      guide: guide({
        relationSuggestions: [
          {
            id: "auto",
            projectId: "project",
            fromMemoryId: "b",
            toMemoryId: "c",
            type: "related_to",
            score: 1,
            signals: [],
            rationale: "可能相关",
          },
        ],
      }),
    };
    const units = buildTimelineWorkUnits(data);
    expect(units[0]?.events.map((event) => event.memory.id)).toEqual(["a", "b"]);
    expect(units[0]?.formalRelationCount).toBe(1);
    expect(units.at(-1)?.ungrouped).toBe(true);
  });

  test("sorts the project timeline by event date before work-unit grouping", () => {
    const data: GraphViewData = {
      projectName: "Project",
      generatedAt: "2026-08-08T00:00:00.000Z",
      memories: [
        memory("aug-6", {
          workUnitId: "amazon-daily",
          updatedAt: "2026-08-06T09:00:00.000Z",
          phase: "analysis",
        }),
        memory("aug-7-late", {
          workUnitId: null,
          updatedAt: "2026-08-07T15:00:00.000Z",
          phase: "execution",
        }),
        memory("aug-7-early", {
          workUnitId: "image-run",
          updatedAt: "2026-08-07T08:00:00.000Z",
          sequence: 1,
          phase: "decision",
        }),
        memory("reference", {
          briefRole: "reference",
          updatedAt: "2026-08-08T08:00:00.000Z",
        }),
      ],
      relations: [],
      guide: guide(),
    };
    const days = buildTimelineDayGroups(data);
    expect(days.map((day) => day.date)).toEqual(["2026-08-07", "2026-08-06"]);
    expect(days[0]?.events.map((event) => event.memory.id)).toEqual(["aug-7-late", "aug-7-early"]);
    expect(days[0]?.events[0]?.ungrouped).toBe(true);
    expect(days[0]?.workUnitCount).toBe(2);
  });

  test("uses the saved time when a legacy event occurs after the generated snapshot", () => {
    const data: GraphViewData = {
      projectName: "Project",
      generatedAt: "2026-08-09T04:41:00.000Z",
      memories: [
        memory("future", {
          updatedAt: "2026-08-09T04:21:00.000Z",
          narrative: {
            occurredAt: "2026-08-09T10:21:00.000Z",
            reason: "记录工作结果",
            action: "保存项目记忆",
            outcome: "事件已写入",
            conclusion: "应按实际保存时间展示",
            outputs: [],
          },
        }),
      ],
      relations: [],
      guide: guide(),
    };

    const event = buildTimelineDayGroups(data)[0]?.events[0];
    expect(event?.occurredAt).toBe("2026-08-09T04:21:00.000Z");
  });

  test("corrects a local Beijing timestamp accidentally serialized with Z", () => {
    const item = memory("local-time", {
      createdAt: "2026-08-09T02:22:06.883Z",
      narrative: {
        occurredAt: "2026-08-09T10:21:49.000Z",
        reason: "发现问题",
        action: "修复问题",
        outcome: "完成修复",
        conclusion: "继续观察",
        outputs: [],
      },
    });
    expect(eventTime(item, "2026-08-09T15:00:00.000Z")).toBe("2026-08-09T10:21:49.000+08:00");
    expect(timelineTimeLabel(item, "2026-08-09T15:00:00.000Z")).toBe("10:21");
  });

  test("keeps date-only events honest and groups same-day chains separately", () => {
    const data: GraphViewData = {
      projectName: "Project",
      generatedAt: "2026-08-09T15:00:00.000Z",
      memories: [
        memory("observation", {
          workUnitId: "observation",
          sequence: 1,
          createdAt: "2026-08-09T12:00:00.000Z",
          narrative: {
            occurredAt: "2026-08-09T00:00:00.000Z",
            reason: "开始观察",
            action: "执行采集",
            outcome: "发现缺口",
            conclusion: "需要处理",
            outputs: [],
          },
        }),
        memory("decision", {
          workUnitId: "observation",
          sequence: 2,
          createdAt: "2026-08-09T13:00:00.000Z",
          narrative: {
            occurredAt: "2026-08-09T00:00:00.000Z",
            reason: "发现缺口",
            action: "修改规范",
            outcome: "完成调整",
            conclusion: "按契约采集",
            outputs: [],
          },
        }),
        memory("handoff", {
          workUnitId: "handoff",
          sequence: 1,
          createdAt: "2026-08-09T14:00:00.000Z",
          narrative: {
            occurredAt: "2026-08-09T14:00:00.000Z",
            reason: "开始接力",
            action: "投递日报",
            outcome: "发现失焦",
            conclusion: "需要激活窗口",
            outputs: [],
          },
        }),
      ],
      relations: [
        {
          id: "observation-decision",
          fromMemoryId: "observation",
          toMemoryId: "decision",
          type: "causes",
          rationale: "观察发现缺口，所以修改规范。",
          confidence: "verified",
        },
        {
          id: "decision-derived",
          fromMemoryId: "decision",
          toMemoryId: "observation",
          type: "derived_from",
          rationale: "规范调整来源于当天观察。",
          confidence: "verified",
        },
      ],
      guide: guide(),
    };
    const day = buildTimelineDayGroups(data)[0];
    expect(day?.date).toBe("2026-08-09");
    expect(day?.workUnits.map((unit) => unit.id)).toEqual(["handoff", "observation"]);
    expect(day?.workUnits[1]?.events.map((event) => event.memory.id)).toEqual([
      "observation",
      "decision",
    ]);
    expect(day?.workUnits[1]?.events[0]?.timeLabel).toBe("时分未记录");
    expect(day?.workUnits[1]?.events[1]?.incomingRelations[0]).toMatchObject({
      type: "causes",
      fromMemoryId: "observation",
      fromTitle: "Memory observation",
    });
    expect(day?.workUnits[1]?.events[1]?.incomingRelations[1]).toMatchObject({
      type: "derived_from",
      fromMemoryId: "observation",
      fromTitle: "Memory observation",
    });
  });

  test("builds a work-unit relation path with one-hop external events", () => {
    const data: GraphViewData = {
      projectName: "Project",
      generatedAt: "2026-08-08T00:00:00.000Z",
      memories: [
        memory("a", { workUnitId: "weekly", phase: "data_collection" }),
        memory("b", { workUnitId: "weekly", phase: "analysis" }),
        memory("c", { workUnitId: "other", phase: "execution" }),
        memory("d", { workUnitId: "other", phase: "verification" }),
      ],
      relations: [
        {
          id: "ab",
          fromMemoryId: "b",
          toMemoryId: "a",
          type: "depends_on",
          rationale: "",
          confidence: "verified",
        },
        {
          id: "bc",
          fromMemoryId: "c",
          toMemoryId: "b",
          type: "depends_on",
          rationale: "",
          confidence: "verified",
        },
        {
          id: "cd",
          fromMemoryId: "d",
          toMemoryId: "c",
          type: "depends_on",
          rationale: "",
          confidence: "verified",
        },
      ],
      guide: guide({
        relationSuggestions: [
          {
            id: "hint",
            projectId: "project",
            fromMemoryId: "b",
            toMemoryId: "d",
            type: "related_to",
            rationale: "可能相关",
            score: 1,
            signals: [],
          },
        ],
      }),
    };
    const path = buildEventPathView(data, "a");
    expect(path?.memories.map((item) => item.id)).toEqual(["a", "b", "c"]);
    expect(path?.externalMemoryIds).toEqual(["c"]);
    expect(path?.relations.map((relation) => relation.id)).toEqual(["ab", "bc"]);
    expect(path?.suggestions).toHaveLength(1);
  });

  test("uses two formal hops for an ungrouped event path", () => {
    const data: GraphViewData = {
      projectName: "Project",
      generatedAt: "2026-08-08T00:00:00.000Z",
      memories: [memory("a"), memory("b"), memory("c"), memory("d")],
      relations: [
        {
          id: "ab",
          fromMemoryId: "a",
          toMemoryId: "b",
          type: "supports",
          rationale: "",
          confidence: "verified",
        },
        {
          id: "bc",
          fromMemoryId: "b",
          toMemoryId: "c",
          type: "supports",
          rationale: "",
          confidence: "verified",
        },
        {
          id: "cd",
          fromMemoryId: "c",
          toMemoryId: "d",
          type: "supports",
          rationale: "",
          confidence: "verified",
        },
      ],
      guide: guide(),
    };
    expect(buildEventPathView(data, "a")?.memories.map((item) => item.id)).toEqual(["a", "b", "c"]);
  });

  test("separates direct causes, effects, related events, and contradictions", () => {
    const data: GraphViewData = {
      projectName: "Project",
      generatedAt: "2026-08-08T00:00:00.000Z",
      memories: [
        "current",
        "observation",
        "observed",
        "cause",
        "caused",
        "dependency",
        "support",
        "effect",
        "derived",
        "replacement",
        "related",
        "conflict",
      ].map((id) => memory(id)),
      relations: [
        {
          id: "observation",
          fromMemoryId: "observation",
          toMemoryId: "current",
          type: "observes",
          rationale: "",
          confidence: "verified",
        },
        {
          id: "observed",
          fromMemoryId: "current",
          toMemoryId: "observed",
          type: "observes",
          rationale: "",
          confidence: "verified",
        },
        {
          id: "cause",
          fromMemoryId: "cause",
          toMemoryId: "current",
          type: "causes",
          rationale: "",
          confidence: "verified",
        },
        {
          id: "caused",
          fromMemoryId: "current",
          toMemoryId: "caused",
          type: "causes",
          rationale: "",
          confidence: "verified",
        },
        {
          id: "dependency",
          fromMemoryId: "current",
          toMemoryId: "dependency",
          type: "depends_on",
          rationale: "",
          confidence: "verified",
        },
        {
          id: "support",
          fromMemoryId: "support",
          toMemoryId: "current",
          type: "supports",
          rationale: "",
          confidence: "verified",
        },
        {
          id: "effect",
          fromMemoryId: "current",
          toMemoryId: "effect",
          type: "supports",
          rationale: "",
          confidence: "verified",
        },
        {
          id: "derived",
          fromMemoryId: "derived",
          toMemoryId: "current",
          type: "derived_from",
          rationale: "",
          confidence: "verified",
        },
        {
          id: "replacement",
          fromMemoryId: "replacement",
          toMemoryId: "current",
          type: "supersedes",
          rationale: "",
          confidence: "verified",
        },
        {
          id: "related",
          fromMemoryId: "current",
          toMemoryId: "related",
          type: "related_to",
          rationale: "",
          confidence: "verified",
        },
        {
          id: "conflict",
          fromMemoryId: "conflict",
          toMemoryId: "current",
          type: "contradicts",
          rationale: "",
          confidence: "verified",
        },
      ],
      guide: guide(),
    };
    const causality = buildEventCausalityView(data, "current");
    expect(causality?.causes.map((item) => item.memory.id).sort()).toEqual([
      "cause",
      "dependency",
      "observation",
      "support",
    ]);
    expect(causality?.effects.map((item) => item.memory.id).sort()).toEqual([
      "caused",
      "derived",
      "effect",
      "observed",
      "replacement",
    ]);
    expect(causality?.related.map((item) => item.memory.id)).toEqual(["related"]);
    expect(causality?.contradictions.map((item) => item.memory.id)).toEqual(["conflict"]);
  });

  test("limits local graph scope to work unit, one hop, two hops, or all", () => {
    const data: GraphViewData = {
      projectName: "Project",
      generatedAt: "2026-07-29T10:00:00.000Z",
      memories: [
        memory("a", { workUnitId: "one" }),
        memory("b", { workUnitId: "one" }),
        memory("c", { workUnitId: "two" }),
        memory("d", { workUnitId: "two" }),
      ],
      relations: [
        {
          id: "ab",
          fromMemoryId: "a",
          toMemoryId: "b",
          type: "supports",
          rationale: "",
          confidence: "verified",
        },
        {
          id: "bc",
          fromMemoryId: "b",
          toMemoryId: "c",
          type: "supports",
          rationale: "",
          confidence: "verified",
        },
        {
          id: "cd",
          fromMemoryId: "c",
          toMemoryId: "d",
          type: "supports",
          rationale: "",
          confidence: "verified",
        },
      ],
      guide: guide(),
    };
    expect(localGraphMemories(data, "a", "work_unit").map((item) => item.id)).toEqual(["a", "b"]);
    expect(localGraphMemories(data, "a", "event").map((item) => item.id)).toEqual(["a", "b"]);
    expect(localGraphMemories(data, "a", "two_hops").map((item) => item.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
    expect(localGraphMemories(data, "a", "all")).toHaveLength(4);
  });

  test("provides distinct display metadata for every supported relation", () => {
    expect(Object.keys(RELATION_META).sort()).toEqual([...relationTypes].sort());
    expect(RELATION_META.related_to.directed).toBe(false);
    expect(RELATION_META.contradicts.directed).toBe(false);
    expect(RELATION_META.depends_on.directed).toBe(true);
    expect(RELATION_META).toMatchObject({
      related_to: { color: "#c7d2fe", lineStyle: "solid", directed: false },
      observes: { color: "#22d3ee", lineStyle: "solid", directed: true },
      causes: { color: "#f97316", lineStyle: "solid", directed: true },
      depends_on: { color: "#38bdf8", lineStyle: "solid", directed: true },
      supports: { color: "#34d399", lineStyle: "solid", directed: true },
      contradicts: { color: "#fb7185", lineStyle: "dashed", directed: false },
      supersedes: { color: "#f59e0b", lineStyle: "solid", directed: true },
      derived_from: { color: "#c084fc", lineStyle: "dashed", directed: true },
    });
  });

  test("describes reviewed relationships as complete Chinese sentences", () => {
    const base = {
      id: "r",
      fromMemoryId: "a",
      toMemoryId: "b",
      rationale: "原因",
      confidence: "verified" as const,
    };
    expect(relationSentence({ ...base, type: "derived_from" }, "诊断结论", "数据覆盖")).toBe(
      "《诊断结论》的依据来自《数据覆盖》",
    );
    expect(relationSentence({ ...base, type: "supports" }, "证据", "结论")).toBe(
      "《证据》为《结论》提供支持",
    );
    expect(relationSentence({ ...base, type: "observes" }, "广告日观察", "数据缺失")).toBe(
      "《广告日观察》注意到《数据缺失》",
    );
    expect(relationSentence({ ...base, type: "causes" }, "数据缺失", "契约改造")).toBe(
      "《数据缺失》是《契约改造》的原因",
    );
  });

  test("builds point-node metadata and invisible layout links between disconnected components", () => {
    const data: GraphViewData = {
      projectName: "Project",
      generatedAt: "2026-07-14T00:00:00.000Z",
      memories: [memory("a", { stale: true }), memory("b"), memory("c")],
      relations: [
        {
          id: "ab",
          fromMemoryId: "a",
          toMemoryId: "b",
          type: "supports",
          rationale: "",
          confidence: "verified",
        },
      ],
      guide: guide(),
    };
    const elements = buildGraphElements(data, data.memories, "", null);
    const staleNode = elements.find((element) => element.data.id === "a");
    expect(staleNode?.classes).toContain("memory stale");
    expect(staleNode?.data.label).toBe("Memory a");
    expect(elements.filter((element) => element.data.edgeType === "relation")).toHaveLength(1);
    expect(elements.filter((element) => element.data.edgeType === "layout")).toHaveLength(1);
  });

  test("searches titles, content, tags, and citation paths without filtering the graph", () => {
    const item = memory("one", {
      tags: ["inventory"],
      citations: [
        {
          sourceProjectId: "project",
          sourceProjectName: "Project",
          sourcePath: "reports/diagnosis.md",
          role: "report",
          locator: "Conclusion",
          note: "First shipment",
          sourceCommit: null,
          stale: false,
          staleReason: null,
          accessible: true,
          fileUrl: "file:///tmp/diagnosis.md",
        },
      ],
    });
    expect(matchesMemory(item, "inventory")).toBe(true);
    expect(matchesMemory(item, "diagnosis.md")).toBe(true);
    expect(matchesMemory(item, "missing")).toBe(false);
  });

  test("limits focus traversal by depth and safely handles cycles", () => {
    const data: GraphViewData = {
      projectName: "Project",
      generatedAt: "2026-07-14T00:00:00.000Z",
      memories: [memory("a"), memory("b"), memory("c"), memory("d")],
      relations: [
        {
          id: "ab",
          fromMemoryId: "a",
          toMemoryId: "b",
          type: "supports",
          rationale: "",
          confidence: "verified",
        },
        {
          id: "bc",
          fromMemoryId: "b",
          toMemoryId: "c",
          type: "depends_on",
          rationale: "",
          confidence: "verified",
        },
        {
          id: "ca",
          fromMemoryId: "c",
          toMemoryId: "a",
          type: "related_to",
          rationale: "",
          confidence: "verified",
        },
      ],
      guide: guide(),
    };
    expect([...reachableMemoryIds(data, "a", 1)].sort()).toEqual(["a", "b", "c"]);
    expect([...reachableMemoryIds(data, "a", 2)].sort()).toEqual(["a", "b", "c"]);
    expect(
      visibleMemories(
        data,
        { topic: "", kind: "", relation: "", stale: "all", focusDepth: "1" },
        "a",
      ),
    ).toHaveLength(3);
  });

  test("adds citations only for the expanded memory and keeps them out of formal relations", () => {
    const withCitation = memory("a", {
      citations: [
        {
          sourceProjectId: "project",
          sourceProjectName: "Project",
          sourcePath: "evidence/source.csv",
          role: "evidence",
          locator: null,
          note: null,
          sourceCommit: null,
          stale: false,
          staleReason: null,
          accessible: true,
          fileUrl: "file:///tmp/source.csv",
        },
      ],
    });
    const data: GraphViewData = {
      projectName: "Project",
      generatedAt: "2026-07-14T00:00:00.000Z",
      memories: [withCitation, memory("b")],
      relations: [
        {
          id: "ab",
          fromMemoryId: "a",
          toMemoryId: "b",
          type: "supports",
          rationale: "",
          confidence: "verified",
        },
      ],
      guide: guide(),
    };
    const compact = buildGraphElements(data, data.memories, "", null);
    const expanded = buildGraphElements(data, data.memories, "", "a");
    expect(compact.filter((element) => element.data.edgeType === "citation")).toHaveLength(0);
    expect(expanded.filter((element) => element.data.edgeType === "citation")).toHaveLength(1);
    expect(expanded.filter((element) => element.data.edgeType === "relation")).toHaveLength(1);
  });

  test("builds a 100-memory view within the supported node limit", () => {
    const memories = Array.from({ length: 100 }, (_, index) => memory(String(index)));
    const data: GraphViewData = {
      projectName: "Large",
      generatedAt: "2026-07-14T00:00:00.000Z",
      memories,
      relations: [],
      guide: guide(),
    };
    const startedAt = performance.now();
    const elements = buildGraphElements(data, memories, "", null);
    expect(elements.filter((element) => element.group === "nodes")).toHaveLength(100);
    expect(performance.now() - startedAt).toBeLessThan(100);
  });

  test("renders small graphs with stable topic colors and display-only suggestions", () => {
    const memories = [
      memory("a", {
        topic: "Diagnosis",
        citations: Array(4)
          .fill(null)
          .map((_, index) => ({
            sourceProjectId: "project",
            sourceProjectName: "Project",
            sourcePath: `evidence/${index}.csv`,
            role: "evidence" as const,
            locator: null,
            note: null,
            sourceCommit: null,
            stale: false,
            staleReason: null,
            accessible: true,
            fileUrl: null,
          })),
      }),
      memory("b", { topic: "Diagnosis" }),
    ];
    const data: GraphViewData = {
      projectName: "Project",
      generatedAt: "2026-07-14T00:00:00.000Z",
      memories,
      relations: [],
      guide: guide({
        relationSuggestions: [
          {
            id: "hint_1",
            projectId: "project",
            fromMemoryId: "a",
            toMemoryId: "b",
            type: "related_to",
            rationale: "同属主题",
            score: 2,
            signals: [
              {
                kind: "same_topic",
                key: "topic:Diagnosis",
                label: "同属主题：Diagnosis",
                weight: 2,
              },
            ],
          },
        ],
      }),
    };
    const withSuggestion = buildGraphElements(data, memories, "", null, true);
    const withoutSuggestion = buildGraphElements(data, memories, "", null, false);
    const nodes = withSuggestion.filter((element) => element.group === "nodes");
    expect(nodes.every((node) => node.classes?.includes("labeled"))).toBe(true);
    expect(nodes[0]?.data.topicColor).toBe(nodes[1]?.data.topicColor);
    expect(Number(nodes[0]?.data.nodeSize)).toBeGreaterThan(Number(nodes[1]?.data.nodeSize));
    expect(withSuggestion.filter((element) => element.data.edgeType === "suggestion")).toHaveLength(
      1,
    );
    expect(
      withoutSuggestion.filter((element) => element.data.edgeType === "suggestion"),
    ).toHaveLength(0);
    expect([...reachableMemoryIds(data, "a", 1)]).toEqual(["a"]);
  });
});
