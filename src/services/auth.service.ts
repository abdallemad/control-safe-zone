import "server-only"

import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { cache } from "react"

import { ROUTES } from "@/constants/routes"
import { userRepository } from "@/repositories/user.repository"
import type { ClerkIdentity, SessionUser } from "@/types/user"

// The session side of auth — the one file that talks to Clerk on the server.
// Everything else asks this service "who is signed in?" and gets our types.
//
// It is the Data Access Layer from the Next.js auth guide
// (node_modules/next/dist/docs/01-app/02-guides/authentication.md): checks run
// here, next to the data, not in layouts — a layout does not re-run on
// navigation and does not stop its children from rendering.

/**
 * The signed-in Clerk user, reduced to `ClerkIdentity`. `null` when signed
 * out, or when the account has no verified primary email (the store's `User`
 * is keyed by it).
 */
async function getIdentity(): Promise<ClerkIdentity | null> {
  const user = await currentUser()
  if (!user) return null

  const primaryEmail = user.primaryEmailAddress
  if (!primaryEmail || primaryEmail.verification?.status !== "verified") return null
  const email = primaryEmail.emailAddress.toLowerCase()

  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.username ||
    email.split("@")[0]

  return {
    clerkId: user.id,
    email,
    fullName,
    phone: user.primaryPhoneNumber?.phoneNumber ?? null,
  }
}

/**
 * The store's user for this request, or `null` (signed out, or signed in but
 * not synced yet). Memoised per render pass.
 */
const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const { userId } = await auth()
  if (!userId) return null
  return userRepository.findByClerkId(userId)
})

/**
 * Gate for pages that need *a* signed-in person (/auth-callback, later
 * /account and /checkout). Signed out → Clerk's sign-in, then back here.
 * Returns the Clerk user id.
 */
async function requireSignedIn(): Promise<string> {
  const { userId } = await auth.protect()
  return userId
}

/**
 * Gate for admin pages and admin Server Actions. Redirects instead of
 * returning when the check fails:
 * signed out → sign-in, not synced yet → /auth-callback, customer → home.
 */
async function requireAdmin(): Promise<SessionUser> {
  await requireSignedIn()

  const user = await getCurrentUser()
  if (!user) redirect(ROUTES.authCallback)
  if (user.role !== "ADMIN") redirect(ROUTES.home)

  return user
}

/**
 * For Server Actions (which must *return* an error, not redirect): the
 * signed-in admin, or `null` for anyone else. Every admin action starts with
 * `if (!(await authService.getAdmin())) return forbidden`.
 */
async function getAdmin(): Promise<SessionUser | null> {
  const user = await getCurrentUser()
  return user?.role === "ADMIN" ? user : null
}

export const authService = {
  getIdentity,
  getCurrentUser,
  getAdmin,
  requireSignedIn,
  requireAdmin,
}
