import type { StockState } from "@/constants/product-types"

/**
 * Which stock badge a listing shows (docs/design-system.md "Status tones"):
 * 0 → out, at or below `lowStockThreshold` → low, else in stock.
 */
export function stockState(stockQuantity: number, lowStockThreshold: number): StockState {
  if (stockQuantity <= 0) return "out"
  if (stockQuantity <= lowStockThreshold) return "low"
  return "inStock"
}
