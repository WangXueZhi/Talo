import { describe, expect, it } from "vitest";
import type { GraphViewData, MemoryHub, ProposalRecord } from "./types";
import {
  buildDesktopReviewProposals,
  countProposalDecisionItems,
  countSelectedProposalItems,
  createProposalSelection,
  resolveReviewEndpoint,
  reviewCandidateDisplayTitle,
  reviewRelationLabel,
  toggleProposalSelection,
} from "./review-proposals";

function proposal(overrides: Partial<ProposalRecord> = {}): ProposalRecord {
  return {
    id: "proposal-1",
    projectId: "project-1",
    actor: { platform: "codex", adapterVersion: "0.13.0" },
    baseRevision: null,
    status: "pending",
    createdAt: "2026-08-01T10:00:00.000Z",
    reviewedAt: null,
    items: [{
      id: "memory-1",
      proposalId: "proposal-1",
      status: "pending",
      candidate: { kind: "decision", title: "采用桌面审核", content: "在桌面端审核候选记忆。" },
    }],
    updateItems: [{
      id: "update-1",
      proposalId: "proposal-1",
      status: "pending",
      rejectionReason: null,
      candidate: { memoryId: "existing-memory", summary: "更新后的摘要" },
    }],
    relationItems: [{
      id: "relation-1",
      proposalId: "proposal-1",
      status: "pending",
      rejectionReason: null,
      candidate: {
        from: { memoryId: "existing-memory" },
        to: { candidateRef: "new-memory" },
        type: "supports",
        rationale: "新决策支持已有结论。",
      },
    }],
    ...overrides,
  };
}

function hub(): MemoryHub {
  return {
    projects: [{ projectId: "project-1", name: "桌面项目", primaryPath: "/workspace/desktop" }],
  } as unknown as MemoryHub;
}

describe("review proposals", () => {
  it("joins proposals with project metadata and sorts newest first", () => {
    const proposals = buildDesktopReviewProposals([
      proposal({ id: "older", createdAt: "2026-07-31T10:00:00.000Z" }),
      proposal({ id: "newer", createdAt: "2026-08-01T10:00:00.000Z" }),
    ], hub());

    expect(proposals.map((item) => item.id)).toEqual(["newer", "older"]);
    expect(proposals[0]).toMatchObject({ projectName: "桌面项目", projectPath: "/workspace/desktop", platform: "codex", itemCount: 3 });
  });

  it("falls back to project id and legacy actor metadata", () => {
    const legacy = proposal({ projectId: "missing-project", actor: null as never });
    const result = buildDesktopReviewProposals([legacy], null)[0];

    expect(result).toMatchObject({ projectName: "missing-project", projectPath: null, platform: "legacy" });
  });

  it("selects every candidate by default and supports independent toggles", () => {
    const initial = createProposalSelection(proposal());
    const withoutUpdate = toggleProposalSelection(initial, "update", "update-1");
    const restored = toggleProposalSelection(withoutUpdate, "update", "update-1");

    expect(countSelectedProposalItems(initial)).toBe(3);
    expect(withoutUpdate.acceptedUpdateIds).toEqual([]);
    expect(countSelectedProposalItems(withoutUpdate)).toBe(2);
    expect(restored.acceptedUpdateIds).toEqual(["update-1"]);
  });

  it("counts accepted and automatically rejected candidates for confirmation", () => {
    const record = proposal();
    const selection = toggleProposalSelection(createProposalSelection(record), "relation", "relation-1");

    expect(countProposalDecisionItems(record, selection)).toEqual({
      selectedCount: 2,
      rejectedCount: 1,
      totalCount: 3,
    });
  });

  it("uses plain-language candidate titles while preserving technical originals", () => {
    expect(reviewCandidateDisplayTitle({
      ref: "deploy-dec40e26",
      kind: "status",
      title: "构建指纹 dec40e26 版本已部署",
      topic: "Web Demo 部署",
      briefRole: "progress",
      content: "部署完成。",
    })).toBe("进展：Web Demo 部署");
  });

  it("resolves relation endpoints without exposing candidate refs or memory ids as titles", () => {
    const record = proposal({
      items: [{
        id: "memory-1",
        proposalId: "proposal-1",
        status: "pending",
        candidate: {
          ref: "new-memory",
          kind: "status",
          title: "构建指纹 dec40e26 版本已部署",
          topic: "Web Demo 部署",
          briefRole: "progress",
          content: "部署完成。",
        },
      }],
    });
    const projectView = {
      memories: [{ id: "existing-memory", title: "build-21c74824", displayTitle: "进展：旧版部署" }],
    } as GraphViewData;

    expect(resolveReviewEndpoint(record, { candidateRef: "new-memory" }, projectView)).toMatchObject({
      displayTitle: "进展：Web Demo 部署",
      technicalId: "new-memory",
    });
    expect(resolveReviewEndpoint(record, { memoryId: "existing-memory" }, projectView)).toMatchObject({
      displayTitle: "进展：旧版部署",
      technicalId: "existing-memory",
    });
    expect(resolveReviewEndpoint(record, { memoryId: "missing-memory" }, projectView).displayTitle).toBe("已有记忆");
    expect(reviewRelationLabel("depends_on")).toBe("依赖");
    expect(reviewRelationLabel("observes")).toBe("注意到");
    expect(reviewRelationLabel("causes")).toBe("原因");
  });
});
