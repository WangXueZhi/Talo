import { chmodSync, mkdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { createTestContext, makeProject, writeProjectFile } from "./helpers.js";

const cleanups: Array<() => void> = [];

afterEach(() => {
  while (cleanups.length > 0) cleanups.pop()?.();
});

describe("readable knowledge graph views", () => {
  test("renders traceable Markdown and a private offline HTML view", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectPath = makeProject(context.root, "view-project");
    writeProjectFile(projectPath, "evidence/source.csv", "metric,value\nsessions,100\n");
    writeProjectFile(projectPath, "reports/final.md", "# Final report\n");
    const project = context.service.registerProject(projectPath);
    const proposal = context.service.proposeMemory(
      project.id,
      [
        {
          ref: "evidence-boundary",
          kind: "pitfall",
          title: "Evidence boundary </script><script>alert(1)</script>",
          summary: "The source limits what can be concluded.",
          topic: "Diagnosis",
          content: "Do not overstate the diagnosis.",
          citations: [{ sourcePath: "evidence/source.csv", role: "evidence", locator: "sessions" }],
        },
        {
          ref: "diagnosis",
          kind: "status",
          title: "Diagnosis conclusion",
          summary: "Traffic declined.",
          topic: "Diagnosis",
          content: "The verified diagnosis is documented in the final report.",
          citations: [{ sourcePath: "reports/final.md", role: "report" }],
        },
      ],
      [
        {
          from: { candidateRef: "evidence-boundary" },
          to: { candidateRef: "diagnosis" },
          type: "supports",
          rationale: "The evidence boundary supports the qualified conclusion.",
          confidence: "verified",
        },
      ],
    ) as {
      id: string;
      items: Array<{ id: string }>;
      relationItems: Array<{ id: string }>;
    };
    context.service.commitMemory(
      proposal.id,
      proposal.items.map((item) => item.id),
      proposal.relationItems.map((item) => item.id),
    );
    const graph = context.service.buildGraph(project.id, null);
    const markdown = context.service.renderGraphMarkdown(project.id, graph);
    expect(markdown).toContain("## 项目交接");
    expect(markdown).toContain("## 从这里开始");
    expect(markdown).toContain("## 风险与证据边界");
    expect(markdown).toContain("## 下一步");
    expect(markdown).toContain("## 待审核关联线索");
    expect(markdown).toContain("## 共享主题");
    expect(markdown).toContain("reports/final.md");
    expect(markdown).toContain("The evidence boundary supports the qualified conclusion.");

    const result = context.service.writeGraphHtml(project.id, graph) as {
      outputPath: string;
      relationSuggestionCount: number;
    };
    const html = readFileSync(result.outputPath, "utf8");
    expect(path.basename(result.outputPath)).toBe("KNOWLEDGE_GRAPH.html");
    expect(html).toContain("Content-Security-Policy");
    expect(html).toContain("connect-src 'none'");
    expect(html).toMatch(/style-src 'sha256-[A-Za-z0-9+/=]+'/);
    expect(html).toMatch(/script-src 'sha256-[A-Za-z0-9+/=]+'/);
    expect(html).not.toContain("'unsafe-inline'");
    expect(html).toContain('id="graph-data"');
    expect(html).toContain('"guide"');
    expect(html).toContain("&quot;brief&quot;");
    expect(result.relationSuggestionCount).toBeGreaterThanOrEqual(0);
    expect(html).toContain(
      "Evidence boundary &lt;/script&gt;&lt;script&gt;alert(1)&lt;/script&gt;",
    );
    expect(html).not.toContain("</script><script>alert(1)</script>");
    expect(html).not.toContain("https://");
    if (process.platform !== "win32") {
      expect(statSync(result.outputPath).mode & 0o777).toBe(0o600);
    }

    const outputDir = path.join(context.root, "shared-output");
    mkdirSync(outputDir);
    if (process.platform !== "win32") chmodSync(outputDir, 0o755);
    const customPath = path.join(outputDir, "graph.html");
    context.service.writeGraphHtml(project.id, graph, customPath);
    expect(readFileSync(customPath, "utf8")).toContain('id="app"');
    if (process.platform !== "win32") {
      expect(statSync(outputDir).mode & 0o777).toBe(0o755);
      expect(statSync(customPath).mode & 0o777).toBe(0o600);
    }
  });
});
