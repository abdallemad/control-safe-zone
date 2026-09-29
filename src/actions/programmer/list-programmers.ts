"use server"

import { forbiddenUnlessAdmin, runAction } from "@/lib/action-handler"
import { programmerService } from "@/services/programmer.service"
import type { ActionResult } from "@/types/action-result"
import type { ProgrammerListItem } from "@/types/programmer"

/** Admin programmers table. */
export async function listProgrammersAction(): Promise<ActionResult<ProgrammerListItem[]>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  return runAction("listProgrammersAction", () => programmerService.list())
}
