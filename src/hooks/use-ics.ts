"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { createIcAction } from "@/actions/ic/create-ic"
import { deleteIcAction } from "@/actions/ic/delete-ic"
import { listIcsAction } from "@/actions/ic/list-ics"
import { updateIcAction } from "@/actions/ic/update-ic"
import { uploadIcImageAction } from "@/actions/ic/upload-ic-image"
import { queryKeys } from "@/constants/query-keys"
import { unwrap } from "@/lib/action-result"
import type { IcInput } from "@/schemas/ic.schema"

// ICs — the UI's only way to the data (docs/ics-admin-feature.md). Same
// shape as use-brands.ts.

/** The admin table. The page prefetches it on the server, so this hydrates. */
export function useIcs() {
  return useQuery({
    queryKey: queryKeys.ics.list(),
    queryFn: async () => unwrap(await listIcsAction()),
  })
}

/** ICs, and platforms too: their table counts the ICs linked to each. */
function useInvalidateIcs() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.ics.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.platforms.all }),
    ])
}

export function useCreateIc() {
  const invalidate = useInvalidateIcs()
  return useMutation({
    mutationFn: async (input: IcInput) => unwrap(await createIcAction(input)),
    onSuccess: invalidate,
  })
}

export function useUpdateIc(id: string) {
  const invalidate = useInvalidateIcs()
  return useMutation({
    mutationFn: async (input: IcInput) => unwrap(await updateIcAction(id, input)),
    onSuccess: invalidate,
  })
}

export function useDeleteIc() {
  const invalidate = useInvalidateIcs()
  return useMutation({
    mutationFn: async (id: string) => unwrap(await deleteIcAction(id)),
    onSuccess: invalidate,
  })
}

/** File → R2 → URL for the form's cover image. */
export function useUploadIcImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      return unwrap(await uploadIcImageAction(formData)).url
    },
  })
}
