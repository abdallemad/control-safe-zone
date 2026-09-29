import "server-only"

import { adminEmails } from "@/lib/env"
import { isPrismaError } from "@/lib/prisma-errors"
import { userRepository } from "@/repositories/user.repository"
import type { ClerkIdentity, SessionUser } from "@/types/user"

// Egyptian mobile, normalised — the format `User.phone` promises.
const EGYPT_MOBILE = /^\+201[0125]\d{8}$/

/**
 * Make the database agree with Clerk about who this person is. Called on
 * every sign-in (via /auth-callback), so it must be idempotent.
 *
 * - Found by `clerkId` → refresh email / name (Clerk owns identity).
 * - Else found by email → claim that row (a user seeded by email, e.g. the
 *   first admin, gets linked on first sign-in). Safe because the identity's
 *   email is verified by Clerk.
 * - Else → create a CUSTOMER.
 *
 * Role is owned by the database. The only automatic change is *promotion* to
 * ADMIN when the email is listed in `ADMIN_EMAILS`; nothing here demotes.
 * A phone is only written when Clerk has a valid Egyptian mobile, so a phone
 * the user typed at checkout is never wiped by a sign-in.
 */
async function syncFromIdentity(identity: ClerkIdentity): Promise<SessionUser> {
  const profile = {
    clerkId: identity.clerkId,
    email: identity.email,
    fullName: identity.fullName,
    ...(identity.phone && EGYPT_MOBILE.test(identity.phone) && { phone: identity.phone }),
  }
  const isListedAdmin = adminEmails.has(identity.email)

  const existing =
    (await userRepository.findByClerkId(identity.clerkId)) ??
    (await userRepository.findByEmail(identity.email))

  if (existing) {
    return userRepository.update(existing.id, {
      ...profile,
      ...(isListedAdmin && existing.role !== "ADMIN" && { role: "ADMIN" }),
    })
  }

  try {
    return await userRepository.create({
      ...profile,
      role: isListedAdmin ? "ADMIN" : "CUSTOMER",
    })
  } catch (error) {
    // Two tabs finishing sign-in together: the other request created the row
    // between our lookup and our insert — use that one.
    if (isPrismaError(error, "P2002")) {
      const created = await userRepository.findByClerkId(identity.clerkId)
      if (created) return created
    }
    throw error
  }
}

export const userService = {
  syncFromIdentity,
}
