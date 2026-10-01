"use client"

import { CircuitBoard, Ellipsis, Pencil, Plus, Search, Star, Trash2, TriangleAlert } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { DeleteControllerDialog } from "@/components/admin/controllers/delete-controller-dialog"
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
import { CONDITION_META, CONTROLLER_CONDITIONS, VIRGIN_META } from "@/constants/product-types"
import { ADMIN_ROUTES } from "@/constants/routes"
import { useControllers } from "@/hooks/use-controllers"
import { ar } from "@/messages/ar"
import type { ControllerListItem } from "@/types/controller"
import { normalizeIdentifier } from "@/utils/normalize-identifier"

const t = ar.controllers.list
const section = ADMIN_SECTIONS.controllers

const ALL = "all"
const CONDITION_FILTER_ITEMS = [
  { value: ALL, label: t.allConditions },
  ...CONTROLLER_CONDITIONS.map((value) => ({ value, label: CONDITION_META[value].label })),
]

const editHref = (id: string) => `${ADMIN_ROUTES.controllers}/${id}/edit`

/** /admin/hardware/controllers — the list, search, condition filter, and the entry points to create / edit / delete. */
export function ControllersView() {
  const { data: controllers, isPending, isError, error, refetch } = useControllers()
  const [query, setQuery] = useState("")
  const [condition, setCondition] = useState<string>(ALL)
  const [deleting, setDeleting] = useState<ControllerListItem | null>(null)

  // Identifier-normalised, so "0281-018-758" finds "0281 018 758" and
  // "bosch edc17c46" finds every unit on that platform.
  const filtered = useMemo(() => {
    const q = normalizeIdentifier(query)
    return (controllers ?? []).filter(
      (c) =>
        (condition === ALL || c.condition === condition) &&
        (!q ||
          [
            c.hardwareNumber,
            c.softwareNumber ?? "",
            c.partNumber ?? "",
            c.serialNumber ?? "",
            c.platform.name,
            c.platform.manufacturer + c.platform.name,
            c.name,
            c.slug,
          ].some((v) => normalizeIdentifier(v).includes(q)))
    )
  }, [controllers, query, condition])

  const addButton = (
    <Button render={<Link href={`${ADMIN_ROUTES.controllers}/new`} />} nativeButton={false}>
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
      ) : !isPending && controllers.length === 0 ? (
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
            <Select items={CONDITION_FILTER_ITEMS} value={condition} onValueChange={(v) => setCondition(v ?? ALL)}>
              <SelectTrigger className="w-36" aria-label={t.conditionFilter}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_FILTER_ITEMS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {controllers && <span className="ms-auto text-sm text-muted-foreground">{t.count(controllers.length)}</span>}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-14 ps-4 sm:table-cell">
                  <span className="sr-only">{t.columns.image}</span>
                </TableHead>
                <TableHead className="max-sm:ps-4">{t.columns.controller}</TableHead>
                <TableHead className="hidden lg:table-cell">{t.columns.platform}</TableHead>
                <TableHead className="hidden md:table-cell">{t.columns.condition}</TableHead>
                <TableHead className="hidden sm:table-cell">{t.columns.price}</TableHead>
                <TableHead>{t.columns.stock}</TableHead>
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
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell className="pe-4" />
                    </TableRow>
                  ))
                : filtered.map((controller) => {
                    const conditionMeta = CONDITION_META[controller.condition]
                    return (
                      <TableRow key={controller.id}>
                        <TableCell className="hidden ps-4 sm:table-cell">
                          <ProductImage name={controller.name} imageUrl={controller.imageUrl} icon={CircuitBoard} />
                        </TableCell>
                        <TableCell className="max-w-72 max-sm:ps-4">
                          <Link href={editHref(controller.id)} className="flex flex-col hover:text-primary-ink">
                            <span className="flex items-center gap-1.5">
                              <Ltr mono className="font-medium">{controller.hardwareNumber}</Ltr>
                              {controller.isFeatured && (
                                <Star
                                  aria-label={ar.products.list.featured}
                                  className="size-3.5 fill-warning text-warning"
                                />
                              )}
                            </span>
                            {controller.softwareNumber && (
                              <span className="text-xs text-muted-foreground">
                                {t.software} <Ltr mono>{controller.softwareNumber}</Ltr>
                              </span>
                            )}
                            <span className="truncate text-xs text-muted-foreground">{controller.name}</span>
                          </Link>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Ltr className="text-sm">
                            {controller.platform.manufacturer} {controller.platform.name}
                          </Ltr>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            <StatusBadge tone={conditionMeta.tone}>{conditionMeta.label}</StatusBadge>
                            {controller.isVirgin && <StatusBadge tone={VIRGIN_META.tone}>{VIRGIN_META.label}</StatusBadge>}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Price amount={controller.price} compareAt={controller.compareAtPrice} size="sm" />
                        </TableCell>
                        <TableCell>
                          <StockCell
                            stockQuantity={controller.stockQuantity}
                            lowStockThreshold={controller.lowStockThreshold}
                          />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <StatusBadge tone={controller.isActive ? "success" : "neutral"}>
                            {controller.isActive ? t.active : t.inactive}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="pe-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label={t.actionsFor(controller.hardwareNumber)}
                                />
                              }
                            >
                              <Ellipsis />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-36">
                              <DropdownMenuItem render={<Link href={editHref(controller.id)} />}>
                                <Pencil />
                                {t.edit}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant="destructive" onClick={() => setDeleting(controller)}>
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
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    {t.noResults}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      <DeleteControllerDialog controller={deleting} onOpenChange={(open) => !open && setDeleting(null)} />
    </>
  )
}
