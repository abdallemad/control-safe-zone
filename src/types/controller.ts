import type { ProductCondition } from "@/generated/prisma"

/**
 * A row of the admin controllers table. Money is a string: Prisma's
 * `Decimal` can't cross to the client, and a float would round.
 */
export type ControllerListItem = {
  id: string
  name: string
  slug: string
  manufacturer: string
  imageUrl: string | null
  price: string
  compareAtPrice: string | null
  stockQuantity: number
  lowStockThreshold: number
  isActive: boolean
  isFeatured: boolean
  hardwareNumber: string
  softwareNumber: string | null
  partNumber: string | null
  serialNumber: string | null
  condition: ProductCondition
  isVirgin: boolean
  platform: { id: string; name: string; manufacturer: string }
  /** Orders that contain it — a controller in order history can't be deleted. */
  ordersCount: number
  updatedAt: Date
}

/** What the edit page loads — exactly the form's fields plus the id. */
export type ControllerDetail = {
  id: string
  name: string
  slug: string
  manufacturer: string
  description: string | null
  imageUrl: string | null
  price: string
  compareAtPrice: string | null
  stockQuantity: number
  lowStockThreshold: number
  isActive: boolean
  isFeatured: boolean
  platformId: string
  hardwareNumber: string
  softwareNumber: string | null
  partNumber: string | null
  condition: ProductCondition
  isVirgin: boolean
  /** Decimal(3, 1) as a string — "1.6". */
  litres: string | null
  serialNumber: string | null
}
