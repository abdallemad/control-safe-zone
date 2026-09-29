"use client"

import { QueryClientProvider } from "@tanstack/react-query"

import { getQueryClient } from "@/lib/query-client"

/** React Query for every hook in `src/hooks/`. Mounted once, in the root layout. */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
