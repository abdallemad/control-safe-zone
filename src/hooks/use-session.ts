"use client"

import { useAuth } from "@clerk/nextjs"
import { useQuery } from "@tanstack/react-query"

import { getSessionAction } from "@/actions/auth/get-session"
import { queryKeys } from "@/constants/query-keys"

/**
 * The signed-in user's name and role from *our* database (Clerk does not
 * know roles). Runs only when Clerk has a user, and the key includes the
 * Clerk id, so it refetches on sign-in, sign-out and account switch.
 */
export function useSession() {
  const { isLoaded, userId } = useAuth()

  const query = useQuery({
    queryKey: queryKeys.auth.session(userId ?? "signed-out"),
    queryFn: async () => {
      const result = await getSessionAction()
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    enabled: isLoaded && Boolean(userId),
    staleTime: 5 * 60 * 1000,
  })

  return {
    ...query,
    session: userId ? query.data ?? null : null,
    isAdmin: Boolean(userId) && query.data?.role === "ADMIN",
  }
}
