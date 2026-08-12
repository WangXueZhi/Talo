import { createHash } from "node:crypto";
import { buildMemoryDisplayTitle } from "./display-title.js";
import type {
  CitationRole,
  GraphGap,
  GraphGuide,
  GraphHighlight,
  GraphRelationSuggestion,
  GraphSuggestedQuestion,
  MemoryRecord,
  MemoryRelationRecord,
  RelationSuggestionSignal,
  RelationType,
} from "./types.js";

export interface GuideKnowledgeGraph {
  nodes: MemoryRecord[];
  relations: MemoryRelationRecord[];
}

const CITATION_WEIGHTS: Record<CitationRole, number> = {
  evidence: 3,
  report: 2,
  workflow: 2,
  reference: 1,
};

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

function pairKey(left: string, right: string): string {
  return [left, right].sort().join("\u0000");
}

function stableId(prefix: string, values: string[]): string {
  return `${prefix}_${createHash("sha256").update(values.join("\u0000")).digest("hex").slice(0, 16)}`;
}

function fileName(sourcePath: string): string {
  return sourcePath.split("/").at(-1) ?? sourcePath;
}

function sortedMemories(memories: MemoryRecord[]): MemoryRecord[] {
  return [...memories].sort((left, right) => left.id.localeCompare(right.id));
}

function relationDegrees(graph: GuideKnowledgeGraph): Map<string, number> {
  const degrees = new Map(graph.nodes.map((memory) => [memory.id, 0]));
  for (const relation of graph.relations) {
    degrees.set(relation.fromMemoryId, (degrees.get(relation.fromMemoryId) ?? 0) + 1);
    degrees.set(relation.toMemoryId, (degrees.get(relation.toMemoryId) ?? 0) + 1);
  }
  return degrees;
}

function connectedComponents(graph: GuideKnowledgeGraph): string[][] {
  const adjacency = new Map(graph.nodes.map((memory) => [memory.id, new Set<string>()]));
  for (const relation of graph.relations) {
    adjacency.get(relation.fromMemoryId)?.add(relation.toMemoryId);
    adjacency.get(relation.toMemoryId)?.add(relation.fromMemoryId);
  }
  const visited = new Set<string>();
  const components: string[][] = [];
  for (const memory of sortedMemories(graph.nodes)) {
    if (visited.has(memory.id)) continue;
    const component: string[] = [];
    const queue = [memory.id];
    visited.add(memory.id);
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) continue;
      component.push(current);
      for (const neighbor of adjacency.get(current) ?? []) {
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
    components.push(component.sort());
  }
  return components.sort(
    (left, right) => right.length - left.length || (left[0] ?? "").localeCompare(right[0] ?? ""),
  );
}

function buildHighlights(
  graph: GuideKnowledgeGraph,
  degrees: Map<string, number>,
): GraphHighlight[] {
  const memories = [...graph.nodes];
  const highlights: GraphHighlight[] = [];
  const select = (
    kind: GraphHighlight["kind"],
    candidates: MemoryRecord[],
    reason: (memory: MemoryRecord) => string,
    value: (memory: MemoryRecord) => number | string,
  ) => {
    const memory = candidates[0];
    if (!memory) return;
    highlights.push({
      id: `highlight:${kind}:${memory.id}`,
      kind,
      memoryId: memory.id,
      title: buildMemoryDisplayTitle(memory),
      reason: reason(memory),
      value: value(memory),
    });
  };

  const byDegree = [...memories].sort(
    (left, right) =>
      (degrees.get(right.id) ?? 0) - (degrees.get(left.id) ?? 0) ||
      right.citations.length - left.citations.length ||
      left.id.localeCompare(right.id),
  );
  if ((degrees.get(byDegree[0]?.id ?? "") ?? 0) > 0) {
    select(
      "connected",
      byDegree,
      (memory) => `连接 ${degrees.get(memory.id) ?? 0} 条已审核关系`,
      (memory) => degrees.get(memory.id) ?? 0,
    );
  }
  select(
    "evidence",
    [...memories].sort(
      (left, right) =>
        right.citations.length - left.citations.length || left.id.localeCompare(right.id),
    ),
    (memory) => `记录 ${memory.citations.length} 个可追溯来源`,
    (memory) => memory.citations.length,
  );
  select(
    "recent",
    [...memories].sort(
      (left, right) =>
        Date.parse(right.updatedAt) - Date.parse(left.updatedAt) || left.id.localeCompare(right.id),
    ),
    (memory) => `最近更新于 ${memory.updatedAt}`,
    (memory) => memory.updatedAt,
  );
  return highlights;
}

function buildRelationSuggestions(
  projectId: string,
  graph: GuideKnowledgeGraph,
  limit: number,
): GraphRelationSuggestion[] {
  const memories = sortedMemories(graph.nodes.filter((memory) => memory.projectId === projectId));
  if (memories.length < 2) return [];
  const existingPairs = new Set(
    graph.relations.map((relation) => pairKey(relation.fromMemoryId, relation.toMemoryId)),
  );
  const signalsByPair = new Map<string, RelationSuggestionSignal[]>();
  const memoryById = new Map(memories.map((memory) => [memory.id, memory]));
  const addSignal = (leftId: string, rightId: string, signal: RelationSuggestionSignal) => {
    if (leftId === rightId || existingPairs.has(pairKey(leftId, rightId))) return;
    const key = pairKey(leftId, rightId);
    const signals = signalsByPair.get(key) ?? [];
    if (!signals.some((candidate) => candidate.key === signal.key)) signals.push(signal);
    signalsByPair.set(key, signals);
  };

  const citationIndex = new Map<
    string,
    Array<{ memoryId: string; role: CitationRole; sourceProjectId: string; sourcePath: string }>
  >();
  for (const memory of memories) {
    const seen = new Set<string>();
    for (const citation of memory.citations) {
      if (!citation.accessible) continue;
      const key = `${citation.sourceProjectId}\u0000${citation.sourcePath}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const indexed = citationIndex.get(key) ?? [];
      indexed.push({
        memoryId: memory.id,
        role: citation.role,
        sourceProjectId: citation.sourceProjectId,
        sourcePath: citation.sourcePath,
      });
      citationIndex.set(key, indexed);
    }
  }
  for (const [key, references] of citationIndex) {
    if (references.length / memories.length > 0.6) continue;
    for (let leftIndex = 0; leftIndex < references.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < references.length; rightIndex += 1) {
        const left = references[leftIndex];
        const right = references[rightIndex];
        if (!left || !right) continue;
        const role =
          CITATION_WEIGHTS[left.role] >= CITATION_WEIGHTS[right.role] ? left.role : right.role;
        addSignal(left.memoryId, right.memoryId, {
          kind: "shared_citation",
          key: `citation:${key}`,
          label: `共享${role === "evidence" ? "证据" : role === "report" ? "报告" : role === "workflow" ? "流程" : "参考"}：${fileName(left.sourcePath)}`,
          weight: CITATION_WEIGHTS[role],
          role,
          sourceProjectId: left.sourceProjectId,
          sourcePath: left.sourcePath,
        });
      }
    }
  }

  const topicIndex = new Map<string, string[]>();
  for (const memory of memories) {
    const topic = memory.topic?.trim();
    if (!topic) continue;
    topicIndex.set(topic, [...(topicIndex.get(topic) ?? []), memory.id]);
  }
  for (const [topic, memoryIds] of topicIndex) {
    for (let leftIndex = 0; leftIndex < memoryIds.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < memoryIds.length; rightIndex += 1) {
        const leftId = memoryIds[leftIndex];
        const rightId = memoryIds[rightIndex];
        if (!leftId || !rightId) continue;
        addSignal(leftId, rightId, {
          kind: "same_topic",
          key: `topic:${topic}`,
          label: `同属主题：${topic}`,
          weight: 2,
        });
      }
    }
  }

  const tagFrequency = new Map<string, number>();
  for (const memory of memories) {
    for (const tag of new Set(memory.tags.map((value) => value.trim()).filter(Boolean))) {
      tagFrequency.set(tag, (tagFrequency.get(tag) ?? 0) + 1);
    }
  }
  for (let leftIndex = 0; leftIndex < memories.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < memories.length; rightIndex += 1) {
      const left = memories[leftIndex];
      const right = memories[rightIndex];
      if (!left || !right) continue;
      const rightTags = new Set(right.tags);
      const shared = [...new Set(left.tags)]
        .filter(
          (tag) => rightTags.has(tag) && (tagFrequency.get(tag) ?? 0) / memories.length <= 0.5,
        )
        .sort();
      if (shared.length < 2) continue;
      for (const tag of shared.slice(0, 2)) {
        addSignal(left.id, right.id, {
          kind: "shared_tag",
          key: `tag:${tag}`,
          label: `共享标签：${tag}`,
          weight: 1,
        });
      }
    }
  }

  const suggestions: GraphRelationSuggestion[] = [];
  for (const [key, rawSignals] of signalsByPair) {
    const [fromMemoryId, toMemoryId] = key.split("\u0000");
    if (
      !fromMemoryId ||
      !toMemoryId ||
      !memoryById.has(fromMemoryId) ||
      !memoryById.has(toMemoryId)
    )
      continue;
    const signals = [...rawSignals].sort(
      (left, right) => right.weight - left.weight || left.key.localeCompare(right.key),
    );
    const score = signals.reduce((total, signal) => total + signal.weight, 0);
    if (score < 2) continue;
    const signalKeys = signals.map((signal) => signal.key).sort();
    suggestions.push({
      id: stableId("hint", [projectId, fromMemoryId, toMemoryId, ...signalKeys]),
      projectId,
      fromMemoryId,
      toMemoryId,
      type: "related_to",
      rationale: signals.map((signal) => signal.label).join("；"),
      score,
      signals,
    });
  }
  return suggestions
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.fromMemoryId.localeCompare(right.fromMemoryId) ||
        left.toMemoryId.localeCompare(right.toMemoryId),
    )
    .slice(0, Math.max(1, Math.min(limit, 50)));
}

function buildGaps(graph: GuideKnowledgeGraph, degrees: Map<string, number>): GraphGap[] {
  const gaps: GraphGap[] = [];
  for (const memory of sortedMemories(graph.nodes)) {
    if ((degrees.get(memory.id) ?? 0) === 0) {
      gaps.push({
        id: `gap:isolated:${memory.id}`,
        kind: "isolated",
        memoryIds: [memory.id],
        message: `“${buildMemoryDisplayTitle(memory)}”尚未连接任何已审核关系。`,
      });
    }
    if (memory.stale) {
      gaps.push({
        id: `gap:stale-memory:${memory.id}`,
        kind: "stale_memory",
        memoryIds: [memory.id],
        message: `“${buildMemoryDisplayTitle(memory)}”已过期：${memory.staleReason ?? "来源发生变化"}`,
      });
    }
    const staleCitations = memory.citations.filter((citation) => citation.stale);
    if (staleCitations.length > 0) {
      gaps.push({
        id: `gap:stale-citation:${memory.id}`,
        kind: "stale_citation",
        memoryIds: [memory.id],
        message: `“${buildMemoryDisplayTitle(memory)}”有 ${staleCitations.length} 个来源已失效。`,
      });
    }
  }
  return gaps;
}

function buildSuggestedQuestions(
  graph: GuideKnowledgeGraph,
  suggestions: GraphRelationSuggestion[],
  degrees: Map<string, number>,
): GraphSuggestedQuestion[] {
  const memoryById = new Map(graph.nodes.map((memory) => [memory.id, memory]));
  const questions: GraphSuggestedQuestion[] = [];
  for (const relation of graph.relations) {
    const from = memoryById.get(relation.fromMemoryId);
    const to = memoryById.get(relation.toMemoryId);
    if (!from || !to) continue;
    const fromTitle = buildMemoryDisplayTitle(from);
    const toTitle = buildMemoryDisplayTitle(to);
    const question =
      relation.type === "causes"
        ? `“${fromTitle}”为什么是“${toTitle}”的原因？`
        : `“${fromTitle}”如何${RELATION_LABELS[relation.type]}“${toTitle}”？`;
    questions.push({
      id: `question:relation:${relation.id}`,
      question,
      why: `已有一条已审核的${RELATION_LABELS[relation.type]}关系，可沿关系理由和来源继续追溯。`,
      memoryIds: [from.id, to.id],
    });
  }
  for (const suggestion of suggestions) {
    const from = memoryById.get(suggestion.fromMemoryId);
    const to = memoryById.get(suggestion.toMemoryId);
    if (!from || !to) continue;
    questions.push({
      id: `question:suggestion:${suggestion.id}`,
      question: `“${buildMemoryDisplayTitle(from)}”与“${buildMemoryDisplayTitle(to)}”之间是否缺少一条正式关系？`,
      why: suggestion.rationale,
      memoryIds: [from.id, to.id],
    });
  }
  for (const memory of sortedMemories(graph.nodes)) {
    if ((degrees.get(memory.id) ?? 0) !== 0) continue;
    questions.push({
      id: `question:isolated:${memory.id}`,
      question: `“${buildMemoryDisplayTitle(memory)}”应与哪些已有记忆建立联系？`,
      why: "该记忆当前是孤立节点，可能存在尚未审核的知识联系。",
      memoryIds: [memory.id],
    });
  }
  return questions.slice(0, 5);
}

export function analyzeKnowledgeGraph(
  projectId: string,
  projectName: string,
  graph: GuideKnowledgeGraph,
  generatedAt = new Date().toISOString(),
  relationSuggestionLimit = 12,
): GraphGuide {
  const degrees = relationDegrees(graph);
  const components = connectedComponents(graph);
  const relationSuggestions = buildRelationSuggestions(projectId, graph, relationSuggestionLimit);
  const topics = new Map<string, MemoryRecord[]>();
  for (const memory of graph.nodes) {
    const topic = memory.topic ?? "未分组";
    topics.set(topic, [...(topics.get(topic) ?? []), memory]);
  }
  return {
    projectId,
    projectName,
    generatedAt,
    summary: {
      memoryCount: graph.nodes.length,
      formalRelationCount: graph.relations.length,
      citationCount: graph.nodes.reduce((total, memory) => total + memory.citations.length, 0),
      staleMemoryCount: graph.nodes.filter((memory) => memory.stale).length,
      staleCitationCount: graph.nodes.reduce(
        (total, memory) => total + memory.citations.filter((citation) => citation.stale).length,
        0,
      ),
      componentCount: components.length,
      isolatedCount: graph.nodes.filter((memory) => (degrees.get(memory.id) ?? 0) === 0).length,
    },
    topics: [...topics]
      .sort(([left], [right]) => left.localeCompare(right, "zh-CN"))
      .map(([name, memories]) => ({
        name,
        memoryIds: sortedMemories(memories).map((memory) => memory.id),
        memoryCount: memories.length,
        staleCount: memories.filter((memory) => memory.stale).length,
      })),
    highlights: buildHighlights(graph, degrees),
    gaps: buildGaps(graph, degrees),
    suggestedQuestions: buildSuggestedQuestions(graph, relationSuggestions, degrees),
    relationSuggestions,
  };
}
