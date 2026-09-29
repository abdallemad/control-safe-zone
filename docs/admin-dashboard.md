# Admin Dashboard

The `/admin` console: an Arabic, RTL shell with a **sidebar on the right**, a header with breadcrumbs, and one route per admin section. **Today every section is a placeholder.** The shell is final; each page's body is replaced when its feature is built (milestones M1–M7 in [`business-analysis.md`](./business-analysis.md#milestones)).

Access is covered in [`auth-feature.md`](./auth-feature.md): every page calls `authService.requireAdmin()`.

**Getting there**: admins land on `/admin` after signing in (`/auth-callback`). From the storefront, the navbar shows them a "لوحة التحكم" button (`NavAdminLink`), and customers never see it. From the admin, "العودة للمتجر" in the sidebar footer and the header leads back.

---

## Sections

| Route | Section | Sidebar group | Built in | Today |
|---|---|---|---|---|
| `/admin` | لوحة التحكم | نظرة عامة | M7 (figures) | Welcome + four empty stat cards |
| `/admin/hardware/programmers` | الكتالوج › الهاردوير › المبرمجات | الكتالوج | M2 | Placeholder |
| `/admin/hardware/controllers` | الكتالوج › الهاردوير › الكنترولات | الكتالوج | M2 | Placeholder |
| `/admin/hardware/pinouts` | الكتالوج › الهاردوير › البن أوت | الكتالوج | M2 | Placeholder |
| `/admin/hardware/ics` | الكتالوج › الهاردوير › الآي سيهات | الكتالوج | M2 | Placeholder |
| `/admin/brands` (+ `/new`, `/[id]/edit`) | الماركات | البيانات المرجعية | M1 | **Built** — list, create, edit, delete, logo on R2 ([`brands-feature.md`](./brands-feature.md)) |
| `/admin/platforms` (+ `/new`, `/[id]/edit`) | منصات الكنترول | البيانات المرجعية | M1 | **Built** — list, create, edit, delete ([`controller-platforms-feature.md`](./controller-platforms-feature.md)) |
| `/admin/orders` | الطلبات | المبيعات | M6 | Placeholder |
| `/admin/customers` | العملاء | المبيعات | M6 | Placeholder |
| `/admin/shipping-zones` | مناطق الشحن | المبيعات | M4 | Placeholder |
| `/admin/settings` | الإعدادات | النظام | M7 | Placeholder |

**الهاردوير** is a *folder* in the sidebar, not a page:
- It groups the three sold types (المبرمجات, الكنترولات, الآي سيهات) and the pinouts, in that order.
- `/admin/hardware` itself redirects to its first section (المبرمجات).
- Each sold type has its **own page**. This replaces the single "المنتجات" page with IC / Controller / Programmer tabs that `folder-structure.md` first planned.

Add/edit sub-routes (`/admin/hardware/ics/new`, `/admin/hardware/ics/[id]/edit`…) arrive with their features. The breadcrumbs and the active sidebar item already resolve them to their section.

---

## Shell

```text
┌──────────────────────────────────────────────┬──────────────┐
│ AdminHeader [☰] لوحة التحكم › الهاردوير › الكنترولات 🏪 👤 │ AdminSidebar │
├──────────────────────────────────────────────┤  (right)     │
│                                              │  brand       │
│   page content (max-w-6xl, p-4 / md:p-6)     │  groups…     │
│                                              │  ↩ المتجر     │
└──────────────────────────────────────────────┴──────────────┘
```

| File | What it does |
|---|---|
| `app/(admin)/admin/layout.tsx` | `SidebarProvider` → `AdminSidebar` + `SidebarInset` (`AdminHeader` + content). Reads the `sidebar_state` cookie so the sidebar server-renders collapsed or expanded as the admin left it. Sets `robots: noindex`. **No auth check here** (see below) |
| `components/admin/layout/admin-sidebar.tsx` | shadcn `Sidebar`, `side="right"`, `collapsible="icon"`. Brand at the top, grouped links from `ADMIN_NAV`, "العودة للمتجر" at the bottom, and a `SidebarRail` to drag or click. The active item comes from `findAdminSection(pathname)` |
| `components/admin/layout/admin-header.tsx` | Sticky top bar: `SidebarTrigger`, `AdminBreadcrumbs`, back-to-store, Clerk `UserButton` (the user menu) |
| `components/admin/layout/admin-breadcrumbs.tsx` | `لوحة التحكم › [folder ›] <section> [› إضافة / تعديل]`, e.g. لوحة التحكم › الهاردوير › الكنترولات, or لوحة التحكم › الماركات › تعديل. Folders are plain text (not pages). The section becomes a link when a sub-page (`/new`, `/<id>/edit`) follows it. Only the last crumb shows on narrow screens |

### Behaviour

- **Desktop (≥ 768px)**: the sidebar is 16rem, and collapses to a **3rem icon rail** via the trigger, the rail, or <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>B</kbd>. The state is saved in the `sidebar_state` cookie for 7 days.
- **Collapsed**: each icon shows its label in a tooltip that opens to the **left**, toward the content. The primitive hard-codes `side="right"`, which would be off-screen for a right-hand sidebar, so every `SidebarMenuButton` passes `tooltip={{ children, side: "left" }}`.
- **Mobile (< 768px)**: the sidebar is a `Sheet` from the right, opened by the header trigger, and it closes itself when a link is followed.
- **Active item**: `isActive` gives the sidebar-accent style, a brand-50 tint with brand-800 text (design-system tokens), plus `aria-current="page"`.
- **Folders** (الهاردوير):
  - Expanded sidebar or mobile: a `Collapsible` sub-menu, **open by default**. The chevron points left (inwards, in RTL) when closed and down when open. It is keyed on the trigger's `aria-expanded`.
  - Icon-collapsed desktop sidebar: the sub-menu can't show there, so the folder icon opens a `DropdownMenu` of its sections, to the **left**. The icon is highlighted when the current page is inside the folder.

---

## The section registry

`constants/admin-navigation.ts` is the **single source** for the sidebar, breadcrumbs, page titles and placeholders:

```ts
ADMIN_SECTIONS.controllers
// → { kind: "section", key, href: "/admin/hardware/controllers", icon: CircuitBoard,
//     milestone: "M2", title, description, planned[] }   // strings from messages/ar.ts
HARDWARE_FOLDER     // { kind: "folder", title: "الهاردوير", icon: Package, basePath, items: [programmers, controllers, pinouts, ics] }
ADMIN_NAV           // the sidebar groups, in order: نظرة عامة · الكتالوج (الهاردوير) · البيانات المرجعية (الماركات، منصات الكنترول) · المبيعات · النظام — an item is a section or a folder
findAdminSection()  // pathname → section (longest match, so /admin/hardware/ics/new → ics)
findAdminFolder()   // section → the folder it sits in (breadcrumbs)
```

Routes live in `ADMIN_ROUTES` and `ADMIN_HARDWARE_ROOT` (`constants/routes.ts`). Strings live in `ar.admin.shell`, `ar.admin.groups`, `ar.admin.folders`, `ar.admin.sections` and `ar.admin.placeholder`.

**Adding a section** takes four edits:

1. A route in `ADMIN_ROUTES`.
2. Strings in `ar.admin.sections`.
3. An entry in `ADMIN_SECTIONS` (icon, milestone), then add it to a group of `ADMIN_NAV`, or to a folder's `items` (e.g. `HARDWARE_FOLDER`).
4. `app/(admin)/admin/<route>/page.tsx`.

A new **folder** is an `AdminFolder` in `ADMIN_NAV` plus its title in `ar.admin.folders`. Give its sections a common URL prefix (`basePath`), and add a `page.tsx` at that prefix that redirects to the first section.

---

## Pages today

Each placeholder page looks like this:

```tsx
export const metadata: Metadata = { title: ADMIN_SECTIONS.orders.title };

export default async function AdminOrdersPage() {
  await authService.requireAdmin();
  return <SectionPlaceholder section="orders" />;
}
```

`SectionPlaceholder` (`components/admin/shared/section-placeholder.tsx`) renders:
- the `PageHeader` with a "قيد الإنشاء" badge;
- a dashed card with the milestone;
- the list of what the section will do, taken from business-analysis "Administration".

It is **temporary**. Replace it section by section, and delete the file once no page uses it.

**When building a section**, keep `await authService.requireAdmin()` at the top of the page and of every admin Server Action. Then replace `<SectionPlaceholder>` with a `<PageHeader title icon actions>` plus the feature's components.

---

## Admin shared components

`@/components/admin/shared` re-exports everything from `@/components/shared` (`Ltr`, `Price`, `StatusBadge`, `BrandLockup`), so admin code imports from one place.

| Component | Purpose |
|---|---|
| `PageHeader` | icon tile, `h1`, description, actions slot at the end |
| `SectionPlaceholder` | temporary, see above |

Planned here (`folder-structure.md`): section card, data table (RTL), toolbar, pagination, empty/loading states, delete dialog. Add them with the first feature that needs them.

---

## Access

- `app/(admin)/admin/layout.tsx` is **chrome only**. Per the Next.js auth guide, a layout does not re-run on client navigation and does not stop its pages from rendering, so it must not be the gate.
- **Every page** calls `authService.requireAdmin()`. Signed out → `/sign-in`. Not synced → `/auth-callback`. Customer → `/`.
- `/admin` pages are `noindex` (layout metadata).

---

## Notes

- **Sidebar primitive changes** (`ui/sidebar.tsx`): the screen-reader sheet title, description and trigger text are Arabic. Re-apply them after `shadcn add sidebar --overwrite`.
- **`hooks/use-mobile.ts`** was installed by the sidebar and rewritten with `useSyncExternalStore`, because the generated version failed the `react-hooks/set-state-in-effect` lint rule. It is the one UI hook in `src/hooks/`; every other hook there is a React Query hook.
- **Bidi**: keep Latin runs out of brackets in Arabic strings ("… — OBD · Boot · Bench", not "(OBD · Boot · Bench)"). Brackets mirror, and they split badly when the line wraps.
