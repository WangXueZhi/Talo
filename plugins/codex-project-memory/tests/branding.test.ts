import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const workspaceRoot = path.resolve(import.meta.dirname, "../../..");
const desktopStyles = readFileSync(path.join(workspaceRoot, "apps/desktop/src/styles.css"), "utf8");
const desktopMain = readFileSync(path.join(workspaceRoot, "apps/desktop/src/main.tsx"), "utf8");
const graphMain = readFileSync(
  path.join(workspaceRoot, "packages/project-memory-core/src/browser/main.tsx"),
  "utf8",
);
const taloMark = readFileSync(
  path.join(workspaceRoot, "packages/project-memory-core/src/browser/talo-mark.tsx"),
  "utf8",
);
const brandMark = readFileSync(
  path.join(workspaceRoot, "plugins/codex-project-memory/assets/brand-mark.svg"),
  "utf8",
);
const prepareRuntime = readFileSync(
  path.join(workspaceRoot, "apps/desktop/scripts/prepare-runtime.mjs"),
  "utf8",
);

describe("desktop visual contracts", () => {
  it("keeps nested project metrics on a light semantic surface", () => {
    expect(desktopStyles).toContain("--desktop-surface-soft: rgba(241, 247, 250, .92)");
    expect(desktopStyles).toContain("--desktop-project-card: rgba(255, 255, 255, .96)");
    expect(desktopStyles).toContain(':root[data-theme="light"] .project-directory-card-meta span');
    expect(desktopStyles).toContain("background: #f2f7f9");
    expect(desktopStyles).toContain(':root[data-theme="light"] .project-directory-card');
    expect(desktopStyles).toContain("box-shadow: var(--desktop-shadow)");
  });

  it("uses the shared Talo mark in the desktop shell and graph shell", () => {
    expect(desktopMain).toContain('<TaloMark size={25} title="Talo" />');
    expect(graphMain).toContain('<TaloMark size={23} title="Talo" />');
    expect(desktopMain).not.toContain("simplified");
    expect(graphMain).not.toContain("simplified");
    expect(taloMark).toContain('class="talo-mark-page"');
    expect(taloMark).toContain('class="talo-mark-fold"');
    expect(taloMark).toContain("M32 52H37.5C38.9 52 40 50.9 40 49.5V44L32 52Z");
    expect(taloMark).not.toContain("talo-mark-node");
    expect(taloMark).not.toContain("talo-mark-link");
    expect(taloMark).not.toContain("talo-mark-card");
    expect(desktopMain).not.toContain('<div class="brand-mark"><Sparkles');
  });

  it("updates graph colors for light mode without rebuilding graph state", () => {
    expect(graphMain).toContain("function graphStyle(light: boolean)");
    expect(graphMain).toContain("function pathGraphStyle(light: boolean)");
    expect(graphMain).toContain(
      'themeObserver.observe(document.documentElement, { attributeFilter: ["data-theme"] })',
    );
    expect(graphMain).toContain("cy.style(graphStyle(isLightTheme()))");
    expect(graphMain).toContain("cy.style(pathGraphStyle(isLightTheme()))");
    expect(graphMain).not.toContain(
      "themeObserver.observe(document.documentElement, { attributes: true, subtree: true })",
    );
  });

  it("generates platform icons from the SVG master", () => {
    expect(brandMark).toContain('<title id="title">Talo brand mark</title>');
    expect(brandMark).toContain('rx="215"');
    expect(brandMark).toContain('fill="#07131f"');
    expect(brandMark).toContain('fill="#eafcff"');
    expect(brandMark).toContain('fill="#22c7df"');
    expect(brandMark).toContain("M512 832H600C622 832 640 814 640 792V704L512 832Z");
    expect(brandMark).not.toContain("<circle");
    expect(brandMark).not.toContain("stroke=");
    expect(brandMark).not.toMatch(/L(?:236|788) 744/);
    expect(prepareRuntime).toContain('path.join(pluginRoot, "assets", "brand-mark.svg")');
    expect(prepareRuntime).not.toContain('path.join(pluginRoot, "assets", "logo.png")');
  });
});
