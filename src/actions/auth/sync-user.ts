"use server"

import { auth } from "@clerk/nextjs/server"

import { HOME_BY_ROLE } from "@/constants/routes"
import { ar } from "@/messages/ar"
import { authService } from "@/services/auth.service"
import { userService } from "@/services/user.service"
import type { ActionResult } from "@/types/action-result"
import type { AuthCallbackResult } from "@/types/user"

/**
 * Called by /auth-callback right after Clerk signs someone in: creates or
 * refreshes their `User` row and says where to send them — /admin for an
 * admin, / for everyone else.
 */
export async function syncUserAction(): Promise<ActionResult<AuthCallbackResult>> {
  const { userId } = await auth()
  if (!userId) return { ok: false, error: ar.errors.unauthenticated }

  try {
    const identity = await authService.getIdentity()
    if (!identity) return { ok: false, error: ar.errors.noVerifiedEmail }

    const user = await userService.syncFromIdentity(identity)
    return { ok: true, data: { role: user.role, redirectTo: HOME_BY_ROLE[user.role] } }
  } catch (error) {
    console.error("[syncUserAction]", error)
    return { ok: false, error: ar.errors.syncFailed }
  }
}
