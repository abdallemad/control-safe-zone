import { Clock, PackageX, ShoppingBag, Users } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/shared";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ADMIN_SECTIONS } from "@/constants/admin-navigation";
import { ar } from "@/messages/ar";
import { authService } from "@/services/auth.service";

const section = ADMIN_SECTIONS.dashboard;
const t = ar.admin;

export const metadata: Metadata = { title: section.title };

const STATS = [
  { label: t.stats.orders, icon: ShoppingBag },
  { label: t.stats.pendingCod, icon: Clock },
  { label: t.stats.lowStock, icon: PackageX },
  { label: t.stats.customers, icon: Users },
];

// Placeholder dashboard — the figures arrive with orders and stock (M7).
// Read-only Server Component page → it may call a service directly
// (docs/folder-structure.md "Architecture Rules").
export default async function AdminDashboardPage() {
  const admin = await authService.requireAdmin();

  return (
    <>
      <PageHeader
        title={`${t.welcome} ${admin.fullName}`}
        description={t.description}
        icon={section.icon}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ label, icon: Icon }) => (
          <Card key={label}>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Icon className="size-4" />
                {label}
              </CardDescription>
              <CardTitle className="text-3xl font-bold tabular-nums">—</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </>
  );
}
