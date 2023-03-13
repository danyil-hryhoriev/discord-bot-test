import { PrismaClient } from "@prisma/client";

import { env } from "y/env.mjs";
import { CronManager } from "y/server/cronmanager";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// CronManager.getInstance();
if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
