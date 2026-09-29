"use server"

import { forbiddenUnlessAdmin, runAction } from "@/lib/action-handler"
import { ar } from "@/messages/ar"
import { brandService } from "@/services/brand.service"
import type { ActionResult } from "@/types/action-result"

/**
 * Upload a logo to R2 (brands/<uuid>.<ext>) and return its URL. Called as soon
 * as a file is picked, so the form can preview it; the URL is saved with the
 * brand on submit. Type (by magic bytes) and size are checked in
 * storage.service.ts — the browser's checks are only a courtesy.
 */
export async function uploadBrandLogoAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  const file = formData.get("file")
  if (!(file instanceof File)) return { ok: false, error: ar.errors.upload.missing }

  return runAction("uploadBrandLogoAction", async () => ({ url: await brandService.uploadLogo(file) }))
}
