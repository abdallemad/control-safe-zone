import "server-only"

import type { Prisma } from "@/generated/prisma"
import { prisma } from "@/lib/prisma"
import { productListingSelect, productOrdersSelect } from "@/repositories/product.repository"

// Controllers — a `Product` of type CONTROLLER plus its one
// `ControllerDetails` row (the physical ECU unit, on exactly one platform).
// Scoped to type CONTROLLER, like ic.repository.ts. Deletes, order counts
// and image lookups are shared: product.repository.ts.

const CONTROLLER = { type: "CONTROLLER" } satisfies Prisma.ProductWhereInput

const platformSelect = { select: { id: true, name: true, manufacturer: true } } as const

const listSelect = {
  ...productListingSelect,
  updatedAt: true,
  controller: {
    select: {
      hardwareNumber: true,
      softwareNumber: true,
      partNumber: true,
      serialNumber: true,
      condition: true,
      isVirgin: true,
      platform: platformSelect,
    },
  },
  ...productOrdersSelect,
} satisfies Prisma.ProductSelect

const detailSelect = {
  ...productListingSelect,
  description: true,
  controller: {
    select: {
      platformId: true,
      hardwareNumber: true,
      softwareNumber: true,
      partNumber: true,
      condition: true,
      isVirgin: true,
      litres: true,
      serialNumber: true,
    },
  },
} satisfies Prisma.ProductSelect

export const controllerRepository = {
  list() {
    return prisma.product.findMany({ where: CONTROLLER, select: listSelect, orderBy: { updatedAt: "desc" } })
  },

  findById(id: string) {
    return prisma.product.findFirst({ where: { id, ...CONTROLLER }, select: detailSelect })
  },

  create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({ data, select: detailSelect })
  },

  update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({ where: { id }, data, select: detailSelect })
  },
}
