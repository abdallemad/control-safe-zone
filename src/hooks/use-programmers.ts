"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { createProgrammerAction } from "@/actions/programmer/create-programmer"
import { deleteProgrammerAction } from "@/actions/programmer/delete-programmer"
import { listProgrammersAction } from "@/actions/programmer/list-programmers"
import { updateProgrammerAction } from "@/actions/programmer/update-programmer"
import { uploadProgrammerImageAction } from "@/actions/programmer/upload-programmer-image"
import { queryKeys } from "@/constants/query-keys"
import { unwrap } from "@/lib/action-result"
import type { ProgrammerInput } from "@/schemas/programmer.schema"

// Programmers — the UI's only way to the data
// (docs/programmers-admin-feature.md). Same shape as use-ics.ts.

/** The admin table. The page prefetches it on the server, so this hydrates. */
export function useProgrammers() {
  return useQuery({
    queryKey: queryKeys.programmers.list(),
    queryFn: async () => unwrap(await listProgrammersAction()),
  })
}

/** Programmers, and platforms too: their table counts the programmers linked to each. */
function useInvalidateProgrammers() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.programmers.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.platforms.all }),
    ])
}

export function useCreateProgrammer() {
  const invalidate = useInvalidateProgrammers()
  return useMutation({
    mutationFn: async (input: ProgrammerInput) => unwrap(await createProgrammerAction(input)),
    onSuccess: invalidate,
  })
}

export function useUpdateProgrammer(id: string) {
  const invalidate = useInvalidateProgrammers()
  return useMutation({
    mutationFn: async (input: ProgrammerInput) => unwrap(await updateProgrammerAction(id, input)),
    onSuccess: invalidate,
  })
}

export function useDeleteProgrammer() {
  const invalidate = useInvalidateProgrammers()
  return useMutation({
    mutationFn: async (id: string) => unwrap(await deleteProgrammerAction(id)),
    onSuccess: invalidate,
  })
}

/** File → R2 → URL for the form's cover image. */
export function useUploadProgrammerImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      return unwrap(await uploadProgrammerImageAction(formData)).url
    },
  })
}
