import { z } from "zod"

import { IC_CATEGORIES } from "@/constants/product-types"
import { ar } from "@/messages/ar"
import {
  platformIdField,
  platformLinks,
  productIdSchema,
  productListingShape,
  refineProductListing,
  wholeNumber,
} from "@/schemas/product.schema"
import { normalizeIdentifier } from "@/utils/normalize-identifier"

const t = ar.ics.validation

const HTTP_URL = /^https?:\/\/\S+$/i

/**
 * One schema for the IC form *and* the create/update Server Actions — browser
 * and server enforce identical rules. Messages are Arabic. The listing
 * columns (`Product`, shared with every sold type — product.schema.ts) and
 * the chip columns (`IcDetails`) travel together; ic.service.ts splits them.
 */
export const icSchema = z
  .object({
    ...productListingShape,

    // ── The chip ──
    /** As in the datasheet — "SAK-TC1797-512F180EF AC". */
    partNumber: z.string().trim().min(2, t.partNumberMin).max(60, t.partNumberMax),
    category: z.enum(IC_CATEGORIES, { error: t.category }),
    /** What is printed on the package — "TC1797", "5P08C3". Every one is a search key. */
    markings: z.array(z.string().trim().min(1, t.markingMax).max(40, t.markingMax)).max(20, t.markingsMax),
    /** "LQFP-176". Optional — "" is stored as null by the service. */
    package: z.string().trim().max(30, t.packageMax),
    pinCount: wholeNumber(1, 2000, t.pinCount).nullable(),
    datasheetUrl: z
      .string()
      .trim()
      .max(500, t.datasheetUrl)
      .refine((v) => v === "" || HTTP_URL.test(v), t.datasheetUrl),

    // ── Controller platforms the chip is found on ──
    platforms: platformLinks(
      z.object({
        platformId: platformIdField,
        /** Where on the board — "main MCU", "EEPROM". Optional. */
        role: z.string().trim().max(60, t.roleMax),
      })
    ),
  })
  .superRefine((ic, ctx) => {
    refineProductListing(ic, ctx)
    const seen = new Set<string>()
    for (const marking of ic.markings) {
      const key = normalizeIdentifier(marking)
      if (seen.has(key)) {
        ctx.addIssue({ code: "custom", path: ["markings"], message: t.markingDuplicate(marking) })
        break
      }
      seen.add(key)
    }
  })

export type IcInput = z.infer<typeof icSchema>

export const icIdSchema = productIdSchema
