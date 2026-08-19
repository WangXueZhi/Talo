export const MEMORY_KINDS = [
  "architecture",
  "decision",
  "workflow",
  "convention",
  "pitfall",
  "status",
] as const;

export type MemoryKind = (typeof MEMORY_KINDS)[number];
export type Confidence = "observed" | "verified" | "inferred";

export const REVIEW_POLICIES = ["manual", "smart"] as const;
export type ReviewPolicy = (typeof REVIEW_POLICIES)[number];

export const MEMORY_PHASES = [
  "context",
  "data_collection",
  "analysis",
  "decision",
  "execution",
  "verification",
  "handoff",
  "learning",
  "risk",
  "next_step",
  "other",
] as const;

export type MemoryPhase = (typeof MEMORY_PHASES)[number];

export const BRIEF_ROLES = ["conclusion", "progress", "risk", "next_step", "reference"] as const;
export type BriefRole = (typeof BRIEF_ROLES)[number];

export const CITATION_ROLES = ["evidence", "report", "workflow", "reference"] as const;
export type CitationRole = (typeof CITATION_ROLES)[number];

export interface MemoryCitationCandidate {
  sourceProjectId?: string;
  sourcePath: string;
  role: CitationRole;
  locator?: string;
  note?: string;
}

export interface MemoryCitationRecord {
  sourceProjectId: string;
  sourceProjectName: string;
  sourcePath: string;
  role: CitationRole;
  locator: string | null;
  note: string | null;
  sourceCommit: string | null;
  sourceFileHash: string;
  stale: boolean;
  staleReason: string | null;
  accessible: boolean;
  fileUrl: string | null;
}

export interface MemoryOutputCandidate {
  sourceProjectId?: string;
  sourcePath: string;
  label?: string;
}

export interface MemoryOutputRecord {
  sourceProjectId: string;
  sourcePath: string;
  role: CitationRole;
  label: string | null;
}

export interface MemoryNarrativeCandidate {
  occurredAt: string;
  reason: string;
  action: string;
  outcome: string;
  conclusion: string;
  outputs?: MemoryOutputCandidate[];
}

export interface MemoryNarrativeRecord {
  occurredAt: string;
  reason: string;
  action: string;
  outcome: string;
  conclusion: string;
  outputs: MemoryOutputRecord[];
}

export const RELATION_TYPES = [
  "related_to",
  "observes",
  "causes",
  "depends_on",
  "supports",
  "contradicts",
  "supersedes",
  "derived_from",
] as const;

export type RelationType = (typeof RELATION_TYPES)[number];
export type RelationDirection = "in" | "out" | "both";

export interface ProjectRecord {
  id: string;
  name: string;
  primaryPath: string;
  isGit: boolean;
  gitCommonDir: string | null;
  remoteUrl: string | null;
  headCommit: string | null;
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string;
}

export interface DetectedProject {
  requestedPath: string;
  rootPath: string;
  name: string;
  isGit: boolean;
  gitCommonDir: string | null;
  remoteUrl: string | null;
  headCommit: string | null;
  registeredProject: ProjectRecord | null;
  relocationCandidates: ProjectRecord[];
}

export interface MemoryCandidate {
  ref?: string;
  kind: MemoryKind;
  title: string;
  summary?: string;
  topic?: string;
  briefRole?: BriefRole;
  workUnitId?: string;
  runId?: string;
  phase?: MemoryPhase;
  sequence?: number;
  narrative?: MemoryNarrativeCandidate;
  content: string;
  tags?: string[];
  sourceProjectId?: string;
  sourcePath?: string;
  citations?: MemoryCitationCandidate[];
  confidence?: Confidence;
}

export interface MemoryUpdateCandidate {
  memoryId: string;
  summary?: string;
  topic?: string;
  briefRole?: BriefRole;
  workUnitId?: string;
  runId?: string;
  phase?: MemoryPhase;
  sequence?: number;
  narrative?: MemoryNarrativeCandidate;
  citations?: MemoryCitationCandidate[];
}

export type RelationEndpointCandidate =
  | { memoryId: string; candidateRef?: never }
  | { candidateRef: string; memoryId?: never };

export interface MemoryRelationCandidate {
  from: RelationEndpointCandidate;
  to: RelationEndpointCandidate;
  type: RelationType;
  rationale: string;
  confidence?: Confidence;
}

export interface MemoryRecord {
  id: string;
  projectId: string;
  projectName: string;
  kind: MemoryKind;
  title: string;
  summary: string | null;
  topic: string | null;
  briefRole: BriefRole | null;
  workUnitId?: string | null;
  runId?: string | null;
  phase?: MemoryPhase | null;
  sequence?: number | null;
  narrative?: MemoryNarrativeRecord | null;
  content: string;
  tags: string[];
  sourceProjectId: string | null;
  sourcePath: string | null;
  sourceCommit: string | null;
  sourceFileHash: string | null;
  citations: MemoryCitationRecord[];
  submittedBy?: ProposalActor | null;
  sourceProposalId?: string | null;
  confidence: Confidence;
  status: "active";
  createdAt: string;
  updatedAt: string;
  stale: boolean;
  staleReason: string | null;
}

export type RecallQueryMode = "query" | "recent";
export type RecallOmissionReason = "budget_exceeded" | "limit_exceeded";

export interface RecallCandidate {
  memoryId: string;
  projectId: string;
  projectName: string;
  kind: MemoryKind;
  title: string;
  summary: string;
  topic: string | null;
  tags: string[];
  confidence: Confidence;
  score: number;
  matchReasons: string[];
  stale: boolean;
  staleReason: string | null;
  citationCount: number;
  formalRelationCount: number;
  updatedAt: string;
  estimatedTokens: number;
}

export interface RecallOmission {
  reason: RecallOmissionReason;
  memoryIds: string[];
}

export interface RecallResult {
  queryMode: RecallQueryMode;
  query: string | null;
  candidates: RecallCandidate[];
  recommendedMemoryIds: string[];
  estimatedTokens: number;
  budgetTokens: number;
  estimationNote: string;
  omissions: RecallOmission[];
}

export interface RetrievedCitation {
  sourceProjectId: string;
  sourceProjectName: string;
  sourcePath: string;
  role: CitationRole;
  locator: string | null;
  note: string | null;
  stale: boolean;
  staleReason: string | null;
  accessible: boolean;
  fileUrl: string | null;
}

export interface RetrievedMemory
  extends Omit<MemoryRecord, "sourceCommit" | "sourceFileHash" | "citations"> {
  citations: RetrievedCitation[];
  estimatedTokens: number;
}

export interface GetMemoriesResult {
  memories: RetrievedMemory[];
  omittedMemoryIds: string[];
  omissions: RecallOmission[];
  estimatedTokens: number;
  budgetTokens: number;
  estimationNote: string;
}

export interface ProposalItem {
  id: string;
  proposalId: string;
  candidate: MemoryCandidate;
  status: "pending" | "accepted" | "rejected";
}

export interface RelationProposalItem {
  id: string;
  proposalId: string;
  candidate: MemoryRelationCandidate;
  status: "pending" | "accepted" | "rejected";
  rejectionReason: string | null;
}

export interface MemoryUpdateProposalItem {
  id: string;
  proposalId: string;
  candidate: MemoryUpdateCandidate;
  status: "pending" | "accepted" | "rejected";
  rejectionReason: string | null;
}

export interface ProposalRecord {
  id: string;
  projectId: string;
  actor: ProposalActor;
  baseRevision: string | null;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  reviewedAt: string | null;
  items: ProposalItem[];
  updateItems: MemoryUpdateProposalItem[];
  relationItems: RelationProposalItem[];
}

export interface ProposalAutoReview {
  policy: ReviewPolicy;
  outcome: "pending" | "auto_committed";
  reasons: string[];
  committedMemoryIds: string[];
  committedUpdateIds: string[];
  committedRelationIds: string[];
}

export interface ProposalSubmissionResult extends ProposalRecord {
  autoReview: ProposalAutoReview;
}

export interface ProposalActor {
  platform: string;
  adapterVersion: string | null;
}

export interface MemoryRelationRecord {
  id: string;
  ownerProjectId: string;
  fromMemoryId: string;
  fromProjectId: string;
  toMemoryId: string;
  toProjectId: string;
  type: RelationType;
  rationale: string;
  confidence: Confidence;
  sourceProposalId: string;
  status: "active";
  createdAt: string;
  updatedAt: string;
}

export interface RelationView extends MemoryRelationRecord {
  fromMemory: MemoryRecord;
  toMemory: MemoryRecord;
  suspended: boolean;
  stale: boolean;
}

export type GraphHighlightKind = "connected" | "evidence" | "recent";
export type GraphGapKind = "isolated" | "stale_memory" | "stale_citation";
export type RelationSuggestionSignalKind = "shared_citation" | "same_topic" | "shared_tag";

export interface GraphGuideSummary {
  memoryCount: number;
  formalRelationCount: number;
  citationCount: number;
  staleMemoryCount: number;
  staleCitationCount: number;
  componentCount: number;
  isolatedCount: number;
}

export interface GraphGuideTopic {
  name: string;
  memoryIds: string[];
  memoryCount: number;
  staleCount: number;
}

export interface GraphHighlight {
  id: string;
  kind: GraphHighlightKind;
  memoryId: string;
  title: string;
  reason: string;
  value: number | string;
}

export interface GraphGap {
  id: string;
  kind: GraphGapKind;
  memoryIds: string[];
  message: string;
}

export interface RelationSuggestionSignal {
  kind: RelationSuggestionSignalKind;
  key: string;
  label: string;
  weight: number;
  role?: CitationRole;
  sourceProjectId?: string;
  sourcePath?: string;
}

export interface GraphRelationSuggestion {
  id: string;
  projectId: string;
  fromMemoryId: string;
  toMemoryId: string;
  type: "related_to";
  rationale: string;
  score: number;
  signals: RelationSuggestionSignal[];
}

export interface GraphSuggestedQuestion {
  id: string;
  question: string;
  why: string;
  memoryIds: string[];
}

export interface GraphGuide {
  projectId: string;
  projectName: string;
  generatedAt: string;
  summary: GraphGuideSummary;
  topics: GraphGuideTopic[];
  highlights: GraphHighlight[];
  gaps: GraphGap[];
  suggestedQuestions: GraphSuggestedQuestion[];
  relationSuggestions: GraphRelationSuggestion[];
}

export interface ProjectBriefSummary {
  memoryCount: number;
  conclusionCount: number;
  progressCount: number;
  riskCount: number;
  nextStepCount: number;
  citationCount: number;
  staleMemoryCount: number;
  staleCitationCount: number;
}

export interface ProjectBriefItem {
  memoryId: string;
  title: string;
  displayTitle: string;
  summary: string;
  topic: string | null;
  briefRole: BriefRole;
  roleSource: "reviewed" | "inferred";
  stale: boolean;
  citationCount: number;
  updatedAt: string;
  occurredAt: string | null;
  narrative: MemoryNarrativeRecord | null;
}

export interface ProjectHandoffStartItem extends ProjectBriefItem {
  reason: string;
}

export interface ProjectHandoffTimelineItem extends ProjectBriefItem {
  isLegacy: boolean;
}

export interface ProjectBriefRecommendation {
  memoryId: string;
  title: string;
  displayTitle: string;
  reasons: string[];
}

export interface ProjectBriefSuggestion {
  id: string;
  text: string;
  reason: string;
  memoryIds: string[];
}

export interface ProjectBriefTopic {
  name: string;
  memoryIds: string[];
  memoryCount: number;
}

export interface ProjectBrief {
  projectId: string;
  projectName: string;
  generatedAt: string;
  overview: string;
  summary: ProjectBriefSummary;
  currentConclusions: ProjectBriefItem[];
  completedWork: ProjectBriefItem[];
  risks: ProjectBriefItem[];
  nextSteps: ProjectBriefItem[];
  references: ProjectBriefItem[];
  systemSuggestions: ProjectBriefSuggestion[];
  recommendedReading: ProjectBriefRecommendation[];
  recentUpdates: ProjectBriefItem[];
  topics: ProjectBriefTopic[];
  handoff: {
    coverage: string;
    startHere: ProjectHandoffStartItem[];
    recentWork: ProjectHandoffTimelineItem[];
    history: ProjectHandoffTimelineItem[];
  };
}

export interface ProjectStoryRelation {
  relationId: string;
  fromMemoryId: string;
  toMemoryId: string;
  sentence: string;
  rationale: string;
}

export interface ProjectStory {
  protocolVersion: 1;
  projectId: string;
  projectName: string;
  generatedAt: string;
  overview: string;
  startHere: ProjectHandoffStartItem[];
  timeline: ProjectHandoffTimelineItem[];
  currentConclusions: ProjectBriefItem[];
  risks: ProjectBriefItem[];
  nextSteps: ProjectBriefItem[];
  suggestions: ProjectBriefSuggestion[];
  relations: ProjectStoryRelation[];
}

export interface MemoryHubProject {
  projectId: string;
  name: string;
  primaryPath: string;
  overview: string;
  latestActivityAt: string | null;
  latestActivityTitle: string | null;
  latestConclusion: ProjectBriefItem | null;
  nextStep: ProjectBriefItem | null;
  risk: ProjectBriefItem | null;
  memoryCount: number;
  staleCitationCount: number;
  pendingProposalCount: number;
  pendingProposals: Array<{
    platform: string;
    createdAt: string;
    summaries: string[];
  }>;
  needsAttention: boolean;
  storyPath: string;
  searchText: string;
}

export interface MemoryHub {
  protocolVersion: 1;
  generatedAt: string;
  storageHome: string;
  summary: {
    projectCount: number;
    memoryCount: number;
    pendingProposalCount: number;
    attentionProjectCount: number;
  };
  recentProjects: MemoryHubProject[];
  attentionProjects: MemoryHubProject[];
  pendingProjects: MemoryHubProject[];
  projects: MemoryHubProject[];
  platformProjects?: import("./platform-projects.js").DesktopPlatformInventory;
}

export interface FileSearchResult {
  path: string;
  line: number;
  excerpt: string;
  commit: string | null;
  fileHash: string;
}

export interface ReadFileResult {
  path: string;
  content: string;
  truncated: boolean;
  size: number;
  commit: string | null;
  fileHash: string;
}
