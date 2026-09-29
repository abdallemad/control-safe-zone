"use server"

import { forbiddenUnlessAdmin, runAction } from "@/lib/action-handler"
import { ar } from "@/messages/ar"
import { programmerService } from "@/services/programmer.service"
import type { ActionResult } from "@/types/action-result"

/**
 * Upload a programmer's cover image to R2 (products/<uuid>.<ext>) and return
 * its URL. Called as soon as a file is picked, so the form can preview it;
 * the URL is saved with the programmer on submit. Type (by magic bytes) and
 * size are checked in storage.service.ts.
 */
export async function uploadProgrammerImageAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  const forbidden = await forbiddenUnlessAdmin()
  if (forbidden) return forbidden

  const file = formData.get("file")
  if (!(file instanceof File)) return { ok: false, error: ar.errors.upload.missing }

  return runAction("uploadProgrammerImageAction", async () => ({
    url: await programmerService.uploadImage(file),
  }))
}
