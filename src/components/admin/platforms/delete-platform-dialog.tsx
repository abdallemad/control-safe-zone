"use client"

import { toast } from "sonner"

import { ConfirmDeleteDialog, Ltr } from "@/components/admin/shared"
import { useDeletePlatform } from "@/hooks/use-platforms"
import { ar } from "@/messages/ar"
import type { PlatformListItem } from "@/types/platform"
import { describePlatformLinks } from "@/utils/describe-platform-links"

const t = ar.platforms.delete

/**
 * Confirm-before-delete for a platform. Anything linked to it (controllers,
 * ICs, programmers, pinouts) blocks the delete — named up front with the
 * button disabled; the service enforces the same rule if the list was stale.
 */
export function DeletePlatformDialog({
  platform,
  onOpenChange,
}: {
  platform: PlatformListItem | null
  onOpenChange: (open: boolean) => void
}) {
  const deletePlatform = useDeletePlatform()
  const links = platform ? describePlatformLinks(platform.links) : null

  function close(open: boolean) {
    if (!open) deletePlatform.reset()
    onOpenChange(open)
  }

  async function confirm() {
    if (!platform) return
    try {
      await deletePlatform.mutateAsync(platform.id)
      toast.success(ar.platforms.toasts.deleted, { description: platform.name })
      close(false)
    } catch {
      // Shown inline from deletePlatform.error.
    }
  }

  return (
    <ConfirmDeleteDialog
      open={platform !== null}
      onOpenChange={close}
      title={t.title}
      description={
        <>
          {t.description(platform ? `${platform.manufacturer} ${platform.name}` : "")}{" "}
          {platform && <Ltr mono className="text-xs">/{platform.slug}</Ltr>}
        </>
      }
      confirmLabel={t.confirm}
      cancelLabel={t.cancel}
      onConfirm={confirm}
      pending={deletePlatform.isPending}
      blockedReason={links ? ar.platforms.errors.inUse(links) : null}
      error={deletePlatform.error?.message}
    />
  )
}
