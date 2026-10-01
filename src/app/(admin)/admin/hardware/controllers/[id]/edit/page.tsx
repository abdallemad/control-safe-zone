import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ControllerEditor } from "@/components/admin/controllers/controller-editor";
import { queryKeys } from "@/constants/query-keys";
import { getQueryClient } from "@/lib/query-client";
import { ar } from "@/messages/ar";
import { authService } from "@/services/auth.service";
import { controllerService } from "@/services/controller.service";
import { platformService } from "@/services/platform.service";

export const metadata: Metadata = { title: ar.controllers.form.editTitle };

// /admin/hardware/controllers/[id]/edit — full-page edit
// (docs/controllers-admin-feature.md). Loads the controller on the server
// (read-only first paint) and hands it to the form; prefetches the platforms
// for the platform picker.
export default async function AdminEditControllerPage({
  params,
}: PageProps<"/admin/hardware/controllers/[id]/edit">) {
  await authService.requireAdmin();

  const { id } = await params;
  const queryClient = getQueryClient();
  const [controller] = await Promise.all([
    controllerService.getById(id),
    queryClient.prefetchQuery({
      queryKey: queryKeys.platforms.list(),
      queryFn: () => platformService.list(),
    }),
  ]);
  if (!controller) notFound();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ControllerEditor controller={controller} />
    </HydrationBoundary>
  );
}
