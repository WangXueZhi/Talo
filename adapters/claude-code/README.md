# Talo for Claude Code

This is a thin adapter. Its Skill calls the bundled platform-neutral `project-memory-core` CLI and
does not parse or modify memory files itself.

Install this directory as a Claude Code plugin, then use the `project-memory` Skill globally. The
adapter shares the same `~/.project-memory/v1` store and proposal inbox as Codex and other local
agents. The Skill directory name remains `project-memory` for compatibility.
