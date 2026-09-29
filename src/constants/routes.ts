import type { Role } from "@/generated/prisma"

// Route segments stay English and short (docs/folder-structure.md "app/").
export const ROUTES = {
  home: "/",
  search: "/search",
  ics: "/ics",
  controllers: "/controllers",
  programmers: "/programmers",
  pinouts: "/pinouts",
  support: "/support",
  about: "/about",
  signIn: "/sign-in",
  signUp: "/sign-up",
  authCallback: "/auth-callback",
  admin: "/admin",
} as const

/** The /admin sections (docs/admin-dashboard.md "Sections"). */
export const ADMIN_ROUTES = {
  dashboard: "/admin",
  // الهاردوير — one page per sold type, plus pinouts.
  programmers: "/admin/hardware/programmers",
  controllers: "/admin/hardware/controllers",
  pinouts: "/admin/hardware/pinouts",
  ics: "/admin/hardware/ics",
  brands: "/admin/brands",
  platforms: "/admin/platforms",
  orders: "/admin/orders",
  customers: "/admin/customers",
  shippingZones: "/admin/shipping-zones",
  settings: "/admin/settings",
} as const

/** Where /auth-callback sends a user once they are synced. */
export const HOME_BY_ROLE: Record<Role, string> = {
  ADMIN: ROUTES.admin,
  CUSTOMER: ROUTES.home,
}

/** The الهاردوير folder itself; its page redirects to the first child. */
export const ADMIN_HARDWARE_ROOT = "/admin/hardware"
