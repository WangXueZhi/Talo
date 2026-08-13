# Security Policy

English | [简体中文](SECURITY.zh-CN.md)

## Trust Model

In simple terms, installing Talo lets it read files inside projects that you explicitly
register. It cannot read another registered project merely because that project exists. You must
approve a one-way link first. The plugin does not provide cross-project writes and does not use the
network.

Talo blocks common secret files, rejects paths that try to leave the approved project, limits
how much data one request can read, and rejects text that looks like a credential in a memory
proposal. Plugin state stays outside registered projects. Private file permissions restrict access
to the current user where the operating system supports them. File updates use a single replacement
operation so an interrupted write is less likely to corrupt stored memory. These controls reduce
risk, but real secrets should still be kept outside source trees.

When Codex exposes `request_user_input`, the Skill asks whether to save all, select items, or skip.
When that tool is unavailable, the configured fallback commits all proposed memories and
relationships automatically. The final response must identify the fallback. Users who require
mandatory review should not enable this policy without changing the Skill instructions.

## Reporting

Do not include real credentials, private source code, or project-memory state files in public
security reports. Report vulnerabilities through a private security advisory:

https://github.com/WangXueZhi/Talo/security/advisories/new

## Data Removal

Use the `forget` command for selected memories and `forget-relations` for selected relationships.
To remove all Talo data, stop connected agents and delete the configured Talo data directory. Back
up that directory first if recovery may be needed.
