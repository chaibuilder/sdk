import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "actions.ts",
    "web-blocks.ts",
    "rsc/index.tsx",
    "core.ts",
    "supabase-actions.ts",
    "runtime.ts",
    "render.ts",
    "utils.ts",
  ],
  target: "es2018",
  esbuildOptions(options) {
    options.loader = {
      ...options.loader,
      ".tsx": "tsx",
    };
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  skipNodeModulesBundle: true,
  external: [
    "react",
    "react-dom",
    "next",
    "@chaibuilder/sdk",
    "@ai-sdk/openai",
    "@supabase/ssr",
    "@supabase/supabase-js",
    "@tailwindcss/aspect-ratio",
    "@tailwindcss/container-queries",
    "@tailwindcss/forms",
    "@tailwindcss/typography",
    "ai",
    "chalk",
    "date-fns",
    "lodash",
    "postcss",
    "raw-loader",
    "sharp",
    "tailwindcss",
    "tailwindcss-animate",
    "zod",
  ],
  minify: true,
  sourcemap: false,
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".cjs" : ".js",
    };
  },
});
