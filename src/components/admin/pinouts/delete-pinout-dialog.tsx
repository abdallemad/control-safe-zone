"use client"

import { toast } from "sonner"

import { ConfirmDeleteDialog } from "@/components/admin/shared"
import { useDeletePinout } from "@/hooks/use-pinouts"
import { ar } from "@/messages/ar"
import type { PinoutListItem } from "@/types/pinout"

const t = ar.pinouts.delete

/**
 * Confirm-before-delete for a pinout. Nothing references a pinout (no
 * orders, no links), so there is no blocked state — the dialog only warns
 * that the preview and the PDF go with it.
 */
export function DeletePinoutDialog({
  pinout,
  onOpenChange,
}: {
  pinout: PinoutListItem | null
  onOpenChange: (open: boolean) => void
}) {
  const deletePinout = useDeletePinout()

  function close(open: boolean) {
    if (!open) deletePinout.reset()
    onOpenChange(open)
  }

  async function confirm() {
    if (!pinout) return
    try {
      await deletePinout.mutateAsync(pinout.id)
      toast.success(ar.pinouts.toasts.deleted, { description: pinout.name })
      close(false)
    } catch {
      // Shown inline from deletePinout.error.
    }
  }

  return (
    <ConfirmDeleteDialog
      open={pinout !== null}
      onOpenChange={close}
      title={t.title}
      description={t.description(pinout?.name ?? "")}
      confirmLabel={t.confirm}
      cancelLabel={t.cancel}
      onConfirm={confirm}
      pending={deletePinout.isPending}
      error={deletePinout.error?.message}
    />
  )
}
