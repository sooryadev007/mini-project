import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

type GlobalWithPrisma = typeof globalThis & {
  __prisma?: PrismaClient;
};

export function getPrisma() {
  const globalForPrisma = globalThis as GlobalWithPrisma;

  if (!globalForPrisma.__prisma) {
    const connectionString = process.env.DATABASE_URL || "postgres://dummy:dummy@dummy.neon.tech/dummy";

    const adapter = new PrismaNeon({ connectionString });
    globalForPrisma.__prisma = new PrismaClient({ adapter });
  }

  return globalForPrisma.__prisma;
}

