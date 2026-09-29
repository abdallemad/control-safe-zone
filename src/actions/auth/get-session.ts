"use server"

import { ar } from "@/messages/ar"
import { authService } from "@/services/auth.service"
import type { ActionResult } from "@/types/action-result"
import type { SessionSummary } from "@/types/user"

/**
 * Name and role of the signed-in user, for the storefront chrome (the
 * navbar's admin button). `null` when signed out or not synced yet.
 * Display only — access to /admin is enforced by `requireAdmin()` on the page.
 */
export async function getSessionAction(): Promise<ActionResult<SessionSummary | null>> {
  try {
    const user = await authService.getCurrentUser()
    return { ok: true, data: user && { fullName: user.fullName, role: user.role } }
  } catch (error) {
    console.error("[getSessionAction]", error)
    return { ok: false, error: ar.errors.syncFailed }
  }
}
