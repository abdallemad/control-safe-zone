import { ar } from "@/messages/ar"
import type { PlatformLinkCounts } from "@/types/platform"

/**
 * "12 كنترول، 3 آي سي" from a platform's non-zero link counts, or `null` when
 * nothing links to it. Shared by platform.service (the refusal) and the
 * delete dialog (the same message, shown before the click).
 */
export function describePlatformLinks(links: PlatformLinkCounts): string | null {
  const labels = ar.platforms.errors.linkLabels
  const parts = (Object.keys(labels) as (keyof PlatformLinkCounts)[])
    .filter((key) => links[key] > 0)
    .map((key) => `${links[key]} ${labels[key]}`)
  return parts.length ? parts.join("، ") : null
}
