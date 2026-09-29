"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { MAIN_NAV } from "@/constants/navigation"
import { ROUTES } from "@/constants/routes"
import { cn } from "@/lib/utils"

function isActive(pathname: string, href: string) {
  return href === ROUTES.home ? pathname === href : pathname.startsWith(href)
}

/**
 * The main links. `orientation="vertical"` is the mobile-menu layout;
 * `onNavigate` lets the sheet close itself after a tap.
 */
export function NavLinks({
  orientation = "horizontal",
  onNavigate,
}: {
  orientation?: "horizontal" | "vertical"
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <ul
      className={cn(
        "flex",
        orientation === "horizontal" ? "items-center gap-1" : "flex-col gap-1"
      )}
    >
      {MAIN_NAV.map((item) => {
        const active = isActive(pathname, item.href)
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center rounded-lg px-3 text-sm font-medium transition-colors",
                orientation === "horizontal" ? "h-9" : "h-11 text-base",
                active
                  ? "bg-primary-soft text-primary-ink"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
