import "server-only"

import { ServiceError } from "@/lib/errors"
import { ar } from "@/messages/ar"
import { controllerRepository } from "@/repositories/controller.repository"
import type { ControllerInput } from "@/schemas/controller.schema"
import { productService } from "@/services/product.service"
import type { ControllerDetail, ControllerListItem } from "@/types/controller"
import { normalizeIdentifier } from "@/utils/normalize-identifier"

// Controllers — docs/controllers-admin-feature.md. A controller is a physical
// ECU unit: the `Product` (listing, price, stock) and its `ControllerDetails`
// (the unit — platform, hardware / software / part numbers, condition),
// written in one nested Prisma write. What every sold type shares is in
// product.service.ts.

const t = ar.controllers.errors

/** The unit has one platform, so platform errors land on its picker. */
const PLATFORM_FIELD = "platformId"

type Row = NonNullable<Awaited<ReturnType<typeof controllerRepository.findById>>>
type ListRow = Awaited<ReturnType<typeof controllerRepository.list>>[number]

/** An optional identifier and its normalised search twin — both null when empty. */
function withNormalized(value: string) {
  return value ? { value, normalized: normalizeIdentifier(value) } : { value: null, normalized: null }
}

/** Form values → `ControllerDetails` columns, with the normalised search twins. */
function toControllerData(input: ControllerInput) {
  const software = withNormalized(input.softwareNumber)
  const part = withNormalized(input.partNumber)
  return {
    hardwareNumber: input.hardwareNumber,
    hardwareNumberNormalized: normalizeIdentifier(input.hardwareNumber),
    softwareNumber: software.value,
    softwareNumberNormalized: software.normalized,
    partNumber: part.value,
    partNumberNormalized: part.normalized,
    condition: input.condition,
    isVirgin: input.isVirgin,
    // A string straight into Decimal(3, 1) — never through a float.
    litres: input.litres || null,
    serialNumber: input.serialNumber || null,
  }
}

function toDetail({ controller, price, compareAtPrice, ...product }: Row): ControllerDetail {
  // Every controller product has its detail row (written together, deleted together).
  if (!controller) throw new ServiceError(t.notFound)
  const { litres, ...unit } = controller
  return {
    ...product,
    ...unit,
    litres: litres?.toString() ?? null,
    ...productService.serializeMoney({ price, compareAtPrice }),
  }
}

function toListItem({ controller, price, compareAtPrice, orderItems, ...product }: ListRow): ControllerListItem[] {
  if (!controller) return []
  return [
    {
      ...product,
      ...controller,
      ...productService.serializeMoney({ price, compareAtPrice }),
      ordersCount: orderItems.length,
    },
  ]
}

async function list(): Promise<ControllerListItem[]> {
  return (await controllerRepository.list()).flatMap(toListItem)
}

async function getById(id: string): Promise<ControllerDetail | null> {
  const row = await controllerRepository.findById(id)
  return row ? toDetail(row) : null
}

async function create(input: ControllerInput): Promise<ControllerDetail> {
  await productService.assertPlatformsExist([input.platformId], PLATFORM_FIELD)
  try {
    const row = await controllerRepository.create({
      type: "CONTROLLER",
      ...productService.toListingData(input),
      controller: {
        create: { ...toControllerData(input), platform: { connect: { id: input.platformId } } },
      },
    })
    return toDetail(row)
  } catch (error) {
    return productService.rethrow(error, t.notFound, PLATFORM_FIELD)
  }
}

/**
 * Rewrites both rows in one write, moving the unit to another platform if the
 * form says so. Replacing or removing the cover deletes the old file from R2
 * after the save.
 */
async function update(id: string, input: ControllerInput): Promise<ControllerDetail> {
  const existing = await controllerRepository.findById(id)
  if (!existing) throw new ServiceError(t.notFound)
  await productService.assertPlatformsExist([input.platformId], PLATFORM_FIELD)

  let updated: ControllerDetail
  try {
    const row = await controllerRepository.update(id, {
      ...productService.toListingData(input),
      controller: {
        update: { ...toControllerData(input), platform: { connect: { id: input.platformId } } },
      },
    })
    updated = toDetail(row)
  } catch (error) {
    return productService.rethrow(error, t.notFound, PLATFORM_FIELD)
  }

  await productService.cleanUpReplacedImage(existing.imageUrl, updated.imageUrl)
  return updated
}

/** Refused while any order line references the controller — product.service.ts `remove`. */
function remove(id: string): Promise<void> {
  return productService.remove(id, "CONTROLLER", t)
}

export const controllerService = {
  list,
  getById,
  create,
  update,
  remove,
  uploadImage: productService.uploadImage,
}
