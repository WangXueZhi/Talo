# Privacy Policy

English | [简体中文](PRIVACY.zh-CN.md)

Effective date: August 13, 2026

This policy explains how Talo handles data, including its `codex-project-memory` compatibility
plugin. It covers Talo itself, not Codex, ChatGPT, GitHub, your operating system, or other services
you choose to use with it.

## What The Plugin Processes

The plugin may process:

- Paths and Git information for projects you explicitly register.
- Memory proposals, approved memories, summaries, topics, tags, and relationships.
- References to local evidence, report, workflow, and reference files.
- File hashes and Git commit identifiers used to detect changed sources.
- Local audit records describing memory operations.

The plugin does not require your name, email address, payment information, or an online account.

## Where Data Is Stored

New Talo installations store data locally under:

```text
~/.project-memory/v1/
```

A sole legacy installation may continue using `~/.codex/project-memory/v1`. If both homes exist,
Talo requires an explicit selection and does not merge them silently.

You can select another local directory with `CODEX_PROJECT_MEMORY_HOME`. Memory files are not
written into registered project directories.

## Network And Data Sharing

The plugin has no runtime network client, cloud service, telemetry, advertising, or analytics. It
does not send memory content, file content, project paths, or usage information to the developer.

Codex or another host application may process your prompts and tool activity under its own privacy
terms. That processing is outside this plugin and is not controlled by this policy.

## File Access

The plugin reads only projects you explicitly register. Reading another registered project requires
an explicit one-way link from the current project. Cross-project access is read-only.

Built-in deny rules block common credential and secret files. Additional paths can be blocked with
local `denyPatterns`. These checks reduce risk, but you should still keep secrets outside source
trees and review project access carefully.

## Save Behavior

When structured review is available, the plugin asks whether to save all proposed items, selected
items, or nothing. When that interaction is unavailable, the configured fallback saves every
proposed item and reports that automatic action in the final response.

Do not propose secrets, credentials, personal data, or confidential content that should not become
durable local memory.

## Retention And Deletion

Data stays on your computer until you delete it. You can:

- Use `forget` to remove selected memories.
- Use `forget-relations` to remove selected relationships.
- Delete the configured project-memory data directory to remove all plugin data.

Back up the directory before deletion if you may need to restore it.

## Security

The plugin uses private local permissions where the operating system supports them, validates file
paths, rejects symbolic-link escapes, limits file reads, and replaces state files atomically.
Security issues should be reported through the project's
[private security advisory page](https://github.com/WangXueZhi/Talo/security/advisories/new).

## Changes To This Policy

Material changes will be recorded in the repository and reflected by updating the effective date.

## Contact

For privacy questions, open a public issue without sensitive information at
[GitHub Issues](https://github.com/WangXueZhi/Talo/issues). Use a private security
advisory for reports that contain sensitive details.
