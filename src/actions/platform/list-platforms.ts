"use server"

import { forbiddenUnlessAdmin, runAction } from "@/lib/action-handler"
import { platformService } from "@/services/platform.service"
import type { ActionResult } from "@/types/action-result"
import type { PlatformListItem } from "@/types/platform"

/** Admin platforms table (also the manufacturer suggestions in the form). */
export async function listPlatformsAction(): Promise<ActionResult<PlatformListItem[]>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  return runAction("listPlatformsAction", () => platformService.list())
}
