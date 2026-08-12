import type {
  BriefRole,
  GraphGuide,
  GraphRelationSuggestion,
  MemoryPhase,
  MemoryNarrativeRecord,
  ProjectBrief,
  ProposalActor,
} from "../types.js";

export type MemoryKind =
  | "architecture"
  | "decision"
  | "workflow"
  | "convention"
  | "pitfall"
  | "status";

export type Confidence = "observed" | "verified" | "inferred";
export type CitationRole = "evidence" | "report" | "workflow" | "reference";
export type RelationType =
  | "related_to"
  | "observes"
  | "causes"
  | "depends_on"
  | "supports"
  | "contradicts"
  | "supersedes"
  | "derived_from";

export interface BrowserCitation {
  sourceProjectId: string;
  sourceProjectName: string;
  sourcePath: string;
  role: CitationRole;
  locator: string | null;
  note: string | null;
  sourceCommit: string | null;
  stale: boolean;
  staleReason: string | null;
  accessible: boolean;
  fileUrl: string | null;
}

export interface BrowserMemory {
  id: string;
  projectId: string;
  projectName: string;
  kind: MemoryKind;
  title: string;
  displayTitle: string;
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
  citations: BrowserCitation[];
  submittedBy?: ProposalActor | null;
  sourceProposalId?: string | null;
  confidence: Confidence;
  createdAt?: string;
  updatedAt: string;
  stale: boolean;
  staleReason: string | null;
}

export interface BrowserRelation {
  id: string;
  fromMemoryId: string;
  toMemoryId: string;
  type: RelationType;
  rationale: string;
  confidence: Confidence;
}

export interface GraphViewData {
  projectName: string;
  generatedAt: string;
  hubUrl?: string;
  memories: BrowserMemory[];
  relations: BrowserRelation[];
  guide: GraphGuide;
  brief?: ProjectBrief;
}

export type BrowserGraphGuide = GraphGuide;
export type BrowserRelationSuggestion = GraphRelationSuggestion;

export type StaleFilter = "all" | "active" | "stale";
export type FocusDepth = "all" | "1" | "2";
export type LocalGraphScope = "work_unit" | "event" | "two_hops" | "all";

export interface TimelineEvent {
  memory: BrowserMemory;
  displayTitle: string;
  occurredAt: string;
  sequence: number | null;
}

export interface TimelineDayEvent extends TimelineEvent {
  workUnitLabel: string;
  ungrouped: boolean;
  timeLabel: string;
  incomingRelations: Array<{
    type: RelationType;
    fromMemoryId: string;
    fromTitle: string;
    rationale: string;
  }>;
}

export interface TimelineDayWorkUnit {
  id: string;
  label: string;
  latestAt: string;
  events: TimelineDayEvent[];
  ungrouped: boolean;
}

export interface TimelineDayGroup {
  date: string;
  eventCount: number;
  workUnitCount: number;
  workUnitLabels: string[];
  phases: Array<{ phase: MemoryPhase; count: number }>;
  events: TimelineDayEvent[];
  workUnits: TimelineDayWorkUnit[];
  latestMemoryId: string | null;
}

export interface TimelineWorkUnit {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  status: string;
  formalRelationCount: number;
  events: TimelineEvent[];
  ungrouped: boolean;
}

export interface EventPathView {
  focusMemoryId: string;
  focus: BrowserMemory;
  workUnitId: string | null;
  workUnitLabel: string;
  memories: BrowserMemory[];
  relations: BrowserRelation[];
  externalMemoryIds: string[];
  suggestions: GraphRelationSuggestion[];
}

export interface EventRelationItem {
  relation: BrowserRelation;
  memory: BrowserMemory;
  sentence: string;
}

export interface EventCausalityView {
  memory: BrowserMemory;
  causes: EventRelationItem[];
  effects: EventRelationItem[];
  related: EventRelationItem[];
  contradictions: EventRelationItem[];
  suggestions: GraphRelationSuggestion[];
}

export interface GraphFilters {
  topic: string;
  kind: string;
  relation: string;
  stale: StaleFilter;
  focusDepth: FocusDepth;
}

export type GraphSelection =
  | { type: "memory"; id: string }
  | { type: "citation"; id: string; memoryId: string; citationIndex: number }
  | { type: "relation"; id: string }
  | { type: "suggestion"; id: string }
  | null;

export interface GraphElement {
  group: "nodes" | "edges";
  data: Record<string, string | number | boolean>;
  classes?: string;
}
