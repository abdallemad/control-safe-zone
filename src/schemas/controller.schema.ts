import { z } from "zod"

import { CONTROLLER_CONDITIONS } from "@/constants/product-types"
import { ar } from "@/messages/ar"
import {
  platformIdField,
  productIdSchema,
  productListingShape,
  refineProductListing,
} from "@/schemas/product.schema"

const t = ar.controllers.validation

/** Litres as typed — matches Decimal(3, 1): "1.6", "2", "12.5". Kept a string, like money. */
const LITRES = /^\d{1,2}(\.\d)?$/

/**
 * One schema for the controller form *and* the create/update Server Actions.
 * The listing columns (`Product`, product.schema.ts) and the unit columns
 * (`ControllerDetails`) travel together; controller.service.ts splits them.
 * A unit belongs to exactly one platform, so there are no link rows.
 */
export const controllerSchema = z
  .object({
    ...productListingShape,

    // ── The unit ──
    /** The controller platform — "Bosch EDC17C46". Required: `ControllerDetails.platformId`. */
    platformId: platformIdField,
    /** As printed on the label — "0281 018 758", spaces and all. */
    hardwareNumber: z.string().trim().min(2, t.hardwareNumberMin).max(60, t.hardwareNumberMax),
    /** Optional — not every label shows it, and a virgin unit may have none. "" is stored as null. */
    softwareNumber: z.string().trim().max(60, t.softwareNumberMax),
    /** Car-maker part number — "03L906018JJ". Optional. */
    partNumber: z.string().trim().max(60, t.partNumberMax),
    condition: z.enum(CONTROLLER_CONDITIONS, { error: t.condition }),
    /** Wiped and ready to be coded to a new car — independent of the condition. */
    isVirgin: z.boolean(),
    /** Engine capacity. Optional — "" is stored as null. */
    litres: z
      .string()
      .trim()
      .refine((v) => v === "" || (LITRES.test(v) && Number(v) > 0), t.litres),
    /** The unit's own serial, when a listing is one physical unit. Optional. */
    serialNumber: z.string().trim().max(60, t.serialNumberMax),
  })
  .superRefine(refineProductListing)

export type ControllerInput = z.infer<typeof controllerSchema>

export const controllerIdSchema = productIdSchema
