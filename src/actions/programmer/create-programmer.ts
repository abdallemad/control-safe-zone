"use server"

import { forbiddenUnlessAdmin, invalidInput, runAction } from "@/lib/action-handler"
import { programmerSchema } from "@/schemas/programmer.schema"
import { programmerService } from "@/services/programmer.service"
import type { ActionResult } from "@/types/action-result"
import type { ProgrammerDetail } from "@/types/programmer"

export async function createProgrammerAction(input: unknown): Promise<ActionResult<ProgrammerDetail>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  const parsed = programmerSchema.safeParse(input)
  if (!parsed.success) return invalidInput(parsed.error)

  return runAction("createProgrammerAction", () => programmerService.create(parsed.data))
}
