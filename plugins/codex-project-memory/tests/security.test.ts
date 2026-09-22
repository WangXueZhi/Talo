import { symlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { ProjectMemoryError } from "../src/errors.js";
import { createTestContext, makeProject, writeProjectFile } from "./helpers.js";

const cleanups: Array<() => void> = [];

afterEach(() => {
  while (cleanups.length > 0) {
    cleanups.pop()?.();
  }
});

describe("cross-project access", () => {
  test("requires a directional link and does not grant reverse access", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectAPath = makeProject(context.root, "a");
    const projectBPath = makeProject(context.root, "b");
    writeProjectFile(projectAPath, "README.md", "needle from A\n");
    writeProjectFile(projectBPath, "README.md", "needle from B\n");
    const projectA = context.service.registerProject(projectAPath);
    const projectB = context.service.registerProject(projectBPath);

    expect(() => context.service.searchFiles(projectB.id, projectA.id, "needle")).toThrowError(
      ProjectMemoryError,
    );
    context.service.linkProjects(projectB.id, projectA.id);
    expect(
      (context.service.searchFiles(projectB.id, projectA.id, "needle").results as unknown[]).length,
    ).toBe(1);
    expect(() => context.service.searchFiles(projectA.id, projectB.id, "needle")).toThrowError(
      ProjectMemoryError,
    );
  });

  test("blocks traversal, absolute paths, sensitive files, and symlink escapes", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectAPath = makeProject(context.root, "a");
    const projectBPath = makeProject(context.root, "b");
    writeProjectFile(projectAPath, "safe.txt", "safe\n");
    writeProjectFile(projectAPath, ".env", "TOKEN=secret\n");
    writeFileSync(path.join(projectAPath, "binary.bin"), Buffer.from([0, 1, 2, 3]));
    writeFileSync(path.join(projectAPath, "large.txt"), Buffer.alloc(1024 * 1024 + 1, "a"));
    const outsidePath = path.join(context.root, "outside.txt");
    writeProjectFile(context.root, "outside.txt", "outside\n");
    let symlinkAvailable = true;
    try {
      symlinkSync(outsidePath, path.join(projectAPath, "escape.txt"));
    } catch (error) {
      if (process.platform !== "win32") throw error;
      symlinkAvailable = false;
    }
    const projectA = context.service.registerProject(projectAPath);
    const projectB = context.service.registerProject(projectBPath);
    context.service.linkProjects(projectB.id, projectA.id);

    expect(() => context.service.readFile(projectB.id, projectA.id, "../outside.txt")).toThrowError(
      /traversal/,
    );
    expect(() => context.service.readFile(projectB.id, projectA.id, outsidePath)).toThrowError(
      /relative/,
    );
    expect(() => context.service.readFile(projectB.id, projectA.id, ".env")).toThrowError(
      /blocked/,
    );
    if (symlinkAvailable) {
      expect(() => context.service.readFile(projectB.id, projectA.id, "escape.txt")).toThrowError(
        /escapes/,
      );
    }
    expect(() => context.service.readFile(projectB.id, projectA.id, "binary.bin")).toThrowError(
      /Binary/,
    );
    expect(() => context.service.readFile(projectB.id, projectA.id, "large.txt")).toThrowError(
      /1 MiB/,
    );
  });

  test("requires citation links and disables file opening after unlink", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectAPath = makeProject(context.root, "citation-source");
    const projectBPath = makeProject(context.root, "citation-owner");
    writeProjectFile(projectAPath, "reports/shared.md", "# Shared report\n");
    const projectA = context.service.registerProject(projectAPath);
    const projectB = context.service.registerProject(projectBPath);
    const candidate = {
      kind: "status" as const,
      title: "Linked evidence",
      content: "This memory cites a linked project.",
      citations: [
        { sourceProjectId: projectA.id, sourcePath: "reports/shared.md", role: "report" as const },
      ],
    };

    expect(() => context.service.proposeMemory(projectB.id, [candidate])).toThrowError(
      /read-only project link/,
    );
    context.service.linkProjects(projectB.id, projectA.id);
    const proposal = context.service.proposeMemory(projectB.id, [candidate]) as {
      id: string;
      items: Array<{ id: string }>;
    };
    context.service.commitMemory(proposal.id, [proposal.items[0]?.id ?? ""]);
    expect(context.service.getContext(projectB.id)[0]?.citations[0]).toMatchObject({
      accessible: true,
      stale: false,
    });

    context.service.unlinkProjects(projectB.id, projectA.id);
    expect(context.service.getContext(projectB.id)[0]?.citations[0]).toMatchObject({
      accessible: false,
      stale: true,
      staleReason: "source_project_link_missing",
      fileUrl: null,
    });
  });
});
