import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import {
  type AgentPlatform,
  installDesktopIntegration,
  removeDesktopIntegration,
  repairDesktopIntegration,
  scanDesktopIntegrations,
} from "./desktop-integration.js";
import { normalizeError, ProjectMemoryError } from "./errors.js";
import { antigravityIntegrationStatus } from "./integration.js";
import { installShortcut, removeShortcut } from "./launcher.js";
import {
  ensureDataDir,
  inspectDataHomes,
  migrateDataDir,
  resolveDataDir,
  selectDataDir,
} from "./paths.js";
import { ProjectMemoryService } from "./service.js";
import { MemoryStore } from "./store.js";
import type {
  MemoryCandidate,
  MemoryRelationCandidate,
  MemoryUpdateCandidate,
  ProposalActor,
  RelationDirection,
  RelationType,
} from "./types.js";

interface ParsedArgs {
  command: string;
  options: Map<string, string>;
  positionals: string[];
}

function parseArgs(argv: string[]): ParsedArgs {
  const [command = "help", ...rest] = argv;
  const options = new Map<string, string>();
  const positionals: string[] = [];
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token?.startsWith("--")) {
      if (token) positionals.push(token);
      continue;
    }
    const value = rest[index + 1];
    if (!value || value.startsWith("--")) {
      options.set(token.slice(2), "true");
      continue;
    }
    options.set(token.slice(2), value);
    index += 1;
  }
  return { command, options, positionals };
}

function option(args: ParsedArgs, name: string, fallback?: string): string {
  const value = args.options.get(name) ?? fallback;
  if (value === undefined) {
    throw new ProjectMemoryError("INVALID_INPUT", `Missing required option --${name}.`);
  }
  return value;
}

function integerOption(args: ParsedArgs, name: string, fallback: number): number {
  const value = Number(args.options.get(name) ?? fallback);
  if (!Number.isInteger(value) || value < 1) {
    throw new ProjectMemoryError("INVALID_INPUT", `--${name} must be a positive integer.`);
  }
  return value;
}

function listOption(args: ParsedArgs, name: string): string[] {
  return (args.options.get(name) ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function jsonInput(args: ParsedArgs): unknown {
  const inline = args.options.get("json");
  const filePath = args.options.get("json-file");
  const raw = inline ?? (filePath ? readFileSync(filePath, "utf8") : readFileSync(0, "utf8"));
  if (!raw.trim()) {
    throw new ProjectMemoryError(
      "INVALID_INPUT",
      "Provide JSON with --json, --json-file, or stdin.",
    );
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch (error) {
    throw new ProjectMemoryError("INVALID_INPUT", "Input JSON is invalid.", {
      cause: error instanceof Error ? error.message : String(error),
    });
  }
}

function createService(): ProjectMemoryService {
  const dataDir = ensureDataDir(resolveDataDir());
  return new ProjectMemoryService(new MemoryStore(dataDir), dataDir);
}

function openLocalFile(filePath: string): void {
  const command =
    process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
  const commandArgs = process.platform === "win32" ? ["/c", "start", "", filePath] : [filePath];
  const result = spawnSync(command, commandArgs, { stdio: "ignore" });
  if (result.status !== 0) {
    throw new ProjectMemoryError("STORAGE_ERROR", "Unable to open the local Talo view.", {
      path: filePath,
    });
  }
}

function registeredProjectId(service: ProjectMemoryService, pathValue: string): string {
  const detected = service.detectProject(pathValue);
  if (!detected.registeredProject) {
    throw new ProjectMemoryError("PROJECT_NOT_REGISTERED", "Project is not registered.", {
      rootPath: detected.rootPath,
      relocationCandidates: detected.relocationCandidates,
    });
  }
  return detected.registeredProject.id;
}

function refreshProjectGraph(
  service: ProjectMemoryService,
  projectId: string,
): Record<string, unknown> {
  try {
    const graph = service.buildGraph(projectId, null, 1, false);
    return { ok: true, ...service.writeGraphHtml(projectId, graph) };
  } catch (error) {
    return { ok: false, error: normalizeError(error) };
  }
}

function help(): Record<string, unknown> {
  return {
    name: "Talo",
    tagline: "Never start over.",
    usage: "talo <command> [options]",
    compatibilityUsage: "project-memory <command> [options]",
    graphView:
      "HTML opens with a project brief; use relationship trace and reading modes for deeper inspection.",
    commands: {
      detect: "detect [--path PATH]",
      register: "register [--path PATH] [--name NAME] [--relink-project-id ID]",
      status: "status [--path PATH]",
      load: "load [--path PATH] [--limit N]",
      search: "search --query TEXT [--path PATH] [--include-linked true] [--limit N]",
      recall:
        "recall (--query TEXT|--recent true) [--path PATH] [--include-linked true] [--limit N] [--recommend N] [--budget-tokens N]",
      get: "get --memory-ids ID,ID [--path PATH] [--include-linked true] [--budget-tokens N]",
      propose: "propose [--path PATH] [--json JSON|--json-file FILE|stdin]",
      commit:
        "commit --proposal-id ID [--accepted-item-ids ID,ID] [--accepted-update-ids ID,ID] [--accepted-relation-ids ID,ID] [--refresh-sources true]",
      reject: "reject --proposal-id ID",
      link: "link --source-project-id ID --target-project-id ID",
      unlink: "unlink --source-project-id ID --target-project-id ID",
      links: "links [--path PATH]",
      "search-files": "search-files --target-project-id ID --query TEXT [--path PATH]",
      "read-file": "read-file --target-project-id ID --relative-path PATH [--path PATH]",
      story: "story [--path PATH] [--format json|html] [--output PATH] [--open true]",
      hub: "hub [--format json|html] [--open true]",
      open: "open [--path PATH]",
      proposals: "proposals [--status pending|accepted|rejected]",
      capabilities: "capabilities [--platform NAME]",
      home: "home | home select --path PATH",
      "migrate-home": "migrate-home --from PATH --to PATH",
      shortcut: "shortcut install|remove",
      integration: "integration install|status|repair|remove codex|claude|antigravity",
      desktop: "desktop hub | desktop project --project-id ID | desktop integrations",
      relations:
        "relations --memory-id ID [--direction in|out|both] [--types CSV] [--include-linked true]",
      path: "path --from-memory-id ID --to-memory-id ID [--max-depth N] [--include-linked true]",
      graph:
        "graph [--memory-id ID] [--depth N] [--include-linked true] [--format json|mermaid|markdown|html] [--output PATH] [--open true]",
      guide: "guide [--path PATH] [--include-linked true] [--limit N]",
      brief: "brief [--path PATH] [--include-linked true] [--limit N]",
      export: "export [--path PATH]",
      forget: "forget --memory-ids ID,ID [--path PATH]",
      "forget-relations": "forget-relations --relation-ids ID,ID [--path PATH]",
      doctor: "doctor",
      binding: "binding",
    },
  };
}

export function runCommand(argv: string[]): unknown {
  const args = parseArgs(argv);
  if (args.command === "help" || args.options.has("help")) {
    return help();
  }
  if (args.command === "home") {
    if (args.positionals[0] === "select") return selectDataDir(option(args, "path"));
    if (args.positionals.length > 0) {
      throw new ProjectMemoryError("INVALID_INPUT", "Use `home` or `home select --path PATH`.");
    }
    return inspectDataHomes();
  }
  if (args.command === "migrate-home") {
    return migrateDataDir(option(args, "from"), option(args, "to"));
  }
  if (args.command === "capabilities") {
    return {
      protocolVersion: 1,
      platform: args.options.get("platform") ?? "generic",
      commands: [
        "detect",
        "recall",
        "get",
        "brief",
        "story",
        "guide",
        "relations",
        "graph",
        "hub",
        "propose",
        "commit",
        "reject",
        "integration",
      ],
      storage: "local-markdown-json",
      networkRequired: false,
      mcpRequired: false,
      reviewModes: ["structured", "conversational", "shared-inbox"],
    };
  }
  if (args.command === "shortcut") {
    if (args.positionals[0] === "install") return installShortcut();
    if (args.positionals[0] === "remove") return removeShortcut();
    throw new ProjectMemoryError("INVALID_INPUT", "Use `shortcut install` or `shortcut remove`.");
  }
  if (args.command === "integration") {
    const action = args.positionals[0];
    const platform = args.positionals[1] as AgentPlatform | undefined;
    if (
      !action ||
      !["install", "status", "repair", "remove"].includes(action) ||
      !platform ||
      !["codex", "claude", "antigravity"].includes(platform)
    ) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        "Use `integration install|status|repair|remove codex|claude|antigravity`.",
      );
    }
    if (action === "status") {
      if (platform === "antigravity" && args.options.get("legacy") === "true") {
        return antigravityIntegrationStatus();
      }
      return scanDesktopIntegrations({
        marketplaceRoot: args.options.get("marketplace-root") ?? null,
      }).find((status) => status.platform === platform);
    }
    const marketplaceRoot = args.options.get("marketplace-root") ?? null;
    if (action === "install") {
      return installDesktopIntegration(platform, {
        marketplaceRoot,
        migrateExternal: args.options.get("migrate-external") === "true",
      });
    }
    if (action === "repair") {
      return repairDesktopIntegration(platform, {
        dataRoot: args.options.get("data-root"),
      });
    }
    return removeDesktopIntegration(platform, { marketplaceRoot });
  }
  const service = createService();
  try {
    const pathValue = args.options.get("path") ?? process.cwd();
    switch (args.command) {
      case "desktop": {
        const action = args.positionals[0];
        if (action === "hub") return service.buildDesktopHubSnapshot();
        if (action === "register") {
          const platform = option(args, "platform") as AgentPlatform;
          if (platform !== "codex" && platform !== "claude" && platform !== "antigravity") {
            throw new ProjectMemoryError(
              "INVALID_INPUT",
              "Platform must be codex, claude, or antigravity.",
            );
          }
          return service.registerDesktopPlatformProject(platform, option(args, "path"));
        }
        if (action === "project") {
          return service.buildDesktopProjectView(option(args, "project-id"));
        }
        if (action === "integrations") {
          return scanDesktopIntegrations({
            marketplaceRoot: args.options.get("marketplace-root") ?? null,
          });
        }
        throw new ProjectMemoryError(
          "INVALID_INPUT",
          "Use `desktop hub`, `desktop register --platform PLATFORM --path PATH`, `desktop project --project-id ID`, or `desktop integrations`.",
        );
      }
      case "detect":
        return service.detectProject(pathValue);
      case "register":
        return service.registerProject(
          pathValue,
          args.options.get("name"),
          args.options.get("relink-project-id"),
        );
      case "status": {
        const detected = service.detectProject(pathValue);
        return detected.registeredProject
          ? service.projectStatus(detected.registeredProject.id)
          : { registered: false, detection: detected };
      }
      case "load":
        return {
          memories: service.getContext(
            registeredProjectId(service, pathValue),
            integerOption(args, "limit", 30),
          ),
        };
      case "search":
        return {
          memories: service.searchMemory(
            registeredProjectId(service, pathValue),
            option(args, "query"),
            args.options.get("include-linked") === "true",
            integerOption(args, "limit", 30),
          ),
        };
      case "recall":
        return service.recallMemory(
          registeredProjectId(service, pathValue),
          args.options.get("query") ?? null,
          args.options.get("recent") === "true",
          args.options.get("include-linked") === "true",
          integerOption(args, "limit", 8),
          integerOption(args, "recommend", 3),
          integerOption(args, "budget-tokens", 800),
        );
      case "get":
        return service.getMemoriesById(
          registeredProjectId(service, pathValue),
          listOption(args, "memory-ids"),
          args.options.get("include-linked") === "true",
          integerOption(args, "budget-tokens", 1700),
        );
      case "propose": {
        const input = jsonInput(args) as
          | {
              candidates?: MemoryCandidate[];
              updates?: MemoryUpdateCandidate[];
              relations?: MemoryRelationCandidate[];
              actor?: ProposalActor;
            }
          | MemoryCandidate[];
        const candidates = Array.isArray(input) ? input : input.candidates;
        const updates = Array.isArray(input) ? [] : input.updates;
        const relations = Array.isArray(input) ? [] : input.relations;
        const actor = Array.isArray(input)
          ? { platform: args.options.get("platform") ?? "generic", adapterVersion: null }
          : (input.actor ?? {
              platform: args.options.get("platform") ?? "generic",
              adapterVersion: args.options.get("adapter-version") ?? null,
            });
        if (candidates !== undefined && !Array.isArray(candidates)) {
          throw new ProjectMemoryError("INVALID_INPUT", "Proposal candidates must be an array.");
        }
        if (relations !== undefined && !Array.isArray(relations)) {
          throw new ProjectMemoryError("INVALID_INPUT", "Proposal relations must be an array.");
        }
        if (updates !== undefined && !Array.isArray(updates)) {
          throw new ProjectMemoryError("INVALID_INPUT", "Proposal updates must be an array.");
        }
        return service.proposeMemory(
          registeredProjectId(service, pathValue),
          candidates ?? [],
          relations ?? [],
          updates ?? [],
          actor,
        );
      }
      case "commit": {
        const proposalId = option(args, "proposal-id");
        const proposal = service.store.getProposal(proposalId);
        const refreshSourcesOption = args.options.get("refresh-sources");
        if (
          refreshSourcesOption !== undefined &&
          !["true", "false"].includes(refreshSourcesOption)
        ) {
          throw new ProjectMemoryError(
            "INVALID_INPUT",
            "The refresh-sources option must be true or false.",
          );
        }
        const result = service.commitMemory(
          proposalId,
          listOption(args, "accepted-item-ids"),
          listOption(args, "accepted-relation-ids"),
          listOption(args, "accepted-update-ids"),
          refreshSourcesOption === "true",
        );
        return {
          ...result,
          viewRefresh: proposal
            ? refreshProjectGraph(service, proposal.projectId)
            : { ok: false, error: { message: "Proposal project was not found." } },
        };
      }
      case "reject":
        return service.rejectMemory(option(args, "proposal-id"));
      case "link":
        return service.linkProjects(
          option(args, "source-project-id"),
          option(args, "target-project-id"),
        );
      case "unlink":
        return service.unlinkProjects(
          option(args, "source-project-id"),
          option(args, "target-project-id"),
        );
      case "links":
        return {
          links: service.store.listLinks(registeredProjectId(service, pathValue)),
        };
      case "search-files": {
        const sourceProjectId = registeredProjectId(service, pathValue);
        return service.searchFiles(
          sourceProjectId,
          option(args, "target-project-id"),
          option(args, "query"),
        );
      }
      case "read-file": {
        const sourceProjectId = registeredProjectId(service, pathValue);
        return service.readFile(
          sourceProjectId,
          option(args, "target-project-id"),
          option(args, "relative-path"),
        );
      }
      case "relations": {
        const direction = option(args, "direction", "both") as RelationDirection;
        if (!["in", "out", "both"].includes(direction)) {
          throw new ProjectMemoryError("INVALID_INPUT", "Direction must be in, out, or both.");
        }
        return service.listMemoryRelations(
          registeredProjectId(service, pathValue),
          option(args, "memory-id"),
          direction,
          listOption(args, "types") as RelationType[],
          args.options.get("include-linked") === "true",
        );
      }
      case "path":
        return service.findRelationPath(
          registeredProjectId(service, pathValue),
          option(args, "from-memory-id"),
          option(args, "to-memory-id"),
          integerOption(args, "max-depth", 4),
          args.options.get("include-linked") === "true",
        );
      case "guide": {
        const projectId = registeredProjectId(service, pathValue);
        const graph = service.buildGraph(
          projectId,
          null,
          1,
          args.options.get("include-linked") === "true",
        );
        return service.buildGraphGuide(projectId, graph, integerOption(args, "limit", 12));
      }
      case "brief": {
        const projectId = registeredProjectId(service, pathValue);
        const limit = integerOption(args, "limit", 12);
        const graph = service.buildGraph(
          projectId,
          null,
          1,
          args.options.get("include-linked") === "true",
        );
        return service.buildProjectBrief(projectId, graph, limit);
      }
      case "story": {
        const projectId = registeredProjectId(service, pathValue);
        const format = option(args, "format", "json");
        if (format === "json") return service.buildProjectStory(projectId);
        if (format === "html") {
          const graph = service.buildGraph(projectId, null, 1, false);
          const result = service.writeGraphHtml(projectId, graph, args.options.get("output"));
          if (args.options.get("open") === "true") openLocalFile(result.outputPath as string);
          return result;
        }
        throw new ProjectMemoryError("INVALID_INPUT", "Story format must be json or html.");
      }
      case "proposals": {
        const status = args.options.get("status");
        if (status && !["pending", "accepted", "rejected"].includes(status)) {
          throw new ProjectMemoryError(
            "INVALID_INPUT",
            "Proposal status must be pending, accepted, or rejected.",
          );
        }
        return {
          proposals: service.store.listProposals(status as "pending" | "accepted" | "rejected"),
        };
      }
      case "hub": {
        if (option(args, "format", "html") === "json") return service.buildMemoryHub(false);
        const result = service.writeMemoryHub(true);
        if (args.options.get("open") === "true") openLocalFile(result.outputPath as string);
        return result;
      }
      case "open": {
        if (args.options.has("path")) {
          const projectId = registeredProjectId(service, pathValue);
          const graph = service.buildGraph(projectId, null, 1, false);
          const result = service.writeGraphHtml(projectId, graph);
          openLocalFile(result.outputPath as string);
          return result;
        }
        const result = service.writeMemoryHub(true);
        openLocalFile(result.outputPath as string);
        return result;
      }
      case "graph": {
        const projectId = registeredProjectId(service, pathValue);
        const graph = service.buildGraph(
          projectId,
          args.options.get("memory-id") ?? null,
          integerOption(args, "depth", 1),
          args.options.get("include-linked") === "true",
        );
        const format = option(args, "format", "json");
        if (format === "json") return graph;
        if (format === "mermaid") return service.renderGraphMermaid(graph);
        if (format === "markdown") return service.renderGraphMarkdown(projectId, graph);
        if (format === "html") {
          const result = service.writeGraphHtml(projectId, graph, args.options.get("output"));
          if (args.options.get("open") === "true") {
            openLocalFile(result.outputPath as string);
          }
          return result;
        }
        throw new ProjectMemoryError(
          "INVALID_INPUT",
          "Graph format must be json, mermaid, markdown, or html.",
        );
      }
      case "export":
        return service.exportProject(registeredProjectId(service, pathValue));
      case "forget":
        return {
          forgottenMemoryIds: service.store.forgetMemories(
            registeredProjectId(service, pathValue),
            option(args, "memory-ids")
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean),
          ),
        };
      case "forget-relations":
        return {
          forgottenRelationIds: service.store.forgetRelations(
            registeredProjectId(service, pathValue),
            listOption(args, "relation-ids"),
          ),
        };
      case "doctor":
        return service.store.doctor();
      case "binding":
        return service.bindingSnippet(args.options.get("platform") ?? "codex");
      default:
        throw new ProjectMemoryError("INVALID_INPUT", `Unknown command: ${args.command}`);
    }
  } finally {
    service.store.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = runCommand(process.argv.slice(2));
    process.stdout.write(
      typeof result === "string" ? result : `${JSON.stringify(result, null, 2)}\n`,
    );
  } catch (error) {
    process.stderr.write(`${JSON.stringify(normalizeError(error), null, 2)}\n`);
    process.exitCode = 1;
  }
}
