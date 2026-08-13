# Changelog

English | [简体中文](CHANGELOG.zh-CN.md)

All notable changes to this project are documented in this file.

## Unreleased

- No unreleased changes.

## 0.14.0 - 2026-08-13

First public Talo release.

- Renamed the public product and repository to **Talo** while preserving the
  `codex-project-memory` plugin ID, `project-memory` Skill and CLI alias, storage paths, and Adapter
  Protocol v1 compatibility.
- Added end-to-end Claude Code support across the CLI, Desktop integration management, bundled
  user-scope marketplace, session-based project discovery, platform filters, and submitter metadata.
- Added a bilingual product website, redesigned English and Chinese READMEs, a documented
  architecture, GitHub Pages deployment, and tagged cross-platform GitHub Release automation.
- Added a local reinstall workflow that rebuilds the desktop app, atomically replaces the installed
  application, and updates Codex, Claude Code, and Antigravity integrations after changes.
- Added directed `observes` and `causes` relations for reviewed event chains from task or
  observation, to finding, to resulting change.
- Multi-event non-reference work units must give every event at least one candidate relation,
  preventing final changes from being saved without their causes.
- Codex access repair installs a stable compatibility launcher and narrowly scoped rules so current
  tasks can continue when a Desktop-managed permission profile masks `writable_roots`.

- Added `integration install|status|remove antigravity` for one-time Codex-managed installation,
  inspection, and safe removal of Antigravity's self-contained global Skill and activation rule.
- Registered projects now use the same shared memory automatically in Antigravity while
  unregistered projects continue silently and receive no project-level rule files.
- Added the native Talo Desktop app for installing, updating, migrating, repairing, and
  removing Codex and Antigravity integrations.
- Codex integration setup now adds only the active memory directory to writable roots and preserves
  a configuration backup. Marketplace-only installs can use `integration repair codex` without
  asking users to diagnose sandbox paths or edit TOML manually.
- Desktop now detects, backs up, and repairs verifiable broken local Codex marketplace paths after
  a plugin inspection failure, then retries automatically instead of leaving users with a generic
  inspection error.
- `EPERM` and `EACCES` failures now return a structured memory-home permission error and repair
  command.
- Successful proposal commits now regenerate the current project's static knowledge graph and
  return `viewRefresh`; pending proposals remain review-only and do not become official nodes.

## 0.13.0 - 2026-07-30

- Split storage, recall, review, timelines, relations, and HTML into platform-neutral `project-memory-core`.
- Added thin Codex, Claude Code, Antigravity, and generic Agent Skill adapters sharing one store and review inbox.
- Added the offline all-project Memory Hub plus `hub`, `story`, `open`, `shortcut`, `proposals`, `home`, and explicit `migrate-home`.
- Changed new-install storage to `~/.project-memory/v1` while preserving a sole legacy home and refusing silent dual-home merges.
- Added migration backups/count verification, project locks, proposal revisions, source and permission revalidation, duplicate checks, and atomic writes.
- Reduced the Codex Stop Hook to one Chinese sentence shown only for a real pending proposal.

## 0.12.0 - 2026-07-22

- Replaced the default graph landing experience with a Chinese project handoff: current state,
  where to start, recent work, and a complete work-record timeline come before relationship tracing.
- Added reviewed MEMORY v4 narratives for non-reference work records: occurred time, reason,
  action, outcome, conclusion, and outputs that must point to validated citations.
- Kept v1-v3 readable without automatic rewriting. Old records plainly show missing narrative
  details instead of inventing a project story.
- Renamed graph exploration to a secondary natural-language "cause and effect" view and added a
  filterable complete-records view.

## 0.11.0 - 2026-07-20

- Added the read-only `brief` command and a project-memory home page organized around current
  conclusions, completed work, risks, and confirmed next steps.
- Added optional reviewed `briefRole` metadata with deterministic, non-writing fallbacks for v1
  and v2 memories; memory documents now write v3 only after an accepted change.
- Deduplicated recommended reading, hid singleton topics, separated unreviewed suggestions from
  confirmed actions, and collapsed technical citation details by default.
- Moved the graph to a secondary relationship-trace view and replaced incoming/outgoing-edge
  wording with natural-language relationship explanations.
- Preserved JSON, Mermaid, graph traversal, review rules, offline CSP, local-only storage, and
  token-aware recall behavior.

## 0.10.0 - 2026-07-20

- Added deterministic, bilingual-friendly `recall` ranking with compact candidates and reviewed
  one-hop relationship signals.
- Added budgeted `get` deep reads that omit whole memories instead of truncating content.
- Changed substantial-task startup to an estimated 800-token candidate pass plus a 1700-token deep
  read, while preserving `load` and `search` compatibility.
- Added stale, confidence, and authorized linked-project ranking controls without embeddings,
  persistent indexes, query logging, or network access.
- Repositioned the project as private, token-aware project memory in the English and Chinese docs.
- Added public plugin-directory metadata, brand assets, and product screenshots.
- Added bilingual privacy, terms, support, and reviewer submission documents.
- Added direct GitHub marketplace installation instructions.

## 0.9.0 - 2026-07-14

- Added the guide-first offline knowledge workspace.
- Added deterministic, display-only relationship suggestions.
- Added knowledge summaries, gaps, highlights, and suggested questions.
- Preserved reviewed formal relationships, local citations, CSP, and offline single-file HTML.
- Kept the plugin Skill-only with no MCP server, SQLite database, telemetry, or network runtime.

## 0.8.0 - 2026-07-14

- Added the dark Cytoscape/FCoSE graph explorer and responsive reading workspace.

## 0.7.0 - 2026-07-14

- Rebuilt the offline browser with Preact, Cytoscape.js, Dagre, and Lucide.

## 0.6.0 - 2026-07-13

- Added summaries, topics, multi-source citations, Markdown output, and offline HTML views.

## 0.4.0 - 2026-07-13

- Added reviewed memory relationships and JSON/Mermaid graph queries.
