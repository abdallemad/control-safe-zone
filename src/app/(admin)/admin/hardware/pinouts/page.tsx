import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";

import { PinoutsView } from "@/components/admin/pinouts/pinouts-view";
import { ADMIN_SECTIONS } from "@/constants/admin-navigation";
import { queryKeys } from "@/constants/query-keys";
import { getQueryClient } from "@/lib/query-client";
import { authService } from "@/services/auth.service";
import { pinoutService } from "@/services/pinout.service";

export const metadata: Metadata = { title: ADMIN_SECTIONS.pinouts.title };

// /admin/hardware/pinouts — docs/pinouts-admin-feature.md.
// The list is prefetched here (read-only first paint may call a service
// directly — folder-structure.md "Architecture Rules") and hydrated into
// usePinouts(), which owns it from then on (refetch after every mutation).
export default async function AdminPinoutsPage() {
  await authService.requireAdmin();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.pinouts.list(),
    queryFn: () => pinoutService.list(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PinoutsView />
    </HydrationBoundary>
  );
}
