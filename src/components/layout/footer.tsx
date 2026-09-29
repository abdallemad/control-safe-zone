import Link from "next/link"

import { BrandLockup } from "@/components/shared"
import { MAIN_NAV } from "@/constants/navigation"
import { ROUTES } from "@/constants/routes"
import { ar } from "@/messages/ar"

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          <BrandLockup href={ROUTES.home} size="sm" />
          <p className="text-sm text-muted-foreground">{ar.brand.tagline}</p>
        </div>
        <nav>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {MAIN_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-muted-foreground hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={ROUTES.about} className="text-muted-foreground hover:text-foreground">
                {ar.nav.about}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {ar.brand.name} — {ar.footer.rights}
      </div>
    </footer>
  )
}
