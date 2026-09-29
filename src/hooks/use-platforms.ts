"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { createPlatformAction } from "@/actions/platform/create-platform"
import { deletePlatformAction } from "@/actions/platform/delete-platform"
import { listPlatformsAction } from "@/actions/platform/list-platforms"
import { updatePlatformAction } from "@/actions/platform/update-platform"
import { queryKeys } from "@/constants/query-keys"
import { unwrap } from "@/lib/action-result"
import type { PlatformInput } from "@/schemas/platform.schema"

// Controller platforms — the UI's only way to the data
// (docs/controller-platforms-feature.md). Same shape as use-brands.ts.

/** The admin table; also feeds the form's manufacturer suggestions. */
export function usePlatforms() {
  return useQuery({
    queryKey: queryKeys.platforms.list(),
    queryFn: async () => unwrap(await listPlatformsAction()),
  })
}

function useInvalidatePlatforms() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.platforms.all })
}

export function useCreatePlatform() {
  const invalidate = useInvalidatePlatforms()
  return useMutation({
    mutationFn: async (input: PlatformInput) => unwrap(await createPlatformAction(input)),
    onSuccess: invalidate,
  })
}

export function useUpdatePlatform(id: string) {
  const invalidate = useInvalidatePlatforms()
  return useMutation({
    mutationFn: async (input: PlatformInput) => unwrap(await updatePlatformAction(id, input)),
    onSuccess: invalidate,
  })
}

export function useDeletePlatform() {
  const invalidate = useInvalidatePlatforms()
  return useMutation({
    mutationFn: async (id: string) => unwrap(await deletePlatformAction(id)),
    onSuccess: invalidate,
  })
}
