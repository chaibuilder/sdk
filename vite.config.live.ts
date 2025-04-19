import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "live",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
