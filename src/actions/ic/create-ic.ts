"use server"

import { forbiddenUnlessAdmin, invalidInput, runAction } from "@/lib/action-handler"
import { icSchema } from "@/schemas/ic.schema"
import { icService } from "@/services/ic.service"
import type { ActionResult } from "@/types/action-result"
import type { IcDetail } from "@/types/ic"

export async function createIcAction(input: unknown): Promise<ActionResult<IcDetail>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  const parsed = icSchema.safeParse(input)
  if (!parsed.success) return invalidInput(parsed.error)

  return runAction("createIcAction", () => icService.create(parsed.data))
}
