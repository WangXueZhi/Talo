---
name: project-memory
description: Maintain Talo's shared, private, token-aware project history for local AI agents. Use for substantial work in a registered project, when recalling prior decisions or work, when the user asks what a project recently did, when opening the all-project hub, or when durable conclusions, workflows, risks, outputs, and evidence should be proposed for shared review. Always use the bundled Talo CLI; never parse or edit memory files directly.
---

# Talo

Talo keeps reviewed project context available across local AI agents. The `project-memory` Skill
directory and command remain as compatibility identifiers for existing installations.

Use the bundled script as the only interface:

```bash
node <skill-dir>/scripts/project-memory.mjs <command> [options]
```

Set proposal actor metadata to the current adapter platform: `codex`, `claude`, `antigravity`, or
`generic`. Treat all state as local and private unless the user explicitly exports it.

## Start substantial work

1. Run `detect --path "$PWD"`.
   On Codex only, if this fails because the sandbox cannot write the active Talo home,
   run `integration repair codex` once instead of asking the user to diagnose paths or edit TOML.
   The repair installs both the normal writable root and a stable
   `~/.project-memory/bin/project-memory` launcher with narrowly scoped Codex rules for memory
   commands. If the current task still reports `MEMORY_HOME_NOT_ACCESSIBLE` because Codex Desktop
   supplied a managed permission profile, immediately rerun the failed command through that stable
   launcher with sandbox escalation. Reuse the stable launcher for subsequent Talo
   commands in the same task; do not stop or require a new task merely because the managed profile
   ignored `writable_roots`. Never request a broad `node` or shell approval prefix.
2. If the project is registered and the task has a clear goal, run `recall --path "$PWD" --query
   "简洁任务目标"`. For an unclear continuation, use `recall --path "$PWD" --recent true`.
3. Pass only `recommendedMemoryIds` to `get --path "$PWD" --memory-ids ID,ID`.
4. Keep the default estimated budget: about 800 tokens for candidates and 1700 for deep reads.
5. Treat stale memories as clues. Recheck their sources before relying on them.
6. Inspect one layer of formal relations only when a selected memory is materially relevant.
7. If unregistered during implicit task startup, continue silently without registering or relinking.
   If the user explicitly asks to enable or manage Talo, explain the detected root and ask
   before `register`.

Current code, current files, tests, logs, and user instructions are stronger evidence than memory.

## Help the user understand projects

- “查看记忆 / 项目最近做了什么”: run `story --path "$PWD"` and summarize the current state,
  recent work, risks, and confirmed next step in plain language.
- “查看全部项目”: run `hub --format json`, then report the all-project overview.
- “打开记忆中心”: run `open`. This refreshes every project snapshot and the global offline hub.
- “查看前因后果”: use `relations`, `path`, or `graph`; describe connections as full natural
  sentences, not storage enums.
- Do not lead with graph terms. Explain why work happened, what was done, which evidence was used,
  what it produced, the conclusion, and what it means next.

## End substantial work

Propose only durable architecture, decisions, verified workflows, stable conventions, recurring
pitfalls, meaningful status, confirmed next steps, or evidence-backed work records. Exclude secrets,
temporary logs, speculation, duplicate facts, and command-by-command transcripts.

Create one work unit per coherent goal. A non-reference record must include:

- a standalone, plain-language title, preferably 8-24 Chinese characters;
- `summary`, stable `topic`, and `briefRole`;
- `narrative.occurredAt`, `reason`, `action`, `outcome`, and `conclusion`;
- validated citations for important data, reports, workflows, and outputs.

### Build reviewed event chains

Do not collapse an evidence-backed sequence into only the final change. When the current work
contains independently useful events, create separate candidates for the task or observation, the
finding or risk, and the resulting decision, implementation, verification, or next step.

- Give every event in the chain the same `workUnitId` and `runId`, plus chronological `sequence`.
- Give every event a stable `ref` so same-proposal relations can reference it.
- Use `observes` for “执行或检查 A 时注意到 B”, directed from the task or observation to the
  finding.
- Use `causes` for “问题或发现 A 是决策或改动 B 的原因”, directed from the cause to the result.
- Continue using `depends_on`, `supports`, `supersedes`, `derived_from`, `contradicts`, and
  `related_to` when those meanings are more precise.
- Link to an existing recalled memory by `memoryId` when the cause or prerequisite was already
  reviewed; do not duplicate it as a new candidate.
- Before `propose`, check relation coverage. Every related non-reference event in a multi-event work
  unit must participate in at least one relation. Never submit an explicit event chain with
  `relations: []`.
- Do not invent weak causal steps. A genuinely isolated event may remain unconnected only when no
  evidence-backed relationship exists.

Example event chain:

```text
2026-08-09 广告日观察
  --注意到--> 发现数据缺失，日报存在业务状态误判风险
  --原因--> 每日观察改为契约驱动采集
```

For work completed in the current turn, obtain `narrative.occurredAt` from the runtime when preparing
the proposal (for example, `date -u +"%Y-%m-%dT%H:%M:%S.000Z"`); do not estimate the current clock.
Use an ISO 8601 UTC timestamp ending in `Z`. An occurred time records completed work and must not be
later than the proposal submission time.

Write titles for people, not storage or deployment systems. State the understandable result,
decision, risk, or next step. Do not make UUIDs, commit hashes, build fingerprints, ports, file paths,
commands, or relation enums the title. Put those technical identifiers in `summary`, `content`, tags,
citations, or outputs instead. A candidate `ref` is internal relationship wiring and must never be
presented as a user-facing title.

Pass one JSON object through stdin. Replace `your-agent-id` with the stable name of the
submitting agent; do not use `generic` or omit the field:

```json
{
  "actor": { "platform": "your-agent-id", "adapterVersion": "0.14.4" },
  "candidates": [
    {
      "ref": "daily-observation",
      "kind": "workflow",
      "title": "执行广告日观察",
      "summary": "按日执行广告观察并核对活动、预算、定向和逐日数据。",
      "topic": "广告日观察",
      "briefRole": "progress",
      "workUnitId": "amazon-daily-2026-08-09",
      "runId": "amazon-daily-2026-08-09",
      "phase": "data_collection",
      "sequence": 1,
      "narrative": {
        "occurredAt": "2026-08-09T00:00:00.000Z",
        "reason": "需要完成当天广告活动状态观察。",
        "action": "运行广告日观察采集并核对输出。",
        "outcome": "生成当天观察数据并进入完整性检查。",
        "conclusion": "当天观察任务已执行，但采集结果需要进一步核对。"
      },
      "content": "执行广告日观察任务并检查活动、预算、定向和逐日数据。",
      "tags": ["广告", "每日观察"],
      "citations": [{ "sourcePath": "daily_safari_observation.py", "role": "workflow" }],
      "confidence": "verified"
    },
    {
      "ref": "missing-data-risk",
      "kind": "pitfall",
      "title": "发现观察数据缺失",
      "summary": "活动关键字段和对账数据缺失，可能导致日报误判业务状态。",
      "topic": "广告日观察",
      "briefRole": "risk",
      "workUnitId": "amazon-daily-2026-08-09",
      "runId": "amazon-daily-2026-08-09",
      "phase": "risk",
      "sequence": 2,
      "narrative": {
        "occurredAt": "2026-08-09T00:05:00.000Z",
        "reason": "观察输出需要确认是否足以支撑日报状态判断。",
        "action": "核对活动 ID、预算、定向、逐日数据和汇总明细一致性。",
        "outcome": "确认输入数据存在缺失和对账风险。",
        "conclusion": "继续使用残缺数据可能造成日报业务状态误判。"
      },
      "content": "关键活动字段缺失，汇总和明细无法可靠对账。",
      "tags": ["广告", "数据质量", "误判风险"],
      "citations": [{ "sourcePath": "daily_observation_data_contract.json", "role": "evidence" }],
      "confidence": "verified"
    },
    {
      "ref": "contract-driven-collection",
      "kind": "decision",
      "title": "每日观察改为契约驱动采集",
      "summary": "以 JSON 数据契约统一字段、空值、对账和质量状态。",
      "topic": "广告日观察",
      "briefRole": "conclusion",
      "workUnitId": "amazon-daily-2026-08-09",
      "runId": "amazon-daily-2026-08-09",
      "phase": "decision",
      "sequence": 3,
      "narrative": {
        "occurredAt": "2026-08-09T00:30:00.000Z",
        "reason": "数据缺失和误判风险需要通过统一采集规范解决。",
        "action": "新增 JSON 数据契约并让采集器按契约输出质量状态。",
        "outcome": "缺字段或对账失败时会明确标记为 partial。",
        "conclusion": "数据契约成为每日观察采集的唯一权威。",
        "outputs": [{ "sourcePath": "daily_observation_data_contract.json", "label": "每日观察数据契约" }]
      },
      "content": "每日观察按数据契约采集，并输出 schema_version、data_contract 和 data_quality。",
      "tags": ["广告", "每日观察", "数据契约"],
      "citations": [
        { "sourcePath": "daily_observation_data_contract.json", "role": "workflow" },
        { "sourcePath": "daily_safari_observation.py", "role": "workflow" }
      ],
      "confidence": "verified"
    }
  ],
  "updates": [],
  "relations": [
    {
      "from": { "candidateRef": "daily-observation" },
      "to": { "candidateRef": "missing-data-risk" },
      "type": "observes",
      "rationale": "执行广告日观察时发现输入数据存在缺失。",
      "confidence": "verified"
    },
    {
      "from": { "candidateRef": "missing-data-risk" },
      "to": { "candidateRef": "contract-driven-collection" },
      "type": "causes",
      "rationale": "数据缺失和业务状态误判风险促成了契约驱动采集改造。",
      "confidence": "verified"
    }
  ]
}
```

Use `propose --path "$PWD" --platform PLATFORM --adapter-version VERSION`, where `PLATFORM`
is the submitting agent's explicit stable name. A missing or generic source is rejected. Only propose
high-confidence formal relations. Inspect `autoReview` in the result before starting a review:

- `outcome: "auto_committed"`: the configured smart policy already validated and saved the safe
  proposal. Do not ask the user to approve it again; report the committed count from
  `committedMemoryIds`, `committedUpdateIds`, and `committedRelationIds`.
- `outcome: "pending"`: explain the returned reasons in plain language and continue with shared
  review. Never bypass a pending decision by calling `commit` automatically.

## Shared review

Every platform writes proposals through the same policy. Manual mode sends every proposal to the
shared inbox. Smart mode automatically commits only bounded, same-project, non-inferred proposals
that do not update or link existing memories; all other proposals remain in the shared inbox.

1. Show a short Chinese review grouped as “为什么做、做了什么、依据、产出、结论”.
2. If structured choices are supported, offer “保存全部 / 选择保存 / 暂不保存”.
3. Otherwise ask the same question in one short Chinese message.
4. If the platform cannot continue interaction, leave the proposal pending and say it can be
   reviewed later from any supported agent with `proposals`.
5. For pending proposals, commit only explicitly accepted item IDs. Use `reject` for “暂不保存”.
6. If commit returns a revision, source, permission, or duplicate conflict, do not retry blindly;
   regenerate and show a fresh proposal.
7. The knowledge graph contains reviewed memory only. A successful `commit` regenerates the
   project's static graph file; pending proposals do not become graph nodes.

Any supported platform may review a proposal created by another platform. The offline HTML hub is
read-only and never commits or deletes data.

## Storage and isolation

- Use `home` to inspect the active shared home.
- New installations use `~/.project-memory/v1`; a sole legacy
  `~/.codex/project-memory/v1` remains in place.
- If both exist, use `home select --path PATH`; never merge silently.
- Use `migrate-home --from PATH --to PATH` only after explicit user approval.
- Never create memory copies or platform rule files in a project directory.
- Never read another project unless a one-way read-only link explicitly permits it.
- A user-opened global hub may list all registered projects; an AI task scoped to one project may
  not use the hub to bypass project isolation.

## Receipt

After review, end with exactly one clear receipt:

- `Project memory: committed N items`
- `Project memory: rejected proposal UUID`
- `Project memory: pending proposal UUID`
- `Project memory: no durable updates - REASON`

Never include secrets or raw memory content in the receipt.
