import type {
  GetMemoriesResult,
  MemoryRecord,
  MemoryRelationRecord,
  RecallCandidate,
  RecallOmission,
  RecallQueryMode,
  RecallResult,
  RetrievedMemory,
} from "./types.js";

export const TOKEN_ESTIMATION_NOTE =
  "Model-independent estimate for context planning; not billing or model tokenizer output.";

const FIELD_WEIGHTS = {
  title: 6,
  summary: 5,
  topic: 4,
  tags: 3,
  content: 1,
  citations: 1,
} as const;

type SearchField = keyof typeof FIELD_WEIGHTS;

interface RankedMemory {
  memory: MemoryRecord;
  score: number;
  matchReasons: string[];
  formalRelationCount: number;
}

interface RecallOptions {
  currentProjectId: string;
  memories: MemoryRecord[];
  relations: MemoryRelationRecord[];
  mode: RecallQueryMode;
  query: string | null;
  limit: number;
  recommend: number;
  budgetTokens: number;
}

const CONFIDENCE_MULTIPLIER = {
  verified: 1.1,
  observed: 1,
  inferred: 0.9,
} as const;

export function normalizeRecallText(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

export function tokenizeRecallText(value: string): string[] {
  const normalized = normalizeRecallText(value);
  const tokens: string[] = [];
  for (const match of normalized.matchAll(/[\p{Script=Han}]+|[a-z0-9]+/gu)) {
    const segment = match[0];
    if (/^[\p{Script=Han}]+$/u.test(segment)) {
      tokens.push(segment);
      for (let index = 0; index < segment.length - 1; index += 1) {
        tokens.push(segment.slice(index, index + 2));
      }
    } else {
      tokens.push(segment);
    }
  }
  return tokens;
}

export function estimateTokens(value: string): number {
  let cjk = 0;
  let other = 0;
  for (const character of value) {
    if (
      /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(character)
    ) {
      cjk += 1;
    } else if (!/\s/u.test(character)) {
      other += 1;
    }
  }
  return Math.max(1, cjk + Math.ceil(other / 4));
}

export function temporarySummary(memory: MemoryRecord): string {
  if (memory.summary) return memory.summary;
  const compact = memory.content.replace(/\s+/g, " ").trim();
  return compact.length <= 220 ? compact : `${compact.slice(0, 217)}...`;
}

function memoryFields(memory: MemoryRecord): Record<SearchField, string> {
  return {
    title: memory.title,
    summary: memory.summary ?? temporarySummary(memory),
    topic: memory.topic ?? "",
    tags: memory.tags.join(" "),
    content: memory.content,
    citations: memory.citations
      .map((citation) => `${citation.sourcePath} ${citation.note ?? ""}`)
      .join(" "),
  };
}

function termFrequency(tokens: string[], term: string): number {
  let count = 0;
  for (const token of tokens) if (token === term) count += 1;
  return count;
}

function relationCounts(
  memories: MemoryRecord[],
  relations: MemoryRelationRecord[],
): Map<string, number> {
  const visibleIds = new Set(memories.map((memory) => memory.id));
  const counts = new Map<string, number>();
  for (const relation of relations) {
    if (!visibleIds.has(relation.fromMemoryId) || !visibleIds.has(relation.toMemoryId)) continue;
    counts.set(relation.fromMemoryId, (counts.get(relation.fromMemoryId) ?? 0) + 1);
    counts.set(relation.toMemoryId, (counts.get(relation.toMemoryId) ?? 0) + 1);
  }
  return counts;
}

export function rankMemories(options: {
  currentProjectId: string;
  memories: MemoryRecord[];
  relations: MemoryRelationRecord[];
  mode: RecallQueryMode;
  query: string | null;
}): RankedMemory[] {
  const { currentProjectId, memories, relations, mode } = options;
  const counts = relationCounts(memories, relations);
  if (mode === "recent") {
    return [...memories]
      .sort(
        (left, right) =>
          right.updatedAt.localeCompare(left.updatedAt) || left.id.localeCompare(right.id),
      )
      .map((memory, index) => ({
        memory,
        score:
          (1 / (index + 1)) *
          (memory.projectId === currentProjectId ? 1 : 0.85) *
          CONFIDENCE_MULTIPLIER[memory.confidence] *
          (memory.stale ? 0.35 : 1),
        matchReasons: ["recent"],
        formalRelationCount: counts.get(memory.id) ?? 0,
      }))
      .sort(
        (left, right) =>
          right.score - left.score ||
          Number(right.memory.projectId === currentProjectId) -
            Number(left.memory.projectId === currentProjectId) ||
          right.memory.updatedAt.localeCompare(left.memory.updatedAt) ||
          left.memory.id.localeCompare(right.memory.id),
      );
  }

  const normalizedQuery = normalizeRecallText(options.query ?? "");
  const queryTokens = [...new Set(tokenizeRecallText(normalizedQuery))];
  if (queryTokens.length === 0) return [];

  const documents = memories.map((memory) => {
    const fields = memoryFields(memory);
    const tokenized = Object.fromEntries(
      Object.entries(fields).map(([field, value]) => [field, tokenizeRecallText(value)]),
    ) as Record<SearchField, string[]>;
    return { memory, fields, tokenized };
  });
  const averageLengths = Object.fromEntries(
    Object.keys(FIELD_WEIGHTS).map((field) => {
      const key = field as SearchField;
      const total = documents.reduce((sum, document) => sum + document.tokenized[key].length, 0);
      return [key, Math.max(1, total / Math.max(1, documents.length))];
    }),
  ) as Record<SearchField, number>;
  const documentFrequency = new Map<string, number>();
  for (const term of queryTokens) {
    documentFrequency.set(
      term,
      documents.filter((document) =>
        (Object.keys(FIELD_WEIGHTS) as SearchField[]).some((field) =>
          document.tokenized[field].includes(term),
        ),
      ).length,
    );
  }

  const ranked = documents
    .map(({ memory, fields, tokenized }) => {
      let score = 0;
      const reasons = new Set<string>();
      for (const term of queryTokens) {
        const frequency = documentFrequency.get(term) ?? 0;
        const idf = Math.log(1 + (memories.length - frequency + 0.5) / (frequency + 0.5));
        for (const field of Object.keys(FIELD_WEIGHTS) as SearchField[]) {
          const tf = termFrequency(tokenized[field], term);
          if (tf === 0) continue;
          const length = tokenized[field].length;
          const denominator = tf + 1.2 * (0.25 + 0.75 * (length / averageLengths[field]));
          score += FIELD_WEIGHTS[field] * idf * ((tf * 2.2) / denominator);
          reasons.add(`field:${field}`);
        }
      }
      if (normalizedQuery.length > 1) {
        for (const field of Object.keys(FIELD_WEIGHTS) as SearchField[]) {
          if (normalizeRecallText(fields[field]).includes(normalizedQuery)) {
            score += 4;
            reasons.add(`exact_phrase:${field}`);
          }
        }
      }
      score *= CONFIDENCE_MULTIPLIER[memory.confidence];
      if (memory.stale) score *= 0.35;
      if (memory.projectId !== currentProjectId) score *= 0.85;
      return {
        memory,
        score,
        matchReasons: [...reasons].sort(),
        formalRelationCount: counts.get(memory.id) ?? 0,
      };
    })
    .filter((entry) => entry.score > 0);

  const baseScores = new Map(ranked.map((entry) => [entry.memory.id, entry.score]));
  const maximumScore = Math.max(0, ...ranked.map((entry) => entry.score));
  for (const entry of ranked) {
    let strongestNeighbor = 0;
    for (const relation of relations) {
      const neighborId =
        relation.fromMemoryId === entry.memory.id
          ? relation.toMemoryId
          : relation.toMemoryId === entry.memory.id
            ? relation.fromMemoryId
            : null;
      if (neighborId)
        strongestNeighbor = Math.max(strongestNeighbor, baseScores.get(neighborId) ?? 0);
    }
    if (strongestNeighbor > 0 && maximumScore > 0) {
      entry.score *= 1 + Math.min(0.1, (strongestNeighbor / maximumScore) * 0.1);
      entry.matchReasons.push("reviewed_relation_neighbor");
    }
  }

  return ranked.sort(
    (left, right) =>
      right.score - left.score ||
      Number(right.memory.projectId === currentProjectId) -
        Number(left.memory.projectId === currentProjectId) ||
      right.memory.updatedAt.localeCompare(left.memory.updatedAt) ||
      left.memory.id.localeCompare(right.memory.id),
  );
}

function candidateFromRanked(entry: RankedMemory): RecallCandidate {
  const candidate: RecallCandidate = {
    memoryId: entry.memory.id,
    projectId: entry.memory.projectId,
    projectName: entry.memory.projectName,
    kind: entry.memory.kind,
    title: entry.memory.title,
    summary: temporarySummary(entry.memory),
    topic: entry.memory.topic,
    tags: entry.memory.tags,
    confidence: entry.memory.confidence,
    score: Number(entry.score.toFixed(6)),
    matchReasons: entry.matchReasons,
    stale: entry.memory.stale,
    staleReason: entry.memory.staleReason,
    citationCount: entry.memory.citations.length,
    formalRelationCount: entry.formalRelationCount,
    updatedAt: entry.memory.updatedAt,
    estimatedTokens: 0,
  };
  candidate.estimatedTokens = estimateTokens(JSON.stringify(candidate));
  return candidate;
}

function buildOmissions(
  entries: Array<{ reason: RecallOmission["reason"]; memoryId: string }>,
): RecallOmission[] {
  const reasons: RecallOmission["reason"][] = ["budget_exceeded", "limit_exceeded"];
  return reasons
    .map((reason) => ({
      reason,
      memoryIds: entries.filter((entry) => entry.reason === reason).map((entry) => entry.memoryId),
    }))
    .filter((entry) => entry.memoryIds.length > 0);
}

export function buildRecallResult(options: RecallOptions): RecallResult {
  const ranked = rankMemories(options);
  const itemBudget = Math.floor(options.budgetTokens * 0.9);
  let used = 0;
  const candidates: RecallCandidate[] = [];
  const omitted: Array<{ reason: RecallOmission["reason"]; memoryId: string }> = [];
  for (const [index, entry] of ranked.entries()) {
    if (index >= options.limit) {
      omitted.push({ reason: "limit_exceeded", memoryId: entry.memory.id });
      continue;
    }
    const candidate = candidateFromRanked(entry);
    if (used + candidate.estimatedTokens > itemBudget) {
      omitted.push({ reason: "budget_exceeded", memoryId: entry.memory.id });
      continue;
    }
    candidates.push(candidate);
    used += candidate.estimatedTokens;
  }
  return {
    queryMode: options.mode,
    query: options.mode === "query" ? options.query : null,
    candidates,
    recommendedMemoryIds: candidates
      .slice(0, Math.min(options.recommend, candidates.length))
      .map((candidate) => candidate.memoryId),
    estimatedTokens: Math.ceil(used / 0.9),
    budgetTokens: options.budgetTokens,
    estimationNote: TOKEN_ESTIMATION_NOTE,
    omissions: buildOmissions(omitted),
  };
}

function retrievedMemory(memory: MemoryRecord): RetrievedMemory {
  const {
    sourceCommit: _sourceCommit,
    sourceFileHash: _sourceFileHash,
    citations,
    ...rest
  } = memory;
  const result: RetrievedMemory = {
    ...rest,
    citations: citations.map(
      ({ sourceCommit: _citationCommit, sourceFileHash: _citationHash, ...citation }) => citation,
    ),
    estimatedTokens: 0,
  };
  result.estimatedTokens = estimateTokens(JSON.stringify(result));
  return result;
}

export function buildGetResult(memories: MemoryRecord[], budgetTokens: number): GetMemoriesResult {
  const itemBudget = Math.floor(budgetTokens * 0.9);
  let used = 0;
  const included: RetrievedMemory[] = [];
  const omittedMemoryIds: string[] = [];
  for (const memory of memories) {
    const item = retrievedMemory(memory);
    if (used + item.estimatedTokens > itemBudget) {
      omittedMemoryIds.push(memory.id);
      continue;
    }
    included.push(item);
    used += item.estimatedTokens;
  }
  return {
    memories: included,
    omittedMemoryIds,
    omissions:
      omittedMemoryIds.length > 0
        ? [{ reason: "budget_exceeded", memoryIds: omittedMemoryIds }]
        : [],
    estimatedTokens: Math.ceil(used / 0.9),
    budgetTokens,
    estimationNote: TOKEN_ESTIMATION_NOTE,
  };
}
