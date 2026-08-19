// src/types.ts
var MEMORY_KINDS = [
  "architecture",
  "decision",
  "workflow",
  "convention",
  "pitfall",
  "status"
];
var REVIEW_POLICIES = ["manual", "smart"];
var MEMORY_PHASES = [
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
  "other"
];
var BRIEF_ROLES = ["conclusion", "progress", "risk", "next_step", "reference"];
var CITATION_ROLES = ["evidence", "report", "workflow", "reference"];
var RELATION_TYPES = [
  "related_to",
  "observes",
  "causes",
  "depends_on",
  "supports",
  "contradicts",
  "supersedes",
  "derived_from"
];
export {
  BRIEF_ROLES,
  CITATION_ROLES,
  MEMORY_KINDS,
  MEMORY_PHASES,
  RELATION_TYPES,
  REVIEW_POLICIES
};
