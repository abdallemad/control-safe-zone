"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { createBrandAction } from "@/actions/brand/create-brand"
import { deleteBrandAction } from "@/actions/brand/delete-brand"
import { listBrandsAction } from "@/actions/brand/list-brands"
import { updateBrandAction } from "@/actions/brand/update-brand"
import { uploadBrandLogoAction } from "@/actions/brand/upload-brand-logo"
import { queryKeys } from "@/constants/query-keys"
import { unwrap } from "@/lib/action-result"
import type { BrandInput } from "@/schemas/brand.schema"

// Brands — the UI's only way to the data (docs/brands-feature.md). Errors
// surface as ActionError (Arabic message + fieldErrors) via `unwrap`.

/** The admin table. The page prefetches it on the server, so this hydrates. */
export function useBrands() {
  return useQuery({
    queryKey: queryKeys.brands.list(),
    queryFn: async () => unwrap(await listBrandsAction()),
  })
}

function useInvalidateBrands() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.brands.all })
}

export function useCreateBrand() {
  const invalidate = useInvalidateBrands()
  return useMutation({
    mutationFn: async (input: BrandInput) => unwrap(await createBrandAction(input)),
    onSuccess: invalidate,
  })
}

export function useUpdateBrand(id: string) {
  const invalidate = useInvalidateBrands()
  return useMutation({
    mutationFn: async (input: BrandInput) => unwrap(await updateBrandAction(id, input)),
    onSuccess: invalidate,
  })
}

export function useDeleteBrand() {
  const invalidate = useInvalidateBrands()
  return useMutation({
    mutationFn: async (id: string) => unwrap(await deleteBrandAction(id)),
    onSuccess: invalidate,
  })
}

/** File → R2 → URL for the form's logo field. */
export function useUploadBrandLogo() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      return unwrap(await uploadBrandLogoAction(formData)).url
    },
  })
}
