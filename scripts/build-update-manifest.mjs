import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const releaseDir = path.resolve(root, process.argv[2] ?? "release-assets");
const repository = "WangXueZhi/Talo";
const manifestFiles = readdirSync(releaseDir).filter((file) => file.startsWith("talo-release-manifest-") && file.endsWith(".json"));
if (manifestFiles.length === 0) throw new Error(`No release manifests found in ${releaseDir}.`);

function platformKey(platform, architecture) {
  if (platform === "darwin" && architecture === "arm64") return "darwin-aarch64";
  if (platform === "darwin" && architecture === "x64") return "darwin-x86_64";
  if (platform === "win32" && architecture === "x64") return "windows-x86_64";
  return null;
}

function releaseNotes(version) {
  const changelogPath = path.join(root, "CHANGELOG.md");
  if (!existsSync(changelogPath)) return `Talo ${version}`;
  const content = readFileSync(changelogPath, "utf8");
  const match = content.match(new RegExp(`^## ${version.replaceAll(".", "\\.")}\\s*$`, "m"));
  if (!match || match.index === undefined) return `Talo ${version}`;
  const remainder = content.slice(match.index + match[0].length);
  return remainder.split(/^##\s+/m, 1)[0].trim() || `Talo ${version}`;
}

const platforms = {};
let version = null;
for (const manifestFile of manifestFiles) {
  const manifest = JSON.parse(readFileSync(path.join(releaseDir, manifestFile), "utf8"));
  version ??= manifest.version;
  if (manifest.version !== version) throw new Error("Release manifests contain different versions.");
  const key = platformKey(manifest.platform, manifest.architecture);
  if (!key) continue;
  const artifact = manifest.artifacts.find((item) =>
    key.startsWith("darwin-") ? item.kind === "macos-dmg" : item.kind === "windows-x64-nsis",
  );
  if (!artifact) continue;
  if (platforms[key]) throw new Error(`Duplicate update artifact for ${key}.`);
  platforms[key] = {
    fileName: artifact.file,
    bytes: artifact.bytes,
    sha256: artifact.sha256,
    url: `https://github.com/${repository}/releases/download/v${version}/${artifact.file}`,
  };
}

if (!platforms["darwin-aarch64"] && !platforms["darwin-x86_64"] && !platforms["windows-x86_64"]) {
  throw new Error("No supported desktop update artifacts found.");
}

const output = {
  version,
  pubDate: new Date().toISOString(),
  notes: releaseNotes(version),
  releaseNotesUrl: `https://github.com/${repository}/releases/tag/v${version}`,
  platforms,
};
writeFileSync(path.join(releaseDir, "talo-update.json"), `${JSON.stringify(output, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
