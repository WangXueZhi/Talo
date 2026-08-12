import type {
  DesktopProposalSelection,
  GraphViewData,
  MemoryHub,
  ProposalRecord,
} from "./types";
import { buildMemoryDisplayTitle } from "../../../packages/project-memory-core/src/display-title";
import type { MemoryCandidate, RelationEndpointCandidate, RelationType } from "../../../packages/project-memory-core/src/types";

export type ReviewItemKind = "memory" | "update" | "relation";

export interface DesktopReviewProposal extends ProposalRecord {
  projectName: string;
  projectPath: string | null;
  platform: string;
  itemCount: number;
}

export interface ProposalDecisionCounts {
  selectedCount: number;
  rejectedCount: number;
  totalCount: number;
}

export interface ReviewEndpointDisplay {
  displayTitle: string;
  technicalId: string;
  originalTitle: string | null;
}

const RELATION_LABELS: Record<RelationType, string> = {
  related_to: "相关",
  observes: "注意到",
  causes: "原因",
  depends_on: "依赖",
  supports: "支持",
  contradicts: "矛盾",
  supersedes: "替代",
  derived_from: "来源于",
};

const selectionField: Record<ReviewItemKind, keyof Omit<DesktopProposalSelection, "proposalId">> = {
  memory: "acceptedItemIds",
  update: "acceptedUpdateIds",
  relation: "acceptedRelationIds",
};

export function buildDesktopReviewProposals(
  proposals: ProposalRecord[],
  hub: MemoryHub | null,
): DesktopReviewProposal[] {
  const projects = new Map((hub?.projects ?? []).map((project) => [project.projectId, project]));
  return proposals
    .map((proposal) => {
      const project = projects.get(proposal.projectId);
      return {
        ...proposal,
        projectName: project?.name ?? proposal.projectId,
        projectPath: project?.primaryPath ?? null,
        platform: proposal.actor?.platform ?? "legacy",
        itemCount: proposal.items.length + proposal.updateItems.length + proposal.relationItems.length,
      };
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function reviewCandidateDisplayTitle(candidate: MemoryCandidate): string {
  return buildMemoryDisplayTitle(candidate);
}

export function reviewRelationLabel(type: RelationType): string {
  return RELATION_LABELS[type];
}

export function resolveReviewEndpoint(
  proposal: ProposalRecord,
  endpoint: RelationEndpointCandidate,
  projectView: GraphViewData | null,
): ReviewEndpointDisplay {
  if (endpoint.candidateRef) {
    const candidate = proposal.items.find((item) => item.candidate.ref === endpoint.candidateRef)?.candidate;
    return {
      displayTitle: candidate ? reviewCandidateDisplayTitle(candidate) : "待创建的记忆",
      technicalId: endpoint.candidateRef,
      originalTitle: candidate?.title ?? null,
    };
  }
  const memory = projectView?.memories.find((candidate) => candidate.id === endpoint.memoryId);
  return {
    displayTitle: memory?.displayTitle ?? "已有记忆",
    technicalId: endpoint.memoryId ?? "未知记忆",
    originalTitle: memory?.title ?? null,
  };
}

export function createProposalSelection(proposal: ProposalRecord): DesktopProposalSelection {
  return {
    proposalId: proposal.id,
    acceptedItemIds: proposal.items.map((item) => item.id),
    acceptedUpdateIds: proposal.updateItems.map((item) => item.id),
    acceptedRelationIds: proposal.relationItems.map((item) => item.id),
  };
}

export function countSelectedProposalItems(selection: DesktopProposalSelection): number {
  return selection.acceptedItemIds.length
    + selection.acceptedUpdateIds.length
    + selection.acceptedRelationIds.length;
}

export function countProposalDecisionItems(
  proposal: ProposalRecord,
  selection: DesktopProposalSelection,
): ProposalDecisionCounts {
  const selectedCount = countSelectedProposalItems(selection);
  const totalCount = proposal.items.length + proposal.updateItems.length + proposal.relationItems.length;
  return {
    selectedCount,
    rejectedCount: totalCount - selectedCount,
    totalCount,
  };
}

export function toggleProposalSelection(
  selection: DesktopProposalSelection,
  kind: ReviewItemKind,
  itemId: string,
): DesktopProposalSelection {
  const field = selectionField[kind];
  const values = selection[field];
  return {
    ...selection,
    [field]: values.includes(itemId)
      ? values.filter((value) => value !== itemId)
      : [...values, itemId],
  };
}
