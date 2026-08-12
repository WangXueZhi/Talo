import { describe, expect, it } from "vitest";
import {
  buildMemoryDisplayTitle,
  isTechnicalMemoryTitle,
} from "../../../packages/project-memory-core/src/display-title.js";

describe("plain-language memory titles", () => {
  it.each([
    ["conclusion", "已确认：发布方案"],
    ["progress", "进展：发布方案"],
    ["risk", "需要注意：发布方案"],
    ["next_step", "下一步：发布方案"],
    ["reference", "发布方案资料"],
  ] as const)("uses the topic for %s records", (briefRole, expected) => {
    expect(
      buildMemoryDisplayTitle({
        title: "build-dec40e26",
        topic: "发布方案",
        briefRole,
      }),
    ).toBe(expected);
  });

  it("falls back through narrative, summary, and readable original titles", () => {
    expect(
      buildMemoryDisplayTitle({
        title: "build-dec40e26",
        narrative: { conclusion: "新版本已经完成验证。后续可继续发布。" },
      }),
    ).toBe("新版本已经完成验证");
    expect(
      buildMemoryDisplayTitle({
        title: "build-dec40e26",
        summary: "部署流程已经稳定。其余内容不进入标题。",
      }),
    ).toBe("部署流程已经稳定");
    expect(buildMemoryDisplayTitle({ title: "发布流程已确认" })).toBe("发布流程已确认");
  });

  it("keeps technical identifiers out of the primary title", () => {
    for (const title of [
      "构建指纹 dec40e26 版本已部署",
      "deploy-dec40e26 → db50eb0c-068f-4228-bc44-e00fde4c8178",
      "/Users/example/Documents/project/report.md",
      "服务运行在端口 39001",
      "模块 depends_on 旧实现",
    ]) {
      expect(isTechnicalMemoryTitle(title)).toBe(true);
      expect(buildMemoryDisplayTitle({ title, briefRole: "progress" })).toBe("最近项目进展");
    }
  });

  it("uses memory kind when an explicit brief role is unavailable", () => {
    expect(
      buildMemoryDisplayTitle({
        title: "内部标题",
        topic: "数据边界",
        kind: "pitfall",
      }),
    ).toBe("需要注意：数据边界");
  });
});
