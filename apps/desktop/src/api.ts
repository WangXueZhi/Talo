import { invoke } from "@tauri-apps/api/core";
import type {
  AgentPlatform,
  DesktopPendingProposals,
  DesktopReviewPolicy,
  DesktopProposalSelection,
  DesktopReviewMutationResult,
  DesktopIntegrationStatus,
  DesktopAppUpdate,
  GraphViewData,
  MemoryHub,
  ReviewPolicy,
} from "./types";

export function getAppVersion(): Promise<string> {
  return invoke<string>("get_app_version");
}

export function checkForUpdate(): Promise<DesktopAppUpdate> {
  return invoke<DesktopAppUpdate>("check_for_update");
}

export function downloadUpdate(
  downloadUrl: string,
  expectedSha256: string,
  fileName: string,
): Promise<{ fileName: string; path: string }> {
  return invoke<{ fileName: string; path: string }>("download_update", {
    downloadUrl,
    expectedSha256,
    fileName,
  });
}

export function openUpdateInstaller(fileName: string): Promise<void> {
  return invoke("open_update_installer", { fileName });
}

export async function getCachedHub(): Promise<MemoryHub | null> {
  return invoke<MemoryHub | null>("get_cached_hub");
}

export async function refreshHub(): Promise<MemoryHub> {
  return invoke<MemoryHub>("refresh_hub");
}

export async function getPendingProposals(): Promise<DesktopPendingProposals> {
  return invoke<DesktopPendingProposals>("get_pending_proposals");
}

export async function getReviewPolicy(): Promise<DesktopReviewPolicy> {
  return invoke<DesktopReviewPolicy>("get_review_policy");
}

export async function setReviewPolicy(reviewPolicy: ReviewPolicy): Promise<DesktopReviewPolicy> {
  return invoke<DesktopReviewPolicy>("set_review_policy", { reviewPolicy });
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
