import { z } from "zod"

import { ar } from "@/messages/ar"
import { SLUG_PATTERN } from "@/utils/slugify"

const t = ar.pinouts.validation

/** Only a preview we uploaded: /api/images/pinouts/<uuid>.<png|jpg|webp>. */
const PINOUT_IMAGE_URL = /^\/api\/images\/pinouts\/[0-9a-f-]{36}\.(png|jpg|webp)$/

/** Only a PDF we uploaded: the private R2 key pinout-pdfs/<uuid>.pdf — never a URL. */
const PINOUT_PDF_KEY = /^pinout-pdfs\/[0-9a-f-]{36}\.pdf$/

/**
 * One schema for the pinout form *and* the create/update Server Actions —
 * browser and server enforce identical rules. Messages are Arabic. A pinout
 * is not a `Product` (no price, stock or shipping), so nothing here comes
 * from product.schema.ts.
 */
export const pinoutSchema = z
  .object({
    /** "EDC17C46 — الفيشة A". Not unique: two platforms each have a "main connector". */
    name: z.string().trim().min(2, t.nameMin).max(120, t.nameMax),
    /** Optional — "" means no platform (stored as null; SetNull on the platform's delete). */
    platformId: z.string().max(64, t.platform),
    /** "A", "B", "Main 94-pin". Optional — "" is stored as null. */
    connector: z.string().trim().max(40, t.connectorMax),
    slug: z.string().trim().min(2, t.slugMin).max(80, t.slugMax).regex(SLUG_PATTERN, t.slugFormat),
    imageUrl: z.string().regex(PINOUT_IMAGE_URL, t.imageInvalid).nullable(),
    pdfKey: z.string().regex(PINOUT_PDF_KEY, t.pdfInvalid).nullable(),
    /** Business-analysis open question 1 — default: signed-in users only. */
    requiresSignIn: z.boolean(),
    isActive: z.boolean(),
  })
  .superRefine((value, ctx) => {
    // A pinout with neither a preview nor a PDF shows a technician nothing.
    if (!value.imageUrl && !value.pdfKey) {
      ctx.addIssue({ code: "custom", path: ["pdfKey"], message: t.fileRequired })
    }
  })

export type PinoutInput = z.infer<typeof pinoutSchema>

/** Pinout ids are cuids. */
export const pinoutIdSchema = z.string().min(1, t.id).max(64, t.id)
