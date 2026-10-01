"use server"

import { forbiddenUnlessAdmin, runAction } from "@/lib/action-handler"
import { controllerService } from "@/services/controller.service"
import type { ActionResult } from "@/types/action-result"
import type { ControllerListItem } from "@/types/controller"

/** Admin controllers table. */
export async function listControllersAction(): Promise<ActionResult<ControllerListItem[]>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  return runAction("listControllersAction", () => controllerService.list())
}
