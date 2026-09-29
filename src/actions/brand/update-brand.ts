"use server"

import { forbiddenUnlessAdmin, invalidInput, runAction } from "@/lib/action-handler"
import { brandIdSchema, brandSchema } from "@/schemas/brand.schema"
import { brandService } from "@/services/brand.service"
import type { ActionResult } from "@/types/action-result"
import type { BrandDetail } from "@/types/brand"

export async function updateBrandAction(id: unknown, input: unknown): Promise<ActionResult<BrandDetail>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  const parsedId = brandIdSchema.safeParse(id)
  if (!parsedId.success) return invalidInput(parsedId.error)
  const parsed = brandSchema.safeParse(input)
  if (!parsed.success) return invalidInput(parsed.error)

  return runAction("updateBrandAction", () => brandService.update(parsedId.data, parsed.data))
}
