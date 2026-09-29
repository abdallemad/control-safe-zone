"use client"

import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { toast } from "sonner"

import { PageHeader } from "@/components/admin/shared"
import { PlatformForm } from "@/components/forms/platform-form"
import { ADMIN_SECTIONS } from "@/constants/admin-navigation"
import { ADMIN_ROUTES } from "@/constants/routes"
import { useCreatePlatform, usePlatforms, useUpdatePlatform } from "@/hooks/use-platforms"
import { ar } from "@/messages/ar"
import type { PlatformInput } from "@/schemas/platform.schema"
import type { PlatformDetail } from "@/types/platform"

const t = ar.platforms.form

const EMPTY: PlatformInput = { manufacturer: "", name: "", slug: "", description: "", isActive: true }

/**
 * Full-page create / edit (/admin/platforms/new, /admin/platforms/[id]/edit).
 * Owns the mutations; PlatformForm stays presentational. Back to the list on save.
 */
export function PlatformEditor({ platform }: { platform?: PlatformDetail }) {
  const router = useRouter()
  const createPlatform = useCreatePlatform()
  const updatePlatform = useUpdatePlatform(platform?.id ?? "")
  // The list is usually cached from the table; its manufacturers become suggestions.
  const { data: platforms } = usePlatforms()

  const manufacturers = useMemo(
    () => [...new Set((platforms ?? []).map((p) => p.manufacturer))].sort(),
    [platforms]
  )

  async function onSubmit(values: PlatformInput) {
    const label = `${values.manufacturer} ${values.name}`
    if (platform) {
      await updatePlatform.mutateAsync(values)
      toast.success(ar.platforms.toasts.updated, { description: label })
    } else {
      await createPlatform.mutateAsync(values)
      toast.success(ar.platforms.toasts.created, { description: label })
    }
    router.push(ADMIN_ROUTES.platforms)
  }

  return (
    <>
      <PageHeader
        title={platform ? `${t.editTitle}: ${platform.manufacturer} ${platform.name}` : t.createTitle}
        description={platform ? undefined : t.createDescription}
        icon={ADMIN_SECTIONS.platforms.icon}
      />
      <PlatformForm
        defaultValues={
          platform
            ? {
                manufacturer: platform.manufacturer,
                name: platform.name,
                slug: platform.slug,
                description: platform.description ?? "",
                isActive: platform.isActive,
              }
            : EMPTY
        }
        onSubmit={onSubmit}
        submitLabel={platform ? t.save : t.create}
        cancelHref={ADMIN_ROUTES.platforms}
        autoSlug={!platform}
        manufacturerSuggestions={manufacturers}
      />
    </>
  )
}
