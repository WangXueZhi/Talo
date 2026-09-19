# Project Memory Local Workflow

These instructions apply to the entire repository.

- After every user-requested code, Skill, integration, or desktop change, run the relevant tests and
  then run `pnpm reinstall:local` with sandbox escalation so the built application replaces the
  existing `/Applications/Project Memory.app`.
- Do not report a change as complete until Codex and Antigravity integration status has been checked
  after the reinstall.
- The reinstall is required even when source tests pass; the installed desktop runtime and adapter
  copies are part of the deliverable.
- If a Codex managed permission profile blocks the normal Project Memory home, use
  `~/.project-memory/bin/project-memory` with narrow sandbox escalation for Project Memory commands.
  Never request a broad `node` or shell approval prefix.
