"use client"

import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { toast } from "sonner"

import { PageHeader } from "@/components/admin/shared"
import { ControllerForm } from "@/components/forms/controller-form"
import { ADMIN_SECTIONS } from "@/constants/admin-navigation"
import { ADMIN_ROUTES } from "@/constants/routes"
import {
  useControllers,
  useCreateController,
  useUpdateController,
  useUploadControllerImage,
} from "@/hooks/use-controllers"
import { usePlatforms } from "@/hooks/use-platforms"
import { ar } from "@/messages/ar"
import type { ControllerInput } from "@/schemas/controller.schema"
import type { ControllerDetail } from "@/types/controller"

const t = ar.controllers.form

const EMPTY: ControllerInput = {
  platformId: "",
  manufacturer: "",
  hardwareNumber: "",
  softwareNumber: "",
  partNumber: "",
  // Starts unset so the admin has to pick one; the schema refuses "".
  condition: "" as ControllerInput["condition"],
  isVirgin: false,
  litres: "",
  serialNumber: "",
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
}

function toFormValues(controller: ControllerDetail): ControllerInput {
  return {
    platformId: controller.platformId,
    manufacturer: controller.manufacturer,
    hardwareNumber: controller.hardwareNumber,
    softwareNumber: controller.softwareNumber ?? "",
    partNumber: controller.partNumber ?? "",
    condition: controller.condition,
    isVirgin: controller.isVirgin,
    litres: controller.litres ?? "",
    serialNumber: controller.serialNumber ?? "",
    name: controller.name,
    slug: controller.slug,
    description: controller.description ?? "",
    imageUrl: controller.imageUrl,
    price: controller.price,
    compareAtPrice: controller.compareAtPrice ?? "",
    stockQuantity: controller.stockQuantity,
    lowStockThreshold: controller.lowStockThreshold,
    isFeatured: controller.isFeatured,
    isActive: controller.isActive,
  }
}

/**
 * Full-page create / edit (/admin/hardware/controllers/new,
 * /admin/hardware/controllers/[id]/edit). Owns the mutations; ControllerForm
 * stays presentational. Back to the list on save.
 */
export function ControllerEditor({ controller }: { controller?: ControllerDetail }) {
  const router = useRouter()
  const createController = useCreateController()
  const updateController = useUpdateController(controller?.id ?? "")
  const uploadImage = useUploadControllerImage()
  // Prefetched by the page — the platform picker's options (and their makers).
  const { data: platforms } = usePlatforms()
  // Usually cached from the table; its ECU makers become suggestions.
  const { data: controllers } = useControllers()

  const platformOptions = useMemo(
    () =>
      (platforms ?? []).map((p) => ({
        value: p.id,
        label: `${p.manufacturer} ${p.name}`,
        manufacturer: p.manufacturer,
      })),
    [platforms]
  )
  const manufacturers = useMemo(
    () =>
      [...new Set([...(controllers ?? []).map((c) => c.manufacturer), ...(platforms ?? []).map((p) => p.manufacturer)])].sort(),
    [controllers, platforms]
  )

  async function onSubmit(values: ControllerInput) {
    if (controller) {
      await updateController.mutateAsync(values)
      toast.success(ar.controllers.toasts.updated, { description: values.hardwareNumber })
    } else {
      await createController.mutateAsync(values)
      toast.success(ar.controllers.toasts.created, { description: values.hardwareNumber })
    }
    router.push(ADMIN_ROUTES.controllers)
  }

  return (
    <>
      <PageHeader
        title={controller ? `${t.editTitle}: ${controller.hardwareNumber}` : t.createTitle}
        description={controller ? undefined : t.createDescription}
        icon={ADMIN_SECTIONS.controllers.icon}
      />
      <ControllerForm
        defaultValues={controller ? toFormValues(controller) : EMPTY}
        onSubmit={onSubmit}
        uploadImage={(file) => uploadImage.mutateAsync(file)}
        submitLabel={controller ? t.save : t.create}
        cancelHref={ADMIN_ROUTES.controllers}
        autoSlug={!controller}
        platformOptions={platformOptions}
        manufacturerSuggestions={manufacturers}
      />
    </>
  )
}
