import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/vitest-setup.ts"],
    exclude: [...configDefaults.exclude, "./e2e_tests"],
    includeSource: ["src/**/*.{ts,tsx}"],
  },
  define: {
    "import.meta.vitest": "undefined",
  },
});
