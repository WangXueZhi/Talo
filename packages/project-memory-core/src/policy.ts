import { randomUUID } from "node:crypto";
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { ProjectMemoryError } from "./errors.js";
import { assertNoSecret, sha256 } from "./security.js";
import type {
  DetectedProject,
  ProjectPolicyRecord,
  ProjectPolicyRule,
  ProjectPolicySource,
  ProposalActor,
} from "./types.js";

export const POLICY_SCHEMA_VERSION = 1 as const;

export function policyPath(projectDir: string): string {
  return path.join(projectDir, "policy.json");
}

export function emptyPolicy(projectId: string, targetPath: string): ProjectPolicyRecord {
  return {
    schemaVersion: POLICY_SCHEMA_VERSION,
    policyId: randomUUID(),
    projectId,
    version: 0,
    status: "unconfigured",
    summary: "",
    rules: [],
    sources: [],
    sourceFingerprint: sha256(""),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: { platform: "system", adapterVersion: null },
    bridge: {
      enabled: false,
      consentAt: null,
      targetPath,
      fileOwnership: "preexisting",
      createdFileHash: null,
      lastWholeFileHash: null,
      lastManagedBlockHash: null,
      lastSyncedPolicyVersion: null,
      lastSyncedAt: null,
      syncStatus: "disabled",
      lastError: null,
    },
  };
}

export function readPolicy(filePath: string): ProjectPolicyRecord | null {
  if (!existsSync(filePath)) return null;
  try {
    const value = JSON.parse(readFileSync(filePath, "utf8")) as ProjectPolicyRecord;
    if (
      value.schemaVersion !== POLICY_SCHEMA_VERSION ||
      typeof value.policyId !== "string" ||
      typeof value.projectId !== "string" ||
      !Number.isInteger(value.version) ||
      !Array.isArray(value.rules) ||
      !Array.isArray(value.sources) ||
      !value.bridge
    ) {
      throw new Error("invalid policy shape");
    }
    return value;
  } catch (error) {
    throw new ProjectMemoryError("STORAGE_ERROR", "Project Policy is invalid.", {
      path: filePath,
      cause: error instanceof Error ? error.message : String(error),
    });
  }
}

export function writePolicy(filePath: string, policy: ProjectPolicyRecord): void {
  mkdirSync(path.dirname(filePath), { recursive: true, mode: 0o700 });
  const temporary = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  try {
    writeFileSync(temporary, `${JSON.stringify(policy, null, 2)}\n`, {
      encoding: "utf8",
      mode: 0o600,
    });
    chmodSync(temporary, 0o600);
    renameSync(temporary, filePath);
    chmodSync(filePath, 0o600);
  } finally {
    rmSync(temporary, { force: true });
  }
}

export function validatePolicyInput(input: {
  summary: string;
  rules: ProjectPolicyRule[];
  sources?: ProjectPolicySource[];
}): void {
  if (!input.summary.trim() || input.summary.length > 1000) {
    throw new ProjectMemoryError("INVALID_INPUT", "Policy summary must be 1-1000 characters.");
  }
  if (input.rules.length > 50) {
    throw new ProjectMemoryError("INVALID_INPUT", "A Policy can contain at most 50 rules.");
  }
  for (const rule of input.rules) {
    if (!rule.id.trim() || rule.id.length > 120 || !Number.isInteger(rule.priority)) {
      throw new ProjectMemoryError("INVALID_INPUT", "Policy rule metadata is invalid.");
    }
    for (const text of [...rule.triggerTopics, ...rule.requiredActions, ...rule.forbiddenActions]) {
      assertNoSecret(text, "policy rule");
      if (text.length > 500)
        throw new ProjectMemoryError("INVALID_INPUT", "Policy rule text is too long.");
    }
  }
}

export interface PolicyEditInput {
  summary: string;
  rules: ProjectPolicyRule[];
  sources?: ProjectPolicySource[];
  actor: ProposalActor;
  expectedVersion?: number;
}

export function updatePolicyRecord(
  current: ProjectPolicyRecord | null,
  project: DetectedProject,
  input: PolicyEditInput,
): ProjectPolicyRecord {
  validatePolicyInput(input);
  if (current && input.expectedVersion !== undefined && input.expectedVersion !== current.version) {
    throw new ProjectMemoryError(
      "POLICY_VERSION_CONFLICT",
      "Policy version changed before this edit was saved.",
      {
        expectedVersion: input.expectedVersion,
        currentVersion: current.version,
      },
    );
  }
  const now = new Date().toISOString();
  const sources = input.sources ?? [];
  const sourceFingerprint = sha256(JSON.stringify(sources));
  return {
    schemaVersion: POLICY_SCHEMA_VERSION,
    policyId: current?.policyId ?? randomUUID(),
    projectId: current?.projectId ?? project.registeredProject?.id ?? "",
    version: (current?.version ?? 0) + 1,
    status: current?.bridge.enabled ? "pending_sync" : "disabled",
    summary: input.summary.trim(),
    rules: input.rules,
    sources,
    sourceFingerprint,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
    updatedBy: input.actor,
    bridge: current?.bridge ?? {
      enabled: false,
      consentAt: null,
      targetPath: path.join(project.rootPath, "AGENTS.md"),
      fileOwnership: "preexisting",
      createdFileHash: null,
      lastWholeFileHash: null,
      lastManagedBlockHash: null,
      lastSyncedPolicyVersion: null,
      lastSyncedAt: null,
      syncStatus: "disabled",
      lastError: null,
    },
  };
}

export function policySourceIsCurrent(
  project: DetectedProject,
  source: ProjectPolicySource,
): boolean {
  if (source.kind !== "file" || !source.path) return true;
  const target = path.resolve(project.rootPath, source.path);
  if (path.isAbsolute(source.path) || path.relative(project.rootPath, target).startsWith(".."))
    return false;
  if (!existsSync(target) || !lstatSync(target).isFile()) return false;
  return sha256(readFileSync(target)) === source.fileHash;
}

export function assertPolicySourcesCurrent(
  project: DetectedProject,
  policy: ProjectPolicyRecord,
): void {
  const stale = policy.sources.filter((source) => !policySourceIsCurrent(project, source));
  if (stale.length > 0) {
    throw new ProjectMemoryError(
      "POLICY_SOURCE_STALE",
      "A Policy source file changed or was removed.",
      {
        sources: stale.map((source) => ({ path: source.path, fileHash: source.fileHash })),
      },
    );
  }
}
