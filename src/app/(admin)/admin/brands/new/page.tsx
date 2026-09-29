import type { Metadata } from "next";

import { BrandEditor } from "@/components/admin/brands/brand-editor";
import { ar } from "@/messages/ar";
import { authService } from "@/services/auth.service";

export const metadata: Metadata = { title: ar.brands.form.createTitle };

// /admin/brands/new — full-page create (docs/brands-feature.md).
export default async function AdminNewBrandPage() {
  await authService.requireAdmin();
  return <BrandEditor />;
}
