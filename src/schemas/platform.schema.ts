import { z } from "zod"

import { ar } from "@/messages/ar"
import { SLUG_PATTERN } from "@/utils/slugify"

const t = ar.platforms.validation

/**
 * One schema for the platform form *and* the create/update Server Actions —
 * browser and server enforce identical rules. Messages are Arabic.
 */
export const platformSchema = z.object({
  /** ECU maker — "Bosch", "Continental". */
  manufacturer: z.string().trim().min(2, t.manufacturerMin).max(40, t.manufacturerMax),
  /** As printed on the unit — "EDC17C46", "SIMOS 18.1". */
  name: z.string().trim().min(2, t.nameMin).max(40, t.nameMax),
  slug: z.string().trim().min(2, t.slugMin).max(80, t.slugMax).regex(SLUG_PATTERN, t.slugFormat),
  /** Optional in the UI — "" is stored as null by the service. */
  description: z.string().trim().max(500, t.descriptionMax),
  isActive: z.boolean(),
})

export type PlatformInput = z.infer<typeof platformSchema>

/** Platform ids are cuids. */
export const platformIdSchema = z.string().min(1, t.id).max(64, t.id)
