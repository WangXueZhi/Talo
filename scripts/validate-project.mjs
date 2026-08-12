import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const workspace = readJson("package.json");
const pluginRoot = path.join(root, "plugins", "codex-project-memory");
const coreRoot = path.join(root, "packages", "project-memory-core");

function fail(message) {
  process.stderr.write(`validation failed: ${message}\n`);
  process.exitCode = 1;
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

const plugin = readJson("plugins/codex-project-memory/.codex-plugin/plugin.json");
const versionedFiles = [
  ["packages/project-memory-core/package.json", readJson("packages/project-memory-core/package.json").version],
  ["plugins/codex-project-memory/package.json", readJson("plugins/codex-project-memory/package.json").version],
  ["apps/desktop/package.json", readJson("apps/desktop/package.json").version],
  ["apps/desktop/src-tauri/tauri.conf.json", readJson("apps/desktop/src-tauri/tauri.conf.json").version],
  [".claude-plugin/marketplace.json", readJson(".claude-plugin/marketplace.json").version],
];
for (const [filePath, version] of versionedFiles) {
  if (version !== workspace.version) fail(`${filePath} version does not match workspace version`);
}
if (plugin.name !== "codex-project-memory") fail("plugin name must match directory");
if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(plugin.version)) {
  fail("plugin version must be semver");
}
if (plugin.version !== workspace.version && !plugin.version.startsWith(`${workspace.version}+codex.`)) {
  fail("plugin version does not match workspace version");
}
if (plugin.mcpServers !== undefined) fail("plugin must not require an MCP server");
if (existsSync(path.join(pluginRoot, ".mcp.json"))) fail("legacy .mcp.json must be removed");
if (!existsSync(path.join(pluginRoot, "dist", "project-memory.mjs"))) {
  fail("dist/project-memory.mjs is missing");
}
if (!existsSync(path.join(pluginRoot, "dist", "hook-stop.mjs"))) {
  fail("dist/hook-stop.mjs is missing");
}
if (!existsSync(path.join(pluginRoot, "dist", "browser", "graph-app.js"))) {
  fail("dist/browser/graph-app.js is missing");
}
if (!existsSync(path.join(pluginRoot, "dist", "browser", "graph-app.css"))) {
  fail("dist/browser/graph-app.css is missing");
}
if (!existsSync(path.join(pluginRoot, "skills", "project-memory", "SKILL.md"))) {
  fail("project-memory skill is missing");
}
if (!existsSync(path.join(pluginRoot, "skills", "project-memory", "scripts", "project-memory.mjs"))) {
  fail("project-memory Skill script is missing");
}
if (!existsSync(path.join(pluginRoot, "hooks", "hooks.json"))) {
  fail("Stop Hook config is missing");
}
if (!existsSync(path.join(coreRoot, "dist", "project-memory.mjs"))) {
  fail("platform-neutral core CLI is missing");
}
if (!existsSync(path.join(root, ".claude-plugin", "marketplace.json"))) {
  fail("Claude Code marketplace is missing");
}
for (const adapter of ["claude-code", "antigravity", "generic"]) {
  const cliPath = path.join(root, "adapters", adapter, "bin", "project-memory.mjs");
  const selfContainedCliPath = path.join(
    root,
    "adapters",
    adapter,
    "project-memory",
    "bin",
    "project-memory.mjs",
  );
  const selfContainedBrowserPath = path.join(
    root,
    "adapters",
    adapter,
    "project-memory",
    "bin",
    "browser",
  );
  if (!existsSync(cliPath)) fail(`${adapter} adapter CLI is missing`);
  else if (
    readFileSync(cliPath, "utf8") !==
    readFileSync(path.join(coreRoot, "dist", "project-memory.mjs"), "utf8")
  ) {
    fail(`${adapter} adapter CLI differs from project-memory-core`);
  }
  if (!existsSync(selfContainedCliPath)) fail(`${adapter} self-contained Skill CLI is missing`);
  else if (
    readFileSync(selfContainedCliPath, "utf8") !==
    readFileSync(path.join(coreRoot, "dist", "project-memory.mjs"), "utf8")
  ) {
    fail(`${adapter} self-contained Skill CLI differs from project-memory-core`);
  }
  if (!existsSync(path.join(selfContainedBrowserPath, "graph-app.js"))) {
    fail(`${adapter} self-contained Skill browser script is missing`);
  }
  if (!existsSync(path.join(selfContainedBrowserPath, "graph-app.css"))) {
    fail(`${adapter} self-contained Skill browser stylesheet is missing`);
  }
}
if (!existsSync(path.join(root, "release", `project-memory-agent-skill-${workspace.version}.zip`))) {
  fail("generic Agent Skill release archive is missing");
}

const marketplace = readJson(".agents/plugins/marketplace.json");
if (marketplace.name !== "codex-project-memory") fail("marketplace name is not unique");
const entry = marketplace.plugins?.find((item) => item.name === "codex-project-memory");
if (entry?.source?.path !== "./plugins/codex-project-memory") {
  fail("marketplace source path is invalid");
}
if (!entry?.policy?.installation || !entry?.policy?.authentication || !entry?.category) {
  fail("marketplace policy metadata is incomplete");
}

const skill = readFileSync(
  path.join(pluginRoot, "skills", "project-memory", "SKILL.md"),
  "utf8",
);
if (!skill.startsWith("---\nname: project-memory\ndescription:")) {
  fail("skill frontmatter is invalid");
}
if (/\[TODO:/.test(skill)) fail("skill contains TODO placeholders");
if (/mcpServers|\.mcp\.json/.test(readFileSync(path.join(coreRoot, "dist", "project-memory.mjs"), "utf8"))) {
  fail("core build must not contain MCP configuration");
}

if (!process.exitCode) process.stdout.write("project validation passed\n");
