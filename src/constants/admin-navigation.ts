import {
  Car,
  CircuitBoard,
  Cpu,
  FileText,
  Layers,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Truck,
  Usb,
  Users,
  type LucideIcon,
} from "lucide-react"

import { ADMIN_HARDWARE_ROOT, ADMIN_ROUTES } from "@/constants/routes"
import { ar } from "@/messages/ar"

const t = ar.admin

export type AdminSectionKey = keyof typeof ADMIN_ROUTES

export type AdminSection = {
  kind: "section"
  key: AdminSectionKey
  href: string
  icon: LucideIcon
  title: string
  description: string
  planned: readonly string[]
  /** The business-analysis milestone that builds it (M1 … M7). */
  milestone: string
}

/** A collapsible parent in the sidebar (الهاردوير). Not a page of its own. */
export type AdminFolder = {
  kind: "folder"
  key: string
  /** Its sections live under this path — used for the open/active state. */
  basePath: string
  icon: LucideIcon
  title: string
  items: AdminSection[]
}

export type AdminNavItem = AdminSection | AdminFolder

/**
 * The registry every admin surface reads — sidebar, breadcrumbs, page titles
 * and the placeholder pages. Adding a section is an entry here, a route in
 * ADMIN_ROUTES and its strings in messages/ar.ts.
 */
export const ADMIN_SECTIONS: Record<AdminSectionKey, AdminSection> = {
  dashboard: { kind: "section", key: "dashboard", href: ADMIN_ROUTES.dashboard, icon: LayoutDashboard, milestone: "M7", ...t.sections.dashboard },
  programmers: { kind: "section", key: "programmers", href: ADMIN_ROUTES.programmers, icon: Usb, milestone: "M2", ...t.sections.programmers },
  controllers: { kind: "section", key: "controllers", href: ADMIN_ROUTES.controllers, icon: CircuitBoard, milestone: "M2", ...t.sections.controllers },
  pinouts: { kind: "section", key: "pinouts", href: ADMIN_ROUTES.pinouts, icon: FileText, milestone: "M2", ...t.sections.pinouts },
  ics: { kind: "section", key: "ics", href: ADMIN_ROUTES.ics, icon: Cpu, milestone: "M2", ...t.sections.ics },
  brands: { kind: "section", key: "brands", href: ADMIN_ROUTES.brands, icon: Car, milestone: "M1", ...t.sections.brands },
  platforms: { kind: "section", key: "platforms", href: ADMIN_ROUTES.platforms, icon: Layers, milestone: "M1", ...t.sections.platforms },
  orders: { kind: "section", key: "orders", href: ADMIN_ROUTES.orders, icon: ShoppingBag, milestone: "M6", ...t.sections.orders },
  customers: { kind: "section", key: "customers", href: ADMIN_ROUTES.customers, icon: Users, milestone: "M6", ...t.sections.customers },
  shippingZones: { kind: "section", key: "shippingZones", href: ADMIN_ROUTES.shippingZones, icon: Truck, milestone: "M4", ...t.sections.shippingZones },
  settings: { kind: "section", key: "settings", href: ADMIN_ROUTES.settings, icon: Settings, milestone: "M7", ...t.sections.settings },
}

/** الهاردوير — everything physical the store lists, in the order asked for. */
export const HARDWARE_FOLDER: AdminFolder = {
  kind: "folder",
  key: "hardware",
  basePath: ADMIN_HARDWARE_ROOT,
  icon: Package,
  title: t.folders.hardware,
  items: [ADMIN_SECTIONS.programmers, ADMIN_SECTIONS.controllers, ADMIN_SECTIONS.pinouts, ADMIN_SECTIONS.ics],
}

/** Sidebar grouping, in display order. */
export const ADMIN_NAV: { label: string; items: AdminNavItem[] }[] = [
  { label: t.groups.overview, items: [ADMIN_SECTIONS.dashboard] },
  { label: t.groups.catalog, items: [HARDWARE_FOLDER] },
  { label: t.groups.reference, items: [ADMIN_SECTIONS.brands, ADMIN_SECTIONS.platforms] },
  {
    label: t.groups.sales,
    items: [ADMIN_SECTIONS.orders, ADMIN_SECTIONS.customers, ADMIN_SECTIONS.shippingZones],
  },
  { label: t.groups.system, items: [ADMIN_SECTIONS.settings] },
]

/** The folder a section sits in, if any (for breadcrumbs). */
export function findAdminFolder(sectionKey: AdminSectionKey): AdminFolder | undefined {
  for (const group of ADMIN_NAV) {
    for (const item of group.items) {
      if (item.kind === "folder" && item.items.some((s) => s.key === sectionKey)) return item
    }
  }
  return undefined
}

/**
 * The section a pathname belongs to — the longest matching href, so
 * /admin/hardware/ics/new is "ics", not "dashboard".
 */
export function findAdminSection(pathname: string): AdminSection | undefined {
  return Object.values(ADMIN_SECTIONS)
    .filter((s) =>
      s.href === ADMIN_ROUTES.dashboard
        ? pathname === s.href
        : pathname === s.href || pathname.startsWith(`${s.href}/`)
    )
    .sort((a, b) => b.href.length - a.href.length)[0]
}
