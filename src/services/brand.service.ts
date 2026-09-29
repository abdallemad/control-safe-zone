import "server-only"

import { ServiceError } from "@/lib/errors"
import { isPrismaError, uniqueTarget } from "@/lib/prisma-errors"
import { ar } from "@/messages/ar"
import { brandRepository } from "@/repositories/brand.repository"
import type { BrandInput } from "@/schemas/brand.schema"
import { storageService } from "@/services/storage.service"
import type { BrandDetail, BrandListItem } from "@/types/brand"

// Brands — the reference CRUD feature (docs/brands-feature.md). Every other
// admin CRUD copies this file's shape: validate in the action, rules here,
// Prisma only in the repository, Arabic ServiceErrors for anything the admin
// can fix.

const t = ar.brands.errors

/** Form values → columns: "" means "no Arabic name", slugs are lower-case. */
function toData(input: BrandInput) {
  return {
    name: input.name,
    nameAr: input.nameAr || null,
    slug: input.slug.toLowerCase(),
    logoUrl: input.logoUrl,
    isActive: input.isActive,
  }
}

/**
 * Unique-constraint and not-found errors from Prisma, turned into messages
 * pointed at the offending field. Anything else is re-thrown as a bug.
 */
function rethrow(error: unknown): never {
  if (isPrismaError(error, "P2002")) {
    if (uniqueTarget(error).includes("slug")) throw new ServiceError(t.slugTaken, { slug: t.slugTaken })
    throw new ServiceError(t.nameTaken, { name: t.nameTaken })
  }
  if (isPrismaError(error, "P2025")) throw new ServiceError(t.notFound)
  throw error
}

async function list(): Promise<BrandListItem[]> {
  const rows = await brandRepository.list()
  return rows.map(({ _count, ...brand }) => ({ ...brand, modelsCount: _count.models }))
}

function getById(id: string): Promise<BrandDetail | null> {
  return brandRepository.findById(id)
}

async function create(input: BrandInput): Promise<BrandDetail> {
  try {
    return await brandRepository.create(toData(input))
  } catch (error) {
    rethrow(error)
  }
}

/** Replacing or removing the logo deletes the old file from R2 after the save. */
async function update(id: string, input: BrandInput): Promise<BrandDetail> {
  const existing = await brandRepository.findById(id)
  if (!existing) throw new ServiceError(t.notFound)

  let updated: BrandDetail
  try {
    updated = await brandRepository.update(id, toData(input))
  } catch (error) {
    rethrow(error)
  }

  if (existing.logoUrl && existing.logoUrl !== updated.logoUrl) {
    await storageService.deleteImageByUrl(existing.logoUrl)
  }
  return updated
}

/**
 * Refused while the brand has vehicle models: the schema would cascade the
 * delete to every model and every product↔vehicle link. Deactivating
 * (isActive = false) is the safe way to hide a brand.
 */
async function remove(id: string): Promise<void> {
  const existing = await brandRepository.findById(id)
  if (!existing) throw new ServiceError(t.notFound)

  const models = await brandRepository.countModels(id)
  if (models > 0) throw new ServiceError(t.hasModels(models))

  try {
    await brandRepository.delete(id)
  } catch (error) {
    rethrow(error)
  }
  await storageService.deleteImageByUrl(existing.logoUrl)
}

/** Stores the file in R2 under brands/ and returns the URL for `logoUrl`. */
function uploadLogo(file: File): Promise<string> {
  return storageService.uploadImage("brands", file)
}

export const brandService = {
  list,
  getById,
  create,
  update,
  remove,
  uploadLogo,
}
