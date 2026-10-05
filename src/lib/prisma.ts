import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";

/**
 * Prisma 7 takes a driver adapter rather than a datasource URL. DATABASE_URL is
 * Supabase's pooled connection, so keep the local pool small — the pooler is
 * doing the real pooling.
 */
function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local.");

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString, max: 5 }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
