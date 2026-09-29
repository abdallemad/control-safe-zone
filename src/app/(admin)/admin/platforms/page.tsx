import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";

import { PlatformsView } from "@/components/admin/platforms/platforms-view";
import { ADMIN_SECTIONS } from "@/constants/admin-navigation";
import { queryKeys } from "@/constants/query-keys";
import { getQueryClient } from "@/lib/query-client";
import { authService } from "@/services/auth.service";
import { platformService } from "@/services/platform.service";

export const metadata: Metadata = { title: ADMIN_SECTIONS.platforms.title };

// /admin/platforms — docs/controller-platforms-feature.md.
// Prefetched here (read-only first paint may call a service directly) and
// hydrated into usePlatforms(), which owns it from then on.
export default async function AdminPlatformsPage() {
  await authService.requireAdmin();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.platforms.list(),
    queryFn: () => platformService.list(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PlatformsView />
    </HydrationBoundary>
  );
}
