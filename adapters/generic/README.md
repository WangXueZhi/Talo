# Generic Talo Agent Skill

Use `project-memory/` as a user-level Skill on any local agent platform that can execute Node.js and
read local files. The bundled Skill calls the shared core CLI; it does not parse storage files.

Pure web AI products without local file/script access cannot read the live store. Export `story` or
`brief` explicitly for those products.

Every proposal must identify the concrete agent that submitted it. Pass that stable name with
`--platform` or `actor.platform`; omitted or `generic` sources are rejected for new proposals.
