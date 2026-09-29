import "server-only"

import type { Prisma } from "@/generated/prisma"
import { prisma } from "@/lib/prisma"

// The columns a session needs — never the whole row (orders, addresses and
// phone stay out of anything that can reach the client).
const sessionUserSelect = {
  id: true,
  clerkId: true,
  email: true,
  fullName: true,
  role: true,
} satisfies Prisma.UserSelect

export const userRepository = {
  findByClerkId(clerkId: string) {
    return prisma.user.findUnique({ where: { clerkId }, select: sessionUserSelect })
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email }, select: sessionUserSelect })
  },

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data, select: sessionUserSelect })
  },

  update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data, select: sessionUserSelect })
  },
}
