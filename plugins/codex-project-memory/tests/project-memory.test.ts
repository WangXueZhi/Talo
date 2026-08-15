import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { ProjectMemoryError } from "../src/errors.js";
import { createTestContext, initGitRepo, makeProject, writeProjectFile } from "./helpers.js";

const cleanups: Array<() => void> = [];

afterEach(() => {
  while (cleanups.length > 0) {
    cleanups.pop()?.();
  }
});

describe("project identity", () => {
  test("registers a non-git project only after an explicit call", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectPath = makeProject(context.root, "plain-project");

    const detected = context.service.detectProject(projectPath);
    expect(detected.isGit).toBe(false);
    expect(detected.registeredProject).toBeNull();

    const registered = context.service.registerProject(projectPath);
    expect(registered.name).toBe("plain-project");
    expect(context.service.detectProject(projectPath).registeredProject?.id).toBe(registered.id);
  });

  test("recognizes git worktrees as relocation candidates instead of merging silently", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const repo = makeProject(context.root, "repo");
    const worktree = path.join(context.root, "repo-worktree");
    initGitRepo(repo);
    const registered = context.service.registerProject(repo);
    execFileSync("git", ["worktree", "add", "-b", "feature", worktree], {
      cwd: repo,
      stdio: "ignore",
    });

    const detected = context.service.detectProject(worktree);
    expect(detected.registeredProject).toBeNull();
    expect(detected.relocationCandidates.map((candidate) => candidate.id)).toContain(registered.id);
    expect(() => context.service.registerProject(worktree)).toThrowError(ProjectMemoryError);

    const relinked = context.service.registerProject(worktree, undefined, registered.id);
    expect(relinked.id).toBe(registered.id);
    expect(existsSync(relinked.primaryPath)).toBe(true);
    expect(context.service.detectProject(worktree).registeredProject?.id).toBe(registered.id);
  });
});

describe("review-first memory lifecycle", () => {
  test("rejects generic as the source of a new proposal", () => {
    const context = createTestContext();
    try {
      const projectPath = makeProject(context.root, "generic-actor-project");
      const project = context.service.registerProject(projectPath);

      expect(() =>
        context.service.proposeMemory(
          project.id,
          [
            {
              kind: "status",
              title: "来源未明确",
              content: "新提案必须记录具体提交 Agent。",
            },
          ],
          [],
          [],
          { platform: "generic", adapterVersion: "test" },
        ),
      ).toThrowError(/specific agent/i);
    } finally {
      context.cleanup();
    }
  });

  test("requires complete narratives for reviewed work records and validates output citations", () => {
    const context = createTestContext();
    try {
      const projectPath = makeProject(context.root, "narrative-project");
      initGitRepo(projectPath);
      writeProjectFile(projectPath, "reports/result.md", "verified result");
      const project = context.service.registerProject(projectPath);
      expect(() =>
        context.service.proposeMemory(project.id, [
          {
            kind: "status",
            title: "未补全的工作记录",
            content: "有结论的工作必须可以交接。",
            briefRole: "progress",
          },
        ]),
      ).toThrow(/narrative/i);
      expect(() =>
        context.service.proposeMemory(project.id, [
          {
            kind: "status",
            title: "错误产出引用",
            content: "输出必须来自已验证的来源。",
            briefRole: "progress",
            citations: [{ sourcePath: "reports/result.md", role: "report" }],
            narrative: {
              occurredAt: "2026-07-20T09:00:00.000Z",
              reason: "需要保存工作结果",
              action: "生成报告",
              outcome: "报告已生成",
              conclusion: "结果可供交接",
              outputs: [{ sourcePath: "reports/missing.md" }],
            },
          },
        ]),
      ).toThrow(/verified citation/i);
    } finally {
      context.cleanup();
    }
  });

  test("rejects narratives whose occurrence time is in the future", () => {
    const context = createTestContext();
    try {
      const projectPath = makeProject(context.root, "future-narrative-project");
      initGitRepo(projectPath);
      const project = context.service.registerProject(projectPath);

      expect(() =>
        context.service.proposeMemory(project.id, [
          {
            kind: "status",
            title: "未来发生时间",
            content: "项目记忆不能记录尚未发生的工作。",
            briefRole: "progress",
            narrative: {
              occurredAt: "2099-01-01T00:00:00.000Z",
              reason: "验证发生时间",
              action: "提交项目记忆",
              outcome: "被服务层拦截",
              conclusion: "未来事件不能作为已完成工作保存",
            },
          },
        ]),
      ).toThrow(/future/i);
    } finally {
      context.cleanup();
    }
  });
  test("recalls only authorized linked memories and never audits query text", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectAPath = makeProject(context.root, "recall-source");
    const projectBPath = makeProject(context.root, "recall-client");
    const projectA = context.service.registerProject(projectAPath);
    const projectB = context.service.registerProject(projectBPath);
    const proposal = context.service.proposeMemory(projectA.id, [
      {
        kind: "decision",
        title: "Shared checkout protocol",
        summary: "The checkout protocol is reusable by authorized projects.",
        topic: "Checkout",
        content: "Use the shared checkout protocol for release verification.",
        confidence: "verified",
      },
    ]) as { id: string; items: Array<{ id: string }> };
    const sourceMemory = context.service.commitMemory(proposal.id, [proposal.items[0]?.id ?? ""])
      .memories[0];
    const auditPath = path.join(context.dataDir, "projects", projectB.id, "audit.jsonl");
    const before = readFileSync(auditPath, "utf8");

    expect(
      context.service.recallMemory(projectB.id, "checkout protocol", false, true).candidates,
    ).toEqual([]);
    context.service.linkProjects(projectB.id, projectA.id);
    const auditAfterLink = readFileSync(auditPath, "utf8");
    const recalled = context.service.recallMemory(
      projectB.id,
      "private-query-checkout-protocol",
      false,
      true,
    );
    expect(recalled.recommendedMemoryIds).toContain(sourceMemory?.id);
    expect(readFileSync(auditPath, "utf8")).toBe(auditAfterLink);
    expect(readFileSync(auditPath, "utf8")).not.toContain("private-query-checkout-protocol");
    expect(before).not.toBe(auditAfterLink);

    expect(() =>
      context.service.getMemoriesById(projectB.id, [sourceMemory?.id ?? ""], false),
    ).toThrowError(/not accessible/);
    expect(
      context.service.getMemoriesById(projectB.id, [sourceMemory?.id ?? ""], true).memories[0]
        ?.content,
    ).toContain("shared checkout protocol");
    context.service.unlinkProjects(projectB.id, projectA.id);
    expect(
      context.service.recallMemory(projectB.id, "checkout protocol", false, true).candidates,
    ).toEqual([]);
  });

  test("stores multiple citations and evaluates staleness per source", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectPath = makeProject(context.root, "citation-project");
    writeProjectFile(projectPath, "data/report.csv", "sku,sessions\na,100\n");
    writeProjectFile(projectPath, "reports/diagnosis.md", "# Diagnosis\nTraffic declined.\n");
    const project = context.service.registerProject(projectPath);
    const proposal = context.service.proposeMemory(project.id, [
      {
        kind: "status",
        title: "Traffic diagnosis",
        summary: "Traffic declined in the verified period.",
        topic: "First batch diagnosis",
        content: "The traffic decline is supported by the report and source data.",
        citations: [
          { sourcePath: "data/report.csv", role: "evidence", locator: "row a" },
          { sourcePath: "reports/diagnosis.md", role: "report", note: "Readable diagnosis" },
        ],
      },
    ]) as { id: string; items: Array<{ id: string }> };
    const memory = context.service.commitMemory(proposal.id, [proposal.items[0]?.id ?? ""])
      .memories[0];

    expect(memory?.citations).toHaveLength(2);
    expect(memory?.citations.every((citation) => citation.stale === false)).toBe(true);
    writeProjectFile(projectPath, "data/report.csv", "sku,sessions\na,80\n");
    const refreshed = context.service.getContext(project.id)[0];
    expect(refreshed?.stale).toBe(true);
    expect(refreshed?.citations.filter((citation) => citation.stale)).toHaveLength(1);
    expect(refreshed?.citations[0]?.staleReason).toBe("source_file_changed");

    expect(() =>
      context.service.proposeMemory(project.id, [
        {
          kind: "status",
          title: "Duplicate sources",
          content: "Duplicate citations must be rejected.",
          citations: [
            { sourcePath: "reports/diagnosis.md", role: "report" },
            { sourcePath: "reports/diagnosis.md", role: "report" },
          ],
        },
      ]),
    ).toThrowError(/Duplicate memory citation/);
  });

  test("reviews enrichment updates without replacing title or content", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectPath = makeProject(context.root, "update-project");
    writeProjectFile(projectPath, "reports/final.md", "# Final report\n");
    const project = context.service.registerProject(projectPath);
    const createdProposal = context.service.proposeMemory(project.id, [
      { kind: "status", title: "Original title", content: "Original durable content." },
      { kind: "status", title: "Unchanged title", content: "Unchanged durable content." },
    ]) as { id: string; items: Array<{ id: string }> };
    const created = context.service.commitMemory(
      createdProposal.id,
      createdProposal.items.map((item) => item.id),
    ).memories;
    const memory = created[0];
    const unchanged = created[1];
    const updateProposal = context.service.proposeMemory(
      project.id,
      [],
      [],
      [
        {
          memoryId: memory?.id ?? "",
          summary: "Readable summary",
          topic: "Release",
          briefRole: "conclusion",
          citations: [{ sourcePath: "reports/final.md", role: "report" }],
        },
        {
          memoryId: unchanged?.id ?? "",
          summary: "This update is not accepted",
          topic: "Dropped",
        },
      ],
    ) as { id: string; updateItems: Array<{ id: string }> };
    const result = context.service.commitMemory(
      updateProposal.id,
      [],
      [],
      [updateProposal.updateItems[0]?.id ?? ""],
    );

    expect(result.updatedMemories).toHaveLength(1);
    expect(result.updatedMemories[0]).toMatchObject({
      title: "Original title",
      content: "Original durable content.",
      summary: "Readable summary",
      topic: "Release",
      briefRole: "conclusion",
    });
    expect(result.updatedMemories[0]?.citations).toHaveLength(1);
    expect(
      context.service.getContext(project.id).find((item) => item.id === unchanged?.id),
    ).toMatchObject({
      summary: null,
      topic: null,
    });
    expect(context.service.store.getProposal(updateProposal.id)?.updateItems).toMatchObject([
      { status: "accepted" },
      { status: "rejected", rejectionReason: "not_accepted" },
    ]);
  });

  test("reads legacy memory v1 and writes v6 only after an accepted update", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectPath = makeProject(context.root, "legacy-project");
    const project = context.service.registerProject(projectPath);
    const memoryId = randomUUID();
    const memoryPath = path.join(context.dataDir, "projects", project.id, "MEMORY.md");
    const metadata = {
      schemaVersion: 1,
      projectId: project.id,
      memories: [
        {
          id: memoryId,
          projectId: project.id,
          kind: "status",
          title: "Legacy memory",
          tags: [],
          sourceProjectId: null,
          sourcePath: null,
          sourceCommit: null,
          sourceFileHash: null,
          confidence: "observed",
          status: "active",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    };
    writeFileSync(
      memoryPath,
      `---\n${JSON.stringify(metadata, null, 2)}\n---\n\n# Project Memory\n\n## [${memoryId}] Legacy memory\n\nLegacy content.\n`,
    );
    expect(context.service.getContext(project.id)[0]).toMatchObject({
      summary: null,
      topic: null,
      briefRole: null,
      citations: [],
      submittedBy: null,
      sourceProposalId: null,
    });
    expect(
      context.service.recallMemory(project.id, "Legacy content", false).candidates[0]?.summary,
    ).toBe("Legacy content.");
    expect(readFileSync(memoryPath, "utf8")).toContain('"schemaVersion": 1');

    const proposal = context.service.proposeMemory(
      project.id,
      [],
      [],
      [{ memoryId, summary: "Legacy summary", topic: "Legacy", briefRole: "reference" }],
    ) as { id: string; updateItems: Array<{ id: string }> };
    context.service.commitMemory(proposal.id, [], [], [proposal.updateItems[0]?.id ?? ""]);
    expect(readFileSync(memoryPath, "utf8")).toContain('"schemaVersion": 6');
    expect(context.service.getContext(project.id)[0]?.briefRole).toBe("reference");
  });

  test("reads memory v2 without rewriting or inventing a reviewed brief role", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectPath = makeProject(context.root, "v2-project");
    const project = context.service.registerProject(projectPath);
    const memoryId = randomUUID();
    const memoryPath = path.join(context.dataDir, "projects", project.id, "MEMORY.md");
    const metadata = {
      schemaVersion: 2,
      projectId: project.id,
      memories: [
        {
          id: memoryId,
          projectId: project.id,
          kind: "pitfall",
          title: "V2 evidence boundary",
          summary: "Legacy v2 summary",
          topic: "Diagnosis",
          tags: [],
          sourceProjectId: null,
          sourcePath: null,
          sourceCommit: null,
          sourceFileHash: null,
          citations: [],
          confidence: "verified",
          status: "active",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    };
    writeFileSync(
      memoryPath,
      `---\n${JSON.stringify(metadata, null, 2)}\n---\n\n# Project Memory\n\n## [${memoryId}] V2 evidence boundary\n\nLegacy v2 content.\n`,
    );

    expect(context.service.getContext(project.id)[0]).toMatchObject({
      summary: "Legacy v2 summary",
      topic: "Diagnosis",
      briefRole: null,
    });
    expect(readFileSync(memoryPath, "utf8")).toContain('"schemaVersion": 2');
  });

  test("reads schema v4 with missing event metadata as null", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const project = context.service.registerProject(makeProject(context.root, "v4-project"));
    const memoryId = randomUUID();
    const memoryPath = path.join(context.dataDir, "projects", project.id, "MEMORY.md");
    const metadata = {
      schemaVersion: 4,
      projectId: project.id,
      memories: [
        {
          id: memoryId,
          projectId: project.id,
          kind: "status",
          title: "Schema four memory",
          summary: "Existing content remains unchanged",
          topic: "Compatibility",
          briefRole: "progress",
          narrative: null,
          tags: [],
          sourceProjectId: null,
          sourcePath: null,
          sourceCommit: null,
          sourceFileHash: null,
          citations: [],
          confidence: "verified",
          status: "active",
          createdAt: "2026-07-29T00:00:00.000Z",
          updatedAt: "2026-07-29T00:00:00.000Z",
        },
      ],
    };
    writeFileSync(
      memoryPath,
      `---\n${JSON.stringify(metadata, null, 2)}\n---\n\n# Project Memory\n\n## [${memoryId}] Schema four memory\n\nOriginal schema four content.\n`,
    );
    expect(context.service.getContext(project.id)[0]).toMatchObject({
      title: "Schema four memory",
      content: "Original schema four content.",
      workUnitId: null,
      runId: null,
      phase: null,
      sequence: null,
    });
    expect(readFileSync(memoryPath, "utf8")).toContain('"schemaVersion": 4');
  });

  test("writes schema v6 event metadata through reviewed proposals", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const project = context.service.registerProject(makeProject(context.root, "event-metadata"));
    const proposal = context.service.proposeMemory(project.id, [
      {
        kind: "status",
        title: "Weekly review data collected",
        content: "Three source reports were collected.",
        workUnitId: "amazon-weekly-2026-07-29",
        runId: "run-2026-07-29",
        phase: "data_collection",
        sequence: 1,
      },
    ]) as { id: string; items: Array<{ id: string }> };
    const memory = context.service.commitMemory(proposal.id, [proposal.items[0]?.id ?? ""])
      .memories[0];
    expect(memory).toMatchObject({
      workUnitId: "amazon-weekly-2026-07-29",
      runId: "run-2026-07-29",
      phase: "data_collection",
      sequence: 1,
    });
    const memoryPath = path.join(context.dataDir, "projects", project.id, "MEMORY.md");
    expect(readFileSync(memoryPath, "utf8")).toContain('"schemaVersion": 6');
  });

  test("stores the original submitter and recovers it from an accepted proposal", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const project = context.service.registerProject(makeProject(context.root, "submitter-project"));
    const proposal = context.service.proposeMemory(
      project.id,
      [
        {
          kind: "decision",
          title: "Contract-driven collection",
          content: "Daily observation follows a reviewed data contract.",
        },
      ],
      [],
      [],
      { platform: "antigravity", adapterVersion: "2026.8.9" },
    ) as { id: string; items: Array<{ id: string }> };
    const memory = context.service.commitMemory(proposal.id, [proposal.items[0]?.id ?? ""])
      .memories[0];
    expect(memory).toMatchObject({
      submittedBy: { platform: "antigravity", adapterVersion: "2026.8.9" },
      sourceProposalId: proposal.id,
    });

    const memoryPath = path.join(context.dataDir, "projects", project.id, "MEMORY.md");
    const document = readFileSync(memoryPath, "utf8");
    const frontMatter = document.match(/^---\n([\s\S]*?)\n---\n/);
    expect(frontMatter).not.toBeNull();
    const metadata = JSON.parse(frontMatter?.[1] ?? "{}") as {
      schemaVersion: number;
      memories: Array<Record<string, unknown>>;
    };
    metadata.schemaVersion = 5;
    delete metadata.memories[0]?.submittedBy;
    delete metadata.memories[0]?.sourceProposalId;
    writeFileSync(
      memoryPath,
      document.replace(frontMatter?.[0] ?? "", `---\n${JSON.stringify(metadata, null, 2)}\n---\n`),
    );

    expect(context.service.getContext(project.id)[0]).toMatchObject({
      submittedBy: { platform: "antigravity", adapterVersion: "2026.8.9" },
      sourceProposalId: proposal.id,
    });
  });

  test("normalizes Claude Code submitters to the canonical claude platform", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const project = context.service.registerProject(makeProject(context.root, "claude-submitter"));
    const proposal = context.service.proposeMemory(
      project.id,
      [{ kind: "decision", title: "Claude integration", content: "Use the shared local adapter." }],
      [],
      [],
      { platform: "claude-code", adapterVersion: "2.1.219" },
    ) as { id: string; actor: { platform: string }; items: Array<{ id: string }> };
    expect(proposal.actor.platform).toBe("claude");
    const memory = context.service.commitMemory(proposal.id, [proposal.items[0]?.id ?? ""])
      .memories[0];
    expect(memory?.submittedBy?.platform).toBe("claude");
  });

  test("keeps proposals out of search until accepted and marks changed sources stale", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectAPath = makeProject(context.root, "project-a");
    const projectBPath = makeProject(context.root, "project-b");
    writeProjectFile(projectAPath, "src/fact.ts", "export const sharedFact = 'alpha';\n");
    const projectA = context.service.registerProject(projectAPath);
    const projectB = context.service.registerProject(projectBPath);
    context.service.linkProjects(projectB.id, projectA.id);

    const proposal = context.service.proposeMemory(projectB.id, [
      {
        kind: "architecture",
        title: "Shared fact comes from project A",
        content: "Project B reads the shared alpha fact from project A.",
        tags: ["shared", "alpha"],
        sourceProjectId: projectA.id,
        sourcePath: "src/fact.ts",
        confidence: "verified",
      },
    ]) as { id: string; items: Array<{ id: string }> };

    expect(context.service.searchMemory(projectB.id, "alpha")).toEqual([]);
    const committed = context.service.commitMemory(proposal.id, [proposal.items[0]?.id ?? ""]);
    expect(committed.memories).toHaveLength(1);
    expect(context.service.searchMemory(projectB.id, "alpha")[0]?.stale).toBe(false);

    writeProjectFile(projectAPath, "src/fact.ts", "export const sharedFact = 'beta';\n");
    const stale = context.service.getContext(projectB.id)[0];
    expect(stale?.stale).toBe(true);
    expect(stale?.staleReason).toBe("source_file_changed");
  });

  test("enforces recall modes and command limits", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const project = context.service.registerProject(makeProject(context.root, "recall-limits"));
    expect(() => context.service.recallMemory(project.id, null, false)).toThrowError(/exactly one/);
    expect(() => context.service.recallMemory(project.id, "query", true)).toThrowError(
      /exactly one/,
    );
    expect(() => context.service.recallMemory(project.id, "query", false, false, 21)).toThrowError(
      /between 1 and 20/,
    );
    expect(() =>
      context.service.recallMemory(project.id, "query", false, false, 8, 6),
    ).toThrowError(/between 1 and 5/);
    expect(() =>
      context.service.recallMemory(project.id, "query", false, false, 8, 3, 16001),
    ).toThrowError(/between 1 and 16000/);
  });

  test("rejects suspected secrets before creating a proposal", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectPath = makeProject(context.root, "secret-project");
    const project = context.service.registerProject(projectPath);

    expect(() =>
      context.service.proposeMemory(project.id, [
        {
          kind: "status",
          title: "Temporary credential",
          content: "api_key = 'example_credential_value_1234'",
        },
      ]),
    ).toThrowError(/Potential secret/);
  });

  test("supports file-backed search, export, rejection, and permanent forgetting", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectPath = makeProject(context.root, "memory-project");
    const project = context.service.registerProject(projectPath);
    const rejected = context.service.proposeMemory(project.id, [
      { kind: "status", title: "Transient status", content: "Release is waiting." },
    ]) as { id: string };
    context.service.rejectMemory(rejected.id);

    const proposal = context.service.proposeMemory(project.id, [
      {
        kind: "workflow",
        title: "Verification command",
        content: "Run pnpm test before reporting completion.",
        tags: ["verification"],
      },
    ]) as { id: string; items: Array<{ id: string }> };
    const [memory] = context.service.commitMemory(proposal.id, [
      proposal.items[0]?.id ?? "",
    ]).memories;
    expect(context.service.searchMemory(project.id, "verification")).toHaveLength(1);
    expect((context.service.store.exportProject(project.id).memories as unknown[]).length).toBe(1);
    expect(context.service.store.forgetMemories(project.id, [memory?.id ?? ""])).toEqual([
      memory?.id,
    ]);
    expect(context.service.getContext(project.id)).toEqual([]);
  });

  test("stores approved memories as private Markdown outside the project", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectPath = makeProject(context.root, "markdown-project");
    const project = context.service.registerProject(projectPath);
    const proposal = context.service.proposeMemory(project.id, [
      {
        kind: "decision",
        title: "External storage",
        content: "Keep durable memory outside the registered project.",
        tags: ["storage"],
      },
    ]) as { id: string; items: Array<{ id: string }> };

    context.service.commitMemory(proposal.id, [proposal.items[0]?.id ?? ""]);

    const memoryPath = path.join(context.dataDir, "projects", project.id, "MEMORY.md");
    expect(existsSync(memoryPath)).toBe(true);
    expect(existsSync(path.join(context.dataDir, "memory.sqlite3"))).toBe(false);
    expect(existsSync(path.join(projectPath, "MEMORY.md"))).toBe(false);
    expect(readFileSync(memoryPath, "utf8")).toContain(
      "Keep durable memory outside the registered project.",
    );
    if (process.platform !== "win32") {
      expect(statSync(memoryPath).mode & 0o777).toBe(0o600);
    }
    expect(context.service.store.doctor()).toMatchObject({
      ok: true,
      storageFormat: "markdown-json",
      memorySchemaVersion: 6,
      counts: { projects: 1, memories: 1, pendingProposals: 0 },
    });
  });
});
