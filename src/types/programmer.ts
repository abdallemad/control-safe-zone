import type { ProgrammerMode } from "@/constants/product-types"

/**
 * A row of the admin programmers table. Money is a string: Prisma's
 * `Decimal` can't cross to the client, and a float would round.
 */
export type ProgrammerListItem = {
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
  toolName: string
  edition: string | null
  /** Whether *any* supported platform is read that way — the list's filter and badges. */
  modes: Record<ProgrammerMode, boolean>
  /** Supported controller platforms. */
  platformsCount: number
  /** Orders that contain it — a programmer in order history can't be deleted. */
  ordersCount: number
  updatedAt: Date
}

/** What the edit page loads — exactly the form's fields plus the id. */
export type ProgrammerDetail = {
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
  toolName: string
  edition: string | null
  boxContents: string | null
  platforms: {
    platformId: string
    obd: boolean
    boot: boolean
    bench: boolean
    notes: string | null
  }[]
}
