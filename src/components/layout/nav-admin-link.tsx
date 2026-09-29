"use client"

import { LayoutDashboard } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"
import { useSession } from "@/hooks/use-session"
import { ar } from "@/messages/ar"

/**
 * "لوحة التحكم" — shown only to admins (role from our database via
 * useSession). Hiding it is cosmetic: /admin itself is guarded by
 * `requireAdmin()` on every page.
 */
export function NavAdminLink({
  stacked = false,
  onNavigate,
}: {
  stacked?: boolean
  onNavigate?: () => void
}) {
  const { isAdmin } = useSession()
  if (!isAdmin) return null

  return (
    <Button
      variant="soft"
      size={stacked ? "xl" : "default"}
      render={<Link href={ROUTES.admin} onClick={onNavigate} />}
      nativeButton={false}
    >
      <LayoutDashboard data-icon="inline-start" />
      {ar.nav.admin}
    </Button>
  )
}
