import { describe, expect, it } from "vitest";
import type { MemoryHub } from "./types";
import {
  buildProjectDirectoryItems,
  canonicalProjectPath,
  filterProjectDirectoryItems,
  getProjectDirectoryCounts,
  getProjectDirectoryPlatformCounts,
} from "./project-directory";

function registeredProject(overrides: Record<string, unknown> = {}) {
  return {
    projectId: "project-1",
    name: "记忆项目",
    primaryPath: "/workspace/project",
    overview: "架构决策摘要",
    latestActivityAt: "2026-07-30T10:00:00.000Z",
    latestActivityTitle: "完成接入",
    latestConclusion: null,
    nextStep: null,
    risk: null,
    memoryCount: 4,
    staleCitationCount: 0,
    pendingProposalCount: 0,
    pendingProposals: [],
    needsAttention: false,
    storyPath: "",
    searchText: "架构决策摘要",
    ...overrides,
  };
}

function platformProject(platform: "codex" | "claude" | "antigravity", overrides: Record<string, unknown> = {}) {
  return {
    platform,
    platformProjectId: `${platform}-1`,
    name:
      platform === "codex" ? "Codex 项目" : platform === "claude" ? "Claude 项目" : "Antigravity 项目",
    path: "/workspace/project",
    lastSeenAt: "2026-07-29T10:00:00.000Z",
    source:
      platform === "codex"
        ? "codex-session"
        : platform === "claude"
          ? "claude-session"
          : "antigravity-config",
    registered: false,
    registeredProjectId: null,
    memoryCount: 0,
    ...overrides,
  };
}

function hub(
  projects: unknown[] = [],
  platformProjects: unknown[] = [],
): MemoryHub {
  return {
    protocolVersion: 1,
    generatedAt: "2026-08-01T00:00:00.000Z",
    storageHome: "/tmp/project-memory",
    summary: { projectCount: projects.length, memoryCount: 0, pendingProposalCount: 0, attentionProjectCount: 0 },
    recentProjects: [],
    attentionProjects: [],
    pendingProjects: [],
    projects,
    platformProjects: {
      generatedAt: "2026-08-01T00:00:00.000Z",
      platforms: [
        { platform: "codex", displayName: "Codex", projectCount: 0, registeredCount: 0, unregisteredCount: 0, projects: [] },
        { platform: "claude", displayName: "Claude Code", projectCount: 0, registeredCount: 0, unregisteredCount: 0, projects: [] },
        { platform: "antigravity", displayName: "Antigravity", projectCount: 0, registeredCount: 0, unregisteredCount: 0, projects: [] },
      ].map((group) => ({
        ...group,
        projects: platformProjects.filter((project) => (project as { platform: string }).platform === group.platform),
      })),
    },
  } as unknown as MemoryHub;
}

describe("project directory", () => {
  it("merges the same path from Codex and Antigravity into one row", () => {
    const items = buildProjectDirectoryItems(hub([], [platformProject("codex"), platformProject("antigravity")]));

    expect(items).toHaveLength(1);
    expect(items[0]?.platforms).toEqual(["codex", "antigravity"]);
    expect(items[0]?.registered).toBe(false);
  });

  it("filters platform sources without duplicating dual-platform projects", () => {
    const items = buildProjectDirectoryItems(hub(
      [registeredProject({ primaryPath: "/workspace/memory-only", name: "记忆库项目" })],
      [
        platformProject("codex", { path: "/workspace/codex-only", name: "Codex 项目" }),
        platformProject("antigravity", { path: "/workspace/antigravity-only", name: "Antigravity 项目" }),
        platformProject("codex", { path: "/workspace/both", name: "双平台项目" }),
        platformProject("antigravity", { path: "/workspace/both", name: "双平台项目" }),
      ],
    ));

    expect(getProjectDirectoryPlatformCounts(items)).toEqual({ all: 4, codex: 2, claude: 0, antigravity: 2 });
    expect(filterProjectDirectoryItems(items, "all", "codex").map((item) => item.name)).toEqual(["双平台项目", "Codex 项目"]);
    expect(filterProjectDirectoryItems(items, "all", "antigravity").map((item) => item.name)).toEqual(["双平台项目", "Antigravity 项目"]);
    expect(filterProjectDirectoryItems(items, "all", "all").map((item) => item.name)).toContain("记忆库项目");
    expect(filterProjectDirectoryItems(items, "unregistered", "codex")).toHaveLength(2);
    expect(filterProjectDirectoryItems(items, "registered", "codex")).toHaveLength(0);
  });

  it("indexes and filters Claude Code projects", () => {
    const items = buildProjectDirectoryItems(
      hub([], [platformProject("claude", { path: "/workspace/claude" })]),
    );

    expect(getProjectDirectoryPlatformCounts(items)).toEqual({
      all: 1,
      codex: 0,
      claude: 1,
      antigravity: 0,
    });
    expect(filterProjectDirectoryItems(items, "all", "claude")).toHaveLength(1);
    expect(filterProjectDirectoryItems(items, "all", "all", "claude code")).toHaveLength(1);
  });

  it("uses the registered memory project as the authoritative row", () => {
    const items = buildProjectDirectoryItems(hub(
      [registeredProject({ name: "记忆库名称", memoryCount: 8 })],
      [platformProject("codex", { name: "扫描出来的名称", registered: true })],
    ));

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ name: "记忆库名称", registered: true, memoryCount: 8, registeredProjectId: "project-1" });
    expect(items[0]?.platforms).toEqual(["codex"]);
  });

  it("keeps memory-only projects visible with a memory badge source", () => {
    const items = buildProjectDirectoryItems(hub([registeredProject({ primaryPath: "/workspace/only-memory" })]));

    expect(items).toHaveLength(1);
    expect(items[0]?.platforms).toEqual([]);
    expect(items[0]?.registered).toBe(true);
  });

  it("returns unique counts for registered, unregistered, and all filters", () => {
    const items = buildProjectDirectoryItems(hub(
      [registeredProject()],
      [platformProject("codex"), platformProject("antigravity"), platformProject("codex", { path: "/workspace/other" })],
    ));

    expect(getProjectDirectoryCounts(items)).toEqual({ registered: 1, unregistered: 1, all: 2 });
    expect(filterProjectDirectoryItems(items, "registered")).toHaveLength(1);
    expect(filterProjectDirectoryItems(items, "unregistered")).toHaveLength(1);
    expect(filterProjectDirectoryItems(items, "all")).toHaveLength(2);
  });

  it("searches names, paths, platform badges, and memory summaries", () => {
    const items = buildProjectDirectoryItems(hub(
      [registeredProject({ overview: "稳定性迁移方案" })],
      [platformProject("antigravity", { path: "/workspace/visual-project", name: "视觉项目" })],
    ));

    expect(filterProjectDirectoryItems(items, "all", "all", "稳定性迁移")).toHaveLength(1);
    expect(filterProjectDirectoryItems(items, "all", "all", "visual-project")).toHaveLength(1);
    expect(filterProjectDirectoryItems(items, "all", "all", "antigravity")).toHaveLength(1);
    expect(filterProjectDirectoryItems(items, "all", "antigravity", "视觉项目")).toHaveLength(1);
  });

  it("sorts by most recent activity and groups pending projects first in all view", () => {
    const items = buildProjectDirectoryItems(hub(
      [registeredProject({ name: "旧项目", primaryPath: "/workspace/old", latestActivityAt: "2026-07-01T00:00:00.000Z" })],
      [platformProject("codex", { name: "新项目", path: "/workspace/new", lastSeenAt: "2026-07-31T00:00:00.000Z" })],
    ));

    expect(filterProjectDirectoryItems(items, "registered")[0]?.name).toBe("旧项目");
    expect(filterProjectDirectoryItems(items, "all").map((item) => item.name)).toEqual(["新项目", "旧项目"]);
  });

  it("reflects registration immediately when the hub changes", () => {
    const pending = buildProjectDirectoryItems(hub([], [platformProject("codex")]));
    const registered = buildProjectDirectoryItems(hub([registeredProject()], [platformProject("codex")]));

    expect(pending[0]?.registered).toBe(false);
    expect(registered[0]?.registered).toBe(true);
  });

  it("canonicalizes separators, dot segments, and Windows drive casing", () => {
    expect(canonicalProjectPath("C:\\Work\\Project\\..\\Project\\")).toBe("c:/Work/Project");
    expect(canonicalProjectPath("C:\\")).toBe("c:/");
    expect(canonicalProjectPath("/workspace/project/./")).toBe("/workspace/project");
  });
});
