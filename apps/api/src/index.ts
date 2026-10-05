import "dotenv/config";
import { buildServer } from "./app.js";
import { env } from "./env.js";
import { ensureMediaBucket } from "./storage.js";

const server = await buildServer();

let stopWorkers: (() => Promise<void>) | undefined;
server.addHook("onClose", async () => {
  await stopWorkers?.();
});

try {
  await server.listen({ host: "0.0.0.0", port: env.PORT });
  if (env.ENABLE_STORAGE) {
    try {
      await ensureMediaBucket();
    } catch (error) {
      server.log.error(error, "Object storage is unavailable; asset endpoints will fail until configured");
    }
  }
  if (env.ENABLE_WORKERS) {
    try {
      const workers = await import("./jobs.js");
      stopWorkers = await workers.startWorkers();
    } catch (error) {
      server.log.error(error, "Background workers could not be started");
    }
  }
} catch (error) {
  server.log.error(error);
  process.exitCode = 1;
}
