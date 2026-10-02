# Folder Structure

## Related documents

The two documents that exist today are the **M0 milestone**. Every other document below is **planned** — write it when its feature is built, one file per feature, and tick it here.

- [x] [`business-analysis.md`](./business-analysis.md) — product scope, requirements, milestones and open questions
- [x] `folder-structure.md` — this file: the layered architecture and where everything lives
- [x] [`auth-feature.md`](./auth-feature.md) — Clerk sign-in/up (Arabic), `/auth-callback` user sync, role redirect, `requireSignedIn` / `requireAdmin`
- [x] [`design-system.md`](./design-system.md) — light-red brand tokens, typography, shadcn primitives (RTL mode), status tones; live at `/design-system`
- [ ] `tech-stack.md` — Next 16, Clerk (Arabic localization), Prisma + PostgreSQL, Cloudflare R2, shadcn/Base UI, React Query, Zod, Paymob
- [ ] `rtl-and-arabic.md` — `lang="ar" dir="rtl"`, the Arabic font, logical Tailwind classes, LTR islands for part numbers, number/currency/date formatting, the Arabic strings file
- [ ] `erd.md` — entity relationships (see *Domain at a glance* below for the starting point)
- [ ] `storefront-layout.md` — the `(marketing)` header shell and the `(app)` sidebar shell, mirrored for RTL, brand lockup, nav, account menu, theme switcher
- [ ] `landing-page.md` — `/`, `/about`
- [ ] `support-page.md` — `/support`, WhatsApp-first contact
- [ ] `ics-feature.md` — `/ics`, the IC catalog: part numbers, markings, packages
- [ ] `controllers-feature.md` — `/controllers`, ECU units: hardware/software numbers, condition, virgin flag
- [ ] `programmers-feature.md` — `/programmers`: many-to-many with controller platforms, OBD / Boot / Bench
- [ ] `pinouts-feature.md` — `/pinouts`: the storefront catalog and download button *(the admin CRUD and the PDF route are in `pinouts-admin-feature.md`)*
- [ ] `search-feature.md` — `/search`: identifier normalisation, one search across all categories
- [ ] `cart-feature.md` — `/cart`: real per-line quantity, stock-validated
- [ ] `checkout-feature.md` — Egyptian address, governorate shipping fee, stock reservation, order creation
- [ ] `payments-feature.md` — Paymob + `POST /api/webhooks/payment` (HMAC), and the cash-on-delivery branch
- [ ] `shipping-zones-feature.md` — governorates, zones and fees (admin CRUD)
- [ ] `orders-feature.md` — the order status state machine and what each transition does to stock
- [ ] `customer-orders-feature.md` — `/account/orders`: history and tracking
- [ ] `account-settings-feature.md` — `/account/settings`, `/account/addresses`
- [x] [`admin-dashboard.md`](./admin-dashboard.md) — the `/admin` shell (right sidebar, header, breadcrumbs), the section registry, placeholder pages; RTL admin tables to come
- [ ] `admin-access-control.md` — how `/admin` is locked down *(the gate itself — `requireAdmin()` — is in `auth-feature.md`; this doc covers the rest of the admin shell)*
- [x] [`brands-feature.md`](./brands-feature.md) — the reference CRUD feature, layer by layer (every other CRUD copies it): admin list / create / edit / delete, logo on R2
- [x] [`controller-platforms-feature.md`](./controller-platforms-feature.md) — Bosch EDC17C46, MED17.5, SIMOS… the reference data every category links to: admin CRUD, delete blocked by any link
- [x] [`controllers-admin-feature.md`](./controllers-admin-feature.md) — the admin controller CRUD: one platform per unit, hardware / software / part numbers with normalised twins, condition + فيرجن, on the shared product layer
- [x] [`pinouts-admin-feature.md`](./pinouts-admin-feature.md) — the admin pinout CRUD: preview image on R2, PDF in the private bucket behind `GET /api/pinouts/[id]/pdf` (signed-in / inactive rules), optional platform; not a `Product`
- [x] [`programmers-admin-feature.md`](./programmers-admin-feature.md) — the admin programmer CRUD with the OBD / Boot / Bench compatibility editor, and the **shared product layer** (`product.*`) every sold type builds on
- [x] [`ics-admin-feature.md`](./ics-admin-feature.md) — the admin IC CRUD, the first sold type: `Product` + `IcDetails` + platform links in one write, normalised part number / markings, cover on R2, delete blocked by order history
- [x] [`product-images.md`](./product-images.md) — images on R2 through `/api/images/[...key]`: keys, upload rules (magic bytes, 2 MB, no SVG), the public route, config
- [ ] `database-seeding.md` — realistic Arabic mock data for development

---

## Overview

The project follows the **same Layer-Based Architecture as ECU Safe Zone**, so code and habits move between the two projects unchanged.

Each feature follows the same development flow:

```text
UI
↓
Hook
↓
Server Action
↓
Service
↓
Repository
↓
Prisma
↓
Database
```

What is **different** from ECU Safe Zone:

| | ECU Safe Zone | Control Safe Zone |
|---|---|---|
| Sells | Digital files (firmware) | Physical hardware |
| Market | Worldwide, English | Egypt, **Arabic RTL** |
| Currency | USD | **EGP** |
| Payment | Stripe | **Paymob + cash on delivery** |
| After payment | Download access | **Shipping** to a governorate |
| Cart quantity | Always 1 | **Real quantity, stock-reserved** |
| Hardware | A secondary catalog | **The whole store** |

---

## Domain at a glance

A starting point for `erd.md`, not the final schema.

```text
Brand ─────────────┐
                   │
ControllerPlatform ┼──< Product (type: IC | CONTROLLER | PROGRAMMER)
   (EDC17C46…)     │        ├── ProductImage[]
                   │        ├── IcDetails?          (partNumber, markings[], package, manufacturer)
                   │        ├── ControllerDetails?  (hardwareNo, softwareNo, condition, isVirgin)
                   │        └── ProgrammerSupport[] >── ControllerPlatform  (obd, boot, bench)
                   │
                   └──< Pinout (name, imageKey, pdfKey)

User ──< Address
User ──< Cart ──< CartItem >── Product
User ──< Order ──< OrderItem >── Product     (price & name captured at order time)
Order >── ShippingZone (governorate, fee)
Order ──< Payment (provider, providerRef, status)
```

- One `Product` table with a `type` discriminator for everything that is **sold and stocked**, plus one detail table per type. The storefront never branches on type in components — it reads a type registry (`src/constants/product-types.ts`) that declares the Arabic label, route, fields and icon for each type, exactly like `HARDWARE_TYPE_META` in ECU Safe Zone.
- `Pinout` is its own table because it is not stocked or shipped.
- Every searchable identifier also has a **normalised column** (`partNumberNorm`, `hardwareNoNorm`…: upper-case, no spaces/dashes/dots), indexed, written by the service layer.
- Money is `Decimal(10,2)` in EGP. Never floats.

---

# Project Structure

```text
src/
│
├── app/
│
├── components/
│
├── repositories/
│
├── actions/
│
├── services/
│
├── hooks/
│
├── schemas/
│
├── lib/
│
├── types/
│
├── utils/
│
├── constants/
│
└── messages/          # Arabic UI strings — see messages/ below
```

---

# app/

All application routes, using the Next.js App Router.

Arabic slugs are **not** used in URLs — route segments stay English and short (`/ics`, `/controllers`), which keeps URLs clean when shared on WhatsApp. Page titles, headings and metadata are Arabic.

```text
app/
│
├── (marketing)/              # header only — storefront-layout.md
│   ├── layout.tsx            #   ✓ Navbar + Footer
│   ├── page.tsx              #   ✓ /          الرئيسية (placeholder landing)
│   ├── about/                #   /about     من نحن
│   ├── support/              #   /support   الدعم
│   └── policies/             #   /policies/[slug]  الشحن، الاسترجاع، الخصوصية
│
├── (app)/                    # sidebar only — storefront-layout.md
│   ├── layout.tsx
│   ├── search/               #   /search        — search-feature.md
│   ├── ics/                  #   /ics, /ics/[slug]                 — ics-feature.md
│   ├── controllers/          #   /controllers, /controllers/[slug] — controllers-feature.md
│   ├── programmers/          #   /programmers, /programmers/[slug] — programmers-feature.md
│   ├── pinouts/              #   /pinouts, /pinouts/[slug]         — pinouts-feature.md
│   ├── brands/               #   /brands/[slug]  browse by car brand
│   ├── platforms/            #   /platforms/[slug] browse by controller platform
│   ├── cart/                 #   /cart          — cart-feature.md
│   ├── checkout/             #   /checkout, /checkout/success — checkout-feature.md
│   └── account/
│       ├── orders/           #   + [orderNumber] — customer-orders-feature.md
│       ├── addresses/        #   — account-settings-feature.md
│       └── settings/         #   — account-settings-feature.md
│
├── (admin)/                  # the dashboard — admin-dashboard.md
│   └── admin/
│       ├── layout.tsx        #   ✓ sidebar (right) + header — chrome only, no auth check
│       ├── page.tsx          #   ✓ figures (placeholder stat cards)
│       ├── hardware/         #   الهاردوير (a sidebar folder) — page.tsx redirects to programmers
│       │   ├── programmers/  #   ✓ list · new/ · [id]/edit/ — المبرمجات — programmers-admin-feature.md
│       │   ├── controllers/  #   ✓ list · new/ · [id]/edit/ — الكنترولات — controllers-admin-feature.md
│       │   ├── pinouts/      #   ✓ list · new/ · [id]/edit/ — البن أوت — pinouts-admin-feature.md
│       │   └── ics/          #   ✓ list · new/ · [id]/edit/ — الآي سيهات — ics-admin-feature.md
│       ├── brands/           #   ✓ list · new/ · [id]/edit/ — brands-feature.md
│       ├── platforms/        #   ✓ list · new/ · [id]/edit/ — controller-platforms-feature.md
│       ├── orders/           #   ✓ placeholder
│       ├── customers/        #   ✓ placeholder
│       ├── shipping-zones/   #   ✓ placeholder
│       └── settings/         #   ✓ placeholder
│
├── api/
│   ├── webhooks/payment/     #   POST — payments-feature.md
│   ├── images/[...key]/      #   ✓ GET  — product-images.md
│   └── pinouts/[id]/pdf/     #   ✓ GET  — pinouts-admin-feature.md
│
├── (auth)/                   # ✓ centred brand shell, no nav — auth-feature.md
│   ├── layout.tsx
│   ├── sign-in/[[...sign-in]]/   #   /sign-in   Clerk <SignIn />
│   ├── sign-up/[[...sign-up]]/   #   /sign-up   Clerk <SignUp />
│   └── auth-callback/        #   /auth-callback  sync user → /admin or /
│
├── design-system/            # /design-system — living reference, noindex — design-system.md
│
├── layout.tsx                # ✓ <html lang="ar" dir="rtl">, Arabic font, Clerk (arSA) + Query providers
│
└── not-found.tsx             # ✓ Arabic 404
```

The three `api/` route handlers are the **only Route Handlers in the application**. Everything else the browser calls is a Server Action, because a Server Action carries the session:

- the **payment webhook** has no session — it is authenticated by an HMAC over the payload;
- the **image route** serves bytes to `<img>` tags, crawlers and WhatsApp link previews;
- the **pinout PDF route** serves a file from the private bucket after checking the access rule.

Route groups (parenthesised folders) organise routes and own layouts without appearing in the URL.

### Responsibilities

- Routing
- Layouts
- Server Components
- Metadata (Arabic)
- Route Groups
- Error Pages

Business logic never lives here.

---

# components/

Reusable UI components.

```text
components/
│
├── ui/            # shadcn primitives
├── shared/        # domain-neutral, used by storefront AND admin
├── forms/
├── layout/
├── marketing/
├── product/       # the card, grid, detail and filters for every sold type
├── search/
├── programmers/   # the compatibility table
├── pinouts/
├── cart/
├── checkout/
├── orders/
├── auth/          # ✓ AuthCallbackView — auth-feature.md
├── providers/     # ✓ QueryProvider (client) — mounted once in the root layout
└── admin/
```

### ui/

shadcn primitives (base-nova style, Base UI) — Button, Input, Card, Dialog, Badge, Sheet, Select… The installed set and the brand additions (`soft` / `xl` button, badge tones) are listed in [`design-system.md`](./design-system.md).

**Always add them with the CLI** (`npx shadcn add <name>`), never by copy-paste.

**RTL rule:** `components.json` has `"rtl": true`, so the CLI already writes logical classes (`ms-*`, `pe-*`, `start-*`, `text-start`) and `rtl:` variants, including `rtl:rotate-180` on direction-bound icons. After adding a component, check it for any physical class the CLI missed. Positioning keyed on a `side` prop is fine. Sheets and drawers open from the **start** side, which is `side="right"` in RTL.

**`--overwrite` wipes the brand additions** in `button.tsx` and `badge.tsx`, so re-apply them afterwards.

---

### shared/

Domain-neutral components — they take data and callbacks and know nothing about any entity. `✓` marks the files that exist today.

```text
shared/
│
├── brand-lockup.tsx     # ✓ mark + name; `href` makes it a home link
├── empty-state.tsx      # ✓ icon, title, description, action
├── pagination.tsx
├── search-input.tsx
├── status-badge.tsx     # ✓ dot + Arabic label, tone from the caller — design-system.md "Status tones"
├── price.tsx            # ✓ formats EGP with ar-EG, Western digits
├── ltr.tsx              # ✓ <Ltr>TC1797</Ltr> — an LTR island for identifiers
├── whatsapp-button.tsx
├── user-avatar.tsx
└── index.ts
```

```ts
import { EmptyState, Price, Ltr } from "@/components/shared"          // storefront
import { PageContainer, Pagination } from "@/components/admin/shared" // admin (re-exports shared)
```

---

### product/

The storefront surfaces for **every sold type** (IC, controller, programmer): `ProductGrid`, `ProductCard`, `ProductDetail`, `ProductFilters`, `StockBadge`, `ConditionBadge`, `ProductSpecs`.

**Nothing in this folder branches on the product type.** Components render whatever `PRODUCT_TYPE_META` (`src/constants/product-types.ts`) declares for the row's `type` — Arabic label, the spec fields to show, the route. A new sold category is a registry entry and a detail table, not a component change.

---

### programmers/

`CompatibilityTable` — which controller platforms a programmer supports and in which modes (OBD / Boot / Bench), shown on the programmer page, and the reverse view ("أجهزة تدعم هذا الكنترول") on the controller page.

---

### pinouts/

`PinoutCatalogView`, `PinoutCard`, `PinoutImage`, `PinoutDownloadButton`. Its own folder because a pinout is not a `Product` — no price, stock or shipping.

---

### cart/ and checkout/

- `cart/` — `AddToCartButton` (with quantity), `CartView`, `CartBadge`.
- `checkout/` — `AddressForm` (governorate → city → address, Egyptian phone), `ShippingSummary`, `PaymentMethodPicker` (online / COD), `OrderSummary`.

---

### orders/

`OrderList`, `OrderDetail`, `OrderStatusTimeline` — shared by the customer's account pages; the admin queue lives under `admin/orders/`.

---

### marketing/

One file per `(marketing)` route: `hero.tsx`, `landing-sections.tsx`, `about-sections.tsx`, `support-sections.tsx`, `policy-sections.tsx`.

---

### forms/

```text
forms/
│
├── form-field.tsx      # TextField, SelectField, SwitchField, FormAlert (Arabic errors)
├── file-dropzone.tsx   # ✓ images: click / drop, uploads at once, preview, replace/remove
├── pdf-dropzone.tsx    # ✓ the PDF sibling: holds a private key, shows name + size, "open" for the saved file
├── phone-field.tsx     # Egyptian mobile: 01[0125]XXXXXXXX
├── brand-form.tsx      # ✓ the reference entity form — brands-feature.md
├── platform-form.tsx   # ✓ controller-platforms-feature.md
├── product-listing-fields.tsx # ✓ shared by every sold type: image / pricing (MoneyInput) / visibility cards, PlatformSelect
├── ic-form.tsx         # ✓ ics-admin-feature.md — chip fields, platform rows (useFieldArray)
├── programmer-form.tsx # ✓ programmers-admin-feature.md — tool fields, support rows with OBD / Boot / Bench
├── controller-form.tsx # ✓ controllers-admin-feature.md — one platform, hardware / software numbers, condition + فيرجن
├── pinout-form.tsx     # ✓ pinouts-admin-feature.md — optional platform, connector, preview + PDF, download access
├── tag-input.tsx       # ✓ string[] as chips (IC markings): Enter / comma / paste, de-duplicated
└── <entity>-form.tsx   # one file per entity form
```

Field layout uses the shadcn `field` primitives (`Field`, `FieldLabel`, `FieldDescription`, `FieldError`); `form-field.tsx` wrappers are only worth adding if the same trio keeps repeating. Server errors come back as `ActionError.fieldErrors` and are set on the matching fields with `form.setError`.

Forms are presentational: they receive `defaultValues` and `onSubmit`; the caller owns the mutation.

State by **react-hook-form**, validated by the entity's Zod schema via `standardSchemaResolver`, so form and Server Action enforce identical rules. **Zod error messages are Arabic.**

---

### layout/

Navbar, Footer, Sidebar, Header, MobileNav — all mirrored for RTL (the sidebar sits on the **right**).

Built so far (✓): `navbar.tsx` (server) composed of `nav-links.tsx` (client, active state from `usePathname`), `nav-auth.tsx` (client, Clerk `<Show>` + sign-in/up buttons / `UserButton`), `nav-admin-link.tsx` (client, the admin-only "لوحة التحكم" button via `useSession`) and `mobile-nav.tsx` (client, `Sheet` from the right); `footer.tsx`. Links come from `constants/navigation.ts`.

---

### admin/

Admin components, organised by feature.

```text
admin/
│
├── layout/           # ✓ admin-sidebar (right; the mobile nav is its sheet), admin-header
│                     #   (trigger, breadcrumbs, back-to-store, Clerk UserButton = user menu),
│                     #   admin-breadcrumbs
├── brands/           # ✓ brands-view, brand-editor, delete-brand-dialog, brand-logo — brands-feature.md
├── platforms/        # ✓ platforms-view, platform-editor, delete-platform-dialog — controller-platforms-feature.md
├── ics/              # ✓ ics-view, ic-editor, delete-ic-dialog — ics-admin-feature.md
├── programmers/      # ✓ programmers-view, programmer-editor, delete-programmer-dialog — programmers-admin-feature.md
├── controllers/      # ✓ controllers-view, controller-editor, delete-controller-dialog — controllers-admin-feature.md
├── products/         # ✓ product-image, stock-cell — the cells every sold type's table shares
├── pinouts/          # ✓ pinouts-view, pinout-editor, delete-pinout-dialog — pinouts-admin-feature.md
├── orders/           # the queue, status transitions, COD confirmation
├── shipping-zones/
└── shared/           # ✓ page-header, confirm-delete-dialog, section-placeholder (temporary),
                      #   index (re-exports components/shared) — to come: section card,
                      #   data table, toolbar, pagination, loading states
```

Every admin surface reads the section registry `constants/admin-navigation.ts` (`ADMIN_SECTIONS`, `ADMIN_NAV`, `findAdminSection`) — see `admin-dashboard.md`.

The admin is Arabic too.

---

# actions/

Server Actions.

```text
actions/
│
├── product/
├── search/
├── cart/
├── checkout/
├── order/
├── account/
├── auth/           # ✓ sync-user.ts (syncUserAction), get-session.ts (getSessionAction) — auth-feature.md
├── brand/          # ✓ list-, create-, update-, delete-brand.ts, upload-brand-logo.ts — brands-feature.md
├── platform/       # ✓ list-, create-, update-, delete-platform.ts — controller-platforms-feature.md
├── ic/             # ✓ list-, create-, update-, delete-ic.ts, upload-ic-image.ts — ics-admin-feature.md
├── programmer/     # ✓ list-, create-, update-, delete-programmer.ts, upload-programmer-image.ts — programmers-admin-feature.md
├── controller/     # ✓ list-, create-, update-, delete-controller.ts, upload-controller-image.ts — controllers-admin-feature.md
├── pinout/         # ✓ list-, create-, update-, delete-pinout.ts, upload-pinout-image.ts, upload-pinout-pdf.ts — pinouts-admin-feature.md
└── admin/
```

### Responsibilities

- Validate input (Zod)
- Authenticate & authorize
- Call the Service layer
- Return safe, typed responses (`{ ok: true, data } | { ok: false, error }`, error text in Arabic)

No business logic here.

---

# services/

Business logic.

```text
services/
│
├── product.service.ts      # ✓ rules every sold type shares — listing columns, money, errors, order-history delete
├── search.service.ts
├── pinout.service.ts       # ✓ pinouts CRUD rules + openPdf (the PDF access rule) — pinouts-admin-feature.md
├── cart.service.ts
├── checkout.service.ts     # shipping fee, stock reservation, order creation (one transaction)
├── order.service.ts        # the status state machine
├── payment.service.ts      # provider interface
├── payment/
│   ├── paymob.provider.ts
│   └── cod.provider.ts
├── shipping.service.ts
├── storage.service.ts      # ✓ R2 — images (uploadImage / deleteImageByUrl / getImage) and pinout PDFs (uploadPdf / deletePdfByKey / getPdf) — product-images.md
├── brand.service.ts        # ✓ brands CRUD rules — brands-feature.md
├── platform.service.ts     # ✓ platforms CRUD rules — controller-platforms-feature.md
├── ic.service.ts           # ✓ ICs CRUD rules — ics-admin-feature.md
├── programmer.service.ts   # ✓ programmers CRUD rules — programmers-admin-feature.md
├── controller.service.ts   # ✓ controllers CRUD rules — controllers-admin-feature.md
├── auth.service.ts         # ✓ the only server file that reads Clerk — getIdentity, getCurrentUser, requireSignedIn, requireAdmin
└── user.service.ts         # ✓ syncFromIdentity — find / claim / create, ADMIN_EMAILS promotion
```

`payment.service.ts` is the one service with a caller that is not a Server Action: `POST /api/webhooks/payment` calls it directly. The route handler verifies and delegates; every rule about what "paid" means lives in the service.

### Responsibilities

- Business rules
- Transactions (stock reservation is always inside a transaction)
- Identifier normalisation before writes and searches
- Domain logic

---

# repositories/

Data access — the only layer that imports the Prisma client. One file per aggregate (`product.repository.ts`, `order.repository.ts`…). Services call repositories; nothing else does. Built so far (✓): `user.repository.ts` — selects session columns only, never the whole row; `brand.repository.ts`; `platform.repository.ts`; `product.repository.ts` (shared by every sold type), `ic.repository.ts`, `programmer.repository.ts` and `controller.repository.ts` (`Product` scoped to its type); `pinout.repository.ts`.

---

# hooks/

React Query hooks.

```text
hooks/
│
├── use-products.ts
├── use-search.ts
├── use-cart.ts
├── use-checkout.ts
├── use-orders.ts
├── use-auth-callback.ts   # ✓ sync on /auth-callback, then redirect by role
├── use-session.ts         # ✓ name + role of the signed-in user (navbar admin button)
├── use-brands.ts          # ✓ list + create / update / delete / upload-logo mutations
├── use-platforms.ts       # ✓ list + create / update / delete mutations
├── use-ics.ts             # ✓ list + create / update / delete / upload-image mutations
├── use-programmers.ts     # ✓ list + create / update / delete / upload-image mutations
├── use-controllers.ts     # ✓ list + create / update / delete / upload-image mutations
├── use-pinouts.ts         # ✓ list + create / update / delete / upload-image / upload-pdf mutations
└── use-mobile.ts          # ✓ from `shadcn add sidebar` — the one non-React-Query hook here
```

UI consumes hooks instead of calling Server Actions directly.

---

# schemas/

Zod schemas shared by forms and Server Actions — product, pinout, address, checkout, search… Messages in Arabic. Built so far (✓): `brand.schema.ts`, `platform.schema.ts`, `product.schema.ts` (the listing fields every sold type spreads), `ic.schema.ts`, `programmer.schema.ts`, `controller.schema.ts`, `pinout.schema.ts`.

---

# lib/

Shared clients: Prisma client, React Query client, Clerk config (`arSA` localization), R2 client, Paymob config.

Built so far (✓):

- `prisma.ts` — **the database provider**: one `PrismaClient`, cached on `globalThis` outside production so dev hot-reloads don't open a new pool each time. `server-only`; imported by repositories alone.
- `query-client.ts` — `getQueryClient()`: a fresh client per server request, one per browser.
- `clerk.ts` — `clerkLocalization` (`arSA`) and `clerkAppearance` (design tokens).
- `env.ts` — `adminEmails` from `ADMIN_EMAILS`.
- `r2.ts` — `getR2()` / `getR2Bucket()`: the R2 `S3Client`, from `.env.local` (product-images.md).
- `errors.ts` — `ServiceError`: a business-rule failure with an Arabic message (+ `fieldErrors`).
- `prisma-errors.ts` — `isPrismaError(error, code)`, `uniqueTarget(error)`: Prisma errors by shape, never `instanceof` (the cached dev client outlives hot reloads).
- `action-handler.ts` — `forbiddenUnlessAdmin()`, `invalidInput(zodError)`, `runAction(label, fn)`: the shell of every admin action.
- `action-result.ts` — `unwrap()` / `ActionError` for hooks; `query-client.ts` does not retry an `ActionError`.

---

# messages/

```text
messages/
│
└── ar.ts        # every UI string, grouped by feature
```

v1 is Arabic-only, so no i18n library — components import from `@/messages/ar`. Keeping every string here (instead of inline) means an English storefront later is a matter of adding `en.ts` and a locale switch, not hunting through components.

---

# prisma/

```text
prisma/
│
├── schema.prisma
├── migrations/      # ✓ 0_init (baseline) + 20260928120000_add_user_clerk_id — always `migrate dev`, never `db push`
└── seed.ts          # Arabic mock data + the 27 governorates
```

---

# types/

Global TypeScript types: DTOs, `ActionResult`, search result, order summary.

Built so far (✓): `action-result.ts` (`ActionResult<T>` with optional `fieldErrors`), `user.ts` (`ClerkIdentity`, `SessionUser`, `SessionSummary`, `AuthCallbackResult`), `brand.ts` (`BrandListItem`, `BrandDetail`), `platform.ts` (`PlatformListItem`, `PlatformDetail`, `PlatformLinkCounts`), `ic.ts` (`IcListItem`, `IcDetail` — money as strings), `programmer.ts` (`ProgrammerListItem` with derived `modes`, `ProgrammerDetail`), `controller.ts` (`ControllerListItem` with its platform, `ControllerDetail` — litres as a string), `pinout.ts` (`PinoutListItem` with its platform and `hasPdf`, `PinoutDetail`).

---

# utils/

Pure functions — no React, no database.

- `normalize-identifier.ts` ✓ — `"sak-tc 1797.512"` → `"SAKTC1797512"` (admin table search, and the IC and controller `*Normalized` columns)
- `describe-platform-links.ts` ✓ — "12 كنترول، 3 آي سي" for the platform delete rule
- `stock-state.ts` ✓ — `stockState(qty, threshold)` → `inStock` / `low` / `out` (tones in `STOCK_STATE_META`)
- `format-price.ts` — EGP with `ar-EG`, Western digits (✓)
- `format-date.ts` — Arabic dates
- `egypt-phone.ts` — validate / normalise to `+20…`
- `slugify.ts` ✓ — `slugify()`, `SLUG_PATTERN`
- `pagination.ts`

---

# constants/

- `product-types.ts` ✓ (partly) — `IC_CATEGORIES`, `IC_CATEGORY_META`, `PROGRAMMER_MODES`, `PROGRAMMER_MODE_META`, `CONTROLLER_CONDITIONS`, `CONDITION_META`, `VIRGIN_META`, `STOCK_STATE_META` today; the `PRODUCT_TYPE_META` registry comes with the storefront
- `order-status.ts` — statuses, Arabic labels, allowed transitions
- `governorates.ts` — the 27 governorates (Arabic names + codes)
- `routes.ts` ✓ (`ROUTES`, `ADMIN_ROUTES`, `ADMIN_HARDWARE_ROOT`, `HOME_BY_ROLE`), `query-keys.ts` ✓, `navigation.ts` ✓ (`MAIN_NAV`), `admin-navigation.ts` ✓ (`ADMIN_SECTIONS`, `HARDWARE_FOLDER`, `ADMIN_NAV`, `findAdminSection`, `findAdminFolder`), `images.ts` ✓ (`IMAGE_MAX_BYTES`, `IMAGE_ACCEPT`), `pdf.ts` ✓ (`PDF_MAX_BYTES`, `PDF_ACCEPT`), `pinouts.ts` ✓ (`PINOUT_ACCESS_META`, `pinoutPdfHref`), `roles.ts`, `pagination.ts`

---

# Development Flow

Every feature follows the same order:

```text
1. Prisma model & migration
↓
2. Repository
↓
3. Service
↓
4. Zod schema
↓
5. Server Action
↓
6. React Query hook
↓
7. UI (Arabic, RTL-checked on mobile)
↓
8. Test
↓
9. Write the feature doc and tick it in "Related documents"
```

---

# Architecture Rules

- UI never talks to Prisma.
- UI talks only to React Query hooks.
  - *Exception:* read-only Server Component pages (catalog pages, the `/admin` figures) may call services directly for first-paint data and SEO. Document each one. Today: every `/admin/*` page (`authService.requireAdmin()`), the `/admin/brands`, `/admin/platforms`, `/admin/hardware/ics`, `/admin/hardware/programmers`, `/admin/hardware/controllers` and `/admin/hardware/pinouts` list prefetch and edit-page load (`brandService`, `platformService`, `icService`, `programmerService`, `controllerService`, `pinoutService`), the platforms prefetch on the IC, programmer, controller and pinout new/edit pages, and `/auth-callback` (`authService.requireSignedIn()`).
- Hooks call Server Actions.
- Server Actions call Services.
- Services call Repositories; only Repositories touch Prisma.
- Business logic lives only in Services.
- Auth checks run in pages and Server Actions via `auth.service.ts` — never only in `proxy.ts` or a layout (auth-feature.md "Protecting pages").
- Validation lives in Schemas.
- UI strings live in `messages/ar.ts`.
- Money is `Decimal` in EGP; identifiers are always searched through their normalised column.
- No physical direction classes (`ml`, `pr`, `left`, `text-left`) — logical only.

---

# Feature Example

```text
Search Feature

app/(app)/search/page.tsx
components/search/search-view.tsx
hooks/use-search.ts
actions/search/search-products.ts
services/search.service.ts
repositories/product.repository.ts
schemas/search.schema.ts
utils/normalize-identifier.ts
```

Workflow:

```text
SearchView  →  useSearch()  →  searchProductsAction()  →  searchService()
            →  normalizeIdentifier(query)  →  productRepository.search()  →  Prisma  →  PostgreSQL
```

---

# Benefits

- Same architecture as ECU Safe Zone — skills, patterns and components transfer directly
- Clear separation of responsibilities
- RTL and Arabic handled once, in shared places
- Scalable: a new sold category is a registry entry
- Easier testing and maintenance
- Predictable, documented development workflow
