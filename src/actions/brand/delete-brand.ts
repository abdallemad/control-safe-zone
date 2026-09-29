"use server"

import { forbiddenUnlessAdmin, invalidInput, runAction } from "@/lib/action-handler"
import { brandIdSchema } from "@/schemas/brand.schema"
import { brandService } from "@/services/brand.service"
import type { ActionResult } from "@/types/action-result"

/** Refused (Arabic message) while the brand still has vehicle models. */
export async function deleteBrandAction(id: unknown): Promise<ActionResult<{ id: string }>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  const parsedId = brandIdSchema.safeParse(id)
  if (!parsedId.success) return invalidInput(parsedId.error)

  return runAction("deleteBrandAction", async () => {
    await brandService.remove(parsedId.data)
    return { id: parsedId.data }
  })
}
