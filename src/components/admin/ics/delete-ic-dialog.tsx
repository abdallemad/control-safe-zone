"use client"

import { toast } from "sonner"

import { ConfirmDeleteDialog, Ltr } from "@/components/admin/shared"
import { useDeleteIc } from "@/hooks/use-ics"
import { ar } from "@/messages/ar"
import type { IcListItem } from "@/types/ic"

const t = ar.ics.delete

/**
 * Confirm-before-delete for an IC. One that appears in any order can't be
 * deleted — the dialog says so up front and disables the button; the service
 * enforces the same rule if the list was stale.
 */
export function DeleteIcDialog({
  ic,
  onOpenChange,
}: {
  ic: IcListItem | null
  onOpenChange: (open: boolean) => void
}) {
  const deleteIc = useDeleteIc()

  function close(open: boolean) {
    if (!open) deleteIc.reset()
    onOpenChange(open)
  }

  async function confirm() {
    if (!ic) return
    try {
      await deleteIc.mutateAsync(ic.id)
      toast.success(ar.ics.toasts.deleted, { description: ic.partNumber })
      close(false)
    } catch {
      // Shown inline from deleteIc.error.
    }
  }

  return (
    <ConfirmDeleteDialog
      open={ic !== null}
      onOpenChange={close}
      title={t.title}
      description={
        <>
          {t.description(ic?.name ?? "")}{" "}
          {ic && <Ltr mono className="text-xs">{ic.partNumber}</Ltr>}
        </>
      }
      confirmLabel={t.confirm}
      cancelLabel={t.cancel}
      onConfirm={confirm}
      pending={deleteIc.isPending}
      blockedReason={ic && ic.ordersCount > 0 ? ar.ics.errors.inOrders(ic.ordersCount) : null}
      error={deleteIc.error?.message}
    />
  )
}
