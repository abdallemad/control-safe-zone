"use server"

import { forbiddenUnlessAdmin, invalidInput, runAction } from "@/lib/action-handler"
import { platformSchema } from "@/schemas/platform.schema"
import { platformService } from "@/services/platform.service"
import type { ActionResult } from "@/types/action-result"
import type { PlatformDetail } from "@/types/platform"

export async function createPlatformAction(input: unknown): Promise<ActionResult<PlatformDetail>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  const parsed = platformSchema.safeParse(input)
  if (!parsed.success) return invalidInput(parsed.error)

  return runAction("createPlatformAction", () => platformService.create(parsed.data))
}
