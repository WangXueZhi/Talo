import type { Dirent } from "node:fs";
import {
  closeSync,
  existsSync,
  openSync,
  readdirSync,
  readFileSync,
  readSync,
  statSync,
} from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AgentPlatform } from "./desktop-integration.js";
import { detectGitMetadata } from "./git.js";
import type { MemoryHubProject, ProjectRecord } from "./types.js";

const MAX_CODEX_SESSION_FILES = 2000;
const MAX_SESSION_META_BYTES = 256 * 1024;

export interface DesktopPlatformProjectCandidate {
  platform: AgentPlatform;
  platformProjectId: string | null;
  name: string;
  path: string;
  lastSeenAt: string | null;
  source: "codex-session" | "claude-session" | "antigravity-config";
}

export interface DesktopPlatformProject {
  platform: AgentPlatform;
  platformProjectId: string | null;
  name: string;
  path: string;
  lastSeenAt: string | null;
  source: DesktopPlatformProjectCandidate["source"];
  registered: boolean;
  registeredProjectId: string | null;
  memoryCount: number;
}

export interface DesktopPlatformInventoryGroup {
  platform: AgentPlatform;
  displayName: string;
  projectCount: number;
  registeredCount: number;
  unregisteredCount: number;
  projects: DesktopPlatformProject[];
}

export interface DesktopPlatformInventory {
  generatedAt: string;
  platforms: DesktopPlatformInventoryGroup[];
}

export interface DesktopPlatformProjectScanOptions {
  platform?: NodeJS.Platform;
  homeDir?: string;
  codexHome?: string;
  claudeHome?: string;
  geminiHome?: string;
}

function readFirstLine(filePath: string): string | null {
  let descriptor: number | null = null;
  try {
    descriptor = openSync(filePath, "r");
    const buffer = Buffer.alloc(MAX_SESSION_META_BYTES);
    const bytesRead = readSync(descriptor, buffer, 0, buffer.length, 0);
    const firstLine = buffer.subarray(0, bytesRead).toString("utf8").split("\n", 1)[0];
    return firstLine || null;
  } catch {
    return null;
  } finally {
    if (descriptor !== null) closeSync(descriptor);
  }
}

function listFiles(root: string, depth = 0, result: string[] = []): string[] {
  if (depth > 8 || result.length >= MAX_CODEX_SESSION_FILES || !existsSync(root)) return result;
  let entries: Dirent<string>[];
  try {
    entries = readdirSync(root, { encoding: "utf8", withFileTypes: true });
  } catch {
    return result;
  }
  for (const entry of entries) {
    if (result.length >= MAX_CODEX_SESSION_FILES) break;
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) listFiles(entryPath, depth + 1, result);
    else if (entry.isFile() && entry.name.endsWith(".jsonl")) result.push(entryPath);
  }
  return result;
}

function normalizeProjectPath(inputPath: string): string | null {
  try {
    if (!existsSync(inputPath) || !statSync(inputPath).isDirectory()) return null;
    return detectGitMetadata(inputPath).rootPath;
  } catch {
    return null;
  }
}

function addCandidate(
  candidates: Map<string, DesktopPlatformProjectCandidate>,
  candidate: DesktopPlatformProjectCandidate,
): void {
  const key = `${candidate.platform}:${candidate.path}`;
  const existing = candidates.get(key);
  if (!existing || (candidate.lastSeenAt ?? "") > (existing.lastSeenAt ?? "")) {
    candidates.set(key, candidate);
  }
}

function scanCodexProjects(
  options: DesktopPlatformProjectScanOptions,
): DesktopPlatformProjectCandidate[] {
  const homeDir = options.homeDir ?? homedir();
  const codexHome = options.codexHome ?? process.env.CODEX_HOME ?? path.join(homeDir, ".codex");
  const sessionRoot = path.join(codexHome, "sessions");
  const sessionsByPath = new Map<
    string,
    { platformProjectId: string | null; lastSeenAt: string | null }
  >();
  const candidates = new Map<string, DesktopPlatformProjectCandidate>();
  for (const sessionPath of listFiles(sessionRoot)) {
    const firstLine = readFirstLine(sessionPath);
    if (!firstLine) continue;
    try {
      const record = JSON.parse(firstLine) as {
        timestamp?: string;
        type?: string;
        payload?: { cwd?: string; id?: string; session_id?: string };
      };
      if (record.type !== "session_meta" || typeof record.payload?.cwd !== "string") continue;
      const existing = sessionsByPath.get(record.payload.cwd);
      if (!existing || (record.timestamp ?? "") > (existing.lastSeenAt ?? "")) {
        sessionsByPath.set(record.payload.cwd, {
          platformProjectId: record.payload.session_id ?? record.payload.id ?? null,
          lastSeenAt: record.timestamp ?? null,
        });
      }
    } catch {}
  }
  for (const [sessionCwd, session] of sessionsByPath) {
    const projectPath = normalizeProjectPath(sessionCwd);
    if (!projectPath) continue;
    addCandidate(candidates, {
      platform: "codex",
      platformProjectId: session.platformProjectId,
      name: path.basename(projectPath),
      path: projectPath,
      lastSeenAt: session.lastSeenAt,
      source: "codex-session",
    });
  }
  return [...candidates.values()];
}

function scanAntigravityProjects(
  options: DesktopPlatformProjectScanOptions,
): DesktopPlatformProjectCandidate[] {
  const homeDir = options.homeDir ?? homedir();
  const geminiHome = options.geminiHome ?? process.env.GEMINI_HOME ?? path.join(homeDir, ".gemini");
  const configRoot = path.join(geminiHome, "config", "projects");
  const candidates = new Map<string, DesktopPlatformProjectCandidate>();
  let entries: Dirent<string>[];
  try {
    entries = readdirSync(configRoot, { encoding: "utf8", withFileTypes: true });
  } catch {
    return [];
  }
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    const filePath = path.join(configRoot, entry.name);
    try {
      const config = JSON.parse(readFileSync(filePath, "utf8")) as {
        id?: string;
        name?: string;
        updatedAt?: string;
        projectResources?: { resources?: Array<{ folderUri?: string }> };
      };
      for (const resource of config.projectResources?.resources ?? []) {
        if (typeof resource.folderUri !== "string") continue;
        let requestedPath: string;
        try {
          requestedPath = resource.folderUri.startsWith("file:")
            ? fileURLToPath(resource.folderUri)
            : resource.folderUri;
        } catch {
          continue;
        }
        const projectPath = normalizeProjectPath(requestedPath);
        if (!projectPath) continue;
        addCandidate(candidates, {
          platform: "antigravity",
          platformProjectId: config.id ?? path.basename(entry.name, ".json"),
          name: config.name?.trim() || path.basename(projectPath),
          path: projectPath,
          lastSeenAt: config.updatedAt ?? null,
          source: "antigravity-config",
        });
      }
    } catch {}
  }
  return [...candidates.values()];
}

function scanClaudeProjects(
  options: DesktopPlatformProjectScanOptions,
): DesktopPlatformProjectCandidate[] {
  const homeDir = options.homeDir ?? homedir();
  const claudeHome = options.claudeHome ?? process.env.CLAUDE_HOME ?? path.join(homeDir, ".claude");
  const sessionRoot = path.join(claudeHome, "projects");
  const sessionsByPath = new Map<
    string,
    { platformProjectId: string | null; lastSeenAt: string | null }
  >();
  const candidates = new Map<string, DesktopPlatformProjectCandidate>();

  for (const sessionPath of listFiles(sessionRoot)) {
    let descriptor: number | null = null;
    try {
      descriptor = openSync(sessionPath, "r");
      const buffer = Buffer.alloc(MAX_SESSION_META_BYTES);
      const bytesRead = readSync(descriptor, buffer, 0, buffer.length, 0);
      for (const line of buffer.subarray(0, bytesRead).toString("utf8").split("\n")) {
        if (!line.trim()) continue;
        try {
          const record = JSON.parse(line) as {
            timestamp?: string;
            cwd?: string;
            sessionId?: string;
            session_id?: string;
          };
          if (typeof record.cwd !== "string") continue;
          const existing = sessionsByPath.get(record.cwd);
          if (!existing || (record.timestamp ?? "") > (existing.lastSeenAt ?? "")) {
            sessionsByPath.set(record.cwd, {
              platformProjectId: record.sessionId ?? record.session_id ?? null,
              lastSeenAt: record.timestamp ?? null,
            });
          }
        } catch {}
      }
    } catch {
    } finally {
      if (descriptor !== null) closeSync(descriptor);
    }
  }

  for (const [sessionCwd, session] of sessionsByPath) {
    const projectPath = normalizeProjectPath(sessionCwd);
    if (!projectPath) continue;
    addCandidate(candidates, {
      platform: "claude",
      platformProjectId: session.platformProjectId,
      name: path.basename(projectPath),
      path: projectPath,
      lastSeenAt: session.lastSeenAt,
      source: "claude-session",
    });
  }
  return [...candidates.values()];
}

export function discoverDesktopPlatformProjects(
  options: DesktopPlatformProjectScanOptions = {},
): DesktopPlatformProjectCandidate[] {
  const candidates = [
    ...scanCodexProjects(options),
    ...scanClaudeProjects(options),
    ...scanAntigravityProjects(options),
  ];
  return candidates.sort(
    (left, right) =>
      left.platform.localeCompare(right.platform) ||
      left.name.localeCompare(right.name, "zh-CN") ||
      left.path.localeCompare(right.path),
  );
}

export function buildDesktopPlatformInventory(
  candidates: DesktopPlatformProjectCandidate[],
  registeredProjects: ProjectRecord[],
  hubProjects: MemoryHubProject[],
): DesktopPlatformInventory {
  const hubById = new Map(hubProjects.map((project) => [project.projectId, project]));
  const registeredByPath = new Map(
    registeredProjects.map((project) => [project.primaryPath, project]),
  );
  const projects = candidates.map((candidate) => {
    const registered = registeredByPath.get(candidate.path) ?? null;
    const hubProject = registered ? hubById.get(registered.id) : null;
    return {
      ...candidate,
      registered: Boolean(registered),
      registeredProjectId: registered?.id ?? null,
      memoryCount: hubProject?.memoryCount ?? 0,
    };
  });
  const groups: DesktopPlatformInventoryGroup[] = (["codex", "claude", "antigravity"] as const).map(
    (platform) => {
      const platformProjects = projects.filter((project) => project.platform === platform);
      return {
        platform,
        displayName:
          platform === "codex" ? "Codex" : platform === "claude" ? "Claude Code" : "Antigravity",
        projectCount: platformProjects.length,
        registeredCount: platformProjects.filter((project) => project.registered).length,
        unregisteredCount: platformProjects.filter((project) => !project.registered).length,
        projects: platformProjects,
      };
    },
  );
  return { generatedAt: new Date().toISOString(), platforms: groups };
}
