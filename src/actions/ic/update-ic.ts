"use server"

import { forbiddenUnlessAdmin, invalidInput, runAction } from "@/lib/action-handler"
import { icIdSchema, icSchema } from "@/schemas/ic.schema"
import { icService } from "@/services/ic.service"
import type { ActionResult } from "@/types/action-result"
import type { IcDetail } from "@/types/ic"

export async function updateIcAction(id: unknown, input: unknown): Promise<ActionResult<IcDetail>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  const parsedId = icIdSchema.safeParse(id)
  if (!parsedId.success) return invalidInput(parsedId.error)
  const parsed = icSchema.safeParse(input)
  if (!parsed.success) return invalidInput(parsed.error)

  return runAction("updateIcAction", () => icService.update(parsedId.data, parsed.data))
}
