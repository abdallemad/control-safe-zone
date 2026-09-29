import "server-only"

import { PrismaClient } from "@/generated/prisma"

// The database provider: one PrismaClient per server process. `next dev`
// re-evaluates modules on every edit, and each new client opens its own
// connection pool — on Neon that exhausts connections within minutes — so the
// instance is parked on globalThis outside production.
//
// Only repositories import this (docs/folder-structure.md "Architecture Rules").

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
