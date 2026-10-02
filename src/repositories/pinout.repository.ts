import "server-only"

import type { Prisma } from "@/generated/prisma"
import { prisma } from "@/lib/prisma"

// Pinout — a wiring diagram: a preview image (public, R2 via /api/images) and
// a PDF (private R2 key, served by /api/pinouts/[id]/pdf), optionally linked
// to one controller platform. Its own table, not a `Product`: nothing here is
// stocked or shipped.

const detailSelect = {
  id: true,
  name: true,
  slug: true,
  platformId: true,
  connector: true,
  imageUrl: true,
  pdfKey: true,
  requiresSignIn: true,
  isActive: true,
} satisfies Prisma.PinoutSelect

const listSelect = {
  id: true,
  name: true,
  slug: true,
  connector: true,
  imageUrl: true,
  pdfKey: true,
  requiresSignIn: true,
  isActive: true,
  updatedAt: true,
  platform: { select: { id: true, name: true, manufacturer: true } },
} satisfies Prisma.PinoutSelect

export const pinoutRepository = {
  list() {
    return prisma.pinout.findMany({ select: listSelect, orderBy: { updatedAt: "desc" } })
  },

  findById(id: string) {
    return prisma.pinout.findUnique({ where: { id }, select: detailSelect })
  },

  create(data: Prisma.PinoutCreateInput) {
    return prisma.pinout.create({ data, select: detailSelect })
  },

  update(id: string, data: Prisma.PinoutUpdateInput) {
    return prisma.pinout.update({ where: { id }, data, select: detailSelect })
  },

  delete(id: string) {
    return prisma.pinout.delete({ where: { id }, select: { id: true } })
  },
}
