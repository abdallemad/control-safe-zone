import type { Metadata } from "next";

import { PlatformEditor } from "@/components/admin/platforms/platform-editor";
import { ar } from "@/messages/ar";
import { authService } from "@/services/auth.service";

export const metadata: Metadata = { title: ar.platforms.form.createTitle };

// /admin/platforms/new — full-page create (docs/controller-platforms-feature.md).
export default async function AdminNewPlatformPage() {
  await authService.requireAdmin();
  return <PlatformEditor />;
}
