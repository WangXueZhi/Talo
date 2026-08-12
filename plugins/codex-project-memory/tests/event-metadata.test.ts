import { describe, expect, test } from "vitest";
import { resolveEventMetadata } from "../../../packages/project-memory-core/src/event-metadata.js";

function event(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    title: `Event ${id}`,
    summary: null,
    topic: "亚马逊广告周度复盘",
    content: "",
    citations: [],
    createdAt: "2026-07-29T00:00:00.000Z",
    ...overrides,
  };
}

describe("deterministic event metadata backfill", () => {
  test("prefers explicit run id over a source directory", () => {
    const resolved = resolveEventMetadata([
      event("a", {
        runId: "weekly-2026-07-29",
        citations: [{ sourcePath: "weekly_reviews/2026-07-29/raw/report.csv" }],
      }),
    ]).get("a");
    expect(resolved).toMatchObject({
      runId: "weekly-2026-07-29",
      workUnitId: "run:weekly-2026-07-29",
      groupingEvidence: "explicit",
    });
  });

  test("extracts run_id before falling back to citation paths", () => {
    const resolved = resolveEventMetadata([
      event("a", {
        content: "run_id: amazon-week-31",
        citations: [{ sourcePath: "weekly_reviews/2026-07-29/raw/report.csv" }],
      }),
    ]).get("a");
    expect(resolved).toMatchObject({
      runId: "amazon-week-31",
      workUnitId: "run:amazon-week-31",
      groupingEvidence: "run_id",
    });
  });

  test("does not merge same-topic records without shared evidence", () => {
    const resolved = resolveEventMetadata([
      event("a", { createdAt: "2026-07-29T01:00:00.000Z" }),
      event("b", { createdAt: "2026-07-29T02:00:00.000Z" }),
    ]);
    expect(resolved.get("a")?.workUnitId).toBeNull();
    expect(resolved.get("b")?.workUnitId).toBeNull();
  });

  test("uses formal relations plus topic or date as grouping evidence", () => {
    const resolved = resolveEventMetadata(
      [event("a"), event("b")],
      [{ fromMemoryId: "a", toMemoryId: "b" }],
    );
    expect(resolved.get("a")?.workUnitId).toBe(resolved.get("b")?.workUnitId);
    expect(resolved.get("a")?.groupingEvidence).toBe("formal_relation");
  });

  test.each([
    ["三份原始报表已下载落盘", "data_collection"],
    ["完成五表对账与广告复盘", "analysis"],
    ["确定后续动作方案", "decision"],
    ["已执行后台修改", "execution"],
    ["完成复核纠偏", "verification"],
    ["沉淀广告执行 SOP", "learning"],
  ] as const)("maps %s to %s", (title, phase) => {
    expect(resolveEventMetadata([event("a", { title })]).get("a")?.phase).toBe(phase);
  });

  test("assigns a stable sequence by occurrence time and memory id", () => {
    const resolved = resolveEventMetadata([
      event("b", { runId: "one", narrative: { occurredAt: "2026-07-29T02:00:00.000Z" } }),
      event("a", { runId: "one", narrative: { occurredAt: "2026-07-29T01:00:00.000Z" } }),
      event("c", { runId: "one", narrative: { occurredAt: "2026-07-29T02:00:00.000Z" } }),
    ]);
    expect(resolved.get("a")?.sequence).toBe(1);
    expect(resolved.get("b")?.sequence).toBe(2);
    expect(resolved.get("c")?.sequence).toBe(3);
  });
});
