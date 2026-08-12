import type { AgentPlatform, MemoryHub } from "./types";

type RegisteredProject = MemoryHub["projects"][number];

export type ProjectDirectoryFilter = "registered" | "unregistered" | "all";
export type ProjectDirectoryPlatformFilter = "all" | AgentPlatform;

export interface ProjectDirectoryItem {
  key: string;
  name: string;
  path: string;
  platforms: AgentPlatform[];
  registered: boolean;
  registeredProjectId: string | null;
  memoryCount: number;
  latestActivityAt: string | null;
  latestActivityTitle: string | null;
  overview: string;
  latestConclusion: RegisteredProject["latestConclusion"];
  nextStep: RegisteredProject["nextStep"];
  risk: RegisteredProject["risk"];
  needsAttention: boolean;
  searchText: string;
}

export interface ProjectDirectoryCounts {
  registered: number;
  unregistered: number;
  all: number;
}

export interface ProjectDirectoryPlatformCounts {
  all: number;
  codex: number;
  claude: number;
  antigravity: number;
}

function cleanText(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

export function canonicalProjectPath(value: string): string {
  const input = cleanText(value).replaceAll("\\", "/").replace(/\/+/g, "/");
  if (!input) return "";
  const drive = /^[A-Za-z]:\//.test(input) ? input.slice(0, 2).toLowerCase() : "";
  const absolute = input.startsWith("/") || Boolean(drive);
  const segments = input
    .replace(/^[A-Za-z]:\//, "")
    .split("/")
    .filter((segment) => segment && segment !== ".")
    .reduce<string[]>((result, segment) => {
      if (segment === "..") result.pop();
      else result.push(segment);
      return result;
    }, []);
  const prefix = drive ? `${drive}/` : absolute ? "/" : "";
  const result = `${prefix}${segments.join("/")}`;
  if (result === "/" || result === `${drive}/`) return result;
  if (result) return result.replace(/\/$/, "");
  return prefix || ".";
}

function platformLabel(platform: AgentPlatform): string {
  return platform === "codex" ? "Codex" : platform === "claude" ? "Claude Code" : "Antigravity";
}

function activityTimestamp(item: ProjectDirectoryItem): number {
  const timestamp = item.latestActivityAt ? Date.parse(item.latestActivityAt) : Number.NaN;
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function compareProjectDirectoryItems(left: ProjectDirectoryItem, right: ProjectDirectoryItem): number {
  const activityDifference = activityTimestamp(right) - activityTimestamp(left);
  if (activityDifference) return activityDifference;
  return left.name.localeCompare(right.name, "zh-CN") || left.path.localeCompare(right.path);
}

export function buildProjectDirectoryItems(hub: MemoryHub | null | undefined): ProjectDirectoryItem[] {
  const byPath = new Map<string, ProjectDirectoryItem & { platformSet: Set<AgentPlatform> }>();

  for (const project of hub?.projects ?? []) {
    const path = canonicalProjectPath(project.primaryPath);
    if (!path) continue;
    byPath.set(path, {
      key: path,
      name: project.name,
      path: project.primaryPath,
      platforms: [],
      platformSet: new Set(),
      registered: true,
      registeredProjectId: project.projectId,
      memoryCount: project.memoryCount,
      latestActivityAt: project.latestActivityAt,
      latestActivityTitle: project.latestActivityTitle,
      overview: project.overview,
      latestConclusion: project.latestConclusion,
      nextStep: project.nextStep,
      risk: project.risk,
      needsAttention: project.needsAttention,
      searchText: "",
    });
  }

  for (const group of hub?.platformProjects?.platforms ?? []) {
    for (const project of group.projects) {
      const path = canonicalProjectPath(project.path);
      if (!path) continue;
      const existing = byPath.get(path);
      if (existing) {
        existing.platformSet.add(project.platform);
        if (!existing.registered) {
          const existingActivity = existing.latestActivityAt ? Date.parse(existing.latestActivityAt) : 0;
          const candidateActivity = project.lastSeenAt ? Date.parse(project.lastSeenAt) : 0;
          if (candidateActivity > existingActivity) existing.latestActivityAt = project.lastSeenAt;
        }
        continue;
      }
      byPath.set(path, {
        key: path,
        name: cleanText(project.name) || path.split("/").pop() || path,
        path: project.path,
        platforms: [],
        platformSet: new Set([project.platform]),
        registered: false,
        registeredProjectId: null,
        memoryCount: 0,
        latestActivityAt: project.lastSeenAt,
        latestActivityTitle: null,
        overview: "尚未注册到记忆库",
        latestConclusion: null,
        nextStep: null,
        risk: null,
        needsAttention: false,
        searchText: "",
      });
    }
  }

  return [...byPath.values()]
    .map(({ platformSet, ...item }) => {
      const platforms = [...platformSet].sort(
        (left, right) =>
          ["codex", "claude", "antigravity"].indexOf(left) -
          ["codex", "claude", "antigravity"].indexOf(right),
      );
      const searchable = [
        item.name,
        item.path,
        item.overview,
        item.latestActivityTitle,
        item.latestConclusion?.displayTitle,
        item.latestConclusion?.title,
        item.latestConclusion?.summary,
        item.nextStep?.displayTitle,
        item.nextStep?.title,
        item.nextStep?.summary,
        item.risk?.displayTitle,
        item.risk?.title,
        item.risk?.summary,
        ...platforms.map(platformLabel),
        item.registered ? "已注册" : "待注册 未注册",
        platforms.length === 0 ? "无平台来源" : "",
      ];
      return {
        ...item,
        platforms,
        searchText: searchable.filter(Boolean).join(" ").toLocaleLowerCase(),
      } satisfies ProjectDirectoryItem;
    })
    .sort(compareProjectDirectoryItems);
}

export function getProjectDirectoryCounts(items: ProjectDirectoryItem[]): ProjectDirectoryCounts {
  const registered = items.filter((item) => item.registered).length;
  return { registered, unregistered: items.length - registered, all: items.length };
}

export function getProjectDirectoryPlatformCounts(
  items: ProjectDirectoryItem[],
): ProjectDirectoryPlatformCounts {
  return {
    all: items.length,
    codex: items.filter((item) => item.platforms.includes("codex")).length,
    claude: items.filter((item) => item.platforms.includes("claude")).length,
    antigravity: items.filter((item) => item.platforms.includes("antigravity")).length,
  };
}

export function filterProjectDirectoryItems(
  items: ProjectDirectoryItem[],
  filter: ProjectDirectoryFilter,
  platformFilter: ProjectDirectoryPlatformFilter = "all",
  query = "",
): ProjectDirectoryItem[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const searched = normalizedQuery
    ? items.filter((item) => item.searchText.includes(normalizedQuery))
    : items;
  const filtered = filter === "registered"
    ? searched.filter((item) => item.registered)
    : filter === "unregistered"
      ? searched.filter((item) => !item.registered)
      : searched;
  const platformFiltered = platformFilter === "all"
    ? filtered
    : filtered.filter((item) => item.platforms.includes(platformFilter));
  return [...platformFiltered].sort((left, right) => {
    if (filter === "all" && left.registered !== right.registered) return left.registered ? 1 : -1;
    return compareProjectDirectoryItems(left, right);
  });
}
