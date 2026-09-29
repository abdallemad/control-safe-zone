import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";

import { ProgrammersView } from "@/components/admin/programmers/programmers-view";
import { ADMIN_SECTIONS } from "@/constants/admin-navigation";
import { queryKeys } from "@/constants/query-keys";
import { getQueryClient } from "@/lib/query-client";
import { authService } from "@/services/auth.service";
import { programmerService } from "@/services/programmer.service";

export const metadata: Metadata = { title: ADMIN_SECTIONS.programmers.title };

// /admin/hardware/programmers — docs/programmers-admin-feature.md.
// The list is prefetched here (read-only first paint may call a service
// directly — folder-structure.md "Architecture Rules") and hydrated into
// useProgrammers(), which owns it from then on (refetch after every mutation).
export default async function AdminProgrammersPage() {
  await authService.requireAdmin();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.programmers.list(),
    queryFn: () => programmerService.list(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProgrammersView />
    </HydrationBoundary>
  );
}
