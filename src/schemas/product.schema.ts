import { z } from "zod"

import { ar } from "@/messages/ar"
import { SLUG_PATTERN } from "@/utils/slugify"

// The `Product` columns every sold type shares (ICs, programmers…). Each
// type's schema spreads `productListingShape` next to its own detail fields
// and runs `refineProductListing` in its superRefine, so the rules — and
// their Arabic messages — are written once.

const t = ar.products.validation

/** Only an image we uploaded: /api/images/products/<uuid>.<png|jpg|webp>. */
const PRODUCT_IMAGE_URL = /^\/api\/images\/products\/[0-9a-f-]{36}\.(png|jpg|webp)$/

/**
 * EGP as typed — up to 8 digits and 2 decimals, matching Decimal(10, 2).
 * Kept a string end to end: money never passes through a float.
 */
const MONEY = /^\d{1,8}(\.\d{1,2})?$/

/** A whole number field; the form turns "" into NaN, which fails here. */
export const wholeNumber = (min: number, max: number, message: string) =>
  z.number({ error: message }).int(message).min(min, message).max(max, message)

export const productListingShape = {
  /** Chip or tool maker — Infineon, Alientech. */
  manufacturer: z.string().trim().min(2, t.manufacturerMin).max(40, t.manufacturerMax),
  /** The card title, Arabic. */
  name: z.string().trim().min(2, t.nameMin).max(120, t.nameMax),
  /** Unique across *all* products, not per type. */
  slug: z.string().trim().min(2, t.slugMin).max(80, t.slugMax).regex(SLUG_PATTERN, t.slugFormat),
  description: z.string().trim().max(2000, t.descriptionMax),
  imageUrl: z.string().regex(PRODUCT_IMAGE_URL, t.imageInvalid).nullable(),
  price: z
    .string()
    .trim()
    .regex(MONEY, t.price)
    .refine((v) => Number(v) > 0, t.price),
  /** The struck-through "was" price. "" = none; never a fake discount. */
  compareAtPrice: z
    .string()
    .trim()
    .refine((v) => v === "" || MONEY.test(v), t.price),
  stockQuantity: wholeNumber(0, 100_000, t.stockQuantity),
  lowStockThreshold: wholeNumber(0, 10_000, t.lowStockThreshold),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
}

/** The shared listing fields — what the shared form cards and service helpers take. */
export type ProductListingInput = z.infer<z.ZodObject<typeof productListingShape>>

/** A platform picker row's id — the part every link row (IC, programmer) shares. */
export const platformIdField = z.string().min(1, t.platformRequired).max(64, t.platformRequired)

/** At most 50 link rows of `row`. */
export const platformLinks = <T extends z.ZodRawShape>(row: z.ZodObject<T>) => row.array().max(50, t.platformsMax)

/**
 * Cross-field rules of the listing: the compare-at price must be higher than
 * the price, and no platform may be linked twice. Zod runs a superRefine only
 * once every field's own type is valid. A type with one platform and no link
 * rows (a controller) has no `platforms`.
 */
export function refineProductListing(
  value: Pick<ProductListingInput, "price" | "compareAtPrice"> & { platforms?: { platformId: string }[] },
  ctx: z.RefinementCtx
) {
  if (value.compareAtPrice !== "" && Number(value.compareAtPrice) <= Number(value.price)) {
    ctx.addIssue({ code: "custom", path: ["compareAtPrice"], message: t.compareAtPrice })
  }
  const ids = (value.platforms ?? []).map((p) => p.platformId).filter(Boolean)
  if (new Set(ids).size !== ids.length) {
    ctx.addIssue({ code: "custom", path: ["platforms"], message: t.platformDuplicate })
  }
}

/** Product ids are cuids. */
export const productIdSchema = z.string().min(1, t.id).max(64, t.id)
