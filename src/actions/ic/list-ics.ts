"use server"

import { forbiddenUnlessAdmin, runAction } from "@/lib/action-handler"
import { icService } from "@/services/ic.service"
import type { ActionResult } from "@/types/action-result"
import type { IcListItem } from "@/types/ic"

/** Admin ICs table. */
export async function listIcsAction(): Promise<ActionResult<IcListItem[]>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  return runAction("listIcsAction", () => icService.list())
}
