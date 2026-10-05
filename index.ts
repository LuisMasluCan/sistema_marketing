import { resolve } from "node:path";
import { buildServer } from "./apps/api/src/app.js";
import { env } from "./apps/api/src/env.js";

if (env.ENABLE_WORKERS) {
  throw new Error("ENABLE_WORKERS requires a persistent worker host, not Vercel Functions");
}

const server = await buildServer(
  resolve(process.cwd(), "apps", "web", "dist"),
);

await server.listen({
  host: "0.0.0.0",
  port: Number(process.env.PORT || 3000),
});
