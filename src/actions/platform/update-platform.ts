"use server"

import { forbiddenUnlessAdmin, invalidInput, runAction } from "@/lib/action-handler"
import { platformIdSchema, platformSchema } from "@/schemas/platform.schema"
import { platformService } from "@/services/platform.service"
import type { ActionResult } from "@/types/action-result"
import type { PlatformDetail } from "@/types/platform"

export async function updatePlatformAction(id: unknown, input: unknown): Promise<ActionResult<PlatformDetail>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  const parsedId = platformIdSchema.safeParse(id)
  if (!parsedId.success) return invalidInput(parsedId.error)
  const parsed = platformSchema.safeParse(input)
  if (!parsed.success) return invalidInput(parsed.error)

  return runAction("updatePlatformAction", () => platformService.update(parsedId.data, parsed.data))
}
