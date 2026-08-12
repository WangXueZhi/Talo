import { execFileSync } from "node:child_process";
import { realpathSync, statSync } from "node:fs";
import path from "node:path";

export interface GitMetadata {
  rootPath: string;
  isGit: boolean;
  gitCommonDir: string | null;
  remoteUrl: string | null;
  headCommit: string | null;
}

function git(pathValue: string, args: string[]): string | null {
  try {
    return execFileSync("git", ["-C", pathValue, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

export function detectGitMetadata(inputPath: string): GitMetadata {
  const realInput = realpathSync(path.resolve(inputPath));
  const directory = statSync(realInput).isDirectory() ? realInput : path.dirname(realInput);
  const root = git(directory, ["rev-parse", "--show-toplevel"]);

  if (!root) {
    return {
      rootPath: directory,
      isGit: false,
      gitCommonDir: null,
      remoteUrl: null,
      headCommit: null,
    };
  }

  const rootPath = realpathSync(root);
  const commonDirRaw = git(rootPath, ["rev-parse", "--git-common-dir"]);
  const gitCommonDir = commonDirRaw ? realpathSync(path.resolve(rootPath, commonDirRaw)) : null;

  return {
    rootPath,
    isGit: true,
    gitCommonDir,
    remoteUrl: git(rootPath, ["remote", "get-url", "origin"]),
    headCommit: git(rootPath, ["rev-parse", "HEAD"]),
  };
}

export function listGitFiles(rootPath: string): string[] | null {
  try {
    const output = execFileSync(
      "git",
      ["-C", rootPath, "ls-files", "-co", "--exclude-standard", "-z"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 20 * 1024 * 1024 },
    );
    return output.split("\0").filter(Boolean);
  } catch {
    return null;
  }
}
