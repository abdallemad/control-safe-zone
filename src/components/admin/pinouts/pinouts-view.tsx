"use client"

import { Ellipsis, ExternalLink, FileText, Pencil, Plus, Search, Trash2, TriangleAlert } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { DeletePinoutDialog } from "@/components/admin/pinouts/delete-pinout-dialog"
import { ProductImage } from "@/components/admin/products/product-image"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { pinoutAccess, pinoutPdfHref } from "@/constants/pinouts"
import { ADMIN_ROUTES } from "@/constants/routes"
import { usePinouts } from "@/hooks/use-pinouts"
import { ar } from "@/messages/ar"
import type { PinoutListItem } from "@/types/pinout"
import { normalizeIdentifier } from "@/utils/normalize-identifier"

const t = ar.pinouts.list
const section = ADMIN_SECTIONS.pinouts

const ALL = "all"
const NONE = "none"

const editHref = (id: string) => `${ADMIN_ROUTES.pinouts}/${id}/edit`
const platformLabel = (p: NonNullable<PinoutListItem["platform"]>) => `${p.manufacturer} ${p.name}`

/** /admin/hardware/pinouts — the list, search, platform filter, and the entry points to create / edit / delete. */
export function PinoutsView() {
  const { data: pinouts, isPending, isError, error, refetch } = usePinouts()
  const [query, setQuery] = useState("")
  const [platform, setPlatform] = useState<string>(ALL)
  const [deleting, setDeleting] = useState<PinoutListItem | null>(null)

  // The filter offers the platforms that have pinouts, plus "no platform".
  const platformFilterItems = useMemo(() => {
    const seen = new Map<string, string>()
    for (const p of pinouts ?? []) if (p.platform) seen.set(p.platform.id, platformLabel(p.platform))
    return [
      { value: ALL, label: t.allPlatforms },
      { value: NONE, label: t.noPlatform },
      ...[...seen].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label)),
    ]
  }, [pinouts])

  // Identifier-normalised, so "edc 17-c46" finds every EDC17C46 pinout and
  // "main94" finds the "Main 94-pin" connector.
  const filtered = useMemo(() => {
    const q = normalizeIdentifier(query)
    return (pinouts ?? []).filter(
      (p) =>
        (platform === ALL || (platform === NONE ? !p.platform : p.platform?.id === platform)) &&
        (!q ||
          [
            p.name,
            p.slug,
            p.connector ?? "",
            p.platform?.name ?? "",
            p.platform ? p.platform.manufacturer + p.platform.name : "",
          ].some((v) => normalizeIdentifier(v).includes(q)))
    )
  }, [pinouts, query, platform])

  const addButton = (
    <Button render={<Link href={`${ADMIN_ROUTES.pinouts}/new`} />} nativeButton={false}>
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
      ) : !isPending && pinouts.length === 0 ? (
        <EmptyState icon={section.icon} title={t.emptyTitle} description={t.emptyDescription} action={addButton} />
      ) : (
        <Card className="gap-0 py-0">
          <div className="flex flex-wrap items-center gap-3 border-b p-3">
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
            <Select items={platformFilterItems} value={platform} onValueChange={(v) => setPlatform(v ?? ALL)}>
              <SelectTrigger className="w-44" aria-label={t.platformFilter}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {platformFilterItems.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.value === ALL || p.value === NONE ? p.label : <Ltr>{p.label}</Ltr>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {pinouts && <span className="ms-auto text-sm text-muted-foreground">{t.count(pinouts.length)}</span>}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-14 ps-4 sm:table-cell">
                  <span className="sr-only">{t.columns.image}</span>
                </TableHead>
                <TableHead className="max-sm:ps-4">{t.columns.pinout}</TableHead>
                <TableHead className="hidden lg:table-cell">{t.columns.platform}</TableHead>
                <TableHead>{t.columns.files}</TableHead>
                <TableHead className="hidden md:table-cell">{t.columns.access}</TableHead>
                <TableHead className="hidden md:table-cell">{t.columns.status}</TableHead>
                <TableHead className="w-12 pe-4">
                  <span className="sr-only">{t.columns.actions}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending
                ? Array.from({ length: 5 }, (_, i) => (
                    <TableRow key={i}>
                      <TableCell className="hidden ps-4 sm:table-cell"><Skeleton className="size-10 rounded-lg" /></TableCell>
                      <TableCell className="max-sm:ps-4"><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell className="pe-4" />
                    </TableRow>
                  ))
                : filtered.map((pinout) => {
                    const access = pinoutAccess(pinout.requiresSignIn)
                    return (
                      <TableRow key={pinout.id}>
                        <TableCell className="hidden ps-4 sm:table-cell">
                          <ProductImage name={pinout.name} imageUrl={pinout.imageUrl} icon={FileText} />
                        </TableCell>
                        <TableCell className="max-w-72 max-sm:ps-4">
                          <Link href={editHref(pinout.id)} className="flex flex-col hover:text-primary-ink">
                            <span className="truncate font-medium">{pinout.name}</span>
                            {pinout.connector && (
                              <span className="text-xs text-muted-foreground">
                                {t.connector} <Ltr mono>{pinout.connector}</Ltr>
                              </span>
                            )}
                          </Link>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {pinout.platform ? (
                            <Ltr className="text-sm">{platformLabel(pinout.platform)}</Ltr>
                          ) : (
                            <span className="text-sm text-muted-foreground">{t.noPlatform}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge tone={pinout.hasPdf ? "success" : "warning"}>
                            {pinout.hasPdf ? t.pdf : t.noPdf}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <StatusBadge tone={access.tone}>{access.label}</StatusBadge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <StatusBadge tone={pinout.isActive ? "success" : "neutral"}>
                            {pinout.isActive ? t.active : t.inactive}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="pe-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={<Button variant="ghost" size="icon-sm" aria-label={t.actionsFor(pinout.name)} />}
                            >
                              <Ellipsis />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-40">
                              <DropdownMenuItem render={<Link href={editHref(pinout.id)} />}>
                                <Pencil />
                                {t.edit}
                              </DropdownMenuItem>
                              {pinout.hasPdf && (
                                <DropdownMenuItem
                                  render={<a href={pinoutPdfHref(pinout.id)} target="_blank" rel="noopener noreferrer" />}
                                >
                                  <ExternalLink />
                                  {t.openPdf}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant="destructive" onClick={() => setDeleting(pinout)}>
                                <Trash2 />
                                {t.delete}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}

              {!isPending && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    {t.noResults}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      <DeletePinoutDialog pinout={deleting} onOpenChange={(open) => !open && setDeleting(null)} />
    </>
  )
}
