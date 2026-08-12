import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    talo: "src/cli.ts",
    "project-memory": "src/cli.ts",
    index: "src/index.ts",
    types: "src/types.ts"
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
  outExtension: () => ({ js: ".mjs" })
});
