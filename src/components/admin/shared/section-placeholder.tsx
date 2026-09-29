import { Check, Construction } from "lucide-react"

import { PageHeader } from "@/components/admin/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ADMIN_SECTIONS, type AdminSectionKey } from "@/constants/admin-navigation"
import { ar } from "@/messages/ar"

const t = ar.admin.placeholder

/**
 * TEMPORARY — the body of every /admin section until its feature is built.
 * Reads title, icon, milestone and the "what will be here" list from
 * ADMIN_SECTIONS, so each placeholder page is one line. Replace per section
 * with the real page; delete this file when the last one goes.
 */
export function SectionPlaceholder({ section }: { section: AdminSectionKey }) {
  const { title, description, icon, planned, milestone } = ADMIN_SECTIONS[section]

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        icon={icon}
        actions={<Badge variant="warning">{t.badge}</Badge>}
      />

      <Card className="border-2 border-dashed bg-transparent ring-0">
        <CardContent className="flex flex-col items-center gap-6 py-10 text-center">
          <span className="grid size-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
            <Construction className="size-8" />
          </span>
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-lg font-semibold">{t.title}</h2>
            <Badge variant="neutral">
              {t.milestone} <bdi dir="ltr">{milestone}</bdi>
            </Badge>
          </div>

          <div className="flex w-full max-w-md flex-col gap-3 text-start">
            <p className="text-sm font-medium text-muted-foreground">{t.planned}</p>
            <ul className="flex flex-col gap-2">
              {planned.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <Check className="mt-1 size-4 shrink-0 text-primary-ink" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
