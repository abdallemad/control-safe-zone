"use server"

import { forbiddenUnlessAdmin, invalidInput, runAction } from "@/lib/action-handler"
import { programmerIdSchema, programmerSchema } from "@/schemas/programmer.schema"
import { programmerService } from "@/services/programmer.service"
import type { ActionResult } from "@/types/action-result"
import type { ProgrammerDetail } from "@/types/programmer"

export async function updateProgrammerAction(id: unknown, input: unknown): Promise<ActionResult<ProgrammerDetail>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  const parsedId = programmerIdSchema.safeParse(id)
  if (!parsedId.success) return invalidInput(parsedId.error)
  const parsed = programmerSchema.safeParse(input)
  if (!parsed.success) return invalidInput(parsed.error)

  return runAction("updateProgrammerAction", () => programmerService.update(parsedId.data, parsed.data))
}
