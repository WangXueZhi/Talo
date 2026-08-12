import { statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { renderMemoryHubHtml } from "../src/hub.js";
import { inspectDataHomeCounts, migrateDataDir } from "../src/paths.js";
import { createTestContext, makeProject, writeProjectFile } from "./helpers.js";

const cleanups: Array<() => void> = [];

afterEach(() => {
  while (cleanups.length > 0) cleanups.pop()?.();
});

describe("shared home and memory hub", () => {
  test("renders 20 isolated projects with Chinese search data and pending platforms", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    for (let index = 0; index < 20; index += 1) {
      const projectPath = makeProject(context.root, `项目-${String(index).padStart(2, "0")}`);
      const project = context.service.registerProject(projectPath);
      if (index === 0) {
        context.service.proposeMemory(
          project.id,
          [{ kind: "status", title: "跨平台待审核结论", content: "等待统一审核。" }],
          [],
          [],
          { platform: "claude", adapterVersion: "0.13.0" },
        );
      }
    }
    const hub = context.service.buildMemoryHub(false);
    const html = renderMemoryHubHtml(hub);
    expect(hub.summary.projectCount).toBe(20);
    expect(hub.summary.pendingProposalCount).toBe(1);
    expect(html).toContain("项目记忆中心");
    expect(html).toContain("待审核来自 Claude");
    expect(html).toContain("跨平台待审核结论");
    expect(html).toContain("搜索项目、结论、产出、来源说明或下一步");
    expect(html).not.toContain("connect-src https:");
    expect(html).not.toContain(">projectId<");
  });

  test("migrates through a verified backup and preserves object counts", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectPath = makeProject(context.root, "迁移项目");
    writeProjectFile(projectPath, "report.md", "verified\n");
    const project = context.service.registerProject(projectPath);
    const proposal = context.service.proposeMemory(project.id, [
      {
        kind: "status",
        title: "迁移前记录",
        content: "这条记录必须完整迁移。",
        citations: [{ sourcePath: "report.md", role: "report" }],
      },
    ]) as { id: string; items: Array<{ id: string }> };
    context.service.commitMemory(proposal.id, [proposal.items[0]?.id ?? ""]);
    const target = path.join(context.root, "new-home");
    const configHome = path.join(context.root, "config");
    const previous = process.env.PROJECT_MEMORY_CONFIG_HOME;
    process.env.PROJECT_MEMORY_CONFIG_HOME = configHome;
    cleanups.push(() => {
      if (previous === undefined) delete process.env.PROJECT_MEMORY_CONFIG_HOME;
      else process.env.PROJECT_MEMORY_CONFIG_HOME = previous;
    });
    const result = migrateDataDir(context.dataDir, target) as { backup: string };
    expect(inspectDataHomeCounts(target)).toEqual(inspectDataHomeCounts(context.dataDir));
    expect(inspectDataHomeCounts(result.backup)).toEqual(inspectDataHomeCounts(context.dataDir));
    if (process.platform !== "win32") {
      expect(statSync(path.join(configHome, "active-home.json")).mode & 0o777).toBe(0o600);
    }
  });
});

describe("shared review conflicts", () => {
  test("rebases unrelated revisions but rejects changed sources", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectPath = makeProject(context.root, "冲突项目");
    writeProjectFile(projectPath, "evidence.md", "first\n");
    const project = context.service.registerProject(projectPath);
    const first = context.service.proposeMemory(project.id, [
      { kind: "status", title: "先提交", content: "先提交的记录。" },
    ]) as { id: string; items: Array<{ id: string }> };
    const stale = context.service.proposeMemory(project.id, [
      { kind: "status", title: "后提交", content: "后提交的记录。" },
    ]) as { id: string; items: Array<{ id: string }> };
    context.service.commitMemory(first.id, [first.items[0]?.id ?? ""]);
    expect(
      context.service.commitMemory(stale.id, [stale.items[0]?.id ?? ""]).memories,
    ).toHaveLength(1);

    const source = context.service.proposeMemory(project.id, [
      {
        kind: "status",
        title: "来源校验",
        content: "提交时重新校验来源。",
        citations: [{ sourcePath: "evidence.md", role: "evidence" }],
      },
    ]) as { id: string; items: Array<{ id: string }> };
    writeFileSync(path.join(projectPath, "evidence.md"), "changed\n");
    expect(() => context.service.commitMemory(source.id, [source.items[0]?.id ?? ""])).toThrow(
      /source changed/i,
    );
  });

  test("rejects an update when its target changed after proposal creation", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const project = context.service.registerProject(makeProject(context.root, "更新冲突项目"));
    const created = context.service.proposeMemory(project.id, [
      { kind: "status", title: "原始记录", content: "原始内容。" },
    ]) as { id: string; items: Array<{ id: string }> };
    const memory = context.service.commitMemory(created.id, [created.items[0]?.id ?? ""])
      .memories[0];
    const staleUpdate = context.service.proposeMemory(
      project.id,
      [],
      [],
      [{ memoryId: memory?.id ?? "", summary: "旧摘要" }],
    ) as { id: string; updateItems: Array<{ id: string }> };
    const newerUpdate = context.service.proposeMemory(
      project.id,
      [],
      [],
      [{ memoryId: memory?.id ?? "", summary: "新摘要" }],
    ) as { id: string; updateItems: Array<{ id: string }> };
    context.service.commitMemory(newerUpdate.id, [], [], [newerUpdate.updateItems[0]?.id ?? ""]);

    expect(() =>
      context.service.commitMemory(staleUpdate.id, [], [], [staleUpdate.updateItems[0]?.id ?? ""]),
    ).toThrow(/update target changed/i);
    expect(context.service.store.getProposal(staleUpdate.id)?.status).toBe("pending");
  });

  test("allows an explicit source refresh before committing", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectPath = makeProject(context.root, "来源更新项目");
    writeProjectFile(projectPath, "evidence.md", "first\n");
    const project = context.service.registerProject(projectPath);
    const proposal = context.service.proposeMemory(project.id, [
      {
        kind: "status",
        title: "来源需要确认",
        content: "这条内容仍然适用于当前文件。",
        citations: [{ sourcePath: "evidence.md", role: "evidence" }],
      },
    ]) as { id: string; items: Array<{ id: string }> };
    writeProjectFile(projectPath, "evidence.md", "updated\n");

    expect(() => context.service.commitMemory(proposal.id, [proposal.items[0]?.id ?? ""])).toThrow(
      /source changed/i,
    );

    const result = context.service.commitMemory(
      proposal.id,
      [proposal.items[0]?.id ?? ""],
      [],
      [],
      true,
    );
    expect(result.memories[0]?.citations[0]?.sourceFileHash).toBeTruthy();
    expect(context.service.store.getProposal(proposal.id)?.status).toBe("accepted");
  });
});
