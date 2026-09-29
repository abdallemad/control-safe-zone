import type { Metadata } from "next";

import { SectionPlaceholder } from "@/components/admin/shared";
import { ADMIN_SECTIONS } from "@/constants/admin-navigation";
import { authService } from "@/services/auth.service";

export const metadata: Metadata = { title: ADMIN_SECTIONS.customers.title };

// Placeholder until M6 (docs/business-analysis.md "Milestones"). The admin
// check stays when the real page replaces the placeholder.
export default async function AdminCustomersPage() {
  await authService.requireAdmin();
  return <SectionPlaceholder section="customers" />;
}
