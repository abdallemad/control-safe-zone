import { ROUTES } from "@/constants/routes"
import { ar } from "@/messages/ar"

/** The storefront's main navigation — navbar and mobile menu render this list. */
export const MAIN_NAV = [
  { href: ROUTES.home, label: ar.nav.home },
  { href: ROUTES.ics, label: ar.nav.ics },
  { href: ROUTES.controllers, label: ar.nav.controllers },
  { href: ROUTES.programmers, label: ar.nav.programmers },
  { href: ROUTES.pinouts, label: ar.nav.pinouts },
  { href: ROUTES.support, label: ar.nav.support },
] as const
