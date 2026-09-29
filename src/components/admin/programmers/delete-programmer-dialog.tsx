"use client"

import { toast } from "sonner"

import { ConfirmDeleteDialog, Ltr } from "@/components/admin/shared"
import { useDeleteProgrammer } from "@/hooks/use-programmers"
import { ar } from "@/messages/ar"
import type { ProgrammerListItem } from "@/types/programmer"

const t = ar.programmers.delete

/**
 * Confirm-before-delete for a programmer. One that appears in any order
 * can't be deleted — the dialog says so up front and disables the button;
 * the service enforces the same rule if the list was stale.
 */
export function DeleteProgrammerDialog({
  programmer,
  onOpenChange,
}: {
  programmer: ProgrammerListItem | null
  onOpenChange: (open: boolean) => void
}) {
  const deleteProgrammer = useDeleteProgrammer()

  function close(open: boolean) {
    if (!open) deleteProgrammer.reset()
    onOpenChange(open)
  }

  async function confirm() {
    if (!programmer) return
    try {
      await deleteProgrammer.mutateAsync(programmer.id)
      toast.success(ar.programmers.toasts.deleted, { description: programmer.toolName })
      close(false)
    } catch {
      // Shown inline from deleteProgrammer.error.
    }
  }

  return (
    <ConfirmDeleteDialog
      open={programmer !== null}
      onOpenChange={close}
      title={t.title}
      description={
        <>
          {t.description(programmer?.name ?? "")}{" "}
          {programmer && <Ltr mono className="text-xs">{programmer.toolName}</Ltr>}
        </>
      }
      confirmLabel={t.confirm}
      cancelLabel={t.cancel}
      onConfirm={confirm}
      pending={deleteProgrammer.isPending}
      blockedReason={
        programmer && programmer.ordersCount > 0 ? ar.programmers.errors.inOrders(programmer.ordersCount) : null
      }
      error={deleteProgrammer.error?.message}
    />
  )
}
