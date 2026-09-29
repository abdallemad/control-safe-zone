"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { syncUserAction } from "@/actions/auth/sync-user"
import { queryKeys } from "@/constants/query-keys"

/**
 * Syncs the just-signed-in user with the database, then replaces the URL with
 * their home (/admin or /). A query rather than a mutation: it runs once on
 * mount, is de-duplicated (no double call under StrictMode), and retries a
 * cold database on its own. The sync is idempotent, so a retry is harmless.
 */
export function useAuthCallback() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.auth.callback,
    queryFn: async () => {
      const result = await syncUserAction()
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    retry: 2,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  })

  const redirectTo = query.data?.redirectTo
  useEffect(() => {
    if (!redirectTo) return
    // The sync may have just created the row or promoted the role — drop any
    // cached session so the navbar's admin button reflects it.
    void queryClient.invalidateQueries({ queryKey: [...queryKeys.auth.all, "session"] })
    router.replace(redirectTo)
  }, [redirectTo, router, queryClient])

  return query
}
