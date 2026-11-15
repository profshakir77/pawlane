import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const g = globalThis as unknown as { prisma?: PrismaClient };
function create(): PrismaClient {
  return new PrismaClient().$extends(withAccelerate()) as unknown as PrismaClient;
}
export const prisma = g.prisma ?? create();
g.prisma = prisma;
