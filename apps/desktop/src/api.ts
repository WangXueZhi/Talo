import { invoke } from "@tauri-apps/api/core";
import type {
  AgentPlatform,
  DesktopPendingProposals,
  DesktopProposalSelection,
  DesktopReviewMutationResult,
  DesktopIntegrationStatus,
  GraphViewData,
  MemoryHub,
} from "./types";

export async function getCachedHub(): Promise<MemoryHub | null> {
  return invoke<MemoryHub | null>("get_cached_hub");
}

export async function refreshHub(): Promise<MemoryHub> {
  return invoke<MemoryHub>("refresh_hub");
}

export async function getPendingProposals(): Promise<DesktopPendingProposals> {
  return invoke<DesktopPendingProposals>("get_pending_proposals");
}

export async function commitProposal(
  selection: DesktopProposalSelection,
  refreshSources = false,
): Promise<DesktopReviewMutationResult> {
  return invoke<DesktopReviewMutationResult>("commit_proposal", {
    proposalId: selection.proposalId,
    acceptedItemIds: selection.acceptedItemIds,
    acceptedUpdateIds: selection.acceptedUpdateIds,
    acceptedRelationIds: selection.acceptedRelationIds,
    refreshSources,
  });
}

export async function rejectProposal(proposalId: string): Promise<DesktopReviewMutationResult> {
  return invoke<DesktopReviewMutationResult>("reject_proposal", { proposalId });
}

export async function registerPlatformProject(
  platform: AgentPlatform,
  projectPath: string,
): Promise<MemoryHub> {
  return invoke<MemoryHub>("register_platform_project", { platform, projectPath });
}

export async function getProjectView(projectId: string): Promise<GraphViewData> {
  return invoke<GraphViewData>("get_project_view", { projectId });
}

export async function scanIntegrations(): Promise<DesktopIntegrationStatus[]> {
  return invoke<DesktopIntegrationStatus[]>("scan_integrations");
}

export async function installIntegration(
  platform: AgentPlatform,
  migrateExternal = false,
): Promise<DesktopIntegrationStatus[]> {
  return invoke<DesktopIntegrationStatus[]>("install_integration", {
    platform,
    migrateExternal,
  });
}

export async function repairIntegration(platform: AgentPlatform): Promise<DesktopIntegrationStatus[]> {
  return invoke<DesktopIntegrationStatus[]>("repair_integration", { platform });
}

export async function removeIntegration(
  platform: AgentPlatform,
): Promise<DesktopIntegrationStatus[]> {
  return invoke<DesktopIntegrationStatus[]>("remove_integration", { platform });
}

export async function openDownloadPage(platform: AgentPlatform): Promise<void> {
  await invoke("open_download_page", { platform });
}
