"use client"

import { toast } from "sonner"

import { ConfirmDeleteDialog, Ltr } from "@/components/admin/shared"
import { useDeleteController } from "@/hooks/use-controllers"
import { ar } from "@/messages/ar"
import type { ControllerListItem } from "@/types/controller"

const t = ar.controllers.delete

/**
 * Confirm-before-delete for a controller. One that appears in any order
 * can't be deleted — the dialog says so up front and disables the button;
 * the service enforces the same rule if the list was stale.
 */
export function DeleteControllerDialog({
  controller,
  onOpenChange,
}: {
  controller: ControllerListItem | null
  onOpenChange: (open: boolean) => void
}) {
  const deleteController = useDeleteController()

  function close(open: boolean) {
    if (!open) deleteController.reset()
    onOpenChange(open)
  }

  async function confirm() {
    if (!controller) return
    try {
      await deleteController.mutateAsync(controller.id)
      toast.success(ar.controllers.toasts.deleted, { description: controller.hardwareNumber })
      close(false)
    } catch {
      // Shown inline from deleteController.error.
    }
  }

  return (
    <ConfirmDeleteDialog
      open={controller !== null}
      onOpenChange={close}
      title={t.title}
      description={
        <>
          {t.description(controller?.name ?? "")}{" "}
          {controller && <Ltr mono className="text-xs">{controller.hardwareNumber}</Ltr>}
        </>
      }
      confirmLabel={t.confirm}
      cancelLabel={t.cancel}
      onConfirm={confirm}
      pending={deleteController.isPending}
      blockedReason={
        controller && controller.ordersCount > 0 ? ar.controllers.errors.inOrders(controller.ordersCount) : null
      }
      error={deleteController.error?.message}
    />
  )
}
