import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, test } from "vitest";
import {
  buildDesktopPlatformInventory,
  discoverDesktopPlatformProjects,
} from "../src/platform-projects.js";

const cleanups: Array<() => void> = [];

afterEach(() => {
  while (cleanups.length > 0) cleanups.pop()?.();
});

describe("desktop platform projects", () => {
  test("discovers Codex and Claude sessions plus Antigravity workspace resources", () => {
    const root = mkdtempSync(path.join(tmpdir(), "project-memory-platforms-"));
    cleanups.push(() => rmSync(root, { recursive: true, force: true }));
    const codexHome = path.join(root, "codex");
    const claudeHome = path.join(root, "claude");
    const geminiHome = path.join(root, "gemini");
    const codexProject = path.join(root, "codex-project");
    const claudeProject = path.join(root, "claude-project");
    const antigravityProject = path.join(root, "antigravity-project");
    mkdirSync(path.join(codexHome, "sessions", "2026", "08"), { recursive: true });
    mkdirSync(codexProject, { recursive: true });
    mkdirSync(claudeProject, { recursive: true });
    mkdirSync(antigravityProject, { recursive: true });
    writeFileSync(
      path.join(codexHome, "sessions", "2026", "08", "session.jsonl"),
      `${JSON.stringify({
        timestamp: "2026-08-01T01:02:03.000Z",
        type: "session_meta",
        payload: { id: "codex-session", cwd: codexProject },
      })}\n`,
    );
    mkdirSync(path.join(claudeHome, "projects", "encoded-project"), { recursive: true });
    writeFileSync(
      path.join(claudeHome, "projects", "encoded-project", "session.jsonl"),
      [
        "not-json",
        JSON.stringify({ type: "queue-operation", timestamp: "2026-08-01T01:00:00.000Z" }),
        JSON.stringify({
          type: "user",
          timestamp: "2026-08-01T01:30:00.000Z",
          cwd: claudeProject,
          sessionId: "claude-session",
        }),
      ].join("\n"),
    );
    mkdirSync(path.join(geminiHome, "config", "projects"), { recursive: true });
    writeFileSync(
      path.join(geminiHome, "config", "projects", "antigravity.json"),
      JSON.stringify({
        id: "antigravity-project-id",
        name: "Antigravity 项目",
        updatedAt: "2026-08-01T02:03:04.000Z",
        projectResources: { resources: [{ folderUri: pathToFileURL(antigravityProject).href }] },
      }),
    );

    const projects = discoverDesktopPlatformProjects({ codexHome, claudeHome, geminiHome });
    expect(projects).toEqual([
      expect.objectContaining({
        platform: "antigravity",
        name: "Antigravity 项目",
        path: realpathSync(antigravityProject),
      }),
      expect.objectContaining({
        platform: "claude",
        path: realpathSync(claudeProject),
        platformProjectId: "claude-session",
        source: "claude-session",
      }),
      expect.objectContaining({
        platform: "codex",
        path: realpathSync(codexProject),
        platformProjectId: "codex-session",
      }),
    ]);
  });

  test("marks discovered projects against registered memory projects", () => {
    const projects = [
      {
        platform: "codex" as const,
        platformProjectId: "session",
        name: "已注册项目",
        path: "/tmp/registered-project",
        lastSeenAt: null,
        source: "codex-session" as const,
      },
    ];
    const inventory = buildDesktopPlatformInventory(
      projects,
      [
        {
          id: "project-id",
          name: "已注册项目",
          primaryPath: "/tmp/registered-project",
          isGit: false,
          gitCommonDir: null,
          remoteUrl: null,
          headCommit: null,
          createdAt: "2026-08-01T00:00:00.000Z",
          updatedAt: "2026-08-01T00:00:00.000Z",
          lastSeenAt: "2026-08-01T00:00:00.000Z",
        },
      ],
      [
        {
          projectId: "project-id",
          name: "已注册项目",
          primaryPath: "/tmp/registered-project",
          overview: "",
          latestActivityAt: null,
          latestActivityTitle: null,
          latestConclusion: null,
          nextStep: null,
          risk: null,
          memoryCount: 3,
          staleCitationCount: 0,
          pendingProposalCount: 0,
          pendingProposals: [],
          needsAttention: false,
          storyPath: "file:///tmp/story.html",
          searchText: "",
        },
      ],
    );
    expect(inventory.platforms[0]).toMatchObject({
      projectCount: 1,
      registeredCount: 1,
      unregisteredCount: 0,
    });
    expect(inventory.platforms[0]?.projects[0]).toMatchObject({
      registered: true,
      registeredProjectId: "project-id",
      memoryCount: 3,
    });
    expect(inventory.platforms.map((group) => group.displayName)).toEqual([
      "Codex",
      "Claude Code",
      "Antigravity",
    ]);
  });
});
