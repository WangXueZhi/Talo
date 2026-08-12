import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildProjectBrief } from "./brief.js";
import type { GraphViewData } from "./browser/types.js";
import { buildContextualMemoryDisplayTitles, buildMemoryDisplayTitle } from "./display-title.js";
import { resolveMemoryEventMetadata } from "./event-metadata.js";
import { analyzeKnowledgeGraph } from "./guide.js";
import { resolveMemoryHubPath } from "./paths.js";
import type {
  GraphGuide,
  MemoryCitationRecord,
  MemoryRecord,
  MemoryRelationRecord,
  ProjectBrief,
  RelationType,
} from "./types.js";

export interface KnowledgeGraph {
  nodes: MemoryRecord[];
  relations: MemoryRelationRecord[];
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

function relationSentence(
  relation: MemoryRelationRecord,
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

const CITATION_LABELS: Record<MemoryCitationRecord["role"], string> = {
  evidence: "证据",
  report: "报告",
  workflow: "流程",
  reference: "参考",
};

function summaryFor(memory: MemoryRecord): string {
  const value = memory.summary ?? memory.content.split(/[。！？.!?]\s*/u)[0] ?? memory.content;
  return value.trim().slice(0, 140);
}

function markdownText(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("|", "\\|");
}

export function renderGraphMarkdown(
  projectName: string,
  graph: KnowledgeGraph,
  generatedAt = new Date().toISOString(),
  providedGuide?: GraphGuide,
  providedBrief?: ProjectBrief,
): string {
  const projectId = providedGuide?.projectId ?? graph.nodes[0]?.projectId ?? "unknown-project";
  const guide =
    providedGuide ?? analyzeKnowledgeGraph(projectId, projectName, graph, generatedAt, 12);
  const brief =
    providedBrief ?? buildProjectBrief(projectId, projectName, graph, guide, generatedAt, 12);
  const memoryById = new Map(graph.nodes.map((memory) => [memory.id, memory]));
  const lines = [
    `# ${projectName} 项目记忆`,
    "",
    `> 静态快照：${generatedAt}`,
    "",
    "## 项目交接",
    "",
    brief.handoff.coverage,
    "",
    "## 从这里开始",
    "",
  ];
  if (brief.handoff.startHere.length === 0) lines.push("- 暂无已保存的工作记录");
  else {
    for (const item of brief.handoff.startHere) {
      lines.push(
        `- **${markdownText(item.displayTitle)}**：${markdownText(item.reason)} ${markdownText(item.summary)}`,
      );
    }
  }
  lines.push("", "## 最近发生了什么", "");
  if (brief.handoff.recentWork.length === 0) lines.push("- 暂无可用于时间线的工作记录");
  else {
    for (const item of brief.handoff.recentWork) {
      lines.push(
        `- **${item.occurredAt ? item.occurredAt.slice(0, 10) : "记录时间未知"} · ${markdownText(item.displayTitle)}**：${markdownText(item.narrative?.outcome ?? "旧记录尚未补全产出信息")}`,
      );
    }
  }
  lines.push("", "## 当前状态", "");
  lines.push("## 当前结论", "");
  const appendItems = (items: ProjectBrief["currentConclusions"], empty: string) => {
    if (items.length === 0) lines.push(`- ${empty}`);
    else {
      for (const item of items) {
        lines.push(`- **${markdownText(item.displayTitle)}**：${markdownText(item.summary)}`);
      }
    }
  };
  appendItems(brief.currentConclusions, "暂无当前结论");
  lines.push("", "## 已完成工作", "");
  appendItems(brief.completedWork, "暂无已完成工作");
  lines.push("", "## 风险与证据边界", "");
  appendItems(brief.risks, "暂无已记录风险");
  lines.push("", "## 下一步", "");
  appendItems(brief.nextSteps, "暂无已确认的下一步");
  if (brief.systemSuggestions.length > 0) {
    lines.push("", "**系统建议（未经审核）**", "");
    for (const suggestion of brief.systemSuggestions) {
      lines.push(`- ${markdownText(suggestion.text)} · ${markdownText(suggestion.reason)}`);
    }
  }
  lines.push("", "## 推荐阅读", "");
  if (brief.recommendedReading.length === 0) lines.push("- 暂无推荐");
  else {
    for (const item of brief.recommendedReading) {
      lines.push(
        `- **${markdownText(item.displayTitle)}**：${markdownText(item.reasons.join("；"))}`,
      );
    }
  }
  if (brief.topics.length > 0) {
    lines.push("", "## 共享主题", "");
    for (const topic of brief.topics) {
      lines.push(`- **${markdownText(topic.name)}**：${topic.memoryCount} 条记忆`);
    }
  }
  lines.push("", "## 来源状态", "");
  lines.push(
    `- ${brief.summary.citationCount} 个可追溯来源 · ${brief.summary.staleCitationCount} 个失效来源 · ${brief.summary.staleMemoryCount} 条过期记忆`,
  );
  lines.push("", "## 待审核关联线索", "");
  if (guide.relationSuggestions.length === 0) lines.push("- 暂无关联线索");
  else {
    for (const suggestion of guide.relationSuggestions) {
      const from = memoryById.get(suggestion.fromMemoryId);
      const to = memoryById.get(suggestion.toMemoryId);
      lines.push(
        `- **${markdownText(from ? buildMemoryDisplayTitle(from) : "已有记忆")}** 与 **${markdownText(to ? buildMemoryDisplayTitle(to) : "已有记忆")}** 可能相关：${markdownText(suggestion.rationale)}`,
      );
    }
  }
  lines.push("", "## 记忆详情", "");
  for (const memory of graph.nodes) {
    lines.push(
      `### ${markdownText(buildMemoryDisplayTitle(memory))}${memory.stale ? " [已过期]" : ""}`,
      "",
      `- 主题：${markdownText(memory.topic ?? "未分组")}`,
      `- 原始标题：${markdownText(memory.title)}`,
      `- 首页位置：${memory.briefRole ?? "根据记忆类型自动归类"}`,
      `- 类型：${memory.kind}`,
      `- 摘要：${markdownText(summaryFor(memory))}`,
      `- 置信度：${memory.confidence}`,
      `- 更新时间：${memory.updatedAt}`,
      "",
      memory.content,
      "",
      "**这项工作怎么发生的**",
      "",
    );
    if (!memory.narrative) {
      lines.push("- 旧记录尚未补全这项信息。", "");
    } else {
      lines.push(
        `- 日期：${memory.narrative.occurredAt.slice(0, 10)}`,
        `- 做了什么：${markdownText(memory.narrative.action)}`,
        `- 为什么做：${markdownText(memory.narrative.reason)}`,
        `- 产出了什么：${markdownText(memory.narrative.outcome)}`,
        `- 现在意味着什么：${markdownText(memory.narrative.conclusion)}`,
        "",
      );
    }
    lines.push("**来源**", "");
    if (memory.citations.length === 0) {
      lines.push("- 无已记录来源");
    } else {
      for (const citation of memory.citations) {
        const locator = citation.locator ? ` · ${markdownText(citation.locator)}` : "";
        const stale = citation.stale ? ` · 已过期：${citation.staleReason}` : "";
        lines.push(
          "- " +
            CITATION_LABELS[citation.role] +
            " · " +
            markdownText(`${citation.sourceProjectName}/${citation.sourcePath}`) +
            locator +
            stale +
            (citation.note ? ` · ${markdownText(citation.note)}` : ""),
        );
      }
    }
    const connected = graph.relations.filter(
      (relation) => relation.fromMemoryId === memory.id || relation.toMemoryId === memory.id,
    );
    lines.push("", "**关系**", "");
    if (connected.length === 0) {
      lines.push("- 无已记录关系");
    } else {
      for (const relation of connected) {
        const from = graph.nodes.find((candidate) => candidate.id === relation.fromMemoryId);
        const to = graph.nodes.find((candidate) => candidate.id === relation.toMemoryId);
        lines.push(
          `- ${markdownText(relationSentence(relation, from ? buildMemoryDisplayTitle(from) : "已有记忆", to ? buildMemoryDisplayTitle(to) : "已有记忆"))}：${markdownText(relation.rationale)} · ${RELATION_LABELS[relation.type]} · ${relation.confidence}`,
        );
      }
    }
    lines.push("");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

export function buildGraphViewData(
  projectName: string,
  graph: KnowledgeGraph,
  generatedAt: string,
  guide: GraphGuide,
  brief: ProjectBrief,
): GraphViewData {
  const eventMetadata = resolveMemoryEventMetadata(graph.nodes, graph.relations);
  const contextualTitles = buildContextualMemoryDisplayTitles(
    graph.nodes.map((memory) => ({
      ...memory,
      sequence: eventMetadata.get(memory.id)?.sequence ?? memory.sequence,
    })),
  );
  return {
    projectName,
    generatedAt,
    hubUrl: pathToFileURL(resolveMemoryHubPath()).href,
    guide,
    brief,
    memories: graph.nodes.map((memory) => ({
      id: memory.id,
      projectId: memory.projectId,
      projectName: memory.projectName,
      kind: memory.kind,
      title: memory.title,
      displayTitle: contextualTitles.get(memory.id) ?? buildMemoryDisplayTitle(memory),
      summary: memory.summary,
      topic: memory.topic,
      briefRole: memory.briefRole,
      workUnitId: eventMetadata.get(memory.id)?.workUnitId ?? null,
      runId: eventMetadata.get(memory.id)?.runId ?? null,
      phase: eventMetadata.get(memory.id)?.phase ?? "other",
      sequence: eventMetadata.get(memory.id)?.sequence ?? null,
      narrative: memory.narrative ?? null,
      content: memory.content,
      tags: memory.tags,
      citations: memory.citations.map((citation) => ({
        sourceProjectId: citation.sourceProjectId,
        sourceProjectName: citation.sourceProjectName,
        sourcePath: citation.sourcePath,
        role: citation.role,
        locator: citation.locator,
        note: citation.note,
        sourceCommit: citation.sourceCommit,
        stale: citation.stale,
        staleReason: citation.staleReason,
        accessible: citation.accessible,
        fileUrl: citation.accessible ? citation.fileUrl : null,
      })),
      submittedBy: memory.submittedBy ?? null,
      sourceProposalId: memory.sourceProposalId ?? null,
      confidence: memory.confidence,
      createdAt: memory.createdAt,
      updatedAt: memory.updatedAt,
      stale: memory.stale,
      staleReason: memory.staleReason,
    })),
    relations: graph.relations.map((relation) => ({
      id: relation.id,
      fromMemoryId: relation.fromMemoryId,
      toMemoryId: relation.toMemoryId,
      type: relation.type,
      rationale: relation.rationale,
      confidence: relation.confidence,
    })),
  };
}

function htmlText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function htmlAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function browserAsset(name: "graph-app.css" | "graph-app.js"): string {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.join(moduleDir, "browser", name),
    path.resolve(moduleDir, "..", "dist", "browser", name),
    path.resolve(moduleDir, "../../../plugins/codex-project-memory/dist/browser", name),
    path.resolve(process.cwd(), "dist", "browser", name),
  ];
  const assetPath = candidates.find((candidate) => existsSync(candidate));
  if (!assetPath) {
    throw new Error(`Browser asset ${name} is missing. Run pnpm build:browser first.`);
  }
  return readFileSync(assetPath, "utf8");
}

function contentHash(value: string): string {
  return createHash("sha256").update(value).digest("base64");
}

export function renderGraphHtml(
  projectName: string,
  graph: KnowledgeGraph,
  generatedAt = new Date().toISOString(),
  providedGuide?: GraphGuide,
  providedBrief?: ProjectBrief,
): string {
  const projectId = providedGuide?.projectId ?? graph.nodes[0]?.projectId ?? "unknown-project";
  const guide =
    providedGuide ?? analyzeKnowledgeGraph(projectId, projectName, graph, generatedAt, 12);
  const brief =
    providedBrief ?? buildProjectBrief(projectId, projectName, graph, guide, generatedAt, 12);
  const data = buildGraphViewData(projectName, graph, generatedAt, guide, brief);
  const css = browserAsset("graph-app.css").replaceAll("</style", "<\\/style");
  const script = browserAsset("graph-app.js").replaceAll("</script", "<\\/script");
  const csp = [
    "default-src 'none'",
    `style-src 'sha256-${contentHash(css)}'`,
    `script-src 'sha256-${contentHash(script)}'`,
    "img-src data:",
    "font-src 'none'",
    "connect-src 'none'",
    "media-src 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-src 'none'",
    "worker-src 'none'",
  ].join("; ");

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${htmlAttribute(csp)}">
<title>${htmlText(projectName)} · 项目记忆</title>
<style>${css}</style>
</head>
<body>
<div id="app"></div>
<template id="graph-data">${htmlText(JSON.stringify(data))}</template>
<script>${script}</script>
</body>
</html>
`;
}
