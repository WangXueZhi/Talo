import { describe, expect, test } from "vitest";
import { normalizeError } from "../../../packages/project-memory-core/src/errors.js";

describe("error normalization", () => {
  test("turns sandbox permission failures into an actionable memory-home error", () => {
    const error = Object.assign(new Error("operation not permitted"), {
      code: "EPERM",
      path: "/Users/example/.project-memory/v1/projects",
    });
    expect(normalizeError(error)).toEqual({
      code: "MEMORY_HOME_NOT_ACCESSIBLE",
      message: "Talo data directory is not writable.",
      details: {
        path: "/Users/example/.project-memory/v1/projects",
        cause: "EPERM",
        codexRepairCommand: "project-memory integration repair codex",
        codexEscalationLauncher: "~/.project-memory/bin/project-memory",
        sandboxEscalationRequired: true,
        restartRequired: false,
      },
    });
  });
});
