import "server-only"

import { randomUUID } from "node:crypto"

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3"

import { IMAGE_MAX_BYTES } from "@/constants/images"
import { PDF_MAX_BYTES } from "@/constants/pdf"
import { ServiceError } from "@/lib/errors"
import { getR2, getR2Bucket } from "@/lib/r2"
import { ar } from "@/messages/ar"

// Images on Cloudflare R2 — docs/product-images.md.
//
// The bucket is private. Every image is stored under `<folder>/<uuid>.<ext>`
// and served by our own route, GET /api/images/<key>, so the database stores
// the path string `/api/images/<key>` (Brand.logoUrl, Product.imageUrl…),
// never a bucket URL. Keys are never reused, so responses cache forever.
//
// Pinout PDFs live in the same bucket under their own prefix
// (`pinout-pdfs/<uuid>.pdf`) and are *not* served by the image route — only
// by GET /api/pinouts/[id]/pdf, after the access check. The database stores
// the bare key (`Pinout.pdfKey`).

/** Folders an image may live in — also the allow-list of the image route. */
export const IMAGE_FOLDERS = ["brands", "products", "pinouts"] as const
export type ImageFolder = (typeof IMAGE_FOLDERS)[number]

export const IMAGE_ROUTE_PREFIX = "/api/images/"

// What we accept, identified by the file's first bytes — never by the
// browser-supplied type or extension. SVG is deliberately absent: it can
// carry script, and we serve images from our own origin.
const IMAGE_TYPES = [
  { ext: "png", contentType: "image/png", matches: (b: Uint8Array) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { ext: "jpg", contentType: "image/jpeg", matches: (b: Uint8Array) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    ext: "webp",
    contentType: "image/webp",
    // "RIFF" …… "WEBP"
    matches: (b: Uint8Array) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
] as const

/** `/api/images/brands/<uuid>.png` — what the database stores. */
export function imageUrlFromKey(key: string): string {
  return `${IMAGE_ROUTE_PREFIX}${key}`
}

/** The inverse; `null` for anything that is not one of our image URLs. */
export function keyFromImageUrl(url: string): string | null {
  return url.startsWith(IMAGE_ROUTE_PREFIX) ? url.slice(IMAGE_ROUTE_PREFIX.length) : null
}

/** A key we could have written: known folder, uuid name, known extension. */
export function isValidImageKey(key: string): boolean {
  return /^(brands|products|pinouts)\/[0-9a-f-]{36}\.(png|jpg|webp)$/.test(key)
}

/** Where pinout PDFs live. Not an image folder: the public image route never matches it. */
export const PDF_FOLDER = "pinout-pdfs"

/** A PDF key we could have written: `pinout-pdfs/<uuid>.pdf`. */
export function isValidPdfKey(key: string): boolean {
  return /^pinout-pdfs\/[0-9a-f-]{36}\.pdf$/.test(key)
}

/** "%PDF-" — every PDF starts with it. */
const isPdf = (b: Uint8Array) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46 && b[4] === 0x2d

/** Put an object we have already validated. Errors become the caller's Arabic message. */
async function putObject(key: string, body: Uint8Array, contentType: string, cacheControl: string, failed: string) {
  try {
    await getR2().send(
      new PutObjectCommand({ Bucket: getR2Bucket(), Key: key, Body: body, ContentType: contentType, CacheControl: cacheControl })
    )
  } catch (error) {
    console.error("[storage.putObject]", key, error)
    throw new ServiceError(failed)
  }
}

/** Best-effort delete of a key that already passed its validator. */
async function deleteObject(key: string) {
  try {
    await getR2().send(new DeleteObjectCommand({ Bucket: getR2Bucket(), Key: key }))
  } catch (error) {
    console.error("[storage.deleteObject]", key, error)
  }
}

/** Read an object for a route. `null` when it does not exist. */
async function getObject(key: string) {
  try {
    const object = await getR2().send(new GetObjectCommand({ Bucket: getR2Bucket(), Key: key }))
    if (!object.Body) return null
    return {
      body: object.Body.transformToWebStream(),
      contentType: object.ContentType ?? "application/octet-stream",
      contentLength: object.ContentLength,
      etag: object.ETag,
    }
  } catch (error) {
    // By name, not instanceof: survives dev hot reloads (see lib/prisma-errors.ts).
    if ((error as { name?: string })?.name === "NoSuchKey") return null
    throw error
  }
}

/**
 * Validate and store an image. Returns its URL for the database.
 * Throws ServiceError (Arabic) for a missing, oversized or unsupported file.
 */
async function uploadImage(folder: ImageFolder, file: File): Promise<string> {
  const t = ar.errors.upload
  if (!file || file.size === 0) throw new ServiceError(t.missing)
  if (file.size > IMAGE_MAX_BYTES) throw new ServiceError(t.tooLarge)

  const bytes = new Uint8Array(await file.arrayBuffer())
  const type = IMAGE_TYPES.find((candidate) => candidate.matches(bytes))
  if (!type) throw new ServiceError(t.invalidType)

  const key = `${folder}/${randomUUID()}.${type.ext}`
  await putObject(key, bytes, type.contentType, "public, max-age=31536000, immutable", t.failed)
  return imageUrlFromKey(key)
}

/**
 * Best-effort delete by URL. Never throws: a leftover object costs a few KB,
 * a failed save because of it would cost the user their edit.
 */
async function deleteImageByUrl(url: string | null | undefined): Promise<void> {
  const key = url ? keyFromImageUrl(url) : null
  if (!key || !isValidImageKey(key)) return
  await deleteObject(key)
}

/** For the image route. `null` when the object does not exist. */
function getImage(key: string) {
  return getObject(key)
}

/**
 * Validate and store a pinout PDF. Returns its key for `Pinout.pdfKey`.
 * Identified by its first bytes ("%PDF-"), never by name or browser type.
 * Private: it is read back only through the pinout PDF route.
 */
async function uploadPdf(file: File): Promise<string> {
  const t = ar.errors.uploadPdf
  if (!file || file.size === 0) throw new ServiceError(t.missing)
  if (file.size > PDF_MAX_BYTES) throw new ServiceError(t.tooLarge)

  const bytes = new Uint8Array(await file.arrayBuffer())
  if (!isPdf(bytes)) throw new ServiceError(t.invalidType)

  const key = `${PDF_FOLDER}/${randomUUID()}.pdf`
  await putObject(key, bytes, "application/pdf", "private, no-store", t.failed)
  return key
}

/** Best-effort, like deleteImageByUrl. Ignores anything that is not one of our PDF keys. */
async function deletePdfByKey(key: string | null | undefined): Promise<void> {
  if (!key || !isValidPdfKey(key)) return
  await deleteObject(key)
}

/** For the pinout PDF route, after its access check. `null` when missing. */
function getPdf(key: string) {
  return isValidPdfKey(key) ? getObject(key) : Promise.resolve(null)
}

export const storageService = {
  uploadImage,
  deleteImageByUrl,
  getImage,
  uploadPdf,
  deletePdfByKey,
  getPdf,
}
