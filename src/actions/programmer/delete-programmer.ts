"use server"

import { forbiddenUnlessAdmin, invalidInput, runAction } from "@/lib/action-handler"
import { programmerIdSchema } from "@/schemas/programmer.schema"
import { programmerService } from "@/services/programmer.service"
import type { ActionResult } from "@/types/action-result"

/** Refused (Arabic message) while any order line references the programmer. */
export async function deleteProgrammerAction(id: unknown): Promise<ActionResult<{ id: string }>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  const parsedId = programmerIdSchema.safeParse(id)
  if (!parsedId.success) return invalidInput(parsedId.error)

  return runAction("deleteProgrammerAction", async () => {
    await programmerService.remove(parsedId.data)
    return { id: parsedId.data }
  })
}
