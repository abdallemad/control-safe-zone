import "server-only"

import type { Prisma } from "@/generated/prisma"
import { prisma } from "@/lib/prisma"
import { productListingSelect, productOrdersSelect } from "@/repositories/product.repository"

// Programmers — a `Product` of type PROGRAMMER plus its one
// `ProgrammerDetails` row and the `ProgrammerSupport` rows (which platforms
// it reads, over OBD / Boot / Bench). Scoped to type PROGRAMMER, like
// ic.repository.ts. Deletes, order counts and image lookups are shared:
// product.repository.ts.

const PROGRAMMER = { type: "PROGRAMMER" } satisfies Prisma.ProductWhereInput

const listSelect = {
  ...productListingSelect,
  updatedAt: true,
  programmer: {
    select: {
      toolName: true,
      edition: true,
      // Only the flags: the list derives "reads anything over OBD" etc.
      supports: { select: { obd: true, boot: true, bench: true } },
    },
  },
  ...productOrdersSelect,
} satisfies Prisma.ProductSelect

const detailSelect = {
  ...productListingSelect,
  description: true,
  programmer: {
    select: {
      toolName: true,
      edition: true,
      boxContents: true,
      supports: {
        select: { platformId: true, obd: true, boot: true, bench: true, notes: true },
        orderBy: [{ platform: { manufacturer: "asc" } }, { platform: { name: "asc" } }],
      },
    },
  },
} satisfies Prisma.ProductSelect

export const programmerRepository = {
  list() {
    return prisma.product.findMany({ where: PROGRAMMER, select: listSelect, orderBy: { updatedAt: "desc" } })
  },

  findById(id: string) {
    return prisma.product.findFirst({ where: { id, ...PROGRAMMER }, select: detailSelect })
  },

  /** Case-insensitive tool lookup — "Kess V3" and "KESS v3" are one tool. */
  findByToolNameInsensitive(toolName: string, excludeProductId?: string) {
    return prisma.programmerDetails.findFirst({
      where: {
        toolName: { equals: toolName, mode: "insensitive" },
        ...(excludeProductId && { productId: { not: excludeProductId } }),
      },
      select: { productId: true },
    })
  },

  create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({ data, select: detailSelect })
  },

  update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({ where: { id }, data, select: detailSelect })
  },
}
