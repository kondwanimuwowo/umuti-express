import { defineConfig, env } from "prisma/config";

// The Prisma CLI reads .env, but Next.js keeps local values in .env.local.
// Loaded in this order so .env.local wins.
for (const file of [".env", ".env.local"]) {
  try {
    process.loadEnvFile?.(file);
  } catch {
    // Missing file, which is fine: the other one may carry the values.
  }
}

/**
 * Prisma 7 keeps connection URLs here rather than in schema.prisma.
 * Migrations and introspection use DIRECT_URL (port 5432); the app itself
 * connects through the pooled DATABASE_URL via the adapter in src/lib/prisma.ts.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
