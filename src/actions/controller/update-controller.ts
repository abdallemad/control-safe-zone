"use server"

import { forbiddenUnlessAdmin, invalidInput, runAction } from "@/lib/action-handler"
import { controllerIdSchema, controllerSchema } from "@/schemas/controller.schema"
import { controllerService } from "@/services/controller.service"
import type { ActionResult } from "@/types/action-result"
import type { ControllerDetail } from "@/types/controller"

export async function updateControllerAction(id: unknown, input: unknown): Promise<ActionResult<ControllerDetail>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  const parsedId = controllerIdSchema.safeParse(id)
  if (!parsedId.success) return invalidInput(parsedId.error)
  const parsed = controllerSchema.safeParse(input)
  if (!parsed.success) return invalidInput(parsed.error)

  return runAction("updateControllerAction", () => controllerService.update(parsedId.data, parsed.data))
}
