import "server-only"

import { randomUUID } from "node:crypto"

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3"

import { IMAGE_MAX_BYTES } from "@/constants/images"
import { ServiceError } from "@/lib/errors"
import { getR2, getR2Bucket } from "@/lib/r2"
import { ar } from "@/messages/ar"

// Images on Cloudflare R2 — docs/product-images.md.
//
// The bucket is private. Every image is stored under `<folder>/<uuid>.<ext>`
// and served by our own route, GET /api/images/<key>, so the database stores
// the path string `/api/images/<key>` (Brand.logoUrl, Product.imageUrl…),
// never a bucket URL. Keys are never reused, so responses cache forever.

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
  try {
    await getR2().send(
      new PutObjectCommand({
        Bucket: getR2Bucket(),
        Key: key,
        Body: bytes,
        ContentType: type.contentType,
        CacheControl: "public, max-age=31536000, immutable",
      })
    )
  } catch (error) {
    console.error("[storage.uploadImage]", error)
    throw new ServiceError(t.failed)
  }
  return imageUrlFromKey(key)
}

/**
 * Best-effort delete by URL. Never throws: a leftover object costs a few KB,
 * a failed save because of it would cost the user their edit.
 */
async function deleteImageByUrl(url: string | null | undefined): Promise<void> {
  const key = url ? keyFromImageUrl(url) : null
  if (!key || !isValidImageKey(key)) return
  try {
    await getR2().send(new DeleteObjectCommand({ Bucket: getR2Bucket(), Key: key }))
  } catch (error) {
    console.error("[storage.deleteImageByUrl]", key, error)
  }
}

/** For the image route. `null` when the object does not exist. */
async function getImage(key: string) {
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

export const storageService = {
  uploadImage,
  deleteImageByUrl,
  getImage,
}
