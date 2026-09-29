"use client"

import { toast } from "sonner"

import { ConfirmDeleteDialog, Ltr } from "@/components/admin/shared"
import { useDeleteBrand } from "@/hooks/use-brands"
import { ar } from "@/messages/ar"
import type { BrandListItem } from "@/types/brand"

const t = ar.brands.delete

/**
 * Confirm-before-delete for a brand. A brand with vehicle models can't be
 * deleted — the dialog says so up front and disables the button; the service
 * enforces the same rule if the list was stale.
 */
export function DeleteBrandDialog({
  brand,
  onOpenChange,
}: {
  brand: BrandListItem | null
  onOpenChange: (open: boolean) => void
}) {
  const deleteBrand = useDeleteBrand()

  function close(open: boolean) {
    if (!open) deleteBrand.reset()
    onOpenChange(open)
  }

  async function confirm() {
    if (!brand) return
    try {
      await deleteBrand.mutateAsync(brand.id)
      toast.success(ar.brands.toasts.deleted, { description: brand.name })
      close(false)
    } catch {
      // Shown inline from deleteBrand.error.
    }
  }

  return (
    <ConfirmDeleteDialog
      open={brand !== null}
      onOpenChange={close}
      title={t.title}
      description={
        <>
          {t.description(brand?.name ?? "")}{" "}
          {brand && <Ltr mono className="text-xs">/{brand.slug}</Ltr>}
        </>
      }
      confirmLabel={t.confirm}
      cancelLabel={t.cancel}
      onConfirm={confirm}
      pending={deleteBrand.isPending}
      blockedReason={brand && brand.modelsCount > 0 ? ar.brands.errors.hasModels(brand.modelsCount) : null}
      error={deleteBrand.error?.message}
    />
  )
}
