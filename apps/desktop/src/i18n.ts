import { useEffect, useMemo, useState } from "preact/hooks";

export type LanguagePreference = "system" | "zh-CN" | "en-US";
export type ResolvedLanguage = "zh-CN" | "en-US";
export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const LANGUAGE_STORAGE_KEY = "project-memory:language";
export const THEME_STORAGE_KEY = "project-memory:theme";

const zhCN = {
  "nav.memory": "记忆中心",
  "nav.reviews": "待审核",
  "nav.settings": "设置",
  "nav.localPrivate": "本地存储 · 无遥测",
  "brand.tagline": "Never start over.",
  "settings.title": "设置",
  "settings.subtitle": "调整语言、外观和本机 Agent 集成。",
  "settings.updates": "应用更新",
  "settings.updatesDescription": "检查 Talo 桌面应用的新版本，并下载对应平台的安装包。",
  "settings.language": "语言",
  "settings.languageDescription": "选择桌面应用的显示语言。",
  "settings.language.system": "跟随系统",
  "settings.language.zhCN": "简体中文",
  "settings.language.enUS": "English",
  "settings.theme": "外观",
  "settings.themeDescription": "选择浅色、深色或跟随系统。",
  "settings.theme.system": "跟随系统",
  "settings.theme.light": "浅色",
  "settings.theme.dark": "深色",
  "settings.integrations": "平台集成",
  "settings.integrationDescription": "自动检测本机平台，并使用应用内置的同版本组件完成安装。",
  "settings.scan": "重新扫描",
  "settings.scanning": "扫描中…",
  "settings.firstSetup": "首次设置",
  "settings.manageIntegrations": "管理 AI 平台集成",
  "settings.rememberProject": "让 AI 记住项目脉络",
  "settings.skip": "暂时跳过",
  "settings.enterHub": "进入记忆中心",
  "common.copy": "复制",
  "common.cancel": "取消",
  "common.confirm": "确认",
  "common.refresh": "刷新",
  "common.loading": "加载中…",
  "common.noData": "暂无数据",
  "common.back": "返回",
  "common.close": "关闭",
  "common.done": "完成",
  "common.install": "安装",
  "common.update": "更新",
  "common.migrate": "迁移到桌面版",
  "common.confirmMigration": "确认迁移",
  "common.remove": "卸载",
  "common.repairPermissions": "修复权限",
  "common.download": "获取 {name}",
  "update.title": "发现 Talo 新版本",
  "update.available": "当前版本 {current}，可升级到 {version}。",
  "update.current": "当前已是最新版本 {version}。",
  "update.check": "检查更新",
  "update.checking": "检查中…",
  "update.download": "下载并打开安装包",
  "update.downloading": "下载中…",
  "update.opened": "安装包已打开，请完成安装；重新启动 Talo 后会同步已托管的平台集成。",
  "update.notes": "更新说明",
  "update.failed": "更新检查或下载失败：{error}",
  "integration.notInstalled": "未安装",
  "integration.installed": "已安装",
  "integration.outdated": "可更新",
  "integration.partial": "安装不完整",
  "integration.conflict": "需要处理",
  "integration.external": "其他来源",
  "integration.detected": "已检测到应用",
  "integration.configOnly": "只检测到配置目录",
  "integration.notDetected": "未检测到应用",
  "integration.application": "应用",
  "integration.noExecutable": "未找到可执行文件",
  "integration.version": "集成版本",
  "integration.scanComplete": "扫描完成",
  "integration.installComplete": "安装完成：请重启 {name} 后使用。",
  "integration.codexInstallComplete": "{action}完成：数据目录权限已自动配置，请新建 Codex 任务后使用。",
  "integration.uninstallComplete": "卸载完成",
  "integration.permissionFixed": "权限已修复，请新建 Codex 任务使配置生效。",
  "integration.confirmMigrationNote": "请确认迁移：旧插件将被移除，并安装桌面版内置版本。",
  "integration.confirmUninstall": "确定卸载 {name} 中的 Talo 集成吗？",
  "hub.eyebrow": "本地 · 私有 · 跨 Agent",
  "hub.title": "项目记忆中心",
  "hub.subtitle": "从最近发生的工作开始，快速看清结论、风险和下一步。",
  "hub.projects": "项目",
  "hub.memories": "正式记忆",
  "hub.pending": "待审核",
  "hub.attention": "需要关注",
  "hub.reviewHint": "点击进入审核中心",
  "hub.directory": "项目目录",
  "hub.directoryTitle": "统一管理项目记忆",
  "hub.directoryNote": "相同路径只显示一次，平台来源合并展示",
  "hub.searchPlaceholder": "搜索名称、路径、平台或记忆摘要",
  "hub.status": "状态",
  "hub.platform": "平台",
  "hub.all": "全部",
  "hub.registered": "已注册",
  "hub.unregistered": "待注册",
  "hub.noPlatform": "无平台来源",
  "hub.memoriesCount": "{count} 条记忆",
  "hub.latestActivity": "最近活动",
  "hub.viewMemory": "查看记忆",
  "hub.register": "一键注册",
  "hub.registeredNotice": "{name} 已注册，已移至已注册项目。",
  "hub.registeredDescription": "已有项目记忆",
  "hub.unregisteredDescription": "尚未注册到记忆库，可一键加入",
  "hub.noMatch": "没有匹配的项目",
  "hub.noRegistered": "还没有已注册项目",
  "hub.noUnregistered": "没有待注册项目",
  "hub.noProjects": "暂未发现项目",
  "hub.loading": "正在加载本地记忆…",
  "project.back": "返回记忆中心",
  "project.loading": "正在读取项目记忆…",
  "review.title": "审核中心",
  "review.subtitle": "审核 AI 提议的记忆和关系，确认后才会写入正式知识图谱。",
  "review.refresh": "刷新待审核内容",
  "review.loading": "正在读取待审核内容…",
  "review.empty": "当前没有待审核内容",
  "review.accept": "接受选中 {count} 项",
  "review.rejectAll": "拒绝整条",
  "review.selected": "已选择 {selected} / {total}",
  "review.unselectedNote": "未选择的候选项会在提交时由 CLI 拒绝",
  "review.memoryCandidates": "记忆候选",
  "review.updateCandidates": "记忆更新",
  "review.relations": "关系建议",
  "review.confidence": "置信度",
  "review.narrative": "叙事",
  "review.citations": "引用",
  "review.sourceConfirm": "来源确认 · CLI 处理",
  "review.secondConfirm": "二次确认 · CLI 处理",
  "review.confirmAccept": "确认接受选中内容？",
  "review.confirmRefresh": "确认按当前文件继续？",
  "review.confirmReject": "确认拒绝整条提案？",
  "review.acceptDescription": "将接受 {count} 项候选内容，并通过内置 Talo CLI 写入正式记忆。",
  "review.refreshDescription": "提案引用的文件 {path} 在提案生成后发生了变化。确认后，CLI 会更新这条提案的来源指纹，并继续接受当前选中的内容。",
  "review.rejectDescription": "“{project}”中的所有候选内容都会被 CLI 标记为拒绝。",
  "review.rejectedWarning": "未选择的 {count} 项会被自动拒绝，之后不能在这条提案中再次接受。",
  "review.refreshWarning": "这不会重新生成或修改 AI 提议的记忆内容，只表示你确认这些内容仍适用于当前文件。",
  "review.rejectWarning": "此操作不会写入任何候选记忆，并会结束这条提案的审核。",
  "review.processing": "CLI 处理中…",
  "review.updateSourceAccept": "更新来源并接受",
  "review.confirmRejectButton": "确认拒绝整条",
  "review.originalTitle": "原始标题 · {title}",
  "review.existingMemory": "已有记忆",
  "review.updateTitle": "更新：{title}",
  "review.update": "更新",
  "review.memoryId": "记忆 ID · {id}",
  "review.from": "起点 · {id}",
  "review.to": "终点 · {id}",
  "review.relationType": "关系 · {type}",
  "review.legacy": "历史提案",
  "review.proposalSummary": "{count} 个候选项",
  "review.addedCount": "{count} 新增",
  "review.updatedCount": "{count} 更新",
  "review.relationCount": "{count} 关系",
  "review.error.duplicate": "这条提案中的内容已经存在，未重复写入。提案仍保留，请取消重复项后再接受其他内容。",
  "review.error.revision": "记忆库中与这条提案相关的内容刚刚发生变化，系统没有强行覆盖。请刷新后确认受影响的项目。",
  "review.error.stalePath": "提案引用的文件“{path}”在审核后发生了变化，不能直接写入。请让 AI 基于最新文件重新生成提案。",
  "review.error.stale": "提案引用的源文件已经变化，不能直接写入。请让 AI 基于最新文件重新生成提案。",
  "review.error.processed": "这条提案已经被其他操作处理，请刷新待审核列表。",
  "review.error.invalid": "审核参数无效，请重新选择要接受的内容。",
  "error.copy": "复制",
  "notice.understood": "知道了",
} as const;

const enUS = {
  "nav.memory": "Memory Hub",
  "nav.reviews": "Review",
  "nav.settings": "Settings",
  "nav.localPrivate": "Local storage · No telemetry",
  "brand.tagline": "Never start over.",
  "settings.title": "Settings",
  "settings.subtitle": "Adjust language, appearance, and local Agent integrations.",
  "settings.updates": "App updates",
  "settings.updatesDescription": "Check for new Talo desktop versions and download the installer for this platform.",
  "settings.language": "Language",
  "settings.languageDescription": "Choose the display language for the desktop app.",
  "settings.language.system": "System",
  "settings.language.zhCN": "简体中文",
  "settings.language.enUS": "English",
  "settings.theme": "Appearance",
  "settings.themeDescription": "Choose light, dark, or follow the system.",
  "settings.theme.system": "System",
  "settings.theme.light": "Light",
  "settings.theme.dark": "Dark",
  "settings.integrations": "Platform integrations",
  "settings.integrationDescription": "Detect local platforms and install the bundled matching integration.",
  "settings.scan": "Scan again",
  "settings.scanning": "Scanning…",
  "settings.firstSetup": "First setup",
  "settings.manageIntegrations": "Manage AI platform integrations",
  "settings.rememberProject": "Help AI remember project context",
  "settings.skip": "Skip for now",
  "settings.enterHub": "Open Memory Hub",
  "common.copy": "Copy",
  "common.cancel": "Cancel",
  "common.confirm": "Confirm",
  "common.refresh": "Refresh",
  "common.loading": "Loading…",
  "common.noData": "No data",
  "common.back": "Back",
  "common.close": "Close",
  "common.done": "Done",
  "common.install": "Install",
  "common.update": "Update",
  "common.migrate": "Migrate to desktop",
  "common.confirmMigration": "Confirm migration",
  "common.remove": "Uninstall",
  "common.repairPermissions": "Repair permissions",
  "common.download": "Get {name}",
  "update.title": "A new Talo version is available",
  "update.available": "You are on {current}; version {version} is ready.",
  "update.current": "You are up to date on version {version}.",
  "update.check": "Check for updates",
  "update.checking": "Checking…",
  "update.download": "Download and open installer",
  "update.downloading": "Downloading…",
  "update.opened": "The installer is open. Finish the installation; managed platform integrations will sync when Talo restarts.",
  "update.notes": "Release notes",
  "update.failed": "Update check or download failed: {error}",
  "integration.notInstalled": "Not installed",
  "integration.installed": "Installed",
  "integration.outdated": "Update available",
  "integration.partial": "Incomplete",
  "integration.conflict": "Needs attention",
  "integration.external": "External",
  "integration.detected": "Application detected",
  "integration.configOnly": "Configuration directory only",
  "integration.notDetected": "Application not detected",
  "integration.application": "Application",
  "integration.noExecutable": "Executable not found",
  "integration.version": "Integration version",
  "integration.scanComplete": "Scan complete",
  "integration.installComplete": "Installation complete. Restart {name} to use it.",
  "integration.codexInstallComplete": "{action} complete. Data directory permissions were configured automatically; create a new Codex task to use it.",
  "integration.uninstallComplete": "Uninstallation complete",
  "integration.permissionFixed": "Permissions repaired. Create a new Codex task for the configuration to take effect.",
  "integration.confirmMigrationNote": "Confirm migration: the old plugin will be removed and the bundled desktop version installed.",
  "integration.confirmUninstall": "Uninstall the Talo integration from {name}?",
  "hub.eyebrow": "Local · Private · Cross-agent",
  "hub.title": "Project Memory Hub",
  "hub.subtitle": "Start with recent work to see conclusions, risks, and next steps.",
  "hub.projects": "Projects",
  "hub.memories": "Formal memories",
  "hub.pending": "Pending review",
  "hub.attention": "Needs attention",
  "hub.reviewHint": "Open review center",
  "hub.directory": "Project directory",
  "hub.directoryTitle": "Manage project memory in one place",
  "hub.directoryNote": "Duplicate paths appear once with platform sources combined",
  "hub.searchPlaceholder": "Search names, paths, platforms, or memory summaries",
  "hub.status": "Status",
  "hub.platform": "Platform",
  "hub.all": "All",
  "hub.registered": "Registered",
  "hub.unregistered": "Needs registration",
  "hub.noPlatform": "No platform source",
  "hub.memoriesCount": "{count} memories",
  "hub.latestActivity": "Latest activity",
  "hub.viewMemory": "View memory",
  "hub.register": "Register",
  "hub.registeredNotice": "{name} was registered and moved to registered projects.",
  "hub.registeredDescription": "Project memory is available",
  "hub.unregisteredDescription": "Not registered in memory yet; add it with one click",
  "hub.noMatch": "No matching projects",
  "hub.noRegistered": "No registered projects yet",
  "hub.noUnregistered": "No projects need registration",
  "hub.noProjects": "No projects discovered",
  "hub.loading": "Loading local memory…",
  "project.back": "Back to Memory Hub",
  "project.loading": "Reading project memory…",
  "review.title": "Review center",
  "review.subtitle": "Review AI-proposed memories and relations before they enter the formal knowledge graph.",
  "review.refresh": "Refresh pending items",
  "review.loading": "Reading pending items…",
  "review.empty": "There is nothing waiting for review",
  "review.accept": "Accept {count} selected",
  "review.rejectAll": "Reject all",
  "review.selected": "{selected} / {total} selected",
  "review.unselectedNote": "Unselected candidates will be rejected by the CLI when submitted",
  "review.memoryCandidates": "Memory candidates",
  "review.updateCandidates": "Memory updates",
  "review.relations": "Relation suggestions",
  "review.confidence": "Confidence",
  "review.narrative": "Narrative",
  "review.citations": "Citations",
  "review.sourceConfirm": "Source confirmation · CLI",
  "review.secondConfirm": "Second confirmation · CLI",
  "review.confirmAccept": "Accept the selected content?",
  "review.confirmRefresh": "Continue with the current file?",
  "review.confirmReject": "Reject the entire proposal?",
  "review.acceptDescription": "Accept {count} candidate items and write them to formal memory through the bundled Talo CLI.",
  "review.refreshDescription": "The referenced file {path} changed after this proposal was created. The CLI will refresh the source fingerprint and accept the selected content.",
  "review.rejectDescription": "All candidates in “{project}” will be marked rejected by the CLI.",
  "review.rejectedWarning": "The {count} unselected items will be rejected automatically and cannot be accepted later in this proposal.",
  "review.refreshWarning": "This does not regenerate or modify the AI-proposed memory. It confirms that the content still applies to the current file.",
  "review.rejectWarning": "No candidate memory will be written; this proposal review will end.",
  "review.processing": "CLI processing…",
  "review.updateSourceAccept": "Refresh source and accept",
  "review.confirmRejectButton": "Confirm rejection",
  "review.originalTitle": "Original title · {title}",
  "review.existingMemory": "Existing memory",
  "review.updateTitle": "Update: {title}",
  "review.update": "Update",
  "review.memoryId": "Memory ID · {id}",
  "review.from": "From · {id}",
  "review.to": "To · {id}",
  "review.relationType": "Relation · {type}",
  "review.legacy": "Legacy proposal",
  "review.proposalSummary": "{count} candidates",
  "review.addedCount": "{count} added",
  "review.updatedCount": "{count} updates",
  "review.relationCount": "{count} relations",
  "review.error.duplicate": "This content already exists and was not written again. The proposal remains pending; deselect duplicates before accepting other items.",
  "review.error.revision": "Related memory changed recently, so Talo did not overwrite it. Refresh and review the affected project.",
  "review.error.stalePath": "The referenced file “{path}” changed after review and cannot be written directly. Ask AI to regenerate the proposal from the latest file.",
  "review.error.stale": "A referenced source file changed and cannot be written directly. Ask AI to regenerate the proposal from the latest file.",
  "review.error.processed": "This proposal was already handled elsewhere. Refresh the pending list.",
  "review.error.invalid": "The review selection is invalid. Select the content again.",
  "error.copy": "Copy",
  "notice.understood": "Got it",
} as const satisfies Record<keyof typeof zhCN, string>;

export type TranslationKey = keyof typeof zhCN;
export type Translate = (key: TranslationKey, variables?: Record<string, string | number>) => string;

export function normalizeLanguagePreference(value: string | null | undefined): LanguagePreference {
  return value === "zh-CN" || value === "en-US" || value === "system" ? value : "system";
}

export function normalizeThemePreference(value: string | null | undefined): ThemePreference {
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}

export function resolveLanguage(preference: LanguagePreference, languages: readonly string[] = getSystemLanguages()): ResolvedLanguage {
  if (preference === "zh-CN") return "zh-CN";
  if (preference === "en-US") return "en-US";
  return languages.some((language) => language.toLowerCase().startsWith("zh")) ? "zh-CN" : "en-US";
}

export function resolveTheme(preference: ThemePreference, prefersDark = prefersDarkTheme()): ResolvedTheme {
  if (preference === "light" || preference === "dark") return preference;
  return prefersDark ? "dark" : "light";
}

export function getSystemLanguages(): readonly string[] {
  return typeof navigator === "undefined" ? ["zh-CN"] : navigator.languages?.length ? navigator.languages : [navigator.language];
}

export function prefersDarkTheme(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches === true;
}

export function translate(language: ResolvedLanguage, key: TranslationKey, variables?: Record<string, string | number>): string {
  const value = (language === "en-US" ? enUS : zhCN)[key] ?? zhCN[key] ?? key;
  return variables ? value.replace(/\{(\w+)\}/gu, (_, name: string) => String(variables[name] ?? `{${name}}`)) : value;
}

export function usePreferences() {
  const [languagePreference, setLanguagePreferenceState] = useState<LanguagePreference>(() => normalizeLanguagePreference(localStorage.getItem(LANGUAGE_STORAGE_KEY)));
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(() => normalizeThemePreference(localStorage.getItem(THEME_STORAGE_KEY)));
  const [systemLanguages, setSystemLanguages] = useState<readonly string[]>(getSystemLanguages);
  const [systemDark, setSystemDark] = useState(prefersDarkTheme);
  const language = resolveLanguage(languagePreference, systemLanguages);
  const theme = resolveTheme(themePreference, systemDark);
  document.documentElement.lang = language;

  const setLanguagePreference = (value: LanguagePreference) => {
    setLanguagePreferenceState(value);
    if (value === "system") localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    else localStorage.setItem(LANGUAGE_STORAGE_KEY, value);
  };
  const setThemePreference = (value: ThemePreference) => {
    setThemePreferenceState(value);
    if (value === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, value);
  };

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onThemeChange = () => setSystemDark(media.matches);
    const onLanguageChange = () => setSystemLanguages(getSystemLanguages());
    media.addEventListener?.("change", onThemeChange);
    window.addEventListener("languagechange", onLanguageChange);
    return () => {
      media.removeEventListener?.("change", onThemeChange);
      window.removeEventListener("languagechange", onLanguageChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const t = useMemo(() => (key: TranslationKey, variables?: Record<string, string | number>) => translate(language, key, variables), [language]);
  return { languagePreference, language, setLanguagePreference, themePreference, theme, setThemePreference, t };
}
