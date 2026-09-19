import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { ProjectMemoryError } from "../src/errors.js";
import { sha256 } from "../src/security.js";
import { createTestContext, makeProject } from "./helpers.js";

const cleanups: Array<() => void> = [];

afterEach(() => {
  while (cleanups.length > 0) cleanups.pop()?.();
});

function createPolicy(context: ReturnType<typeof createTestContext>, projectId: string) {
  return context.service.updatePolicy(projectId, {
    summary: "任务开始前必须遵守项目规则。",
    rules: [
      {
        id: "rules",
        triggerTopics: ["release"],
        requiredActions: ["先运行测试"],
        forbiddenActions: ["不要提交凭据"],
        priority: 100,
      },
    ],
    actor: { platform: "codex", adapterVersion: "test" },
  });
}

describe("project policy bridge", () => {
  test("creates a root AGENTS.md and keeps synchronization idempotent", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectPath = makeProject(context.root, "policy-project");
    const project = context.service.registerProject(projectPath);
    const policy = createPolicy(context, project.id);

    const enabled = context.service.enablePolicyBridge(project.id, true);
    const agentsPath = path.join(projectPath, "AGENTS.md");
    expect(existsSync(agentsPath)).toBe(true);
    expect(readFileSync(agentsPath, "utf8")).toContain("TALO_MANAGED_POLICY_START");
    expect((enabled.policy as { status: string }).status).toBe("effective");
    expect(context.service.syncPolicyBridge(project.id)).toMatchObject({
      sync: { changed: false },
    });
    expect(policy.version).toBe(1);
  });

  test("preserves user content and detects managed-block drift", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectPath = makeProject(context.root, "existing-policy-project");
    const agentsPath = path.join(projectPath, "AGENTS.md");
    writeFileSync(agentsPath, "# User rules\n\nKeep this text exactly.\n");
    const project = context.service.registerProject(projectPath);
    createPolicy(context, project.id);
    context.service.enablePolicyBridge(project.id, true);
    const initial = readFileSync(agentsPath, "utf8");
    expect(initial).toContain("Keep this text exactly.");

    writeFileSync(agentsPath, `${initial.replace("先运行测试", "手工改过")}`);
    expect(() => context.service.syncPolicyBridge(project.id)).toThrowError(ProjectMemoryError);
    expect(readFileSync(agentsPath, "utf8")).toContain("手工改过");
  });

  test("does not delete a user-owned AGENTS.md when disabling", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectPath = makeProject(context.root, "disable-policy-project");
    const agentsPath = path.join(projectPath, "AGENTS.md");
    writeFileSync(agentsPath, "# User-owned rules\n");
    const project = context.service.registerProject(projectPath);
    createPolicy(context, project.id);
    context.service.enablePolicyBridge(project.id, true);
    writeFileSync(agentsPath, `${readFileSync(agentsPath, "utf8")}# User took over this file\n`);
    context.service.disablePolicyBridge(project.id, true, true);
    expect(existsSync(agentsPath)).toBe(true);
    expect(readFileSync(agentsPath, "utf8")).toContain("User took over this file");
  });

  test("automatically synchronizes an enabled Policy update", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectPath = makeProject(context.root, "auto-sync-policy-project");
    const project = context.service.registerProject(projectPath);
    createPolicy(context, project.id);
    context.service.enablePolicyBridge(project.id, true);

    const updated = context.service.updatePolicy(project.id, {
      summary: "更新后的项目规则。",
      rules: [
        {
          id: "updated",
          triggerTopics: ["deploy"],
          requiredActions: ["先运行集成测试"],
          forbiddenActions: [],
          priority: 100,
        },
      ],
      actor: { platform: "desktop", adapterVersion: "test" },
      expectedVersion: 1,
    });
    expect(updated.version).toBe(2);
    expect(updated.status).toBe("effective");
    expect(readFileSync(path.join(projectPath, "AGENTS.md"), "utf8")).toContain("先运行集成测试");
  });

  test("preserves CRLF files while replacing only the managed block", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectPath = makeProject(context.root, "crlf-policy-project");
    const agentsPath = path.join(projectPath, "AGENTS.md");
    writeFileSync(agentsPath, "# 用户规则\r\n\r\n保留 CRLF。\r\n");
    const project = context.service.registerProject(projectPath);
    createPolicy(context, project.id);
    context.service.enablePolicyBridge(project.id, true);
    const content = readFileSync(agentsPath, "utf8");
    expect(content).toContain("保留 CRLF。\r\n");
    expect(content.replaceAll("\r\n", "")).not.toContain("\n");
  });

  test("fails safely for malformed or repeated managed markers", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectPath = makeProject(context.root, "broken-policy-project");
    writeFileSync(
      path.join(projectPath, "AGENTS.md"),
      "<!-- TALO_MANAGED_POLICY_START -->\n<!-- TALO_MANAGED_POLICY_START -->\n<!-- TALO_MANAGED_POLICY_END -->\n",
    );
    const project = context.service.registerProject(projectPath);
    createPolicy(context, project.id);
    expect(() => context.service.enablePolicyBridge(project.id, true)).toThrowError(
      ProjectMemoryError,
    );
    try {
      context.service.enablePolicyBridge(project.id, true);
    } catch (error) {
      expect((error as ProjectMemoryError).code).toBe("AGENTS_MARKERS_INVALID");
    }
  });

  test("reports stale file Policy sources before synchronization", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectPath = makeProject(context.root, "stale-source-policy-project");
    const sourcePath = path.join(projectPath, "RULES.md");
    writeFileSync(sourcePath, "initial rules\n");
    const project = context.service.registerProject(projectPath);
    const sourceHash = sha256(readFileSync(sourcePath));
    createPolicy(context, project.id);
    context.service.updatePolicy(project.id, {
      summary: "带来源的规则。",
      rules: [
        {
          id: "source",
          triggerTopics: [],
          requiredActions: ["读取来源"],
          forbiddenActions: [],
          priority: 100,
        },
      ],
      sources: [
        {
          kind: "file",
          projectId: project.id,
          path: "RULES.md",
          memoryId: null,
          commit: null,
          fileHash: sourceHash,
          locator: null,
        },
      ],
      actor: { platform: "codex", adapterVersion: "test" },
      expectedVersion: 1,
    });
    writeFileSync(sourcePath, "changed rules\n");
    expect(() => context.service.enablePolicyBridge(project.id, true)).toThrowError(
      ProjectMemoryError,
    );
    try {
      context.service.enablePolicyBridge(project.id, true);
    } catch (error) {
      expect((error as ProjectMemoryError).code).toBe("POLICY_SOURCE_STALE");
    }
  });

  test("removes a Talo-created file only with explicit cleanup", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectPath = makeProject(context.root, "created-file-policy-project");
    const project = context.service.registerProject(projectPath);
    createPolicy(context, project.id);
    context.service.enablePolicyBridge(project.id, true);
    const agentsPath = path.join(projectPath, "AGENTS.md");
    expect(existsSync(agentsPath)).toBe(true);
    context.service.disablePolicyBridge(project.id, true, true);
    expect(existsSync(agentsPath)).toBe(false);
  });
});
