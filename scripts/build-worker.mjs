import * as esbuild from "esbuild";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const watch = process.argv.includes("--watch");

const buildOptions = {
  entryPoints: [resolve(root, "components/tools/json/parse.worker.ts")],
  outfile: resolve(root, "public/parse.worker.js"),
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2022"],
  minify: process.env.NODE_ENV === "production",
  sourcemap: process.env.NODE_ENV !== "production",
  logLevel: "info",
  alias: {
    "@": root,
  },
};

if (watch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log("Watching parse.worker.ts for changes…");
} else {
  await esbuild.build(buildOptions);
}
