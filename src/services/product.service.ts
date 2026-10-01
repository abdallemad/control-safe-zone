import "server-only"

import type { Prisma, ProductType } from "@/generated/prisma"
import { ServiceError } from "@/lib/errors"
import { isPrismaError } from "@/lib/prisma-errors"
import { ar } from "@/messages/ar"
import { productRepository } from "@/repositories/product.repository"
import type { ProductListingInput } from "@/schemas/product.schema"
import { storageService } from "@/services/storage.service"

// The rules every sold type shares (ICs, programmers, controllers): how the
// listing columns are written, money leaving as strings, platform links
// checked, Prisma errors worded, and the delete refused by order history.
// Each type's service (ic.service.ts, programmer.service.ts,
// controller.service.ts) adds its detail row and calls these —
// docs/programmers-admin-feature.md "Shared product layer".

const t = ar.products.errors

/** Form values → `Product` columns: "" means none, slugs are lower-case. */
function toListingData(input: ProductListingInput) {
  return {
    name: input.name,
    slug: input.slug.toLowerCase(),
    manufacturer: input.manufacturer,
    description: input.description || null,
    imageUrl: input.imageUrl,
    // Strings straight into Decimal(10, 2) — never through a float.
    price: input.price,
    compareAtPrice: input.compareAtPrice || null,
    stockQuantity: input.stockQuantity,
    lowStockThreshold: input.lowStockThreshold,
    isFeatured: input.isFeatured,
    isActive: input.isActive,
  }
}

/**
 * Decimal → string. `Decimal` is a class instance and can't cross to the
 * client (Server Action results, React Query hydration); a float would round.
 */
function serializeMoney(row: { price: Prisma.Decimal; compareAtPrice: Prisma.Decimal | null }) {
  return { price: row.price.toString(), compareAtPrice: row.compareAtPrice?.toString() ?? null }
}

/**
 * Every linked platform must exist — the form's list may be stale. The error
 * lands on `field`: the link rows (`platforms`), or a controller's single
 * `platformId`.
 */
async function assertPlatformsExist(ids: string[], field = "platforms") {
  if (ids.length && (await productRepository.countPlatforms(ids)) !== ids.length) {
    throw new ServiceError(t.platformMissing, { [field]: t.platformMissing })
  }
}

/**
 * The Prisma errors a product write can hit, as Arabic messages on the right
 * field. A type service handles its own unique columns first (a
 * programmer's toolName) and hands the rest here.
 */
function rethrow(error: unknown, notFound: string, platformField = "platforms"): never {
  // `slug` is the only other unique column the forms write.
  if (isPrismaError(error, "P2002")) throw new ServiceError(t.slugTaken, { slug: t.slugTaken })
  // A connected platform that vanished between the check and the write.
  if (isPrismaError(error, "P2018") || isPrismaError(error, "P2003")) {
    throw new ServiceError(t.platformMissing, { [platformField]: t.platformMissing })
  }
  if (isPrismaError(error, "P2025")) throw new ServiceError(notFound)
  throw error
}

/** After a save: the replaced or removed cover leaves R2. */
async function cleanUpReplacedImage(previous: string | null, current: string | null) {
  if (previous && previous !== current) await storageService.deleteImageByUrl(previous)
}

/**
 * Refused while any order line references the product: `OrderItem → Product`
 * is Restrict (an order is a receipt). Deactivating (isActive = false)
 * withdraws the listing instead. Otherwise the delete cascades to the detail
 * row, its links, gallery rows and cart lines, and the images leave R2.
 */
async function remove(
  id: string,
  type: ProductType,
  messages: { notFound: string; inOrders: (n: number) => string }
): Promise<void> {
  const images = await productRepository.findImageUrls(id, type)
  if (!images) throw new ServiceError(messages.notFound)

  const orders = await productRepository.countOrders(id)
  if (orders > 0) throw new ServiceError(messages.inOrders(orders))

  try {
    await productRepository.delete(id)
  } catch (error) {
    // An order placed between the count and the delete.
    if (isPrismaError(error, "P2003")) throw new ServiceError(messages.inOrders(1))
    rethrow(error, messages.notFound)
  }

  await Promise.all(
    [images.imageUrl, ...images.images.map((i) => i.url)].map((url) => storageService.deleteImageByUrl(url))
  )
}

/** Stores the file in R2 under products/ and returns the URL for `imageUrl`. */
function uploadImage(file: File): Promise<string> {
  return storageService.uploadImage("products", file)
}

export const productService = {
  toListingData,
  serializeMoney,
  assertPlatformsExist,
  rethrow,
  cleanUpReplacedImage,
  remove,
  uploadImage,
}
