"use server"

import { forbiddenUnlessAdmin, invalidInput, runAction } from "@/lib/action-handler"
import { platformIdSchema } from "@/schemas/platform.schema"
import { platformService } from "@/services/platform.service"
import type { ActionResult } from "@/types/action-result"

/** Refused (Arabic message naming the links) while anything links to the platform. */
export async function deletePlatformAction(id: unknown): Promise<ActionResult<{ id: string }>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  const parsedId = platformIdSchema.safeParse(id)
  if (!parsedId.success) return invalidInput(parsedId.error)

  return runAction("deletePlatformAction", async () => {
    await platformService.remove(parsedId.data)
    return { id: parsedId.data }
  })
}
