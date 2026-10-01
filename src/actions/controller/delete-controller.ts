"use server"

import { forbiddenUnlessAdmin, invalidInput, runAction } from "@/lib/action-handler"
import { controllerIdSchema } from "@/schemas/controller.schema"
import { controllerService } from "@/services/controller.service"
import type { ActionResult } from "@/types/action-result"

/** Refused (Arabic message) while any order line references the controller. */
export async function deleteControllerAction(id: unknown): Promise<ActionResult<{ id: string }>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  const parsedId = controllerIdSchema.safeParse(id)
  if (!parsedId.success) return invalidInput(parsedId.error)

  return runAction("deleteControllerAction", async () => {
    await controllerService.remove(parsedId.data)
    return { id: parsedId.data }
  })
}
