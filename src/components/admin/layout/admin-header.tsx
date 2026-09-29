import { UserButton } from "@clerk/nextjs"
import { Store } from "lucide-react"
import Link from "next/link"

import { AdminBreadcrumbs } from "@/components/admin/layout/admin-breadcrumbs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ROUTES } from "@/constants/routes"
import { ar } from "@/messages/ar"

const t = ar.admin.shell

/**
 * Top bar of the admin content area: sidebar toggle (collapse on desktop,
 * open the sheet on mobile), breadcrumbs, back-to-store and the user menu.
 */
export function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/90 px-4 backdrop-blur supports-backdrop-filter:bg-background/75">
      <SidebarTrigger aria-label={t.toggleSidebar} title={t.toggleSidebar} />
      <Separator orientation="vertical" className="me-1 data-vertical:h-4 data-vertical:self-center" />
      <AdminBreadcrumbs />

      <div className="ms-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href={ROUTES.home} />}
          nativeButton={false}
          className="hidden sm:inline-flex"
        >
          <Store data-icon="inline-start" />
          {t.backToStore}
        </Button>
        <UserButton />
      </div>
    </header>
  )
}
