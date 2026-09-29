import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";

import { ProgrammerEditor } from "@/components/admin/programmers/programmer-editor";
import { queryKeys } from "@/constants/query-keys";
import { getQueryClient } from "@/lib/query-client";
import { ar } from "@/messages/ar";
import { authService } from "@/services/auth.service";
import { platformService } from "@/services/platform.service";

export const metadata: Metadata = { title: ar.programmers.form.createTitle };

// /admin/hardware/programmers/new — full-page create (docs/programmers-admin-feature.md).
// Prefetches the platforms so the platform picker is filled at first paint.
export default async function AdminNewProgrammerPage() {
  await authService.requireAdmin();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.platforms.list(),
    queryFn: () => platformService.list(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProgrammerEditor />
    </HydrationBoundary>
  );
}
