"use client"

import { Loader2, Trash2, TriangleAlert } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/**
 * The admin's confirm-before-delete. Entity dialogs (DeleteBrandDialog,
 * DeletePlatformDialog…) wrap it with their strings and mutation.
 *
 * `blockedReason` — known up front that the delete will be refused (e.g. the
 * row still has links): shown, and the button is disabled. The service
 * enforces the same rule regardless. `error` — the mutation's failure.
 */
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  pending = false,
  blockedReason,
  error,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: React.ReactNode
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  pending?: boolean
  blockedReason?: string | null
  error?: string | null
}) {
  const message = blockedReason || error

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {message && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{cancelLabel}</DialogClose>
          <Button variant="destructive" onClick={onConfirm} disabled={Boolean(blockedReason) || pending}>
            {pending ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <Trash2 data-icon="inline-start" />
            )}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
