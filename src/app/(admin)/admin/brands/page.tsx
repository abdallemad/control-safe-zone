import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";

import { BrandsView } from "@/components/admin/brands/brands-view";
import { ADMIN_SECTIONS } from "@/constants/admin-navigation";
import { queryKeys } from "@/constants/query-keys";
import { getQueryClient } from "@/lib/query-client";
import { authService } from "@/services/auth.service";
import { brandService } from "@/services/brand.service";

export const metadata: Metadata = { title: ADMIN_SECTIONS.brands.title };

// /admin/brands — docs/brands-feature.md.
// The list is prefetched here (read-only first paint may call a service
// directly — folder-structure.md "Architecture Rules") and hydrated into
// useBrands(), which owns it from then on (refetch after every mutation).
export default async function AdminBrandsPage() {
  await authService.requireAdmin();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.brands.list(),
    queryFn: () => brandService.list(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BrandsView />
    </HydrationBoundary>
  );
}
