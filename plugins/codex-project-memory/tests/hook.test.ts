import { writeFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { evaluateStopHook, type StopHookInput } from "../src/hook-stop.js";
import { createTestContext, makeProject } from "./helpers.js";

const cleanups: Array<() => void> = [];

afterEach(() => {
  while (cleanups.length > 0) cleanups.pop()?.();
});

function hookInput(cwd: string, transcriptPath: string, message: string): StopHookInput {
  return {
    cwd,
    hook_event_name: "Stop",
    last_assistant_message: message,
    session_id: "session-1",
    stop_hook_active: false,
    transcript_path: transcriptPath,
    turn_id: "turn-1",
  };
}

describe("memory review stop hook", () => {
  test("only blocks when a proposal is actually pending", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectPath = makeProject(context.root, "registered-project");
    const project = context.service.registerProject(projectPath);
    const transcriptPath = path.join(context.root, "transcript.jsonl");
    writeFileSync(
      transcriptPath,
      `${JSON.stringify({
        type: "response_item",
        payload: {
          type: "custom_tool_call",
          internal_chat_message_metadata_passthrough: { turn_id: "turn-1" },
        },
      })}\n`,
    );

    expect(
      evaluateStopHook(hookInput(projectPath, transcriptPath, "Done."), context.service),
    ).toBeNull();
    expect(
      evaluateStopHook(
        hookInput(
          projectPath,
          transcriptPath,
          "Project memory: no durable updates - this was a transient inspection.",
        ),
        context.service,
      ),
    ).toBeNull();

    const proposal = context.service.proposeMemory(
      project.id,
      [
        {
          ref: "known-batch",
          kind: "status",
          title: "Known batch",
          content: "The first batch has six products.",
        },
        {
          ref: "batch-cost",
          kind: "decision",
          title: "Batch cost",
          content: "The batch cost is verified before listing.",
        },
      ],
      [
        {
          from: { candidateRef: "batch-cost" },
          to: { candidateRef: "known-batch" },
          type: "depends_on",
          rationale: "成本核对依赖批次范围。",
        },
      ],
    ) as { id: string; items: unknown[]; relationItems: unknown[] };
    const totalItems = proposal.items.length + proposal.relationItems.length;
    expect(
      evaluateStopHook(hookInput(projectPath, transcriptPath, "Done."), context.service),
    ).toEqual({
      decision: "block",
      reason: "项目记忆中还有待审核内容，请先选择保存或暂不保存。",
    });
    expect(
      evaluateStopHook(
        hookInput(
          projectPath,
          transcriptPath,
          `Project memory: proposal ${proposal.id} pending review (${proposal.items.length} items)`,
        ),
        context.service,
      ),
    ).toMatchObject({ decision: "block" });
    expect(
      evaluateStopHook(
        hookInput(
          projectPath,
          transcriptPath,
          `Project memory: proposal ${proposal.id} pending review (${totalItems} items)`,
        ),
        context.service,
      ),
    ).toMatchObject({ decision: "block" });
    expect(
      evaluateStopHook(
        hookInput(
          projectPath,
          transcriptPath,
          `Project memory: auto-committed ${totalItems} items - request_user_input unavailable`,
        ),
        context.service,
      ),
    ).toBeNull();
  });

  test("does not enforce receipts for turns without tool use", () => {
    const context = createTestContext();
    cleanups.push(context.cleanup);
    const projectPath = makeProject(context.root, "registered-project");
    context.service.registerProject(projectPath);
    const transcriptPath = path.join(context.root, "transcript.jsonl");
    writeFileSync(transcriptPath, "");

    expect(
      evaluateStopHook(hookInput(projectPath, transcriptPath, "Hello."), context.service),
    ).toBeNull();
  });
});
