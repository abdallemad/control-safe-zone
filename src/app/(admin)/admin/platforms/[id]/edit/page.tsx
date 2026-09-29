import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PlatformEditor } from "@/components/admin/platforms/platform-editor";
import { ar } from "@/messages/ar";
import { authService } from "@/services/auth.service";
import { platformService } from "@/services/platform.service";

export const metadata: Metadata = { title: ar.platforms.form.editTitle };

// /admin/platforms/[id]/edit — full-page edit (docs/controller-platforms-feature.md).
// Loads the platform on the server (read-only first paint) and hands it to the form.
export default async function AdminEditPlatformPage({ params }: PageProps<"/admin/platforms/[id]/edit">) {
  await authService.requireAdmin();

  const { id } = await params;
  const platform = await platformService.getById(id);
  if (!platform) notFound();

  return <PlatformEditor platform={platform} />;
}
