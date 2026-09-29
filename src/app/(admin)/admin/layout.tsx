import type { Metadata } from "next";
import { cookies } from "next/headers";

import { AdminHeader } from "@/components/admin/layout/admin-header";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Written by the sidebar primitive (SIDEBAR_COOKIE_NAME in ui/sidebar.tsx)
// whenever it is collapsed or expanded.
const SIDEBAR_COOKIE = "sidebar_state";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// The admin shell: sidebar on the right, header + content beside it
// (docs/admin-dashboard.md).
//
// Chrome only. The admin check is NOT here: a layout does not re-run on
// navigation and does not stop its pages rendering — every admin page calls
// `authService.requireAdmin()` itself (docs/auth-feature.md).
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  // Server-render the sidebar collapsed or expanded as the admin left it, so
  // it doesn't flash open on every load.
  const defaultOpen = (await cookies()).get(SIDEBAR_COOKIE)?.value !== "false";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
