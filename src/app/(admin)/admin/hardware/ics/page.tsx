import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";

import { IcsView } from "@/components/admin/ics/ics-view";
import { ADMIN_SECTIONS } from "@/constants/admin-navigation";
import { queryKeys } from "@/constants/query-keys";
import { getQueryClient } from "@/lib/query-client";
import { authService } from "@/services/auth.service";
import { icService } from "@/services/ic.service";

export const metadata: Metadata = { title: ADMIN_SECTIONS.ics.title };

// /admin/hardware/ics — docs/ics-admin-feature.md.
// The list is prefetched here (read-only first paint may call a service
// directly — folder-structure.md "Architecture Rules") and hydrated into
// useIcs(), which owns it from then on (refetch after every mutation).
export default async function AdminIcsPage() {
  await authService.requireAdmin();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.ics.list(),
    queryFn: () => icService.list(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <IcsView />
    </HydrationBoundary>
  );
}
