"use server"

import { forbiddenUnlessAdmin, invalidInput, runAction } from "@/lib/action-handler"
import { icIdSchema } from "@/schemas/ic.schema"
import { icService } from "@/services/ic.service"
import type { ActionResult } from "@/types/action-result"

/** Refused (Arabic message) while any order line references the IC. */
export async function deleteIcAction(id: unknown): Promise<ActionResult<{ id: string }>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  const parsedId = icIdSchema.safeParse(id)
  if (!parsedId.success) return invalidInput(parsedId.error)

  return runAction("deleteIcAction", async () => {
    await icService.remove(parsedId.data)
    return { id: parsedId.data }
  })
}
