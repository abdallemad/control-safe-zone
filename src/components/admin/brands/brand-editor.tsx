"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { PageHeader } from "@/components/admin/shared"
import { BrandForm } from "@/components/forms/brand-form"
import { ADMIN_SECTIONS } from "@/constants/admin-navigation"
import { ADMIN_ROUTES } from "@/constants/routes"
import { useCreateBrand, useUpdateBrand, useUploadBrandLogo } from "@/hooks/use-brands"
import { ar } from "@/messages/ar"
import type { BrandInput } from "@/schemas/brand.schema"
import type { BrandDetail } from "@/types/brand"

const t = ar.brands.form

const EMPTY: BrandInput = { name: "", nameAr: "", slug: "", logoUrl: null, isActive: true }

/**
 * The full-page create / edit screen (/admin/brands/new, /admin/brands/[id]/edit).
 * Owns the mutations; BrandForm stays presentational. Back to the list on save.
 */
export function BrandEditor({ brand }: { brand?: BrandDetail }) {
  const router = useRouter()
  const createBrand = useCreateBrand()
  const updateBrand = useUpdateBrand(brand?.id ?? "")
  const uploadLogo = useUploadBrandLogo()

  const isEdit = Boolean(brand)

  async function onSubmit(values: BrandInput) {
    if (brand) {
      await updateBrand.mutateAsync(values)
      toast.success(ar.brands.toasts.updated, { description: values.name })
    } else {
      await createBrand.mutateAsync(values)
      toast.success(ar.brands.toasts.created, { description: values.name })
    }
    router.push(ADMIN_ROUTES.brands)
  }

  return (
    <>
      <PageHeader
        title={isEdit ? `${t.editTitle}: ${brand!.name}` : t.createTitle}
        description={isEdit ? undefined : t.createDescription}
        icon={ADMIN_SECTIONS.brands.icon}
      />
      <BrandForm
        defaultValues={
          brand
            ? {
                name: brand.name,
                nameAr: brand.nameAr ?? "",
                slug: brand.slug,
                logoUrl: brand.logoUrl,
                isActive: brand.isActive,
              }
            : EMPTY
        }
        onSubmit={onSubmit}
        uploadLogo={(file) => uploadLogo.mutateAsync(file)}
        submitLabel={isEdit ? t.save : t.create}
        cancelHref={ADMIN_ROUTES.brands}
        autoSlug={!isEdit}
      />
    </>
  )
}
