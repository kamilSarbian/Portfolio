import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { countryToLanguage } from "./api/locale.js";

function localLocaleApi() {
  return {
    name: "local-locale-api",
    configureServer(server) {
      server.middlewares.use("/api/locale", (request, response) => {
        if (request.method !== "GET") {
          response.statusCode = 405;
          response.setHeader("Allow", "GET");
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.end(JSON.stringify({ error: "Method not allowed." }));
          return;
        }

        const countryHeader = request.headers["x-vercel-ip-country"];
        const country = Array.isArray(countryHeader) ? countryHeader[0] : countryHeader;

        response.statusCode = 200;
        response.setHeader("Cache-Control", "private, no-store");
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.end(JSON.stringify({ language: countryToLanguage(country) }));
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localLocaleApi()],
});
