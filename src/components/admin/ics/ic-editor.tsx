"use client"

import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { toast } from "sonner"

import { PageHeader } from "@/components/admin/shared"
import { IcForm } from "@/components/forms/ic-form"
import { ADMIN_SECTIONS } from "@/constants/admin-navigation"
import { ADMIN_ROUTES } from "@/constants/routes"
import { useCreateIc, useIcs, useUpdateIc, useUploadIcImage } from "@/hooks/use-ics"
import { usePlatforms } from "@/hooks/use-platforms"
import { ar } from "@/messages/ar"
import type { IcInput } from "@/schemas/ic.schema"
import type { IcDetail } from "@/types/ic"

const t = ar.ics.form

const EMPTY: IcInput = {
  partNumber: "",
  manufacturer: "",
  // The Select starts empty; the schema rejects "" with "اختر نوع الشريحة".
  category: "" as IcInput["category"],
  markings: [],
  package: "",
  pinCount: null,
  datasheetUrl: "",
  name: "",
  slug: "",
  description: "",
  imageUrl: null,
  price: "",
  compareAtPrice: "",
  stockQuantity: 0,
  lowStockThreshold: 2,
  isFeatured: false,
  isActive: true,
  platforms: [],
}

function toFormValues(ic: IcDetail): IcInput {
  return {
    partNumber: ic.partNumber,
    manufacturer: ic.manufacturer,
    category: ic.category,
    markings: ic.markings,
    package: ic.package ?? "",
    pinCount: ic.pinCount,
    datasheetUrl: ic.datasheetUrl ?? "",
    name: ic.name,
    slug: ic.slug,
    description: ic.description ?? "",
    imageUrl: ic.imageUrl,
    price: ic.price,
    compareAtPrice: ic.compareAtPrice ?? "",
    stockQuantity: ic.stockQuantity,
    lowStockThreshold: ic.lowStockThreshold,
    isFeatured: ic.isFeatured,
    isActive: ic.isActive,
    platforms: ic.platforms.map((p) => ({ platformId: p.platformId, role: p.role ?? "" })),
  }
}

/**
 * Full-page create / edit (/admin/hardware/ics/new, /admin/hardware/ics/[id]/edit).
 * Owns the mutations; IcForm stays presentational. Back to the list on save.
 */
export function IcEditor({ ic }: { ic?: IcDetail }) {
  const router = useRouter()
  const createIc = useCreateIc()
  const updateIc = useUpdateIc(ic?.id ?? "")
  const uploadImage = useUploadIcImage()
  // Prefetched by the page — the platform picker's options.
  const { data: platforms } = usePlatforms()
  // Usually cached from the table; its chip makers become suggestions.
  const { data: ics } = useIcs()

  const platformOptions = useMemo(
    () => (platforms ?? []).map((p) => ({ value: p.id, label: `${p.manufacturer} ${p.name}` })),
    [platforms]
  )
  const manufacturers = useMemo(() => [...new Set((ics ?? []).map((i) => i.manufacturer))].sort(), [ics])

  async function onSubmit(values: IcInput) {
    if (ic) {
      await updateIc.mutateAsync(values)
      toast.success(ar.ics.toasts.updated, { description: values.partNumber })
    } else {
      await createIc.mutateAsync(values)
      toast.success(ar.ics.toasts.created, { description: values.partNumber })
    }
    router.push(ADMIN_ROUTES.ics)
  }

  return (
    <>
      <PageHeader
        title={ic ? `${t.editTitle}: ${ic.partNumber}` : t.createTitle}
        description={ic ? undefined : t.createDescription}
        icon={ADMIN_SECTIONS.ics.icon}
      />
      <IcForm
        defaultValues={ic ? toFormValues(ic) : EMPTY}
        onSubmit={onSubmit}
        uploadImage={(file) => uploadImage.mutateAsync(file)}
        submitLabel={ic ? t.save : t.create}
        cancelHref={ADMIN_ROUTES.ics}
        autoSlug={!ic}
        platformOptions={platformOptions}
        manufacturerSuggestions={manufacturers}
      />
    </>
  )
}
