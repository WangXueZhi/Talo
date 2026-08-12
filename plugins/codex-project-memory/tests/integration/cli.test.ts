import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";

const cleanups: Array<() => void> = [];

afterEach(() => {
  while (cleanups.length > 0) cleanups.pop()?.();
});

function runCli(
  cwd: string,
  dataDir: string,
  args: string[],
  input?: unknown,
): Record<string, unknown> {
  const result = spawnSync(process.execPath, [path.resolve("dist/project-memory.mjs"), ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, CODEX_PROJECT_MEMORY_HOME: dataDir },
    input: input === undefined ? undefined : JSON.stringify(input),
  });
  if (result.status !== 0) throw new Error(result.stderr);
  return JSON.parse(result.stdout) as Record<string, unknown>;
}

function runCliText(cwd: string, dataDir: string, args: string[]): string {
  const result = spawnSync(process.execPath, [path.resolve("dist/project-memory.mjs"), ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, CODEX_PROJECT_MEMORY_HOME: dataDir },
  });
  if (result.status !== 0) throw new Error(result.stderr);
  return result.stdout;
}

function runCliFailure(cwd: string, dataDir: string, args: string[]): string {
  const result = spawnSync(process.execPath, [path.resolve("dist/project-memory.mjs"), ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, CODEX_PROJECT_MEMORY_HOME: dataDir },
  });
  if (result.status === 0) throw new Error("Expected CLI command to fail.");
  return result.stderr;
}

describe("Skill CLI", () => {
  test("repairs Codex sandbox access without initializing the memory store", () => {
    const root = mkdtempSync(path.join(tmpdir(), "codex-project-memory-repair-"));
    cleanups.push(() => rmSync(root, { recursive: true, force: true }));
    const pluginRoot = path.resolve(".");
    const binDir = path.join(root, "bin");
    const codexPath = path.join(binDir, process.platform === "win32" ? "codex.cmd" : "codex");
    const codexHome = path.join(root, "codex-home");
    const dataDir = path.join(root, "memory", "v1");
    mkdirSync(binDir, { recursive: true });
    writeFileSync(
      codexPath,
      process.platform === "win32"
        ? '@echo off\r\nif "%~1"=="--version" (\r\n  echo codex-cli test\r\n  exit /b 0\r\n)\r\necho {"installed":[],"available":[]}\r\n'
        : '#!/bin/sh\nif [ "$1" = "--version" ]; then echo "codex-cli test"; exit 0; fi\necho \'{"installed":[],"available":[]}\'\n',
    );
    if (process.platform !== "win32") chmodSync(codexPath, 0o755);

    const result = spawnSync(
      process.execPath,
      [path.resolve("dist/project-memory.mjs"), "integration", "repair", "codex"],
      {
        cwd: pluginRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          PATH: `${binDir}${path.delimiter}${process.env.PATH ?? ""}`,
          CODEX_HOME: codexHome,
          CODEX_PROJECT_MEMORY_HOME: dataDir,
        },
      },
    );
    if (result.status !== 0) throw new Error(result.stderr);
    expect(JSON.parse(result.stdout)).toMatchObject({
      state: "configured",
      action: "repaired",
      restartRequired: true,
    });
    expect(readFileSync(path.join(codexHome, "config.toml"), "utf8")).toContain(dataDir);
  });

  test("requires explicit source refresh before committing stale evidence", () => {
    const root = mkdtempSync(path.join(tmpdir(), "codex-project-memory-source-refresh-"));
    cleanups.push(() => rmSync(root, { recursive: true, force: true }));
    const pluginRoot = path.resolve(".");
    const dataDir = path.join(root, "data");
    const projectPath = path.join(root, "project");
    mkdirSync(projectPath);
    writeFileSync(path.join(projectPath, "evidence.md"), "first\n");

    const project = runCli(pluginRoot, dataDir, ["register", "--path", projectPath]);
    const proposal = runCli(pluginRoot, dataDir, ["propose", "--path", projectPath], {
      candidates: [
        {
          kind: "status",
          title: "来源需要确认",
          content: "这条内容仍然适用于当前文件。",
          citations: [{ sourcePath: "evidence.md", role: "evidence" }],
        },
      ],
    });
    const items = proposal.items as Array<{ id: string }>;
    writeFileSync(path.join(projectPath, "evidence.md"), "updated\n");

    const staleError = runCliFailure(pluginRoot, dataDir, [
      "commit",
      "--proposal-id",
      proposal.id as string,
      "--accepted-item-ids",
      items[0]?.id ?? "",
    ]);
    expect(staleError).toContain("STALE_SOURCE");

    const refreshed = runCli(pluginRoot, dataDir, [
      "commit",
      "--proposal-id",
      proposal.id as string,
      "--accepted-item-ids",
      items[0]?.id ?? "",
      "--refresh-sources",
      "true",
    ]);
    expect(refreshed.memories).toHaveLength(1);
    expect(project.id).toBeTruthy();
  });

  test("completes registration, linking, read-only search, and reviewed commit", () => {
    const root = mkdtempSync(path.join(tmpdir(), "codex-project-memory-cli-"));
    cleanups.push(() => rmSync(root, { recursive: true, force: true }));
    const pluginRoot = path.resolve(".");
    const dataDir = path.join(root, "data");
    const projectAPath = path.join(root, "a");
    const projectBPath = path.join(root, "b");
    mkdirSync(projectAPath);
    mkdirSync(projectBPath);
    writeFileSync(path.join(projectAPath, "README.md"), "shared protocol lives here\n");

    const projectA = runCli(pluginRoot, dataDir, ["register", "--path", projectAPath]);
    const projectB = runCli(pluginRoot, dataDir, ["register", "--path", projectBPath]);
    runCli(pluginRoot, dataDir, [
      "link",
      "--source-project-id",
      projectB.id as string,
      "--target-project-id",
      projectA.id as string,
    ]);
    const search = runCli(pluginRoot, dataDir, [
      "search-files",
      "--path",
      projectBPath,
      "--target-project-id",
      projectA.id as string,
      "--query",
      "protocol",
    ]);
    expect(search.results).toHaveLength(1);

    const proposal = runCli(pluginRoot, dataDir, ["propose", "--path", projectBPath], {
      candidates: [
        {
          ref: "protocol-source",
          kind: "architecture",
          title: "Protocol source",
          briefRole: "conclusion",
          content: "Project A documents the shared protocol.",
          narrative: {
            occurredAt: "2026-07-22T09:00:00.000Z",
            reason: "需要保存共享协议来源。",
            action: "读取并记录项目 A 的协议说明。",
            outcome: "协议来源已可追溯。",
            conclusion: "发布验证可以引用这份协议。",
          },
          sourceProjectId: projectA.id,
          sourcePath: "README.md",
        },
        {
          ref: "verification-flow",
          kind: "workflow",
          title: "Protocol verification",
          briefRole: "progress",
          content: "Verify the shared protocol before release.",
          narrative: {
            occurredAt: "2026-07-22T10:00:00.000Z",
            reason: "发布前需要核验共享协议。",
            action: "建立协议验证流程。",
            outcome: "验证步骤已记录。",
            conclusion: "发布前可按此流程核验协议。",
          },
        },
      ],
      relations: [
        {
          from: { candidateRef: "verification-flow" },
          to: { candidateRef: "protocol-source" },
          type: "depends_on",
          rationale: "验证流程依赖协议来源",
          confidence: "verified",
        },
      ],
    });
    const items = proposal.items as Array<{ id: string }>;
    const relationItems = proposal.relationItems as Array<{ id: string }>;
    const committed = runCli(pluginRoot, dataDir, [
      "commit",
      "--proposal-id",
      proposal.id as string,
      "--accepted-item-ids",
      items.map((item) => item.id).join(","),
      "--accepted-relation-ids",
      relationItems[0]?.id ?? "",
    ]);
    const context = runCli(pluginRoot, dataDir, ["load", "--path", projectBPath]);
    expect(context.memories).toHaveLength(2);
    const viewRefresh = committed.viewRefresh as {
      ok: boolean;
      outputPath: string;
      nodeCount: number;
    };
    expect(viewRefresh).toMatchObject({ ok: true, nodeCount: 2 });
    const refreshedHtml = readFileSync(viewRefresh.outputPath, "utf8");
    expect(refreshedHtml).toContain("Protocol source");
    expect(refreshedHtml).toContain("Protocol verification");
    const committedMemories = committed.memories as Array<{ id: string }>;
    const recalled = runCli(pluginRoot, dataDir, [
      "recall",
      "--path",
      projectBPath,
      "--query",
      "shared protocol",
    ]);
    expect(recalled.queryMode).toBe("query");
    expect(recalled.recommendedMemoryIds).toContain(committedMemories[0]?.id);
    expect(recalled.candidates).toEqual(
      expect.arrayContaining([expect.not.objectContaining({ content: expect.anything() })]),
    );
    expect(recalled.candidates).toEqual(
      expect.arrayContaining([expect.not.objectContaining({ citations: expect.anything() })]),
    );
    const retrieved = runCli(pluginRoot, dataDir, [
      "get",
      "--path",
      projectBPath,
      "--memory-ids",
      (recalled.recommendedMemoryIds as string[]).join(","),
      "--budget-tokens",
      "1700",
    ]);
    expect(retrieved.memories).toHaveLength(2);
    expect(JSON.stringify(retrieved)).not.toContain("sourceFileHash");
    expect(JSON.stringify(retrieved)).not.toContain("sourceCommit");
    const updateProposal = runCli(pluginRoot, dataDir, ["propose", "--path", projectBPath], {
      updates: [
        {
          memoryId: committedMemories[0]?.id ?? "",
          summary: "The shared protocol is traceable to project A.",
          topic: "Protocol",
          briefRole: "reference",
          citations: [
            {
              sourceProjectId: projectA.id as string,
              sourcePath: "README.md",
              role: "reference",
            },
          ],
        },
      ],
    });
    const updateItems = updateProposal.updateItems as Array<{ id: string }>;
    const updated = runCli(pluginRoot, dataDir, [
      "commit",
      "--proposal-id",
      updateProposal.id as string,
      "--accepted-update-ids",
      updateItems[0]?.id ?? "",
    ]);
    expect(updated.updatedMemories).toHaveLength(1);
    writeFileSync(path.join(projectAPath, "README.md"), "shared protocol changed\n");
    const staleRecall = runCli(pluginRoot, dataDir, [
      "recall",
      "--path",
      projectBPath,
      "--query",
      "shared protocol",
    ]);
    expect(
      (staleRecall.candidates as Array<{ memoryId: string; stale: boolean }>).find(
        (candidate) => candidate.memoryId === committedMemories[0]?.id,
      )?.stale,
    ).toBe(true);
    const graph = runCli(pluginRoot, dataDir, [
      "graph",
      "--path",
      projectBPath,
      "--memory-id",
      committedMemories[0]?.id ?? "",
      "--depth",
      "1",
    ]);
    expect(graph.nodes).toHaveLength(2);
    expect(graph.relations).toHaveLength(1);
    const guide = runCli(pluginRoot, dataDir, ["guide", "--path", projectBPath]);
    expect(guide.summary).toMatchObject({ memoryCount: 2, formalRelationCount: 1 });
    expect(guide).toHaveProperty("suggestedQuestions");
    expect(guide).toHaveProperty("relationSuggestions");
    const brief = runCli(pluginRoot, dataDir, ["brief", "--path", projectBPath]);
    expect(brief.summary).toMatchObject({ memoryCount: 2, progressCount: 1 });
    expect(brief.currentConclusions).toHaveLength(0);
    expect(brief.references).toHaveLength(1);
    const mermaid = runCliText(pluginRoot, dataDir, [
      "graph",
      "--path",
      projectBPath,
      "--format",
      "mermaid",
    ]);
    expect(mermaid).toContain("graph TD");
    const markdown = runCliText(pluginRoot, dataDir, [
      "graph",
      "--path",
      projectBPath,
      "--format",
      "markdown",
    ]);
    expect(markdown).toContain("## 项目交接");
    expect(markdown).toContain("## 从这里开始");
    expect(markdown).toContain("## 已完成工作");
    expect(markdown).toContain("README.md");
    const htmlView = runCli(pluginRoot, dataDir, [
      "graph",
      "--path",
      projectBPath,
      "--format",
      "html",
    ]);
    expect(htmlView.outputPath).toContain("KNOWLEDGE_GRAPH.html");
    const html = readFileSync(htmlView.outputPath as string, "utf8");
    expect(html).toContain('id="app"');
    expect(html).toContain('id="graph-data"');
    expect(html).toContain("script-src 'sha256-");
    const exported = runCli(pluginRoot, dataDir, ["export", "--path", projectBPath]);
    expect(exported.relations).toHaveLength(1);
    const committedRelations = committed.relations as Array<{ id: string }>;
    const forgotten = runCli(pluginRoot, dataDir, [
      "forget-relations",
      "--path",
      projectBPath,
      "--relation-ids",
      committedRelations[0]?.id ?? "",
    ]);
    expect(forgotten.forgottenRelationIds).toHaveLength(1);
  });
});
