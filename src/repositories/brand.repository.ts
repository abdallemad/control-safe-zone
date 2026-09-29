import "server-only"

import type { Prisma } from "@/generated/prisma"
import { prisma } from "@/lib/prisma"

const detailSelect = {
  id: true,
  name: true,
  nameAr: true,
  slug: true,
  logoUrl: true,
  isActive: true,
} satisfies Prisma.BrandSelect

const listSelect = {
  ...detailSelect,
  createdAt: true,
  _count: { select: { models: true } },
} satisfies Prisma.BrandSelect

export const brandRepository = {
  list() {
    return prisma.brand.findMany({ select: listSelect, orderBy: { name: "asc" } })
  },

  findById(id: string) {
    return prisma.brand.findUnique({ where: { id }, select: detailSelect })
  },

  countModels(id: string) {
    return prisma.vehicleModel.count({ where: { brandId: id } })
  },

  create(data: Prisma.BrandCreateInput) {
    return prisma.brand.create({ data, select: detailSelect })
  },

  update(id: string, data: Prisma.BrandUpdateInput) {
    return prisma.brand.update({ where: { id }, data, select: detailSelect })
  },

  delete(id: string) {
    return prisma.brand.delete({ where: { id }, select: detailSelect })
  },
}
