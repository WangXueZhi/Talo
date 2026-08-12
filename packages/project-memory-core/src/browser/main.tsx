import cytoscape, { type Core, type EventObject } from "cytoscape";
import dagre from "cytoscape-dagre";
import fcose from "cytoscape-fcose";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  CircleAlert,
  Compass,
  Copy,
  ExternalLink,
  FileCheck2,
  FileSearch,
  Files,
  Focus,
  Layers3,
  LayoutGrid,
  LocateFixed,
  Maximize2,
  Network,
  PanelLeft,
  PanelRight,
  Pause,
  Play,
  RotateCcw,
  Route,
  Search,
  SlidersHorizontal,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from "lucide-preact";
import { render } from "preact";
import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import type { MemoryPhase, ProjectBriefItem } from "../types.js";
import {
  buildEventCausalityView,
  buildEventPathView,
  buildGraphElements,
  buildContextualEventTitles,
  buildTimelineDayGroups,
  buildTimelineWorkUnits,
  BRIEF_ROLE_LABELS,
  CITATION_LABELS,
  eventDateTimeLabel,
  KIND_LABELS,
  matchesMemory,
  memorySummary,
  localGraphMemories,
  PHASE_LABELS,
  relationSentence,
  RELATION_META,
  submitterClass,
  submitterLabel,
  visibleMemories,
} from "./model.js";
import type {
  BrowserMemory,
  BrowserRelation,
  BrowserRelationSuggestion,
  EventRelationItem,
  FocusDepth,
  GraphFilters,
  GraphSelection,
  GraphViewData,
  LocalGraphScope,
} from "./types.js";
import { localizeGraph, translateGraphLabel, type GraphLocale } from "./i18n.js";
import { TaloMark } from "./talo-mark.js";

cytoscape.use(dagre);
cytoscape.use(fcose);

const DEFAULT_FILTERS: GraphFilters = {
  topic: "",
  kind: "",
  relation: "",
  stale: "all",
  focusDepth: "all",
};

const GRAPH_STYLE = [
  {
    selector: "node",
    style: {
      "font-family": '"PingFang SC", "Microsoft YaHei", sans-serif',
      "overlay-opacity": 0,
      "transition-property": "opacity, background-color, border-color, border-width, shadow-blur, width, height",
      "transition-duration": "220ms",
    },
  },
  {
    selector: "node.memory",
    style: {
      width: "data(nodeSize)",
      height: "data(nodeSize)",
      shape: "ellipse",
      "background-color": "data(topicColor)",
      "border-color": "data(topicColor)",
      "border-width": 0.8,
      "shadow-blur": 9,
      "shadow-color": "#22d3ee",
      "shadow-opacity": 0.8,
      label: "",
      color: "#e2e8f0",
      "font-size": 13,
      "font-weight": 650,
      "text-wrap": "wrap",
      "text-max-width": 168,
      "text-valign": "center",
      "text-halign": "center",
      "text-margin-y": -19,
      "text-background-color": "#0b1020",
      "text-background-opacity": 0.78,
      "text-background-padding": 3,
      "text-border-width": 0,
    },
  },
  { selector: "node.memory.labeled", style: { label: "data(label)" } },
  {
    selector: "node.citation",
    style: {
      width: 4,
      height: 4,
      shape: "ellipse",
      "background-color": "#c084fc",
      "border-color": "#f0abfc",
      "border-width": 1,
      "shadow-blur": 6,
      "shadow-color": "#c084fc",
      "shadow-opacity": 0.55,
      label: "",
      color: "#cbd5e1",
      "font-size": 10,
      "text-wrap": "ellipsis",
      "text-max-width": 180,
      "text-valign": "center",
      "text-halign": "center",
      "text-margin-y": -17,
      "text-background-color": "#0b1020",
      "text-background-opacity": 0.9,
      "text-background-padding": 4,
    },
  },
  {
    selector: "node.stale",
    style: {
      "background-color": "#fdba74",
      "border-color": "#fb923c",
      "shadow-color": "#f97316",
    },
  },
  {
    selector: "edge",
    style: {
      width: 1.1,
      "curve-style": "bezier",
      "line-color": "data(color)",
      "target-arrow-color": "data(color)",
      "target-arrow-shape": "triangle",
      "arrow-scale": 0.65,
      label: "data(label)",
      color: "#e2e8f0",
      "font-size": 10,
      "font-weight": 600,
      "text-background-color": "#0b1020",
      "text-background-opacity": 0,
      "text-background-padding": 4,
      "text-rotation": "autorotate",
      "text-opacity": 0,
      "overlay-opacity": 0,
      "transition-property": "opacity, width, text-opacity, line-opacity",
      "transition-duration": "220ms",
    },
  },
  { selector: "edge.undirected", style: { "target-arrow-shape": "none" } },
  {
    selector: "edge.citation-edge",
    style: {
      "line-style": "dashed",
      "line-dash-pattern": [6, 5],
      width: 0.9,
      "target-arrow-shape": "none",
      "line-opacity": 0.55,
    },
  },
  {
    selector: "edge.suggestion-edge",
    style: {
      "line-style": "dashed",
      "line-dash-pattern": [3, 7],
      width: 1,
      "line-color": "#64748b",
      "target-arrow-shape": "none",
      "line-opacity": 0.55,
    },
  },
  {
    selector: "edge.layout-edge",
    style: {
      width: 0.1,
      opacity: 0,
      events: "no",
      "target-arrow-shape": "none",
    },
  },
  {
    selector: "edge.relation-contradicts, edge.relation-derived_from",
    style: { "line-style": "dashed", "line-dash-pattern": [8, 5] },
  },
  {
    selector: ".selected",
    style: {
      "border-color": "#f8fafc",
      "border-width": 2,
      "background-color": "#ffffff",
      "shadow-blur": 18,
      "shadow-color": "#67e8f9",
      "shadow-opacity": 1,
      width: 10,
      height: 10,
      label: "data(label)",
      opacity: 1,
    },
  },
  {
    selector: "node.hovered",
    style: {
      label: "data(label)",
      width: 8,
      height: 8,
      "shadow-blur": 16,
      "shadow-opacity": 1,
    },
  },
  {
    selector: "edge.selected, edge.hovered",
    style: { width: 2.8, "text-opacity": 1, "text-background-opacity": 0.92, opacity: 1 },
  },
  { selector: "edge.flow", style: { width: 1.8, "line-opacity": 1 } },
  { selector: ".neighbor", style: { opacity: 1 } },
  { selector: ".distant", style: { opacity: 0.34 } },
  {
    selector: ".search-hit",
    style: {
      "border-color": "#fef08a",
      "border-width": 1.5,
      "shadow-color": "#facc15",
      "shadow-blur": 15,
      "shadow-opacity": 1,
      width: 9,
      height: 9,
      label: "data(label)",
      opacity: 1,
    },
  },
  { selector: ".search-dim", style: { opacity: 0.2 } },
  { selector: ".pulse", style: { "shadow-blur": 20, "shadow-opacity": 1 } },
] as unknown as cytoscape.StylesheetStyle[];

function isLightTheme(): boolean {
  return document.documentElement.dataset.theme === "light";
}

function graphStyle(light: boolean): cytoscape.StylesheetStyle[] {
  if (!light) return GRAPH_STYLE;
  return [
    ...GRAPH_STYLE,
    {
      selector: "node.memory",
      style: {
        color: "#24364b",
        "text-background-color": "#f7fbfc",
        "text-background-opacity": 0.9,
        "shadow-opacity": 0.3,
      },
    },
    {
      selector: "node.citation",
      style: {
        color: "#3f5269",
        "text-background-color": "#f7fbfc",
        "text-background-opacity": 0.94,
      },
    },
    {
      selector: "edge",
      style: {
        color: "#344a62",
        "text-background-color": "#f7fbfc",
      },
    },
    {
      selector: ".selected",
      style: {
        "border-color": "#123047",
        "background-color": "#ffffff",
        "shadow-color": "#078eaa",
        "shadow-opacity": 0.55,
      },
    },
  ] as unknown as cytoscape.StylesheetStyle[];
}

type ViewMode = "guide" | "path" | "event" | "immersive" | "reading" | "records";

const PHASE_COLORS: Record<MemoryPhase, string> = {
  context: "#94a3b8",
  data_collection: "#38bdf8",
  analysis: "#67e8f9",
  decision: "#fbbf24",
  execution: "#fb923c",
  verification: "#34d399",
  handoff: "#a78bfa",
  learning: "#2dd4bf",
  risk: "#fb7185",
  next_step: "#60a5fa",
  other: "#94a3b8",
};

const PATH_GRAPH_STYLE = [
  {
    selector: "node.memory",
    style: {
      width: 190,
      height: 72,
      shape: "round-rectangle",
      "background-color": "data(phaseColor)",
      "background-opacity": 0.13,
      "border-color": "data(phaseColor)",
      "border-width": 1.4,
      label: "data(label)",
      color: "#e8eef9",
      "font-family": '"PingFang SC", "Microsoft YaHei", sans-serif',
      "font-size": 11,
      "font-weight": 650,
      "text-wrap": "wrap",
      "text-max-width": 164,
      "text-valign": "center",
      "text-halign": "center",
      "overlay-opacity": 0,
    },
  },
  {
    selector: "node.focus-event",
    style: {
      "border-width": 3,
      "border-color": "#f8fafc",
      "shadow-blur": 22,
      "shadow-color": "#67e8f9",
      "shadow-opacity": 0.75,
    },
  },
  {
    selector: "node.external-event",
    style: {
      "border-style": "dashed",
      opacity: 0.76,
    },
  },
  {
    selector: "edge.relation",
    style: {
      width: 1.6,
      "curve-style": "taxi",
      "taxi-direction": "rightward",
      "line-color": "data(color)",
      "target-arrow-color": "data(color)",
      "target-arrow-shape": "triangle",
      "arrow-scale": 0.75,
      label: "data(label)",
      color: "#9fb0c7",
      "font-size": 9,
      "font-weight": 650,
      "text-background-color": "#0b1020",
      "text-background-opacity": 0.92,
      "text-background-padding": 4,
      "text-rotation": "autorotate",
      "overlay-opacity": 0,
    },
  },
  { selector: "edge.undirected", style: { "target-arrow-shape": "none" } },
  { selector: "edge.layout-edge", style: { opacity: 0, events: "no" } },
  { selector: "edge.relation-contradicts, edge.relation-derived_from", style: { "line-style": "dashed" } },
] as unknown as cytoscape.StylesheetStyle[];

function pathGraphStyle(light: boolean): cytoscape.StylesheetStyle[] {
  if (!light) return PATH_GRAPH_STYLE;
  return [
    ...PATH_GRAPH_STYLE,
    {
      selector: "node.memory",
      style: {
        color: "#23384f",
        "background-opacity": 0.11,
      },
    },
    {
      selector: "node.focus-event",
      style: {
        "border-color": "#123047",
        "shadow-color": "#078eaa",
        "shadow-opacity": 0.36,
      },
    },
    {
      selector: "edge.relation",
      style: {
        color: "#344a62",
        "text-background-color": "#f7fbfc",
        "text-background-opacity": 0.96,
      },
    },
  ] as unknown as cytoscape.StylesheetStyle[];
}

function parseRouteHash(data: GraphViewData): { view: ViewMode; memoryId: string | null } {
  const [rawView, rawId] = window.location.hash.replace(/^#/u, "").split("/");
  const memoryId = rawId ? decodeURIComponent(rawId) : null;
  if ((rawView === "path" || rawView === "event") && memoryId && data.memories.some((memory) => memory.id === memoryId)) {
    return { view: rawView, memoryId };
  }
  if (rawView === "records") return { view: "records", memoryId: null };
  if (rawView === "graph") return { view: "immersive", memoryId };
  return { view: "guide", memoryId: null };
}

function routeHash(view: ViewMode, memoryId?: string | null): string {
  if (view === "path" || view === "event") return `#${view}/${encodeURIComponent(memoryId ?? "")}`;
  if (view === "records") return "#records";
  if (view === "immersive" || view === "reading") return "#graph";
  return "#timeline";
}

function isMobileViewport(): boolean {
  return window.matchMedia("(max-width: 820px)").matches;
}

function formatDate(value: string, locale: GraphLocale = "zh-CN"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function SubmitterBadge({ memory }: { memory: BrowserMemory }) {
  const adapterVersion = memory.submittedBy?.adapterVersion;
  return (
    <span
      class={`submitter-badge ${submitterClass(memory)}`}
      title={adapterVersion ? `适配器版本 ${adapterVersion}` : undefined}
    >
      {submitterLabel(memory)}
    </span>
  );
}

function IconButton({
  label,
  onClick,
  children,
  pressed,
  disabled,
  visibleLabel,
}: {
  label: string;
  onClick: () => void;
  children: preact.ComponentChildren;
  pressed?: boolean;
  disabled?: boolean;
  visibleLabel?: string;
}) {
  return (
    <button
      class={`icon-button ${visibleLabel ? "icon-button-labeled" : ""}`}
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
      {visibleLabel && <span>{visibleLabel}</span>}
    </button>
  );
}

function SegmentedControl({
  value,
  onChange,
}: {
  value: FocusDepth;
  onChange: (value: FocusDepth) => void;
}) {
  const items: Array<{ value: FocusDepth; label: string }> = [
    { value: "all", label: "全图" },
    { value: "1", label: "一层" },
    { value: "2", label: "两层" },
  ];
  return (
    <div class="segmented" role="group" aria-label="关系范围">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          class={value === item.value ? "active" : ""}
          aria-pressed={value === item.value}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function EmptyDetail() {
  return (
    <div class="detail-empty">
      <Network size={28} strokeWidth={1.5} />
      <strong>选择一条记忆</strong>
      <span>查看完整结论、来源与关系理由</span>
    </div>
  );
}

function MemoryDetail({
  memory,
  relations,
  data,
  sourcesExpanded,
  onToggleSources,
  onSelectMemory,
  onSelectCitation,
  onSelectRelation,
}: {
  memory: BrowserMemory;
  relations: BrowserRelation[];
  data: GraphViewData;
  sourcesExpanded: boolean;
  onToggleSources: () => void;
  onSelectMemory: (id: string) => void;
  onSelectCitation: (memoryId: string, index: number) => void;
  onSelectRelation: (id: string) => void;
}) {
  const incoming = relations.filter((relation) => relation.toMemoryId === memory.id);
  const outgoing = relations.filter((relation) => relation.fromMemoryId === memory.id);
  const otherMemory = (id: string) => data.memories.find((candidate) => candidate.id === id);
  return (
    <article class="detail-article">
      <div class="detail-kicker">
        <span class={`kind-mark kind-${memory.kind}`}>{KIND_LABELS[memory.kind]}</span>
        <span>{memory.topic ?? "未分组"}</span>
      </div>
      <h2>{memory.displayTitle}</h2>
      {memory.displayTitle !== memory.title && <code class="technical-title">原始标题 · {memory.title}</code>}
      <p class="detail-summary">{memorySummary(memory)}</p>
      <dl class="metadata-grid">
        <dt>置信度</dt>
        <dd>{memory.confidence}</dd>
        <dt>更新时间</dt>
        <dd>{formatDate(memory.updatedAt)}</dd>
        <dt>提交者</dt>
        <dd><SubmitterBadge memory={memory} /></dd>
        <dt>状态</dt>
        <dd class={memory.stale ? "status-stale" : "status-active"}>
          {memory.stale ? `已过期 · ${memory.staleReason ?? "来源发生变化"}` : "有效"}
        </dd>
      </dl>

      <section class="detail-section">
        <h3>完整结论</h3>
        <p class="long-form">{memory.content}</p>
      </section>

      <section class="detail-section narrative-detail">
        <h3>这项工作怎么发生的</h3>
        {!memory.narrative ? (
          <p class="empty-line">旧记录尚未补全这项信息。</p>
        ) : (
          <dl class="narrative-list">
            <dt>发生时间</dt><dd>{eventDateTimeLabel(memory, data.generatedAt)}</dd>
            <dt>做了什么</dt><dd>{memory.narrative.action}</dd>
            <dt>为什么做</dt><dd>{memory.narrative.reason}</dd>
            <dt>产出了什么</dt><dd>{memory.narrative.outcome}</dd>
            <dt>现在意味着什么</dt><dd>{memory.narrative.conclusion}</dd>
          </dl>
        )}
      </section>

      <section class="detail-section">
        <div class="section-heading">
          <h3>来源</h3>
          {memory.citations.length > 0 && (
            <button
              class="text-button"
              type="button"
              aria-pressed={sourcesExpanded}
              onClick={onToggleSources}
            >
              <Files size={15} />
              {sourcesExpanded ? "收起图中来源" : "在图中展开"}
            </button>
          )}
        </div>
        {memory.citations.length === 0 ? (
          <p class="empty-line">无已记录来源</p>
        ) : (
          <div class="source-list">
            {memory.citations.map((citation, index) => (
              <div class="source-entry" key={`${citation.sourcePath}:${index}`}>
                <button
                  class="source-row"
                  type="button"
                  onClick={() => onSelectCitation(memory.id, index)}
                >
                  <FileSearch size={17} />
                  <span class="source-copy">
                    <strong>{CITATION_LABELS[citation.role]} · {citation.sourcePath.split("/").at(-1)}</strong>
                    <span>{citation.note ?? "查看这条记忆引用的本地文件"}</span>
                  </span>
                  {citation.stale && <CircleAlert class="warning-icon" size={16} />}
                </button>
                <details class="technical-details">
                  <summary>技术详情</summary>
                  <dl>
                    <dt>路径</dt><dd>{citation.sourceProjectName}/{citation.sourcePath}</dd>
                    <dt>位置</dt><dd>{citation.locator ?? "未记录"}</dd>
                    <dt>提交版本</dt><dd>{citation.sourceCommit ?? "非 Git 来源"}</dd>
                  </dl>
                </details>
              </div>
            ))}
          </div>
        )}
      </section>

      <section class="detail-section">
        <h3>为什么与其他记忆有关 <span class="heading-count">{incoming.length + outgoing.length}</span></h3>
        {incoming.length + outgoing.length === 0 ? (
          <p class="empty-line">尚未记录与其他记忆的关系</p>
        ) : (
          [...outgoing, ...incoming].map((relation) => {
            const from = otherMemory(relation.fromMemoryId);
            const to = otherMemory(relation.toMemoryId);
            const otherId = relation.fromMemoryId === memory.id
              ? relation.toMemoryId
              : relation.fromMemoryId;
            return (
              <button class="relation-row" type="button" key={relation.id} onClick={() => onSelectRelation(relation.id)}>
                <strong>{relationSentence(relation, from?.displayTitle ?? "已有记忆", to?.displayTitle ?? "已有记忆")}</strong>
                <span>{relation.rationale}</span>
                <span class="relation-open" onClick={(event) => { event.stopPropagation(); onSelectMemory(otherId); }}>查看另一条记忆</span>
              </button>
            );
          })
        )}
      </section>
    </article>
  );
}

function CitationDetail({
  memory,
  citationIndex,
  onBack,
}: {
  memory: BrowserMemory;
  citationIndex: number;
  onBack: () => void;
}) {
  const citation = memory.citations[citationIndex];
  if (!citation) return <EmptyDetail />;
  return (
    <article class="detail-article">
      <button class="back-button" type="button" onClick={onBack}>
        <ChevronLeft size={16} /> 返回记忆
      </button>
      <div class="detail-kicker">
        <span class={`citation-mark citation-${citation.role}`}>{CITATION_LABELS[citation.role]}</span>
        <span>{citation.sourceProjectName}</span>
      </div>
      <h2>{citation.sourcePath.split("/").at(-1)}</h2>
      <p class="path-line">{citation.sourcePath}</p>
      <dl class="metadata-grid">
        <dt>位置</dt>
        <dd>{citation.locator ?? "未记录"}</dd>
        <dt>提交版本</dt>
        <dd>{citation.sourceCommit ?? "非 Git 来源"}</dd>
        <dt>状态</dt>
        <dd class={citation.stale ? "status-stale" : "status-active"}>
          {citation.stale ? `已过期 · ${citation.staleReason ?? "来源发生变化"}` : "有效"}
        </dd>
      </dl>
      {citation.note && (
        <section class="detail-section">
          <h3>来源说明</h3>
          <p class="long-form">{citation.note}</p>
        </section>
      )}
      {citation.fileUrl && (
        <a class="primary-action" href={citation.fileUrl}>
          <ExternalLink size={16} /> 打开本地文件
        </a>
      )}
    </article>
  );
}

function RelationDetail({
  relation,
  data,
  onSelectMemory,
}: {
  relation: BrowserRelation;
  data: GraphViewData;
  onSelectMemory: (id: string) => void;
}) {
  const from = data.memories.find((memory) => memory.id === relation.fromMemoryId);
  const to = data.memories.find((memory) => memory.id === relation.toMemoryId);
  const meta = RELATION_META[relation.type];
  const sentence = relationSentence(
    relation,
    from?.displayTitle ?? "已有记忆",
    to?.displayTitle ?? "已有记忆",
  );
  return (
    <article class="detail-article">
      <div class="detail-kicker">
        <span class={`relation-mark relation-${relation.type}`}>{meta.label}</span>
        <span>已审核关系</span>
      </div>
      <h2>{sentence}</h2>
      <div class="relation-path">
        <button type="button" onClick={() => onSelectMemory(relation.fromMemoryId)}>{from?.displayTitle ?? "已有记忆"}</button>
        <span>{meta.directed ? "→" : "↔"}</span>
        <button type="button" onClick={() => onSelectMemory(relation.toMemoryId)}>{to?.displayTitle ?? "已有记忆"}</button>
      </div>
      <section class="detail-section">
        <h3>关联依据</h3>
        <p class="long-form">{relation.rationale}</p>
      </section>
      <dl class="metadata-grid">
        <dt>关系</dt>
        <dd>{meta.label}</dd>
        <dt>置信度</dt>
        <dd>{relation.confidence}</dd>
      </dl>
    </article>
  );
}

function SuggestionDetail({
  suggestion,
  data,
  onSelectMemory,
}: {
  suggestion: BrowserRelationSuggestion;
  data: GraphViewData;
  onSelectMemory: (id: string) => void;
}) {
  const from = data.memories.find((memory) => memory.id === suggestion.fromMemoryId);
  const to = data.memories.find((memory) => memory.id === suggestion.toMemoryId);
  return (
    <article class="detail-article suggestion-detail">
      <div class="detail-kicker">
        <span class="relation-mark relation-suggestion">待审核</span>
        <span>结构信号，不代表事实置信度</span>
      </div>
      <h2>关联线索</h2>
      <div class="relation-path">
        <button type="button" onClick={() => onSelectMemory(suggestion.fromMemoryId)}>
          {from?.displayTitle ?? "已有记忆"}
        </button>
        <span>↔</span>
        <button type="button" onClick={() => onSelectMemory(suggestion.toMemoryId)}>
          {to?.displayTitle ?? "已有记忆"}
        </button>
      </div>
      <section class="detail-section">
        <h3>为什么出现</h3>
        <p class="long-form">{suggestion.rationale}</p>
      </section>
      <section class="detail-section">
        <h3>匹配依据</h3>
        <div class="signal-list">
          {suggestion.signals.map((signal) => (
            <div class="signal-row" key={signal.key}>
              <span>{signal.label}</span>
              <strong>+{signal.weight}</strong>
            </div>
          ))}
        </div>
      </section>
      <dl class="metadata-grid">
        <dt>线索 ID</dt><dd>{suggestion.id}</dd>
      </dl>
      <p class="review-note">只有在 Codex 中明确提出“审核关系线索”，并通过既有审核流程后，才会写入正式关系。</p>
    </article>
  );
}

function BriefRows({
  items,
  empty,
  onOpenMemory,
}: {
  items: ProjectBriefItem[];
  empty: string;
  onOpenMemory: (id: string) => void;
}) {
  if (items.length === 0) return <p class="brief-empty">{empty}</p>;
  return (
    <div class="brief-memory-list">
      {items.map((item) => (
        <button
          class={`brief-memory-row role-${item.briefRole}`}
          type="button"
          key={item.memoryId}
          onClick={() => onOpenMemory(item.memoryId)}
        >
          <span class="brief-row-marker" />
          <span class="brief-row-copy">
            <span class="brief-row-meta">
              {item.roleSource === "reviewed" ? "已确认位置" : "自动归类"}
              {item.topic ? ` · ${item.topic}` : ""}
            </span>
            <strong>{item.displayTitle}</strong>
            {item.displayTitle !== item.title && <code class="technical-title">原始标题 · {item.title}</code>}
            <span>{item.summary}</span>
          </span>
          <span class="brief-row-aside">
            <time>{formatDate(item.updatedAt)}</time>
            <small>{item.citationCount} 个来源{item.stale ? " · 需复核" : ""}</small>
          </span>
          <ArrowRight size={17} />
        </button>
      ))}
    </div>
  );
}

function BriefView({
  data,
  onOpenMemory,
  onOpenTrace,
}: {
  data: GraphViewData;
  onOpenMemory: (id: string) => void;
  onOpenTrace: () => void;
}) {
  const brief = data.brief;
  if (!brief) {
    return <main class="brief-workspace"><p class="brief-empty">项目概况数据不可用，请重新生成这份静态快照。</p></main>;
  }
  const memoryById = new Map(data.memories.map((memory) => [memory.id, memory]));
  const summary = brief.summary;
  return (
    <main class="brief-workspace" data-testid="project-brief">
      <header class="brief-hero">
        <div>
          <span class="eyebrow"><Compass size={14} /> 项目记忆首页</span>
          <h2>先看项目现状，再决定要追查什么</h2>
          <p>{brief.overview}</p>
        </div>
        <div class="brief-actions">
          <button class="trace-action" type="button" onClick={onOpenTrace}>
            <Network size={16} />查看关系追溯<ArrowRight size={15} />
          </button>
          <span>静态快照 {formatDate(data.generatedAt)}</span>
        </div>
        <div class="brief-metrics" aria-label="项目知识概况">
          <span><strong>{summary.conclusionCount}</strong>当前结论</span>
          <span><strong>{summary.progressCount}</strong>已完成工作</span>
          <span class={summary.riskCount > 0 ? "warning" : ""}><strong>{summary.riskCount}</strong>风险边界</span>
          <span><strong>{summary.nextStepCount}</strong>已确认下一步</span>
        </div>
      </header>

      <div class="brief-layout">
        <div class="brief-main">
          <section class="brief-section" data-testid="brief-conclusions">
            <div class="brief-heading"><div><span>01</span><h3>当前结论</h3></div><small>现在可以直接依赖的判断</small></div>
            <BriefRows items={brief.currentConclusions} empty="暂无当前结论" onOpenMemory={onOpenMemory} />
          </section>
          <section class="brief-section" data-testid="brief-progress">
            <div class="brief-heading"><div><span>02</span><h3>已完成工作</h3></div><small>已经做过且值得复用的内容</small></div>
            <BriefRows items={brief.completedWork} empty="暂无已完成工作" onOpenMemory={onOpenMemory} />
          </section>
          <section class="brief-section" data-testid="brief-risks">
            <div class="brief-heading"><div><span>03</span><h3>风险与证据边界</h3></div><small>继续使用前需要注意什么</small></div>
            <BriefRows items={brief.risks} empty="暂无已记录风险" onOpenMemory={onOpenMemory} />
          </section>
          <section class="brief-section" data-testid="brief-next-steps">
            <div class="brief-heading"><div><span>04</span><h3>下一步</h3></div><small>已确认动作与系统建议严格分开</small></div>
            <BriefRows items={brief.nextSteps} empty="暂无已确认的下一步" onOpenMemory={onOpenMemory} />
            {brief.systemSuggestions.length > 0 && (
              <div class="system-suggestions">
                <div class="suggestion-label"><Sparkles size={14} />系统建议 · 未经审核</div>
                {brief.systemSuggestions.map((suggestion) => (
                  <button type="button" key={suggestion.id} onClick={() => suggestion.memoryIds[0] && onOpenMemory(suggestion.memoryIds[0])}>
                    <strong>{suggestion.text}</strong><span>{suggestion.reason}</span><ArrowRight size={15} />
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside class="brief-sidebar">
          <section class="brief-side-section" data-testid="brief-recommended">
            <div class="brief-heading"><div><BookOpen size={15} /><h3>推荐先读</h3></div><small>{brief.recommendedReading.length}</small></div>
            <div class="brief-link-list">
              {brief.recommendedReading.map((item, index) => (
                <button type="button" key={item.memoryId} onClick={() => onOpenMemory(item.memoryId)}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span><strong>{item.displayTitle}</strong><small>{item.reasons.join("；")}</small></span>
                  <ArrowRight size={15} />
                </button>
              ))}
              {brief.recommendedReading.length === 0 && <p class="brief-empty">暂无推荐</p>}
            </div>
          </section>
          <section class="brief-side-section">
            <div class="brief-heading"><div><Activity size={15} /><h3>最近更新</h3></div></div>
            <div class="recent-list">
              {brief.recentUpdates.map((item) => (
                <button type="button" key={item.memoryId} onClick={() => onOpenMemory(item.memoryId)}>
                  <time>{formatDate(item.updatedAt)}</time><strong>{item.displayTitle}</strong>
                </button>
              ))}
            </div>
          </section>
          <section class="brief-side-section evidence-summary">
            <div class="brief-heading"><div><FileCheck2 size={15} /><h3>来源状态</h3></div></div>
            <dl>
              <dt>可追溯来源</dt><dd>{summary.citationCount}</dd>
              <dt>失效来源</dt><dd class={summary.staleCitationCount > 0 ? "warning" : ""}>{summary.staleCitationCount}</dd>
              <dt>过期记忆</dt><dd class={summary.staleMemoryCount > 0 ? "warning" : ""}>{summary.staleMemoryCount}</dd>
            </dl>
          </section>
          {brief.topics.length > 0 && (
            <section class="brief-side-section">
              <div class="brief-heading"><div><Layers3 size={15} /><h3>共享主题</h3></div></div>
              <div class="shared-topics">
                {brief.topics.map((topic) => (
                  <div key={topic.name}><strong>{topic.name}</strong><span>{topic.memoryCount} 条记忆</span>
                    {topic.memoryIds.map((id) => <button type="button" key={id} onClick={() => onOpenMemory(id)}>{memoryById.get(id)?.displayTitle ?? "已有记忆"}</button>)}
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}

function HandoffRows({
  items,
  onOpenMemory,
  memories,
  compact = false,
}: {
  items: Array<ProjectBriefItem & { reason?: string; isLegacy?: boolean }>;
  onOpenMemory: (id: string) => void;
  memories: BrowserMemory[];
  compact?: boolean;
}) {
  if (items.length === 0) return <p class="handoff-empty">暂无已保存的相关记录。</p>;
  return (
    <div class={`handoff-records ${compact ? "compact" : ""}`}>
      {items.map((item) => {
        const memory = memories.find((candidate) => candidate.id === item.memoryId);
        const sources =
          memory?.citations
            .map((citation) => citation.note ?? citation.sourcePath.split("/").at(-1))
            .filter(Boolean) ?? [];
        return (
        <button class="handoff-record" type="button" key={item.memoryId} onClick={() => onOpenMemory(item.memoryId)}>
          <time>{item.occurredAt ? formatDate(item.occurredAt).slice(0, 10) : "时间未补全"}</time>
          <span class="handoff-record-copy">
            <strong>{item.displayTitle}</strong>
            {item.displayTitle !== item.title && <code class="technical-title">原始标题 · {item.title}</code>}
            {item.reason && <small>{item.reason}</small>}
            {compact ? (
              <span>{item.narrative?.conclusion ?? item.summary}</span>
            ) : item.narrative ? (
              <dl class="work-story">
                <dt>为什么做</dt><dd>{item.narrative.reason}</dd>
                <dt>做了什么</dt><dd>{item.narrative.action}</dd>
                <dt>依据与数据</dt><dd>{sources.length > 0 ? sources.join("、") : "尚未记录可追溯来源"}</dd>
                <dt>产出了什么</dt><dd>{item.narrative.outcome}</dd>
                <dt>得到的结论</dt><dd>{item.narrative.conclusion}</dd>
              </dl>
            ) : (
              <span>{item.summary}</span>
            )}
            {item.isLegacy && <em>旧记录：原因、依据或产出尚未补全，不会自动猜测。</em>}
          </span>
          <ArrowRight size={17} />
        </button>
      )})}
    </div>
  );
}

function EventTimeline({
  data,
  onOpenMemory,
  onOpenTrace,
  selectedMemoryId,
}: {
  data: GraphViewData;
  onOpenMemory: (id: string) => void;
  onOpenTrace: (id: string) => void;
  selectedMemoryId?: string | null;
}) {
  const workUnits = useMemo(() => buildTimelineWorkUnits(data), [data]);
  const selectedUnitId = useMemo(
    () => workUnits.find((unit) => unit.events.some((event) => event.memory.id === selectedMemoryId))?.id,
    [selectedMemoryId, workUnits],
  );
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(
    () => new Set([selectedUnitId ?? workUnits[0]?.id].filter((id): id is string => Boolean(id))),
  );
  useEffect(() => {
    if (!selectedUnitId) return;
    setExpandedUnits((current) => new Set(current).add(selectedUnitId));
  }, [selectedUnitId]);
  const suggestions = data.guide.relationSuggestions.slice(0, 6);
  const toggleUnit = (id: string) => {
    setExpandedUnits((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  return (
    <section class="event-timeline-section" data-testid="event-timeline">
      <div class="event-timeline-heading">
        <div><span class="eyebrow"><Activity size={14} /> 事件脉络</span><h3>按工作单元还原前因、动作与结果</h3></div>
        <small>主脉络只使用已审核关系；不确定线索单独列出。</small>
      </div>
      <div class="event-timeline-layout">
        <div class="work-unit-list">
          {workUnits.map((unit) => {
            const expanded = expandedUnits.has(unit.id);
            return (
              <article class={`work-unit ${unit.ungrouped ? "ungrouped" : ""}`} key={unit.id}>
                <button class="work-unit-summary" type="button" aria-expanded={expanded} onClick={() => toggleUnit(unit.id)}>
                  <span class="work-unit-title"><strong>{unit.title}</strong><small>{unit.startAt.slice(0, 10)}{unit.startAt !== unit.endAt ? ` → ${unit.endAt.slice(0, 10)}` : ""}</small></span>
                  <span class="work-unit-metrics"><span>{unit.events.length} 个事件</span><span>{unit.formalRelationCount} 条已审核关系</span><em>{unit.status}</em></span>
                  <ChevronLeft class={expanded ? "expanded" : ""} size={18} />
                </button>
                {expanded && (
                  <div class="event-timeline">
                    {unit.events.map((event) => (
                      <article class="timeline-event" key={event.memory.id}>
                        <span class={`timeline-marker phase-${event.memory.phase ?? "other"}`} />
                        <div class="timeline-event-card">
                          <button class="timeline-event-main" type="button" onClick={() => onOpenMemory(event.memory.id)}>
                            <span class="timeline-event-meta"><time>{eventDateTimeLabel(event.memory, data.generatedAt)}</time><span>{PHASE_LABELS[event.memory.phase ?? "other"]}</span>{event.memory.briefRole && <span>{BRIEF_ROLE_LABELS[event.memory.briefRole]}</span>}<SubmitterBadge memory={event.memory} /></span>
                            <strong>{event.displayTitle}</strong>
                            <p>{memorySummary(event.memory)}</p>
                            {event.memory.narrative && (
                              <dl class="timeline-action-result">
                                <dt>动作</dt><dd>{event.memory.narrative.action}</dd>
                                <dt>结果</dt><dd>{event.memory.narrative.outcome}</dd>
                              </dl>
                            )}
                            <span class="timeline-event-flags"><span>{KIND_LABELS[event.memory.kind]}</span><span>{event.memory.confidence}</span>{event.memory.stale && <span class="warning">已过期</span>}</span>
                          </button>
                          <button class="timeline-open-graph" type="button" onClick={() => onOpenTrace(event.memory.id)}><Network size={15} />打开因果图</button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
          {workUnits.length === 0 && <p class="handoff-empty">暂无可展示的事件。</p>}
        </div>
        <aside class="possible-relations">
          <div class="possible-relations-heading"><Route size={15} /><div><strong>可能关联</strong><small>自动线索，不进入主路径</small></div></div>
          {suggestions.length === 0 ? <p>暂无待审核线索。</p> : suggestions.map((suggestion) => {
            const from = data.memories.find((memory) => memory.id === suggestion.fromMemoryId);
            const to = data.memories.find((memory) => memory.id === suggestion.toMemoryId);
            return <button type="button" key={suggestion.id} onClick={() => from && onOpenMemory(from.id)}><strong>{from?.displayTitle ?? "已有事件"} ↔ {to?.displayTitle ?? "已有事件"}</strong><span>{suggestion.rationale}</span></button>;
          })}
        </aside>
      </div>
    </section>
  );
}

function HandoffView({
  data,
  onOpenMemory,
  onOpenTrace,
  onOpenRecords,
  selectedMemoryId,
}: {
  data: GraphViewData;
  onOpenMemory: (id: string) => void;
  onOpenTrace: (id?: string) => void;
  onOpenRecords: () => void;
  selectedMemoryId?: string | null;
}) {
  const [highlightedTarget, setHighlightedTarget] = useState<string | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
  }, []);
  const brief = data.brief;
  if (!brief) return <main class="handoff-workspace"><p class="handoff-empty">项目交接资料不可用，请重新生成这份静态快照。</p></main>;

  const jumpTo = (target: "conclusions" | "progress" | "risks" | "nextSteps", count: number) => {
    if (count === 0) return;
    const element = document.getElementById(`handoff-target-${target}`);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "start" });
    setHighlightedTarget(target);
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setHighlightedTarget(null), 1800);
  };

  return (
    <main class="handoff-workspace" data-testid="project-handoff">
      <header class="handoff-hero">
        <div>
          <span class="eyebrow"><Compass size={14} /> 项目脉络</span>
          <h2>从时间线看懂项目怎么走到今天</h2>
          <p>{brief.handoff.coverage}</p>
        </div>
        <div class="handoff-actions">
          <button type="button" onClick={onOpenRecords}><BookOpen size={16} />查看完整记录</button>
          <button type="button" onClick={() => onOpenTrace()}><Network size={16} />核对前因后果</button>
          <span>根据已保存记录整理 · {formatDate(data.generatedAt)}</span>
        </div>
      </header>

      <section class="handoff-state" aria-label="现在最需要知道什么">
        <button type="button" class="handoff-state-link" disabled={brief.summary.conclusionCount === 0} onClick={() => jumpTo("conclusions", brief.summary.conclusionCount)}>
          <span>当前结论</span><strong>{brief.summary.conclusionCount}</strong><small>已确认判断</small>
        </button>
        <button type="button" class="handoff-state-link" disabled={brief.summary.progressCount === 0} onClick={() => jumpTo("progress", brief.summary.progressCount)}>
          <span>已完成工作</span><strong>{brief.summary.progressCount}</strong><small>可以继续复用</small>
        </button>
        <button type="button" class={`handoff-state-link ${brief.summary.riskCount ? "warning" : ""}`} disabled={brief.summary.riskCount === 0} onClick={() => jumpTo("risks", brief.summary.riskCount)}>
          <span>需要注意</span><strong>{brief.summary.riskCount}</strong><small>风险与证据边界</small>
        </button>
        <button type="button" class="handoff-state-link" disabled={brief.summary.nextStepCount === 0} onClick={() => jumpTo("nextSteps", brief.summary.nextStepCount)}>
          <span>下一步</span><strong>{brief.summary.nextStepCount}</strong><small>已确认行动</small>
        </button>
      </section>

      <EventTimeline
        data={data}
        onOpenMemory={onOpenMemory}
        onOpenTrace={(id) => onOpenTrace(id)}
        selectedMemoryId={selectedMemoryId}
      />

      <div class="handoff-layout">
        <div class="handoff-main">
          <section class="handoff-section" data-testid="handoff-start">
            <div class="handoff-heading"><span>从这里开始</span><small>按当前工作需要排列，不按图谱连接数量排列</small></div>
            <HandoffRows items={brief.handoff.startHere} onOpenMemory={onOpenMemory} memories={data.memories} compact />
          </section>
          <section id="handoff-target-progress" class={`handoff-section handoff-anchor ${highlightedTarget === "progress" ? "is-highlighted" : ""}`} data-testid="handoff-recent">
            <div class="handoff-heading"><span>最近发生了什么</span><small>按实际发生时间倒序</small></div>
            <HandoffRows items={brief.handoff.recentWork} onOpenMemory={onOpenMemory} memories={data.memories} />
          </section>
          <section class="handoff-section handoff-summary">
            <div class="handoff-heading"><span>现在最需要知道什么</span><small>先看事实，再决定下一步</small></div>
            <div class="handoff-summary-grid">
              <div id="handoff-target-conclusions" class={`handoff-anchor ${highlightedTarget === "conclusions" ? "is-highlighted" : ""}`}><h3>当前结论</h3><BriefRows items={brief.currentConclusions} empty="暂无已确认结论" onOpenMemory={onOpenMemory} /></div>
              <div id="handoff-target-risks" class={`handoff-anchor ${highlightedTarget === "risks" ? "is-highlighted" : ""}`}><h3>风险与证据边界</h3><BriefRows items={brief.risks} empty="暂无已记录风险" onOpenMemory={onOpenMemory} /></div>
              <div id="handoff-target-nextSteps" class={`handoff-anchor ${highlightedTarget === "nextSteps" ? "is-highlighted" : ""}`}><h3>已确认下一步</h3><BriefRows items={brief.nextSteps} empty="暂无已确认的下一步" onOpenMemory={onOpenMemory} /></div>
            </div>
          </section>
        </div>
        <aside class="handoff-side">
          <section><h3>数据与依据</h3><p>已记录 {brief.summary.citationCount} 个来源，其中 {brief.summary.staleCitationCount} 个需要重新核对。打开任一记录即可查看数据、报告和文件入口。</p></section>
          <section><h3>资料还缺什么</h3><p>{brief.handoff.history.some((item) => item.isLegacy) ? "部分旧记录尚未补全为什么做、做了什么和产出。" : "已保存记录均带有可阅读的工作过程。"}</p></section>
          {brief.systemSuggestions.length > 0 && <section><h3>建议</h3><p>{brief.systemSuggestions[0]?.text}</p><small>这是系统建议，尚未作为项目决定保存。</small></section>}
        </aside>
      </div>
    </main>
  );
}

function RecordsView({ data, onOpenMemory }: { data: GraphViewData; onOpenMemory: (id: string) => void }) {
  const [topic, setTopic] = useState("");
  const [year, setYear] = useState("");
  const history = (data.brief?.handoff.history ?? []).filter((item) =>
    (!topic || item.topic === topic) && (!year || item.occurredAt?.startsWith(year)),
  );
  const topics = [...new Set((data.brief?.handoff.history ?? []).map((item) => item.topic).filter(Boolean))] as string[];
  const years = [...new Set((data.brief?.handoff.history ?? []).map((item) => item.occurredAt?.slice(0, 4)).filter(Boolean))] as string[];
  return <main class="records-workspace" data-testid="project-records">
    <header><span class="eyebrow"><BookOpen size={14} /> 完整记录</span><h2>项目做过什么，为什么做，结果是什么</h2><p>每一项都是一个有结果的工作单元，而不是命令或对话片段。</p></header>
    <div class="records-filters"><label>主题<select value={topic} onChange={(event) => setTopic(event.currentTarget.value)}><option value="">全部主题</option>{topics.map((value) => <option value={value}>{value}</option>)}</select></label><label>时间<select value={year} onChange={(event) => setYear(event.currentTarget.value)}><option value="">全部时间</option>{years.map((value) => <option value={value}>{value}</option>)}</select></label></div>
    <HandoffRows items={history} onOpenMemory={onOpenMemory} memories={data.memories} />
  </main>;
}

function ReadingProgress({
  viewMode,
  hasFocus,
}: {
  viewMode: ViewMode;
  hasFocus: boolean;
}) {
  const activeStep = viewMode === "path" ? 2 : viewMode === "event" ? 3 : 1;
  return (
    <div class="reading-progress" role="group" aria-label="三层阅读导航">
      <span class={`reading-progress-step ${activeStep === 1 ? "active" : ""}`} aria-current={activeStep === 1 ? "step" : undefined}>
        <span>1</span><strong>项目时间轴</strong>
      </span>
      <i>→</i>
      <span class={`reading-progress-step ${activeStep === 2 ? "active" : ""} ${!hasFocus ? "disabled" : ""}`} aria-current={activeStep === 2 ? "step" : undefined} aria-disabled={!hasFocus}>
        <span>2</span><strong>关系脉络</strong>
      </span>
      <i>→</i>
      <span class={`reading-progress-step ${activeStep === 3 ? "active" : ""} ${!hasFocus ? "disabled" : ""}`} aria-current={activeStep === 3 ? "step" : undefined} aria-disabled={!hasFocus}>
        <span>3</span><strong>事件详情</strong>
      </span>
    </div>
  );
}

function ProjectTimelineView({
  data,
  onOpenPath,
}: {
  data: GraphViewData;
  onOpenPath: (id: string) => void;
}) {
  const days = useMemo(() => buildTimelineDayGroups(data), [data]);
  const brief = data.brief;
  const [expandedDays, setExpandedDays] = useState<Set<string>>(
    () => new Set(days[0]?.date ? [days[0].date] : []),
  );
  useEffect(() => {
    const validDates = new Set(days.map((day) => day.date));
    const latestDate = days[0]?.date;
    setExpandedDays((current) => {
      const next = new Set([...current].filter((date) => validDates.has(date)));
      if (latestDate) next.add(latestDate);
      return next;
    });
  }, [days]);
  const toggleDay = (date: string) => {
    setExpandedDays((current) => {
      const next = new Set(current);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };
  return (
    <main class="project-timeline-workspace" data-testid="project-timeline">
      <header class="timeline-overview-hero">
        <div>
          <span class="eyebrow"><Activity size={14} /> 第一层 · 项目时间轴</span>
          <h2>按真实发生时间看懂项目怎么走到今天</h2>
          <p>{brief?.overview ?? `已保存 ${data.memories.length} 条项目记忆。`} 日期按最新到最早排列；当天按工作链分组，链内按“发生 → 发现 → 原因 → 处理结果”阅读。只有原始数据包含时分才显示具体时间。</p>
        </div>
        <div class="timeline-latest-note">
          <strong>{days[0]?.date ?? "暂无事件"}</strong>
          <span>最新项目活动</span>
        </div>
      </header>

      {brief && (
        <section class="timeline-status-strip" aria-label="项目当前状态">
          <div><span>当前结论</span><strong>{brief.summary.conclusionCount}</strong><small>{brief.currentConclusions[0]?.displayTitle ?? "暂无已确认结论"}</small></div>
          <div><span>已完成工作</span><strong>{brief.summary.progressCount}</strong><small>{brief.completedWork[0]?.displayTitle ?? "暂无已完成工作"}</small></div>
          <div class={brief.summary.riskCount > 0 ? "warning" : ""}><span>需要注意</span><strong>{brief.summary.riskCount}</strong><small>{brief.risks[0]?.displayTitle ?? "暂无已记录风险"}</small></div>
          <div><span>下一步</span><strong>{brief.summary.nextStepCount}</strong><small>{brief.nextSteps[0]?.displayTitle ?? "暂无已确认下一步"}</small></div>
        </section>
      )}

      <section class="date-timeline" aria-label="项目发展事件">
        {days.map((day, dayIndex) => (
          <article class={`timeline-day ${dayIndex === 0 ? "latest" : ""} ${expandedDays.has(day.date) ? "is-expanded" : "is-collapsed"}`} key={day.date} data-date={day.date} data-expanded={expandedDays.has(day.date)}>
            <div class="timeline-day-rail">
              <span class="timeline-day-dot" />
              <time>{day.date}</time>
              {dayIndex === 0 && <em>最新</em>}
            </div>
            <div class={`timeline-day-content ${expandedDays.has(day.date) ? "is-expanded" : "is-collapsed"}`}>
              <header class="timeline-day-header">
                <button
                  class="timeline-day-toggle"
                  type="button"
                  aria-expanded={expandedDays.has(day.date)}
                  aria-controls={`timeline-day-content-${day.date}`}
                  aria-label={`${expandedDays.has(day.date) ? "收起" : "展开"}${day.date}的事件`}
                  onClick={() => toggleDay(day.date)}
                >
                  <span class="timeline-day-summary">
                    <span class="timeline-day-count"><strong>{day.eventCount} 个事件</strong><small>{day.workUnitCount} 个工作单元</small></span>
                    <span class={`timeline-day-state ${expandedDays.has(day.date) ? "is-expanded" : "is-collapsed"}`}>
                      <i />{expandedDays.has(day.date) ? "已展开 · 完整事件链" : "可展开 · 事件清单"}
                    </span>
                  </span>
                  <span class="timeline-day-phases">{day.phases.map(({ phase, count }) => <span class={`phase-${phase}`}>{PHASE_LABELS[phase]} {count}</span>)}</span>
                  <ChevronDown class={expandedDays.has(day.date) ? "expanded" : ""} size={16} />
                </button>
              </header>
              {expandedDays.has(day.date) ? <div class="timeline-day-work-units" id={`timeline-day-content-${day.date}`}>
                {day.workUnits.map((unit) => (
                  <section class={`timeline-day-work-unit ${unit.ungrouped ? "ungrouped" : ""}`} key={unit.id}>
                    <header class="timeline-day-work-unit-header">
                      <strong>{unit.label}</strong>
                      <span>{unit.events.length} 步 · 按事件链顺序</span>
                    </header>
                    <div class="timeline-day-events">
                      {unit.events.map((event, eventIndex) => (
                        <div class="timeline-chain-step" key={event.memory.id}>
                          {event.incomingRelations.length > 0 && (
                            <div class="timeline-causality-links">
                              {event.incomingRelations.map((relation) => (
                                <div class="timeline-causality-link" key={`${relation.type}-${relation.fromMemoryId}`}>
                                  <span>← {RELATION_META[relation.type]?.label ?? relation.type}</span>
                                  <strong>{relation.fromTitle}</strong>
                                  <small>{relation.rationale}</small>
                                </div>
                              ))}
                            </div>
                          )}
                          <button
                            class="timeline-overview-event"
                            type="button"
                            aria-label={`查看关系脉络：${event.displayTitle}`}
                            onClick={() => onOpenPath(event.memory.id)}
                          >
                            <span class={`timeline-overview-marker phase-${event.memory.phase ?? "other"}`} />
                            <span class="timeline-overview-copy">
                              <span class="timeline-overview-meta">
                                <span class="timeline-step-number">第 {eventIndex + 1} 步</span>
                                <time>{event.timeLabel}</time>
                                <span>{PHASE_LABELS[event.memory.phase ?? "other"]}</span>
                                {event.memory.briefRole && <span>{BRIEF_ROLE_LABELS[event.memory.briefRole]}</span>}
                                <SubmitterBadge memory={event.memory} />
                              </span>
                              <strong>{event.displayTitle}</strong>
                              <small>{memorySummary(event.memory)}</small>
                            </span>
                            <span class="timeline-overview-action">查看这一步 <ArrowRight size={15} /></span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div> : <div class="timeline-day-collapsed-events" id={`timeline-day-content-${day.date}`} aria-label={`${day.date}事件清单`}>
                {day.events.map((event, eventIndex) => (
                  <button
                    class="timeline-day-collapsed-event"
                    type="button"
                    key={event.memory.id}
                    aria-label={`查看关系脉络：${event.displayTitle}`}
                    onClick={() => onOpenPath(event.memory.id)}
                  >
                    <span class="timeline-day-collapsed-index">{String(eventIndex + 1).padStart(2, "0")}</span>
                    <span class="timeline-day-collapsed-copy">
                      <strong>{event.displayTitle}</strong>
                    </span>
                  </button>
                ))}
              </div>}
            </div>
          </article>
        ))}
        {days.length === 0 && <p class="handoff-empty">暂无可展示的项目事件。</p>}
      </section>
    </main>
  );
}

function RelationPathView({
  data,
  memoryId,
  onBack,
  onOpenEvent,
}: {
  data: GraphViewData;
  memoryId: string;
  onBack: () => void;
  onOpenEvent: (id: string) => void;
}) {
  const graphRoot = useRef<HTMLDivElement>(null);
  const path = useMemo(() => buildEventPathView(data, memoryId), [data, memoryId]);
  useEffect(() => {
    if (!path || !graphRoot.current) return;
    const byId = new Map(path.memories.map((memory) => [memory.id, memory]));
    const externalIds = new Set(path.externalMemoryIds);
    const elements = buildGraphElements(data, path.memories, "", null, false).map((element) => {
      if (element.group !== "nodes") return element;
      const id = String(element.data.id);
      const memory = byId.get(id);
      if (!memory) return element;
      return {
        ...element,
        data: {
          ...element.data,
          label: memory.displayTitle,
          phaseColor: PHASE_COLORS[memory.phase ?? "other"],
        },
        classes: `${element.classes ?? ""} labeled ${id === path.focusMemoryId ? "focus-event" : ""} ${externalIds.has(id) ? "external-event" : ""}`.trim(),
      };
    });
    const cy = cytoscape({
      container: graphRoot.current,
      elements,
      style: pathGraphStyle(isLightTheme()),
      minZoom: 0.45,
      maxZoom: 1.8,
      wheelSensitivity: 0.16,
      boxSelectionEnabled: false,
    });
    const themeObserver = new MutationObserver(() => {
      cy.style(pathGraphStyle(isLightTheme()));
    });
    themeObserver.observe(document.documentElement, { attributeFilter: ["data-theme"] });
    cy.on("tap", "node.memory", (event) => onOpenEvent(event.target.id()));
    cy.layout({ name: "dagre", rankDir: "LR", rankSep: 115, nodeSep: 58, edgeSep: 34, animate: false, fit: true, padding: 44 } as cytoscape.LayoutOptions).run();
    return () => {
      themeObserver.disconnect();
      cy.destroy();
    };
  }, [data, onOpenEvent, path]);
  if (!path) return <main class="event-path-workspace"><p class="handoff-empty">找不到该事件。</p></main>;
  return (
    <main class="event-path-workspace" data-testid="event-path">
      <header class="layer-page-header">
        <button class="layer-back" type="button" onClick={onBack}><ChevronLeft size={17} />返回项目时间轴</button>
        <div><span class="eyebrow"><Route size={14} /> 第二层 · 关系脉络</span><h2>{path.workUnitLabel}</h2><p>{eventDateTimeLabel(path.focus, data.generatedAt)} · 当前聚焦：{path.focus.displayTitle}</p></div>
        <button class="primary-layer-action" type="button" onClick={() => onOpenEvent(path.focusMemoryId)}>查看事件前因后果 <ArrowRight size={16} /></button>
      </header>
      <div class="event-path-layout">
        <section class="event-path-panel">
          <div class="path-legend">
            <span><i class="focus" />当前事件</span><span><i class="external" />跨工作单元</span><span>{path.memories.length} 个事件</span><span>{path.relations.length} 条正式关系</span>
          </div>
          <div class="event-path-canvas" ref={graphRoot} role="img" aria-label={`${path.focus.displayTitle} 事件关系路径图`} />
          {path.relations.length === 0 && (
            <div class="path-standalone-event">
              <span class={`phase-badge phase-${path.focus.phase ?? "other"}`}>{PHASE_LABELS[path.focus.phase ?? "other"]}</span>
              <strong>{path.focus.displayTitle}</strong>
              <small>{memorySummary(path.focus)}</small>
            </div>
          )}
          {path.relations.length === 0 && <div class="path-empty-note"><CircleAlert size={16} />尚未记录正式关系；当前仅展示该事件本身。</div>}
        </section>
        <aside class="path-suggestions">
          <div><span class="eyebrow"><Sparkles size={13} /> 可能关联</span><p>自动线索不会进入正式主路径。</p></div>
          {path.suggestions.length === 0 ? <small>暂无与当前路径有关的待审核线索。</small> : path.suggestions.slice(0, 6).map((suggestion) => {
            const from = data.memories.find((memory) => memory.id === suggestion.fromMemoryId);
            const to = data.memories.find((memory) => memory.id === suggestion.toMemoryId);
            const titles = buildContextualEventTitles(data.memories);
            return <article key={suggestion.id}><strong>{(from && titles.get(from.id)) ?? from?.displayTitle ?? "已有事件"} ↔ {(to && titles.get(to.id)) ?? to?.displayTitle ?? "已有事件"}</strong><span>{suggestion.rationale}</span></article>;
          })}
        </aside>
      </div>
    </main>
  );
}

function RelationEventCard({ item, generatedAt, onOpen }: { item: EventRelationItem; generatedAt: string; onOpen: (id: string) => void }) {
  return (
    <button class="causality-event-card" type="button" onClick={() => onOpen(item.memory.id)}>
      <span>{PHASE_LABELS[item.memory.phase ?? "other"]} · {eventDateTimeLabel(item.memory, generatedAt)} · {submitterLabel(item.memory)}</span>
      <strong>{item.memory.displayTitle}</strong>
      <small>{item.sentence}</small>
    </button>
  );
}

function EventFocusView({
  data,
  memoryId,
  onBack,
  onOpenEvent,
}: {
  data: GraphViewData;
  memoryId: string;
  onBack: () => void;
  onOpenEvent: (id: string) => void;
}) {
  const view = useMemo(() => buildEventCausalityView(data, memoryId), [data, memoryId]);
  if (!view) return <main class="event-focus-workspace"><p class="handoff-empty">找不到该事件。</p></main>;
  const memory = view.memory;
  const sources = memory.citations.map((citation) => citation.note ?? citation.sourcePath.split("/").at(-1) ?? citation.sourcePath);
  return (
    <main class="event-focus-workspace" data-testid="event-focus">
      <header class="layer-page-header event-focus-header">
        <button class="layer-back" type="button" onClick={onBack}><ChevronLeft size={17} />返回关系脉络</button>
        <div><span class="eyebrow"><Focus size={14} /> 第三层 · 事件前因后果</span><h2>{memory.displayTitle}</h2><p>{eventDateTimeLabel(memory, data.generatedAt)} · {PHASE_LABELS[memory.phase ?? "other"]} · {submitterLabel(memory)}</p></div>
      </header>

      <section class="causality-triptych" aria-label="事件直接前因和后果">
        <div class="causality-column">
          <header><span>直接前因</span><strong>{view.causes.length}</strong></header>
          {view.causes.length === 0 ? <p>尚未保存正式前因。</p> : view.causes.map((item) => <RelationEventCard key={item.relation.id} item={item} generatedAt={data.generatedAt} onOpen={onOpenEvent} />)}
        </div>
        <article class="causality-current">
          <span class={`phase-badge phase-${memory.phase ?? "other"}`}>{PHASE_LABELS[memory.phase ?? "other"]}</span>
          <strong>{memory.displayTitle}</strong>
          <p>{memory.narrative?.conclusion ?? memorySummary(memory)}</p>
          <SubmitterBadge memory={memory} />
          <small>{memory.briefRole ? BRIEF_ROLE_LABELS[memory.briefRole] : KIND_LABELS[memory.kind]} · {memory.confidence}{memory.stale ? " · 已过期" : ""}</small>
        </article>
        <div class="causality-column">
          <header><span>直接后果</span><strong>{view.effects.length}</strong></header>
          {view.effects.length === 0 ? <p>尚未保存正式后果。</p> : view.effects.map((item) => <RelationEventCard key={item.relation.id} item={item} generatedAt={data.generatedAt} onOpen={onOpenEvent} />)}
        </div>
      </section>

      <div class="event-focus-layout">
        <section class="event-story-panel">
          <div class="event-story-heading"><span class="eyebrow">完整过程</span><h3>为什么做、做了什么、最终意味着什么</h3></div>
          {memory.narrative ? (
            <dl class="event-story-grid">
              <dt>为什么做</dt><dd>{memory.narrative.reason}</dd>
              <dt>做了什么</dt><dd>{memory.narrative.action}</dd>
              <dt>依据与数据</dt><dd>{sources.length > 0 ? sources.join("、") : "尚未记录可追溯来源"}</dd>
              <dt>产出了什么</dt><dd>{memory.narrative.outcome}</dd>
              <dt>得到的结论</dt><dd>{memory.narrative.conclusion}</dd>
              <dt>现在意味着什么</dt><dd>{memory.narrative.conclusion || memorySummary(memory)}</dd>
            </dl>
          ) : (
            <div class="legacy-event-story"><p>{memory.content}</p><small>旧记录尚未补全结构化工作过程，不会自动猜测。</small></div>
          )}
          <div class="event-source-list">
            <h3>来源与证据</h3>
            {memory.citations.length === 0 ? <p>尚未记录来源。</p> : memory.citations.map((citation) => citation.fileUrl ? <a href={citation.fileUrl} target="_blank" rel="noreferrer"><FileSearch size={14} />{citation.note ?? citation.sourcePath}<span>{citation.stale ? "需要复核" : CITATION_LABELS[citation.role]}</span></a> : <div><FileSearch size={14} />{citation.note ?? citation.sourcePath}<span>{citation.stale ? "需要复核" : CITATION_LABELS[citation.role]}</span></div>)}
          </div>
        </section>
        <aside class="event-relations-panel">
          <section><h3>相关事件</h3>{view.related.length === 0 ? <p>暂无正式相关事件。</p> : view.related.map((item) => <RelationEventCard key={item.relation.id} item={item} generatedAt={data.generatedAt} onOpen={onOpenEvent} />)}</section>
          <section><h3>冲突信息</h3>{view.contradictions.length === 0 ? <p>暂无正式冲突信息。</p> : view.contradictions.map((item) => <RelationEventCard key={item.relation.id} item={item} generatedAt={data.generatedAt} onOpen={onOpenEvent} />)}</section>
          <section><h3>可能关联</h3>{view.suggestions.length === 0 ? <p>暂无待审核线索。</p> : view.suggestions.slice(0, 4).map((suggestion) => <article class="event-suggestion" key={suggestion.id}>{suggestion.rationale}</article>)}</section>
        </aside>
      </div>
    </main>
  );
}

export function GraphApp({ data, locale = "zh-CN" }: { data: GraphViewData; locale?: GraphLocale }) {
  const initialRoute = parseRouteHash(data);
  const appRoot = useRef<HTMLDivElement>(null);
  const graphRoot = useRef<HTMLDivElement>(null);
  const advancedMenuRef = useRef<HTMLDetailsElement>(null);
  const cyRef = useRef<Core | null>(null);
  const initialized = useRef(false);
  const layoutModeRef = useRef<"immersive" | "reading" | null>(null);
  const positionsRef = useRef(new Map<string, { x: number; y: number }>());
  const [selection, setSelection] = useState<GraphSelection>(null);
  const [focusMemoryId, setFocusMemoryId] = useState<string | null>(initialRoute.memoryId);
  const focusMemoryRef = useRef<string | null>(null);
  const [sourcesExpanded, setSourcesExpanded] = useState(false);
  const [filters, setFilters] = useState<GraphFilters>(DEFAULT_FILTERS);
  const [query, setQuery] = useState("");
  const [activePanel, setActivePanel] = useState<"guide" | "graph" | "details">(
    initialRoute.view === "immersive" ? "graph" : initialRoute.view === "event" || initialRoute.view === "records" ? "details" : "guide",
  );
  const [viewMode, setViewMode] = useState<ViewMode>(initialRoute.view);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [graphScope, setGraphScope] = useState<LocalGraphScope>("all");
  const graphVisible = viewMode === "immersive" || viewMode === "reading";
  useEffect(() => appRoot.current ? localizeGraph(appRoot.current, locale) : undefined, [locale]);
  const latestTimelineMemoryId = useMemo(
    () => buildTimelineDayGroups(data)[0]?.events[0]?.memory.id ?? null,
    [data],
  );

  const scopedMemories = useMemo(
    () => localGraphMemories(data, focusMemoryId, graphScope),
    [data, focusMemoryId, graphScope],
  );
  const memories = useMemo(
    () => visibleMemories(data, filters, focusMemoryId, scopedMemories),
    [data, filters, focusMemoryId, scopedMemories],
  );
  const elements = useMemo(
    () =>
      buildGraphElements(
        data,
        memories,
        filters.relation,
        sourcesExpanded ? focusMemoryId : null,
        showSuggestions,
      ).map((element) => ({
        ...element,
        data: typeof element.data.label === "string"
          ? { ...element.data, label: translateGraphLabel(element.data.label, locale) }
          : element.data,
      })),
    [data, memories, filters.relation, sourcesExpanded, focusMemoryId, showSuggestions, locale],
  );
  const searchResults = useMemo(
    () => (query.trim() ? data.memories.filter((memory) => matchesMemory(memory, query)).slice(0, 8) : []),
    [data.memories, query],
  );
  const topics = useMemo(() => {
    const counts = new Map<string, { total: number; stale: number }>();
    for (const memory of data.memories) {
      const topic = memory.topic ?? "未分组";
      const count = counts.get(topic) ?? { total: 0, stale: 0 };
      count.total += 1;
      if (memory.stale) count.stale += 1;
      counts.set(topic, count);
    }
    return [...counts].sort(([left], [right]) => left.localeCompare(right, "zh-CN"));
  }, [data.memories]);

  const applyRoute = useCallback((view: ViewMode, memoryId: string | null) => {
    setViewMode(view);
    if (memoryId) {
      focusMemoryRef.current = memoryId;
      setFocusMemoryId(memoryId);
      setSelection({ type: "memory", id: memoryId });
    }
    if (view === "guide") setActivePanel("guide");
    else if (view === "immersive" || view === "reading" || view === "path") setActivePanel("graph");
    else setActivePanel("details");
    setRightPanelOpen(view === "immersive" || view === "reading");
  }, []);

  const navigate = useCallback((view: ViewMode, memoryId: string | null = null, replace = false) => {
    const targetMemoryId = memoryId ?? focusMemoryRef.current ?? focusMemoryId ?? latestTimelineMemoryId;
    const hash = routeHash(view, targetMemoryId);
    if (replace) window.history.replaceState(null, "", hash);
    else if (window.location.hash !== hash) window.history.pushState(null, "", hash);
    applyRoute(view, targetMemoryId);
  }, [applyRoute, focusMemoryId, latestTimelineMemoryId]);

  useEffect(() => {
    if (!window.location.hash) window.history.replaceState(null, "", "#timeline");
    const restore = () => {
      const route = parseRouteHash(data);
      applyRoute(route.view, route.memoryId);
    };
    window.addEventListener("popstate", restore);
    window.addEventListener("hashchange", restore);
    return () => {
      window.removeEventListener("popstate", restore);
      window.removeEventListener("hashchange", restore);
    };
  }, [applyRoute, data]);

  const chooseMemory = (id: string) => {
    if (focusMemoryRef.current !== id) setSourcesExpanded(false);
    focusMemoryRef.current = id;
    setFocusMemoryId(id);
    setSelection({ type: "memory", id });
    setRightPanelOpen(true);
    if (isMobileViewport()) setActivePanel("details");
  };

  const chooseCitation = (memoryId: string, citationIndex: number) => {
    focusMemoryRef.current = memoryId;
    setFocusMemoryId(memoryId);
    setSelection({
      type: "citation",
      id: `citation:${memoryId}:${citationIndex}`,
      memoryId,
      citationIndex,
    });
    setRightPanelOpen(true);
    if (isMobileViewport()) setActivePanel("details");
  };

  const chooseRelation = (id: string) => {
    setSelection({ type: "relation", id });
    setRightPanelOpen(true);
    if (isMobileViewport()) setActivePanel("details");
  };

  const chooseSuggestion = (id: string) => {
    const suggestion = data.guide.relationSuggestions.find((candidate) => candidate.id === id);
    if (!suggestion) return;
    focusMemoryRef.current = suggestion.fromMemoryId;
    setFocusMemoryId(suggestion.fromMemoryId);
    setSelection({ type: "suggestion", id });
    setRightPanelOpen(true);
    window.history.pushState(null, "", "#graph");
    setViewMode("immersive");
    setActivePanel(isMobileViewport() ? "details" : "graph");
  };

  useEffect(() => {
    if (!graphRoot.current) return;
    const cy = cytoscape({
      container: graphRoot.current,
      elements: [],
      style: graphStyle(isLightTheme()),
      minZoom: 0.28,
      maxZoom: 2.5,
      wheelSensitivity: 0.18,
      boxSelectionEnabled: false,
      autoungrabify: false,
      autolock: false,
    });
    const themeObserver = new MutationObserver(() => {
      cy.style(graphStyle(isLightTheme()));
    });
    cyRef.current = cy;
    const selectNode = (event: EventObject) => {
      const node = event.target;
      const nodeType = node.data("nodeType") as string;
      if (nodeType === "citation") {
        chooseCitation(node.data("memoryId") as string, Number(node.data("citationIndex")));
      } else {
        chooseMemory(node.id());
      }
    };
    const selectEdge = (event: EventObject) => {
      const relationId = event.target.data("relationId") as string | undefined;
      if (relationId) chooseRelation(relationId);
      const suggestionId = event.target.data("suggestionId") as string | undefined;
      if (suggestionId) chooseSuggestion(suggestionId);
    };
    const clearSelection = (event: EventObject) => {
      if (event.target === cy) {
        setSelection(null);
        setRightPanelOpen(false);
      }
    };
    const hoverEdge = (event: EventObject) => event.target.addClass("hovered");
    const leaveEdge = (event: EventObject) => event.target.removeClass("hovered");
    const hoverNode = (event: EventObject) => event.target.addClass("hovered");
    const leaveNode = (event: EventObject) => event.target.removeClass("hovered");
    const rememberPosition = (event: EventObject) => {
      positionsRef.current.set(event.target.id(), event.target.position());
    };
    cy.on("tap", "node", selectNode);
    cy.on("tap", "edge.relation", selectEdge);
    cy.on("tap", "edge.suggestion-edge", selectEdge);
    cy.on("tap", clearSelection);
    cy.on("mouseover", "edge", hoverEdge);
    cy.on("mouseout", "edge", leaveEdge);
    cy.on("mouseover", "node", hoverNode);
    cy.on("mouseout", "node", leaveNode);
    cy.on("dragfree", "node", rememberPosition);
    themeObserver.observe(document.documentElement, { attributeFilter: ["data-theme"] });
    const resize = () => cy.resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      themeObserver.disconnect();
      cy.destroy();
      cyRef.current = null;
    };
  }, [graphVisible]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    const previousZoom = cy.zoom();
    const previousPan = cy.pan();
    cy.nodes().forEach((node) => {
      positionsRef.current.set(node.id(), node.position());
    });
    cy.batch(() => {
      cy.elements().remove();
      cy.add(elements as cytoscape.ElementDefinition[]);
      cy.nodes().forEach((node) => {
        const previousPosition = positionsRef.current.get(node.id());
        if (previousPosition) {
          node.position(previousPosition);
          return;
        }
        if (node.data("nodeType") === "citation") {
          const parent = cy.getElementById(node.data("memoryId") as string);
          const index = Number(node.data("citationIndex"));
          const angle = -Math.PI / 2 + index * (Math.PI / 3);
          if (parent.nonempty()) {
            const origin = parent.position();
            node.position({ x: origin.x + Math.cos(angle) * 62, y: origin.y + Math.sin(angle) * 62 });
          }
        }
      });
    });
    if (!graphVisible) return;
    const shouldRelayout = !initialized.current || layoutModeRef.current !== viewMode;
    if (cy.nodes().length > 0 && shouldRelayout) {
      const layoutOptions = viewMode === "immersive"
        ? {
            name: "fcose",
            quality: "default",
            randomize: true,
            animate: !motionPaused,
            animationDuration: 700,
            fit: false,
            padding: 72,
            nodeRepulsion: 5200,
            idealEdgeLength: 170,
            edgeElasticity: 0.45,
            nestingFactor: 0.8,
            gravity: 0.22,
            numIter: 600,
          }
        : {
            name: "dagre",
            rankDir: "TB",
            rankSep: 82,
            nodeSep: 48,
            edgeSep: 24,
            animate: false,
            fit: false,
            padding: 42,
          };
      const layout = cy.layout(layoutOptions as cytoscape.LayoutOptions);
      layout.one("layoutstop", () => {
        cy.nodes().forEach((node) => {
          positionsRef.current.set(node.id(), node.position());
        });
        initialized.current = true;
        layoutModeRef.current = viewMode;
        cy.fit(undefined, 52);
      });
      layout.run();
    } else if (cy.nodes().length > 0) {
      cy.zoom(previousZoom);
      cy.pan(previousPan);
    } else {
      initialized.current = false;
      layoutModeRef.current = null;
    }
  }, [elements, viewMode, motionPaused]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || motionPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    let cursor = 0;
    let active = false;
    const timer = window.setInterval(() => {
      const nodes = cy.nodes(".memory");
      if (nodes.length === 0) return;
      nodes.removeClass("pulse");
      cy.edges(".relation").removeClass("flow");
      active = !active;
      if (!active) return;
      const selected = selection?.type === "memory" ? cy.getElementById(selection.id) : null;
      const target = selected?.nonempty() ? selected : nodes[ cursor % nodes.length ];
      target?.addClass("pulse");
      target?.connectedEdges(".relation").addClass("flow");
      cursor += 1;
    }, 1200);
    return () => window.clearInterval(timer);
  }, [motionPaused, selection]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.batch(() => {
      cy.elements().removeClass("selected neighbor distant");
      if (!selection) return;
      if (selection.type === "memory") {
        const selected = cy.getElementById(selection.id);
        if (selected.nonempty()) {
          selected.addClass("selected");
          const connectedEdges = selected.connectedEdges(".relation, .citation-edge");
          const neighborhood = selected.union(connectedEdges).union(connectedEdges.connectedNodes());
          neighborhood.addClass("neighbor");
          cy.elements().not(neighborhood).addClass("distant");
        }
      } else if (selection.type === "citation") {
        const selected = cy.getElementById(selection.id);
        const memory = cy.getElementById(selection.memoryId);
        selected.addClass("selected");
        selected.connectedEdges().addClass("neighbor");
        memory.addClass("neighbor");
        cy.elements().not(selected.union(memory).union(selected.connectedEdges())).addClass("distant");
      } else if (selection.type === "relation") {
        const edge = cy.getElementById(`relation:${selection.id}`);
        edge.addClass("selected");
        edge.connectedNodes().addClass("neighbor");
        cy.elements().not(edge.union(edge.connectedNodes())).addClass("distant");
      } else {
        const edge = cy.getElementById(`suggestion:${selection.id}`);
        edge.addClass("selected");
        edge.connectedNodes().addClass("neighbor");
        cy.elements().not(edge.union(edge.connectedNodes())).addClass("distant");
      }
    });
  }, [selection, elements]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    const matches = new Set(data.memories.filter((memory) => matchesMemory(memory, query)).map((memory) => memory.id));
    cy.batch(() => {
      cy.nodes(".memory").removeClass("search-hit search-dim");
      if (!query.trim()) return;
      cy.nodes(".memory").forEach((node) => {
        node.addClass(matches.has(node.id()) ? "search-hit" : "search-dim");
      });
    });
  }, [query, data.memories, elements]);

  useEffect(() => {
    if (!graphVisible || (isMobileViewport() && activePanel !== "graph")) return;
    const frame = window.requestAnimationFrame(() => {
      cyRef.current?.resize();
      if (!initialized.current && cyRef.current?.nodes().length) {
        const layout = cyRef.current.layout({ name: viewMode === "reading" ? "dagre" : "fcose", animate: false, fit: true, padding: 52 } as cytoscape.LayoutOptions);
        layout.one("layoutstop", () => {
          initialized.current = true;
          layoutModeRef.current = viewMode;
        });
        layout.run();
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activePanel, viewMode, graphVisible]);

  const focusGraphNode = (id: string) => {
    navigate("immersive", id);
    const cy = cyRef.current;
    const node = cy?.getElementById(id);
    if (node?.nonempty()) cy?.animate({ center: { eles: node }, duration: 260 });
  };

  const openLocalTrace = (id?: string) => {
    setShowSuggestions(false);
    setFilters((current) => ({ ...current, focusDepth: "all" }));
    if (id) {
      setGraphScope("event");
      chooseMemory(id);
    } else {
      setGraphScope("all");
    }
    navigate("immersive", id ?? null);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setQuery("");
    setSourcesExpanded(false);
  };

  const selectedMemory =
    selection?.type === "memory"
      ? data.memories.find((memory) => memory.id === selection.id)
      : selection?.type === "citation"
        ? data.memories.find((memory) => memory.id === selection.memoryId)
        : undefined;
  const selectedRelation =
    selection?.type === "relation"
      ? data.relations.find((relation) => relation.id === selection.id)
      : undefined;
  const selectedSuggestion =
    selection?.type === "suggestion"
      ? data.guide.relationSuggestions.find((suggestion) => suggestion.id === selection.id)
      : undefined;

  const openMemoryFromGuide = (id: string) => {
    navigate("event", id);
  };

  const openPath = useCallback((id: string) => navigate("path", id), [navigate]);
  const openEvent = useCallback((id: string) => navigate("event", id), [navigate]);

  const updateFilter = <Key extends keyof GraphFilters>(key: Key, value: GraphFilters[Key]) =>
    setFilters((current) => ({ ...current, [key]: value }));
  const activeMemoryId = focusMemoryId ?? latestTimelineMemoryId;

  useEffect(() => {
    const advancedMenu = advancedMenuRef.current;
    if (!advancedMenu) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (advancedMenu.open && !advancedMenu.contains(event.target as Node)) {
        advancedMenu.open = false;
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && advancedMenu.open) {
        advancedMenu.open = false;
        advancedMenu.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const closeAdvancedMenu = () => {
    if (advancedMenuRef.current) advancedMenuRef.current.open = false;
  };

  return (
    <div
      ref={appRoot}
      class={`app-shell mode-${viewMode} ${rightPanelOpen ? "inspector-open" : "inspector-closed"} ${topicsOpen ? "topics-open" : ""}`}
      data-mobile-panel={activePanel}
    >
      <header class="topbar">
        <div class="brand-block">
          <span class="brand-icon"><TaloMark size={23} title="Talo" /></span>
          <div>
            <h1>{data.projectName}</h1>
            <p>项目记忆 · 静态快照 {formatDate(data.generatedAt, locale)}</p>
          </div>
        </div>
        <div class="search-wrap">
          <Search size={17} />
          <input
            type="search"
            value={query}
            placeholder="搜索结论、证据或文件"
            aria-label="搜索项目记忆"
            onInput={(event) => setQuery(event.currentTarget.value)}
          />
          {query.trim() && (
            <div class="search-results" role="listbox" aria-label="搜索结果">
              {searchResults.length === 0 ? (
                <span class="search-empty">没有匹配的记忆</span>
              ) : (
                searchResults.map((memory) => (
                  <button key={memory.id} type="button" role="option" onClick={() => { setQuery(""); openEvent(memory.id); }}>
                    <span>{memory.topic ?? "未分组"}</span>
                    <strong>{memory.displayTitle}</strong>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <div class="snapshot-count">
          <strong>{data.memories.length}</strong><span>记忆</span>
          <strong>{data.relations.length}</strong><span>已审核关系</span>
        </div>
        <div class="top-actions">
          <a class="hub-link" href={data.hubUrl ?? "#"} title="返回全部项目记忆">
            <LayoutGrid size={16} />全部项目
          </a>
          <ReadingProgress
            viewMode={viewMode}
            hasFocus={Boolean(activeMemoryId)}
          />
          <details class="advanced-menu" ref={advancedMenuRef}>
            <summary>展示视图</summary>
            <div>
              <button class={viewMode === "guide" ? "active" : ""} type="button" onClick={() => { closeAdvancedMenu(); navigate("guide"); }}>时间轴</button>
              <button class={graphVisible || viewMode === "path" || viewMode === "event" ? "active" : ""} type="button" onClick={() => { closeAdvancedMenu(); setGraphScope("all"); navigate("immersive", activeMemoryId); }}>事件关系图</button>
              <button class={viewMode === "records" ? "active" : ""} type="button" onClick={() => { closeAdvancedMenu(); navigate("records"); }}>完整记录</button>
            </div>
          </details>
          {graphVisible && (
            <>
              <IconButton label={motionPaused ? "恢复动态" : "暂停动态"} visibleLabel={motionPaused ? "恢复动态" : "暂停动态"} onClick={() => setMotionPaused((current) => !current)} pressed={motionPaused}>
                {motionPaused ? <Play size={16} /> : <Pause size={16} />}
              </IconButton>
              <IconButton label={rightPanelOpen ? "收起详情面板" : "打开详情面板"} visibleLabel={rightPanelOpen ? "收起详情" : "详情面板"} onClick={() => setRightPanelOpen((current) => !current)} pressed={rightPanelOpen}>
                <PanelRight size={16} />
              </IconButton>
            </>
          )}
        </div>
      </header>

      <nav class="mobile-tabs" aria-label="移动端视图">
        <button class={viewMode === "guide" ? "active" : ""} type="button" onClick={() => navigate("guide")}>
          <Activity size={16} />时间轴
        </button>
        <button class={viewMode === "path" ? "active" : ""} type="button" disabled={!activeMemoryId} onClick={() => navigate("path", activeMemoryId)}>
          <Route size={16} />关系脉络
        </button>
        <button class={viewMode === "event" ? "active" : ""} type="button" disabled={!activeMemoryId} onClick={() => navigate("event", activeMemoryId)}>
          <Focus size={16} />事件详情
        </button>
      </nav>

      {viewMode === "guide" ? (
        <ProjectTimelineView data={data} onOpenPath={openPath} />
      ) : viewMode === "path" && activeMemoryId ? (
        <RelationPathView data={data} memoryId={activeMemoryId} onBack={() => navigate("guide")} onOpenEvent={openEvent} />
      ) : viewMode === "event" && activeMemoryId ? (
        <EventFocusView data={data} memoryId={activeMemoryId} onBack={() => navigate("path", activeMemoryId)} onOpenEvent={openEvent} />
      ) : viewMode === "records" ? (
        <RecordsView data={data} onOpenMemory={openMemoryFromGuide} />
      ) : (
      <main class="workspace">
        <aside class="topic-panel">
          <div class="panel-heading">
            <div><span class="eyebrow">浏览</span><h2>主题目录</h2></div>
            <SlidersHorizontal size={17} />
          </div>
          <button
            class={`topic-row ${filters.topic === "" ? "active" : ""}`}
            type="button"
            onClick={() => updateFilter("topic", "")}
          >
            <span>全部主题</span><strong>{data.memories.length}</strong>
          </button>
          <div class="topic-list">
            {topics.map(([topic, count]) => (
              <button
                class={`topic-row ${filters.topic === topic ? "active" : ""}`}
                type="button"
                key={topic}
                onClick={() => updateFilter("topic", topic)}
              >
                <span>{topic}</span>
                <span class="topic-count"><strong>{count.total}</strong>{count.stale > 0 && <em>{count.stale} 过期</em>}</span>
              </button>
            ))}
          </div>

          <div class="filter-stack">
            <label>记忆类型
              <select value={filters.kind} onChange={(event) => updateFilter("kind", event.currentTarget.value)}>
                <option value="">全部类型</option>
                {Object.entries(KIND_LABELS).map(([value, label]) => <option value={value}>{label}</option>)}
              </select>
            </label>
            <label>关系类型
              <select value={filters.relation} onChange={(event) => updateFilter("relation", event.currentTarget.value)}>
                <option value="">全部关系</option>
                {Object.entries(RELATION_META).map(([value, meta]) => <option value={value}>{meta.label}</option>)}
              </select>
            </label>
            <label>有效状态
              <select value={filters.stale} onChange={(event) => updateFilter("stale", event.currentTarget.value as GraphFilters["stale"])}>
                <option value="all">全部状态</option>
                <option value="active">仅有效</option>
                <option value="stale">仅过期</option>
              </select>
            </label>
          </div>

          <div class="memory-index-heading">
            <span>当前记忆</span><strong>{memories.length}/{data.memories.length}</strong>
          </div>
          <div class="memory-index">
            {memories.map((memory) => (
              <button
                type="button"
                key={memory.id}
                class={focusMemoryId === memory.id ? "active" : ""}
                onClick={() => focusGraphNode(memory.id)}
              >
                <span class={`memory-dot ${memory.stale ? "stale" : ""}`} />
                <span><strong>{memory.displayTitle}</strong><small>{memorySummary(memory)}</small></span>
              </button>
            ))}
          </div>
        </aside>

        <section class="graph-panel">
          <div class="graph-toolbar">
            <div class="graph-scope-control" role="group" aria-label="关系范围">
              {([
                ["work_unit", "当前工作单元"],
                ["event", "当前事件"],
                ["two_hops", "两层关系"],
                ["all", "全项目"],
              ] as const).map(([value, label]) => <button type="button" class={graphScope === value ? "active" : ""} aria-pressed={graphScope === value} onClick={() => setGraphScope(value)}>{label}</button>)}
            </div>
            <div class="toolbar-divider" />
            <IconButton label={topicsOpen ? "关闭主题导航" : "打开主题导航"} onClick={() => setTopicsOpen((current) => !current)} pressed={topicsOpen}><PanelLeft size={17} /></IconButton>
            <IconButton label={sourcesExpanded ? "关闭证据图层" : "打开证据图层"} onClick={() => setSourcesExpanded((current) => !current)} pressed={sourcesExpanded} disabled={!focusMemoryId}><Layers3 size={17} /></IconButton>
            <IconButton label={showSuggestions ? "隐藏关联线索" : "显示关联线索"} onClick={() => setShowSuggestions((current) => !current)} pressed={showSuggestions}><Route size={17} /></IconButton>
            <IconButton label="放大" onClick={() => cyRef.current?.zoom({ level: Math.min(2.5, (cyRef.current?.zoom() ?? 1) * 1.18), renderedPosition: { x: (graphRoot.current?.clientWidth ?? 0) / 2, y: (graphRoot.current?.clientHeight ?? 0) / 2 } })}><ZoomIn size={17} /></IconButton>
            <IconButton label="缩小" onClick={() => cyRef.current?.zoom({ level: Math.max(0.28, (cyRef.current?.zoom() ?? 1) / 1.18), renderedPosition: { x: (graphRoot.current?.clientWidth ?? 0) / 2, y: (graphRoot.current?.clientHeight ?? 0) / 2 } })}><ZoomOut size={17} /></IconButton>
            <IconButton label="适配全部" onClick={() => cyRef.current?.fit(undefined, 52)}><Maximize2 size={17} /></IconButton>
            <IconButton label="重新居中" onClick={() => {
              const cy = cyRef.current;
              const selectedId = selection?.type === "memory" ? selection.id : focusMemoryId;
              const node = selectedId ? cy?.getElementById(selectedId) : null;
              if (node?.nonempty()) cy?.animate({ center: { eles: node }, duration: 260 }); else cy?.center();
            }}><LocateFixed size={17} /></IconButton>
            <IconButton label="重新布局" onClick={() => {
              const cy = cyRef.current;
              if (!cy) return;
              initialized.current = false;
              const layout = cy.layout((viewMode === "immersive"
                ? { name: "fcose", quality: "default", randomize: true, animate: !motionPaused, animationDuration: 700, fit: false, padding: 72, nodeRepulsion: 5200, idealEdgeLength: 170, edgeElasticity: 0.45, gravity: 0.22, numIter: 600 }
                : { name: "dagre", rankDir: "TB", rankSep: 82, nodeSep: 48, edgeSep: 24, animate: false, fit: false, padding: 42 }) as unknown as cytoscape.LayoutOptions);
              layout.one("layoutstop", () => cy.fit(undefined, 72));
              layout.one("layoutstop", () => {
                cy.nodes().forEach((node) => {
                  positionsRef.current.set(node.id(), node.position());
                });
                initialized.current = true;
                layoutModeRef.current = viewMode === "reading" ? "reading" : "immersive";
              });
              layout.run();
            }}><Sparkles size={17} /></IconButton>
            <IconButton label="重置筛选" onClick={resetFilters}><RotateCcw size={17} /></IconButton>
          </div>
          <div class="graph-context" aria-label="当前图谱上下文">
            <span>范围</span><strong>{{ work_unit: "当前工作单元", event: "当前事件一层关系", two_hops: "两层关系", all: "全项目" }[graphScope]}</strong>
            <i />
            <span>模式</span><strong>{viewMode === "immersive" ? "沉浸网络" : "阅读布局"}</strong>
          </div>
          <div class="graph-stage" ref={graphRoot} role="img" aria-label={`${data.projectName} 记忆关系追溯图`} />
          {memories.length === 0 && (
            <div class="graph-empty"><FileSearch size={28} /><strong>没有符合筛选条件的记忆</strong><button type="button" onClick={resetFilters}>清除筛选</button></div>
          )}
          <div class="graph-status">
            <span><i class="status-dot active" />{memories.length} 条记忆</span>
            <span><i class="status-line" />{elements.filter((element) => element.group === "edges" && element.data.edgeType === "relation").length} 条已确认关系</span>
            <span><i class="status-line suggestion" />{showSuggestions ? data.guide.relationSuggestions.length : 0} 条线索</span>
            <span><Activity size={12} />{motionPaused ? "动态已暂停" : "网络运行中"}</span>
            {sourcesExpanded && <span><i class="status-line citation" />证据图层</span>}
          </div>
          <div class="relation-legend" aria-label="关系图例">
            {Object.entries(RELATION_META).map(([type, meta]) => (
              <span key={type}><i class={`legend-line relation-${type}`} />{meta.label}</span>
            ))}
            {showSuggestions && <span><i class="legend-line relation-suggestion" />待审核线索</span>}
          </div>
        </section>

        <aside class="detail-panel">
          <div class="panel-heading detail-panel-heading">
            <div><span class="eyebrow">阅读</span><h2>记忆详情</h2></div>
            {selection?.type === "memory" && <Focus size={17} />}
          </div>
          <div class="detail-scroll">
            {!selection && <EmptyDetail />}
            {selection?.type === "memory" && selectedMemory && (
              <MemoryDetail
                memory={selectedMemory}
                relations={data.relations}
                data={data}
                sourcesExpanded={sourcesExpanded && focusMemoryId === selectedMemory.id}
                onToggleSources={() => setSourcesExpanded((current) => !current)}
                onSelectMemory={focusGraphNode}
                onSelectCitation={chooseCitation}
                onSelectRelation={chooseRelation}
              />
            )}
            {selection?.type === "citation" && selectedMemory && (
              <CitationDetail memory={selectedMemory} citationIndex={selection.citationIndex} onBack={() => chooseMemory(selectedMemory.id)} />
            )}
            {selection?.type === "relation" && selectedRelation && (
              <RelationDetail relation={selectedRelation} data={data} onSelectMemory={focusGraphNode} />
            )}
            {selection?.type === "suggestion" && selectedSuggestion && (
              <SuggestionDetail suggestion={selectedSuggestion} data={data} onSelectMemory={focusGraphNode} />
            )}
          </div>
        </aside>
      </main>
      )}
    </div>
  );
}

const dataTemplate = document.getElementById("graph-data") as HTMLTemplateElement | null;
const root = document.getElementById("app");
if (dataTemplate && root) {
  const data = JSON.parse(dataTemplate.content.textContent ?? "{}") as GraphViewData;
  render(<GraphApp data={data} />, root);
}
