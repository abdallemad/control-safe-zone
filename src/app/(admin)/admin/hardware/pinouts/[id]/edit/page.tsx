import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PinoutEditor } from "@/components/admin/pinouts/pinout-editor";
import { queryKeys } from "@/constants/query-keys";
import { getQueryClient } from "@/lib/query-client";
import { ar } from "@/messages/ar";
import { authService } from "@/services/auth.service";
import { pinoutService } from "@/services/pinout.service";
import { platformService } from "@/services/platform.service";

export const metadata: Metadata = { title: ar.pinouts.form.editTitle };

// /admin/hardware/pinouts/[id]/edit — full-page edit
// (docs/pinouts-admin-feature.md). Loads the pinout on the server (read-only
// first paint) and hands it to the form; prefetches the platforms for the
// platform picker.
export default async function AdminEditPinoutPage({ params }: PageProps<"/admin/hardware/pinouts/[id]/edit">) {
  await authService.requireAdmin();

  const { id } = await params;
  const queryClient = getQueryClient();
  const [pinout] = await Promise.all([
    pinoutService.getById(id),
    queryClient.prefetchQuery({
      queryKey: queryKeys.platforms.list(),
      queryFn: () => platformService.list(),
    }),
  ]);
  if (!pinout) notFound();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PinoutEditor pinout={pinout} />
    </HydrationBoundary>
  );
}
