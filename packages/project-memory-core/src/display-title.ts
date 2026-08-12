import type { BriefRole, MemoryKind } from "./types.js";

export interface MemoryDisplayTitleSource {
  title: string;
  summary?: string | null;
  topic?: string | null;
  briefRole?: BriefRole | null;
  kind?: MemoryKind | null;
  narrative?: { conclusion?: string | null } | null;
}

export interface ContextualMemoryTitleSource extends MemoryDisplayTitleSource {
  id: string;
  displayTitle?: string;
  createdAt?: string;
  updatedAt?: string;
  sequence?: number | null;
  narrative?: { conclusion?: string | null; occurredAt?: string | null } | null;
}

const FALLBACK_ROLES: Record<MemoryKind, BriefRole> = {
  architecture: "conclusion",
  decision: "conclusion",
  workflow: "progress",
  convention: "progress",
  pitfall: "risk",
  status: "progress",
};

const ROLE_PREFIXES: Record<BriefRole, string> = {
  conclusion: "已确认",
  progress: "进展",
  risk: "需要注意",
  next_step: "下一步",
  reference: "资料",
};

const ROLE_FALLBACKS: Record<BriefRole, string> = {
  conclusion: "已确认的项目结论",
  progress: "最近项目进展",
  risk: "需要关注的问题",
  next_step: "已确认的下一步",
  reference: "项目参考资料",
};

function compactText(value: string): string {
  return value
    .replaceAll(/\s+/g, " ")
    .replaceAll(/^[#>*`\-\s]+|[#>*`\s]+$/g, "")
    .trim();
}

function firstSentence(value: string, maxLength = 30): string {
  const compact = compactText(value);
  const sentence = compact.split(/[。！？.!?]\s*/u)[0]?.trim() ?? compact;
  return sentence.length > maxLength ? `${sentence.slice(0, maxLength - 1)}…` : sentence;
}

export function isTechnicalMemoryTitle(value: string): boolean {
  const title = compactText(value);
  if (!title) return false;
  return [
    /\b[0-9a-f]{7,64}\b/iu,
    /\b(?:build|deploy|candidate|memory|proposal)[-_:][a-z0-9._:-]+\b/iu,
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/iu,
    /(?:^|\s)(?:\/Users\/|[A-Za-z]:\\|\.{0,2}\/|[\w.-]+\/[\w./-]+)/u,
    /\b(?:related_to|observes|causes|depends_on|supports|contradicts|supersedes|derived_from)\b/u,
    /(?:端口|port)\s*[:：]?\s*\d{2,5}\b/iu,
    /(?:构建指纹|提交哈希|commit hash|candidateRef|memoryId|proposalId)/iu,
  ].some((pattern) => pattern.test(title));
}

function readableCandidate(value: string | null | undefined): string | null {
  if (!value) return null;
  const candidate = firstSentence(value);
  return candidate && !isTechnicalMemoryTitle(candidate) ? candidate : null;
}

export function buildMemoryDisplayTitle(source: MemoryDisplayTitleSource): string {
  const role = source.briefRole ?? (source.kind ? FALLBACK_ROLES[source.kind] : "reference");
  const topic = readableCandidate(source.topic);
  if (topic) return role === "reference" ? `${topic}资料` : `${ROLE_PREFIXES[role]}：${topic}`;

  const narrative = readableCandidate(source.narrative?.conclusion);
  if (narrative) return narrative;
  const summary = readableCandidate(source.summary);
  if (summary) return summary;
  const original = readableCandidate(source.title);
  return original ?? ROLE_FALLBACKS[role];
}

function withoutRolePrefix(value: string): string {
  return firstSentence(value, 48).replace(/^(?:进展|已确认|需要注意|下一步|资料)\s*[:：]\s*/u, "");
}

function eventDate(source: ContextualMemoryTitleSource): string {
  return (
    source.narrative?.occurredAt ??
    source.createdAt ??
    source.updatedAt ??
    "时间未补全"
  ).slice(0, 10);
}

export function buildContextualMemoryDisplayTitles(
  sources: ContextualMemoryTitleSource[],
): Map<string, string> {
  const topicTitles = new Map(
    sources.map((source) => [
      source.id,
      withoutRolePrefix(source.displayTitle ?? buildMemoryDisplayTitle(source)) || "项目事件",
    ]),
  );
  const counts = new Map<string, number>();
  for (const title of topicTitles.values()) counts.set(title, (counts.get(title) ?? 0) + 1);
  const provisional = sources.map((source) => {
    const topicTitle = topicTitles.get(source.id) ?? "项目事件";
    const original = withoutRolePrefix(source.title);
    const narrative = withoutRolePrefix(source.narrative?.conclusion ?? "");
    const readable =
      original && !isTechnicalMemoryTitle(original) ? original : narrative || topicTitle;
    if ((counts.get(topicTitle) ?? 0) === 1) return { source, title: readable };
    return { source, title: `${eventDate(source)}｜${readable}` };
  });
  const totals = new Map<string, number>();
  const occurrences = new Map<string, number>();
  for (const item of provisional) totals.set(item.title, (totals.get(item.title) ?? 0) + 1);
  return new Map(
    provisional.map(({ source, title }) => {
      const occurrence = (occurrences.get(title) ?? 0) + 1;
      occurrences.set(title, occurrence);
      return [
        source.id,
        (totals.get(title) ?? 0) > 1 ? `${title} · ${source.sequence ?? occurrence}` : title,
      ];
    }),
  );
}
