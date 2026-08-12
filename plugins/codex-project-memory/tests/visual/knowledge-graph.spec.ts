import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";
import type { MemoryRecord, MemoryRelationRecord } from "../../src/types.js";
import { renderGraphHtml } from "../../src/view.js";

const root = path.resolve(import.meta.dirname, "../..");
const fixturePath = path.join(root, "test-results", "knowledge-graph-fixture.html");

function memory(
  id: string,
  title: string,
  topic: string,
  overrides: Partial<MemoryRecord> = {},
): MemoryRecord {
  return {
    id,
    projectId: "amazon-project",
    projectName: "示例电商项目",
    kind: "decision",
    title,
    summary: `${title}的摘要用于快速理解结论、证据边界和下一步行动。`,
    topic,
    briefRole: null,
    content:
      `${title}的完整内容。这里使用足够长的中文段落验证详情区域能够自然换行，并且不会覆盖来源、关系或状态信息。` +
      "结论必须能够脱离原始对话独立理解，同时保留证据文件和报告定位。",
    tags: ["第一批货", "诊断"],
    sourceProjectId: null,
    sourcePath: null,
    sourceCommit: null,
    sourceFileHash: null,
    citations: [],
    confidence: "verified",
    status: "active",
    createdAt: "2026-07-14T00:00:00.000Z",
    updatedAt: "2026-07-14T01:00:00.000Z",
    stale: false,
    staleReason: null,
    ...overrides,
  };
}

const memories: MemoryRecord[] = [
  memory("m1", "第一批产品非广告诊断结论", "第一批货诊断", {
    kind: "status",
    narrative: {
      occurredAt: "2026-07-14T01:00:00.000Z",
      reason: "需要明确第一批产品的非广告表现。",
      action: "整理商品数据并完成非广告诊断。",
      outcome: "生成非广告诊断报告。",
      conclusion: "当前结论可用于后续复盘，但需遵守证据边界。",
      outputs: [],
    },
    citations: [
      {
        sourceProjectId: "amazon-project",
        sourceProjectName: "示例电商项目",
        sourcePath: "第一批货/输出/非广告诊断报告.md",
        role: "report",
        locator: "结论与建议",
        note: "完整诊断报告",
        sourceCommit: null,
        sourceFileHash: "hash-report",
        stale: false,
        staleReason: null,
        accessible: true,
        fileUrl: "file:///tmp/final-report.md",
      },
      {
        sourceProjectId: "amazon-project",
        sourceProjectName: "示例电商项目",
        sourcePath: "第一批货/数据/商品汇总.csv",
        role: "evidence",
        locator: "全部商品行",
        note: "诊断输入数据",
        sourceCommit: null,
        sourceFileHash: "hash-data",
        stale: false,
        staleReason: null,
        accessible: true,
        fileUrl: "file:///tmp/products.csv",
      },
    ],
  }),
  memory("m2", "非广告诊断的证据边界", "第一批货诊断", {
    kind: "pitfall",
    stale: true,
    staleReason: "第一批货/数据/流量来源.xlsx 的文件哈希已变化",
    citations: [
      {
        sourceProjectId: "amazon-project",
        sourceProjectName: "示例电商项目",
        sourcePath: "第一批货/数据/流量来源.xlsx",
        role: "evidence",
        locator: "流量来源列",
        note: "只能支持非广告流量层面的判断",
        sourceCommit: null,
        sourceFileHash: "old-hash",
        stale: true,
        staleReason: "文件内容已变化",
        accessible: true,
        fileUrl: "file:///tmp/traffic.xlsx",
      },
    ],
  }),
  memory("m3", "商品信息整理流程", "数据准备", { kind: "workflow" }),
  memory("m4", "核对优化后的商品表现", "数据准备", {
    kind: "convention",
    briefRole: "next_step",
  }),
  memory("m5", "诊断报告是后续复盘入口", "复盘", { kind: "architecture" }),
  memory("m6", "第二批新品图片生成", "新品图片生成", {
    kind: "status",
    briefRole: "progress",
    phase: "execution",
    narrative: {
      occurredAt: "2026-08-07T15:30:00.000Z",
      reason: "第二批新品套图受原生图片尺寸限制阻断。",
      action: "确认可保存原生大图的生成入口。",
      outcome: "明确 Gemini App 可以保存满足要求的原生图片。",
      conclusion: "后续批量生成需要先保存至少 2048px 的原生图片。",
      outputs: [],
    },
    createdAt: "2026-08-07T15:30:00.000Z",
    updatedAt: "2026-08-07T15:30:00.000Z",
  }),
  memory("m7", "亚马逊广告每日观察", "亚马逊广告", {
    kind: "status",
    briefRole: "progress",
    workUnitId: "amazon-daily-2026-08-06",
    phase: "analysis",
    narrative: {
      occurredAt: "2026-08-06T10:00:00.000Z",
      reason: "需要持续观察广告表现。",
      action: "完成当日数据对账。",
      outcome: "形成每日观察结论。",
      conclusion: "广告数据已完成当日复核。",
      outputs: [],
    },
    createdAt: "2026-08-06T10:00:00.000Z",
    updatedAt: "2026-08-06T10:00:00.000Z",
  }),
];

const relations: MemoryRelationRecord[] = [
  {
    id: "r1",
    ownerProjectId: "amazon-project",
    fromMemoryId: "m2",
    fromProjectId: "amazon-project",
    toMemoryId: "m1",
    toProjectId: "amazon-project",
    type: "supports",
    rationale: "证据边界限定了诊断结论可以覆盖的范围。",
    confidence: "verified",
    sourceProposalId: "proposal",
    status: "active",
    createdAt: "2026-07-14T00:00:00.000Z",
    updatedAt: "2026-07-14T00:00:00.000Z",
  },
  {
    id: "r2",
    ownerProjectId: "amazon-project",
    fromMemoryId: "m1",
    fromProjectId: "amazon-project",
    toMemoryId: "m5",
    toProjectId: "amazon-project",
    type: "derived_from",
    rationale: "复盘入口来源于已验证的诊断结论和报告。",
    confidence: "verified",
    sourceProposalId: "proposal",
    status: "active",
    createdAt: "2026-07-14T00:00:00.000Z",
    updatedAt: "2026-07-14T00:00:00.000Z",
  },
];

test.beforeAll(() => {
  mkdirSync(path.dirname(fixturePath), { recursive: true });
  writeFileSync(
    fixturePath,
    renderGraphHtml("示例电商项目", { nodes: memories, relations }, "2026-07-14T02:00:00.000Z"),
    { mode: 0o600 },
  );
});

test("keeps desktop topbar controls inside a narrowed host", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.startsWith("mobile"), "Desktop host regression only");
  await page.goto(pathToFileURL(fixturePath).href);
  await page.locator(".app-shell").evaluate((element) => {
    element.style.width = "1220px";
  });
  await page.evaluate(() => {
    window.location.hash = "#graph";
  });
  await expect(page.locator(".app-shell")).toHaveClass(/mode-immersive/u);

  const shellBox = await page.locator(".app-shell").boundingBox();
  const advancedMenuBox = await page.locator(".advanced-menu > summary").boundingBox();
  const rightPanelButtonBox = await page.getByRole("button", { name: /详情面板/u }).boundingBox();

  expect(shellBox).not.toBeNull();
  expect(advancedMenuBox).not.toBeNull();
  expect(rightPanelButtonBox).not.toBeNull();
  expect((advancedMenuBox?.x ?? 0) + (advancedMenuBox?.width ?? 0)).toBeLessThanOrEqual(
    (shellBox?.x ?? 0) + (shellBox?.width ?? 0),
  );
  expect((rightPanelButtonBox?.x ?? 0) + (rightPanelButtonBox?.width ?? 0)).toBeLessThanOrEqual(
    (shellBox?.x ?? 0) + (shellBox?.width ?? 0),
  );
});

test("keeps timeline, menus, path, and graph surfaces light", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.startsWith("mobile"), "Desktop light-theme regression only");
  await page.goto(`${pathToFileURL(fixturePath).href}#timeline`);
  await page.locator("html").evaluate((element) => element.setAttribute("data-theme", "light"));

  const surfaceColor = async (selector: string) =>
    page
      .locator(selector)
      .first()
      .evaluate((element) => getComputedStyle(element).backgroundColor);
  const textColor = async (selector: string) =>
    page
      .locator(selector)
      .first()
      .evaluate((element) => getComputedStyle(element).color);

  expect(await surfaceColor(".reading-progress")).toBe("rgba(255, 255, 255, 0.94)");
  await page.locator(".advanced-menu summary").click();
  expect(await surfaceColor(".advanced-menu > div")).toBe("rgb(255, 255, 255)");
  await page.keyboard.press("Escape");

  const collapsedDay = page.locator(".timeline-day[data-expanded='false']").first();
  expect(
    await collapsedDay
      .locator(".timeline-day-content")
      .evaluate((element) => getComputedStyle(element).backgroundColor),
  ).toBe("rgb(255, 255, 255)");
  expect(
    await collapsedDay
      .locator(".timeline-day-collapsed-events")
      .evaluate((element) => getComputedStyle(element).backgroundColor),
  ).toBe("rgb(248, 251, 252)");
  expect(
    await collapsedDay
      .locator(".timeline-day-collapsed-copy strong")
      .evaluate((element) => getComputedStyle(element).color),
  ).toBe("rgb(48, 70, 93)");

  await page.getByRole("button", { name: /查看关系脉络：第二批新品图片生成/u }).click();
  await expect(page.locator(".app-shell")).toHaveClass(/mode-path/u);
  expect(await surfaceColor(".event-path-panel")).toBe("rgb(255, 255, 255)");
  expect(await surfaceColor(".path-suggestions")).toBe("rgba(255, 255, 255, 0.9)");
  expect(await textColor(".path-suggestions .eyebrow")).toBe("rgb(7, 142, 170)");
  expect(await textColor(".path-suggestions p")).toBe("rgb(102, 120, 141)");

  await page.evaluate(() => {
    window.location.hash = "#graph";
  });
  await expect(page.locator(".app-shell")).toHaveClass(/mode-immersive/u);
  await expect(page.locator("canvas").first()).toBeVisible();
  expect(await surfaceColor(".graph-panel")).toBe("rgb(247, 251, 252)");
  expect(await surfaceColor(".graph-toolbar")).toBe("rgba(255, 255, 255, 0.94)");
  expect(await surfaceColor(".graph-status")).toBe("rgba(255, 255, 255, 0.94)");
  expect(await surfaceColor(".relation-legend")).toBe("rgba(255, 255, 255, 0.94)");

  const canvasCount = await page.locator("canvas").count();
  await page.locator("html").evaluate((element) => element.setAttribute("data-theme", "dark"));
  await page.locator("html").evaluate((element) => element.setAttribute("data-theme", "light"));
  await expect(page.locator(".app-shell")).toHaveClass(/mode-immersive/u);
  await expect(page.locator("canvas")).toHaveCount(canvasCount);
  expect(await surfaceColor(".graph-panel")).toBe("rgb(247, 251, 252)");
});

test("renders and operates the offline knowledge workspace", async ({ page }, testInfo) => {
  const networkRequests: string[] = [];
  const pageErrors: string[] = [];
  page.on("request", (request) => {
    if (/^https?:/u.test(request.url())) networkRequests.push(request.url());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(`${pathToFileURL(fixturePath).href}#timeline`);

  await expect(page.getByRole("heading", { name: "示例电商项目" })).toBeVisible();
  await expect(page.locator(".app-shell")).toHaveClass(/mode-guide/u);
  await expect(
    page.getByRole("heading", { name: "按真实发生时间看懂项目怎么走到今天" }),
  ).toBeVisible();
  await expect(page.getByTestId("project-timeline")).toBeVisible();
  const readingProgress = page.locator(".reading-progress");
  await expect(readingProgress).toContainText("项目时间轴");
  await expect(readingProgress).toContainText("关系脉络");
  await expect(readingProgress).toContainText("事件详情");
  await expect(readingProgress.locator("button")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "暂停动态" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "打开详情面板" })).toHaveCount(0);
  const latestDay = page.locator(".timeline-day").nth(0);
  const olderDay = page.locator(".timeline-day").nth(1);
  await expect(latestDay).toHaveAttribute("data-date", "2026-08-07");
  await expect(olderDay).toHaveAttribute("data-date", "2026-08-06");
  await expect(latestDay).toHaveAttribute("data-expanded", "true");
  await expect(olderDay).toHaveAttribute("data-expanded", "false");
  await expect(latestDay.locator(".timeline-day-toggle")).toHaveAttribute("aria-expanded", "true");
  await expect(olderDay.locator(".timeline-day-toggle")).toHaveAttribute("aria-expanded", "false");
  await expect(latestDay.locator(".timeline-day-state")).toHaveText("已展开 · 完整事件链");
  await expect(olderDay.locator(".timeline-day-state")).toHaveText("可展开 · 事件清单");
  await expect(olderDay.getByText(/亚马逊广告每日观察/u)).toBeVisible();
  await expect(olderDay.locator(".timeline-day-collapsed-event time")).toHaveCount(0);
  await expect(olderDay.locator(".timeline-day-collapsed-event small")).toHaveCount(0);
  await expect(olderDay.locator(".timeline-day-collapsed-event svg")).toHaveCount(0);
  const collapsedTitles = await olderDay
    .locator(".timeline-day-collapsed-copy > strong")
    .allTextContents();
  await olderDay.locator(".timeline-day-toggle").click();
  await expect(olderDay).toHaveAttribute("data-expanded", "true");
  await expect(olderDay.locator(".timeline-day-toggle")).toHaveAttribute("aria-expanded", "true");
  expect(await olderDay.locator(".timeline-overview-copy > strong").allTextContents()).toEqual(
    collapsedTitles,
  );
  await olderDay.locator(".timeline-day-toggle").click();
  await expect(olderDay).toHaveAttribute("data-expanded", "false");
  await expect(olderDay.locator(".timeline-day-toggle")).toHaveAttribute("aria-expanded", "false");
  await expect(olderDay.getByText(/亚马逊广告每日观察/u)).toBeVisible();
  await expect(page.getByText("第二批新品图片生成", { exact: true })).toBeVisible();
  await page.screenshot({
    path: path.join(root, "test-results", `knowledge-guide-${testInfo.project.name}.png`),
    fullPage: false,
  });

  await page.getByRole("button", { name: /查看关系脉络：第二批新品图片生成/u }).click();
  await expect(page.locator(".app-shell")).toHaveClass(/mode-path/u);
  await expect(page.getByTestId("event-path")).toBeVisible();
  await expect(page.getByRole("img", { name: /第二批新品图片生成 事件关系路径图/u })).toBeVisible();
  await expect(page.getByText("尚未记录正式关系；当前仅展示该事件本身。")).toBeVisible();
  await page.getByRole("button", { name: /查看事件前因后果/u }).click();
  await expect(page.locator(".app-shell")).toHaveClass(/mode-event/u);
  await expect(page.getByTestId("event-focus")).toBeVisible();
  await expect(page.getByRole("heading", { name: "第二批新品图片生成" })).toBeVisible();
  await expect(page.getByText("尚未保存正式前因。")).toBeVisible();
  await page.getByRole("button", { name: "返回关系脉络" }).click();
  await page.getByRole("button", { name: "返回项目时间轴" }).click();
  await page
    .locator(".timeline-day")
    .nth(1)
    .getByRole("button", { name: /查看关系脉络：.*亚马逊广告每日观察/u })
    .click();
  await expect(page.locator(".app-shell")).toHaveClass(/mode-path/u);
  await expect(page.getByTestId("event-path")).toContainText("亚马逊广告每日观察");
  await page.getByRole("button", { name: "返回项目时间轴" }).click();

  if (!testInfo.project.name.startsWith("mobile")) {
    const search = page.getByRole("searchbox", { name: "搜索项目记忆" });
    await search.fill("第一批产品");
    await page.getByRole("option", { name: /第一批产品非广告诊断结论/u }).click();
    await expect(page.locator(".app-shell")).toHaveClass(/mode-event/u);
    await expect(page.getByRole("heading", { name: "第一批产品非广告诊断结论" })).toBeVisible();
  }

  if (!testInfo.project.name.startsWith("mobile")) {
    const advancedMenu = page.locator(".advanced-menu");
    await expect(advancedMenu.locator("summary")).toHaveText("展示视图");
    const openAdvancedMenu = async () => {
      if ((await advancedMenu.getAttribute("open")) === null) {
        await advancedMenu.locator("summary").click();
      }
    };
    await openAdvancedMenu();
    await page.getByRole("heading", { name: "第一批产品非广告诊断结论" }).click();
    await expect(advancedMenu).not.toHaveAttribute("open", "");
    await openAdvancedMenu();
    await page.keyboard.press("Escape");
    await expect(advancedMenu).not.toHaveAttribute("open", "");
    await openAdvancedMenu();
    await page.getByRole("button", { name: "完整记录", exact: true }).click();
    await expect(advancedMenu).not.toHaveAttribute("open", "");
    await expect(page.locator(".app-shell")).toHaveClass(/mode-records/u);
    await openAdvancedMenu();
    await page.getByRole("button", { name: "时间轴", exact: true }).click();
    await expect(advancedMenu).not.toHaveAttribute("open", "");
    await expect(page.locator(".app-shell")).toHaveClass(/mode-guide/u);
    await openAdvancedMenu();
    await page.getByRole("button", { name: "事件关系图", exact: true }).click();
    await expect(advancedMenu).not.toHaveAttribute("open", "");
    await expect(page.locator(".app-shell")).toHaveClass(/mode-immersive/u);
  } else {
    await page.evaluate(() => {
      window.location.hash = "#graph";
    });
  }
  await expect(page.getByRole("img", { name: "示例电商项目 记忆关系追溯图" })).toBeVisible();
  await expect(page.locator(".app-shell")).toHaveClass(/mode-immersive/u);
  await expect(page.getByRole("button", { name: "全项目", exact: true })).toHaveClass(/active/u);
  await expect(page.getByLabel("关系图例")).toContainText("支持");
  const graphBackground = await page
    .locator(".graph-panel")
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(graphBackground).toBe("rgb(9, 13, 24)");
  await expect(page.locator("canvas").first()).toBeVisible();
  expect(networkRequests).toEqual([]);
  expect(pageErrors).toEqual([]);
  await expect(page.getByRole("button", { name: "显示关联线索" })).toBeVisible();
  await page.getByRole("button", { name: "显示关联线索" }).click();
  await expect(page.getByRole("button", { name: "隐藏关联线索" })).toBeVisible();
  await page.getByRole("button", { name: "隐藏关联线索" }).click();
  if (!testInfo.project.name.startsWith("mobile")) {
    await expect(page.getByRole("button", { name: "暂停动态" })).toBeVisible();
    await expect(page.getByRole("button", { name: "暂停动态" })).toContainText("暂停动态");
    await expect(page.getByRole("button", { name: "收起详情面板" })).toContainText("收起详情");
  }
  await page.getByRole("button", { name: "适配全部" }).click();

  const viewport = page.viewportSize();
  const bodyMetrics = await page.locator("body").evaluate((body) => ({
    scrollWidth: body.scrollWidth,
    clientWidth: body.clientWidth,
    scrollHeight: body.scrollHeight,
    clientHeight: body.clientHeight,
  }));
  expect(bodyMetrics.scrollWidth).toBeLessThanOrEqual((viewport?.width ?? 0) + 1);
  expect(bodyMetrics.scrollHeight).toBeLessThanOrEqual((viewport?.height ?? 0) + 1);

  await page.screenshot({
    path: path.join(root, "test-results", `knowledge-graph-${testInfo.project.name}.png`),
    fullPage: false,
  });
});
