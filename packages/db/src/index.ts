import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Lazy singleton: the client is only constructed on first use, so importing
 * this package never throws when DATABASE_URL is unset (e.g. placeholder-mode
 * builds). Callers wrap queries in try/catch and fall back to seed data.
 */
export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}

export { Prisma, PrismaClient } from "@prisma/client";
export type { Product, Review, ReviewImage, ReviewStatus } from "@prisma/client";
export * from "./types";
