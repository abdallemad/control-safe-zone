import { isServer, QueryClient } from "@tanstack/react-query"

import { ActionError } from "@/lib/action-result"

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Avoid refetching immediately after hydration.
        staleTime: 60 * 1000,
        // An ActionError is the server's considered answer ("admins only",
        // "not found") — asking again won't change it. Retry only real
        // failures (network, server crash), twice.
        retry: (failureCount, error) => !(error instanceof ActionError) && failureCount < 2,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

/**
 * A fresh client per request on the server (never share cache between
 * users); one long-lived client in the browser, so a suspending render does
 * not throw the cache away.
 */
export function getQueryClient() {
  if (isServer) return makeQueryClient()
  browserQueryClient ??= makeQueryClient()
  return browserQueryClient
}
