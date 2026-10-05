import { createHash, randomBytes } from "node:crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { loginSchema } from "@rgr/shared";
import { z } from "zod";
import { prisma } from "./db.js";
import { env } from "./env.js";
import { hashPassword, verifyPassword } from "./password.js";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string; role: string };
    user: { sub: string; role: string };
  }
}

const createUserSchema = loginSchema.extend({
  name: z.string().trim().min(2).max(120),
  role: z.enum(["ADMIN", "EDITOR", "SALES", "MANAGEMENT"]),
});
const bootstrapSchema = loginSchema.extend({
  name: z.string().trim().min(2).max(120),
});

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
const unauthorized = () =>
  Object.assign(new Error("Credenciales inválidas"), { statusCode: 401 });

export async function requireAuth(request: FastifyRequest) {
  await request.jwtVerify();
}

export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    await request.jwtVerify();
    if (!roles.includes(String(request.user.role))) {
      throw Object.assign(new Error("No tienes permisos para esta acción"), {
        statusCode: 403,
      });
    }
  };
}

async function createRefreshToken(userId: string) {
  const token = randomBytes(48).toString("base64url");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: { userId, tokenHash: hashToken(token), expiresAt },
  });
  return token;
}

async function issueSession(
  server: FastifyInstance,
  reply: FastifyReply,
  user: { id: string; name: string; email: string; role: string },
) {
  const accessToken = server.jwt.sign(
    { sub: user.id, role: user.role },
    { expiresIn: "15m" },
  );
  const refreshToken = await createRefreshToken(user.id);
  reply.setCookie("rgrRefreshToken", refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
    maxAge: 30 * 24 * 60 * 60,
  });
  return { accessToken, user };
}

export async function registerAuthRoutes(server: FastifyInstance) {
  server.get("/api/auth/setup-required", async () => ({
    setupRequired: (await prisma.user.count()) === 0,
  }));

  server.post("/api/auth/bootstrap", async (request, reply) => {
    const parsed = bootstrapSchema.safeParse(request.body);
    if (!parsed.success)
      return reply.code(400).send({ error: parsed.error.flatten() });

    const passwordHash = await hashPassword(parsed.data.password);
    let user;
    try {
      user = await prisma.$transaction(
        async (transaction) => {
          if ((await transaction.user.count()) !== 0) {
            throw Object.assign(new Error("La cuenta inicial ya fue creada"), {
              statusCode: 409,
            });
          }
          return transaction.user.create({
            data: {
              name: parsed.data.name,
              email: parsed.data.email.toLowerCase(),
              passwordHash,
              role: "ADMIN",
            },
          });
        },
        { isolationLevel: "Serializable" },
      );
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "statusCode" in error &&
        error.statusCode === 409
      ) {
        return reply.code(409).send({ error: "La cuenta inicial ya fue creada" });
      }
      throw error;
    }

    return reply.code(201).send(
      await issueSession(server, reply, {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }),
    );
  });

  server.get("/api/auth/me", { preHandler: [requireAuth] }, async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user.sub },
      select: { id: true, name: true, email: true, role: true, active: true },
    });
    if (!user?.active) return reply.code(401).send({ error: "Sesión inválida" });
    return user;
  });

  server.post(
    "/api/auth/login",
    {
      config: { rateLimit: { max: 8, timeWindow: "1 minute" } },
    },
    async (request, reply) => {
      const parsed = loginSchema.safeParse(request.body);
      if (!parsed.success)
        return reply.code(400).send({ error: parsed.error.flatten() });

      const user = await prisma.user.findUnique({
        where: { email: parsed.data.email.toLowerCase() },
      });
      if (
        !user?.active ||
        !(await verifyPassword(parsed.data.password, user.passwordHash))
      ) {
        throw unauthorized();
      }

      return issueSession(
        server,
        reply,
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      );
    },
  );

  server.post("/api/auth/refresh", async (request, reply) => {
    const refreshToken = request.cookies.rgrRefreshToken;
    if (!refreshToken) throw unauthorized();

    const tokenHash = hashToken(refreshToken);
    const current = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    if (
      !current ||
      current.revokedAt ||
      current.expiresAt <= new Date() ||
      !current.user.active
    ) {
      throw unauthorized();
    }

    const nextToken = randomBytes(48).toString("base64url");
    const nextExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const rotated = await prisma.$transaction(async (transaction) => {
      const revoked = await transaction.refreshToken.updateMany({
        where: {
          id: current.id,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: { revokedAt: new Date() },
      });
      if (revoked.count !== 1) return false;
      await transaction.refreshToken.create({
        data: {
          userId: current.userId,
          tokenHash: hashToken(nextToken),
          expiresAt: nextExpiresAt,
        },
      });
      return true;
    });
    if (!rotated) throw unauthorized();

    reply.setCookie("rgrRefreshToken", nextToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth",
      maxAge: 30 * 24 * 60 * 60,
    });

    return {
      accessToken: server.jwt.sign(
        { sub: current.user.id, role: current.user.role },
        { expiresIn: "15m" },
      ),
      user: {
        id: current.user.id,
        name: current.user.name,
        email: current.user.email,
        role: current.user.role,
      },
    };
  });

  server.post("/api/auth/logout", async (request, reply) => {
    const refreshToken = request.cookies.rgrRefreshToken;
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(refreshToken), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    reply.clearCookie("rgrRefreshToken", { path: "/api/auth" });
    return reply.code(204).send();
  });

  server.post(
    "/api/auth/users",
    { preHandler: [requireRole("ADMIN")] },
    async (request, reply) => {
      const parsed = createUserSchema.safeParse(request.body);
      if (!parsed.success)
        return reply.code(400).send({ error: parsed.error.flatten() });

      const user = await prisma.user.create({
        data: {
          ...parsed.data,
          email: parsed.data.email.toLowerCase(),
          passwordHash: await hashPassword(parsed.data.password),
        },
        select: { id: true, name: true, email: true, role: true, active: true },
      });
      return reply.code(201).send(user);
    },
  );
}
