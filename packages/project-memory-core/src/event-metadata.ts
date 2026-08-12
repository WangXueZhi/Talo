import type { MemoryPhase, MemoryRecord, MemoryRelationRecord } from "./types.js";

export interface EventMetadataInput {
  id: string;
  title: string;
  content: string;
  summary?: string | null;
  topic?: string | null;
  briefRole?: MemoryRecord["briefRole"];
  narrative?: MemoryRecord["narrative"];
  sourcePath?: string | null;
  citations?: Array<{ sourcePath: string }>;
  workUnitId?: string | null;
  runId?: string | null;
  phase?: MemoryPhase | null;
  sequence?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResolvedEventMetadata {
  workUnitId: string | null;
  runId: string | null;
  phase: MemoryPhase;
  sequence: number | null;
  groupingEvidence: "explicit" | "run_id" | "source_path" | "formal_relation" | "none";
}

const DATE_SEGMENT = /^20\d{2}-\d{2}-\d{2}$/u;
const RUN_ID_PATTERNS = [
  /\brun[_ -]?id\s*[:=：]\s*([A-Za-z0-9._:/-]+)/iu,
  /\brunId\s*[:=：]\s*([A-Za-z0-9._:/-]+)/u,
  /运行批次\s*[:：]?\s*([A-Za-z0-9._:/-]+)/u,
];

const PHASE_RULES: Array<[MemoryPhase, RegExp]> = [
  ["learning", /(SOP|规范|规则|标准|手册)/iu],
  ["data_collection", /(报表|报告|下载|补数|补齐|采集|抓取|落盘|数据缺失|原始数据)/iu],
  ["verification", /(验证|复核|纠偏|验收|确认结果|回归)/iu],
  ["analysis", /(复盘|对账|诊断|分析|核对|排查|周报)/iu],
  ["decision", /(动作方案|方案|决策|授权|确定|选择|批准)/iu],
  ["execution", /(执行|上线|修改|补救|实施|调整|发布)/iu],
  ["learning", /流程/iu],
  ["handoff", /(交接|移交|交付)/iu],
  ["risk", /(风险|阻塞|注意|缺口|隐患)/iu],
  ["next_step", /(下一步|待办|后续动作)/iu],
];

function compact(value: string | null | undefined): string {
  return (value ?? "").replaceAll(/\s+/gu, " ").trim();
}

function dateKey(input: EventMetadataInput): string | null {
  const occurredAt = input.narrative?.occurredAt;
  const value = occurredAt ?? input.createdAt ?? input.updatedAt;
  if (!value) return null;
  const match = value.match(/^(20\d{2}-\d{2}-\d{2})/u);
  return match?.[1] ?? null;
}

export function extractRunId(input: EventMetadataInput): string | null {
  const text = [
    input.summary,
    input.content,
    input.narrative?.reason,
    input.narrative?.action,
    input.narrative?.outcome,
    input.narrative?.conclusion,
  ]
    .map((value) => compact(value))
    .join(" ");
  for (const pattern of RUN_ID_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].replace(/[),.;，。；）】]+$/u, "");
  }
  return null;
}

export function extractStableWorkUnit(sourcePath: string | null | undefined): string | null {
  const segments = compact(sourcePath)
    .split(/[\\/]+/u)
    .filter(Boolean);
  const dateIndex = segments.findIndex((segment) => DATE_SEGMENT.test(segment));
  if (dateIndex >= 1) return `${segments[dateIndex - 1]}/${segments[dateIndex]}`;
  return null;
}

function inferredPhase(input: EventMetadataInput): MemoryPhase {
  if (input.phase) return input.phase;
  const primaryText = [input.title, input.narrative?.action, input.narrative?.conclusion]
    .map((value) => compact(value))
    .join(" ");
  const primaryPhase = PHASE_RULES.find(([, pattern]) => pattern.test(primaryText))?.[0];
  if (primaryPhase) return primaryPhase;
  const secondaryText = [
    input.summary,
    input.content,
    input.topic,
    input.narrative?.reason,
    input.narrative?.outcome,
  ]
    .map((value) => compact(value))
    .join(" ");
  return PHASE_RULES.find(([, pattern]) => pattern.test(secondaryText))?.[0] ?? "other";
}

function directMetadata(input: EventMetadataInput): ResolvedEventMetadata {
  const explicitWorkUnitId = compact(input.workUnitId) || null;
  const explicitRunId = compact(input.runId) || null;
  if (explicitWorkUnitId) {
    return {
      workUnitId: explicitWorkUnitId,
      runId: explicitRunId,
      phase: inferredPhase(input),
      sequence: input.sequence ?? null,
      groupingEvidence: "explicit",
    };
  }
  const runId = explicitRunId ?? extractRunId(input);
  if (runId) {
    return {
      workUnitId: `run:${runId}`,
      runId,
      phase: inferredPhase(input),
      sequence: input.sequence ?? null,
      groupingEvidence: explicitRunId ? "explicit" : "run_id",
    };
  }
  const workUnit =
    extractStableWorkUnit(input.sourcePath) ??
    input.citations?.map((citation) => extractStableWorkUnit(citation.sourcePath)).find(Boolean) ??
    null;
  if (workUnit) {
    return {
      workUnitId: `source:${workUnit}`,
      runId: null,
      phase: inferredPhase(input),
      sequence: input.sequence ?? null,
      groupingEvidence: "source_path",
    };
  }
  return {
    workUnitId: null,
    runId: null,
    phase: inferredPhase(input),
    sequence: input.sequence ?? null,
    groupingEvidence: "none",
  };
}

export function resolveEventMetadata(
  inputs: EventMetadataInput[],
  relations: Pick<MemoryRelationRecord, "fromMemoryId" | "toMemoryId">[] = [],
): Map<string, ResolvedEventMetadata> {
  const result = new Map(inputs.map((input) => [input.id, directMetadata(input)]));
  const byId = new Map(inputs.map((input) => [input.id, input]));
  const relationNeighbors = new Map<string, Set<string>>();
  for (const relation of relations) {
    if (!byId.has(relation.fromMemoryId) || !byId.has(relation.toMemoryId)) continue;
    if (!relationNeighbors.has(relation.fromMemoryId))
      relationNeighbors.set(relation.fromMemoryId, new Set());
    if (!relationNeighbors.has(relation.toMemoryId))
      relationNeighbors.set(relation.toMemoryId, new Set());
    relationNeighbors.get(relation.fromMemoryId)?.add(relation.toMemoryId);
    relationNeighbors.get(relation.toMemoryId)?.add(relation.fromMemoryId);
    const from = byId.get(relation.fromMemoryId);
    const to = byId.get(relation.toMemoryId);
    const fromMetadata = result.get(relation.fromMemoryId);
    const toMetadata = result.get(relation.toMemoryId);
    if (
      !from ||
      !to ||
      !fromMetadata ||
      !toMetadata ||
      fromMetadata.workUnitId ||
      toMetadata.workUnitId
    )
      continue;
    const sameTopic = compact(from.topic) && compact(from.topic) === compact(to.topic);
    const sameDate = dateKey(from) === dateKey(to);
    if (sameTopic || sameDate) {
      const workUnitId = `relation:${[from.id, to.id].sort().join(":")}`;
      fromMetadata.workUnitId = workUnitId;
      toMetadata.workUnitId = workUnitId;
      fromMetadata.groupingEvidence = "formal_relation";
      toMetadata.groupingEvidence = "formal_relation";
    }
  }
  for (const input of inputs) {
    const current = result.get(input.id);
    if (!current || current.workUnitId) continue;
    const candidates = [...(relationNeighbors.get(input.id) ?? [])]
      .map((id) => ({ id, metadata: result.get(id), input: byId.get(id) }))
      .filter((candidate) => candidate.metadata?.workUnitId && candidate.input)
      .filter((candidate) => {
        const sameTopic =
          compact(candidate.input?.topic) &&
          compact(candidate.input?.topic) === compact(input.topic);
        const sameDate = dateKey(candidate.input as EventMetadataInput) === dateKey(input);
        return sameTopic || sameDate;
      });
    const groups = [
      ...new Set(candidates.map((candidate) => candidate.metadata?.workUnitId).filter(Boolean)),
    ];
    if (groups.length === 1) {
      current.workUnitId = groups[0] ?? null;
      current.groupingEvidence = "formal_relation";
    }
  }
  const grouped = new Map<
    string,
    Array<{ input: EventMetadataInput; metadata: ResolvedEventMetadata }>
  >();
  for (const input of inputs) {
    const metadata = result.get(input.id);
    if (!metadata?.workUnitId) continue;
    const list = grouped.get(metadata.workUnitId) ?? [];
    list.push({ input, metadata });
    grouped.set(metadata.workUnitId, list);
  }
  for (const list of grouped.values()) {
    list.sort((left, right) => {
      const leftTime =
        left.input.narrative?.occurredAt ?? left.input.createdAt ?? left.input.updatedAt ?? "";
      const rightTime =
        right.input.narrative?.occurredAt ?? right.input.createdAt ?? right.input.updatedAt ?? "";
      return leftTime.localeCompare(rightTime) || left.input.id.localeCompare(right.input.id);
    });
    list.forEach((entry, index) => {
      if (entry.metadata.sequence === null) entry.metadata.sequence = index + 1;
    });
  }
  return result;
}

export function resolveMemoryEventMetadata(
  memories: MemoryRecord[],
  relations: Pick<MemoryRelationRecord, "fromMemoryId" | "toMemoryId">[] = [],
): Map<string, ResolvedEventMetadata> {
  return resolveEventMetadata(memories, relations);
}
