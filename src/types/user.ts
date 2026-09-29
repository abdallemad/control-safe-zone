import type { Role } from "@/generated/prisma"

/**
 * Who Clerk says is signed in, reduced to what the store needs. Built by
 * `auth.service.ts` — the only file that reads Clerk's user object — so the
 * rest of the app never depends on Clerk's shape.
 */
export type ClerkIdentity = {
  clerkId: string
  /** Primary email, verified, lower-cased. */
  email: string
  fullName: string
  /** Primary phone in E.164 (`+201…`), when Clerk has one. */
  phone: string | null
}

/** The signed-in user as the app sees it — a DTO, safe to hand to the UI. */
export type SessionUser = {
  id: string
  clerkId: string
  email: string
  fullName: string
  role: Role
}

export type AuthCallbackResult = {
  role: Role
  redirectTo: string
}

/** What the storefront chrome needs about the signed-in user (navbar). */
export type SessionSummary = Pick<SessionUser, "fullName" | "role">
