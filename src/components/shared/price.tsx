import { cn } from "@/lib/utils"
import { formatPrice } from "@/utils/format-price"

/**
 * A price in EGP, with the struck-through "was" price when the listing has a
 * real `compareAtPrice` (never a fake one — prisma/schema.prisma `Product`).
 */
function Price({
  amount,
  compareAt,
  size = "default",
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  amount: number | string
  compareAt?: number | string | null
  size?: "sm" | "default" | "lg"
}) {
  const was =
    compareAt != null && Number(compareAt) > Number(amount) ? compareAt : null

  return (
    <span
      data-slot="price"
      data-size={size}
      className={cn(
        "inline-flex items-baseline gap-2 tabular-nums",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "font-semibold text-foreground",
          size === "sm" && "text-sm",
          size === "default" && "text-base",
          size === "lg" && "text-2xl font-bold"
        )}
      >
        {formatPrice(amount)}
      </span>
      {was != null && (
        <s className="text-sm text-muted-foreground">{formatPrice(was)}</s>
      )}
    </span>
  )
}

export { Price }
