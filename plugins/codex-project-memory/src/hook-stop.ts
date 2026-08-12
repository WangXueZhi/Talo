import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { ensureDataDir, resolveDataDir } from "./paths.js";
import { ProjectMemoryService } from "./service.js";
import { MemoryStore } from "./store.js";

export interface StopHookInput {
  cwd: string;
  hook_event_name: "Stop";
  last_assistant_message: string | null;
  session_id: string;
  stop_hook_active: boolean;
  transcript_path: string | null;
  turn_id: string;
}

interface StopHookOutput {
  decision: "block";
  reason: string;
}

function turnHasToolUse(transcriptPath: string | null, turnId: string): boolean {
  if (!transcriptPath || !existsSync(transcriptPath)) {
    return false;
  }
  for (const line of readFileSync(transcriptPath, "utf8").split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const event = JSON.parse(line) as {
        type?: string;
        payload?: {
          type?: string;
          turn_id?: string;
          internal_chat_message_metadata_passthrough?: { turn_id?: string };
        };
      };
      const payload = event.payload;
      const eventTurnId =
        payload?.turn_id ?? payload?.internal_chat_message_metadata_passthrough?.turn_id;
      if (eventTurnId !== turnId || event.type !== "response_item") continue;
      if (
        payload?.type &&
        ["custom_tool_call", "function_call", "mcp_tool_call", "command_execution"].includes(
          payload.type,
        )
      ) {
        return true;
      }
    } catch {}
  }
  return false;
}

function hasValidReceipt(message: string): boolean {
  const noUpdates = message.match(/^Project memory: no durable updates - (.+)$/im);
  if (noUpdates?.[1]?.trim()) return true;

  return /^(Project memory: committed \d+ items?|Project memory: auto-committed \d+ items? - request_user_input unavailable|Project memory: rejected proposal [0-9a-f-]{36})$/im.test(
    message,
  );
}

export function evaluateStopHook(
  input: StopHookInput,
  service: ProjectMemoryService,
): StopHookOutput | null {
  if (input.stop_hook_active || input.hook_event_name !== "Stop") return null;

  let detected: ReturnType<ProjectMemoryService["detectProject"]>;
  try {
    detected = service.detectProject(input.cwd);
  } catch {
    return null;
  }
  const project = detected.registeredProject;
  if (!project || !turnHasToolUse(input.transcript_path, input.turn_id)) return null;
  if (hasValidReceipt(input.last_assistant_message ?? "")) return null;
  if (service.store.countPendingProposals(project.id) === 0) return null;

  return {
    decision: "block",
    reason: "项目记忆中还有待审核内容，请先选择保存或暂不保存。",
  };
}

function main(): void {
  const input = JSON.parse(readFileSync(0, "utf8")) as StopHookInput;
  const dataDir = ensureDataDir(resolveDataDir());
  const service = new ProjectMemoryService(new MemoryStore(dataDir), dataDir);
  try {
    const output = evaluateStopHook(input, service);
    if (output) process.stdout.write(`${JSON.stringify(output)}\n`);
  } finally {
    service.store.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch {
    process.exitCode = 0;
  }
}
