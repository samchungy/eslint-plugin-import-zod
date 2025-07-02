import { defineConfig } from "tsdown/config";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["cjs", "esm"],
  exports: true,
});
