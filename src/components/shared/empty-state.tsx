import type { LucideIcon } from "lucide-react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/**
 * "Nothing here yet" — icon tile, title, one line of why/what next, and an
 * optional action (usually the page's primary "إضافة …" button).
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <Card
      className={cn(
        "items-center gap-3 border-2 border-dashed bg-transparent px-4 py-12 text-center ring-0",
        className
      )}
    >
      <span className="grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary-ink">
        <Icon className="size-7" />
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </Card>
  )
}
