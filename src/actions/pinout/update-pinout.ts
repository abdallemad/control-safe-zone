"use server"

import { forbiddenUnlessAdmin, invalidInput, runAction } from "@/lib/action-handler"
import { pinoutIdSchema, pinoutSchema } from "@/schemas/pinout.schema"
import { pinoutService } from "@/services/pinout.service"
import type { ActionResult } from "@/types/action-result"
import type { PinoutDetail } from "@/types/pinout"

export async function updatePinoutAction(id: unknown, input: unknown): Promise<ActionResult<PinoutDetail>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  const parsedId = pinoutIdSchema.safeParse(id)
  if (!parsedId.success) return invalidInput(parsedId.error)
  const parsed = pinoutSchema.safeParse(input)
  if (!parsed.success) return invalidInput(parsed.error)

  return runAction("updatePinoutAction", () => pinoutService.update(parsedId.data, parsed.data))
}
