import { randomUUID } from "node:crypto";
import {
  CreateBucketCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./db.js";
import { env } from "./env.js";
import { requireRole } from "./auth.js";

const s3 = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
});

export async function ensureMediaBucket() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }));
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: env.S3_BUCKET }));
  }
}

export async function registerStorageRoutes(server: FastifyInstance) {
  server.post(
    "/api/assets/upload-url",
    { preHandler: [requireRole("ADMIN", "EDITOR")] },
    async (request, reply) => {
      const parsed = z
        .object({
          fileName: z.string().trim().min(1).max(180),
          contentType: z
            .string()
            .regex(/^(image|video)\/(jpeg|png|webp|mp4|quicktime)$/),
          businessUnit: z.enum(["workshop", "machinery"]),
          category: z.string().trim().min(2).max(80),
        })
        .safeParse(request.body);
      if (!parsed.success)
        return reply.code(400).send({ error: parsed.error.flatten() });

      const safeName = parsed.data.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
      const storageKey = `${parsed.data.businessUnit}/${randomUUID()}-${safeName}`;
      const uploadUrl = await getSignedUrl(
        s3,
        new PutObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: storageKey,
          ContentType: parsed.data.contentType,
        }),
        { expiresIn: 300 },
      );

      return { uploadUrl, storageKey, expiresIn: 300 };
    },
  );

  server.post(
    "/api/assets/confirm",
    { preHandler: [requireRole("ADMIN", "EDITOR")] },
    async (request, reply) => {
      const parsed = z
        .object({
          fileName: z.string().trim().min(1).max(180),
          contentType: z.string().min(3).max(100),
          storageKey: z.string().min(10).max(400),
          businessUnit: z.enum(["workshop", "machinery"]),
          category: z.string().trim().min(2).max(80),
        })
        .safeParse(request.body);
      if (!parsed.success)
        return reply.code(400).send({ error: parsed.error.flatten() });

      const expectedPrefix = `${parsed.data.businessUnit}/`;
      if (!parsed.data.storageKey.startsWith(expectedPrefix))
        return reply.code(400).send({ error: "Ruta de archivo inválida" });
      await s3.send(
        new HeadObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: parsed.data.storageKey,
        }),
      );
      return reply.code(201).send(
        await prisma.mediaAsset.create({
          data: { ...parsed.data, uploadedBy: request.user.sub },
        }),
      );
    },
  );
}
