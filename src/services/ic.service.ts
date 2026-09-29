import "server-only"

import { ServiceError } from "@/lib/errors"
import { ar } from "@/messages/ar"
import { icRepository } from "@/repositories/ic.repository"
import type { IcInput } from "@/schemas/ic.schema"
import { productService } from "@/services/product.service"
import type { IcDetail, IcListItem } from "@/types/ic"
import { normalizeIdentifier } from "@/utils/normalize-identifier"

// ICs — docs/ics-admin-feature.md. An IC is two rows written together — the
// `Product` (listing, price, stock) and its `IcDetails` (the chip) — plus its
// platform links, all in one nested Prisma write, so the "one detail row per
// product" invariant holds. What every sold type shares (listing columns,
// money, errors, the delete rule) is in product.service.ts.

const t = ar.ics.errors

type Row = NonNullable<Awaited<ReturnType<typeof icRepository.findById>>>
type ListRow = Awaited<ReturnType<typeof icRepository.list>>[number]

/** Markings de-duplicated by their normal form, first spelling wins. */
function uniqueMarkings(markings: string[]): string[] {
  const seen = new Set<string>()
  return markings.filter((m) => {
    const key = normalizeIdentifier(m)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** Form values → `IcDetails` columns, with the normalised search twins. */
function toIcData(input: IcInput) {
  const markings = uniqueMarkings(input.markings)
  return {
    partNumber: input.partNumber,
    partNumberNormalized: normalizeIdentifier(input.partNumber),
    markings,
    markingsNormalized: markings.map(normalizeIdentifier),
    category: input.category,
    package: input.package || null,
    pinCount: input.pinCount,
    datasheetUrl: input.datasheetUrl || null,
  }
}

function toPlatformLinks(input: IcInput) {
  return input.platforms.map((link) => ({
    platform: { connect: { id: link.platformId } },
    role: link.role || null,
  }))
}

function toDetail({ ic, price, compareAtPrice, ...product }: Row): IcDetail {
  // Every IC product has its detail row (written together, deleted together).
  if (!ic) throw new ServiceError(t.notFound)
  return { ...product, ...ic, ...productService.serializeMoney({ price, compareAtPrice }) }
}

function toListItem({ ic, price, compareAtPrice, orderItems, ...product }: ListRow): IcListItem[] {
  if (!ic) return []
  const { _count: icCount, ...chip } = ic
  return [
    {
      ...product,
      ...chip,
      ...productService.serializeMoney({ price, compareAtPrice }),
      platformsCount: icCount.platforms,
      ordersCount: orderItems.length,
    },
  ]
}

async function list(): Promise<IcListItem[]> {
  return (await icRepository.list()).flatMap(toListItem)
}

async function getById(id: string): Promise<IcDetail | null> {
  const row = await icRepository.findById(id)
  return row ? toDetail(row) : null
}

async function create(input: IcInput): Promise<IcDetail> {
  await productService.assertPlatformsExist(input.platforms.map((p) => p.platformId))
  try {
    const row = await icRepository.create({
      type: "IC",
      ...productService.toListingData(input),
      ic: { create: { ...toIcData(input), platforms: { create: toPlatformLinks(input) } } },
    })
    return toDetail(row)
  } catch (error) {
    return productService.rethrow(error, t.notFound)
  }
}

/**
 * The platform links are replaced wholesale (delete all, create the form's
 * list) inside the same write. Replacing or removing the cover deletes the
 * old file from R2 after the save.
 */
async function update(id: string, input: IcInput): Promise<IcDetail> {
  const existing = await icRepository.findById(id)
  if (!existing) throw new ServiceError(t.notFound)
  await productService.assertPlatformsExist(input.platforms.map((p) => p.platformId))

  let updated: IcDetail
  try {
    const row = await icRepository.update(id, {
      ...productService.toListingData(input),
      ic: {
        update: { ...toIcData(input), platforms: { deleteMany: {}, create: toPlatformLinks(input) } },
      },
    })
    updated = toDetail(row)
  } catch (error) {
    return productService.rethrow(error, t.notFound)
  }

  await productService.cleanUpReplacedImage(existing.imageUrl, updated.imageUrl)
  return updated
}

/** Refused while any order line references the IC — product.service.ts `remove`. */
function remove(id: string): Promise<void> {
  return productService.remove(id, "IC", t)
}

export const icService = {
  list,
  getById,
  create,
  update,
  remove,
  uploadImage: productService.uploadImage,
}
