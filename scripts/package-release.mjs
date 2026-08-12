import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const releaseDir = path.join(root, "release");
const version = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")).version;
const pluginRoot = path.join(root, "plugins", "codex-project-memory");
const bundleRoot = path.join(root, "apps", "desktop", "src-tauri", "target", "release", "bundle");
const artifacts = [];

function sha256(filePath) {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

function addArtifact(filePath, kind) {
  const stats = statSync(filePath);
  artifacts.push({
    kind,
    file: path.basename(filePath),
    bytes: stats.size,
    sha256: sha256(filePath),
  });
}

function zipDirectory(outputPath, cwd, entries) {
  rmSync(outputPath, { force: true });
  if (process.platform === "win32") {
    const quote = (value) => `'${value.replaceAll("'", "''")}'`;
    const sources = entries.map((entry) => quote(path.join(cwd, entry))).join(", ");
    execFileSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        `Compress-Archive -Path @(${sources}) -DestinationPath ${quote(outputPath)} -Force`,
      ],
      { stdio: "inherit" },
    );
    return;
  }
  execFileSync("zip", ["-qry", outputPath, ...entries], { cwd, stdio: "inherit" });
}

function walk(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

mkdirSync(releaseDir, { recursive: true });

const genericZip = path.join(releaseDir, `project-memory-agent-skill-${version}.zip`);
if (!existsSync(genericZip)) {
  throw new Error(`Missing generic Agent Skill archive: ${genericZip}`);
}
addArtifact(genericZip, "generic-agent-skill");

const codexZip = path.join(releaseDir, `codex-project-memory-${version}.zip`);
zipDirectory(codexZip, pluginRoot, [
  ".codex-plugin",
  "assets",
  "dist",
  "hooks",
  "skills",
  "package.json",
]);
addArtifact(codexZip, "codex-plugin");

const macApp = path.join(bundleRoot, "macos", "Talo.app");
if (existsSync(macApp)) {
  const architecture = process.arch === "arm64" ? "aarch64" : process.arch;
  const appZip = path.join(
    releaseDir,
    `project-memory-desktop-${version}-macos-${architecture}.zip`,
  );
  zipDirectory(appZip, path.dirname(macApp), [path.basename(macApp)]);
  addArtifact(appZip, "macos-app");
}

for (const bundle of walk(bundleRoot)) {
  if (!/\.(?:dmg|msi|exe|AppImage|deb|rpm)$/i.test(bundle)) continue;
  if (path.basename(bundle).startsWith("rw.")) continue;
  const isWindowsNsis = process.platform === "win32" && bundle.toLocaleLowerCase().includes(`${path.sep}nsis${path.sep}`) && bundle.toLocaleLowerCase().endsWith(".exe");
  const targetName = isWindowsNsis
    ? `project-memory-desktop-${version}-windows-x64-setup.exe`
    : path.basename(bundle);
  const target = path.join(releaseDir, targetName);
  copyFileSync(bundle, target);
  addArtifact(target, isWindowsNsis ? "windows-x64-nsis" : "desktop-installer");
}

if (!artifacts.some((artifact) => artifact.kind === "desktop-installer" || artifact.kind === "windows-x64-nsis")) {
  throw new Error("No desktop installer was found under the Tauri release bundle directory.");
}

artifacts.sort((left, right) => left.file.localeCompare(right.file));
const manifestPath = path.join(releaseDir, `release-manifest-${version}.json`);
writeFileSync(
  manifestPath,
  `${JSON.stringify(
    {
      version,
      generatedAt: new Date().toISOString(),
      platform: process.platform,
      architecture: process.arch,
      artifacts,
    },
    null,
    2,
  )}\n`,
);
const checksumsPath = path.join(releaseDir, `SHA256SUMS-${version}.txt`);
writeFileSync(
  checksumsPath,
  `${artifacts.map((artifact) => `${artifact.sha256}  ${artifact.file}`).join("\n")}\n`,
);

process.stdout.write(
  `${JSON.stringify(
    {
      version,
      releaseDir,
      manifest: manifestPath,
      checksums: checksumsPath,
      artifacts,
    },
    null,
    2,
  )}\n`,
);
