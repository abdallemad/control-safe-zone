"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { createControllerAction } from "@/actions/controller/create-controller"
import { deleteControllerAction } from "@/actions/controller/delete-controller"
import { listControllersAction } from "@/actions/controller/list-controllers"
import { updateControllerAction } from "@/actions/controller/update-controller"
import { uploadControllerImageAction } from "@/actions/controller/upload-controller-image"
import { queryKeys } from "@/constants/query-keys"
import { unwrap } from "@/lib/action-result"
import type { ControllerInput } from "@/schemas/controller.schema"

// Controllers — the UI's only way to the data
// (docs/controllers-admin-feature.md). Same shape as use-programmers.ts.

/** The admin table. The page prefetches it on the server, so this hydrates. */
export function useControllers() {
  return useQuery({
    queryKey: queryKeys.controllers.list(),
    queryFn: async () => unwrap(await listControllersAction()),
  })
}

/** Controllers, and platforms too: their table counts the units on each (and blocks delete by it). */
function useInvalidateControllers() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.controllers.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.platforms.all }),
    ])
}

export function useCreateController() {
  const invalidate = useInvalidateControllers()
  return useMutation({
    mutationFn: async (input: ControllerInput) => unwrap(await createControllerAction(input)),
    onSuccess: invalidate,
  })
}

export function useUpdateController(id: string) {
  const invalidate = useInvalidateControllers()
  return useMutation({
    mutationFn: async (input: ControllerInput) => unwrap(await updateControllerAction(id, input)),
    onSuccess: invalidate,
  })
}

export function useDeleteController() {
  const invalidate = useInvalidateControllers()
  return useMutation({
    mutationFn: async (id: string) => unwrap(await deleteControllerAction(id)),
    onSuccess: invalidate,
  })
}

/** File → R2 → URL for the form's cover image. */
export function useUploadControllerImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      return unwrap(await uploadControllerImageAction(formData)).url
    },
  })
}
