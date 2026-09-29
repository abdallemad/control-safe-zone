"use server"

import { forbiddenUnlessAdmin, runAction } from "@/lib/action-handler"
import { ar } from "@/messages/ar"
import { icService } from "@/services/ic.service"
import type { ActionResult } from "@/types/action-result"

/**
 * Upload an IC's cover image to R2 (products/<uuid>.<ext>) and return its
 * URL. Called as soon as a file is picked, so the form can preview it; the
 * URL is saved with the IC on submit. Type (by magic bytes) and size are
 * checked in storage.service.ts.
 */
export async function uploadIcImageAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  const file = formData.get("file")
  if (!(file instanceof File)) return { ok: false, error: ar.errors.upload.missing }

  return runAction("uploadIcImageAction", async () => ({ url: await icService.uploadImage(file) }))
}
