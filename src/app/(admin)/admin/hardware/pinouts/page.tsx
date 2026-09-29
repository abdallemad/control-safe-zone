import type { Metadata } from "next";

import { SectionPlaceholder } from "@/components/admin/shared";
import { ADMIN_SECTIONS } from "@/constants/admin-navigation";
import { authService } from "@/services/auth.service";

export const metadata: Metadata = { title: ADMIN_SECTIONS.pinouts.title };

// الهاردوير › pinouts. Placeholder until M2 (docs/business-analysis.md
// "Milestones"). The admin check stays when the real page replaces it.
export default async function AdminPinoutsPage() {
  await authService.requireAdmin();
  return <SectionPlaceholder section="pinouts" />;
}
