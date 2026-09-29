import type { Metadata } from "next";

import { SectionPlaceholder } from "@/components/admin/shared";
import { ADMIN_SECTIONS } from "@/constants/admin-navigation";
import { authService } from "@/services/auth.service";

export const metadata: Metadata = { title: ADMIN_SECTIONS.settings.title };

// Placeholder until M7 (docs/business-analysis.md "Milestones"). The admin
// check stays when the real page replaces the placeholder.
export default async function AdminSettingsPage() {
  await authService.requireAdmin();
  return <SectionPlaceholder section="settings" />;
}
