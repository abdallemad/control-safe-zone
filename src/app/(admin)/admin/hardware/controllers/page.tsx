import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";

import { ControllersView } from "@/components/admin/controllers/controllers-view";
import { ADMIN_SECTIONS } from "@/constants/admin-navigation";
import { queryKeys } from "@/constants/query-keys";
import { getQueryClient } from "@/lib/query-client";
import { authService } from "@/services/auth.service";
import { controllerService } from "@/services/controller.service";

export const metadata: Metadata = { title: ADMIN_SECTIONS.controllers.title };

// /admin/hardware/controllers — docs/controllers-admin-feature.md.
// The list is prefetched here (read-only first paint may call a service
// directly — folder-structure.md "Architecture Rules") and hydrated into
// useControllers(), which owns it from then on (refetch after every mutation).
export default async function AdminControllersPage() {
  await authService.requireAdmin();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.controllers.list(),
    queryFn: () => controllerService.list(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ControllersView />
    </HydrationBoundary>
  );
}
