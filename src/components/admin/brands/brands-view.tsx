"use client"

import { Ellipsis, Pencil, Plus, Search, Trash2, TriangleAlert } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { BrandLogo } from "@/components/admin/brands/brand-logo"
import { DeleteBrandDialog } from "@/components/admin/brands/delete-brand-dialog"
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
import { useBrands } from "@/hooks/use-brands"
import { ar } from "@/messages/ar"
import type { BrandListItem } from "@/types/brand"
import { normalizeIdentifier } from "@/utils/normalize-identifier"

const t = ar.brands.list
const section = ADMIN_SECTIONS.brands

/** /admin/brands — the list, search, and the entry points to create / edit / delete. */
export function BrandsView() {
  const { data: brands, isPending, isError, error, refetch } = useBrands()
  const [query, setQuery] = useState("")
  const [deleting, setDeleting] = useState<BrandListItem | null>(null)

  const filtered = useMemo(() => {
    const q = normalizeIdentifier(query)
    if (!brands || !q) return brands ?? []
    return brands.filter((b) =>
      [b.name, b.nameAr ?? "", b.slug].some((v) => normalizeIdentifier(v).includes(q))
    )
  }, [brands, query])

  const addButton = (
    <Button render={<Link href={`${ADMIN_ROUTES.brands}/new`} />} nativeButton={false}>
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
      ) : !isPending && brands.length === 0 ? (
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
            {brands && <span className="text-sm text-muted-foreground">{t.count(brands.length)}</span>}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14 ps-4">
                  <span className="sr-only">{t.columns.logo}</span>
                </TableHead>
                <TableHead>{t.columns.name}</TableHead>
                <TableHead className="hidden md:table-cell">{t.columns.slug}</TableHead>
                <TableHead className="hidden text-center sm:table-cell">{t.columns.models}</TableHead>
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
                      <TableCell className="ps-4"><Skeleton className="size-10 rounded-lg" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="mx-auto h-4 w-6" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell className="pe-4" />
                    </TableRow>
                  ))
                : filtered.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell className="ps-4">
                        <BrandLogo name={brand.name} logoUrl={brand.logoUrl} />
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`${ADMIN_ROUTES.brands}/${brand.id}/edit`}
                          className="flex flex-col font-medium hover:text-primary-ink"
                        >
                          <Ltr>{brand.name}</Ltr>
                          {brand.nameAr && (
                            <span className="text-xs font-normal text-muted-foreground">{brand.nameAr}</span>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Ltr mono className="text-xs text-muted-foreground">{brand.slug}</Ltr>
                      </TableCell>
                      <TableCell className="hidden text-center tabular-nums sm:table-cell">
                        {brand.modelsCount}
                      </TableCell>
                      <TableCell>
                        <StatusBadge tone={brand.isActive ? "success" : "neutral"}>
                          {brand.isActive ? t.active : t.inactive}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="pe-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button variant="ghost" size="icon-sm" aria-label={t.actionsFor(brand.name)} />}
                          >
                            <Ellipsis />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-36">
                            <DropdownMenuItem render={<Link href={`${ADMIN_ROUTES.brands}/${brand.id}/edit`} />}>
                              <Pencil />
                              {t.edit}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => setDeleting(brand)}>
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
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    {t.noResults}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      <DeleteBrandDialog brand={deleting} onOpenChange={(open) => !open && setDeleting(null)} />
    </>
  )
}
