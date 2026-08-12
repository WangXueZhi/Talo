import { describe, expect, it } from "vitest";
import {
  normalizeLanguagePreference,
  normalizeThemePreference,
  resolveLanguage,
  resolveTheme,
  translate,
} from "./i18n";

describe("desktop preferences", () => {
  it("normalizes unknown preferences to system", () => {
    expect(normalizeLanguagePreference("fr-FR")).toBe("system");
    expect(normalizeThemePreference("contrast")).toBe("system");
  });

  it("resolves language from system languages", () => {
    expect(resolveLanguage("system", ["zh-Hans-CN", "en-US"])).toBe("zh-CN");
    expect(resolveLanguage("system", ["en-US"])).toBe("en-US");
    expect(resolveLanguage("zh-CN", ["en-US"])).toBe("zh-CN");
  });

  it("resolves theme with explicit preference priority", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
  });

  it("interpolates translated variables", () => {
    expect(translate("en-US", "hub.memoriesCount", { count: 4 })).toBe("4 memories");
    expect(translate("zh-CN", "common.download", { name: "Codex" })).toBe("获取 Codex");
  });
});
