"use client"

import { Cpu, Ellipsis, Pencil, Plus, Search, Star, Trash2, TriangleAlert } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { DeleteIcDialog } from "@/components/admin/ics/delete-ic-dialog"
import { ProductImage } from "@/components/admin/products/product-image"
import { StockCell } from "@/components/admin/products/stock-cell"
import { EmptyState, Ltr, PageHeader, Price, StatusBadge } from "@/components/admin/shared"
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
import { IC_CATEGORIES, IC_CATEGORY_META } from "@/constants/product-types"
import { ADMIN_ROUTES } from "@/constants/routes"
import { useIcs } from "@/hooks/use-ics"
import { cn } from "@/lib/utils"
import { ar } from "@/messages/ar"
import type { IcListItem } from "@/types/ic"
import { normalizeIdentifier } from "@/utils/normalize-identifier"

const t = ar.ics.list
const section = ADMIN_SECTIONS.ics

const ALL = "all"
const CATEGORY_FILTER_ITEMS = [
  { value: ALL, label: t.allCategories },
  ...IC_CATEGORIES.map((value) => ({ value, label: IC_CATEGORY_META[value].label })),
]

const editHref = (id: string) => `${ADMIN_ROUTES.ics}/${id}/edit`

/** /admin/hardware/ics — the list, search, category filter, and the entry points to create / edit / delete. */
export function IcsView() {
  const { data: ics, isPending, isError, error, refetch } = useIcs()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string>(ALL)
  const [deleting, setDeleting] = useState<IcListItem | null>(null)

  // Identifier-normalised, so "tc 1797" finds SAK-TC1797 and every marking is a key.
  const filtered = useMemo(() => {
    const q = normalizeIdentifier(query)
    return (ics ?? []).filter(
      (ic) =>
        (category === ALL || ic.category === category) &&
        (!q ||
          [ic.partNumber, ...ic.markings, ic.name, ic.manufacturer + ic.partNumber, ic.package ?? "", ic.slug].some(
            (v) => normalizeIdentifier(v).includes(q)
          ))
    )
  }, [ics, query, category])

  const addButton = (
    <Button render={<Link href={`${ADMIN_ROUTES.ics}/new`} />} nativeButton={false}>
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
      ) : !isPending && ics.length === 0 ? (
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
            <Select items={CATEGORY_FILTER_ITEMS} value={category} onValueChange={(v) => setCategory(v ?? ALL)}>
              <SelectTrigger className="w-36" aria-label={t.categoryFilter}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_FILTER_ITEMS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {ics && <span className="ms-auto text-sm text-muted-foreground">{t.count(ics.length)}</span>}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-14 ps-4 sm:table-cell">
                  <span className="sr-only">{t.columns.image}</span>
                </TableHead>
                <TableHead className="max-sm:ps-4">{t.columns.ic}</TableHead>
                <TableHead className="hidden md:table-cell">{t.columns.category}</TableHead>
                <TableHead className="hidden sm:table-cell">{t.columns.price}</TableHead>
                <TableHead>{t.columns.stock}</TableHead>
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
                      <TableCell className="max-sm:ps-4"><Skeleton className="h-4 w-36" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="mx-auto h-4 w-6" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell className="pe-4" />
                    </TableRow>
                  ))
                : filtered.map((ic) => (
                    <TableRow key={ic.id}>
                      <TableCell className="hidden ps-4 sm:table-cell">
                        <ProductImage name={ic.name} imageUrl={ic.imageUrl} icon={Cpu} />
                      </TableCell>
                      <TableCell className="max-w-72 max-sm:ps-4">
                        <Link href={editHref(ic.id)} className="flex flex-col hover:text-primary-ink">
                          <span className="flex items-center gap-1.5">
                            <Ltr mono className="font-medium">{ic.partNumber}</Ltr>
                            {ic.isFeatured && (
                              <Star aria-label={ar.products.list.featured} className="size-3.5 fill-warning text-warning" />
                            )}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">{ic.name}</span>
                          {ic.markings.length > 0 && (
                            <Ltr mono className="hidden truncate text-xs text-muted-foreground lg:block">
                              {ic.markings.join(" · ")}
                            </Ltr>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col">
                          <span className="text-sm">{IC_CATEGORY_META[ic.category].label}</span>
                          <Ltr className="text-xs text-muted-foreground">{ic.manufacturer}</Ltr>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Price amount={ic.price} compareAt={ic.compareAtPrice} size="sm" />
                      </TableCell>
                      <TableCell>
                        <StockCell stockQuantity={ic.stockQuantity} lowStockThreshold={ic.lowStockThreshold} />
                      </TableCell>
                      <TableCell
                        className={cn(
                          "hidden text-center tabular-nums lg:table-cell",
                          ic.platformsCount === 0 && "text-muted-foreground"
                        )}
                      >
                        {ic.platformsCount}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <StatusBadge tone={ic.isActive ? "success" : "neutral"}>
                          {ic.isActive ? t.active : t.inactive}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="pe-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button variant="ghost" size="icon-sm" aria-label={t.actionsFor(ic.partNumber)} />}
                          >
                            <Ellipsis />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-36">
                            <DropdownMenuItem render={<Link href={editHref(ic.id)} />}>
                              <Pencil />
                              {t.edit}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => setDeleting(ic)}>
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
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    {t.noResults}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      <DeleteIcDialog ic={deleting} onOpenChange={(open) => !open && setDeleting(null)} />
    </>
  )
}
