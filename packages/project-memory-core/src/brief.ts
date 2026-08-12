import { buildMemoryDisplayTitle } from "./display-title.js";
import { temporarySummary } from "./retrieval.js";
import type {
  BriefRole,
  GraphGuide,
  MemoryKind,
  MemoryRecord,
  ProjectBrief,
  ProjectBriefItem,
  ProjectBriefSuggestion,
  ProjectHandoffStartItem,
  ProjectHandoffTimelineItem,
} from "./types.js";

export interface BriefKnowledgeGraph {
  nodes: MemoryRecord[];
}

const FALLBACK_ROLES: Record<MemoryKind, BriefRole> = {
  architecture: "conclusion",
  decision: "conclusion",
  workflow: "progress",
  convention: "progress",
  pitfall: "risk",
  status: "progress",
};

export function resolvedBriefRole(memory: MemoryRecord): {
  role: BriefRole;
  source: "reviewed" | "inferred";
} {
  if (memory.briefRole) return { role: memory.briefRole, source: "reviewed" };
  return { role: FALLBACK_ROLES[memory.kind] ?? "reference", source: "inferred" };
}

function compareRecent(left: MemoryRecord, right: MemoryRecord): number {
  return (
    Date.parse(right.updatedAt) - Date.parse(left.updatedAt) || left.id.localeCompare(right.id)
  );
}

function briefItem(memory: MemoryRecord): ProjectBriefItem {
  const resolved = resolvedBriefRole(memory);
  return {
    memoryId: memory.id,
    title: memory.title,
    displayTitle: buildMemoryDisplayTitle(memory),
    summary: temporarySummary(memory),
    topic: memory.topic,
    briefRole: resolved.role,
    roleSource: resolved.source,
    stale: memory.stale,
    citationCount: memory.citations.length,
    updatedAt: memory.updatedAt,
    occurredAt: memory.narrative?.occurredAt ?? null,
    narrative: memory.narrative ?? null,
  };
}

function compareOccurred(left: MemoryRecord, right: MemoryRecord): number {
  const leftOccurred = left.narrative?.occurredAt;
  const rightOccurred = right.narrative?.occurredAt;
  if (leftOccurred && rightOccurred) {
    return Date.parse(rightOccurred) - Date.parse(leftOccurred) || compareRecent(left, right);
  }
  if (leftOccurred) return -1;
  if (rightOccurred) return 1;
  return compareRecent(left, right);
}

function handoffItem(memory: MemoryRecord): ProjectHandoffTimelineItem {
  return { ...briefItem(memory), isLegacy: !memory.narrative };
}

function coverageFor(memories: MemoryRecord[]): string {
  const relevant = memories.filter((memory) => resolvedBriefRole(memory).role !== "reference");
  if (relevant.length === 0)
    return "根据已保存记录整理：目前还没有足够的工作记录来说明这份项目资料主要覆盖什么。";
  const topics = [...new Set(relevant.map((memory) => memory.topic).filter(Boolean))].slice(0, 3);
  const titles = relevant.slice(0, 3).map((memory) => `《${buildMemoryDisplayTitle(memory)}》`);
  const subject = topics.length > 0 ? `围绕${topics.join("、")}` : "围绕最近保存的项目工作";
  return `根据已保存记录整理：这份资料主要${subject}，包括${titles.join("、")}等工作。`;
}

function startHere(memories: MemoryRecord[]): ProjectHandoffStartItem[] {
  const byRole = (role: BriefRole) =>
    memories.filter((memory) => resolvedBriefRole(memory).role === role);
  const next = byRole("next_step").sort(compareOccurred);
  const conclusions = byRole("conclusion").sort(compareOccurred);
  const progress = byRole("progress")
    .filter((memory) => Boolean(memory.narrative?.conclusion))
    .sort(compareOccurred);
  const candidates = [
    ...next.map((memory) => ({ memory, reason: "这是当前已确认要做的事。" })),
    ...conclusions.map((memory) => ({ memory, reason: "这是最近已确认、会影响当前判断的结论。" })),
    ...progress.map((memory) => ({
      memory,
      reason: "这项工作已经产出结论，能帮助你理解目前进展。",
    })),
    ...memories
      .sort(compareOccurred)
      .map((memory) => ({ memory, reason: "这是最近保存的项目记录。" })),
  ];
  const seen = new Set<string>();
  return candidates
    .filter(({ memory }) => !seen.has(memory.id) && seen.add(memory.id))
    .slice(0, 4)
    .map(({ memory, reason }) => ({ ...handoffItem(memory), reason }));
}

function buildSuggestions(
  memories: MemoryRecord[],
  sections: Map<BriefRole, ProjectBriefItem[]>,
): ProjectBriefSuggestion[] {
  const suggestions: ProjectBriefSuggestion[] = [];
  const stale = memories.filter(
    (memory) => memory.stale || memory.citations.some((citation) => citation.stale),
  );
  for (const memory of stale.slice(0, 2)) {
    suggestions.push({
      id: `suggestion:recheck:${memory.id}`,
      text: `重新核对《${buildMemoryDisplayTitle(memory)}》的来源是否仍然有效`,
      reason: "这条记忆或它引用的文件已经发生变化。",
      memoryIds: [memory.id],
    });
  }
  if ((sections.get("next_step")?.length ?? 0) === 0) {
    const risk = sections.get("risk")?.[0];
    const conclusion = sections.get("conclusion")?.[0];
    if (risk) {
      suggestions.push({
        id: `suggestion:resolve-risk:${risk.memoryId}`,
        text: `确认《${risk.displayTitle}》中的边界后，再决定下一步执行动作`,
        reason: "项目尚未保存明确的下一步，而这条风险会影响后续行动。",
        memoryIds: [risk.memoryId],
      });
    } else if (conclusion) {
      suggestions.push({
        id: `suggestion:plan:${conclusion.memoryId}`,
        text: `基于《${conclusion.displayTitle}》确认并保存下一步执行计划`,
        reason: "项目已有结论，但尚未保存明确的下一步。",
        memoryIds: [conclusion.memoryId],
      });
    }
  }
  return suggestions.slice(0, 3);
}

export function buildProjectBrief(
  projectId: string,
  projectName: string,
  graph: BriefKnowledgeGraph,
  guide: GraphGuide,
  generatedAt = new Date().toISOString(),
  limit = 12,
): ProjectBrief {
  const memories = [...graph.nodes].sort(compareRecent).slice(0, limit);
  const sections = new Map<BriefRole, ProjectBriefItem[]>([
    ["conclusion", []],
    ["progress", []],
    ["risk", []],
    ["next_step", []],
    ["reference", []],
  ]);
  for (const memory of memories) {
    const item = briefItem(memory);
    sections.get(item.briefRole)?.push(item);
  }

  const memoryById = new Map(memories.map((memory) => [memory.id, memory]));
  const recommendations = new Map<
    string,
    { title: string; displayTitle: string; reasons: string[] }
  >();
  for (const highlight of guide.highlights) {
    if (!memoryById.has(highlight.memoryId)) continue;
    const current = recommendations.get(highlight.memoryId) ?? {
      title: highlight.title,
      displayTitle: buildMemoryDisplayTitle(memoryById.get(highlight.memoryId) as MemoryRecord),
      reasons: [],
    };
    if (!current.reasons.includes(highlight.reason)) current.reasons.push(highlight.reason);
    recommendations.set(highlight.memoryId, current);
  }

  const topicIndex = new Map<string, string[]>();
  for (const memory of memories) {
    const topic = memory.topic?.trim();
    if (!topic) continue;
    topicIndex.set(topic, [...(topicIndex.get(topic) ?? []), memory.id]);
  }
  const topics = [...topicIndex]
    .filter(([, memoryIds]) => memoryIds.length >= 2)
    .sort(([left], [right]) => left.localeCompare(right, "zh-CN"))
    .map(([name, memoryIds]) => ({ name, memoryIds, memoryCount: memoryIds.length }));

  const currentConclusions = sections.get("conclusion") ?? [];
  const completedWork = sections.get("progress") ?? [];
  const risks = sections.get("risk") ?? [];
  const nextSteps = sections.get("next_step") ?? [];
  const references = sections.get("reference") ?? [];
  const citationCount = memories.reduce((total, memory) => total + memory.citations.length, 0);
  const staleCitationCount = memories.reduce(
    (total, memory) => total + memory.citations.filter((citation) => citation.stale).length,
    0,
  );

  return {
    projectId,
    projectName,
    generatedAt,
    overview: `已保存 ${memories.length} 条项目记忆，包括 ${currentConclusions.length} 项当前结论、${completedWork.length} 项已完成工作、${risks.length} 项风险边界和 ${nextSteps.length} 项已确认下一步。`,
    summary: {
      memoryCount: memories.length,
      conclusionCount: currentConclusions.length,
      progressCount: completedWork.length,
      riskCount: risks.length,
      nextStepCount: nextSteps.length,
      citationCount,
      staleMemoryCount: memories.filter((memory) => memory.stale).length,
      staleCitationCount,
    },
    currentConclusions,
    completedWork,
    risks,
    nextSteps,
    references,
    systemSuggestions: buildSuggestions(memories, sections),
    recommendedReading: [...recommendations].slice(0, 3).map(([memoryId, value]) => ({
      memoryId,
      title: value.title,
      displayTitle: value.displayTitle,
      reasons: value.reasons,
    })),
    recentUpdates: memories.slice(0, 5).map(briefItem),
    topics,
    handoff: {
      coverage: coverageFor(memories),
      startHere: startHere(memories),
      recentWork: memories
        .filter((memory) => resolvedBriefRole(memory).role !== "reference")
        .sort(compareOccurred)
        .slice(0, 5)
        .map(handoffItem),
      history: memories
        .filter((memory) => resolvedBriefRole(memory).role !== "reference")
        .sort(compareOccurred)
        .map(handoffItem),
    },
  };
}
