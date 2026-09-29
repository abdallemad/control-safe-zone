import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { IcEditor } from "@/components/admin/ics/ic-editor";
import { queryKeys } from "@/constants/query-keys";
import { getQueryClient } from "@/lib/query-client";
import { ar } from "@/messages/ar";
import { authService } from "@/services/auth.service";
import { icService } from "@/services/ic.service";
import { platformService } from "@/services/platform.service";

export const metadata: Metadata = { title: ar.ics.form.editTitle };

// /admin/hardware/ics/[id]/edit — full-page edit (docs/ics-admin-feature.md).
// Loads the IC on the server (read-only first paint) and hands it to the
// form; prefetches the platforms for the platform picker.
export default async function AdminEditIcPage({ params }: PageProps<"/admin/hardware/ics/[id]/edit">) {
  await authService.requireAdmin();

  const { id } = await params;
  const queryClient = getQueryClient();
  const [ic] = await Promise.all([
    icService.getById(id),
    queryClient.prefetchQuery({
      queryKey: queryKeys.platforms.list(),
      queryFn: () => platformService.list(),
    }),
  ]);
  if (!ic) notFound();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <IcEditor ic={ic} />
    </HydrationBoundary>
  );
}
