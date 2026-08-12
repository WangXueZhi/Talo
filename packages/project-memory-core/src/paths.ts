import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import picomatch from "picomatch";
import { ProjectMemoryError } from "./errors.js";

export interface LocalConfig {
  denyPatterns: string[];
}

export interface DataHomeInspection {
  activeHome: string | null;
  selectionSource: "project-env" | "legacy-env" | "selection" | "neutral" | "legacy" | "new" | null;
  neutralHome: string;
  legacyHome: string;
  neutralExists: boolean;
  legacyExists: boolean;
  ambiguous: boolean;
  selectionPath: string;
}

export interface DataHomeCounts {
  projects: number;
  memories: number;
  relations: number;
  proposals: number;
  auditEvents: number;
}

function configRoot(): string {
  const windowsAppData =
    process.platform === "win32" ? (process.env.APPDATA ?? process.env.LOCALAPPDATA) : null;
  return process.env.PROJECT_MEMORY_CONFIG_HOME
    ? path.resolve(process.env.PROJECT_MEMORY_CONFIG_HOME)
    : path.join(windowsAppData ?? homedir(), ".project-memory");
}

export function resolveConfigRoot(): string {
  return configRoot();
}

function legacyRoot(): string {
  const codexHome = process.env.CODEX_HOME
    ? path.resolve(process.env.CODEX_HOME)
    : path.join(homedir(), ".codex");
  return path.join(codexHome, "project-memory", "v1");
}

function selectionFile(): string {
  return path.join(configRoot(), "active-home.json");
}

function readSelectedHome(): string | null {
  const filePath = selectionFile();
  if (!existsSync(filePath)) return null;
  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as { activeHome?: unknown };
    return typeof parsed.activeHome === "string" && parsed.activeHome.trim()
      ? path.resolve(parsed.activeHome)
      : null;
  } catch (error) {
    throw new ProjectMemoryError("STORAGE_ERROR", "Talo home selection is invalid.", {
      path: filePath,
      cause: error instanceof Error ? error.message : String(error),
    });
  }
}

export function inspectDataHomes(): DataHomeInspection {
  const neutralHome = path.join(configRoot(), "v1");
  const legacyHome = legacyRoot();
  const neutralExists = existsSync(neutralHome);
  const legacyExists = existsSync(legacyHome);
  const projectEnv = process.env.PROJECT_MEMORY_HOME;
  const legacyEnv = process.env.CODEX_PROJECT_MEMORY_HOME;
  const selected = readSelectedHome();
  let activeHome: string | null = null;
  let selectionSource: DataHomeInspection["selectionSource"] = null;

  if (projectEnv) {
    activeHome = path.resolve(projectEnv);
    selectionSource = "project-env";
  } else if (legacyEnv) {
    activeHome = path.resolve(legacyEnv);
    selectionSource = "legacy-env";
  } else if (selected) {
    activeHome = selected;
    selectionSource = "selection";
  } else if (neutralExists && legacyExists && neutralHome !== legacyHome) {
    return {
      activeHome: null,
      selectionSource: null,
      neutralHome,
      legacyHome,
      neutralExists,
      legacyExists,
      ambiguous: true,
      selectionPath: selectionFile(),
    };
  } else if (neutralExists) {
    activeHome = neutralHome;
    selectionSource = "neutral";
  } else if (legacyExists) {
    activeHome = legacyHome;
    selectionSource = "legacy";
  } else {
    activeHome = neutralHome;
    selectionSource = "new";
  }

  return {
    activeHome,
    selectionSource,
    neutralHome,
    legacyHome,
    neutralExists,
    legacyExists,
    ambiguous: false,
    selectionPath: selectionFile(),
  };
}

export function resolveMemoryHubPath(): string {
  return path.join(configRoot(), "MEMORY_HUB.html");
}

export function resolveDataDir(): string {
  const inspection = inspectDataHomes();
  if (inspection.ambiguous || !inspection.activeHome) {
    throw new ProjectMemoryError(
      "AMBIGUOUS_MEMORY_HOME",
      "Both the shared and legacy Talo homes exist. Select one explicitly.",
      { ...inspection },
    );
  }
  return inspection.activeHome;
}

export function selectDataDir(dataDir: string): DataHomeInspection {
  const selected = path.resolve(dataDir);
  if (!existsSync(selected)) {
    throw new ProjectMemoryError(
      "MEMORY_HOME_NOT_ACCESSIBLE",
      "The selected Talo home does not exist.",
      { path: selected },
    );
  }
  const root = configRoot();
  mkdirSync(root, { recursive: true, mode: 0o700 });
  chmodSync(root, 0o700);
  const target = selectionFile();
  const temporary = `${target}.${process.pid}.tmp`;
  writeFileSync(temporary, `${JSON.stringify({ activeHome: selected }, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  chmodSync(temporary, 0o600);
  renameSync(temporary, target);
  chmodSync(target, 0o600);
  return inspectDataHomes();
}

function countMarkdownMemories(filePath: string): number {
  if (!existsSync(filePath)) return 0;
  return [...readFileSync(filePath, "utf8").matchAll(/^## \[[0-9a-f-]+\](?: .*)?$/gim)].length;
}

export function inspectDataHomeCounts(dataDir: string): DataHomeCounts {
  const root = path.resolve(dataDir);
  const registryPath = path.join(root, "registry.json");
  const registry = existsSync(registryPath)
    ? (JSON.parse(readFileSync(registryPath, "utf8")) as { projects?: Array<{ id?: unknown }> })
    : { projects: [] };
  const ids = (registry.projects ?? [])
    .map((entry) => entry.id)
    .filter((id): id is string => typeof id === "string" && Boolean(id));
  const counts: DataHomeCounts = {
    projects: ids.length,
    memories: 0,
    relations: 0,
    proposals: 0,
    auditEvents: 0,
  };
  for (const projectId of ids) {
    const projectDir = path.join(root, "projects", projectId);
    counts.memories += countMarkdownMemories(path.join(projectDir, "MEMORY.md"));
    const relationsPath = path.join(projectDir, "RELATIONS.json");
    if (existsSync(relationsPath)) {
      const document = JSON.parse(readFileSync(relationsPath, "utf8")) as { relations?: unknown[] };
      counts.relations += Array.isArray(document.relations) ? document.relations.length : 0;
    }
    const proposalsDir = path.join(projectDir, "proposals");
    if (existsSync(proposalsDir)) {
      counts.proposals += readdirSync(proposalsDir).filter((name) => name.endsWith(".json")).length;
    }
    const auditPath = path.join(projectDir, "audit.jsonl");
    if (existsSync(auditPath)) {
      counts.auditEvents += readFileSync(auditPath, "utf8")
        .split(/\r?\n/)
        .filter((line) => line.trim()).length;
    }
  }
  return counts;
}

function hardenTree(root: string): void {
  chmodSync(root, 0o700);
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) hardenTree(target);
    else if (entry.isFile()) chmodSync(target, 0o600);
  }
}

export function migrateDataDir(sourceDir: string, targetDir: string): Record<string, unknown> {
  const source = path.resolve(sourceDir);
  const target = path.resolve(targetDir);
  if (source === target) {
    throw new ProjectMemoryError("INVALID_INPUT", "Source and target homes must be different.", {
      source,
      target,
    });
  }
  if (!existsSync(source)) {
    throw new ProjectMemoryError("FILE_NOT_FOUND", "Source Talo home does not exist.", {
      source,
    });
  }
  if (existsSync(target) && readdirSync(target).length > 0) {
    throw new ProjectMemoryError("STORAGE_ERROR", "Target Talo home is not empty.", {
      target,
    });
  }
  const parent = path.dirname(target);
  mkdirSync(parent, { recursive: true, mode: 0o700 });
  const suffix = new Date().toISOString().replaceAll(/[:.]/g, "-");
  const backup = `${source}.backup-${suffix}`;
  const staging = `${target}.migrating-${process.pid}`;
  const sourceCounts = inspectDataHomeCounts(source);
  try {
    cpSync(source, backup, { recursive: true, errorOnExist: true, force: false });
    hardenTree(backup);
    cpSync(source, staging, { recursive: true, errorOnExist: true, force: false });
    hardenTree(staging);
    const stagedCounts = inspectDataHomeCounts(staging);
    if (JSON.stringify(sourceCounts) !== JSON.stringify(stagedCounts)) {
      throw new ProjectMemoryError(
        "STORAGE_ERROR",
        "Migrated Talo counts do not match the source.",
        { sourceCounts, stagedCounts },
      );
    }
    if (existsSync(target)) rmSync(target, { recursive: true, force: true });
    renameSync(staging, target);
    const targetCounts = inspectDataHomeCounts(target);
    selectDataDir(target);
    return {
      source,
      target,
      backup,
      preservedSource: true,
      selected: true,
      counts: targetCounts,
    };
  } catch (error) {
    rmSync(staging, { recursive: true, force: true });
    throw error;
  }
}

export function ensureDataDir(dataDir = resolveDataDir()): string {
  mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  return dataDir;
}

export function loadLocalConfig(dataDir: string): LocalConfig {
  const configPath = path.join(dataDir, "config.json");
  if (!existsSync(configPath)) {
    return { denyPatterns: [] };
  }

  const raw = JSON.parse(readFileSync(configPath, "utf8")) as { denyPatterns?: unknown };
  return {
    denyPatterns: Array.isArray(raw.denyPatterns)
      ? raw.denyPatterns.filter((value): value is string => typeof value === "string")
      : [],
  };
}

export function matchesCustomDeny(relativePath: string, patterns: string[]): boolean {
  return patterns.some((pattern) => picomatch.isMatch(relativePath, pattern, { dot: true }));
}
