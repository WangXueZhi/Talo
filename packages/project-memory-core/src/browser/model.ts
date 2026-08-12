import type {
  BrowserMemory,
  BrowserRelation,
  CitationRole,
  EventCausalityView,
  EventPathView,
  EventRelationItem,
  GraphElement,
  GraphFilters,
  GraphViewData,
  MemoryKind,
  RelationType,
  TimelineDayGroup,
  TimelineDayWorkUnit,
  TimelineWorkUnit,
} from "./types.js";
import type { BriefRole, MemoryPhase } from "../types.js";
import { buildContextualMemoryDisplayTitles } from "../display-title.js";

export const RELATION_META: Record<
  RelationType,
  { label: string; color: string; lineStyle: "solid" | "dashed"; directed: boolean }
> = {
  related_to: { label: "相关", color: "#c7d2fe", lineStyle: "solid", directed: false },
  observes: { label: "注意到", color: "#22d3ee", lineStyle: "solid", directed: true },
  causes: { label: "原因", color: "#f97316", lineStyle: "solid", directed: true },
  depends_on: { label: "依赖", color: "#38bdf8", lineStyle: "solid", directed: true },
  supports: { label: "支持", color: "#34d399", lineStyle: "solid", directed: true },
  contradicts: { label: "矛盾", color: "#fb7185", lineStyle: "dashed", directed: false },
  supersedes: { label: "替代", color: "#f59e0b", lineStyle: "solid", directed: true },
  derived_from: { label: "来源于", color: "#c084fc", lineStyle: "dashed", directed: true },
};

export const KIND_LABELS: Record<MemoryKind, string> = {
  architecture: "架构",
  decision: "决策",
  workflow: "流程",
  convention: "约定",
  pitfall: "风险",
  status: "状态",
};

export const CITATION_LABELS: Record<CitationRole, string> = {
  evidence: "证据",
  report: "报告",
  workflow: "流程",
  reference: "参考",
};

export const PHASE_LABELS: Record<MemoryPhase, string> = {
  context: "背景",
  data_collection: "数据采集",
  analysis: "分析复盘",
  decision: "决策",
  execution: "执行",
  verification: "验证纠偏",
  handoff: "交接",
  learning: "沉淀规范",
  risk: "风险",
  next_step: "下一步",
  other: "其他",
};

export const BRIEF_ROLE_LABELS: Record<BriefRole, string> = {
  conclusion: "已确认",
  progress: "进展",
  risk: "需要注意",
  next_step: "下一步",
  reference: "资料",
};

export function submitterLabel(memory: Pick<BrowserMemory, "submittedBy">): string {
  const platform = memory.submittedBy?.platform.trim();
  if (!platform || platform.toLocaleLowerCase() === "legacy") return "历史记录";
  switch (platform.toLocaleLowerCase()) {
    case "codex":
      return "Codex 提交";
    case "antigravity":
      return "Antigravity 提交";
    case "claude":
    case "claude-code":
      return "Claude Code 提交";
    case "generic":
      return "通用 Agent 提交";
    default:
      return `${platform} 提交`;
  }
}

export function submitterClass(memory: Pick<BrowserMemory, "submittedBy">): string {
  const platform = memory.submittedBy?.platform.trim().toLocaleLowerCase();
  if (!platform || platform === "legacy") return "submitter-legacy";
  if (platform === "claude" || platform === "claude-code") return "submitter-claude";
  if (["codex", "antigravity", "generic"].includes(platform)) {
    return `submitter-${platform}`;
  }
  return "submitter-other";
}

export function eventTime(memory: BrowserMemory, generatedAt?: string): string {
  const occurredAt = memory.narrative?.occurredAt;
  if (!occurredAt) return memory.updatedAt;

  const occurredAtTimestamp = Date.parse(occurredAt);
  const generatedAtTimestamp = generatedAt ? Date.parse(generatedAt) : Number.NaN;
  if (
    Number.isNaN(occurredAtTimestamp) ||
    (!Number.isNaN(generatedAtTimestamp) && occurredAtTimestamp > generatedAtTimestamp)
  ) {
    return memory.updatedAt;
  }
  const createdAtTimestamp = memory.createdAt ? Date.parse(memory.createdAt) : Number.NaN;
  if (
    occurredAt.endsWith("Z") &&
    !Number.isNaN(createdAtTimestamp) &&
    Math.abs(occurredAtTimestamp - createdAtTimestamp - 8 * 60 * 60 * 1000) <= 15 * 60 * 1000
  ) {
    return `${occurredAt.slice(0, -1)}+08:00`;
  }
  return occurredAt;
}

function isDateOnlyOccurredAt(memory: BrowserMemory, generatedAt?: string): boolean {
  const occurredAt = memory.narrative?.occurredAt;
  return Boolean(
    occurredAt &&
      eventTime(memory, generatedAt) === occurredAt &&
      /T00:00(?::00(?:\.000)?)?Z$/u.test(occurredAt),
  );
}

export function timelineTimeLabel(memory: BrowserMemory, generatedAt?: string): string {
  if (isDateOnlyOccurredAt(memory, generatedAt)) return "时分未记录";
  const value = eventTime(memory, generatedAt);
  const match = value.match(/T(\d{2}:\d{2})/u);
  return match?.[1] ?? "时分未记录";
}

export function eventDateTimeLabel(memory: BrowserMemory, generatedAt?: string): string {
  const value = eventTime(memory, generatedAt);
  const date = value.slice(0, 10);
  const time = timelineTimeLabel(memory, generatedAt);
  return time === "时分未记录" ? `${date} · 时分未记录` : `${date} ${time}`;
}

function timelineSortValue(memory: BrowserMemory, generatedAt: string): string {
  return eventTime(memory, generatedAt);
}

function dateOnly(value: string): string {
  return value.slice(0, 10);
}

function eventDate(memory: BrowserMemory, generatedAt: string): string {
  const occurredAt = memory.narrative?.occurredAt;
  if (occurredAt && Date.parse(occurredAt) <= Date.parse(generatedAt)) {
    return dateOnly(occurredAt);
  }
  return dateOnly(eventTime(memory, generatedAt));
}

const PHASE_ORDER: MemoryPhase[] = [
  "context",
  "data_collection",
  "analysis",
  "decision",
  "execution",
  "verification",
  "handoff",
  "learning",
  "risk",
  "next_step",
  "other",
];

export function buildContextualEventTitles(memories: BrowserMemory[]): Map<string, string> {
  return buildContextualMemoryDisplayTitles(memories);
}

function workUnitTitle(memories: BrowserMemory[], ungrouped: boolean, generatedAt: string): string {
  if (ungrouped) return "未归组事件";
  const topicCounts = new Map<string, number>();
  for (const memory of memories) {
    if (memory.topic) topicCounts.set(memory.topic, (topicCounts.get(memory.topic) ?? 0) + 1);
  }
  const topic = [...topicCounts].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "zh-CN"))[0]?.[0] ?? "项目工作单元";
  const dates = memories.map((memory) => dateOnly(eventTime(memory, generatedAt))).sort();
  return dates[0] ? `${topic} · ${dates[0]}` : topic;
}

function workUnitLabel(memories: BrowserMemory[], ungrouped: boolean): string {
  if (ungrouped) return "未归组";
  const topicCounts = new Map<string, number>();
  for (const memory of memories) {
    if (memory.topic) topicCounts.set(memory.topic, (topicCounts.get(memory.topic) ?? 0) + 1);
  }
  return [...topicCounts].sort(
    (left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "zh-CN"),
  )[0]?.[0] ?? "项目工作单元";
}

function timelineMemories(data: GraphViewData): BrowserMemory[] {
  return data.memories.filter(
    (memory) => memory.briefRole !== "reference" || Boolean(memory.narrative),
  );
}

export function buildTimelineDayGroups(data: GraphViewData): TimelineDayGroup[] {
  const memories = timelineMemories(data);
  const titles = buildContextualEventTitles(memories);
  const workUnits = new Map<string, BrowserMemory[]>();
  for (const memory of memories) {
    const key = memory.workUnitId ?? "__ungrouped__";
    const group = workUnits.get(key) ?? [];
    group.push(memory);
    workUnits.set(key, group);
  }
  const relationTitles = new Map(memories.map((memory) => [memory.id, titles.get(memory.id) ?? memory.displayTitle]));
  const relationByMemory = new Map<string, Array<{ type: RelationType; fromMemoryId: string; fromTitle: string; rationale: string }>>();
  for (const relation of data.relations) {
    const fromTitle = relationTitles.get(relation.fromMemoryId);
    const toTitle = relationTitles.get(relation.toMemoryId);
    if (fromTitle && toTitle) {
      const targetLinks = relationByMemory.get(relation.toMemoryId) ?? [];
      targetLinks.push({ type: relation.type, fromMemoryId: relation.fromMemoryId, fromTitle, rationale: relation.rationale });
      relationByMemory.set(relation.toMemoryId, targetLinks);
      const sourceLinks = relationByMemory.get(relation.fromMemoryId) ?? [];
      sourceLinks.push({ type: relation.type, fromMemoryId: relation.toMemoryId, fromTitle: toTitle, rationale: relation.rationale });
      relationByMemory.set(relation.fromMemoryId, sourceLinks);
    }
  }
  const sorted = [...memories].sort((left, right) => {
    const timeOrder = timelineSortValue(right, data.generatedAt).localeCompare(timelineSortValue(left, data.generatedAt));
    if (timeOrder) return timeOrder;
    const sequenceOrder = (right.sequence ?? -1) - (left.sequence ?? -1);
    if (sequenceOrder) return sequenceOrder;
    return right.id.localeCompare(left.id);
  });
  const groups = new Map<string, TimelineDayGroup["events"]>();
  for (const memory of sorted) {
    const date = eventDate(memory, data.generatedAt);
    const events = groups.get(date) ?? [];
    const key = memory.workUnitId ?? "__ungrouped__";
    const unitMemories = workUnits.get(key) ?? [memory];
    events.push({
      memory,
      displayTitle: titles.get(memory.id) ?? memory.displayTitle,
      occurredAt: eventTime(memory, data.generatedAt),
      sequence: memory.sequence ?? null,
      workUnitLabel: workUnitLabel(unitMemories, key === "__ungrouped__"),
      ungrouped: key === "__ungrouped__",
      timeLabel: timelineTimeLabel(memory, data.generatedAt),
      incomingRelations: (relationByMemory.get(memory.id) ?? []).filter((relation) =>
        unitMemories.some((candidate) => candidate.id === relation.fromMemoryId),
      ),
    });
    groups.set(date, events);
  }
  return [...groups].map(([date, events]) => {
    const unitLabels = [...new Set(events.map((event) => event.workUnitLabel))];
    const phaseCounts = new Map<MemoryPhase, number>();
    for (const event of events) {
      const phase = event.memory.phase ?? "other";
      phaseCounts.set(phase, (phaseCounts.get(phase) ?? 0) + 1);
    }
    const workUnitGroups = new Map<string, TimelineDayGroup["events"]>();
    for (const event of events) {
      const key = event.memory.workUnitId ?? "__ungrouped__";
      const group = workUnitGroups.get(key) ?? [];
      group.push(event);
      workUnitGroups.set(key, group);
    }
    const workUnits: TimelineDayWorkUnit[] = [...workUnitGroups].map(([id, unitEvents]) => {
      const orderedEvents = [...unitEvents].sort(
        (left, right) =>
          (left.sequence ?? Number.MAX_SAFE_INTEGER) - (right.sequence ?? Number.MAX_SAFE_INTEGER) ||
          left.occurredAt.localeCompare(right.occurredAt) ||
          left.memory.id.localeCompare(right.memory.id),
      );
      return {
        id,
        label: orderedEvents[0]?.workUnitLabel ?? "未归组",
        latestAt: unitEvents.map((event) => event.occurredAt).sort().at(-1) ?? "",
        events: orderedEvents.map((event, index) => ({
          ...event,
          incomingRelations: event.incomingRelations.filter((relation) =>
            orderedEvents.slice(0, index).some((candidate) => candidate.memory.id === relation.fromMemoryId),
          ),
        })),
        ungrouped: id === "__ungrouped__",
      };
    }).sort((left, right) => right.latestAt.localeCompare(left.latestAt) || left.label.localeCompare(right.label, "zh-CN"));
    return {
      date,
      eventCount: events.length,
      workUnitCount: unitLabels.length,
      workUnitLabels: unitLabels,
      phases: PHASE_ORDER.flatMap((phase) => {
        const count = phaseCounts.get(phase);
        return count ? [{ phase, count }] : [];
      }),
      events,
      workUnits,
      latestMemoryId: events[0]?.memory.id ?? null,
    } satisfies TimelineDayGroup;
  }).sort((left, right) => right.date.localeCompare(left.date));
}

function workUnitStatus(memories: BrowserMemory[]): string {
  if (memories.some((memory) => memory.stale)) return "含过期记录";
  const latest = memories.at(-1);
  if (!latest) return "暂无事件";
  if (latest.phase === "risk") return "需要关注";
  if (latest.phase === "next_step" || latest.phase === "decision" || latest.phase === "execution") return "进行中";
  if (["verification", "learning", "handoff"].includes(latest.phase ?? "")) return "已形成闭环";
  return "已记录";
}

export function buildTimelineWorkUnits(data: GraphViewData): TimelineWorkUnit[] {
  const titles = buildContextualEventTitles(data.memories);
  const groups = new Map<string, BrowserMemory[]>();
  for (const memory of data.memories) {
    const key = memory.workUnitId ?? "__ungrouped__";
    const list = groups.get(key) ?? [];
    list.push(memory);
    groups.set(key, list);
  }
  const units = [...groups].map(([id, memories]) => {
    memories.sort((left, right) => {
      const leftTime = eventTime(left, data.generatedAt);
      const rightTime = eventTime(right, data.generatedAt);
      return leftTime.localeCompare(rightTime) || (left.sequence ?? Number.MAX_SAFE_INTEGER) - (right.sequence ?? Number.MAX_SAFE_INTEGER) || left.id.localeCompare(right.id);
    });
    const memoryIds = new Set(memories.map((memory) => memory.id));
    const dates = memories.map((memory) => eventTime(memory, data.generatedAt)).sort();
    const ungrouped = id === "__ungrouped__";
    return {
      id,
      title: workUnitTitle(memories, ungrouped, data.generatedAt),
      startAt: dates[0] ?? "",
      endAt: dates.at(-1) ?? "",
      status: workUnitStatus(memories),
      formalRelationCount: data.relations.filter((relation) => memoryIds.has(relation.fromMemoryId) && memoryIds.has(relation.toMemoryId)).length,
      events: memories.map((memory) => ({ memory, displayTitle: titles.get(memory.id) ?? memory.displayTitle, occurredAt: eventTime(memory, data.generatedAt), sequence: memory.sequence ?? null })),
      ungrouped,
    } satisfies TimelineWorkUnit;
  });
  return units.sort((left, right) => Number(left.ungrouped) - Number(right.ungrouped) || right.endAt.localeCompare(left.endAt) || left.title.localeCompare(right.title, "zh-CN"));
}

export function buildEventPathView(
  data: GraphViewData,
  focusMemoryId: string,
): EventPathView | null {
  const titles = buildContextualEventTitles(data.memories);
  const withEventTitle = (memory: BrowserMemory): BrowserMemory => ({
    ...memory,
    displayTitle: titles.get(memory.id) ?? memory.displayTitle,
  });
  const storedFocus = data.memories.find((memory) => memory.id === focusMemoryId);
  if (!storedFocus) return null;
  const focus = withEventTitle(storedFocus);
  const baseIds = storedFocus.workUnitId
    ? new Set(
        data.memories
          .filter((memory) => memory.workUnitId === storedFocus.workUnitId)
          .map((memory) => memory.id),
      )
    : reachableMemoryIds(data, focusMemoryId, 2);
  const selectedIds = new Set(baseIds);
  const externalIds = new Set<string>();
  if (focus.workUnitId) {
    for (const relation of data.relations) {
      const fromInside = baseIds.has(relation.fromMemoryId);
      const toInside = baseIds.has(relation.toMemoryId);
      if (fromInside === toInside) continue;
      const externalId = fromInside ? relation.toMemoryId : relation.fromMemoryId;
      selectedIds.add(externalId);
      externalIds.add(externalId);
    }
  }
  const memories = data.memories
    .filter((memory) => selectedIds.has(memory.id))
    .map(withEventTitle)
    .sort((left, right) => {
      const phaseOrder = PHASE_ORDER.indexOf(left.phase ?? "other") - PHASE_ORDER.indexOf(right.phase ?? "other");
      return phaseOrder || eventTime(left, data.generatedAt).localeCompare(eventTime(right, data.generatedAt)) || left.id.localeCompare(right.id);
    });
  const memoryIds = new Set(memories.map((memory) => memory.id));
  const relations = data.relations.filter(
    (relation) => memoryIds.has(relation.fromMemoryId) && memoryIds.has(relation.toMemoryId),
  );
  const suggestions = data.guide.relationSuggestions.filter(
    (suggestion) => memoryIds.has(suggestion.fromMemoryId) || memoryIds.has(suggestion.toMemoryId),
  );
  const workUnitMemories = storedFocus.workUnitId
    ? data.memories.filter((memory) => memory.workUnitId === storedFocus.workUnitId)
    : [storedFocus];
  return {
    focusMemoryId,
    focus,
    workUnitId: focus.workUnitId ?? null,
    workUnitLabel: workUnitLabel(workUnitMemories, !focus.workUnitId),
    memories,
    relations,
    externalMemoryIds: [...externalIds],
    suggestions,
  };
}

function relationItem(
  relation: BrowserRelation,
  memory: BrowserMemory,
  focus: BrowserMemory,
): EventRelationItem {
  const from = relation.fromMemoryId === focus.id ? focus.displayTitle : memory.displayTitle;
  const to = relation.toMemoryId === focus.id ? focus.displayTitle : memory.displayTitle;
  return { relation, memory, sentence: relationSentence(relation, from, to) };
}

export function buildEventCausalityView(
  data: GraphViewData,
  memoryId: string,
): EventCausalityView | null {
  const titles = buildContextualEventTitles(data.memories);
  const withEventTitle = (memory: BrowserMemory): BrowserMemory => ({
    ...memory,
    displayTitle: titles.get(memory.id) ?? memory.displayTitle,
  });
  const storedMemory = data.memories.find((candidate) => candidate.id === memoryId);
  if (!storedMemory) return null;
  const memory = withEventTitle(storedMemory);
  const causes: EventRelationItem[] = [];
  const effects: EventRelationItem[] = [];
  const related: EventRelationItem[] = [];
  const contradictions: EventRelationItem[] = [];
  for (const relation of data.relations) {
    if (relation.fromMemoryId !== memoryId && relation.toMemoryId !== memoryId) continue;
    const otherId = relation.fromMemoryId === memoryId ? relation.toMemoryId : relation.fromMemoryId;
    const storedOther = data.memories.find((candidate) => candidate.id === otherId);
    if (!storedOther) continue;
    const item = relationItem(relation, withEventTitle(storedOther), memory);
    if (relation.type === "related_to") related.push(item);
    else if (relation.type === "contradicts") contradictions.push(item);
    else {
      const focusIsSource = relation.fromMemoryId === memoryId;
      const sourceMeansDownstream = relation.type === "depends_on" || relation.type === "derived_from" || relation.type === "supersedes";
      const isCause = focusIsSource ? sourceMeansDownstream : !sourceMeansDownstream;
      (isCause ? causes : effects).push(item);
    }
  }
  const newestFirst = (left: EventRelationItem, right: EventRelationItem) =>
    eventTime(right.memory, data.generatedAt).localeCompare(eventTime(left.memory, data.generatedAt)) || left.memory.id.localeCompare(right.memory.id);
  causes.sort(newestFirst);
  effects.sort(newestFirst);
  related.sort(newestFirst);
  contradictions.sort(newestFirst);
  return {
    memory,
    causes,
    effects,
    related,
    contradictions,
    suggestions: data.guide.relationSuggestions.filter(
      (suggestion) => suggestion.fromMemoryId === memoryId || suggestion.toMemoryId === memoryId,
    ),
  };
}

export function localGraphMemories(
  data: GraphViewData,
  focusMemoryId: string | null,
  scope: "work_unit" | "event" | "two_hops" | "all",
): BrowserMemory[] {
  if (!focusMemoryId || scope === "all") return data.memories;
  if (scope === "event" || scope === "two_hops") {
    const ids = reachableMemoryIds(data, focusMemoryId, scope === "event" ? 1 : 2);
    return data.memories.filter((memory) => ids.has(memory.id));
  }
  const focus = data.memories.find((memory) => memory.id === focusMemoryId);
  if (!focus?.workUnitId) return data.memories.filter((memory) => reachableMemoryIds(data, focusMemoryId, 1).has(memory.id));
  return data.memories.filter((memory) => memory.workUnitId === focus.workUnitId);
}

export function relationSentence(
  relation: BrowserRelation,
  fromTitle: string,
  toTitle: string,
): string {
  switch (relation.type) {
    case "related_to":
      return `《${fromTitle}》与《${toTitle}》有关联`;
    case "observes":
      return `《${fromTitle}》注意到《${toTitle}》`;
    case "causes":
      return `《${fromTitle}》是《${toTitle}》的原因`;
    case "depends_on":
      return `《${fromTitle}》依赖《${toTitle}》`;
    case "supports":
      return `《${fromTitle}》为《${toTitle}》提供支持`;
    case "contradicts":
      return `《${fromTitle}》与《${toTitle}》存在矛盾`;
    case "supersedes":
      return `《${fromTitle}》替代《${toTitle}》`;
    case "derived_from":
      return `《${fromTitle}》的依据来自《${toTitle}》`;
  }
}

export const TOPIC_COLORS = [
  "#67e8f9",
  "#34d399",
  "#fbbf24",
  "#fb7185",
  "#a78bfa",
  "#60a5fa",
  "#f472b6",
  "#2dd4bf",
] as const;

function hashTopic(value: string): number {
  let hash = 0;
  for (const character of value) hash = (hash * 31 + (character.codePointAt(0) ?? 0)) >>> 0;
  return hash;
}

export function topicColor(topic: string): string {
  return TOPIC_COLORS[hashTopic(topic) % TOPIC_COLORS.length] ?? TOPIC_COLORS[0];
}

export function memorySummary(memory: BrowserMemory): string {
  const fallback = memory.content.split(/[。！？.!?]\s*/u)[0] ?? memory.content;
  return (memory.summary ?? fallback).trim().slice(0, 160);
}

function truncate(value: string, length: number): string {
  return value.length > length ? `${value.slice(0, length - 1)}…` : value;
}

export function matchesMemory(memory: BrowserMemory, rawQuery: string): boolean {
  const query = rawQuery.trim().toLocaleLowerCase("zh-CN");
  if (!query) return true;
  const citations = memory.citations
    .flatMap((citation) => [citation.sourcePath, citation.locator ?? "", citation.note ?? ""])
    .join(" ");
  return [
    memory.displayTitle ?? memory.title,
    memory.title,
    memory.summary ?? "",
    memory.content,
    memory.topic ?? "",
    memory.tags.join(" "),
    citations,
  ]
    .join(" ")
    .toLocaleLowerCase("zh-CN")
    .includes(query);
}

export function reachableMemoryIds(
  data: GraphViewData,
  startId: string,
  maxDepth: number,
): Set<string> {
  const visited = new Set<string>([startId]);
  let frontier = [startId];
  for (let depth = 0; depth < maxDepth && frontier.length > 0; depth += 1) {
    const next: string[] = [];
    for (const relation of data.relations) {
      for (const current of frontier) {
        const neighbor =
          relation.fromMemoryId === current
            ? relation.toMemoryId
            : relation.toMemoryId === current
              ? relation.fromMemoryId
              : null;
        if (neighbor && !visited.has(neighbor)) {
          visited.add(neighbor);
          next.push(neighbor);
        }
      }
    }
    frontier = next;
  }
  return visited;
}

export function visibleMemories(
  data: GraphViewData,
  filters: GraphFilters,
  focusMemoryId: string | null,
  sourceMemories: BrowserMemory[] = data.memories,
): BrowserMemory[] {
  const reachable =
    focusMemoryId && filters.focusDepth !== "all"
      ? reachableMemoryIds(data, focusMemoryId, Number(filters.focusDepth))
      : null;
  return sourceMemories.filter((memory) => {
    if (filters.topic && memory.topic !== filters.topic) return false;
    if (filters.kind && memory.kind !== filters.kind) return false;
    if (filters.stale === "active" && memory.stale) return false;
    if (filters.stale === "stale" && !memory.stale) return false;
    if (reachable && !reachable.has(memory.id)) return false;
    return true;
  });
}

export function buildGraphElements(
  data: GraphViewData,
  memories: BrowserMemory[],
  relationFilter: string,
  expandedMemoryId: string | null,
  showSuggestions = false,
): GraphElement[] {
  const memoryIds = new Set(memories.map((memory) => memory.id));
  const adjacency = new Map(memories.map((memory) => [memory.id, new Set<string>()]));
  const degree = new Map(memories.map((memory) => [memory.id, 0]));
  for (const relation of data.relations) {
    if (!memoryIds.has(relation.fromMemoryId) || !memoryIds.has(relation.toMemoryId)) continue;
    degree.set(relation.fromMemoryId, (degree.get(relation.fromMemoryId) ?? 0) + 1);
    degree.set(relation.toMemoryId, (degree.get(relation.toMemoryId) ?? 0) + 1);
  }
  const labelCount = Math.max(1, Math.ceil(memories.length * 0.2));
  const labeledIds = new Set(
    memories
      .slice()
      .sort(
        (left, right) =>
          (degree.get(right.id) ?? 0) - (degree.get(left.id) ?? 0) ||
          right.citations.length - left.citations.length ||
          left.id.localeCompare(right.id),
      )
      .slice(0, labelCount)
      .map((memory) => memory.id),
  );
  const showAllLabels = memories.length <= 12;
  const elements: GraphElement[] = memories.map((memory) => {
    const displayTitle = memory.displayTitle ?? memory.title;
    return {
      group: "nodes",
      data: {
      id: memory.id,
      nodeType: "memory",
      memoryId: memory.id,
      label: truncate(displayTitle, 28),
      summary: memorySummary(memory),
      title: displayTitle,
      topic: memory.topic ?? "未分组",
      kind: memory.kind,
      stale: memory.stale,
      citationCount: memory.citations.length,
      confidence: memory.confidence,
      degree: degree.get(memory.id) ?? 0,
      nodeSize:
        7 +
        Math.min(5, (degree.get(memory.id) ?? 0) * 2) +
        Math.min(3, Math.floor(memory.citations.length / 4)),
      topicColor: topicColor(memory.topic ?? "未分组"),
      },
      classes:
        `memory ${memory.stale ? "stale" : ""} ${showAllLabels || labeledIds.has(memory.id) ? "labeled" : ""}`.trim(),
    };
  });

  for (const relation of data.relations) {
    if (!memoryIds.has(relation.fromMemoryId) || !memoryIds.has(relation.toMemoryId)) continue;
    if (relationFilter && relation.type !== relationFilter) continue;
    const meta = RELATION_META[relation.type];
    adjacency.get(relation.fromMemoryId)?.add(relation.toMemoryId);
    adjacency.get(relation.toMemoryId)?.add(relation.fromMemoryId);
    elements.push({
      group: "edges",
      data: {
        id: `relation:${relation.id}`,
        relationId: relation.id,
        source: relation.fromMemoryId,
        target: relation.toMemoryId,
        edgeType: "relation",
        relationType: relation.type,
        label: meta.label,
        color: meta.color,
        directed: meta.directed,
        dashed: meta.lineStyle === "dashed",
      },
      classes: `relation relation-${relation.type} ${meta.directed ? "directed" : "undirected"}`,
    });
  }

  if (showSuggestions) {
    for (const suggestion of data.guide.relationSuggestions) {
      if (!memoryIds.has(suggestion.fromMemoryId) || !memoryIds.has(suggestion.toMemoryId))
        continue;
      adjacency.get(suggestion.fromMemoryId)?.add(suggestion.toMemoryId);
      adjacency.get(suggestion.toMemoryId)?.add(suggestion.fromMemoryId);
      elements.push({
        group: "edges",
        data: {
          id: `suggestion:${suggestion.id}`,
          suggestionId: suggestion.id,
          source: suggestion.fromMemoryId,
          target: suggestion.toMemoryId,
          edgeType: "suggestion",
          label: "待审核",
          color: "#64748b",
          directed: false,
          dashed: true,
          score: suggestion.score,
        },
        classes: "suggestion-edge undirected",
      });
    }
  }

  const components: string[][] = [];
  const visited = new Set<string>();
  for (const memory of memories) {
    if (visited.has(memory.id)) continue;
    const component: string[] = [];
    const queue = [memory.id];
    visited.add(memory.id);
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) continue;
      component.push(current);
      for (const neighbor of adjacency.get(current) ?? []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    components.push(component);
  }
  components.sort((left, right) => right.length - left.length);
  const hub = components[0]
    ?.slice()
    .sort((left, right) => (adjacency.get(right)?.size ?? 0) - (adjacency.get(left)?.size ?? 0))[0];
  if (hub) {
    for (const component of components.slice(1)) {
      const representative = component
        .slice()
        .sort(
          (left, right) => (adjacency.get(right)?.size ?? 0) - (adjacency.get(left)?.size ?? 0),
        )[0];
      if (!representative) continue;
      elements.push({
        group: "edges",
        data: {
          id: `layout:${hub}:${representative}`,
          source: hub,
          target: representative,
          edgeType: "layout",
          color: "transparent",
        },
        classes: "layout-edge",
      });
    }
  }

  if (expandedMemoryId && memoryIds.has(expandedMemoryId)) {
    const memory = data.memories.find((candidate) => candidate.id === expandedMemoryId);
    memory?.citations.forEach((citation, index) => {
      const citationId = `citation:${memory.id}:${index}`;
      elements.push({
        group: "nodes",
        data: {
          id: citationId,
          nodeType: "citation",
          memoryId: memory.id,
          citationIndex: index,
          label: `${CITATION_LABELS[citation.role]} · ${citation.sourcePath.split("/").at(-1) ?? citation.sourcePath}`,
          role: citation.role,
          stale: citation.stale,
        },
        classes: `citation citation-${citation.role} ${citation.stale ? "stale" : ""}`.trim(),
      });
      elements.push({
        group: "edges",
        data: {
          id: `citation-edge:${memory.id}:${index}`,
          source: citationId,
          target: memory.id,
          edgeType: "citation",
          label: CITATION_LABELS[citation.role],
          color: "#8a7892",
          directed: true,
          dashed: true,
        },
        classes: "citation-edge",
      });
    });
  }

  return elements;
}
