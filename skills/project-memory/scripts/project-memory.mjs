#!/usr/bin/env node
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const skillDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const candidates = [
  process.env.PROJECT_MEMORY_CLI,
  path.resolve(skillDir, "bin/talo.mjs"),
  path.resolve(skillDir, "bin/project-memory.mjs"),
  path.resolve(skillDir, "../bin/talo.mjs"),
  path.resolve(skillDir, "../bin/project-memory.mjs"),
  path.resolve(skillDir, "../../bin/talo.mjs"),
  path.resolve(skillDir, "../../bin/project-memory.mjs"),
  path.resolve(skillDir, "../../dist/talo.mjs"),
  path.resolve(skillDir, "../../dist/project-memory.mjs"),
  path.resolve(skillDir, "../../packages/project-memory-core/dist/talo.mjs"),
  path.resolve(skillDir, "../../packages/project-memory-core/dist/project-memory.mjs"),
  path.resolve(skillDir, "../../../bin/talo.mjs"),
  path.resolve(skillDir, "../../../bin/project-memory.mjs"),
  path.resolve(skillDir, "../../../../packages/project-memory-core/dist/talo.mjs"),
  path.resolve(skillDir, "../../../../packages/project-memory-core/dist/project-memory.mjs"),
  path.resolve(skillDir, "../../../dist/talo.mjs"),
  path.resolve(skillDir, "../../../dist/project-memory.mjs")
].filter(Boolean);
const cliPath = candidates.find((candidate) => existsSync(candidate));
if (!cliPath) {
  process.stderr.write("Talo CLI is not installed. Reinstall the adapter or set PROJECT_MEMORY_CLI.\n");
  process.exitCode = 1;
} else {
  const result = spawnSync(process.execPath, [cliPath, ...process.argv.slice(2)], {
    env: process.env,
    stdio: "inherit"
  });
  process.exitCode = result.status ?? 1;
}
