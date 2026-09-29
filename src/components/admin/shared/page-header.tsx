import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Title row of every admin page: icon, title, description, and the page's
 * actions at the end ("إضافة منتج"…).
 */
export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
}: {
  title: string
  description?: string
  icon?: LucideIcon
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-ink">
            <Icon className="size-5" />
          </span>
        )}
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl leading-tight font-bold">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
