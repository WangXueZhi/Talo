import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Download,
  ExternalLink,
  Home,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  Trash2,
} from "lucide-preact";
import { Fragment, render } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import { GraphApp } from "../../../packages/project-memory-core/src/browser/main.tsx";
import { TaloMark } from "../../../packages/project-memory-core/src/browser/talo-mark.tsx";
import {
  getCachedHub,
  checkForUpdate as checkForUpdateApi,
  downloadUpdate,
  getAppVersion,
  getProjectView,
  installIntegration,
  openDownloadPage,
  openUpdateInstaller,
  registerPlatformProject as registerPlatformProjectApi,
  refreshHub,
  repairIntegration,
  removeIntegration,
  scanIntegrations,
} from "./api";
import type {
  AgentPlatform,
  DesktopAppUpdate,
  DesktopIntegrationStatus,
  GraphViewData,
  MemoryHub,
} from "./types";
import {
  buildProjectDirectoryItems,
  filterProjectDirectoryItems,
  getProjectDirectoryCounts,
  getProjectDirectoryPlatformCounts,
  type ProjectDirectoryFilter,
  type ProjectDirectoryPlatformFilter,
  type ProjectDirectoryItem,
} from "./project-directory";
import { ReviewView } from "./review-view";
import {
  usePreferences,
  type LanguagePreference,
  type ThemePreference,
} from "./i18n";
import "../../../packages/project-memory-core/src/browser/styles.css";
import "./styles.css";

type Route = { name: "hub" } | { name: "reviews" } | { name: "integrations" } | { name: "project"; projectId: string };

const onboardingKey = "project-memory:onboarding-complete";

function message(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return JSON.stringify(error);
}

function StateBadge({ status, t }: { status: DesktopIntegrationStatus; t: ReturnType<typeof usePreferences>["t"] }) {
  const labels: Record<DesktopIntegrationStatus["integrationState"], string> = {
    absent: t("integration.notInstalled"),
    installed: t("integration.installed"),
    outdated: t("integration.outdated"),
    partial: t("integration.partial"),
    conflict: t("integration.conflict"),
    external: t("integration.external"),
  };
  return <span class={`state-badge state-${status.integrationState}`}>{labels[status.integrationState]}</span>;
}

function IntegrationCard({
  status,
  busy,
  migrationPending,
  onInstall,
  onCancelMigration,
  onRepair,
  onRemove,
  onDownload,
  t,
}: {
  status: DesktopIntegrationStatus;
  busy: boolean;
  migrationPending: boolean;
  onInstall: (migrate: boolean) => void;
  onCancelMigration: () => void;
  onRepair: () => void;
  onRemove: () => void;
  onDownload: () => void;
  t: ReturnType<typeof usePreferences>["t"];
}) {
  const detected = status.productState === "found";
  const primary = status.integrationState === "outdated" ? t("common.update") : status.integrationState === "external" ? t("common.migrate") : t("common.install");
  const canInstall = detected && ["absent", "outdated", "external"].includes(status.integrationState);
  return (
    <article class="integration-card">
      <div class="integration-card-head">
        <div class="platform-icon"><Bot size={23} /></div>
        <div><h3>{status.displayName}</h3><p>{detected ? status.productVersion ?? t("integration.detected") : status.productState === "config_only" ? t("integration.configOnly") : t("integration.notDetected")}</p></div>
        <StateBadge status={status} t={t} />
      </div>
      <dl class="integration-facts">
        <div><dt>{t("integration.application")}</dt><dd>{status.executablePath ?? t("integration.noExecutable")}</dd></div>
        <div><dt>{t("integration.version")}</dt><dd>{status.installedVersion ?? "—"} / {status.currentVersion}</dd></div>
      </dl>
      {status.issues.length > 0 && <div class="issue-box"><ShieldAlert size={17} /><span>{status.issues.join("；")}</span></div>}
      {status.integrationState === "installed" && <div class="success-note"><CheckCircle2 size={16} />{status.successMessage}</div>}
      <div class="integration-actions">
        {status.platform === "codex" && status.actions.includes("repair") && <button class="primary-button" disabled={busy} onClick={onRepair}>
          {busy ? <LoaderCircle class="spin" size={16} /> : <ShieldAlert size={16} />}{t("common.repairPermissions")}
        </button>}
        {canInstall && !migrationPending && <button class="primary-button" disabled={busy} onClick={() => onInstall(status.integrationState === "external")}>
          {busy ? <LoaderCircle class="spin" size={16} /> : status.integrationState === "outdated" ? <RefreshCw size={16} /> : <Download size={16} />}{primary}
        </button>}
        {migrationPending && <>
          <button class="primary-button" disabled={busy} onClick={() => onInstall(true)}>
            {busy ? <LoaderCircle class="spin" size={16} /> : <CheckCircle2 size={16} />}{t("common.confirmMigration")}
          </button>
          <button class="secondary-button" disabled={busy} onClick={onCancelMigration}>{t("common.cancel")}</button>
        </>}
        {status.integrationState === "installed" || status.integrationState === "outdated" ? <button class="danger-button" disabled={busy} onClick={onRemove}><Trash2 size={16} />{t("common.remove")}</button> : null}
        {!detected && <button class="secondary-button" onClick={onDownload}><ExternalLink size={16} />{t("common.download", { name: status.displayName })}</button>}
      </div>
    </article>
  );
}

function IntegrationsView({ onboarding, onDone, t }: { onboarding: boolean; onDone: () => void; t: ReturnType<typeof usePreferences>["t"] }) {
  const [statuses, setStatuses] = useState<DesktopIntegrationStatus[]>([]);
  const [busy, setBusy] = useState<AgentPlatform | null>(null);
  const [scanning, setScanning] = useState(false);
  const [migrationPending, setMigrationPending] = useState<AgentPlatform | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const scan = async () => {
    if (scanning || busy) return;
    setScanning(true); setError(null); setNotice(null);
    try { setStatuses(await scanIntegrations()); setNotice(t("integration.scanComplete")); } catch (reason) { setError(message(reason)); }
    finally { setScanning(false); }
  };
  useEffect(() => { void scan(); }, []);

  const install = async (platform: AgentPlatform, migrate: boolean) => {
    setMigrationPending(null); setBusy(platform); setError(null); setNotice(null);
    try {
      setStatuses(await installIntegration(platform, migrate));
      setNotice(
        platform === "codex"
          ? t("integration.codexInstallComplete", { action: migrate ? t("common.migrate") : t("common.install") })
          : t("integration.installComplete", { name: platform === "claude" ? "Claude Code" : "Antigravity" }),
      );
    }
    catch (reason) { setError(message(reason)); }
    finally { setBusy(null); }
  };
  const requestInstall = (platform: AgentPlatform, migrate: boolean) => {
    if (migrate && migrationPending !== platform) {
      setMigrationPending(platform);
      setError(null);
      setNotice(t("integration.confirmMigrationNote"));
      return;
    }
    void install(platform, migrate);
  };
  const remove = async (platform: AgentPlatform) => {
    if (!window.confirm(t("integration.confirmUninstall", { name: platform === "codex" ? "Codex" : platform === "claude" ? "Claude Code" : "Antigravity" }))) return;
    setBusy(platform); setError(null); setNotice(null);
    try { setStatuses(await removeIntegration(platform)); setNotice(t("integration.uninstallComplete")); }
    catch (reason) { setError(message(reason)); }
    finally { setBusy(null); }
  };
  const repair = async (platform: AgentPlatform) => {
    setBusy(platform); setError(null); setNotice(null);
    try { setStatuses(await repairIntegration(platform)); setNotice(t("integration.permissionFixed")); }
    catch (reason) { setError(message(reason)); }
    finally { setBusy(null); }
  };

  return <section class="page integrations-page">
    <header class="page-header"><div><span class="eyebrow">{onboarding ? t("settings.firstSetup") : t("settings.integrations")}</span><h1>{onboarding ? t("settings.rememberProject") : t("settings.manageIntegrations")}</h1><p>{t("settings.integrationDescription")}</p></div><button class="secondary-button" disabled={scanning || busy !== null} onClick={() => void scan()}>{scanning ? <LoaderCircle class="spin" size={16} /> : <RefreshCw size={16} />}{scanning ? t("settings.scanning") : t("settings.scan")}</button></header>
    {error && <div class="error-banner"><ShieldAlert size={18} /><span>{error}</span><button onClick={() => navigator.clipboard.writeText(error)}>{t("error.copy")}</button></div>}
    {notice && <div class="success-note page-notice"><CheckCircle2 size={18} /><span>{notice}</span></div>}
    <div class="integration-grid">{statuses.map((status) => <IntegrationCard key={status.platform} status={status} busy={busy === status.platform} migrationPending={migrationPending === status.platform} onInstall={(migrate) => requestInstall(status.platform, migrate)} onCancelMigration={() => setMigrationPending(null)} onRepair={() => void repair(status.platform)} onRemove={() => void remove(status.platform)} onDownload={() => void openDownloadPage(status.platform)} t={t} />)}</div>
    {statuses.length === 0 && !error && <div class="loading-panel"><LoaderCircle class="spin" />{t("common.loading")}</div>}
    {onboarding && <footer class="onboarding-footer"><button class="secondary-button" onClick={onDone}>{t("settings.skip")}</button><button class="primary-button" onClick={onDone}><Sparkles size={16} />{t("settings.enterHub")}</button></footer>}
  </section>;
}

function UpdateCard({
  update,
  checking,
  downloading,
  error,
  notice,
  onCheck,
  onInstall,
  t,
}: {
  update: DesktopAppUpdate | null;
  checking: boolean;
  downloading: boolean;
  error: string | null;
  notice: string | null;
  onCheck: () => void;
  onInstall: () => void;
  t: ReturnType<typeof usePreferences>["t"];
}) {
  return <article class="settings-card update-card">
    <div class="update-card-heading"><div><span class="settings-label">{update?.available ? t("update.title") : t("settings.updates")}</span><small>{update?.available ? t("update.available", { current: update.currentVersion, version: update.version }) : t("settings.updatesDescription")}</small></div><button class="secondary-button" disabled={checking || downloading} onClick={onCheck}>{checking ? <LoaderCircle class="spin" size={16} /> : <RefreshCw size={16} />}{checking ? t("update.checking") : t("update.check")}</button></div>
    {update?.available && <>
      <div class="update-notes"><strong>{t("update.notes")}</strong><p>{update.notes || "—"}</p></div>
      <button class="primary-button" disabled={downloading} onClick={onInstall}>{downloading ? <LoaderCircle class="spin" size={16} /> : <Download size={16} />}{downloading ? t("update.downloading") : t("update.download")}</button>
    </>}
    {!checking && !update?.available && notice && <div class="success-note"><CheckCircle2 size={16} />{notice}</div>}
    {error && <div class="error-banner"><ShieldAlert size={16} /><span>{t("update.failed", { error })}</span></div>}
  </article>;
}

function SettingsPanel({
  languagePreference,
  themePreference,
  onLanguageChange,
  onThemeChange,
  update,
  checking,
  downloading,
  updateError,
  updateNotice,
  onCheckUpdate,
  onInstallUpdate,
  t,
}: {
  languagePreference: LanguagePreference;
  themePreference: ThemePreference;
  onLanguageChange: (value: LanguagePreference) => void;
  onThemeChange: (value: ThemePreference) => void;
  update: DesktopAppUpdate | null;
  checking: boolean;
  downloading: boolean;
  updateError: string | null;
  updateNotice: string | null;
  onCheckUpdate: () => void;
  onInstallUpdate: () => void;
  t: ReturnType<typeof usePreferences>["t"];
}) {
  return <section class="settings-panel">
    <header class="settings-panel-heading"><div><span class="eyebrow">{t("settings.title")}</span><h1>{t("settings.title")}</h1><p>{t("settings.subtitle")}</p></div></header>
    <div class="settings-grid">
      <label class="settings-card"><span class="settings-label">{t("settings.language")}</span><small>{t("settings.languageDescription")}</small><select value={languagePreference} onChange={(event) => onLanguageChange(event.currentTarget.value as LanguagePreference)}><option value="system">{t("settings.language.system")}</option><option value="zh-CN">{t("settings.language.zhCN")}</option><option value="en-US">{t("settings.language.enUS")}</option></select></label>
      <label class="settings-card"><span class="settings-label">{t("settings.theme")}</span><small>{t("settings.themeDescription")}</small><select value={themePreference} onChange={(event) => onThemeChange(event.currentTarget.value as ThemePreference)}><option value="system">{t("settings.theme.system")}</option><option value="light">{t("settings.theme.light")}</option><option value="dark">{t("settings.theme.dark")}</option></select></label>
      <UpdateCard update={update} checking={checking} downloading={downloading} error={updateError} notice={updateNotice} onCheck={onCheckUpdate} onInstall={onInstallUpdate} t={t} />
    </div>
  </section>;
}

function HubView({
  hub,
  loading,
  onRefresh,
  onProject,
  onRegister,
  onReview,
  locale,
  t,
}: {
  hub: MemoryHub | null;
  loading: boolean;
  onRefresh: () => void;
  onProject: (id: string) => void;
  onRegister: (platform: AgentPlatform, projectPath: string) => Promise<MemoryHub | null>;
  onReview: () => void;
  locale: "zh-CN" | "en-US";
  t: ReturnType<typeof usePreferences>["t"];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ProjectDirectoryFilter>("registered");
  const [platformFilter, setPlatformFilter] = useState<ProjectDirectoryPlatformFilter>("all");
  const [registeringPath, setRegisteringPath] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const items = useMemo(() => buildProjectDirectoryItems(hub), [hub]);
  const counts = useMemo(
    () => getProjectDirectoryCounts(filterProjectDirectoryItems(items, "all", platformFilter, query)),
    [items, platformFilter, query],
  );
  const platformCounts = useMemo(
    () => getProjectDirectoryPlatformCounts(filterProjectDirectoryItems(items, filter, "all", query)),
    [filter, items, query],
  );
  const visibleItems = useMemo(() => filterProjectDirectoryItems(items, filter, platformFilter, query), [filter, items, platformFilter, query]);
  const visibleRegisteredCount = visibleItems.filter((item) => item.registered).length;
  const visibleUnregisteredCount = visibleItems.length - visibleRegisteredCount;

  const registerProject = async (item: ProjectDirectoryItem) => {
    const platform = item.platforms[0];
    if (!platform || registeringPath) return;
    setRegisteringPath(item.path);
    setNotice(null);
    try {
      const result = await onRegister(platform, item.path);
      if (result) setNotice(t("hub.registeredNotice", { name: item.name }));
    } finally {
      setRegisteringPath(null);
    }
  };

  const renderDirectoryCard = (item: ProjectDirectoryItem) => <article class="project-directory-card" key={item.key}>
    <div class="project-directory-card-head">
      <div class="project-directory-copy">
        <div class="project-directory-title"><strong>{item.name}</strong><div class="project-directory-badges">
          {item.platforms.map((platform) => <span class={`platform-badge platform-${platform}`} key={platform}>{platform === "codex" ? "Codex" : platform === "claude" ? "Claude Code" : "Antigravity"}</span>)}
          {item.platforms.length === 0 && <span class="platform-badge platform-unlinked">{t("hub.noPlatform")}</span>}
          <span class={`directory-status ${item.registered ? "directory-status-registered" : "directory-status-unregistered"}`}>{item.registered ? t("hub.registered") : t("hub.unregistered")}</span>
        </div></div>
        <code class="project-directory-path" title={item.path}>{item.path}</code>
        <p>{item.registered ? item.overview || t("hub.registeredDescription") : t("hub.unregisteredDescription")}</p>
      </div>
    </div>
    <div class="project-directory-card-meta">
      <span>{t("hub.memoriesCount", { count: item.registered ? item.memoryCount : 0 })}</span>
      <span><strong>{item.latestActivityAt ? new Intl.DateTimeFormat(locale).format(new Date(item.latestActivityAt)) : "—"}</strong> {t("hub.latestActivity")}</span>
    </div>
    <div class="project-directory-action">
      {item.registered && item.registeredProjectId ? <button class="secondary-button" onClick={() => onProject(item.registeredProjectId!)}>{t("hub.viewMemory")}</button> : <button class="primary-button" disabled={registeringPath === item.path || item.platforms.length === 0} onClick={() => void registerProject(item)}>
        {registeringPath === item.path ? <LoaderCircle class="spin" size={16} /> : <Plus size={16} />}{t("hub.register")}
      </button>}
    </div>
  </article>;

  return <section class="page hub-page">
    <header class="hero"><div><span class="eyebrow">{t("hub.eyebrow")}</span><h1>{t("hub.title")}</h1><p>{t("hub.subtitle")}</p></div><button class="secondary-button" disabled={loading} onClick={onRefresh}>{loading ? <LoaderCircle class="spin" size={16} /> : <RefreshCw size={16} />}{t("common.refresh")}</button></header>
    <div class="metrics"><div><strong>{hub?.summary.projectCount ?? 0}</strong><span>{t("hub.projects")}</span></div><div><strong>{hub?.summary.memoryCount ?? 0}</strong><span>{t("hub.memories")}</span></div><button class="metric-action" onClick={onReview}><strong>{hub?.summary.pendingProposalCount ?? 0}</strong><span>{t("hub.pending")}</span><small>{t("hub.reviewHint")}</small></button><div><strong>{hub?.summary.attentionProjectCount ?? 0}</strong><span>{t("hub.attention")}</span></div></div>
    <section class="project-directory-section"><div class="section-heading"><div><span class="eyebrow">{t("hub.directory")}</span><h2>{t("hub.directoryTitle")}</h2></div><span class="section-note">{t("hub.directoryNote")}</span></div>
      <div class="project-directory-toolbar">
        <label class="search-box"><Search size={18} /><input value={query} onInput={(event) => setQuery(event.currentTarget.value)} placeholder={t("hub.searchPlaceholder")} /></label>
        <div class="directory-filter-groups">
          <div class="directory-filter-group"><span class="directory-filter-label">{t("hub.status")}</span><div class="directory-filters" role="tablist" aria-label={t("hub.status")}>{(["registered", "unregistered", "all"] as const).map((value) => { const labels = { registered: t("hub.registered"), unregistered: t("hub.unregistered"), all: t("hub.all") }; return <button class={filter === value ? "active" : ""} role="tab" aria-selected={filter === value} onClick={() => setFilter(value)} key={value}>{labels[value]} <span>{counts[value]}</span></button>; })}</div></div>
          <div class="directory-filter-group"><span class="directory-filter-label">{t("hub.platform")}</span><div class="directory-filters" role="tablist" aria-label={t("hub.platform")}>{(["all", "codex", "claude", "antigravity"] as const).map((value) => { const labels = { all: t("hub.all"), codex: "Codex", claude: "Claude Code", antigravity: "Antigravity" }; return <button class={platformFilter === value ? "active" : ""} role="tab" aria-selected={platformFilter === value} onClick={() => setPlatformFilter(value)} key={value}>{labels[value]} <span>{platformCounts[value]}</span></button>; })}</div></div>
        </div>
      </div>
      {notice && <div class="success-note directory-notice"><CheckCircle2 size={17} /><span>{notice}</span><button onClick={() => setNotice(null)}>{t("notice.understood")}</button></div>}
      <div class="project-directory-panel">
        <div class="project-directory-grid">
          {filter === "all" && visibleUnregisteredCount > 0 && <div class="directory-group-heading">{t("hub.unregistered")} <span>{visibleUnregisteredCount}</span></div>}
          {visibleItems.map((item, index) => <Fragment key={item.key}>{filter === "all" && item.registered && (index === 0 || !visibleItems[index - 1]?.registered) && <div class="directory-group-heading">{t("hub.registered")} <span>{visibleRegisteredCount}</span></div>}{renderDirectoryCard(item)}</Fragment>)}
        </div>
        {visibleItems.length === 0 && <div class="directory-empty">{query ? t("hub.noMatch") : filter === "registered" ? t("hub.noRegistered") : filter === "unregistered" ? t("hub.noUnregistered") : t("hub.noProjects")}</div>}
      </div>
    </section>
    {!hub && loading && <div class="loading-panel"><LoaderCircle class="spin" />{t("hub.loading")}</div>}
  </section>;
}

function App() {
  const { languagePreference, language, setLanguagePreference, themePreference, setThemePreference, t } = usePreferences();
  const [route, setRoute] = useState<Route>(() =>
    localStorage.getItem(onboardingKey) ? { name: "hub" } : { name: "integrations" },
  );
  const [onboarding, setOnboarding] = useState(!localStorage.getItem(onboardingKey));
  const [hub, setHub] = useState<MemoryHub | null>(null);
  const [project, setProject] = useState<GraphViewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [update, setUpdate] = useState<DesktopAppUpdate | null>(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [downloadingUpdate, setDownloadingUpdate] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateNotice, setUpdateNotice] = useState<string | null>(null);

  const loadHub = async (force: boolean) => {
    setLoading(true); setError(null);
    try {
      const cached = force ? null : await getCachedHub();
      if (cached) setHub(cached);
      const fresh = await refreshHub();
      setHub(fresh);
    } catch (reason) { setError(message(reason)); } finally { setLoading(false); }
  };
  useEffect(() => { void loadHub(false); }, []);

  const checkUpdate = async (showResult = false) => {
    if (checkingUpdate || downloadingUpdate) return;
    setCheckingUpdate(true);
    setUpdateError(null);
    setUpdateNotice(null);
    try {
      const result = await checkForUpdateApi();
      setUpdate(result);
      if (showResult && !result.available) setUpdateNotice(t("update.current", { version: result.currentVersion }));
    } catch (reason) {
      if (showResult) setUpdateError(message(reason));
    } finally {
      setCheckingUpdate(false);
    }
  };

  const installUpdate = async () => {
    if (!update?.available || !update.downloadUrl || !update.sha256 || !update.fileName) return;
    setDownloadingUpdate(true);
    setUpdateError(null);
    setUpdateNotice(null);
    try {
      const downloaded = await downloadUpdate(update.downloadUrl, update.sha256, update.fileName);
      await openUpdateInstaller(downloaded.fileName);
      setUpdateNotice(t("update.opened"));
    } catch (reason) {
      setUpdateError(message(reason));
    } finally {
      setDownloadingUpdate(false);
    }
  };

  useEffect(() => {
    void checkUpdate(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const version = await getAppVersion();
        const previousVersion = localStorage.getItem("talo:last-app-version");
        localStorage.setItem("talo:last-app-version", version);
        if (!previousVersion || previousVersion === version || cancelled) return;
        const statuses = await scanIntegrations();
        for (const status of statuses) {
          if (cancelled || status.managedBy !== "desktop" || status.integrationState !== "outdated") continue;
          await installIntegration(status.platform, false);
        }
      } catch {
        return;
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const openProject = async (projectId: string) => {
    setLoading(true); setError(null); setProject(null); setRoute({ name: "project", projectId });
    try { setProject(await getProjectView(projectId)); } catch (reason) { setError(message(reason)); } finally { setLoading(false); }
  };
  const registerPlatformProject = async (platform: AgentPlatform, projectPath: string): Promise<MemoryHub | null> => {
    setError(null);
    try {
      const nextHub = await registerPlatformProjectApi(platform, projectPath);
      setHub(nextHub);
      return nextHub;
    } catch (reason) {
      setError(message(reason));
      return null;
    }
  };
  const finishOnboarding = () => { localStorage.setItem(onboardingKey, "true"); setOnboarding(false); setRoute({ name: "hub" }); };

  return <div class="desktop-shell">
    <aside class="sidebar"><div class="brand"><div class="brand-mark"><TaloMark size={25} title="Talo" /></div><div><strong>Talo</strong><span>{t("brand.tagline")}</span></div></div><nav><button class={route.name === "hub" ? "active" : ""} onClick={() => setRoute({ name: "hub" })}><Home size={18} />{t("nav.memory")}</button><button class={route.name === "reviews" ? "active" : ""} onClick={() => setRoute({ name: "reviews" })}><ClipboardCheck size={18} />{t("nav.reviews")}{(hub?.summary.pendingProposalCount ?? 0) > 0 && <span class="nav-count">{hub?.summary.pendingProposalCount}</span>}</button><button class={route.name === "integrations" ? "active" : ""} onClick={() => { setOnboarding(false); setRoute({ name: "integrations" }); }}><Settings size={18} />{t("nav.settings")}</button></nav><footer>{t("nav.localPrivate")}</footer></aside>
    <main class={`desktop-content${route.name === "project" ? " project-content" : ""}`}>
      {update?.available && <div class="update-banner"><div><strong>{t("update.title")}</strong><span>{t("update.available", { current: update.currentVersion, version: update.version })}</span></div><button class="primary-button" disabled={downloadingUpdate} onClick={() => void installUpdate()}>{downloadingUpdate ? <LoaderCircle class="spin" size={16} /> : <Download size={16} />}{downloadingUpdate ? t("update.downloading") : t("update.download")}</button></div>}
      {error && route.name !== "integrations" && <div class="error-banner global-error"><ShieldAlert size={18} />{error}</div>}
      {route.name === "hub" && <HubView hub={hub} loading={loading} onRefresh={() => void loadHub(true)} onProject={(id) => void openProject(id)} onRegister={registerPlatformProject} onReview={() => setRoute({ name: "reviews" })} locale={language} t={t} />}
      {route.name === "reviews" && <ReviewView hub={hub} onHubChange={setHub} t={t} />}
      {route.name === "integrations" && <><SettingsPanel languagePreference={languagePreference} themePreference={themePreference} onLanguageChange={setLanguagePreference} onThemeChange={setThemePreference} update={update} checking={checkingUpdate} downloading={downloadingUpdate} updateError={updateError} updateNotice={updateNotice} onCheckUpdate={() => void checkUpdate(true)} onInstallUpdate={() => void installUpdate()} t={t} /><IntegrationsView onboarding={onboarding} onDone={finishOnboarding} t={t} /></>}
      {route.name === "project" && <section class="project-view"><button class="back-button" onClick={() => setRoute({ name: "hub" })}><ArrowLeft size={17} />{t("project.back")}</button>{project ? <GraphApp data={project} locale={language} /> : <div class="loading-panel"><LoaderCircle class="spin" />{t("project.loading")}</div>}</section>}
    </main>
  </div>;
}

const root = document.getElementById("app");
if (!root) throw new Error("Desktop application root is unavailable.");
render(<App />, root);
