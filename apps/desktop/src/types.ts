import type { GraphViewData } from "../../../packages/project-memory-core/src/browser/types.ts";
import type { DesktopPlatformInventory } from "../../../packages/project-memory-core/src/platform-projects.ts";
import type { MemoryHub, ProposalRecord } from "../../../packages/project-memory-core/src/types.ts";
import type { ReviewPolicy } from "../../../packages/project-memory-core/src/types.ts";

export type { DesktopPlatformInventory, GraphViewData, MemoryHub, ProposalRecord };
export type { ReviewPolicy };

export type AgentPlatform = "codex" | "claude" | "antigravity";
export interface DesktopAppUpdate {
  available: boolean;
  currentVersion: string;
  version: string;
  notes: string;
  pubDate: string | null;
  downloadUrl: string | null;
  sha256: string | null;
  fileName: string | null;
}

export type ProductState = "not_found" | "found" | "config_only";
export type IntegrationState =
  | "absent"
  | "installed"
  | "outdated"
  | "partial"
  | "conflict"
  | "external";

export interface DesktopIntegrationStatus {
  platform: AgentPlatform;
  displayName: string;
  productState: ProductState;
  executablePath: string | null;
  productVersion: string | null;
  integrationState: IntegrationState;
  installedVersion: string | null;
  currentVersion: string;
  managedBy: "desktop" | "external" | null;
  externalPluginId: string | null;
  memoryAccessState: "configured" | "missing" | "conflict" | "not_applicable";
  memoryDataRoot: string | null;
  memoryConfigPath: string | null;
  issues: string[];
  actions: Array<"install" | "update" | "remove" | "migrate" | "repair" | "rescan">;
  restartRequired: boolean;
  successMessage: string;
  downloadUrl: string;
}

export interface DesktopPendingProposals {
  proposals: ProposalRecord[];
}

export interface DesktopReviewPolicy {
  reviewPolicy: ReviewPolicy;
}

export interface DesktopProposalSelection {
  proposalId: string;
  acceptedItemIds: string[];
  acceptedUpdateIds: string[];
  acceptedRelationIds: string[];
}

export interface DesktopReviewMutationResult {
  proposalResult: unknown;
  pendingProposals: ProposalRecord[];
  hub: MemoryHub;
}
