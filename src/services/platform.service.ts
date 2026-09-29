import "server-only"

import { ServiceError } from "@/lib/errors"
import { isPrismaError, uniqueTarget } from "@/lib/prisma-errors"
import { ar } from "@/messages/ar"
import { platformRepository } from "@/repositories/platform.repository"
import type { PlatformInput } from "@/schemas/platform.schema"
import type { PlatformDetail, PlatformListItem } from "@/types/platform"
import { describePlatformLinks } from "@/utils/describe-platform-links"

// Controller platforms — docs/controller-platforms-feature.md. Same shape as
// brand.service.ts (the reference CRUD); the differences are the
// case-insensitive name rule and the four kinds of links that block a delete.

const t = ar.platforms.errors

/** Form values → columns: "" means no description, slugs are lower-case. */
function toData(input: PlatformInput) {
  return {
    manufacturer: input.manufacturer,
    name: input.name,
    slug: input.slug.toLowerCase(),
    description: input.description || null,
    isActive: input.isActive,
  }
}

function rethrow(error: unknown): never {
  if (isPrismaError(error, "P2002")) {
    if (uniqueTarget(error).includes("slug")) throw new ServiceError(t.slugTaken, { slug: t.slugTaken })
    throw new ServiceError(t.nameTaken, { name: t.nameTaken })
  }
  if (isPrismaError(error, "P2025")) throw new ServiceError(t.notFound)
  throw error
}

/** The DB's unique index is case-sensitive; the store's rule is not. */
async function assertNameFree(name: string, excludeId?: string) {
  if (await platformRepository.findByNameInsensitive(name, excludeId)) {
    throw new ServiceError(t.nameTaken, { name: t.nameTaken })
  }
}

async function list(): Promise<PlatformListItem[]> {
  const rows = await platformRepository.list()
  return rows.map(({ _count, ...platform }) => ({ ...platform, links: _count }))
}

function getById(id: string): Promise<PlatformDetail | null> {
  return platformRepository.findById(id)
}

async function create(input: PlatformInput): Promise<PlatformDetail> {
  await assertNameFree(input.name)
  try {
    return await platformRepository.create(toData(input))
  } catch (error) {
    rethrow(error)
  }
}

async function update(id: string, input: PlatformInput): Promise<PlatformDetail> {
  if (!(await platformRepository.findById(id))) throw new ServiceError(t.notFound)
  await assertNameFree(input.name, id)
  try {
    return await platformRepository.update(id, toData(input))
  } catch (error) {
    rethrow(error)
  }
}

/**
 * Refused while anything links to the platform. The schema would *block* it
 * for controller units (Restrict) but silently *cascade* to IC and programmer
 * compatibility rows and *unlink* pinouts (SetNull) — so the service checks
 * all four and says which. Deactivating (isActive = false) hides a platform
 * without losing any of that.
 */
async function remove(id: string): Promise<void> {
  const counted = await platformRepository.countLinks(id)
  if (!counted) throw new ServiceError(t.notFound)

  const links = describePlatformLinks(counted._count)
  if (links) throw new ServiceError(t.inUse(links))

  try {
    await platformRepository.delete(id)
  } catch (error) {
    rethrow(error)
  }
}

export const platformService = {
  list,
  getById,
  create,
  update,
  remove,
}
