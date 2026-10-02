"use client"

import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { toast } from "sonner"

import { PageHeader } from "@/components/admin/shared"
import { PinoutForm } from "@/components/forms/pinout-form"
import { ADMIN_SECTIONS } from "@/constants/admin-navigation"
import { pinoutPdfHref } from "@/constants/pinouts"
import { ADMIN_ROUTES } from "@/constants/routes"
import { useCreatePinout, useUpdatePinout, useUploadPinoutImage, useUploadPinoutPdf } from "@/hooks/use-pinouts"
import { usePlatforms } from "@/hooks/use-platforms"
import { ar } from "@/messages/ar"
import type { PinoutInput } from "@/schemas/pinout.schema"
import type { PinoutDetail } from "@/types/pinout"

const t = ar.pinouts.form

const EMPTY: PinoutInput = {
  name: "",
  platformId: "",
  connector: "",
  slug: "",
  imageUrl: null,
  pdfKey: null,
  // Business-analysis open question 1 — default: signed-in users only.
  requiresSignIn: true,
  isActive: true,
}

function toFormValues(pinout: PinoutDetail): PinoutInput {
  return {
    name: pinout.name,
    platformId: pinout.platformId ?? "",
    connector: pinout.connector ?? "",
    slug: pinout.slug,
    imageUrl: pinout.imageUrl,
    pdfKey: pinout.pdfKey,
    requiresSignIn: pinout.requiresSignIn,
    isActive: pinout.isActive,
  }
}

/**
 * Full-page create / edit (/admin/hardware/pinouts/new,
 * /admin/hardware/pinouts/[id]/edit). Owns the mutations; PinoutForm stays
 * presentational. Back to the list on save.
 */
export function PinoutEditor({ pinout }: { pinout?: PinoutDetail }) {
  const router = useRouter()
  const createPinout = useCreatePinout()
  const updatePinout = useUpdatePinout(pinout?.id ?? "")
  const uploadImage = useUploadPinoutImage()
  const uploadPdf = useUploadPinoutPdf()
  // Prefetched by the page — the platform picker's options.
  const { data: platforms } = usePlatforms()

  const platformOptions = useMemo(
    () => (platforms ?? []).map((p) => ({ value: p.id, label: `${p.manufacturer} ${p.name}` })),
    [platforms]
  )

  async function onSubmit(values: PinoutInput) {
    if (pinout) {
      await updatePinout.mutateAsync(values)
      toast.success(ar.pinouts.toasts.updated, { description: values.name })
    } else {
      await createPinout.mutateAsync(values)
      toast.success(ar.pinouts.toasts.created, { description: values.name })
    }
    router.push(ADMIN_ROUTES.pinouts)
  }

  return (
    <>
      <PageHeader
        title={pinout ? `${t.editTitle}: ${pinout.name}` : t.createTitle}
        description={pinout ? undefined : t.createDescription}
        icon={ADMIN_SECTIONS.pinouts.icon}
      />
      <PinoutForm
        defaultValues={pinout ? toFormValues(pinout) : EMPTY}
        onSubmit={onSubmit}
        uploadImage={(file) => uploadImage.mutateAsync(file)}
        uploadPdf={(file) => uploadPdf.mutateAsync(file)}
        submitLabel={pinout ? t.save : t.create}
        cancelHref={ADMIN_ROUTES.pinouts}
        autoSlug={!pinout}
        platformOptions={platformOptions}
        savedPdfHref={pinout?.pdfKey ? { pdfKey: pinout.pdfKey, href: pinoutPdfHref(pinout.id) } : undefined}
      />
    </>
  )
}
