"use server"

import { forbiddenUnlessAdmin, invalidInput, runAction } from "@/lib/action-handler"
import { pinoutIdSchema } from "@/schemas/pinout.schema"
import { pinoutService } from "@/services/pinout.service"
import type { ActionResult } from "@/types/action-result"

/** Never refused by links — the preview and the PDF leave R2 with the row. */
export async function deletePinoutAction(id: unknown): Promise<ActionResult<{ id: string }>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  const parsedId = pinoutIdSchema.safeParse(id)
  if (!parsedId.success) return invalidInput(parsedId.error)

  return runAction("deletePinoutAction", async () => {
    await pinoutService.remove(parsedId.data)
    return { id: parsedId.data }
  })
}
