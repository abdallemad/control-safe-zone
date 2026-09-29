import "server-only"

import type { Prisma } from "@/generated/prisma"
import { prisma } from "@/lib/prisma"
import { productListingSelect, productOrdersSelect } from "@/repositories/product.repository"

// ICs — a `Product` of type IC plus its one `IcDetails` row and the
// `IcPlatform` links (prisma/schema.prisma "Products"). Every query here is
// scoped to type IC, so an id belonging to a controller or programmer is
// "not found", never edited as a chip. Deletes, order counts and image
// lookups are shared: product.repository.ts.

const IC = { type: "IC" } satisfies Prisma.ProductWhereInput

const listSelect = {
  ...productListingSelect,
  updatedAt: true,
  ic: {
    select: {
      partNumber: true,
      markings: true,
      category: true,
      package: true,
      _count: { select: { platforms: true } },
    },
  },
  ...productOrdersSelect,
} satisfies Prisma.ProductSelect

const detailSelect = {
  ...productListingSelect,
  description: true,
  ic: {
    select: {
      partNumber: true,
      markings: true,
      category: true,
      package: true,
      pinCount: true,
      datasheetUrl: true,
      platforms: {
        select: { platformId: true, role: true },
        orderBy: [{ platform: { manufacturer: "asc" } }, { platform: { name: "asc" } }],
      },
    },
  },
} satisfies Prisma.ProductSelect

export const icRepository = {
  list() {
    return prisma.product.findMany({ where: IC, select: listSelect, orderBy: { updatedAt: "desc" } })
  },

  findById(id: string) {
    return prisma.product.findFirst({ where: { id, ...IC }, select: detailSelect })
  },

  create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({ data, select: detailSelect })
  },

  update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({ where: { id }, data, select: detailSelect })
  },
}
