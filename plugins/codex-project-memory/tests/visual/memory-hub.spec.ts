import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";
import { renderMemoryHubHtml } from "../../src/hub.js";
import type { MemoryHub, ProjectBriefItem } from "../../src/types.js";

const fixturePath = path.resolve("test-results/memory-hub-fixture.html");

function item(title: string, briefRole: ProjectBriefItem["briefRole"]): ProjectBriefItem {
  return {
    memoryId: `memory-${title}`,
    title,
    summary: `${title}的通俗摘要`,
    topic: "发布",
    briefRole,
    roleSource: "reviewed",
    stale: false,
    citationCount: 1,
    updatedAt: "2026-07-30T08:00:00.000Z",
    occurredAt: "2026-07-30T08:00:00.000Z",
    narrative: null,
  };
}

const hub: MemoryHub = {
  protocolVersion: 1,
  generatedAt: "2026-07-30T09:00:00.000Z",
  storageHome: "/private/memory",
  summary: { projectCount: 2, memoryCount: 8, pendingProposalCount: 1, attentionProjectCount: 1 },
  recentProjects: [],
  attentionProjects: [],
  pendingProjects: [],
  projects: [
    {
      projectId: "hidden-project-a",
      name: "示例电商项目",
      primaryPath: "/private/a",
      overview: "根据已保存记录整理：正在核对首批产品表现。",
      latestActivityAt: "2026-07-30T08:00:00.000Z",
      latestActivityTitle: "刷新首批产品诊断",
      latestConclusion: item("首批产品诊断结论", "conclusion"),
      nextStep: item("核对广告报表", "next_step"),
      risk: item("数据口径边界", "risk"),
      memoryCount: 6,
      staleCitationCount: 1,
      pendingProposalCount: 1,
      pendingProposals: [
        { platform: "claude", createdAt: "2026-07-30T08:30:00.000Z", summaries: ["补全诊断依据"] },
      ],
      needsAttention: true,
      storyPath: "file:///private/a/story.html",
      searchText: "诊断 报告 商品 数据依据",
    },
    {
      projectId: "hidden-project-b",
      name: "网站发布项目",
      primaryPath: "/private/b",
      overview: "根据已保存记录整理：正在维护发布流程。",
      latestActivityAt: "2026-07-29T08:00:00.000Z",
      latestActivityTitle: "完成发布验证",
      latestConclusion: item("发布可以继续", "conclusion"),
      nextStep: null,
      risk: null,
      memoryCount: 2,
      staleCitationCount: 0,
      pendingProposalCount: 0,
      pendingProposals: [],
      needsAttention: false,
      storyPath: "file:///private/b/story.html",
      searchText: "发布 验证 构建产出",
    },
  ],
};
const attentionProject = hub.projects[0];
if (!attentionProject) throw new Error("Memory Hub fixture requires one attention project.");
hub.recentProjects = hub.projects;
hub.attentionProjects = [attentionProject];
hub.pendingProjects = [attentionProject];

test.beforeAll(() => {
  mkdirSync(path.dirname(fixturePath), { recursive: true });
  writeFileSync(fixturePath, renderMemoryHubHtml(hub));
});

test("opens the all-project hub and filters in plain Chinese", async ({ page }) => {
  await page.goto(pathToFileURL(fixturePath).href);
  await expect(page.getByRole("heading", { name: "项目记忆中心" })).toBeVisible();
  await expect(page.getByText("待审核来自 Claude").first()).toBeVisible();
  await page.getByLabel("搜索项目记忆").fill("构建产出");
  await expect(page.getByText("网站发布项目").first()).toBeVisible();
  await expect(page.locator(".project:not(.hidden)", { hasText: "示例电商项目" })).toHaveCount(0);
  await page.getByLabel("搜索项目记忆").fill("");
  await page.getByRole("button", { name: "有风险" }).click();
  await expect(page.getByText("示例电商项目").first()).toBeVisible();
  await expect(page.getByText("本地静态快照")).toBeVisible();
});
