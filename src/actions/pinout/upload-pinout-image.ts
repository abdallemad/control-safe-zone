"use server"

import { forbiddenUnlessAdmin, runAction } from "@/lib/action-handler"
import { ar } from "@/messages/ar"
import { pinoutService } from "@/services/pinout.service"
import type { ActionResult } from "@/types/action-result"

/**
 * Upload a pinout's preview image to R2 (pinouts/<uuid>.<ext>) and return
 * its URL. Called as soon as a file is picked, so the form can preview it;
 * the URL is saved with the pinout on submit. Type (by magic bytes) and size
 * are checked in storage.service.ts.
 */
export async function uploadPinoutImageAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  const file = formData.get("file")
  if (!(file instanceof File)) return { ok: false, error: ar.errors.upload.missing }

  return runAction("uploadPinoutImageAction", async () => ({
    url: await pinoutService.uploadImage(file),
  }))
}
