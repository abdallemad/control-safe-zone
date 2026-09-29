import { z } from "zod"

import { ar } from "@/messages/ar"
import { SLUG_PATTERN } from "@/utils/slugify"

const t = ar.brands.validation

/** Only a logo we uploaded: /api/images/brands/<uuid>.<png|jpg|webp>. */
const BRAND_LOGO_URL = /^\/api\/images\/brands\/[0-9a-f-]{36}\.(png|jpg|webp)$/

/**
 * One schema for the brand form *and* the create/update Server Actions, so
 * the browser and the server enforce identical rules (docs/folder-structure.md
 * "forms/"). Messages are Arabic.
 */
export const brandSchema = z.object({
  name: z.string().trim().min(2, t.nameMin).max(60, t.nameMax),
  /** Optional in the UI — "" is stored as null by the service. */
  nameAr: z.string().trim().max(60, t.nameArMax),
  slug: z.string().trim().min(2, t.slugMin).max(80, t.slugMax).regex(SLUG_PATTERN, t.slugFormat),
  logoUrl: z.string().regex(BRAND_LOGO_URL, t.logoInvalid).nullable(),
  isActive: z.boolean(),
})

export type BrandInput = z.infer<typeof brandSchema>

/** Brand ids are cuids. */
export const brandIdSchema = z.string().min(1, t.id).max(64, t.id)
