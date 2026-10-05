import { existsSync, statSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import { env } from "./env.js";
import { prisma } from "./db.js";
import { registerAuthRoutes } from "./auth.js";
import { registerLeadRoutes } from "./leads.js";
import { registerOperationsRoutes } from "./operations.js";
import { registerStorageRoutes } from "./storage.js";

export async function buildServer(staticRoot?: string) {
  const server = Fastify({ logger: true });

  if (env.WEB_ORIGIN) {
    await server.register(cors, { origin: env.WEB_ORIGIN, credentials: true });
  }
  await server.register(cookie);
  await server.register(rateLimit, { max: 120, timeWindow: "1 minute" });
  await server.register(jwt, { secret: env.JWT_SECRET });

  server.get("/health", async () => ({ status: "ok" }));
  server.get("/health/ready", async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: "ready" };
    } catch {
      return reply.code(503).send({ status: "unavailable" });
    }
  });

  await registerAuthRoutes(server);
  await registerLeadRoutes(server);
  await registerOperationsRoutes(server);
  await registerStorageRoutes(server);

  if (staticRoot) {
    await server.register(fastifyStatic, { root: staticRoot, wildcard: false });
    server.setNotFoundHandler(async (request, reply) => {
      const requestPath = new URL(
        request.raw.url ?? "/",
        "http://localhost",
      ).pathname;
      if (
        requestPath === "/api" ||
        requestPath.startsWith("/api/") ||
        !["GET", "HEAD"].includes(request.method)
      ) {
        return reply.code(404).send({ error: "Ruta no encontrada" });
      }

      const decodedPath = decodeURIComponent(requestPath);
      const requestedFile = decodedPath.replace(/^[/\\]+/, "");
      const resolvedFile = resolve(staticRoot, requestedFile);
      const relativeFile = relative(staticRoot, resolvedFile);
      if (relativeFile.startsWith("..") || isAbsolute(relativeFile)) {
        return reply.code(400).send({ error: "Ruta de archivo inválida" });
      }

      const fileToSend =
        existsSync(resolvedFile) && statSync(resolvedFile).isFile()
          ? relativeFile.split(sep).join("/")
          : "index.html";
      return reply.sendFile(fileToSend);
    });
  }

  server.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  return server;
}
