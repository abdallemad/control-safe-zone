"use server"

import { forbiddenUnlessAdmin, runAction } from "@/lib/action-handler"
import { brandService } from "@/services/brand.service"
import type { ActionResult } from "@/types/action-result"
import type { BrandListItem } from "@/types/brand"

/** Admin brands table. */
export async function listBrandsAction(): Promise<ActionResult<BrandListItem[]>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  return runAction("listBrandsAction", () => brandService.list())
}
