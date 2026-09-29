"use client"

import { Ellipsis, Pencil, Plus, Search, Trash2, TriangleAlert } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { DeletePlatformDialog } from "@/components/admin/platforms/delete-platform-dialog"
import { EmptyState, Ltr, PageHeader, StatusBadge } from "@/components/admin/shared"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ADMIN_SECTIONS } from "@/constants/admin-navigation"
import { ADMIN_ROUTES } from "@/constants/routes"
import { usePlatforms } from "@/hooks/use-platforms"
import { cn } from "@/lib/utils"
import { ar } from "@/messages/ar"
import type { PlatformLinkCounts, PlatformListItem } from "@/types/platform"
import { normalizeIdentifier } from "@/utils/normalize-identifier"

const t = ar.platforms.list
const section = ADMIN_SECTIONS.platforms

// Link-count columns, in display order. The last three hide on narrower screens.
const LINK_COLUMNS: { key: keyof PlatformLinkCounts; label: string; className?: string }[] = [
  { key: "controllers", label: t.columns.controllers, className: "hidden sm:table-cell" },
  { key: "ics", label: t.columns.ics, className: "hidden lg:table-cell" },
  { key: "programmers", label: t.columns.programmers, className: "hidden lg:table-cell" },
  { key: "pinouts", label: t.columns.pinouts, className: "hidden lg:table-cell" },
]

/** /admin/platforms — list, search, and the entry points to create / edit / delete. */
export function PlatformsView() {
  const { data: platforms, isPending, isError, error, refetch } = usePlatforms()
  const [query, setQuery] = useState("")
  const [deleting, setDeleting] = useState<PlatformListItem | null>(null)

  // Identifier-normalised, so "edc 17 c46" finds EDC17C46 and "bosch edc17" finds it too.
  const filtered = useMemo(() => {
    const q = normalizeIdentifier(query)
    if (!platforms || !q) return platforms ?? []
    return platforms.filter((p) =>
      [p.name, p.manufacturer + p.name, p.slug].some((v) => normalizeIdentifier(v).includes(q))
    )
  }, [platforms, query])

  const addButton = (
    <Button render={<Link href={`${ADMIN_ROUTES.platforms}/new`} />} nativeButton={false}>
      <Plus data-icon="inline-start" />
      {t.add}
    </Button>
  )

  return (
    <>
      <PageHeader title={section.title} description={section.description} icon={section.icon} actions={addButton} />

      {isError ? (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>{t.loadError}</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
          <AlertAction>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              {t.retry}
            </Button>
          </AlertAction>
        </Alert>
      ) : !isPending && platforms.length === 0 ? (
        <EmptyState icon={section.icon} title={t.emptyTitle} description={t.emptyDescription} action={addButton} />
      ) : (
        <Card className="gap-0 py-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-3">
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                aria-label={t.searchPlaceholder}
                className="ps-8"
              />
            </div>
            {platforms && <span className="text-sm text-muted-foreground">{t.count(platforms.length)}</span>}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="ps-4">{t.columns.name}</TableHead>
                <TableHead className="hidden md:table-cell">{t.columns.slug}</TableHead>
                {LINK_COLUMNS.map((c) => (
                  <TableHead key={c.key} className={cn("text-center", c.className)}>
                    {c.label}
                  </TableHead>
                ))}
                <TableHead>{t.columns.status}</TableHead>
                <TableHead className="w-12 pe-4">
                  <span className="sr-only">{t.columns.actions}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending
                ? Array.from({ length: 5 }, (_, i) => (
                    <TableRow key={i}>
                      <TableCell className="ps-4"><Skeleton className="h-4 w-36" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                      {LINK_COLUMNS.map((c) => (
                        <TableCell key={c.key} className={c.className}><Skeleton className="mx-auto h-4 w-6" /></TableCell>
                      ))}
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell className="pe-4" />
                    </TableRow>
                  ))
                : filtered.map((platform) => (
                    <TableRow key={platform.id}>
                      <TableCell className="ps-4">
                        <Link
                          href={`${ADMIN_ROUTES.platforms}/${platform.id}/edit`}
                          className="flex flex-col hover:text-primary-ink"
                        >
                          <Ltr mono className="font-medium">{platform.name}</Ltr>
                          <Ltr className="text-xs text-muted-foreground">{platform.manufacturer}</Ltr>
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Ltr mono className="text-xs text-muted-foreground">{platform.slug}</Ltr>
                      </TableCell>
                      {LINK_COLUMNS.map((c) => (
                        <TableCell
                          key={c.key}
                          className={cn(
                            "text-center tabular-nums",
                            platform.links[c.key] === 0 && "text-muted-foreground",
                            c.className
                          )}
                        >
                          {platform.links[c.key]}
                        </TableCell>
                      ))}
                      <TableCell>
                        <StatusBadge tone={platform.isActive ? "success" : "neutral"}>
                          {platform.isActive ? t.active : t.inactive}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="pe-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button variant="ghost" size="icon-sm" aria-label={t.actionsFor(platform.name)} />}
                          >
                            <Ellipsis />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-36">
                            <DropdownMenuItem render={<Link href={`${ADMIN_ROUTES.platforms}/${platform.id}/edit`} />}>
                              <Pencil />
                              {t.edit}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => setDeleting(platform)}>
                              <Trash2 />
                              {t.delete}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}

              {!isPending && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4 + LINK_COLUMNS.length} className="py-10 text-center text-muted-foreground">
                    {t.noResults}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      <DeletePlatformDialog platform={deleting} onOpenChange={(open) => !open && setDeleting(null)} />
    </>
  )
}
