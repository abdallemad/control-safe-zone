"use server"

import { forbiddenUnlessAdmin, runAction } from "@/lib/action-handler"
import { pinoutService } from "@/services/pinout.service"
import type { ActionResult } from "@/types/action-result"
import type { PinoutListItem } from "@/types/pinout"

/** Admin pinouts table. */
export async function listPinoutsAction(): Promise<ActionResult<PinoutListItem[]>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  return runAction("listPinoutsAction", () => pinoutService.list())
}
