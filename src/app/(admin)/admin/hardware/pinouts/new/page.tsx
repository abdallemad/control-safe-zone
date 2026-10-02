import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";

import { PinoutEditor } from "@/components/admin/pinouts/pinout-editor";
import { queryKeys } from "@/constants/query-keys";
import { getQueryClient } from "@/lib/query-client";
import { ar } from "@/messages/ar";
import { authService } from "@/services/auth.service";
import { platformService } from "@/services/platform.service";

export const metadata: Metadata = { title: ar.pinouts.form.createTitle };

// /admin/hardware/pinouts/new — full-page create (docs/pinouts-admin-feature.md).
// Prefetches the platforms so the platform picker is filled at first paint.
export default async function AdminNewPinoutPage() {
  await authService.requireAdmin();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.platforms.list(),
    queryFn: () => platformService.list(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PinoutEditor />
    </HydrationBoundary>
  );
}
