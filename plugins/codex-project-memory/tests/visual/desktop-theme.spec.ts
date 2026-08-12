import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const workspaceRoot = path.resolve(import.meta.dirname, "../../../..");
const desktopStyles = readFileSync(path.join(workspaceRoot, "apps/desktop/src/styles.css"), "utf8");

function fixture(theme: "light" | "dark"): string {
  return `<!doctype html>
  <html data-theme="${theme}"><head><meta charset="utf-8"><style>${desktopStyles}</style></head>
  <body><div class="desktop-shell">
    <aside class="sidebar"><div class="brand"><div class="brand-mark" aria-label="Talo mark">
      <svg class="talo-mark" viewBox="0 0 64 64" width="25" height="25" fill="none" aria-hidden="true">
        <path class="talo-mark-page" d="M15.5 12H48.5C49.9 12 51 13.1 51 14.5V18.5C51 19.9 49.9 21 48.5 21H40V49.5C40 50.9 38.9 52 37.5 52H26.5C25.1 52 24 50.9 24 49.5V21H15.5C14.1 21 13 19.9 13 18.5V14.5C13 13.1 14.1 12 15.5 12Z"/>
        <path class="talo-mark-fold" d="M32 52H37.5C38.9 52 40 50.9 40 49.5V44L32 52Z"/>
      </svg></div><div><strong>Talo</strong><span>Never start over.</span></div></div></aside>
    <main class="desktop-content"><section class="page hub-page"><header class="hero"><div><span class="eyebrow">Local · Private</span><h1>Project Memory</h1><p>Review recent work without losing context.</p></div></header>
      <div class="metrics"><div><strong>7</strong><span>Projects</span></div><div><strong>485</strong><span>Memories</span></div></div>
      <label class="search-box"><input aria-label="Search" value="persistent filter"></label>
      <div class="project-directory-panel"><div class="project-directory-grid"><article class="project-directory-card"><div class="project-directory-copy"><div class="project-directory-title"><strong>codex-project-memory</strong></div><p>Shared local project context.</p></div><div class="project-directory-card-meta"><span>13 memories</span><span><strong>2026/8/12</strong>recent activity</span></div><div class="project-directory-action"><button class="secondary-button">View memory</button></div></article></div></div>
    </section></main></div></body></html>`;
}

function luminance([red, green, blue]: number[]): number {
  const channels = [red, green, blue].map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (channels[0] ?? 0) + 0.7152 * (channels[1] ?? 0) + 0.0722 * (channels[2] ?? 0);
}

function rgb(value: string): number[] {
  return (
    value
      .match(/[\d.]+/g)
      ?.slice(0, 3)
      .map(Number) ?? [0, 0, 0]
  );
}

test("light theme keeps nested metrics light and readable", async ({ page }) => {
  await page.setContent(fixture("light"));
  const styles = await page
    .locator(".project-directory-card-meta span")
    .first()
    .evaluate((element) => {
      const computed = getComputedStyle(element);
      return { background: computed.backgroundColor, color: computed.color };
    });
  const background = luminance(rgb(styles.background));
  const foreground = luminance(rgb(styles.color));
  const contrast =
    (Math.max(background, foreground) + 0.05) / (Math.min(background, foreground) + 0.05);
  expect(background).toBeGreaterThan(0.8);
  expect(contrast).toBeGreaterThanOrEqual(4.5);
  await expect(page.locator(".brand-mark .talo-mark")).toBeVisible();
  const markColors = await page.locator(".brand-mark").evaluate((element) => {
    const pageFill = getComputedStyle(element.querySelector(".talo-mark-page") as Element).fill;
    const foldFill = getComputedStyle(element.querySelector(".talo-mark-fold") as Element).fill;
    return { foldFill, pageFill };
  });
  expect(markColors.pageFill).toBe("rgb(7, 19, 31)");
  expect(markColors.foldFill).toBe("rgb(7, 142, 170)");
});

test("theme changes preserve content state and brand geometry", async ({ page }) => {
  await page.setContent(fixture("light"));
  const mark = await page.locator(".brand-mark").innerHTML();
  await page.locator("html").evaluate((element) => element.setAttribute("data-theme", "dark"));
  await expect(page.getByLabel("Search")).toHaveValue("persistent filter");
  expect(await page.locator(".brand-mark").innerHTML()).toBe(mark);
  const background = await page
    .locator(".project-directory-card-meta span")
    .first()
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(luminance(rgb(background))).toBeLessThan(0.08);
  const markColors = await page.locator(".brand-mark").evaluate((element) => {
    const pageFill = getComputedStyle(element.querySelector(".talo-mark-page") as Element).fill;
    const foldFill = getComputedStyle(element.querySelector(".talo-mark-fold") as Element).fill;
    return { foldFill, pageFill };
  });
  expect(markColors.pageFill).toBe("rgb(234, 252, 255)");
  expect(markColors.foldFill).toBe("rgb(34, 199, 223)");
});
