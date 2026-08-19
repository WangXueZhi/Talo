import path, { basename } from "node:path";
import { pathToFileURL } from "node:url";
import { buildProjectBrief } from "./brief.js";
import type { GraphViewData } from "./browser/types.js";
import type { AgentPlatform } from "./desktop-integration.js";
import { buildMemoryDisplayTitle } from "./display-title.js";
import { ProjectMemoryError } from "./errors.js";
import { detectGitMetadata, type GitMetadata } from "./git.js";
import { analyzeKnowledgeGraph } from "./guide.js";
import { renderMemoryHubHtml } from "./hub.js";
import { loadLocalConfig, resolveMemoryHubPath } from "./paths.js";
import {
  buildDesktopPlatformInventory,
  discoverDesktopPlatformProjects,
} from "./platform-projects.js";
import { buildGetResult, buildRecallResult } from "./retrieval.js";
import { assertNoSecret, readProjectFile, searchProjectFiles } from "./security.js";
import type {
  MemoryStore,
  PreparedCandidate,
  PreparedCitation,
  PreparedRelationCandidate,
  PreparedUpdateCandidate,
  ProposalCommitResult,
  ProposalSourceCheck,
  ProposalSourceRefreshResult,
} from "./store.js";
import {
  BRIEF_ROLES,
  type BriefRole,
  CITATION_ROLES,
  type DetectedProject,
  type GetMemoriesResult,
  type GraphGuide,
  MEMORY_KINDS,
  MEMORY_PHASES,
  type MemoryCandidate,
  type MemoryCitationCandidate,
  type MemoryCitationRecord,
  type MemoryHub,
  type MemoryHubProject,
  type MemoryNarrativeCandidate,
  type MemoryNarrativeRecord,
  type MemoryRecord,
  type MemoryRelationCandidate,
  type MemoryRelationRecord,
  type MemoryUpdateCandidate,
  type ProjectBrief,
  type ProjectBriefItem,
  type ProjectRecord,
  type ProjectStory,
  type ProposalActor,
  type ProposalSubmissionResult,
  RELATION_TYPES,
  type RecallResult,
  type RelationDirection,
  type RelationType,
  type RelationView,
  type ReviewPolicy,
} from "./types.js";
import {
  buildGraphViewData,
  type KnowledgeGraph,
  renderGraphHtml,
  renderGraphMarkdown,
} from "./view.js";

const MAX_CANDIDATES = 20;
const MAX_UPDATE_CANDIDATES = 20;
const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 5000;
const MAX_SUMMARY_LENGTH = 300;
const MAX_TOPIC_LENGTH = 120;
const MAX_CITATIONS = 12;
const MAX_CITATION_LOCATOR_LENGTH = 240;
const MAX_CITATION_NOTE_LENGTH = 500;
const MAX_NARRATIVE_FIELD_LENGTH = 1600;
const MAX_OUTPUTS = 12;
const MAX_OUTPUT_LABEL_LENGTH = 240;
const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 50;
const MAX_RELATION_CANDIDATES = 40;
const MAX_RELATION_RATIONALE_LENGTH = 1000;
const MAX_GRAPH_NODES = 100;
const MAX_GRAPH_DEPTH = 5;
const MAX_PATH_DEPTH = 8;
const MAX_RECALL_LIMIT = 20;
const MAX_RECALL_RECOMMEND = 5;
const MAX_RETRIEVAL_BUDGET = 16000;
const MAX_GET_MEMORY_IDS = 20;

const SYMMETRIC_RELATION_TYPES = new Set<RelationType>(["related_to", "contradicts"]);
const RELATION_LABELS: Record<RelationType, string> = {
  related_to: "相关",
  observes: "注意到",
  causes: "原因",
  depends_on: "依赖",
  supports: "支持",
  contradicts: "矛盾",
  supersedes: "替代",
  derived_from: "来源于",
};

function desktopHubBriefItem(memory: MemoryRecord, briefRole: BriefRole): ProjectBriefItem {
  return {
    memoryId: memory.id,
    title: memory.title,
    displayTitle: buildMemoryDisplayTitle(memory),
    summary:
      memory.summary ?? memory.narrative?.conclusion ?? memory.content.slice(0, MAX_SUMMARY_LENGTH),
    topic: memory.topic,
    briefRole,
    roleSource: memory.briefRole ? "reviewed" : "inferred",
    stale: memory.stale,
    citationCount: memory.citations.length,
    updatedAt: memory.updatedAt,
    occurredAt: memory.narrative?.occurredAt ?? null,
    narrative: memory.narrative ?? null,
  };
}

export class ProjectMemoryService {
  private readonly denyPatterns: string[];
  private readonly reviewPolicy: ReviewPolicy;

  constructor(
    readonly store: MemoryStore,
    readonly dataDir: string,
  ) {
    const config = loadLocalConfig(dataDir);
    this.denyPatterns = config.denyPatterns;
    this.reviewPolicy = config.reviewPolicy;
  }

  private smartReviewReasons(
    projectId: string,
    candidates: PreparedCandidate[],
    updates: PreparedUpdateCandidate[],
    relations: PreparedRelationCandidate[],
    actor: ProposalActor,
  ): string[] {
    if (this.reviewPolicy === "manual") return ["manual_policy"];
    const reasons = new Set<string>();
    if (!["codex", "claude", "antigravity"].includes(actor.platform)) {
      reasons.add("untrusted_actor");
    }
    if (candidates.length === 0) reasons.add("no_new_memory");
    if (candidates.length > 5) reasons.add("large_proposal");
    if (updates.length > 0) reasons.add("updates_existing_memory");
    if (relations.some((relation) => "memoryId" in relation.from || "memoryId" in relation.to)) {
      reasons.add("links_existing_memory");
    }
    if (relations.some((relation) => relation.confidence === "inferred")) {
      reasons.add("inferred_relation");
    }
    for (const candidate of candidates) {
      if (candidate.confidence === "inferred") reasons.add("inferred_memory");
      if (candidate.sourceProjectId && candidate.sourceProjectId !== projectId) {
        reasons.add("cross_project_source");
      }
      if (candidate.citations.some((citation) => citation.sourceProjectId !== projectId)) {
        reasons.add("cross_project_citation");
      }
      if (
        ["architecture", "decision"].includes(candidate.kind) &&
        candidate.sourcePath === null &&
        candidate.citations.length === 0
      ) {
        reasons.add("ungrounded_high_impact_memory");
      }
    }
    return [...reasons];
  }

  detectProject(inputPath: string): DetectedProject {
    let metadata: GitMetadata;
    try {
      metadata = detectGitMetadata(inputPath);
    } catch (error) {
      throw new ProjectMemoryError("INVALID_INPUT", "Project path cannot be resolved.", {
        path: inputPath,
        cause: error instanceof Error ? error.message : String(error),
      });
    }

    const registeredProject = this.store.getProjectByPath(metadata.rootPath);
    const relocationCandidates = registeredProject
      ? []
      : this.store
          .findRelocationCandidates(metadata.gitCommonDir, metadata.remoteUrl)
          .filter((project) => project.primaryPath !== metadata.rootPath);

    return {
      requestedPath: inputPath,
      rootPath: metadata.rootPath,
      name: basename(metadata.rootPath),
      isGit: metadata.isGit,
      gitCommonDir: metadata.gitCommonDir,
      remoteUrl: metadata.remoteUrl,
      headCommit: metadata.headCommit,
      registeredProject: registeredProject
        ? (this.store.getProject(registeredProject.id) as ProjectRecord)
        : null,
      relocationCandidates,
    };
  }

  registerProject(inputPath: string, name?: string, relinkProjectId?: string): ProjectRecord {
    const detected = this.detectProject(inputPath);
    if (detected.registeredProject) {
      this.store.touchProject(
        detected.registeredProject.id,
        detected.rootPath,
        detected.headCommit,
      );
      return this.store.getProject(detected.registeredProject.id) as ProjectRecord;
    }
    if (detected.relocationCandidates.length > 0 && !relinkProjectId) {
      throw new ProjectMemoryError(
        "RELINK_CONFIRMATION_REQUIRED",
        "This path resembles an existing project. Confirm whether it should be relinked.",
        { candidates: detected.relocationCandidates },
      );
    }
    if (
      relinkProjectId &&
      !detected.relocationCandidates.some((candidate) => candidate.id === relinkProjectId)
    ) {
      throw new ProjectMemoryError("INVALID_INPUT", "Relink target is not a detected candidate.", {
        relinkProjectId,
      });
    }
    const projectName = (name ?? detected.name).trim();
    if (!projectName || projectName.length > 120) {
      throw new ProjectMemoryError("INVALID_INPUT", "Project name must be 1-120 characters.");
    }
    return this.store.registerProject({
      name: projectName,
      primaryPath: detected.rootPath,
      isGit: detected.isGit,
      gitCommonDir: detected.gitCommonDir,
      remoteUrl: detected.remoteUrl,
      headCommit: detected.headCommit,
      ...(relinkProjectId ? { relinkProjectId } : {}),
    });
  }

  projectStatus(projectId: string): Record<string, unknown> {
    const project = this.store.requireProject(projectId);
    const memories = this.getContext(projectId, 1000);
    let current: DetectedProject | null = null;
    try {
      current = this.detectProject(project.primaryPath);
    } catch {
      current = null;
    }
    return {
      project: this.store.getProject(projectId),
      links: this.store.listLinks(projectId),
      pathAvailable: current !== null,
      currentDetection: current,
      pendingProposals: this.store.countPendingProposals(projectId),
      memoryCount: memories.length,
      lastMemoryUpdatedAt: memories[0]?.updatedAt ?? null,
    };
  }

  linkProjects(sourceProjectId: string, targetProjectId: string): Record<string, unknown> {
    this.store.linkProjects(sourceProjectId, targetProjectId);
    return { sourceProjectId, targetProjectId, access: "read" };
  }

  unlinkProjects(sourceProjectId: string, targetProjectId: string): Record<string, unknown> {
    this.store.unlinkProjects(sourceProjectId, targetProjectId);
    return { sourceProjectId, targetProjectId, removed: true };
  }

  private requireReadAccess(sourceProjectId: string, targetProjectId: string): void {
    this.store.requireProject(sourceProjectId);
    this.store.requireProject(targetProjectId);
    if (!this.store.hasReadAccess(sourceProjectId, targetProjectId)) {
      throw new ProjectMemoryError(
        "LINK_REQUIRED",
        "A read-only project link is required before cross-project access.",
        { sourceProjectId, targetProjectId },
      );
    }
  }

  private enrichStaleness(memory: MemoryRecord): MemoryRecord {
    const storedCitations =
      memory.citations.length > 0 ? memory.citations : this.legacyCitation(memory);
    if (storedCitations.length === 0) return memory;
    const citations = storedCitations.map((citation) =>
      this.enrichCitation(memory.projectId, citation),
    );
    const staleCitation = citations.find((citation) => citation.stale);
    return {
      ...memory,
      citations,
      stale: Boolean(staleCitation),
      staleReason: staleCitation?.staleReason ?? null,
    };
  }

  private legacyCitation(memory: MemoryRecord): MemoryCitationRecord[] {
    if (!memory.sourceProjectId || !memory.sourcePath || !memory.sourceFileHash) return [];
    return [
      {
        sourceProjectId: memory.sourceProjectId,
        sourceProjectName: "",
        sourcePath: memory.sourcePath,
        role: "reference",
        locator: null,
        note: "由旧版 sourcePath 兼容生成",
        sourceCommit: memory.sourceCommit,
        sourceFileHash: memory.sourceFileHash,
        stale: false,
        staleReason: null,
        accessible: true,
        fileUrl: null,
      },
    ];
  }

  private enrichCitation(projectId: string, citation: MemoryCitationRecord): MemoryCitationRecord {
    const sourceProject = this.store.getProject(citation.sourceProjectId);
    if (!sourceProject) {
      return {
        ...citation,
        sourceProjectName: "未知项目",
        stale: true,
        staleReason: "source_project_missing",
        accessible: false,
        fileUrl: null,
      };
    }
    if (!this.store.hasReadAccess(projectId, citation.sourceProjectId)) {
      return {
        ...citation,
        sourceProjectName: sourceProject.name,
        stale: true,
        staleReason: "source_project_link_missing",
        accessible: false,
        fileUrl: null,
      };
    }
    try {
      const metadata = detectGitMetadata(sourceProject.primaryPath);
      const current = readProjectFile(
        metadata.rootPath,
        citation.sourcePath,
        metadata.headCommit,
        this.denyPatterns,
      );
      const stale = current.fileHash !== citation.sourceFileHash;
      return {
        ...citation,
        sourceProjectName: sourceProject.name,
        stale,
        staleReason: stale ? "source_file_changed" : null,
        accessible: true,
        fileUrl: pathToFileURL(path.resolve(metadata.rootPath, current.path)).href,
      };
    } catch {
      return {
        ...citation,
        sourceProjectName: sourceProject.name,
        stale: true,
        staleReason: "source_file_unavailable",
        accessible: true,
        fileUrl: null,
      };
    }
  }

  getContext(projectId: string, limit = 30): MemoryRecord[] {
    return this.store.getContext(projectId, limit).map((memory) => this.enrichStaleness(memory));
  }

  searchMemory(
    projectId: string,
    query: string,
    includeLinked = false,
    limit = 30,
  ): MemoryRecord[] {
    this.store.requireProject(projectId);
    const projectIds = [projectId];
    if (includeLinked) {
      projectIds.push(...this.store.listLinks(projectId).map((project) => project.id));
    }
    return this.store
      .searchMemories(projectIds, query, limit)
      .map((memory) => this.enrichStaleness(memory));
  }

  recallMemory(
    projectId: string,
    query: string | null,
    recent: boolean,
    includeLinked = false,
    limit = 8,
    recommend = 3,
    budgetTokens = 800,
  ): RecallResult {
    this.store.requireProject(projectId);
    const normalizedQuery = query?.trim() ?? "";
    if (recent === Boolean(normalizedQuery)) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        "Recall requires exactly one of --query TEXT or --recent true.",
      );
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_RECALL_LIMIT) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        `Recall limit must be between 1 and ${MAX_RECALL_LIMIT}.`,
      );
    }
    if (!Number.isInteger(recommend) || recommend < 1 || recommend > MAX_RECALL_RECOMMEND) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        `Recall recommendation count must be between 1 and ${MAX_RECALL_RECOMMEND}.`,
      );
    }
    this.validateRetrievalBudget(budgetTokens);
    const projectIds = [projectId];
    if (includeLinked) {
      projectIds.push(...this.store.listLinks(projectId).map((project) => project.id));
    }
    const memories = projectIds
      .flatMap((visibleProjectId) => this.store.getContext(visibleProjectId, 1000))
      .map((memory) => this.enrichStaleness(memory));
    return buildRecallResult({
      currentProjectId: projectId,
      memories,
      relations: this.visibleRelations(projectId, includeLinked),
      mode: recent ? "recent" : "query",
      query: recent ? null : normalizedQuery,
      limit,
      recommend,
      budgetTokens,
    });
  }

  getMemoriesById(
    projectId: string,
    memoryIds: string[],
    includeLinked = false,
    budgetTokens = 1700,
  ): GetMemoriesResult {
    this.store.requireProject(projectId);
    this.validateRetrievalBudget(budgetTokens);
    const uniqueIds = [...new Set(memoryIds.map((id) => id.trim()).filter(Boolean))];
    if (uniqueIds.length === 0 || uniqueIds.length > MAX_GET_MEMORY_IDS) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        `Get requires between 1 and ${MAX_GET_MEMORY_IDS} unique memory IDs.`,
      );
    }
    const memories = uniqueIds.map((memoryId) => {
      const memory = this.store.getMemory(memoryId);
      const accessible =
        memory &&
        (memory.projectId === projectId ||
          (includeLinked && this.store.hasReadAccess(projectId, memory.projectId)));
      if (!memory || !accessible) {
        throw new ProjectMemoryError(
          "INVALID_INPUT",
          "Memory does not exist or is not accessible from this project.",
          { memoryId },
        );
      }
      return this.enrichStaleness(memory);
    });
    return buildGetResult(memories, budgetTokens);
  }

  private validateRetrievalBudget(budgetTokens: number): void {
    if (
      !Number.isInteger(budgetTokens) ||
      budgetTokens < 1 ||
      budgetTokens > MAX_RETRIEVAL_BUDGET
    ) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        `Retrieval budget must be between 1 and ${MAX_RETRIEVAL_BUDGET} estimated tokens.`,
      );
    }
  }

  private prepareCitations(
    projectId: string,
    citations: MemoryCitationCandidate[],
  ): PreparedCitation[] {
    if (citations.length > MAX_CITATIONS) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        `A memory can contain at most ${MAX_CITATIONS} citations.`,
      );
    }
    const prepared = citations.map((citation) => {
      if (!CITATION_ROLES.includes(citation.role)) {
        throw new ProjectMemoryError("INVALID_INPUT", "Unsupported citation role.", {
          role: citation.role,
        });
      }
      const locator = citation.locator?.trim() || null;
      const note = citation.note?.trim() || null;
      if (locator && locator.length > MAX_CITATION_LOCATOR_LENGTH) {
        throw new ProjectMemoryError("INVALID_INPUT", "Citation locator is too long.");
      }
      if (note && note.length > MAX_CITATION_NOTE_LENGTH) {
        throw new ProjectMemoryError("INVALID_INPUT", "Citation note is too long.");
      }
      assertNoSecret(locator ?? "", "citation locator");
      assertNoSecret(note ?? "", "citation note");
      const sourceProjectId = citation.sourceProjectId ?? projectId;
      const sourceProject = this.store.requireProject(sourceProjectId);
      this.requireReadAccess(projectId, sourceProjectId);
      const metadata = detectGitMetadata(sourceProject.primaryPath);
      const source = readProjectFile(
        metadata.rootPath,
        citation.sourcePath,
        metadata.headCommit,
        this.denyPatterns,
      );
      return {
        sourceProjectId,
        sourcePath: source.path,
        role: citation.role,
        locator,
        note,
        sourceCommit: source.commit,
        sourceFileHash: source.fileHash,
      };
    });
    const keys = prepared.map(
      (citation) =>
        `${citation.sourceProjectId}:${citation.sourcePath}:${citation.role}:${citation.locator ?? ""}`,
    );
    if (new Set(keys).size !== keys.length) {
      throw new ProjectMemoryError("INVALID_INPUT", "Duplicate memory citation.");
    }
    return prepared;
  }

  private prepareNarrative(
    projectId: string,
    candidate: MemoryNarrativeCandidate | undefined,
    citations: PreparedCitation[],
    required: boolean,
  ): MemoryNarrativeRecord | null {
    if (!candidate) {
      if (required) {
        throw new ProjectMemoryError(
          "INVALID_INPUT",
          "A non-reference memory with a brief role must include a complete narrative.",
        );
      }
      return null;
    }
    const occurredAt = candidate.occurredAt?.trim();
    const fields = [
      candidate.reason,
      candidate.action,
      candidate.outcome,
      candidate.conclusion,
    ].map((value) => value?.trim());
    const occurredAtTimestamp = occurredAt ? Date.parse(occurredAt) : Number.NaN;
    if (
      !occurredAt ||
      Number.isNaN(occurredAtTimestamp) ||
      fields.some((value) => !value || value.length > MAX_NARRATIVE_FIELD_LENGTH)
    ) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        "Narrative requires a valid occurredAt and concise reason, action, outcome, and conclusion.",
      );
    }
    if (occurredAtTimestamp > Date.now()) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        "Narrative occurredAt cannot be in the future.",
      );
    }
    assertNoSecret([occurredAt, ...fields].join(" "), "memory narrative");
    const outputs = candidate.outputs ?? [];
    if (outputs.length > MAX_OUTPUTS) {
      throw new ProjectMemoryError("INVALID_INPUT", "Too many narrative outputs.");
    }
    const seen = new Set<string>();
    const preparedOutputs = outputs.map((output) => {
      const sourceProjectId = output.sourceProjectId ?? projectId;
      const citation = citations.find(
        (item) => item.sourceProjectId === sourceProjectId && item.sourcePath === output.sourcePath,
      );
      if (!citation) {
        throw new ProjectMemoryError(
          "INVALID_INPUT",
          "Every narrative output must point to a verified citation in the same memory.",
          { sourceProjectId, sourcePath: output.sourcePath },
        );
      }
      const label = output.label?.trim() || null;
      if (label && label.length > MAX_OUTPUT_LABEL_LENGTH) {
        throw new ProjectMemoryError("INVALID_INPUT", "Narrative output label is too long.");
      }
      assertNoSecret(label ?? "", "narrative output label");
      const key = `${citation.sourceProjectId}:${citation.sourcePath}`;
      if (seen.has(key)) {
        throw new ProjectMemoryError("INVALID_INPUT", "Duplicate narrative output.");
      }
      seen.add(key);
      return {
        sourceProjectId: citation.sourceProjectId,
        sourcePath: citation.sourcePath,
        role: citation.role,
        label,
      };
    });
    return {
      occurredAt: new Date(occurredAtTimestamp).toISOString(),
      reason: fields[0] as string,
      action: fields[1] as string,
      outcome: fields[2] as string,
      conclusion: fields[3] as string,
      outputs: preparedOutputs,
    };
  }

  private prepareCandidate(projectId: string, candidate: MemoryCandidate): PreparedCandidate {
    if (!MEMORY_KINDS.includes(candidate.kind)) {
      throw new ProjectMemoryError("INVALID_INPUT", "Unsupported memory kind.", {
        kind: candidate.kind,
      });
    }
    const title = candidate.title.trim();
    const content = candidate.content.trim();
    const summary = candidate.summary?.trim() || null;
    const topic = candidate.topic?.trim() || null;
    const briefRole = candidate.briefRole ?? null;
    const workUnitId = candidate.workUnitId?.trim() || null;
    const runId = candidate.runId?.trim() || null;
    const phase = candidate.phase ?? null;
    const sequence = candidate.sequence ?? null;
    if (briefRole && !BRIEF_ROLES.includes(briefRole)) {
      throw new ProjectMemoryError("INVALID_INPUT", "Unsupported project brief role.", {
        briefRole,
      });
    }
    if (phase && !MEMORY_PHASES.includes(phase)) {
      throw new ProjectMemoryError("INVALID_INPUT", "Unsupported memory phase.", { phase });
    }
    if (sequence !== null && (!Number.isInteger(sequence) || sequence < 1)) {
      throw new ProjectMemoryError("INVALID_INPUT", "Memory sequence must be a positive integer.");
    }
    for (const [value, label] of [
      [workUnitId, "work unit id"],
      [runId, "run id"],
    ] as const) {
      if (value && value.length > 200) {
        throw new ProjectMemoryError("INVALID_INPUT", `${label} is too long.`);
      }
    }
    const tags = [...new Set((candidate.tags ?? []).map((tag) => tag.trim()).filter(Boolean))];
    if (!title || title.length > MAX_TITLE_LENGTH) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        `Title must be 1-${MAX_TITLE_LENGTH} characters.`,
      );
    }
    if (!content || content.length > MAX_CONTENT_LENGTH) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        `Content must be 1-${MAX_CONTENT_LENGTH} characters.`,
      );
    }
    if (summary && summary.length > MAX_SUMMARY_LENGTH) {
      throw new ProjectMemoryError("INVALID_INPUT", "Memory summary is too long.");
    }
    if (topic && topic.length > MAX_TOPIC_LENGTH) {
      throw new ProjectMemoryError("INVALID_INPUT", "Memory topic is too long.");
    }
    if (tags.length > MAX_TAGS || tags.some((tag) => tag.length > MAX_TAG_LENGTH)) {
      throw new ProjectMemoryError("INVALID_INPUT", "Too many tags or tag is too long.");
    }
    assertNoSecret(title, "memory title");
    assertNoSecret(content, "memory content");
    assertNoSecret(summary ?? "", "memory summary");
    assertNoSecret(topic ?? "", "memory topic");
    assertNoSecret(tags.join(" "), "memory tags");
    const ref = candidate.ref?.trim();
    if (ref && !/^[A-Za-z0-9._:-]{1,80}$/.test(ref)) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        "Memory candidate ref must use 1-80 letters, numbers, dots, underscores, colons, or hyphens.",
      );
    }

    const sourceProjectId = candidate.sourceProjectId ?? projectId;
    const sourceProject = this.store.requireProject(sourceProjectId);
    this.requireReadAccess(projectId, sourceProjectId);
    let sourceCommit = sourceProject.headCommit;
    let sourceFileHash: string | null = null;
    let sourcePath: string | null = null;

    if (candidate.sourcePath) {
      const metadata = detectGitMetadata(sourceProject.primaryPath);
      const source = readProjectFile(
        metadata.rootPath,
        candidate.sourcePath,
        metadata.headCommit,
        this.denyPatterns,
      );
      sourceCommit = source.commit;
      sourceFileHash = source.fileHash;
      sourcePath = source.path;
    }

    const citations = this.prepareCitations(projectId, candidate.citations ?? []);
    const narrative = this.prepareNarrative(
      projectId,
      candidate.narrative,
      citations,
      briefRole !== null && briefRole !== "reference",
    );

    return {
      ...candidate,
      ...(ref ? { ref } : {}),
      title,
      summary,
      topic,
      briefRole,
      workUnitId,
      runId,
      phase,
      sequence,
      content,
      tags,
      sourceProjectId,
      sourcePath,
      sourceCommit,
      sourceFileHash,
      citations,
      narrative,
      confidence: candidate.confidence ?? "observed",
    };
  }

  private prepareUpdateCandidate(
    projectId: string,
    candidate: MemoryUpdateCandidate,
  ): PreparedUpdateCandidate {
    const memory = this.store.getMemory(candidate.memoryId);
    if (!memory || memory.projectId !== projectId) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        "Memory updates can target only an existing memory in the current project.",
        { memoryId: candidate.memoryId },
      );
    }
    if (
      candidate.summary === undefined &&
      candidate.topic === undefined &&
      candidate.briefRole === undefined &&
      candidate.workUnitId === undefined &&
      candidate.runId === undefined &&
      candidate.phase === undefined &&
      candidate.sequence === undefined &&
      candidate.narrative === undefined &&
      candidate.citations === undefined
    ) {
      throw new ProjectMemoryError("INVALID_INPUT", "Memory update has no enrichment fields.");
    }
    const summary = candidate.summary?.trim();
    const topic = candidate.topic?.trim();
    const briefRole = candidate.briefRole;
    const workUnitId = candidate.workUnitId?.trim();
    const runId = candidate.runId?.trim();
    const phase = candidate.phase;
    const sequence = candidate.sequence;
    if (briefRole !== undefined && !BRIEF_ROLES.includes(briefRole)) {
      throw new ProjectMemoryError("INVALID_INPUT", "Unsupported project brief role.", {
        briefRole,
      });
    }
    if (phase !== undefined && !MEMORY_PHASES.includes(phase)) {
      throw new ProjectMemoryError("INVALID_INPUT", "Unsupported memory phase.", { phase });
    }
    if (sequence !== undefined && (!Number.isInteger(sequence) || sequence < 1)) {
      throw new ProjectMemoryError("INVALID_INPUT", "Memory sequence must be a positive integer.");
    }
    if (workUnitId !== undefined && (!workUnitId || workUnitId.length > 200)) {
      throw new ProjectMemoryError("INVALID_INPUT", "Work unit id must be non-empty and concise.");
    }
    if (runId !== undefined && (!runId || runId.length > 200)) {
      throw new ProjectMemoryError("INVALID_INPUT", "Run id must be non-empty and concise.");
    }
    if (summary !== undefined && (!summary || summary.length > MAX_SUMMARY_LENGTH)) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        "Memory summary must be non-empty and concise.",
      );
    }
    if (topic !== undefined && (!topic || topic.length > MAX_TOPIC_LENGTH)) {
      throw new ProjectMemoryError("INVALID_INPUT", "Memory topic must be non-empty and concise.");
    }
    assertNoSecret(summary ?? "", "memory summary");
    assertNoSecret(topic ?? "", "memory topic");
    const citations =
      candidate.citations !== undefined
        ? this.prepareCitations(projectId, candidate.citations)
        : memory.citations.map((citation) => ({
            sourceProjectId: citation.sourceProjectId,
            sourcePath: citation.sourcePath,
            role: citation.role,
            locator: citation.locator,
            note: citation.note,
            sourceCommit: citation.sourceCommit,
            sourceFileHash: citation.sourceFileHash,
          }));
    const narrative =
      candidate.narrative === undefined
        ? undefined
        : this.prepareNarrative(projectId, candidate.narrative, citations, false);
    return {
      memoryId: memory.id,
      ...(summary !== undefined ? { summary } : {}),
      ...(topic !== undefined ? { topic } : {}),
      ...(briefRole !== undefined ? { briefRole: briefRole as BriefRole } : {}),
      ...(workUnitId !== undefined ? { workUnitId } : {}),
      ...(runId !== undefined ? { runId } : {}),
      ...(phase !== undefined ? { phase } : {}),
      ...(sequence !== undefined ? { sequence } : {}),
      ...(narrative !== undefined ? { narrative: narrative as MemoryNarrativeRecord } : {}),
      ...(candidate.citations !== undefined ? { citations } : {}),
    };
  }

  private prepareRelationCandidate(
    projectId: string,
    candidateRefs: Set<string>,
    candidate: MemoryRelationCandidate,
  ): PreparedRelationCandidate {
    if (!RELATION_TYPES.includes(candidate.type)) {
      throw new ProjectMemoryError("INVALID_INPUT", "Unsupported memory relation type.", {
        type: candidate.type,
      });
    }
    const rationale = candidate.rationale.trim();
    if (!rationale || rationale.length > MAX_RELATION_RATIONALE_LENGTH) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        `Relation rationale must be 1-${MAX_RELATION_RATIONALE_LENGTH} characters.`,
      );
    }
    assertNoSecret(rationale, "relation rationale");

    const endpointKey = (endpoint: MemoryRelationCandidate["from"]): string => {
      const memoryId = "memoryId" in endpoint ? endpoint.memoryId : undefined;
      const candidateRef = "candidateRef" in endpoint ? endpoint.candidateRef : undefined;
      if (Boolean(memoryId) === Boolean(candidateRef)) {
        throw new ProjectMemoryError(
          "INVALID_INPUT",
          "Relation endpoint must contain exactly one of memoryId or candidateRef.",
        );
      }
      if (memoryId) {
        const memory = this.store.getMemory(memoryId);
        if (!memory) {
          throw new ProjectMemoryError(
            "INVALID_INPUT",
            "Relation memory endpoint does not exist.",
            {
              memoryId,
            },
          );
        }
        this.requireReadAccess(projectId, memory.projectId);
        return `memory:${memory.id}`;
      }
      if (!candidateRefs.has(candidateRef as string)) {
        throw new ProjectMemoryError(
          "INVALID_INPUT",
          "Relation candidateRef must match a unique memory candidate ref in the same proposal.",
          { candidateRef },
        );
      }
      return `candidate:${candidateRef}`;
    };

    const fromKey = endpointKey(candidate.from);
    const toKey = endpointKey(candidate.to);
    if (fromKey === toKey) {
      throw new ProjectMemoryError("INVALID_INPUT", "A memory cannot relate to itself.");
    }
    const endpointProjectId = (endpoint: MemoryRelationCandidate["from"]): string => {
      if ("candidateRef" in endpoint && endpoint.candidateRef) return projectId;
      if (!("memoryId" in endpoint) || !endpoint.memoryId) {
        throw new ProjectMemoryError(
          "INVALID_INPUT",
          "Relation endpoint must contain memoryId or candidateRef.",
        );
      }
      return (this.store.getMemory(endpoint.memoryId) as MemoryRecord).projectId;
    };
    const fromProjectId = endpointProjectId(candidate.from);
    const toProjectId = endpointProjectId(candidate.to);
    if (fromProjectId !== projectId && toProjectId !== projectId) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        "At least one relation endpoint must belong to the current project.",
      );
    }

    return {
      ...candidate,
      rationale,
      confidence: candidate.confidence ?? "inferred",
    };
  }

  private assertWorkUnitRelationCoverage(
    candidates: PreparedCandidate[],
    relations: PreparedRelationCandidate[],
  ): void {
    const groups = new Map<string, PreparedCandidate[]>();
    for (const candidate of candidates) {
      if (!candidate.workUnitId || candidate.briefRole === "reference") continue;
      groups.set(candidate.workUnitId, [...(groups.get(candidate.workUnitId) ?? []), candidate]);
    }

    const relatedRefs = new Set<string>();
    for (const relation of relations) {
      for (const endpoint of [relation.from, relation.to]) {
        if ("candidateRef" in endpoint && endpoint.candidateRef) {
          relatedRefs.add(endpoint.candidateRef);
        }
      }
    }

    for (const [workUnitId, events] of groups) {
      if (events.length < 2) continue;
      const missingRefs = events.filter((event) => !event.ref);
      if (missingRefs.length > 0) {
        throw new ProjectMemoryError(
          "INVALID_INPUT",
          "Every event in a multi-event work unit must define a candidate ref so relations can be reviewed.",
          { workUnitId, titles: missingRefs.map((event) => event.title) },
        );
      }
      const unconnected = events.filter((event) => !relatedRefs.has(event.ref as string));
      if (unconnected.length > 0) {
        throw new ProjectMemoryError(
          "INVALID_INPUT",
          "Every event in a multi-event work unit must participate in at least one proposed relation.",
          { workUnitId, refs: unconnected.map((event) => event.ref) },
        );
      }
    }
  }

  proposeMemory(
    projectId: string,
    candidates: MemoryCandidate[],
    relations: MemoryRelationCandidate[] = [],
    updates: MemoryUpdateCandidate[] = [],
    actor: ProposalActor = { platform: "codex", adapterVersion: null },
  ): ProposalSubmissionResult {
    this.store.requireProject(projectId);
    const rawPlatform = actor.platform.trim();
    const platform = ["claude", "claude-code"].includes(rawPlatform.toLocaleLowerCase())
      ? "claude"
      : rawPlatform;
    if (!platform || platform.length > 80 || platform.toLocaleLowerCase() === "generic") {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        "Proposal submissions must identify a specific agent; generic is not a valid source.",
      );
    }
    if (actor.adapterVersion !== null && actor.adapterVersion.length > 120) {
      throw new ProjectMemoryError("INVALID_INPUT", "Proposal adapter version is invalid.");
    }
    if (
      candidates.length + updates.length + relations.length === 0 ||
      candidates.length > MAX_CANDIDATES ||
      updates.length > MAX_UPDATE_CANDIDATES ||
      relations.length > MAX_RELATION_CANDIDATES
    ) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        `A proposal must contain memory, update, or relation candidates, with at most ${MAX_CANDIDATES} memories, ${MAX_UPDATE_CANDIDATES} updates, and ${MAX_RELATION_CANDIDATES} relations.`,
      );
    }
    const prepared = candidates.map((candidate) => this.prepareCandidate(projectId, candidate));
    const refs = prepared
      .map((candidate) => candidate.ref)
      .filter((ref): ref is string => Boolean(ref));
    if (new Set(refs).size !== refs.length) {
      throw new ProjectMemoryError("INVALID_INPUT", "Memory candidate refs must be unique.");
    }
    const preparedRelations = relations.map((candidate) =>
      this.prepareRelationCandidate(projectId, new Set(refs), candidate),
    );
    this.assertWorkUnitRelationCoverage(prepared, preparedRelations);
    const preparedUpdates = updates.map((candidate) =>
      this.prepareUpdateCandidate(projectId, candidate),
    );
    const proposal = this.store.createProposal(
      projectId,
      prepared,
      preparedUpdates,
      preparedRelations,
      {
        platform,
        adapterVersion: actor.adapterVersion,
      },
    );
    const normalizedActor = { platform, adapterVersion: actor.adapterVersion };
    const reasons = this.smartReviewReasons(
      projectId,
      prepared,
      preparedUpdates,
      preparedRelations,
      normalizedActor,
    );
    if (reasons.length > 0) {
      return {
        ...proposal,
        autoReview: {
          policy: this.reviewPolicy,
          outcome: "pending",
          reasons,
          committedMemoryIds: [],
          committedUpdateIds: [],
          committedRelationIds: [],
        },
      };
    }
    try {
      const committed = this.commitMemory(
        proposal.id,
        proposal.items.map((item) => item.id),
        proposal.relationItems.map((item) => item.id),
        proposal.updateItems.map((item) => item.id),
      );
      const reviewedProposal = this.store.getProposal(proposal.id) ?? proposal;
      return {
        ...reviewedProposal,
        autoReview: {
          policy: this.reviewPolicy,
          outcome: "auto_committed",
          reasons: [],
          committedMemoryIds: committed.memories.map((memory) => memory.id),
          committedUpdateIds: committed.updatedMemories.map((memory) => memory.id),
          committedRelationIds: committed.relations.map((relation) => relation.id),
        },
      };
    } catch (error) {
      if (
        error instanceof ProjectMemoryError &&
        ["STALE_SOURCE", "REVISION_CONFLICT", "PROJECT_LOCKED"].includes(error.code)
      ) {
        return {
          ...proposal,
          autoReview: {
            policy: this.reviewPolicy,
            outcome: "pending",
            reasons: [`commit_${error.code.toLocaleLowerCase()}`],
            committedMemoryIds: [],
            committedUpdateIds: [],
            committedRelationIds: [],
          },
        };
      }
      throw error;
    }
  }

  commitMemory(
    proposalId: string,
    acceptedItemIds: string[],
    acceptedRelationIds: string[] = [],
    acceptedUpdateIds: string[] = [],
    refreshSources = false,
  ): ProposalCommitResult {
    const proposal = this.store.getProposal(proposalId);
    if (!proposal) {
      throw new ProjectMemoryError("PROPOSAL_NOT_PENDING", "Proposal is not pending.", {
        proposalId,
      });
    }
    const checks = this.store.getProposalSourceChecks(
      proposalId,
      acceptedItemIds,
      acceptedUpdateIds,
    );
    if (refreshSources) {
      const refreshedChecks = this.readCurrentProposalSources(
        proposalId,
        proposal.projectId,
        checks,
        true,
      );
      this.store.refreshProposalSources(proposalId, refreshedChecks);
    } else {
      this.validateProposalSources(proposalId, proposal.projectId, checks);
    }
    const result = this.store.commitProposal(
      proposalId,
      acceptedItemIds,
      acceptedUpdateIds,
      acceptedRelationIds,
    );
    return {
      ...result,
      memories: result.memories.map((memory) => this.enrichStaleness(memory)),
      updatedMemories: result.updatedMemories.map((memory) => this.enrichStaleness(memory)),
    };
  }

  refreshProposalSources(
    proposalId: string,
    acceptedItemIds: string[],
    acceptedUpdateIds: string[],
  ): ProposalSourceRefreshResult {
    const proposal = this.store.getProposal(proposalId);
    if (!proposal) {
      throw new ProjectMemoryError("PROPOSAL_NOT_PENDING", "Proposal is not pending.", {
        proposalId,
      });
    }
    const checks = this.store.getProposalSourceChecks(
      proposalId,
      acceptedItemIds,
      acceptedUpdateIds,
    );
    const refreshedChecks = this.readCurrentProposalSources(
      proposalId,
      proposal.projectId,
      checks,
      true,
    );
    return this.store.refreshProposalSources(proposalId, refreshedChecks);
  }

  private validateProposalSources(
    proposalId: string,
    projectId: string,
    checks: ProposalSourceCheck[],
  ): void {
    this.readCurrentProposalSources(proposalId, projectId, checks, false);
  }

  private readCurrentProposalSources(
    proposalId: string,
    projectId: string,
    checks: ProposalSourceCheck[],
    allowChanges: boolean,
  ): ProposalSourceCheck[] {
    const refreshedChecks: ProposalSourceCheck[] = [];
    for (const check of checks) {
      this.requireReadAccess(projectId, check.sourceProjectId);
      const sourceProject = this.store.requireProject(check.sourceProjectId);
      const metadata = detectGitMetadata(sourceProject.primaryPath);
      const current = readProjectFile(
        metadata.rootPath,
        check.sourcePath,
        metadata.headCommit,
        this.denyPatterns,
      );
      if (!allowChanges && current.fileHash !== check.sourceFileHash) {
        throw new ProjectMemoryError(
          "STALE_SOURCE",
          "A proposal source changed after review was prepared.",
          { proposalId, itemId: check.itemId, sourcePath: check.sourcePath },
        );
      }
      refreshedChecks.push({ ...check, sourceFileHash: current.fileHash });
    }
    return refreshedChecks;
  }

  rejectMemory(proposalId: string): unknown {
    return this.store.rejectProposal(proposalId);
  }

  private requireGraphMemoryAccess(
    projectId: string,
    memoryId: string,
    includeLinked: boolean,
  ): MemoryRecord {
    const memory = this.store.getMemory(memoryId);
    if (!memory) {
      throw new ProjectMemoryError("INVALID_INPUT", "Memory does not exist.", { memoryId });
    }
    if (memory.projectId !== projectId) {
      if (!includeLinked) {
        throw new ProjectMemoryError(
          "LINK_REQUIRED",
          "Use --include-linked true to access a linked-project memory.",
          { memoryId, projectId: memory.projectId },
        );
      }
      this.requireReadAccess(projectId, memory.projectId);
    }
    return this.enrichStaleness(memory);
  }

  private visibleRelations(projectId: string, includeLinked: boolean): MemoryRelationRecord[] {
    const ownerProjectIds = includeLinked
      ? [projectId, ...this.store.listLinks(projectId).map((project) => project.id)]
      : [projectId];
    return ownerProjectIds
      .flatMap((ownerProjectId) => this.store.getRelations(ownerProjectId))
      .filter((relation) => {
        const foreignProjectIds = new Set(
          [relation.fromProjectId, relation.toProjectId].filter((id) => id !== projectId),
        );
        if (foreignProjectIds.size === 0) return true;
        if (!includeLinked) return false;
        return [...foreignProjectIds].every((id) => this.store.hasReadAccess(projectId, id));
      });
  }

  private relationView(relation: MemoryRelationRecord): RelationView | null {
    const fromMemory = this.store.getMemory(relation.fromMemoryId);
    const toMemory = this.store.getMemory(relation.toMemoryId);
    if (!fromMemory || !toMemory) return null;
    const enrichedFrom = this.enrichStaleness(fromMemory);
    const enrichedTo = this.enrichStaleness(toMemory);
    return {
      ...relation,
      fromMemory: enrichedFrom,
      toMemory: enrichedTo,
      suspended: false,
      stale: enrichedFrom.stale || enrichedTo.stale,
    };
  }

  listMemoryRelations(
    projectId: string,
    memoryId: string,
    direction: RelationDirection = "both",
    types: RelationType[] = [],
    includeLinked = false,
  ): Record<string, unknown> {
    const memory = this.requireGraphMemoryAccess(projectId, memoryId, includeLinked);
    if (types.some((type) => !RELATION_TYPES.includes(type))) {
      throw new ProjectMemoryError("INVALID_INPUT", "Unsupported relation type filter.", { types });
    }
    const selectedTypes = new Set(types);
    const relations = this.visibleRelations(projectId, includeLinked)
      .filter((relation) => selectedTypes.size === 0 || selectedTypes.has(relation.type))
      .filter((relation) => {
        if (SYMMETRIC_RELATION_TYPES.has(relation.type)) {
          return relation.fromMemoryId === memoryId || relation.toMemoryId === memoryId;
        }
        if (direction === "out") return relation.fromMemoryId === memoryId;
        if (direction === "in") return relation.toMemoryId === memoryId;
        return relation.fromMemoryId === memoryId || relation.toMemoryId === memoryId;
      })
      .map((relation) => this.relationView(relation))
      .filter((relation): relation is RelationView => Boolean(relation));
    return { memory, direction, relations };
  }

  findRelationPath(
    projectId: string,
    fromMemoryId: string,
    toMemoryId: string,
    maxDepth = 4,
    includeLinked = false,
  ): Record<string, unknown> {
    if (!Number.isInteger(maxDepth) || maxDepth < 1 || maxDepth > MAX_PATH_DEPTH) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        `Path max depth must be between 1 and ${MAX_PATH_DEPTH}.`,
      );
    }
    const fromMemory = this.requireGraphMemoryAccess(projectId, fromMemoryId, includeLinked);
    const toMemory = this.requireGraphMemoryAccess(projectId, toMemoryId, includeLinked);
    const relations = this.visibleRelations(projectId, includeLinked);
    const adjacency = new Map<string, Array<{ nextId: string; relation: MemoryRelationRecord }>>();
    const add = (from: string, nextId: string, relation: MemoryRelationRecord): void => {
      const entries = adjacency.get(from) ?? [];
      entries.push({ nextId, relation });
      adjacency.set(from, entries);
    };
    for (const relation of relations) {
      add(relation.fromMemoryId, relation.toMemoryId, relation);
      if (SYMMETRIC_RELATION_TYPES.has(relation.type)) {
        add(relation.toMemoryId, relation.fromMemoryId, relation);
      }
    }

    const queue: Array<{ memoryId: string; depth: number }> = [
      { memoryId: fromMemoryId, depth: 0 },
    ];
    const visited = new Set([fromMemoryId]);
    const previous = new Map<string, { memoryId: string; relation: MemoryRelationRecord }>();
    while (queue.length > 0) {
      const current = queue.shift() as { memoryId: string; depth: number };
      if (current.memoryId === toMemoryId) break;
      if (current.depth >= maxDepth) continue;
      for (const edge of adjacency.get(current.memoryId) ?? []) {
        if (visited.has(edge.nextId)) continue;
        visited.add(edge.nextId);
        previous.set(edge.nextId, { memoryId: current.memoryId, relation: edge.relation });
        queue.push({ memoryId: edge.nextId, depth: current.depth + 1 });
      }
    }

    if (!visited.has(toMemoryId)) {
      return { found: false, fromMemory, toMemory, nodes: [], relations: [] };
    }
    const memoryIds = [toMemoryId];
    const pathRelations: MemoryRelationRecord[] = [];
    let cursor = toMemoryId;
    while (cursor !== fromMemoryId) {
      const step = previous.get(cursor);
      if (!step) break;
      pathRelations.push(step.relation);
      cursor = step.memoryId;
      memoryIds.push(cursor);
    }
    memoryIds.reverse();
    pathRelations.reverse();
    return {
      found: true,
      fromMemory,
      toMemory,
      nodes: memoryIds
        .map((id) => this.store.getMemory(id))
        .filter((memory): memory is MemoryRecord => Boolean(memory))
        .map((memory) => this.enrichStaleness(memory)),
      relations: pathRelations,
    };
  }

  buildGraph(
    projectId: string,
    memoryId: string | null,
    depth = 1,
    includeLinked = false,
  ): { nodes: MemoryRecord[]; relations: MemoryRelationRecord[] } {
    if (!Number.isInteger(depth) || depth < 1 || depth > MAX_GRAPH_DEPTH) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        `Graph depth must be between 1 and ${MAX_GRAPH_DEPTH}.`,
      );
    }
    this.store.requireProject(projectId);
    const visibleRelations = this.visibleRelations(projectId, includeLinked);
    const selectedMemoryIds = new Set<string>();
    const selectedRelationIds = new Set<string>();
    const queue: Array<{ memoryId: string; depth: number }> = [];
    if (memoryId) {
      this.requireGraphMemoryAccess(projectId, memoryId, includeLinked);
      selectedMemoryIds.add(memoryId);
      queue.push({ memoryId, depth: 0 });
    } else {
      for (const memory of this.store.getContext(projectId, MAX_GRAPH_NODES)) {
        selectedMemoryIds.add(memory.id);
        queue.push({ memoryId: memory.id, depth: 0 });
      }
    }
    while (queue.length > 0 && selectedMemoryIds.size < MAX_GRAPH_NODES) {
      const current = queue.shift() as { memoryId: string; depth: number };
      if (current.depth >= depth) continue;
      for (const relation of visibleRelations) {
        let nextId: string | null = null;
        if (relation.fromMemoryId === current.memoryId) nextId = relation.toMemoryId;
        else if (relation.toMemoryId === current.memoryId) nextId = relation.fromMemoryId;
        if (!nextId) continue;
        selectedRelationIds.add(relation.id);
        if (!selectedMemoryIds.has(nextId) && selectedMemoryIds.size < MAX_GRAPH_NODES) {
          selectedMemoryIds.add(nextId);
          queue.push({ memoryId: nextId, depth: current.depth + 1 });
        }
      }
    }
    if (!memoryId) {
      for (const relation of visibleRelations) {
        if (
          selectedMemoryIds.has(relation.fromMemoryId) &&
          selectedMemoryIds.has(relation.toMemoryId)
        ) {
          selectedRelationIds.add(relation.id);
        }
      }
    }
    const nodes = [...selectedMemoryIds]
      .map((id) => this.store.getMemory(id))
      .filter((memory): memory is MemoryRecord => Boolean(memory))
      .map((memory) => this.enrichStaleness(memory));
    const nodeIds = new Set(nodes.map((memory) => memory.id));
    const relations = visibleRelations.filter(
      (relation) =>
        selectedRelationIds.has(relation.id) &&
        nodeIds.has(relation.fromMemoryId) &&
        nodeIds.has(relation.toMemoryId),
    );
    return { nodes, relations };
  }

  renderGraphMermaid(graph: { nodes: MemoryRecord[]; relations: MemoryRelationRecord[] }): string {
    const nodeId = (id: string): string => `m_${id.replaceAll("-", "_")}`;
    const escapeLabel = (value: string): string =>
      value.replaceAll("\\", "\\\\").replaceAll('"', "'").replaceAll(/\r?\n/g, " ");
    const lines = ["graph TD"];
    for (const memory of graph.nodes) {
      const stale = memory.stale ? " [已过期]" : "";
      lines.push(
        `  ${nodeId(memory.id)}["${escapeLabel(`${memory.projectName}: ${buildMemoryDisplayTitle(memory)}${stale}`)}"]`,
      );
    }
    for (const relation of graph.relations) {
      const connector = SYMMETRIC_RELATION_TYPES.has(relation.type) ? "---" : "-->";
      lines.push(
        `  ${nodeId(relation.fromMemoryId)} ${connector}|${RELATION_LABELS[relation.type]}| ${nodeId(relation.toMemoryId)}`,
      );
    }
    return `${lines.join("\n")}\n`;
  }

  renderGraphMarkdown(projectId: string, graph: KnowledgeGraph): string {
    const project = this.store.requireProject(projectId);
    const generatedAt = new Date().toISOString();
    const guide = this.buildGraphGuide(projectId, graph, 12, generatedAt);
    const brief = this.buildProjectBrief(projectId, graph, 12, generatedAt, guide);
    return renderGraphMarkdown(project.name, graph, generatedAt, guide, brief);
  }

  buildGraphGuide(
    projectId: string,
    graph: KnowledgeGraph,
    limit = 12,
    generatedAt = new Date().toISOString(),
  ): GraphGuide {
    const project = this.store.requireProject(projectId);
    return analyzeKnowledgeGraph(projectId, project.name, graph, generatedAt, limit);
  }

  buildProjectBrief(
    projectId: string,
    graph: KnowledgeGraph,
    limit = 12,
    generatedAt = new Date().toISOString(),
    providedGuide?: GraphGuide,
  ): ProjectBrief {
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_GRAPH_NODES) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        `Project brief limit must be between 1 and ${MAX_GRAPH_NODES}.`,
      );
    }
    const project = this.store.requireProject(projectId);
    const guide =
      providedGuide ?? this.buildGraphGuide(projectId, graph, Math.min(limit, 12), generatedAt);
    return buildProjectBrief(projectId, project.name, graph, guide, generatedAt, limit);
  }

  buildProjectStory(
    projectId: string,
    graph?: KnowledgeGraph,
    generatedAt = new Date().toISOString(),
  ): ProjectStory {
    const projectGraph = graph ?? this.buildGraph(projectId, null, 1, false);
    const guide = this.buildGraphGuide(projectId, projectGraph, 12, generatedAt);
    const brief = this.buildProjectBrief(
      projectId,
      projectGraph,
      MAX_GRAPH_NODES,
      generatedAt,
      guide,
    );
    const memoryById = new Map(projectGraph.nodes.map((memory) => [memory.id, memory]));
    const sentence = (relation: MemoryRelationRecord): string => {
      const fromMemory = memoryById.get(relation.fromMemoryId);
      const toMemory = memoryById.get(relation.toMemoryId);
      const from = `《${fromMemory ? buildMemoryDisplayTitle(fromMemory) : "未找到的记录"}》`;
      const to = `《${toMemory ? buildMemoryDisplayTitle(toMemory) : "未找到的记录"}》`;
      switch (relation.type) {
        case "observes":
          return `${from}在执行过程中注意到${to}。`;
        case "causes":
          return `${from}是促成${to}的原因。`;
        case "depends_on":
          return `${from}需要先参考${to}。`;
        case "supports":
          return `${from}为${to}提供了支持。`;
        case "contradicts":
          return `${from}与${to}存在不一致，需要重新核对。`;
        case "supersedes":
          return `${from}更新并替代了${to}。`;
        case "derived_from":
          return `${from}是根据${to}整理出来的。`;
        default:
          return `${from}与${to}记录的是相互关联的工作。`;
      }
    };
    return {
      protocolVersion: 1,
      projectId,
      projectName: brief.projectName,
      generatedAt,
      overview: brief.handoff.coverage,
      startHere: brief.handoff.startHere,
      timeline: brief.handoff.history,
      currentConclusions: brief.currentConclusions,
      risks: brief.risks,
      nextSteps: brief.nextSteps,
      suggestions: brief.systemSuggestions,
      relations: projectGraph.relations.map((relation) => ({
        relationId: relation.id,
        fromMemoryId: relation.fromMemoryId,
        toMemoryId: relation.toMemoryId,
        sentence: sentence(relation),
        rationale: relation.rationale,
      })),
    };
  }

  buildMemoryHub(regenerateProjectPages = false): MemoryHub {
    const generatedAt = new Date().toISOString();
    const pendingByProject = new Map<string, ReturnType<MemoryStore["listProposals"]>>();
    for (const proposal of this.store.listProposals("pending")) {
      const existing = pendingByProject.get(proposal.projectId) ?? [];
      existing.push(proposal);
      pendingByProject.set(proposal.projectId, existing);
    }
    const projects: MemoryHubProject[] = this.store.listProjects().map((project) => {
      const graph = this.buildGraph(project.id, null, 1, false);
      const brief = this.buildProjectBrief(project.id, graph, MAX_GRAPH_NODES, generatedAt);
      if (regenerateProjectPages) this.writeGraphHtml(project.id, graph);
      const latest = brief.handoff.history[0] ?? null;
      const pendingProposalCount = this.store.countPendingProposals(project.id);
      const pendingProposals = (pendingByProject.get(project.id) ?? [])
        .slice(0, 4)
        .map((proposal) => ({
          platform: proposal.actor.platform,
          createdAt: proposal.createdAt,
          summaries: [
            ...proposal.items.map((item) => buildMemoryDisplayTitle(item.candidate)),
            ...proposal.updateItems.map(
              (item) =>
                `补全：${(() => {
                  const memory = graph.nodes.find(
                    (candidate) => candidate.id === item.candidate.memoryId,
                  );
                  return memory ? buildMemoryDisplayTitle(memory) : "已有记录";
                })()}`,
            ),
            ...proposal.relationItems.map(() => "可能有关的记录"),
          ].slice(0, 4),
        }));
      const storyPath = pathToFileURL(this.store.knowledgeGraphPath(project.id)).href;
      const searchText = graph.nodes
        .flatMap((memory) => [
          buildMemoryDisplayTitle(memory),
          memory.title,
          memory.summary ?? "",
          memory.narrative?.outcome ?? "",
          memory.narrative?.conclusion ?? "",
          ...(memory.narrative?.outputs.map((output) => output.label ?? output.sourcePath) ?? []),
          ...memory.citations.map((citation) => citation.note ?? citation.sourcePath),
        ])
        .join(" ");
      return {
        projectId: project.id,
        name: project.name,
        primaryPath: project.primaryPath,
        overview: brief.handoff.coverage,
        latestActivityAt: latest?.occurredAt ?? latest?.updatedAt ?? null,
        latestActivityTitle: latest?.displayTitle ?? null,
        latestConclusion: brief.currentConclusions[0] ?? null,
        nextStep: brief.nextSteps[0] ?? null,
        risk: brief.risks[0] ?? null,
        memoryCount: brief.summary.memoryCount,
        staleCitationCount: brief.summary.staleCitationCount,
        pendingProposalCount,
        pendingProposals,
        needsAttention:
          pendingProposalCount > 0 ||
          brief.summary.staleCitationCount > 0 ||
          brief.risks.length > 0,
        storyPath,
        searchText,
      };
    });
    const byRecent = [...projects].sort(
      (left, right) =>
        (right.latestActivityAt ?? "").localeCompare(left.latestActivityAt ?? "") ||
        left.name.localeCompare(right.name, "zh-CN"),
    );
    const byName = [...projects].sort((left, right) =>
      left.name.localeCompare(right.name, "zh-CN"),
    );
    return {
      protocolVersion: 1,
      generatedAt,
      storageHome: this.dataDir,
      summary: {
        projectCount: projects.length,
        memoryCount: projects.reduce((total, project) => total + project.memoryCount, 0),
        pendingProposalCount: projects.reduce(
          (total, project) => total + project.pendingProposalCount,
          0,
        ),
        attentionProjectCount: projects.filter((project) => project.needsAttention).length,
      },
      recentProjects: byRecent.slice(0, 6),
      attentionProjects: byRecent.filter((project) => project.needsAttention),
      pendingProjects: byRecent.filter((project) => project.pendingProposalCount > 0),
      projects: byName,
    };
  }

  buildDesktopHubSnapshot(): MemoryHub {
    const generatedAt = new Date().toISOString();
    const pendingByProject = new Map<string, ReturnType<MemoryStore["listProposals"]>>();
    for (const proposal of this.store.listProposals("pending")) {
      const existing = pendingByProject.get(proposal.projectId) ?? [];
      existing.push(proposal);
      pendingByProject.set(proposal.projectId, existing);
    }
    const projects: MemoryHubProject[] = this.store.listProjects().map((project) => {
      const memories = this.store.getContext(project.id, 1000);
      const latest = memories[0] ?? null;
      const conclusion =
        memories.find((memory) => memory.briefRole === "conclusion") ??
        memories.find((memory) => memory.kind === "decision") ??
        null;
      const nextStep = memories.find((memory) => memory.briefRole === "next_step") ?? null;
      const risk =
        memories.find((memory) => memory.briefRole === "risk") ??
        memories.find((memory) => memory.kind === "pitfall") ??
        null;
      const pendingProposals = (pendingByProject.get(project.id) ?? [])
        .slice(0, 4)
        .map((proposal) => ({
          platform: proposal.actor.platform,
          createdAt: proposal.createdAt,
          summaries: [
            ...proposal.items.map((item) => item.candidate.title),
            ...proposal.updateItems.map(() => "补全已有记录"),
            ...proposal.relationItems.map(() => "可能有关的记录"),
          ].slice(0, 4),
        }));
      const pendingProposalCount = pendingByProject.get(project.id)?.length ?? 0;
      const staleCitationCount = memories.reduce(
        (total, memory) => total + memory.citations.filter((citation) => citation.stale).length,
        0,
      );
      const overview =
        conclusion?.summary ??
        conclusion?.narrative?.conclusion ??
        latest?.summary ??
        latest?.narrative?.outcome ??
        (memories.length > 0
          ? `已保存 ${memories.length} 条项目记忆。`
          : "已注册，等待形成首条记忆。");
      return {
        projectId: project.id,
        name: project.name,
        primaryPath: project.primaryPath,
        overview,
        latestActivityAt: latest?.narrative?.occurredAt ?? latest?.updatedAt ?? null,
        latestActivityTitle: latest ? buildMemoryDisplayTitle(latest) : null,
        latestConclusion: conclusion ? desktopHubBriefItem(conclusion, "conclusion") : null,
        nextStep: nextStep ? desktopHubBriefItem(nextStep, "next_step") : null,
        risk: risk ? desktopHubBriefItem(risk, "risk") : null,
        memoryCount: memories.length,
        staleCitationCount,
        pendingProposalCount,
        pendingProposals,
        needsAttention: pendingProposalCount > 0 || staleCitationCount > 0 || Boolean(risk),
        storyPath: pathToFileURL(this.store.knowledgeGraphPath(project.id)).href,
        searchText: memories
          .flatMap((memory) => [
            buildMemoryDisplayTitle(memory),
            memory.title,
            memory.summary ?? "",
            memory.narrative?.outcome ?? "",
            memory.narrative?.conclusion ?? "",
            ...(memory.narrative?.outputs.map((output) => output.label ?? output.sourcePath) ?? []),
            ...memory.citations.map((citation) => citation.note ?? citation.sourcePath),
          ])
          .join(" "),
      };
    });
    const byRecent = [...projects].sort(
      (left, right) =>
        (right.latestActivityAt ?? "").localeCompare(left.latestActivityAt ?? "") ||
        left.name.localeCompare(right.name, "zh-CN"),
    );
    const hub: MemoryHub = {
      protocolVersion: 1,
      generatedAt,
      storageHome: this.dataDir,
      summary: {
        projectCount: projects.length,
        memoryCount: projects.reduce((total, project) => total + project.memoryCount, 0),
        pendingProposalCount: projects.reduce(
          (total, project) => total + project.pendingProposalCount,
          0,
        ),
        attentionProjectCount: projects.filter((project) => project.needsAttention).length,
      },
      recentProjects: byRecent.slice(0, 6),
      attentionProjects: byRecent.filter((project) => project.needsAttention),
      pendingProjects: byRecent.filter((project) => project.pendingProposalCount > 0),
      projects: [...projects].sort((left, right) => left.name.localeCompare(right.name, "zh-CN")),
    };
    hub.platformProjects = buildDesktopPlatformInventory(
      discoverDesktopPlatformProjects(),
      this.store.listProjects(),
      hub.projects,
    );
    return hub;
  }

  registerDesktopPlatformProject(platform: AgentPlatform, projectPath: string): MemoryHub {
    const resolvedPath = path.resolve(projectPath);
    const candidate = discoverDesktopPlatformProjects().find(
      (project) => project.platform === platform && project.path === resolvedPath,
    );
    if (!candidate) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        "The selected platform project is no longer available for registration.",
        { platform, path: resolvedPath },
      );
    }
    this.registerProject(candidate.path, candidate.name);
    return this.buildDesktopHubSnapshot();
  }

  buildDesktopProjectView(projectId: string): GraphViewData {
    const project = this.store.requireProject(projectId);
    const generatedAt = new Date().toISOString();
    const graph = this.buildGraph(projectId, null, 1, false);
    const guide = this.buildGraphGuide(projectId, graph, 12, generatedAt);
    const brief = this.buildProjectBrief(projectId, graph, 12, generatedAt, guide);
    return buildGraphViewData(project.name, graph, generatedAt, guide, brief);
  }

  writeMemoryHub(regenerateProjectPages = true): Record<string, unknown> {
    const hub = this.buildMemoryHub(regenerateProjectPages);
    const outputPath = this.store.writeMemoryHub(renderMemoryHubHtml(hub), resolveMemoryHubPath());
    return {
      format: "html",
      outputPath,
      generatedAt: hub.generatedAt,
      projectCount: hub.summary.projectCount,
      memoryCount: hub.summary.memoryCount,
      pendingProposalCount: hub.summary.pendingProposalCount,
    };
  }

  writeGraphHtml(
    projectId: string,
    graph: KnowledgeGraph,
    outputPath?: string,
  ): Record<string, unknown> {
    const project = this.store.requireProject(projectId);
    const generatedAt = new Date().toISOString();
    const guide = this.buildGraphGuide(projectId, graph, 12, generatedAt);
    const brief = this.buildProjectBrief(projectId, graph, 12, generatedAt, guide);
    const html = renderGraphHtml(project.name, graph, generatedAt, guide, brief);
    const target = this.store.writeKnowledgeGraph(projectId, html, outputPath);
    return {
      format: "html",
      outputPath: target,
      generatedAt,
      nodeCount: graph.nodes.length,
      relationCount: graph.relations.length,
      relationSuggestionCount: guide.relationSuggestions.length,
      briefItemCount: brief.summary.memoryCount,
    };
  }

  searchFiles(
    sourceProjectId: string,
    targetProjectId: string,
    query: string,
  ): Record<string, unknown> {
    this.requireReadAccess(sourceProjectId, targetProjectId);
    const target = this.store.requireProject(targetProjectId);
    const metadata = detectGitMetadata(target.primaryPath);
    return {
      targetProject: target,
      query,
      results: searchProjectFiles(metadata.rootPath, query, metadata.headCommit, this.denyPatterns),
    };
  }

  readFile(
    sourceProjectId: string,
    targetProjectId: string,
    relativePath: string,
  ): Record<string, unknown> {
    this.requireReadAccess(sourceProjectId, targetProjectId);
    const target = this.store.requireProject(targetProjectId);
    const metadata = detectGitMetadata(target.primaryPath);
    return {
      targetProject: target,
      file: readProjectFile(
        metadata.rootPath,
        relativePath,
        metadata.headCommit,
        this.denyPatterns,
      ),
    };
  }

  bindingSnippet(platform = "codex"): Record<string, string> {
    const normalized = platform.trim().toLocaleLowerCase();
    const instruction =
      normalized === "claude" || normalized === "claude-code"
        ? "Use the installed Talo Skill for substantial work in registered local projects. Detect the current project, recall task-relevant candidates, and get only recommended memories within the default token budget. Use story for the project timeline and hub for all registered projects. Propose durable updates with actor.platform set to claude, then resolve them through the shared review workflow."
        : normalized === "antigravity"
          ? "Before substantial work in a local workspace, use the global Talo Skill to detect the current project. If the project is registered, recall only task-relevant reviewed memories and get only the recommended memory IDs. If the project is not registered and the user did not explicitly ask about Talo, continue silently without registering or relinking it. Create reviewed proposals with actor.platform set to antigravity; never write memory files directly."
          : "Use the installed $project-memory Skill before substantial work: detect the current project, recall compact task-relevant candidates, and get only the recommended memories within the default token budget. Use story for the project timeline and hub for all registered projects. Before finishing durable work, create a reviewed proposal and resolve it through the shared review workflow. Treat linked projects as read-only references.";
    return {
      platform: normalized,
      beginMarker: "<!-- project-memory:start -->",
      endMarker: "<!-- project-memory:end -->",
      markdown: `<!-- project-memory:start -->\n${instruction}\n<!-- project-memory:end -->`,
    };
  }

  exportProject(projectId: string): Record<string, unknown> {
    const exported = this.store.exportProject(projectId);
    return { ...exported, memories: this.getContext(projectId, 1000) };
  }
}
