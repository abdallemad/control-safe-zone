"use server"

import { forbiddenUnlessAdmin, runAction } from "@/lib/action-handler"
import { ar } from "@/messages/ar"
import { pinoutService } from "@/services/pinout.service"
import type { ActionResult } from "@/types/action-result"

/**
 * Upload a pinout's PDF to the private side of R2 (pinout-pdfs/<uuid>.pdf)
 * and return its key. Called as soon as a file is picked; the key is saved
 * with the pinout on submit. "%PDF-" magic bytes and the 10 MB cap are
 * checked in storage.service.ts.
 */
export async function uploadPinoutPdfAction(formData: FormData): Promise<ActionResult<{ key: string }>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  const file = formData.get("file")
  if (!(file instanceof File)) return { ok: false, error: ar.errors.uploadPdf.missing }

  return runAction("uploadPinoutPdfAction", async () => ({
    key: await pinoutService.uploadPdf(file),
  }))
}
