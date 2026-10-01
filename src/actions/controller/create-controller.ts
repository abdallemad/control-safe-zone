"use server"

import { forbiddenUnlessAdmin, invalidInput, runAction } from "@/lib/action-handler"
import { controllerSchema } from "@/schemas/controller.schema"
import { controllerService } from "@/services/controller.service"
import type { ActionResult } from "@/types/action-result"
import type { ControllerDetail } from "@/types/controller"

export async function createControllerAction(input: unknown): Promise<ActionResult<ControllerDetail>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  const parsed = controllerSchema.safeParse(input)
  if (!parsed.success) return invalidInput(parsed.error)

  return runAction("createControllerAction", () => controllerService.create(parsed.data))
}
