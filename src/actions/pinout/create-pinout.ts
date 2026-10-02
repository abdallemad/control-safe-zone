"use server"

import { forbiddenUnlessAdmin, invalidInput, runAction } from "@/lib/action-handler"
import { pinoutSchema } from "@/schemas/pinout.schema"
import { pinoutService } from "@/services/pinout.service"
import type { ActionResult } from "@/types/action-result"
import type { PinoutDetail } from "@/types/pinout"

export async function createPinoutAction(input: unknown): Promise<ActionResult<PinoutDetail>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  const parsed = pinoutSchema.safeParse(input)
  if (!parsed.success) return invalidInput(parsed.error)

  return runAction("createPinoutAction", () => pinoutService.create(parsed.data))
}
