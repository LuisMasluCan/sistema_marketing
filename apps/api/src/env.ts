import { z } from "zod";

const defaultDatabaseUrl =
  "postgresql://postgres:postgres@localhost:5432/rgr_marketing?schema=public";
const defaultJwtSecret = "development-secret-key-change-me-1234567890";

if (process.env.NODE_ENV === "production" || process.env.VERCEL === "1") {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be configured in production");
  }
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be configured in production");
  }
}

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().url().default(defaultDatabaseUrl),
  JWT_SECRET: z.string().min(32).default(defaultJwtSecret),
  WEB_ORIGIN: z.url().optional(),
  REDIS_URL: z.string().default("redis://127.0.0.1:6379"),
  S3_ENDPOINT: z.url().default("http://127.0.0.1:9000"),
  S3_REGION: z.string().default("us-east-1"),
  S3_BUCKET: z.string().default("rgr-media"),
  S3_ACCESS_KEY_ID: z.string().min(1).default("rgr_minio_dev"),
  S3_SECRET_ACCESS_KEY: z.string().min(1).default("rgr_minio_local_secret_change_me"),
  ENABLE_WORKERS: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  ENABLE_STORAGE: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
});

export const env = environmentSchema.parse({
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL || defaultDatabaseUrl,
  JWT_SECRET: process.env.JWT_SECRET || defaultJwtSecret,
});
