import {
  CheckCircle2,
  ClipboardCheck,
  FilePlus2,
  GitMerge,
  LoaderCircle,
  PencilLine,
  RefreshCw,
  ShieldAlert,
  XCircle,
} from "lucide-preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import { commitProposal, getPendingProposals, getProjectView, rejectProposal } from "./api";
import {
  buildDesktopReviewProposals,
  countProposalDecisionItems,
  countSelectedProposalItems,
  createProposalSelection,
  resolveReviewEndpoint,
  reviewCandidateDisplayTitle,
  reviewRelationLabel,
  toggleProposalSelection,
  type ReviewItemKind,
} from "./review-proposals";
import type {
  DesktopProposalSelection,
  GraphViewData,
  MemoryHub,
  ProposalRecord,
} from "./types";
import type { Translate } from "./i18n";

interface ReviewError {
  code: string | null;
  message: string;
  details: string;
  sourcePath: string | null;
}

function reviewError(error: unknown, t: Translate): ReviewError {
  const raw = typeof error === "string"
    ? error
    : error instanceof Error
      ? error.message
      : JSON.stringify(error);
  let payload: { code?: string; message?: string; details?: unknown } | null = null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") {
      payload = parsed as { code?: string; message?: string; details?: unknown };
    }
  } catch {
    payload = null;
  }

  const code = payload?.code;
  const sourceMessage = payload?.message ?? raw;
  const detailRecord = payload?.details && typeof payload.details === "object"
    ? payload.details as Record<string, unknown>
    : null;
  const sourcePath = typeof detailRecord?.sourcePath === "string" ? detailRecord.sourcePath : null;
  let message = sourceMessage;
  if (code === "REVISION_CONFLICT") {
    if (sourceMessage.toLocaleLowerCase().includes("duplicates")) {
      message = t("review.error.duplicate");
    } else {
      message = t("review.error.revision");
    }
  } else if (code === "STALE_SOURCE") {
    message = sourcePath
      ? t("review.error.stalePath", { path: sourcePath })
      : t("review.error.stale");
  } else if (code === "PROPOSAL_NOT_PENDING") {
    message = t("review.error.processed");
  } else if (code === "INVALID_INPUT") {
    message = t("review.error.invalid");
  }

  return {
    code: code ?? null,
    message,
    details: JSON.stringify(
      payload ?? { message: sourceMessage },
      null,
      2,
    ),
    sourcePath,
  };
}

function platformName(platform: string, t: Translate): string {
  if (platform === "codex") return "Codex";
  if (platform === "antigravity") return "Antigravity";
  return platform === "legacy" ? t("review.legacy") : platform;
}

function proposalSelections(proposals: ProposalRecord[]): Record<string, DesktopProposalSelection> {
  return Object.fromEntries(proposals.map((proposal) => [proposal.id, createProposalSelection(proposal)]));
}

function CandidateHeading({ candidate, t }: { candidate: ProposalRecord["items"][number]["candidate"]; t: Translate }) {
  const displayTitle = reviewCandidateDisplayTitle(candidate);
  return <>
    <div class="review-item-head"><strong>{displayTitle}</strong><span>{candidate.kind}</span></div>
    {displayTitle !== candidate.title && <code class="review-technical-title">{t("review.originalTitle", { title: candidate.title })}</code>}
  </>;
}

function UpdateHeading({
  memoryId,
  projectView,
  t,
}: {
  memoryId: string;
  projectView: GraphViewData | null;
  t: Translate;
}) {
  const memory = projectView?.memories.find((candidate) => candidate.id === memoryId);
  return <>
    <div class="review-item-head"><strong>{t("review.updateTitle", { title: memory?.displayTitle ?? t("review.existingMemory") })}</strong><span>{t("review.update")}</span></div>
    <code class="review-technical-title">{t("review.memoryId", { id: memoryId })}</code>
  </>;
}

function RelationHeading({
  proposal,
  relation,
  projectView,
  t,
}: {
  proposal: ProposalRecord;
  relation: ProposalRecord["relationItems"][number]["candidate"];
  projectView: GraphViewData | null;
  t: Translate;
}) {
  const from = resolveReviewEndpoint(proposal, relation.from, projectView);
  const to = resolveReviewEndpoint(proposal, relation.to, projectView);
  return <>
    <div class="review-item-head"><strong>{from.displayTitle} → {to.displayTitle}</strong><span>{reviewRelationLabel(relation.type)}</span></div>
    <div class="review-relation-technical">
      <code>{t("review.from", { id: from.technicalId })}</code>
      <code>{t("review.to", { id: to.technicalId })}</code>
      <code>{t("review.relationType", { type: relation.type })}</code>
    </div>
  </>;
}

type ReviewConfirmation =
  | {
    kind: "accept";
    proposal: ProposalRecord;
    selection: DesktopProposalSelection;
    selectedCount: number;
    rejectedCount: number;
  }
  | {
    kind: "reject";
    proposal: ProposalRecord;
  }
  | {
    kind: "refresh-sources";
    proposal: ProposalRecord;
    selection: DesktopProposalSelection;
    selectedCount: number;
    rejectedCount: number;
    sourcePath: string | null;
  };

export function ReviewView({
  hub,
  onHubChange,
  t,
}: {
  hub: MemoryHub | null;
  onHubChange: (hub: MemoryHub) => void;
  t: Translate;
}) {
  const [proposals, setProposals] = useState<ProposalRecord[]>([]);
  const [selections, setSelections] = useState<Record<string, DesktopProposalSelection>>({});
  const [loading, setLoading] = useState(true);
  const [busyProposalId, setBusyProposalId] = useState<string | null>(null);
  const [error, setError] = useState<ReviewError | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<ReviewConfirmation | null>(null);
  const [projectViews, setProjectViews] = useState<Record<string, GraphViewData>>({});
  const reviewProposals = useMemo(() => buildDesktopReviewProposals(proposals, hub), [hub, proposals]);

  const refreshProjectViews = async (nextProposals: ProposalRecord[]) => {
    const projectIds = [...new Set(nextProposals.map((proposal) => proposal.projectId))];
    const entries = await Promise.all(projectIds.map(async (projectId) => {
      try {
        return [projectId, await getProjectView(projectId)] as const;
      } catch {
        return null;
      }
    }));
    setProjectViews(Object.fromEntries(entries.filter((entry): entry is readonly [string, GraphViewData] => entry !== null)));
  };

  const replaceProposals = (nextProposals: ProposalRecord[]) => {
    setProposals(nextProposals);
    setSelections(proposalSelections(nextProposals));
    void refreshProjectViews(nextProposals);
  };

  const load = async (manual = false) => {
    setLoading(true);
    setError(null);
    if (manual) setNotice(null);
    try {
      const result = await getPendingProposals();
      replaceProposals(result.proposals);
    } catch (reason) {
      setError(reviewError(reason, t));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!confirmation) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && busyProposalId === null) setConfirmation(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [busyProposalId, confirmation]);

  const toggle = (proposalId: string, kind: ReviewItemKind, itemId: string) => {
    setSelections((current) => {
      const selection = current[proposalId];
      if (!selection) return current;
      return { ...current, [proposalId]: toggleProposalSelection(selection, kind, itemId) };
    });
  };

  const requestAccept = (proposal: ProposalRecord) => {
    const selection = selections[proposal.id] ?? createProposalSelection(proposal);
    const { selectedCount, rejectedCount } = countProposalDecisionItems(proposal, selection);
    if (selectedCount === 0) return;
    setConfirmation({ kind: "accept", proposal, selection, selectedCount, rejectedCount });
  };

  const accept = async (
    confirmationRequest:
      | Extract<ReviewConfirmation, { kind: "accept" }>
      | Extract<ReviewConfirmation, { kind: "refresh-sources" }>,
    refreshSources = false,
  ) => {
    const { proposal, selection, selectedCount, rejectedCount } = confirmationRequest;
    setBusyProposalId(proposal.id);
    setError(null);
    setNotice(null);
    try {
      const result = await commitProposal(selection, refreshSources);
      replaceProposals(result.pendingProposals);
      onHubChange(result.hub);
      setNotice(`${t("review.accept", { count: selectedCount })}${rejectedCount > 0 ? ` · ${rejectedCount}` : ""}${refreshSources ? " · source updated" : ""}`);
      setConfirmation(null);
    } catch (reason) {
      const nextError = reviewError(reason, t);
      setError(nextError);
      if (!refreshSources && nextError.code === "STALE_SOURCE") {
        setConfirmation({
          kind: "refresh-sources",
          proposal,
          selection,
          selectedCount,
          rejectedCount,
          sourcePath: nextError.sourcePath,
        });
      } else {
        setConfirmation(null);
      }
    } finally {
      setBusyProposalId(null);
    }
  };

  const requestReject = (proposal: ProposalRecord) => {
    setConfirmation({ kind: "reject", proposal });
  };

  const reject = async (proposal: ProposalRecord) => {
    setBusyProposalId(proposal.id);
    setError(null);
    setNotice(null);
    try {
      const result = await rejectProposal(proposal.id);
      replaceProposals(result.pendingProposals);
      onHubChange(result.hub);
      setNotice(t("review.rejectAll"));
      setConfirmation(null);
    } catch (reason) {
      setError(reviewError(reason, t));
      setConfirmation(null);
    } finally {
      setBusyProposalId(null);
    }
  };

  const confirmReview = async () => {
    if (!confirmation || busyProposalId !== null) return;
    if (confirmation.kind === "accept" || confirmation.kind === "refresh-sources") {
      await accept(confirmation, confirmation.kind === "refresh-sources");
      return;
    }
    await reject(confirmation.proposal);
  };

  return <section class="page review-page">
    <header class="page-header"><div><span class="eyebrow">{t("review.secondConfirm")}</span><h1>{t("review.title")}</h1><p>{t("review.subtitle")}</p></div><button class="secondary-button" disabled={loading || busyProposalId !== null} onClick={() => void load(true)}>{loading ? <LoaderCircle class="spin" size={16} /> : <RefreshCw size={16} />}{loading ? t("review.loading") : t("common.refresh")}</button></header>
    {error && <div class="error-banner review-banner"><ShieldAlert size={18} /><span>{error.message}</span><button onClick={() => navigator.clipboard.writeText(error.details)}>{t("error.copy")}</button></div>}
    {notice && <div class="success-note review-banner"><CheckCircle2 size={18} /><span>{notice}</span></div>}
    {loading && proposals.length === 0 ? <div class="loading-panel"><LoaderCircle class="spin" />{t("review.loading")}</div> : null}
    {!loading && reviewProposals.length === 0 ? <div class="review-empty"><ClipboardCheck size={34} /><h2>{t("review.empty")}</h2><p>{t("review.subtitle")}</p></div> : null}
    <div class="review-proposal-list">{reviewProposals.map((proposal) => {
      const selection = selections[proposal.id] ?? createProposalSelection(proposal);
      const selectedCount = countSelectedProposalItems(selection);
      const busy = busyProposalId === proposal.id;
      return <details class="review-proposal" open key={proposal.id}>
        <summary><div class="review-proposal-summary"><div class="review-project-icon"><ClipboardCheck size={21} /></div><div class="review-project-copy"><div class="review-project-title"><h2>{proposal.projectName}</h2><span class={`platform-badge platform-${proposal.platform}`}>{platformName(proposal.platform, t)}</span></div><code>{proposal.projectPath ?? proposal.projectId}</code><span>{new Date(proposal.createdAt).toLocaleString(document.documentElement.lang)} · {t("review.proposalSummary", { count: proposal.itemCount })}</span></div><div class="review-counts"><span>{t("review.addedCount", { count: proposal.items.length })}</span><span>{t("review.updatedCount", { count: proposal.updateItems.length })}</span><span>{t("review.relationCount", { count: proposal.relationItems.length })}</span></div></div></summary>
        <div class="review-proposal-body">
          {proposal.items.length > 0 && <section class="review-item-section"><div class="review-section-title"><FilePlus2 size={17} /><h3>{t("review.memoryCandidates")}</h3></div>{proposal.items.map((item) => <label class={`review-item-card ${selection.acceptedItemIds.includes(item.id) ? "selected" : ""}`} key={item.id}><input type="checkbox" checked={selection.acceptedItemIds.includes(item.id)} onChange={() => toggle(proposal.id, "memory", item.id)} /><div class="review-item-content"><CandidateHeading candidate={item.candidate} t={t} />{item.candidate.summary && <p class="review-summary">{item.candidate.summary}</p>}<p class="review-content">{item.candidate.content}</p><div class="review-item-meta">{item.candidate.confidence && <span>{t("review.confidence")} {item.candidate.confidence}</span>}{item.candidate.briefRole && <span>{item.candidate.briefRole}</span>}{item.candidate.topic && <span>{item.candidate.topic}</span>}{item.candidate.tags?.map((tag) => <span key={tag}>#{tag}</span>)}</div>{item.candidate.sourcePath && <code class="review-source">{item.candidate.sourcePath}</code>}{item.candidate.citations && item.candidate.citations.length > 0 && <div class="review-citations">{item.candidate.citations.map((citation, index) => <code key={`${citation.sourcePath}:${index}`}>{citation.role} · {citation.sourcePath}{citation.locator ? ` · ${citation.locator}` : ""}</code>)}</div>}</div></label>)}</section>}
          {proposal.updateItems.length > 0 && <section class="review-item-section"><div class="review-section-title"><PencilLine size={17} /><h3>{t("review.updateCandidates")}</h3></div>{proposal.updateItems.map((item) => <label class={`review-item-card ${selection.acceptedUpdateIds.includes(item.id) ? "selected" : ""}`} key={item.id}><input type="checkbox" checked={selection.acceptedUpdateIds.includes(item.id)} onChange={() => toggle(proposal.id, "update", item.id)} /><div class="review-item-content"><UpdateHeading memoryId={item.candidate.memoryId} projectView={projectViews[proposal.projectId] ?? null} t={t} /><dl class="review-change-list">{item.candidate.summary !== undefined && <div><dt>{t("hub.subtitle")}</dt><dd>{item.candidate.summary}</dd></div>}{item.candidate.topic !== undefined && <div><dt>{t("hub.directory")}</dt><dd>{item.candidate.topic}</dd></div>}{item.candidate.briefRole !== undefined && <div><dt>{t("review.narrative")}</dt><dd>{item.candidate.briefRole}</dd></div>}{item.candidate.narrative && <div><dt>{t("review.narrative")}</dt><dd>{item.candidate.narrative.conclusion}</dd></div>}{item.candidate.citations && <div><dt>{t("review.citations")}</dt><dd>{item.candidate.citations.length}</dd></div>}</dl></div></label>)}</section>}
          {proposal.relationItems.length > 0 && <section class="review-item-section"><div class="review-section-title"><GitMerge size={17} /><h3>{t("review.relations")}</h3></div>{proposal.relationItems.map((item) => <label class={`review-item-card ${selection.acceptedRelationIds.includes(item.id) ? "selected" : ""}`} key={item.id}><input type="checkbox" checked={selection.acceptedRelationIds.includes(item.id)} onChange={() => toggle(proposal.id, "relation", item.id)} /><div class="review-item-content"><RelationHeading proposal={proposal} relation={item.candidate} projectView={projectViews[proposal.projectId] ?? null} t={t} /><p class="review-content">{item.candidate.rationale}</p>{item.candidate.confidence && <div class="review-item-meta"><span>{t("review.confidence")} {item.candidate.confidence}</span></div>}</div></label>)}</section>}
          <footer class="review-actions"><div><strong>{t("review.selected", { selected: selectedCount, total: proposal.itemCount })}</strong><span>{t("review.unselectedNote")}</span></div><button class="danger-button" disabled={busy} onClick={() => requestReject(proposal)}><XCircle size={16} />{t("review.rejectAll")}</button><button class="primary-button" disabled={busy || selectedCount === 0} onClick={() => requestAccept(proposal)}>{busy ? <LoaderCircle class="spin" size={16} /> : <CheckCircle2 size={16} />}{t("review.accept", { count: selectedCount })}</button></footer>
        </div>
      </details>;
    })}</div>
    {confirmation && <div class="review-confirmation-backdrop" role="presentation" onClick={() => busyProposalId === null && setConfirmation(null)}>
      <section class="review-confirmation-dialog" role="dialog" aria-modal="true" aria-labelledby="review-confirmation-title" onClick={(event) => event.stopPropagation()}>
        <div class={`review-confirmation-icon ${confirmation.kind === "reject" ? "danger" : ""}`}>
          {confirmation.kind === "accept" ? <ClipboardCheck size={24} /> : <ShieldAlert size={24} />}
        </div>
        <div class="review-confirmation-copy">
          <span class="eyebrow">{confirmation.kind === "refresh-sources" ? t("review.sourceConfirm") : t("review.secondConfirm")}</span>
          <h2 id="review-confirmation-title">
            {confirmation.kind === "accept"
              ? t("review.confirmAccept")
              : confirmation.kind === "refresh-sources"
                ? t("review.confirmRefresh")
                : t("review.confirmReject")}
          </h2>
          <p>{confirmation.kind === "accept"
            ? t("review.acceptDescription", { count: confirmation.selectedCount })
            : confirmation.kind === "refresh-sources"
              ? t("review.refreshDescription", { path: confirmation.sourcePath ? `“${confirmation.sourcePath}”` : "" })
              : t("review.rejectDescription", { project: buildDesktopReviewProposals([confirmation.proposal], hub)[0]?.projectName ?? confirmation.proposal.projectId })}</p>
          {confirmation.kind === "accept" && confirmation.rejectedCount > 0 && <div class="review-confirmation-warning"><ShieldAlert size={17} /><span>{t("review.rejectedWarning", { count: confirmation.rejectedCount })}</span></div>}
          {confirmation.kind === "refresh-sources" && <div class="review-confirmation-warning"><ShieldAlert size={17} /><span>{t("review.refreshWarning")}</span></div>}
          {confirmation.kind === "reject" && <div class="review-confirmation-warning"><ShieldAlert size={17} /><span>{t("review.rejectWarning")}</span></div>}
        </div>
        <footer class="review-confirmation-actions">
          <button class="secondary-button" disabled={busyProposalId !== null} onClick={() => setConfirmation(null)}>{t("common.cancel")}</button>
          <button class={confirmation.kind === "reject" ? "danger-button" : "primary-button"} disabled={busyProposalId !== null} onClick={() => void confirmReview()}>
            {busyProposalId !== null ? <LoaderCircle class="spin" size={16} /> : confirmation.kind === "reject" ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
            {busyProposalId !== null
              ? t("review.processing")
              : confirmation.kind === "accept"
                ? t("review.accept", { count: confirmation.selectedCount })
                : confirmation.kind === "refresh-sources"
                  ? t("review.updateSourceAccept")
                  : t("review.confirmRejectButton")}
          </button>
        </footer>
      </section>
    </div>}
  </section>;
}
