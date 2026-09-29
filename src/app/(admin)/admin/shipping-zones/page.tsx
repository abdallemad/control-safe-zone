import type { Metadata } from "next";

import { SectionPlaceholder } from "@/components/admin/shared";
import { ADMIN_SECTIONS } from "@/constants/admin-navigation";
import { authService } from "@/services/auth.service";

export const metadata: Metadata = { title: ADMIN_SECTIONS.shippingZones.title };

// Placeholder until M4 (docs/business-analysis.md "Milestones"). The admin
// check stays when the real page replaces the placeholder.
export default async function AdminShippingZonesPage() {
  await authService.requireAdmin();
  return <SectionPlaceholder section="shippingZones" />;
}
