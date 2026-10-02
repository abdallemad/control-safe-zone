import "server-only"

import { ServiceError } from "@/lib/errors"
import { isPrismaError } from "@/lib/prisma-errors"
import { ar } from "@/messages/ar"
import { pinoutRepository } from "@/repositories/pinout.repository"
import type { PinoutInput } from "@/schemas/pinout.schema"
import { authService } from "@/services/auth.service"
import { platformService } from "@/services/platform.service"
import { storageService } from "@/services/storage.service"
import type { PinoutDetail, PinoutListItem } from "@/types/pinout"

// Pinouts — docs/pinouts-admin-feature.md. Same shape as brand.service.ts
// (the reference CRUD) with two files instead of one logo: the preview image
// (public) and the PDF (private, read only through `openPdf`). A pinout is
// not a `Product`, so nothing here goes through product.service.ts.

const t = ar.pinouts.errors

/** The pinout's one optional platform; errors about it land on its picker. */
const PLATFORM_FIELD = "platformId"

/** Form values → columns: "" means none, slugs are lower-case. */
function toData(input: PinoutInput) {
  return {
    name: input.name,
    slug: input.slug.toLowerCase(),
    connector: input.connector || null,
    imageUrl: input.imageUrl,
    pdfKey: input.pdfKey,
    requiresSignIn: input.requiresSignIn,
    isActive: input.isActive,
  }
}

function rethrow(error: unknown): never {
  if (isPrismaError(error, "P2002")) throw new ServiceError(t.slugTaken, { slug: t.slugTaken })
  // The platform was deleted between the check and the write.
  if (isPrismaError(error, "P2003") || isPrismaError(error, "P2018")) {
    throw new ServiceError(t.platformMissing, { [PLATFORM_FIELD]: t.platformMissing })
  }
  if (isPrismaError(error, "P2025")) throw new ServiceError(t.notFound)
  throw error
}

/** The form's platform list can be stale: say so on the picker, before writing. */
async function assertPlatformExists(platformId: string) {
  if (platformId && !(await platformService.getById(platformId))) {
    throw new ServiceError(t.platformMissing, { [PLATFORM_FIELD]: t.platformMissing })
  }
}

async function list(): Promise<PinoutListItem[]> {
  const rows = await pinoutRepository.list()
  return rows.map(({ pdfKey, ...pinout }) => ({ ...pinout, hasPdf: pdfKey !== null }))
}

function getById(id: string): Promise<PinoutDetail | null> {
  return pinoutRepository.findById(id)
}

async function create(input: PinoutInput): Promise<PinoutDetail> {
  await assertPlatformExists(input.platformId)
  try {
    return await pinoutRepository.create({
      ...toData(input),
      ...(input.platformId && { platform: { connect: { id: input.platformId } } }),
    })
  } catch (error) {
    rethrow(error)
  }
}

/**
 * Can link, move or unlink the platform. Replacing or removing the preview
 * or the PDF deletes the old file from R2 after the save.
 */
async function update(id: string, input: PinoutInput): Promise<PinoutDetail> {
  const existing = await pinoutRepository.findById(id)
  if (!existing) throw new ServiceError(t.notFound)
  await assertPlatformExists(input.platformId)

  let updated: PinoutDetail
  try {
    updated = await pinoutRepository.update(id, {
      ...toData(input),
      platform: input.platformId ? { connect: { id: input.platformId } } : { disconnect: true },
    })
  } catch (error) {
    rethrow(error)
  }

  if (existing.imageUrl && existing.imageUrl !== updated.imageUrl) {
    await storageService.deleteImageByUrl(existing.imageUrl)
  }
  if (existing.pdfKey && existing.pdfKey !== updated.pdfKey) {
    await storageService.deletePdfByKey(existing.pdfKey)
  }
  return updated
}

/**
 * Nothing references a pinout (no orders, no links to it), so a delete is
 * never refused. The preview and the PDF leave R2 with it.
 */
async function remove(id: string): Promise<void> {
  const existing = await pinoutRepository.findById(id)
  if (!existing) throw new ServiceError(t.notFound)

  try {
    await pinoutRepository.delete(id)
  } catch (error) {
    rethrow(error)
  }
  await storageService.deleteImageByUrl(existing.imageUrl)
  await storageService.deletePdfByKey(existing.pdfKey)
}

/** Stores the preview in R2 under pinouts/ and returns the URL for `imageUrl`. */
function uploadImage(file: File): Promise<string> {
  return storageService.uploadImage("pinouts", file)
}

/** Stores the PDF in R2 under pinout-pdfs/ and returns the key for `pdfKey`. */
function uploadPdf(file: File): Promise<string> {
  return storageService.uploadPdf(file)
}

export type PinoutPdfResult =
  | { status: "ok"; file: NonNullable<Awaited<ReturnType<typeof storageService.getPdf>>>; filename: string }
  | { status: "signIn" }
  | { status: "notFound" }

/**
 * The access rule for GET /api/pinouts/[id]/pdf. Admins can open every PDF
 * (including an inactive pinout's, to check it). Everyone else: an inactive
 * pinout does not exist, and `requiresSignIn` asks for a signed-in user —
 * the store's synced `User`, not just a Clerk session.
 */
async function openPdf(id: string): Promise<PinoutPdfResult> {
  const pinout = await pinoutRepository.findById(id)
  if (!pinout?.pdfKey) return { status: "notFound" }

  const user = await authService.getCurrentUser()
  if (user?.role !== "ADMIN") {
    if (!pinout.isActive) return { status: "notFound" }
    if (pinout.requiresSignIn && !user) return { status: "signIn" }
  }

  const file = await storageService.getPdf(pinout.pdfKey)
  if (!file) return { status: "notFound" }
  return { status: "ok", file, filename: `${pinout.slug}.pdf` }
}

export const pinoutService = {
  list,
  getById,
  create,
  update,
  remove,
  uploadImage,
  uploadPdf,
  openPdf,
}
