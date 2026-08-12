# Talo for Antigravity

Run `talo integration install antigravity` once from an installed Codex adapter. The
command installs the generated self-contained `project-memory` folder as a user-level Agent Skill
and maintains a marked activation block in the user's global `GEMINI.md`. It calls the same shared
core CLI as every other adapter, uses `actor.platform=antigravity`, and never writes project rule
files into registered projects.
