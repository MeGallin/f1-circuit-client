import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { apiBase } from "./src/api/config.js";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const base = apiBase(env.VITE_API_BASE_URL);
  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api/v1": {
          target: base.replace(/\/api\/v1$/, ""),
          changeOrigin: true,
          secure: true,
          timeout: 90000,
          proxyTimeout: 90000,
        },
      },
    },
    test: { environment: "jsdom", setupFiles: ["./tests/setup.js"] },
  };
});
