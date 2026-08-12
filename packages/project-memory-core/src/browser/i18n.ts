export type GraphLocale = "zh-CN" | "en-US";

const graphLabelEnglish: Record<string, string> = {
  "相关": "Related",
  "注意到": "Observes",
  "原因": "Causes",
  "依赖": "Depends on",
  "支持": "Supports",
  "矛盾": "Contradicts",
  "替代": "Supersedes",
  "来源于": "Derived from",
  "待审核": "Pending review",
  "证据": "Evidence",
  "报告": "Report",
  "流程": "Workflow",
  "参考": "Reference",
};

export function translateGraphLabel(value: string, locale: GraphLocale): string {
  if (locale === "zh-CN") return value;
  const [prefix, ...rest] = value.split(" · ");
  const translated = graphLabelEnglish[prefix ?? ""];
  return translated ? [translated, ...rest].join(" · ") : value;
}

type Replacement = readonly [string | RegExp, string | ((...matches: string[]) => string)];

const exactEnglish: Record<string, string> = {
  "适配器版本": "Adapter version",
  "全图": "Full graph",
  "一层": "1 hop",
  "两层": "2 hops",
  "关系范围": "Relation scope",
  "选择一条记忆": "Select a memory",
  "查看完整结论、来源与关系理由": "View the full conclusion, sources, and relation rationale",
  "未分组": "Ungrouped",
  "原始标题": "Original title",
  "置信度": "Confidence",
  "更新时间": "Updated",
  "提交者": "Submitted by",
  "状态": "Status",
  "有效": "Active",
  "已过期": "Stale",
  "来源发生变化": "Source changed",
  "完整结论": "Full conclusion",
  "这项工作怎么发生的": "How this work happened",
  "旧记录尚未补全这项信息。": "This legacy record does not include this information yet.",
  "发生时间": "Occurred at",
  "做了什么": "What was done",
  "为什么做": "Why it was done",
  "产出了什么": "Outcome",
  "现在意味着什么": "What it means now",
  "来源": "Sources",
  "收起图中来源": "Hide sources in graph",
  "在图中展开": "Show in graph",
  "无已记录来源": "No recorded sources",
  "查看这条记忆引用的本地文件": "Open the local file cited by this memory",
  "技术详情": "Technical details",
  "路径": "Path",
  "位置": "Location",
  "未记录": "Not recorded",
  "提交版本": "Commit",
  "非 Git 来源": "Non-Git source",
  "为什么与其他记忆有关": "Why it relates to other memories",
  "尚未记录与其他记忆的关系": "No relations to other memories are recorded yet",
  "查看另一条记忆": "View the other memory",
  "返回记忆": "Back to memory",
  "打开本地文件": "Open local file",
  "已审核关系": "Reviewed relation",
  "关联依据": "Relation rationale",
  "关系": "Relation",
  "待审核": "Pending review",
  "结构信号，不代表事实置信度": "Structural signal, not factual confidence",
  "关联线索": "Relation clue",
  "为什么出现": "Why it appeared",
  "匹配依据": "Matching evidence",
  "线索 ID": "Clue ID",
  "项目概况数据不可用，请重新生成这份静态快照。": "Project brief data is unavailable. Regenerate this static snapshot.",
  "项目记忆首页": "Project memory home",
  "先看项目现状，再决定要追查什么": "Understand the project state before tracing details",
  "查看关系追溯": "Open relation trace",
  "静态快照": "Static snapshot",
  "当前结论": "Current conclusions",
  "已完成工作": "Completed work",
  "风险边界": "Risk boundaries",
  "已确认下一步": "Confirmed next steps",
  "现在可以直接依赖的判断": "Conclusions you can rely on now",
  "已经做过且值得复用的内容": "Completed work worth reusing",
  "继续使用前需要注意什么": "What to check before continuing",
  "下一步": "Next steps",
  "已确认动作与系统建议严格分开": "Confirmed actions are separated from system suggestions",
  "系统建议 · 未经审核": "System suggestion · Unreviewed",
  "推荐先读": "Recommended reading",
  "项目脉络": "Project timeline",
  "从时间线看懂项目怎么走到今天": "See how the project reached its current state",
  "查看完整记录": "View all records",
  "核对前因后果": "Review cause and effect",
  "现在最需要知道什么": "What matters now",
  "已确认判断": "Confirmed conclusions",
  "已完成": "Completed",
  "需要注意": "Needs attention",
  "行动方向": "Direction",
  "暂无可展示的项目事件。": "No project events to display.",
  "返回项目脉络": "Back to project timeline",
  "第二层 · 关系脉络": "Layer 2 · Relation trace",
  "查看这一步": "View this step",
  "返回关系脉络": "Back to relation trace",
  "第三层 · 事件前因后果": "Layer 3 · Event cause and effect",
  "事件直接前因和后果": "Direct causes and effects",
  "直接前因": "Direct causes",
  "直接后果": "Direct effects",
  "尚未保存正式前因。": "No formal cause has been saved.",
  "尚未保存正式后果。": "No formal effect has been saved.",
  "完整过程": "Full process",
  "为什么做、做了什么、最终意味着什么": "Why it happened, what changed, and what it means",
  "依据与数据": "Evidence and data",
  "尚未记录可追溯来源": "No traceable source recorded",
  "得到的结论": "Conclusion",
  "来源与证据": "Sources and evidence",
  "尚未记录来源。": "No source recorded.",
  "需要复核": "Needs review",
  "相关事件": "Related events",
  "暂无正式相关事件。": "No formal related events.",
  "冲突信息": "Conflicting information",
  "暂无正式冲突信息。": "No formal conflicts.",
  "可能关联": "Possible relations",
  "暂无待审核线索。": "No pending clues.",
  "项目记忆": "Project memory",
  "搜索结论、证据或文件": "Search conclusions, evidence, or files",
  "搜索项目记忆": "Search project memory",
  "搜索结果": "Search results",
  "没有匹配的记忆": "No matching memories",
  "记忆": "Memories",
  "时间轴": "Timeline",
  "关系脉络": "Relation trace",
  "事件详情": "Event details",
  "浏览": "Browse",
  "主题目录": "Topic directory",
  "全部主题": "All topics",
  "过期": "stale",
  "记忆类型": "Memory type",
  "全部类型": "All types",
  "关系类型": "Relation type",
  "全部关系": "All relations",
  "有效状态": "Validity",
  "全部状态": "All states",
  "仅有效": "Active only",
  "仅过期": "Stale only",
  "当前记忆": "Visible memories",
  "当前工作单元": "Current work unit",
  "当前事件": "Current event",
  "两层关系": "Two-hop relations",
  "全项目": "Full project",
  "关闭主题导航": "Close topic navigation",
  "打开主题导航": "Open topic navigation",
  "关闭证据图层": "Hide evidence layer",
  "打开证据图层": "Show evidence layer",
  "隐藏关联线索": "Hide relation clues",
  "显示关联线索": "Show relation clues",
  "放大": "Zoom in",
  "缩小": "Zoom out",
  "适配全部": "Fit all",
  "重新居中": "Recenter",
  "重新布局": "Relayout",
  "重置筛选": "Reset filters",
  "当前图谱上下文": "Current graph context",
  "范围": "Scope",
  "模式": "Mode",
  "沉浸网络": "Immersive network",
  "阅读布局": "Reading layout",
  "没有符合筛选条件的记忆": "No memories match the filters",
  "清除筛选": "Clear filters",
  "动态已暂停": "Motion paused",
  "网络运行中": "Network active",
  "证据图层": "Evidence layer",
  "关系图例": "Relation legend",
  "待审核线索": "Pending clues",
  "阅读": "Read",
  "记忆详情": "Memory details",
  "恢复动态": "Resume motion",
  "暂停动态": "Pause motion",
  "收起详情面板": "Close details panel",
  "打开详情面板": "Open details panel",
  "收起详情": "Close details",
  "详情面板": "Details panel",
  "移动端视图": "Mobile views",
};

const patterns: Replacement[] = [
  [/^适配器版本 (.+)$/u, (_value, version) => `Adapter version ${version}`],
  [/^原始标题 · (.+)$/u, (_value, title) => `Original title · ${title}`],
  [/^已过期 · (.+)$/u, (_value, reason) => `Stale · ${reason}`],
  [/^第 (\d+) 步$/u, (_value, step) => `Step ${step}`],
  [/^(\d+) 条记忆$/u, (_value, count) => `${count} memories`],
  [/^(\d+) 条已确认关系$/u, (_value, count) => `${count} confirmed relations`],
  [/^(\d+) 条线索$/u, (_value, count) => `${count} clues`],
  [/^(\d+) 当前结论$/u, (_value, count) => `${count} current conclusions`],
  [/^(\d+) 已完成工作$/u, (_value, count) => `${count} completed items`],
  [/^(\d+) 风险边界$/u, (_value, count) => `${count} risk boundaries`],
  [/^(\d+) 已确认下一步$/u, (_value, count) => `${count} confirmed next steps`],
  [/^查看关系脉络：(.+)$/u, (_value, title) => `View relation trace: ${title}`],
  [/^(.+) 记忆关系追溯图$/u, (_value, project) => `${project} memory relation graph`],
];

function translatedText(value: string): string {
  const trimmed = value.trim();
  const exact = exactEnglish[trimmed];
  if (exact) return value.replace(trimmed, exact);
  for (const [pattern, replacement] of patterns) {
    if (typeof pattern === "string") continue;
    if (!pattern.test(trimmed)) continue;
    pattern.lastIndex = 0;
    const translated = typeof replacement === "string"
      ? trimmed.replace(pattern, replacement)
      : trimmed.replace(pattern, (...args) => replacement(...args.slice(0, -2)));
    return value.replace(trimmed, translated);
  }
  return value;
}

function localizeElement(element: Element): void {
  for (const attribute of ["aria-label", "title", "placeholder"]) {
    const value = element.getAttribute(attribute);
    if (value) {
      const translated = translatedText(value);
      if (translated !== value) element.setAttribute(attribute, translated);
    }
  }
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent) {
      const translated = translatedText(node.textContent);
      if (translated !== node.textContent) node.textContent = translated;
    }
  }
}

export function localizeGraph(root: HTMLElement, locale: GraphLocale): () => void {
  root.lang = locale;
  if (locale === "zh-CN") return () => undefined;
  const apply = (target: Node) => {
    if (target instanceof Element) {
      localizeElement(target);
      for (const element of target.querySelectorAll("*")) localizeElement(element);
    } else if (target.nodeType === Node.TEXT_NODE && target.textContent) {
      const translated = translatedText(target.textContent);
      if (translated !== target.textContent) target.textContent = translated;
    }
  };
  apply(root);
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "characterData") apply(mutation.target);
      for (const node of mutation.addedNodes) apply(node);
    }
  });
  observer.observe(root, { subtree: true, childList: true, characterData: true });
  return () => observer.disconnect();
}
