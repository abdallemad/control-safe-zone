import "server-only"

import { ServiceError } from "@/lib/errors"
import { isPrismaError, uniqueTarget } from "@/lib/prisma-errors"
import { ar } from "@/messages/ar"
import { programmerRepository } from "@/repositories/programmer.repository"
import type { ProgrammerInput } from "@/schemas/programmer.schema"
import { productService } from "@/services/product.service"
import type { ProgrammerDetail, ProgrammerListItem } from "@/types/programmer"

// Programmers — docs/programmers-admin-feature.md. A programmer is the
// `Product` (listing, price, stock), its `ProgrammerDetails` (the tool) and
// its `ProgrammerSupport` rows (platforms it reads, over OBD / Boot / Bench),
// written in one nested Prisma write. What every sold type shares is in
// product.service.ts.

const t = ar.programmers.errors

type Row = NonNullable<Awaited<ReturnType<typeof programmerRepository.findById>>>
type ListRow = Awaited<ReturnType<typeof programmerRepository.list>>[number]

/** Form values → `ProgrammerDetails` columns: "" means none. */
function toProgrammerData(input: ProgrammerInput) {
  return {
    toolName: input.toolName,
    edition: input.edition || null,
    boxContents: input.boxContents || null,
  }
}

function toSupports(input: ProgrammerInput) {
  return input.platforms.map((row) => ({
    platform: { connect: { id: row.platformId } },
    obd: row.obd,
    boot: row.boot,
    bench: row.bench,
    notes: row.notes || null,
  }))
}

function toDetail({ programmer, price, compareAtPrice, ...product }: Row): ProgrammerDetail {
  // Every programmer product has its detail row (written together, deleted together).
  if (!programmer) throw new ServiceError(t.notFound)
  const { supports, ...tool } = programmer
  return {
    ...product,
    ...tool,
    ...productService.serializeMoney({ price, compareAtPrice }),
    platforms: supports,
  }
}

function toListItem({ programmer, price, compareAtPrice, orderItems, ...product }: ListRow): ProgrammerListItem[] {
  if (!programmer) return []
  const { supports, ...tool } = programmer
  return [
    {
      ...product,
      ...tool,
      ...productService.serializeMoney({ price, compareAtPrice }),
      // "Supports OBD" is derived: any supported platform read over OBD.
      modes: {
        obd: supports.some((s) => s.obd),
        boot: supports.some((s) => s.boot),
        bench: supports.some((s) => s.bench),
      },
      platformsCount: supports.length,
      ordersCount: orderItems.length,
    },
  ]
}

/** The DB's unique index on toolName is case-sensitive; the store's rule is not. */
async function assertToolNameFree(toolName: string, excludeProductId?: string) {
  if (await programmerRepository.findByToolNameInsensitive(toolName, excludeProductId)) {
    throw new ServiceError(t.toolNameTaken, { toolName: t.toolNameTaken })
  }
}

function rethrow(error: unknown): never {
  if (isPrismaError(error, "P2002") && uniqueTarget(error).includes("toolName")) {
    throw new ServiceError(t.toolNameTaken, { toolName: t.toolNameTaken })
  }
  return productService.rethrow(error, t.notFound)
}

async function list(): Promise<ProgrammerListItem[]> {
  return (await programmerRepository.list()).flatMap(toListItem)
}

async function getById(id: string): Promise<ProgrammerDetail | null> {
  const row = await programmerRepository.findById(id)
  return row ? toDetail(row) : null
}

async function create(input: ProgrammerInput): Promise<ProgrammerDetail> {
  await assertToolNameFree(input.toolName)
  await productService.assertPlatformsExist(input.platforms.map((p) => p.platformId))
  try {
    const row = await programmerRepository.create({
      type: "PROGRAMMER",
      ...productService.toListingData(input),
      programmer: { create: { ...toProgrammerData(input), supports: { create: toSupports(input) } } },
    })
    return toDetail(row)
  } catch (error) {
    rethrow(error)
  }
}

/**
 * The supported platforms are replaced wholesale (delete all, create the
 * form's list) inside the same write. Replacing or removing the cover
 * deletes the old file from R2 after the save.
 */
async function update(id: string, input: ProgrammerInput): Promise<ProgrammerDetail> {
  const existing = await programmerRepository.findById(id)
  if (!existing) throw new ServiceError(t.notFound)
  await assertToolNameFree(input.toolName, id)
  await productService.assertPlatformsExist(input.platforms.map((p) => p.platformId))

  let updated: ProgrammerDetail
  try {
    const row = await programmerRepository.update(id, {
      ...productService.toListingData(input),
      programmer: {
        update: { ...toProgrammerData(input), supports: { deleteMany: {}, create: toSupports(input) } },
      },
    })
    updated = toDetail(row)
  } catch (error) {
    rethrow(error)
  }

  await productService.cleanUpReplacedImage(existing.imageUrl, updated.imageUrl)
  return updated
}

/** Refused while any order line references the programmer — product.service.ts `remove`. */
function remove(id: string): Promise<void> {
  return productService.remove(id, "PROGRAMMER", t)
}

export const programmerService = {
  list,
  getById,
  create,
  update,
  remove,
  uploadImage: productService.uploadImage,
}
