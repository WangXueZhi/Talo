import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { build } from "esbuild";

const root = path.resolve(import.meta.dirname, "..");
const coreRoot = path.resolve(root, "../../packages/project-memory-core");
const outputDir = path.join(root, "dist", "browser");

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

await build({
  entryPoints: [path.join(coreRoot, "src", "browser", "main.tsx")],
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2022"],
  jsx: "automatic",
  jsxImportSource: "preact",
  minify: true,
  sourcemap: false,
  legalComments: "none",
  outfile: path.join(outputDir, "graph-app.js"),
});

await build({
  entryPoints: [path.join(coreRoot, "src", "browser", "styles.css")],
  bundle: true,
  minify: true,
  sourcemap: false,
  legalComments: "none",
  outfile: path.join(outputDir, "graph-app.css"),
});
