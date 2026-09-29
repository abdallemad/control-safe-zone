import type { IcCategory } from "@/generated/prisma"

/**
 * A row of the admin ICs table. Money is a string: Prisma's `Decimal` is a
 * class instance and can't cross to the client, and a float would round.
 */
export type IcListItem = {
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
  partNumber: string
  markings: string[]
  category: IcCategory
  package: string | null
  /** Controller platforms the chip is linked to. */
  platformsCount: number
  /** Orders that contain it — an IC in order history can't be deleted. */
  ordersCount: number
  updatedAt: Date
}

/** What the edit page loads — exactly the form's fields plus the id. */
export type IcDetail = {
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
  partNumber: string
  markings: string[]
  category: IcCategory
  package: string | null
  pinCount: number | null
  datasheetUrl: string | null
  platforms: { platformId: string; role: string | null }[]
}
