import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { apiBase } from "../../src/api/config.js";
const client = fileURLToPath(new URL("../../", import.meta.url));
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, client, "VITE_");
  const target = apiBase(env.VITE_API_BASE_URL).replace(/\/api\/v1$/, "");
  return {
    root: fileURLToPath(new URL("./", import.meta.url)),
    publicDir: `${client}/public`,
    plugins: [
      react(),
      {
        name: "qa-read-only-api",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url?.startsWith("/api/v1") && req.method !== "GET") {
              res.statusCode = 405;
              res.end("QA permits GET only");
              return;
            }
            next();
          });
        },
      },
    ],
    server: {
      host: "127.0.0.1",
      port: 5175,
      strictPort: true,
      fs: { allow: [client] },
      proxy: { "/api/v1": { target, changeOrigin: true, secure: true } },
    },
  };
});
