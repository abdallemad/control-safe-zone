"use server"

import { forbiddenUnlessAdmin, invalidInput, runAction } from "@/lib/action-handler"
import { brandSchema } from "@/schemas/brand.schema"
import { brandService } from "@/services/brand.service"
import type { ActionResult } from "@/types/action-result"
import type { BrandDetail } from "@/types/brand"

export async function createBrandAction(input: unknown): Promise<ActionResult<BrandDetail>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  const parsed = brandSchema.safeParse(input)
  if (!parsed.success) return invalidInput(parsed.error)

  return runAction("createBrandAction", () => brandService.create(parsed.data))
}
