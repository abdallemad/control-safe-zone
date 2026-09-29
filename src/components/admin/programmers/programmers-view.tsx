"use client"

import { Ellipsis, Pencil, Plus, Search, Star, Trash2, TriangleAlert, Usb } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { ProductImage } from "@/components/admin/products/product-image"
import { StockCell } from "@/components/admin/products/stock-cell"
import { DeleteProgrammerDialog } from "@/components/admin/programmers/delete-programmer-dialog"
import { EmptyState, Ltr, PageHeader, Price, StatusBadge } from "@/components/admin/shared"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
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
import { PROGRAMMER_MODE_META, PROGRAMMER_MODES } from "@/constants/product-types"
import { ADMIN_ROUTES } from "@/constants/routes"
import { useProgrammers } from "@/hooks/use-programmers"
import { cn } from "@/lib/utils"
import { ar } from "@/messages/ar"
import type { ProgrammerListItem } from "@/types/programmer"
import { normalizeIdentifier } from "@/utils/normalize-identifier"

const t = ar.programmers.list
const section = ADMIN_SECTIONS.programmers

const ALL = "all"
const MODE_FILTER_ITEMS = [
  { value: ALL, label: t.allModes },
  ...PROGRAMMER_MODES.map((value) => ({ value, label: PROGRAMMER_MODE_META[value].label })),
]

const editHref = (id: string) => `${ADMIN_ROUTES.programmers}/${id}/edit`

/** /admin/hardware/programmers — the list, search, mode filter, and the entry points to create / edit / delete. */
export function ProgrammersView() {
  const { data: programmers, isPending, isError, error, refetch } = useProgrammers()
  const [query, setQuery] = useState("")
  const [mode, setMode] = useState<string>(ALL)
  const [deleting, setDeleting] = useState<ProgrammerListItem | null>(null)

  // Identifier-normalised, so "kess v3" finds KESS V3 and "alientech kess" finds it too.
  const filtered = useMemo(() => {
    const q = normalizeIdentifier(query)
    return (programmers ?? []).filter(
      (p) =>
        (mode === ALL || p.modes[mode as keyof ProgrammerListItem["modes"]]) &&
        (!q ||
          [
            p.toolName,
            p.toolName + (p.edition ?? ""),
            p.manufacturer + p.toolName,
            p.name,
            p.slug,
          ].some((v) => normalizeIdentifier(v).includes(q)))
    )
  }, [programmers, query, mode])

  const addButton = (
    <Button render={<Link href={`${ADMIN_ROUTES.programmers}/new`} />} nativeButton={false}>
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
      ) : !isPending && programmers.length === 0 ? (
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
            <Select items={MODE_FILTER_ITEMS} value={mode} onValueChange={(v) => setMode(v ?? ALL)}>
              <SelectTrigger className="w-36" aria-label={t.modeFilter}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODE_FILTER_ITEMS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {programmers && <span className="ms-auto text-sm text-muted-foreground">{t.count(programmers.length)}</span>}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-14 ps-4 sm:table-cell">
                  <span className="sr-only">{t.columns.image}</span>
                </TableHead>
                <TableHead className="max-sm:ps-4">{t.columns.tool}</TableHead>
                <TableHead className="hidden md:table-cell">{t.columns.manufacturer}</TableHead>
                <TableHead className="hidden sm:table-cell">{t.columns.price}</TableHead>
                <TableHead>{t.columns.stock}</TableHead>
                <TableHead className="hidden lg:table-cell">{t.columns.modes}</TableHead>
                <TableHead className="hidden text-center lg:table-cell">{t.columns.platforms}</TableHead>
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
                      <TableCell className="max-sm:ps-4"><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-28 rounded-full" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="mx-auto h-4 w-6" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell className="pe-4" />
                    </TableRow>
                  ))
                : filtered.map((programmer) => (
                    <TableRow key={programmer.id}>
                      <TableCell className="hidden ps-4 sm:table-cell">
                        <ProductImage name={programmer.name} imageUrl={programmer.imageUrl} icon={Usb} />
                      </TableCell>
                      <TableCell className="max-w-72 max-sm:ps-4">
                        <Link href={editHref(programmer.id)} className="flex flex-col hover:text-primary-ink">
                          <span className="flex items-center gap-1.5">
                            <Ltr mono className="font-medium">{programmer.toolName}</Ltr>
                            {programmer.edition && (
                              <Badge variant="neutral">
                                <bdi dir="ltr">{programmer.edition}</bdi>
                              </Badge>
                            )}
                            {programmer.isFeatured && (
                              <Star
                                aria-label={ar.products.list.featured}
                                className="size-3.5 fill-warning text-warning"
                              />
                            )}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">{programmer.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Ltr className="text-sm">{programmer.manufacturer}</Ltr>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Price amount={programmer.price} compareAt={programmer.compareAtPrice} size="sm" />
                      </TableCell>
                      <TableCell>
                        <StockCell
                          stockQuantity={programmer.stockQuantity}
                          lowStockThreshold={programmer.lowStockThreshold}
                        />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {PROGRAMMER_MODES.filter((m) => programmer.modes[m]).map((m) => (
                            <Badge key={m} variant="info">
                              <bdi dir="ltr">{PROGRAMMER_MODE_META[m].label}</bdi>
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "hidden text-center tabular-nums lg:table-cell",
                          programmer.platformsCount === 0 && "text-muted-foreground"
                        )}
                      >
                        {programmer.platformsCount}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <StatusBadge tone={programmer.isActive ? "success" : "neutral"}>
                          {programmer.isActive ? t.active : t.inactive}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="pe-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="icon-sm" aria-label={t.actionsFor(programmer.toolName)} />
                            }
                          >
                            <Ellipsis />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-36">
                            <DropdownMenuItem render={<Link href={editHref(programmer.id)} />}>
                              <Pencil />
                              {t.edit}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => setDeleting(programmer)}>
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
                  <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                    {t.noResults}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      <DeleteProgrammerDialog programmer={deleting} onOpenChange={(open) => !open && setDeleting(null)} />
    </>
  )
}
