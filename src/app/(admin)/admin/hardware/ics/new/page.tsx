import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";

import { IcEditor } from "@/components/admin/ics/ic-editor";
import { queryKeys } from "@/constants/query-keys";
import { getQueryClient } from "@/lib/query-client";
import { ar } from "@/messages/ar";
import { authService } from "@/services/auth.service";
import { platformService } from "@/services/platform.service";

export const metadata: Metadata = { title: ar.ics.form.createTitle };

// /admin/hardware/ics/new — full-page create (docs/ics-admin-feature.md).
// Prefetches the platforms so the platform picker is filled at first paint.
export default async function AdminNewIcPage() {
  await authService.requireAdmin();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.platforms.list(),
    queryFn: () => platformService.list(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <IcEditor />
    </HydrationBoundary>
  );
}
