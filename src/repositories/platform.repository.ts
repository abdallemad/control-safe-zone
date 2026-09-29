import "server-only"

import type { Prisma } from "@/generated/prisma"
import { prisma } from "@/lib/prisma"

// ControllerPlatform — "Bosch EDC17C46", the reference row that controllers,
// ICs, programmers and pinouts all link to.

const detailSelect = {
  id: true,
  name: true,
  slug: true,
  manufacturer: true,
  description: true,
  isActive: true,
} satisfies Prisma.ControllerPlatformSelect

const linkCounts = {
  _count: { select: { controllers: true, ics: true, programmers: true, pinouts: true } },
} satisfies Prisma.ControllerPlatformSelect

const listSelect = {
  id: true,
  name: true,
  slug: true,
  manufacturer: true,
  isActive: true,
  updatedAt: true,
  ...linkCounts,
} satisfies Prisma.ControllerPlatformSelect

export const platformRepository = {
  list() {
    return prisma.controllerPlatform.findMany({
      select: listSelect,
      orderBy: [{ manufacturer: "asc" }, { name: "asc" }],
    })
  },

  findById(id: string) {
    return prisma.controllerPlatform.findUnique({ where: { id }, select: detailSelect })
  },

  /** Case-insensitive name lookup — "edc17c46" and "EDC17C46" are one platform. */
  findByNameInsensitive(name: string, excludeId?: string) {
    return prisma.controllerPlatform.findFirst({
      where: { name: { equals: name, mode: "insensitive" }, ...(excludeId && { id: { not: excludeId } }) },
      select: { id: true },
    })
  },

  countLinks(id: string) {
    return prisma.controllerPlatform.findUnique({ where: { id }, select: linkCounts })
  },

  create(data: Prisma.ControllerPlatformCreateInput) {
    return prisma.controllerPlatform.create({ data, select: detailSelect })
  },

  update(id: string, data: Prisma.ControllerPlatformUpdateInput) {
    return prisma.controllerPlatform.update({ where: { id }, data, select: detailSelect })
  },

  delete(id: string) {
    return prisma.controllerPlatform.delete({ where: { id }, select: { id: true } })
  },
}
