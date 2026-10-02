"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { createPinoutAction } from "@/actions/pinout/create-pinout"
import { deletePinoutAction } from "@/actions/pinout/delete-pinout"
import { listPinoutsAction } from "@/actions/pinout/list-pinouts"
import { updatePinoutAction } from "@/actions/pinout/update-pinout"
import { uploadPinoutImageAction } from "@/actions/pinout/upload-pinout-image"
import { uploadPinoutPdfAction } from "@/actions/pinout/upload-pinout-pdf"
import { queryKeys } from "@/constants/query-keys"
import { unwrap } from "@/lib/action-result"
import type { PinoutInput } from "@/schemas/pinout.schema"

// Pinouts — the UI's only way to the data
// (docs/pinouts-admin-feature.md). Same shape as use-controllers.ts, plus a
// PDF upload next to the image upload.

/** The admin table. The page prefetches it on the server, so this hydrates. */
export function usePinouts() {
  return useQuery({
    queryKey: queryKeys.pinouts.list(),
    queryFn: async () => unwrap(await listPinoutsAction()),
  })
}

/** Pinouts, and platforms too: their table counts the pinouts on each (and blocks delete by it). */
function useInvalidatePinouts() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.pinouts.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.platforms.all }),
    ])
}

export function useCreatePinout() {
  const invalidate = useInvalidatePinouts()
  return useMutation({
    mutationFn: async (input: PinoutInput) => unwrap(await createPinoutAction(input)),
    onSuccess: invalidate,
  })
}

export function useUpdatePinout(id: string) {
  const invalidate = useInvalidatePinouts()
  return useMutation({
    mutationFn: async (input: PinoutInput) => unwrap(await updatePinoutAction(id, input)),
    onSuccess: invalidate,
  })
}

export function useDeletePinout() {
  const invalidate = useInvalidatePinouts()
  return useMutation({
    mutationFn: async (id: string) => unwrap(await deletePinoutAction(id)),
    onSuccess: invalidate,
  })
}

function fileForm(file: File) {
  const formData = new FormData()
  formData.append("file", file)
  return formData
}

/** File → R2 → URL for the form's preview image. */
export function useUploadPinoutImage() {
  return useMutation({
    mutationFn: async (file: File) => unwrap(await uploadPinoutImageAction(fileForm(file))).url,
  })
}

/** File → private R2 → key for the form's PDF. */
export function useUploadPinoutPdf() {
  return useMutation({
    mutationFn: async (file: File) => unwrap(await uploadPinoutPdfAction(fileForm(file))).key,
  })
}
