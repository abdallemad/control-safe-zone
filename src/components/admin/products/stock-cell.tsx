import { StatusBadge } from "@/components/admin/shared"
import { STOCK_STATE_META } from "@/constants/product-types"
import { ar } from "@/messages/ar"
import { stockState } from "@/utils/stock-state"

/**
 * The stock column of every product table: the badge (متوفر / كمية محدودة /
 * نفد المخزون — design-system.md "Status tones") with the unit count beneath.
 */
export function StockCell({
  stockQuantity,
  lowStockThreshold,
}: {
  stockQuantity: number
  lowStockThreshold: number
}) {
  const stock = STOCK_STATE_META[stockState(stockQuantity, lowStockThreshold)]
  return (
    <div className="flex flex-col items-start gap-0.5">
      <StatusBadge tone={stock.tone}>{stock.label}</StatusBadge>
      <span className="text-xs text-muted-foreground tabular-nums">{ar.products.list.units(stockQuantity)}</span>
    </div>
  )
}
