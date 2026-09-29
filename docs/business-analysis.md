# Business Analysis

## Project Name

Control Safe Zone — **كنترول سيف زون**

---

# Project Overview

Control Safe Zone is an **Arabic-first e-commerce platform for the Egyptian market** that sells automotive electronics hardware to repair professionals: **ICs, controllers (ECU units), programmers and pinouts**.

It is the hardware sibling of ECU Safe Zone. ECU Safe Zone sells *files* (firmware) to a worldwide audience; Control Safe Zone sells *physical parts* shipped inside Egypt, priced in Egyptian Pounds, paid online or cash on delivery.

Like its sibling, it is **search-first**: a technician arrives with a part number, a chip marking or a controller name, not with a browsing mindset. The platform lets them find the exact part, confirm compatibility, order it, and receive it at their workshop.

The whole storefront is in **Arabic, right-to-left**. Technical identifiers (part numbers, markings, hardware numbers) stay in Latin characters, exactly as printed on the component.

---

# Problem Statement

Automotive electronics technicians in Egypt source parts from a scattered set of places — Facebook groups, WhatsApp sellers, a few physical shops in downtown Cairo, and expensive imports.

The result:

- No single place to search by part number or chip marking.
- Unclear stock — a seller says "available" and it is not.
- No compatibility information (which controller uses this IC, which programmer supports this ECU).
- Wiring diagrams (pinouts) passed around as low-quality photos.
- Payment trust issues — technicians hesitate to pay online for a part they have not seen.
- Slow, unpredictable delivery outside Cairo and Alexandria.

---

# Proposed Solution

A centralized Arabic marketplace that allows technicians to:

- Search ICs by part number or chip marking.
- Search controllers (ECU units) by hardware number, software number or controller model.
- Browse by car brand and by controller platform.
- See which programmers support a given controller, and in which mode (OBD / Boot / Bench).
- Get the pinout (wiring diagram) for a controller.
- Order parts with real-time stock, pay by card / mobile wallet / cash on delivery.
- Track orders and delivery to any governorate in Egypt.
- Reach support on WhatsApp in one tap.

---

# Target Market

- **Country:** Egypt only (for now).
- **Language:** Arabic (Egyptian audience), RTL layout. No English storefront in v1.
- **Currency:** EGP (ج.م). All prices stored and shown in EGP.
- **Shipping:** all 27 governorates, fee per governorate / zone.

---

# Target Audience

The platform is designed for automotive electronics professionals:

- ECU / module repair technicians
- Automotive electricians (كهربائي سيارات)
- Immobilizer & key programming specialists
- Chiptuners
- Workshops and service centers
- Parts resellers buying in quantity

The platform is **not** intended for regular vehicle owners.

---

# Product Categories

| Category | Arabic label | Nature | Sold? | Key identifiers |
|---|---|---|---|---|
| ICs | آي سيهات | Physical, stock-tracked | Yes | Part number, chip marking, package (QFP/BGA/SOIC…), manufacturer |
| Controllers | كنترولات | Physical ECU / module units, stock-tracked | Yes | Hardware number, software number, controller model (e.g. Bosch EDC17C46), condition |
| Programmers | أجهزة برمجة | Physical tools, stock-tracked | Yes | Name, supported controllers, OBD / Boot / Bench |
| Pinouts | بن أوت | Digital (image + PDF) | See open questions | Controller model, connector |

### Notes per category

- **ICs** — microcontrollers (e.g. TC1797, MPC5xx, MC9S12), EEPROMs (95xxx, 24Cxx, 93Cxx), drivers (e.g. L9xxx / TLExxxx), power ICs. One part can have several markings; search must match all of them.
- **Controllers** — each unit has a **condition**: New / Used / Refurbished, and optionally **Virgin** (ready to be coded to a new car). Two units with the same hardware number but different software numbers are different listings.
- **Programmers** — a programmer supports many controllers, and a controller is supported by many programmers (many-to-many), each with the modes it supports.
- **Pinouts** — a name, a preview image, a PDF and an optional link to a controller. The PDF lives in a private bucket and is served through a route.

---

# Business Goals

- Become the go-to Arabic source for automotive electronics parts in Egypt.
- Cut the time to find a part from "hours of asking in groups" to one search.
- Build trust through real stock, clear conditions, cash on delivery and WhatsApp support.
- Cross-sell: an IC → the controllers that use it → the programmer that flashes it → its pinout.
- Deliver reliably to every governorate.

---

# Core User Workflow

1. Open the website (Arabic, RTL).
2. Search by part number, chip marking, hardware number or controller.
3. View matching products with stock, condition and price in EGP.
4. Open a product — see compatibility, related programmers and pinout.
5. Add to cart (real quantity per line).
6. Checkout: phone number, governorate, city, address.
7. Choose payment: **card / mobile wallet (online)** or **cash on delivery**.
8. Receive confirmation (on-site + WhatsApp/SMS).
9. Track the order until delivery.

---

# Product Scope

The platform includes:

- Public marketing site (Arabic): home, about, support, policies
- Hardware catalog (ICs, controllers, programmers, pinouts)
- Search engine (part-number aware)
- Browse by car brand and by controller platform
- Shopping cart
- Checkout with Egyptian shipping & payment
- User accounts (orders, addresses, settings)
- Admin dashboard: products, stock, pinouts, programmers, orders, customers, shipping zones

---

# Core Business Features

## Search Engine

- Search by IC part number / chip marking
- Search by controller hardware / software number
- Search by controller model (e.g. EDC17C46, MED17.5, SIMOS)
- **Identifier normalisation**: case-insensitive, ignores spaces, dashes and dots, so `TC-1797`, `tc1797` and `TC 1797` all match
- Autocomplete suggestions
- Filters: category, brand, manufacturer, condition, in stock, price range
- Sorting: relevance, price, newest
- Pagination (URL-driven)

## Product Catalog

- Product details and specifications
- Images gallery
- Stock status (in stock / low stock / out of stock)
- Condition (controllers)
- Compatible vehicles / controllers
- Related products (cross-sell across categories)

## Programmers

- Listing with supported controllers
- OBD / Boot / Bench flags per supported controller
- "Which programmer supports this controller?" shown on the controller page

## Pinouts

- Listing with search by controller
- Preview image, downloadable PDF served from private storage

## Shopping Experience

- Cart with per-line quantity, stock-validated
- Checkout with Egyptian address (governorate → city → address, phone required)
- Shipping fee computed from governorate
- Payment: online (card, mobile wallets) or cash on delivery
- Order confirmation page + notification

## Orders & Fulfilment

- Order statuses:
  `PENDING_PAYMENT → CONFIRMED → PROCESSING → SHIPPED → DELIVERED`, plus `CANCELLED` and `RETURNED`
- COD orders start as `PENDING_CONFIRMATION` and are confirmed by phone/WhatsApp before processing
- Stock is **reserved at order creation** and released on cancellation / payment failure
- Sequential human-readable order number (e.g. `CSZ-10234`)

## User Management

- Authentication (Clerk, Arabic localization)
- Profile: name, phone, workshop name
- Saved addresses
- Order history and tracking

## Administration

- Product management (ICs, controllers, programmers) with stock
- Pinout management (image + PDF upload)
- Programmer ↔ controller compatibility editor
- Brand / controller platform reference data
- Order management (status transitions, COD confirmation, shipping tracking number)
- Customer management
- Shipping zones & fees per governorate
- Dashboard analytics (sales, orders by status, low stock)

---

# Functional Requirements

The system shall allow users to:

- Search products by technical identifiers with normalised matching.
- Browse products by category, brand and controller platform.
- View real-time stock and product condition.
- Add products to a cart with quantities and check out.
- Pay online or choose cash on delivery.
- Enter an Egyptian shipping address and see the shipping fee before paying.
- Track orders and view order history.
- Download pinout PDFs (according to the access rule decided — see open questions).
- Manage their profile and addresses.

The system shall allow admins to:

- Manage all products, stock, pinouts and programmer compatibility.
- Manage orders through the status state machine.
- Manage shipping zones and fees.
- View sales and stock analytics.

---

# Non-Functional Requirements

- **Arabic RTL** throughout — `<html lang="ar" dir="rtl">`, logical CSS properties (`ms-*`, `me-*`, `ps-*`, `pe-*`), an Arabic font (e.g. IBM Plex Sans Arabic or Cairo).
- Technical identifiers rendered LTR inside RTL text (`dir="ltr"` / `<bdi>`).
- Arabic-Indic vs Western digits: use **Western digits** for prices and part numbers (technicians read part numbers in Latin).
- Currency formatting: `Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP" })`.
- Fast search performance
- Mobile-first — most technicians browse from their phone in the workshop
- Secure authentication and payment webhooks (HMAC verification)
- SEO-friendly Arabic pages (Arabic metadata, slugs, Open Graph)
- Reliable error handling with Arabic error messages
- Scalable architecture (same layered architecture as ECU Safe Zone)

---

# Payments (Egypt)

Stripe is not the right fit for an Egyptian merchant selling in EGP. The platform uses a local gateway plus cash on delivery:

- **Primary online gateway:** Paymob (cards, Meeza, mobile wallets such as Vodafone Cash, and more) — alternatives: Kashier, Fawry.
- **Cash on delivery (COD):** available on all orders, possibly with a small COD fee or a maximum order value.
- Payment confirmation arrives through a **webhook** (`/api/webhooks/payment`) verified with HMAC — the only thing that marks an online order as paid.

The payment provider sits behind a `payment.service.ts` interface so the gateway can be swapped without touching checkout.

---

# Assumptions

- Users know the part number, chip marking or controller model they need.
- The platform helps find and supply parts; it does not diagnose vehicles or repair boards.
- Stock is held by the business (not a multi-vendor marketplace) in v1.
- Delivery is handled by a shipping company (e.g. Bosta / Aramex / J&T); v1 stores a tracking number manually, later integration via API.

---

# Milestones

| # | Milestone | Outcome |
|---|---|---|
| M0 | Foundation | Next.js app, Arabic RTL layout, fonts, Tailwind + shadcn, Prisma + Postgres, Clerk (Arabic), folder structure, docs |
| M1 | Data model & admin reference data | Prisma schema, brands, controller platforms, admin shell & access control |
| M2 | Admin product management | CRUD for ICs, controllers, programmers (+ compatibility), pinouts, R2 image/PDF upload |
| M3 | Storefront catalog | Marketing pages, category pages, product detail, search with normalisation |
| M4 | Cart & checkout | Cart, Egyptian address, shipping zones, order creation with stock reservation |
| M5 | Payments | Paymob integration + webhook, cash on delivery flow |
| M6 | Orders & accounts | Customer order history/tracking, admin order queue & state machine |
| M7 | Polish & launch | SEO, analytics dashboard, WhatsApp notifications, performance, seeding, deploy |

---

# Future Enhancements

- English storefront (i18n)
- Shipping company API integration (live tracking, automatic airway bills)
- WhatsApp Business API notifications
- Wholesale / reseller pricing tiers
- Back-in-stock alerts
- Wishlist and recently viewed
- Customer reviews
- Board repair service requests (send your ECU for repair)
- Link to ECU Safe Zone (buy the controller here, the firmware there)

---

# Open Questions

The following decisions require confirmation:

1. **Pinouts** — free for everyone, free for signed-in users only, or paid digital products?
   *(Default until decided: free for signed-in users — it drives sign-ups and cross-sells the hardware.)*
2. **Programmers** — sold with stock like ICs and controllers, or listed only (as in ECU Safe Zone)?
   *(Default: sold.)*
3. **COD limits** — maximum order value for cash on delivery? COD fee?
4. **Payment gateway** — Paymob, Kashier or Fawry? Does the business have a commercial register / tax card ready for onboarding?
5. **Shipping** — flat fee per governorate, or weight-based? Which courier?
6. **Controllers** — one listing per physical unit (quantity 1, unique serial), or one listing per hardware/software number with stock count?
7. **Prices** — shown including VAT?

These decisions directly impact the database design, checkout and admin UI.

---

# Conclusion

Control Safe Zone is an Arabic, Egypt-focused, search-first hardware store that lets automotive electronics technicians find the exact IC, controller, programmer or pinout they need, trust the stock and the price, pay the way they prefer, and receive it anywhere in Egypt.
