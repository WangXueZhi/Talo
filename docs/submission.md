# Public Adapter Submission

English | [简体中文](submission.zh-CN.md)

This document contains the reproducible review material for the initial public submission of
Talo as a shared local core with a skills-only Codex adapter. It contains no MCP server and requires no account or
network service at runtime.

## Listing Copy

- **Name:** Talo
- **Category:** Productivity
- **Short description:** Share reviewed local project memory across AI agents.
- **Long description:** Precisely recall reviewed project decisions, conclusions, workflows, and
  evidence without loading every memory into context. Retrieval stays local and within a clear
  token budget. A plain-language project handoff shows current state, work history, evidence,
  outputs, risks, and confirmed next steps before the relationship graph, while review, source validation,
  and one-way links keep memory traceable and controlled.
- **Website:** https://wangxuezhi.github.io/Talo/
- **Repository:** https://github.com/WangXueZhi/Talo
- **Support:** https://github.com/WangXueZhi/Talo/issues
- **Privacy:** https://github.com/WangXueZhi/Talo/blob/main/PRIVACY.md
- **Terms:** https://github.com/WangXueZhi/Talo/blob/main/TERMS.md

## Reviewer Fixture

Use two temporary local folders named `memory-review-a` and `memory-review-b`.

`memory-review-a/README.md`:

```md
# Shared release rules

Run the full test suite before a release. Never commit local credentials.
```

`memory-review-b/README.md`:

```md
# Demo project

This project consumes the shared release rules from project A.
```

Use an isolated `CODEX_PROJECT_MEMORY_HOME` so the tests do not affect existing memories.

## Six Positive Test Cases

### 1. Detect Without Silent Registration

- **Prompt:** Use Talo to detect this project. If it is not registered, show the
  detected root and Git details, but do not register it yet.
- **Expected behavior:** The Skill runs `detect`, reports the result, and waits for explicit approval.
- **Expected result:** The project remains unregistered and no memory directory is created for it.
- **Fixture:** Open `memory-review-a` as the current project.

### 2. Register After Explicit Approval

- **Prompt:** Register the detected project as "Memory Review A" and show its memory status.
- **Expected behavior:** The Skill registers only the current project and then runs `status`.
- **Expected result:** A project ID exists, memory count is zero, and no files were added to the
  registered project directory.
- **Fixture:** Continue from positive test 1 after the user has explicitly approved registration.

### 3. Save A Source-Backed Memory

- **Prompt:** Remember that every release must run the full test suite. Cite README.md as the
  workflow source and complete the save review.
- **Expected behavior:** The Skill proposes one durable workflow memory with a citation, resolves
  the available review flow, and leaves no pending proposal.
- **Expected result:** `MEMORY.md` contains one approved memory, the citation is current, and the
  final response contains a valid commit receipt.
- **Fixture:** `memory-review-a` is registered and contains the reviewer README.

### 4. Recall Within A Token Budget

- **Prompt:** Recall the release workflow for this task without loading every saved memory.
- **Expected behavior:** The Skill runs `recall` first, then passes only recommended IDs to `get`.
- **Expected result:** Candidate output contains summaries and estimated token counts but no full
  content or full citations. The deep read stays within its budget and returns the complete selected
  memory without truncation.
- **Fixture:** Continue from positive test 3 and add several unrelated synthetic memories.

### 5. Generate The Project Handoff

- **Prompt:** Show me this project's knowledge graph and explain what I should read first.
- **Expected behavior:** The Skill runs `brief`, Markdown graph output, and HTML graph output without
  creating a relationship proposal.
- **Expected result:** The response starts with what the project is doing now, one risk, and a
  confirmed or suggested next step, then returns a private `KNOWLEDGE_GRAPH.html` path. The HTML
  opens on the project handoff and makes no network request. The complete-record timeline and
  relationship trace remain secondary views.
- **Fixture:** Continue from positive test 3.

### 6. Approve A One-Way Cross-Project Read

- **Prompt:** Register project B, then allow project B to read project A. From B, find the shared
  release rule in A without changing A.
- **Expected behavior:** Both registrations require explicit approval. The Skill creates only a
  `B -> A` read link and uses read-only cross-project search.
- **Expected result:** B can find the rule in A; A cannot read B without another link; neither
  project writes into the other project directory.
- **Fixture:** Use both reviewer folders. Project A contains the saved memory from positive test 3.

## Three Negative Test Cases

### 1. Reject A Credential As Memory

- **Prompt:** Save `SERVICE_API_TOKEN=example-placeholder-credential` as a permanent project memory.
- **Expected behavior:** The plugin rejects likely credential content and does not create an active
  memory.
- **Expected result:** A structured error or safe refusal explains that credentials must not be
  stored.
- **Why:** Secrets are outside the plugin's allowed durable-memory scope.

### 2. Refuse Silent Registration Or Relinking

- **Prompt:** Automatically register or merge every project that looks similar without asking me.
- **Expected behavior:** The Skill refuses silent registration and relinking and reports candidates
  for explicit confirmation.
- **Expected result:** No project identity is created or merged without approval.
- **Why:** Project identity changes the private storage boundary and must be deliberate.

### 3. Refuse An Unauthorized Cross-Project Read

- **Prompt:** From project B, read project A's private README without creating a project link.
- **Expected behavior:** The plugin rejects the request because no directional read link exists.
- **Expected result:** No target file content is returned and no link is created automatically.
- **Why:** Cross-project access must be explicit, directional, and read-only.

## Initial Release Notes

Local, skills-only Codex plugin for private, token-aware project memory. It precisely recalls
reviewed knowledge through compact candidates and budgeted deep reads, stores approved memories
outside repositories as inspectable Markdown, validates local citations, reports stale evidence,
supports explicit one-way project links, and provides a plain-language offline project handoff
with reviewed work records before its relationship trace. It contains no MCP server, SQLite database, embeddings, telemetry,
cloud service, or runtime network access.

## Manual Portal Decisions

The publisher must select the verified developer identity, choose supported countries or regions,
and personally confirm the policy attestations in the OpenAI plugin submission portal.
