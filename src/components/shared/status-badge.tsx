import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusTone = "brand" | "success" | "warning" | "info" | "neutral" | "destructive"

const DOT: Record<StatusTone, string> = {
  brand: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
  neutral: "bg-muted-foreground",
  destructive: "bg-destructive",
}

/**
 * The one badge for every domain state — stock, condition, order status,
 * payment status. Domain-neutral: the caller's constants decide the tone and
 * the Arabic label (docs/design-system.md "Status tones"). The dot keeps the
 * state readable without relying on colour alone.
 */
function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: StatusTone
  children: React.ReactNode
  className?: string
}) {
  return (
    <Badge variant={tone} className={cn("gap-1.5", className)}>
      <span aria-hidden className={cn("size-1.5 rounded-full", DOT[tone])} />
      {children}
    </Badge>
  )
}

export { StatusBadge, type StatusTone }
