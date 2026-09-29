import { MobileNav } from "@/components/layout/mobile-nav"
import { NavAuth } from "@/components/layout/nav-auth"
import { NavLinks } from "@/components/layout/nav-links"
import { BrandLockup } from "@/components/shared"
import { ROUTES } from "@/constants/routes"

/** The `(marketing)` header: brand at the start, links, account at the end. */
export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        <MobileNav />
        <BrandLockup href={ROUTES.home} />
        <nav className="ms-6 hidden md:block">
          <NavLinks />
        </nav>
        <div className="ms-auto hidden md:block">
          <NavAuth />
        </div>
      </div>
    </header>
  )
}
