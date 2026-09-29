import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BrandEditor } from "@/components/admin/brands/brand-editor";
import { ar } from "@/messages/ar";
import { authService } from "@/services/auth.service";
import { brandService } from "@/services/brand.service";

export const metadata: Metadata = { title: ar.brands.form.editTitle };

// /admin/brands/[id]/edit — full-page edit (docs/brands-feature.md). Loads the
// brand on the server (read-only first paint) and hands it to the form.
export default async function AdminEditBrandPage({ params }: PageProps<"/admin/brands/[id]/edit">) {
  await authService.requireAdmin();

  const { id } = await params;
  const brand = await brandService.getById(id);
  if (!brand) notFound();

  return <BrandEditor brand={brand} />;
}
