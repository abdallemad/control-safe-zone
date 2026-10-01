import type { StatusTone } from "@/components/shared/status-badge"
import type { IcCategory, ProductCondition } from "@/generated/prisma"
import { ar } from "@/messages/ar"

// Product registries (docs/folder-structure.md "constants/"). Only what the
// admin IC, programmer and controller CRUDs need today; PRODUCT_TYPE_META
// (label, route, fields and icon per ProductType) arrives with the storefront.

/**
 * The `IcCategory` enum's values, for Zod and selects. Kept here — not read
 * from the generated Prisma client — so client code never bundles Prisma;
 * `satisfies` breaks the build if the enum and this list drift apart.
 */
export const IC_CATEGORIES = ["MCU", "EEPROM", "FLASH", "DRIVER", "POWER", "OTHER"] as const satisfies readonly IcCategory[]

/** Arabic label per IC category — the /ics filter and the admin table. */
export const IC_CATEGORY_META: Record<IcCategory, { label: string }> = {
  MCU: { label: ar.ics.categories.MCU },
  EEPROM: { label: ar.ics.categories.EEPROM },
  FLASH: { label: ar.ics.categories.FLASH },
  DRIVER: { label: ar.ics.categories.DRIVER },
  POWER: { label: ar.ics.categories.POWER },
  OTHER: { label: ar.ics.categories.OTHER },
}

/**
 * How a programmer reads a controller — the three flags on every
 * `ProgrammerSupport` row, in the order they are always shown.
 */
export const PROGRAMMER_MODES = ["obd", "boot", "bench"] as const
export type ProgrammerMode = (typeof PROGRAMMER_MODES)[number]

export const PROGRAMMER_MODE_META: Record<ProgrammerMode, { label: string }> = {
  obd: { label: ar.programmers.modes.obd },
  boot: { label: ar.programmers.modes.boot },
  bench: { label: ar.programmers.modes.bench },
}

/**
 * The `ProductCondition` enum's values, in display order — same `satisfies`
 * guard as IC_CATEGORIES.
 */
export const CONTROLLER_CONDITIONS = ["NEW", "USED", "REFURBISHED"] as const satisfies readonly ProductCondition[]

/** Condition badge per value — docs/design-system.md "Status tones". */
export const CONDITION_META: Record<ProductCondition, { label: string; tone: StatusTone }> = {
  NEW: { label: ar.controllers.conditions.NEW, tone: "info" },
  USED: { label: ar.controllers.conditions.USED, tone: "neutral" },
  REFURBISHED: { label: ar.controllers.conditions.REFURBISHED, tone: "success" },
}

/** The virgin flag's badge — shown *in addition* to the condition. */
export const VIRGIN_META: { label: string; tone: StatusTone } = { label: ar.controllers.virgin, tone: "brand" }

export type StockState = "inStock" | "low" | "out"

/** Stock badge per state — docs/design-system.md "Status tones". */
export const STOCK_STATE_META: Record<StockState, { label: string; tone: StatusTone }> = {
  inStock: { label: ar.stock.inStock, tone: "success" },
  low: { label: ar.stock.low, tone: "warning" },
  out: { label: ar.stock.out, tone: "neutral" },
}
