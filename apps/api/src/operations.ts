import type { FastifyInstance } from "fastify";
import { prospectSchema } from "@rgr/shared";
import { z } from "zod";
import { prisma } from "./db.js";
import { requireAuth, requireRole } from "./auth.js";

const campaignSchema = z.object({
  name: z.string().trim().min(3).max(120),
  businessUnit: z.enum(["workshop", "machinery"]),
  product: z.string().trim().min(2).max(120),
  audience: z.string().trim().min(2).max(240),
  objective: z.string().trim().min(2).max(120),
  budget: z.number().positive(),
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime().nullable(),
});

const taskStatusSchema = z.object({
  status: z.enum(["pending", "in_progress", "completed"]),
});
const contentScheduleSchema = z.object({
  scheduledAt: z.iso.datetime(),
});
const weeklyReportSchema = z.object({
  weekStarting: z.iso.datetime(),
  metrics: z.record(z.string(), z.json()),
});

export async function registerOperationsRoutes(server: FastifyInstance) {
  const workspaceCollections = [
    "prospectos",
    "campanas",
    "contenidos",
    "tareas",
    "publicaciones",
    "conversaciones",
    "assets",
    "productos",
    "usuarios",
    "canales",
    "etiquetas",
    "metas",
  ] as const;
  const isWorkspaceCollection = (value: string): value is (typeof workspaceCollections)[number] =>
    workspaceCollections.includes(value as (typeof workspaceCollections)[number]);

  server.get("/api/workspace", { preHandler: [requireAuth] }, async () =>
    prisma.workspaceRecord.findMany({
      orderBy: [{ collection: "asc" }, { createdAt: "asc" }],
    }),
  );

  server.put(
    "/api/workspace/:collection/:id",
    { preHandler: [requireRole("ADMIN", "EDITOR", "SALES")] },
    async (request, reply) => {
      const { collection, id } = request.params as { collection: string; id: string };
      if (!isWorkspaceCollection(collection))
        return reply.code(404).send({ error: "Colección desconocida" });
      const parsed = z
        .object({ id: z.string().min(1) })
        .catchall(z.json())
        .safeParse(request.body);
      if (!parsed.success)
        return reply.code(400).send({ error: parsed.error.flatten() });
      if (parsed.data.id !== id)
        return reply.code(400).send({ error: "El ID del registro no coincide" });

      return prisma.workspaceRecord.upsert({
        where: { collection_id: { collection, id } },
        create: { collection, id, data: parsed.data },
        update: { data: parsed.data },
      });
    },
  );

  server.delete(
    "/api/workspace/:collection/:id",
    { preHandler: [requireRole("ADMIN", "EDITOR", "SALES")] },
    async (request, reply) => {
      const { collection, id } = request.params as { collection: string; id: string };
      if (!isWorkspaceCollection(collection))
        return reply.code(404).send({ error: "Colección desconocida" });
      await prisma.workspaceRecord.deleteMany({
        where: { collection, id },
      });
      return reply.code(204).send();
    },
  );

  server.get("/api/products", { preHandler: [requireAuth] }, async () =>
    prisma.product.findMany({
      where: { active: true },
      orderBy: [{ businessUnit: "asc" }, { name: "asc" }],
    }),
  );

  server.get("/api/services", { preHandler: [requireAuth] }, async () =>
    prisma.serviceOffer.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
  );

  server.get("/api/content", { preHandler: [requireAuth] }, async () =>
    prisma.contentPiece.findMany({
      orderBy: { scheduledAt: "asc" },
      take: 250,
    }),
  );

  server.patch(
    "/api/content/:id/schedule",
    { preHandler: [requireRole("ADMIN", "EDITOR")] },
    async (request, reply) => {
      const params = request.params as { id: string };
      const parsed = contentScheduleSchema.safeParse(request.body);
      if (!parsed.success)
        return reply.code(400).send({ error: parsed.error.flatten() });
      return reply.send(
        await prisma.contentPiece.update({
          where: { id: params.id },
          data: { scheduledAt: new Date(parsed.data.scheduledAt) },
        }),
      );
    },
  );

  server.get("/api/prospects", { preHandler: [requireAuth] }, async () =>
    prisma.companyProspect.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  );

  server.post(
    "/api/prospects",
    { preHandler: [requireRole("ADMIN", "EDITOR")] },
    async (request, reply) => {
      const parsed = prospectSchema.safeParse(request.body);
      if (!parsed.success)
        return reply.code(400).send({ error: parsed.error.flatten() });
      return reply
        .code(201)
        .send(await prisma.companyProspect.create({ data: parsed.data }));
    },
  );

  server.patch(
    "/api/prospects/:id/status",
    { preHandler: [requireRole("ADMIN", "EDITOR", "SALES")] },
    async (request, reply) => {
      const params = request.params as { id: string };
      const parsed = prospectSchema
        .pick({ status: true, nextAction: true })
        .partial()
        .safeParse(request.body);
      if (!parsed.success)
        return reply.code(400).send({ error: parsed.error.flatten() });
      return reply.send(
        await prisma.companyProspect.update({
          where: { id: params.id },
          data: parsed.data,
        }),
      );
    },
  );

  server.get("/api/campaigns", { preHandler: [requireAuth] }, async () =>
    prisma.campaign.findMany({
      orderBy: [{ active: "desc" }, { startsAt: "desc" }],
    }),
  );

  server.post(
    "/api/campaigns",
    { preHandler: [requireRole("ADMIN")] },
    async (request, reply) => {
      const parsed = campaignSchema.safeParse(request.body);
      if (!parsed.success)
        return reply.code(400).send({ error: parsed.error.flatten() });
      return reply.code(201).send(
        await prisma.campaign.create({
          data: {
            ...parsed.data,
            startsAt: new Date(parsed.data.startsAt),
            endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
          },
        }),
      );
    },
  );

  server.patch(
    "/api/campaigns/:id/active",
    { preHandler: [requireRole("ADMIN")] },
    async (request, reply) => {
      const params = request.params as { id: string };
      const parsed = z.object({ active: z.boolean() }).safeParse(request.body);
      if (!parsed.success)
        return reply.code(400).send({ error: parsed.error.flatten() });
      return reply.send(
        await prisma.campaign.update({
          where: { id: params.id },
          data: { active: parsed.data.active },
        }),
      );
    },
  );

  server.get("/api/tasks", { preHandler: [requireAuth] }, async () =>
    prisma.task.findMany({
      orderBy: [{ status: "asc" }, { dueAt: "asc" }],
      take: 200,
    }),
  );

  server.patch(
    "/api/tasks/:id/status",
    { preHandler: [requireRole("ADMIN", "EDITOR")] },
    async (request, reply) => {
      const params = request.params as { id: string };
      const parsed = taskStatusSchema.safeParse(request.body);
      if (!parsed.success)
        return reply.code(400).send({ error: parsed.error.flatten() });
      return reply.send(
        await prisma.task.update({
          where: { id: params.id },
          data: parsed.data,
        }),
      );
    },
  );

  server.get(
    "/api/reports/latest",
    { preHandler: [requireRole("ADMIN", "MANAGEMENT")] },
    async () =>
      prisma.weeklyReport.findFirst({ orderBy: { weekStarting: "desc" } }),
  );

  server.post(
    "/api/reports",
    { preHandler: [requireRole("ADMIN", "MANAGEMENT")] },
    async (request, reply) => {
      const parsed = weeklyReportSchema.safeParse(request.body);
      if (!parsed.success)
        return reply.code(400).send({ error: parsed.error.flatten() });
      const weekStarting = new Date(parsed.data.weekStarting);
      return prisma.weeklyReport.upsert({
        where: { weekStarting },
        create: { weekStarting, metrics: parsed.data.metrics },
        update: { metrics: parsed.data.metrics },
      });
    },
  );
}
