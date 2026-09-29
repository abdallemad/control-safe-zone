import "server-only"

import type { Prisma, ProductType } from "@/generated/prisma"
import { prisma } from "@/lib/prisma"

// What every sold type's CRUD does to the `Product` row the same way — the
// type-specific selects and writes live in ic.repository.ts,
// programmer.repository.ts… Every query takes the type, so an id of another
// type is "not found", never touched.

/** The listing columns every type's list and detail select. */
export const productListingSelect = {
  id: true,
  name: true,
  slug: true,
  manufacturer: true,
  imageUrl: true,
  price: true,
  compareAtPrice: true,
  stockQuantity: true,
  lowStockThreshold: true,
  isActive: true,
  isFeatured: true,
} satisfies Prisma.ProductSelect

/**
 * For list rows: the distinct orders containing the product. `_count` would
 * count order *lines*, and one order can hold the same product twice.
 */
export const productOrdersSelect = {
  orderItems: { select: { orderId: true }, distinct: ["orderId"] },
} satisfies Prisma.ProductSelect

export const productRepository = {
  /** Cover + gallery URLs, for removing the files from R2 after a delete. */
  findImageUrls(id: string, type: ProductType) {
    return prisma.product.findFirst({
      where: { id, type },
      select: { imageUrl: true, images: { select: { url: true } } },
    })
  },

  /** Orders (not lines) that contain the product — any one blocks its delete. */
  countOrders(id: string) {
    return prisma.order.count({ where: { items: { some: { productId: id } } } })
  },

  /** How many of these platform ids exist — a mismatch means a stale form. */
  countPlatforms(ids: string[]) {
    return prisma.controllerPlatform.count({ where: { id: { in: ids } } })
  },

  /** Cascades to the detail row, its links, images, cart lines and vehicle links. */
  delete(id: string) {
    return prisma.product.delete({ where: { id }, select: { id: true } })
  },
}
