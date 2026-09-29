import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProgrammerEditor } from "@/components/admin/programmers/programmer-editor";
import { queryKeys } from "@/constants/query-keys";
import { getQueryClient } from "@/lib/query-client";
import { ar } from "@/messages/ar";
import { authService } from "@/services/auth.service";
import { platformService } from "@/services/platform.service";
import { programmerService } from "@/services/programmer.service";

export const metadata: Metadata = { title: ar.programmers.form.editTitle };

// /admin/hardware/programmers/[id]/edit — full-page edit
// (docs/programmers-admin-feature.md). Loads the programmer on the server
// (read-only first paint) and hands it to the form; prefetches the platforms
// for the platform picker.
export default async function AdminEditProgrammerPage({
  params,
}: PageProps<"/admin/hardware/programmers/[id]/edit">) {
  await authService.requireAdmin();

  const { id } = await params;
  const queryClient = getQueryClient();
  const [programmer] = await Promise.all([
    programmerService.getById(id),
    queryClient.prefetchQuery({
      queryKey: queryKeys.platforms.list(),
      queryFn: () => platformService.list(),
    }),
  ]);
  if (!programmer) notFound();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProgrammerEditor programmer={programmer} />
    </HydrationBoundary>
  );
}
