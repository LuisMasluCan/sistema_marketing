import type { FastifyInstance } from "fastify";
import { createLeadSchema, updateLeadStatusSchema } from "@rgr/shared";
import { prisma } from "./db.js";
import { requireAuth, requireRole } from "./auth.js";

export async function registerLeadRoutes(server: FastifyInstance) {
  server.get("/api/leads", { preHandler: [requireAuth] }, async (request) => {
    const query = request.query as {
      businessUnit?: string;
      status?: string;
      search?: string;
    };
    return prisma.lead.findMany({
      where: {
        ...(query.businessUnit
          ? { businessUnit: query.businessUnit as "workshop" | "machinery" }
          : {}),
        ...(query.status ? { status: query.status as never } : {}),
        ...(query.search
          ? {
              OR: [
                { name: { contains: query.search, mode: "insensitive" } },
                { phone: { contains: query.search } },
                { service: { contains: query.search, mode: "insensitive" } },
                { product: { contains: query.search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { date: "desc" },
      take: 200,
    });
  });

  server.post(
    "/api/leads",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const parsed = createLeadSchema.safeParse(request.body);
      if (!parsed.success)
        return reply.code(400).send({ error: parsed.error.flatten() });

      const lead = await prisma.lead.create({
        data: {
          ...parsed.data,
          date: new Date(parsed.data.date),
          amount: parsed.data.amount,
          ownerId: request.user.sub,
        },
      });
      return reply.code(201).send(lead);
    },
  );

  server.patch(
    "/api/leads/:id",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const params = request.params as { id: string };
      const parsed = createLeadSchema.safeParse(request.body);
      if (!parsed.success)
        return reply.code(400).send({ error: parsed.error.flatten() });

      return reply.send(
        await prisma.lead.update({
          where: { id: params.id },
          data: {
            ...parsed.data,
            date: new Date(parsed.data.date),
            amount: parsed.data.amount,
          },
        }),
      );
    },
  );

  server.delete(
    "/api/leads/:id",
    { preHandler: [requireRole("ADMIN", "SALES")] },
    async (request, reply) => {
      const params = request.params as { id: string };
      await prisma.lead.delete({ where: { id: params.id } });
      return reply.code(204).send();
    },
  );

  server.patch(
    "/api/leads/:id/status",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const params = request.params as { id: string };
      const parsed = updateLeadStatusSchema.safeParse(request.body);
      if (!parsed.success)
        return reply.code(400).send({ error: parsed.error.flatten() });

      const lead = await prisma.lead.update({
        where: { id: params.id },
        data: {
          status: parsed.data.status,
          ...(parsed.data.status === "contacted"
            ? { contactedAt: new Date() }
            : {}),
        },
      });
      return reply.send(lead);
    },
  );
}
