import { z } from "zod"

import { ar } from "@/messages/ar"
import {
  platformIdField,
  platformLinks,
  productIdSchema,
  productListingShape,
  refineProductListing,
} from "@/schemas/product.schema"

const t = ar.programmers.validation

/**
 * One schema for the programmer form *and* the create/update Server Actions.
 * The listing columns (`Product`, product.schema.ts), the tool columns
 * (`ProgrammerDetails`) and the supported platforms (`ProgrammerSupport`)
 * travel together; programmer.service.ts splits them.
 */
export const programmerSchema = z
  .object({
    ...productListingShape,

    // ── The tool ──
    /** "KESS V3", "Autotuner" — one listing per tool, unique regardless of case. */
    toolName: z.string().trim().min(2, t.toolNameMin).max(60, t.toolNameMax),
    /** "Master" / "Slave" / license variant. Optional — "" is stored as null. */
    edition: z.string().trim().max(40, t.editionMax),
    /** Shown under "محتويات العلبة". Optional. */
    boxContents: z.string().trim().max(1000, t.boxContentsMax),

    // ── Supported platforms, and how ──
    platforms: platformLinks(
      z
        .object({
          platformId: platformIdField,
          obd: z.boolean(),
          boot: z.boolean(),
          bench: z.boolean(),
          /** "read only", "needs adapter X". Optional. */
          notes: z.string().trim().max(120, t.notesMax),
        })
        // A support row that reads the ECU no way at all says nothing.
        .refine((row) => row.obd || row.boot || row.bench, { message: t.modeRequired, path: ["obd"] })
    ),
  })
  .superRefine(refineProductListing)

export type ProgrammerInput = z.infer<typeof programmerSchema>

export const programmerIdSchema = productIdSchema
