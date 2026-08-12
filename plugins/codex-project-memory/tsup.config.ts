import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    talo: "../../packages/project-memory-core/src/cli.ts",
    "project-memory": "../../packages/project-memory-core/src/cli.ts",
    "hook-stop": "src/hook-stop.ts",
  },
  format: ["esm"],
  platform: "node",
  target: "node22",
  clean: true,
  bundle: true,
  noExternal: [/.*/],
  splitting: false,
  sourcemap: false,
  minify: false,
  outDir: "dist",
  outExtension: () => ({ js: ".mjs" }),
});
