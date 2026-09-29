"use client"

import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { toast } from "sonner"

import { PageHeader } from "@/components/admin/shared"
import { ProgrammerForm } from "@/components/forms/programmer-form"
import { ADMIN_SECTIONS } from "@/constants/admin-navigation"
import { ADMIN_ROUTES } from "@/constants/routes"
import { usePlatforms } from "@/hooks/use-platforms"
import {
  useCreateProgrammer,
  useProgrammers,
  useUpdateProgrammer,
  useUploadProgrammerImage,
} from "@/hooks/use-programmers"
import { ar } from "@/messages/ar"
import type { ProgrammerInput } from "@/schemas/programmer.schema"
import type { ProgrammerDetail } from "@/types/programmer"

const t = ar.programmers.form

const EMPTY: ProgrammerInput = {
  toolName: "",
  manufacturer: "",
  edition: "",
  boxContents: "",
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

function toFormValues(programmer: ProgrammerDetail): ProgrammerInput {
  return {
    toolName: programmer.toolName,
    manufacturer: programmer.manufacturer,
    edition: programmer.edition ?? "",
    boxContents: programmer.boxContents ?? "",
    name: programmer.name,
    slug: programmer.slug,
    description: programmer.description ?? "",
    imageUrl: programmer.imageUrl,
    price: programmer.price,
    compareAtPrice: programmer.compareAtPrice ?? "",
    stockQuantity: programmer.stockQuantity,
    lowStockThreshold: programmer.lowStockThreshold,
    isFeatured: programmer.isFeatured,
    isActive: programmer.isActive,
    platforms: programmer.platforms.map((s) => ({
      platformId: s.platformId,
      obd: s.obd,
      boot: s.boot,
      bench: s.bench,
      notes: s.notes ?? "",
    })),
  }
}

/**
 * Full-page create / edit (/admin/hardware/programmers/new,
 * /admin/hardware/programmers/[id]/edit). Owns the mutations; ProgrammerForm
 * stays presentational. Back to the list on save.
 */
export function ProgrammerEditor({ programmer }: { programmer?: ProgrammerDetail }) {
  const router = useRouter()
  const createProgrammer = useCreateProgrammer()
  const updateProgrammer = useUpdateProgrammer(programmer?.id ?? "")
  const uploadImage = useUploadProgrammerImage()
  // Prefetched by the page — the platform picker's options.
  const { data: platforms } = usePlatforms()
  // Usually cached from the table; its tool makers become suggestions.
  const { data: programmers } = useProgrammers()

  const platformOptions = useMemo(
    () => (platforms ?? []).map((p) => ({ value: p.id, label: `${p.manufacturer} ${p.name}` })),
    [platforms]
  )
  const manufacturers = useMemo(
    () => [...new Set((programmers ?? []).map((p) => p.manufacturer))].sort(),
    [programmers]
  )

  async function onSubmit(values: ProgrammerInput) {
    if (programmer) {
      await updateProgrammer.mutateAsync(values)
      toast.success(ar.programmers.toasts.updated, { description: values.toolName })
    } else {
      await createProgrammer.mutateAsync(values)
      toast.success(ar.programmers.toasts.created, { description: values.toolName })
    }
    router.push(ADMIN_ROUTES.programmers)
  }

  return (
    <>
      <PageHeader
        title={programmer ? `${t.editTitle}: ${programmer.toolName}` : t.createTitle}
        description={programmer ? undefined : t.createDescription}
        icon={ADMIN_SECTIONS.programmers.icon}
      />
      <ProgrammerForm
        defaultValues={programmer ? toFormValues(programmer) : EMPTY}
        onSubmit={onSubmit}
        uploadImage={(file) => uploadImage.mutateAsync(file)}
        submitLabel={programmer ? t.save : t.create}
        cancelHref={ADMIN_ROUTES.programmers}
        autoSlug={!programmer}
        platformOptions={platformOptions}
        manufacturerSuggestions={manufacturers}
      />
    </>
  )
}
