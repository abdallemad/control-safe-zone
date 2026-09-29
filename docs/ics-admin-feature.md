# ICs Admin Feature

Admin CRUD for **ICs**, the chips the store sells: "SAK-TC1797-512F180EF AC", "M95320-WMN6TP", "L9132". It covers the list, create, edit and delete, with the cover image uploaded to R2 and links to the controller platforms the chip is used on.

- Routes: `/admin/hardware/ics` (list), `/admin/hardware/ics/new`, `/admin/hardware/ics/[id]/edit`. Create and edit are full pages.
- Sidebar: **الكتالوج › الهاردوير › الآي سيهات**.
- Built **the same way as brands**, the reference CRUD. Read [`brands-feature.md`](./brands-feature.md) for the layers, conventions and shared plumbing. This doc covers what differs.
- The storefront side (`/ics`, search) is still to come in `ics-feature.md`.

An IC is **not one row**. It is written as three pieces:

```text
Product (type IC)      listing: name, slug, manufacturer, price, stock, cover, flags
└── IcDetails          the chip: part number, markings[], category, package, pins, datasheet
    └──< IcPlatform    the controller platforms it is found on, with an optional role
```

The service writes all three in **one nested Prisma write**. That keeps the schema's invariant: a product of type IC has exactly one `IcDetails` row.

---

## Files

| Layer | File |
|---|---|
| Pages | `app/(admin)/admin/hardware/ics/page.tsx` (prefetch + `HydrationBoundary`), `new/page.tsx` and `[id]/edit/page.tsx` (both also prefetch the platforms for the picker). Each starts with `requireAdmin()` |
| UI | `components/admin/ics/ics-view.tsx`, `ic-editor.tsx`, `delete-ic-dialog.tsx`. The cover tile (`ProductImage` with the `Cpu` glyph) and the stock column (`StockCell`) are shared: `components/admin/products/` |
| Form | `components/forms/ic-form.tsx` (presentational, `standardSchemaResolver(icSchema)`). The side column (cover, price & stock, visibility) and the platform picker come from `product-listing-fields.tsx` |
| Form parts | `components/forms/tag-input.tsx`: **new, reusable**. A `string[]` edited as chips (markings today) |
| Hooks | `hooks/use-ics.ts`: `useIcs`, `useCreateIc`, `useUpdateIc`, `useDeleteIc`, `useUploadIcImage` |
| Actions | `actions/ic/list-ics.ts`, `create-ic.ts`, `update-ic.ts`, `delete-ic.ts`, `upload-ic-image.ts` |
| Schema | `schemas/ic.schema.ts`: `icSchema`, `icIdSchema` |
| Service | `services/ic.service.ts` |
| Repository | `repositories/ic.repository.ts` (`prisma.product`, every query scoped to `type: "IC"`) |
| Types | `types/ic.ts`: `IcListItem`, `IcDetail` |
| Constants | `constants/product-types.ts`: **new**. `IC_CATEGORIES`, `IC_CATEGORY_META`, `STOCK_STATE_META` |
| Utils | `utils/stock-state.ts`: **new**. `stockState(qty, threshold)` → `inStock` / `low` / `out` |
| Strings | `messages/ar.ts` → `ics` for the chip and the IC wording, plus the shared `products` (listing labels, validation, errors), `stock` and `dropzone` |

Since the programmers CRUD, the parts every sold type shares live in **`product.*` files**: the listing fields in the schema, `product.repository.ts`, `product.service.ts` (listing columns, money, Prisma errors, the order-history delete rule), and the shared form cards. `ic.*` keeps only the chip, its links and the IC wording. See [`programmers-admin-feature.md`](./programmers-admin-feature.md#shared-product-layer).

---

## Fields

**The chip** (`IcDetails`)

| Field | Rule | Notes |
|---|---|---|
| `partNumber` | 2–60 | As in the datasheet. LTR, mono. The service also writes `partNumberNormalized` |
| `manufacturer` | 2–40 | The **chip maker** (Infineon, NXP, ST). Stored on `Product`. The form suggests existing makers (`<datalist>`) |
| `category` | `IcCategory` | معالج · إيبروم · فلاش · درايفر · تغذية · أخرى. Required: the select starts empty |
| `markings` | ≤ 20, each 1–40, no duplicates by normal form | What is printed on the package. Edited with `TagInput`: Enter or a comma adds one, a pasted "TC1797, 5P08C3" adds both, and "tc-1797" is refused next to "TC1797". The service writes `markingsNormalized` |
| `package` | ≤ 30, optional | "LQFP-176" |
| `pinCount` | whole number 1–2000, optional | |
| `datasheetUrl` | ≤ 500, optional, must be `http(s)://…` | An external link, never a stored file. `javascript:` and similar are refused |

**The listing** (`Product`)

| Field | Rule | Notes |
|---|---|---|
| `name` | 2–120 | The card title, **Arabic**: "معالج Infineon TC1797" |
| `slug` | 2–80, `SLUG_PATTERN` | Filled from **manufacturer + part number** (`infineon-sak-tc1797-512f180ef-ac`) with a live `/ics/…` preview. It stops once typed in and never changes on edit. **Unique across all products**, not just ICs |
| `description` | ≤ 2000, optional | |
| `imageUrl` | `null` or `/api/images/products/<uuid>.(png\|jpg\|webp)` | The cover. Without one, the admin and the store show the `Cpu` glyph, never a placeholder photo |
| `price` | text, `^\d{1,8}(\.\d{1,2})?$`, > 0 | **A string end to end**: typed, validated, then written straight into `Decimal(10, 2)`, so it never passes through a float |
| `compareAtPrice` | same format, optional, **must be higher than `price`** | The struck-through "was" price. A lower or equal one is refused, so there's never a fake discount |
| `stockQuantity` | whole number 0–100 000 | Units on the shelf and not promised to an order. A cleared field fails, it doesn't become 0 |
| `lowStockThreshold` | whole number 0–10 000 | Defaults to 2 |
| `isActive`, `isFeatured` | boolean | Inactive: hidden from the store. Featured: on the landing page |

**Platforms** (`IcPlatform`): up to 50 rows of platform + optional role ("main MCU", ≤ 60), with no platform twice.

---

## Rules (`ic.service.ts`)

| Rule | Why |
|---|---|
| **Normalised twins** on every write: `partNumberNormalized`, `markingsNormalized` (`normalizeIdentifier`). Markings are de-duplicated by that form, keeping the first spelling | Search matches the normalised query against these columns (business-analysis "Identifier normalisation") |
| **One nested write** creates `Product` + `IcDetails` + links. Update rewrites both rows and **replaces the platform links** (`deleteMany` + `create`) in the same write | The one-detail-row invariant, and no half-saved IC |
| Every linked platform must exist, checked before the write. Otherwise a field error on `platforms`: "إحدى المنصات المختارة لم تعد موجودة…". A platform deleted between the check and the write (`P2018` / `P2003`) gets the same message | The form's platform list can be stale |
| Duplicate slug (`P2002`) → field error "هذا الرابط مستخدم لمنتج آخر." | `Product.slug` is unique across ICs, controllers and programmers |
| Every query is scoped to `type: "IC"` | A controller's or programmer's id is "not found" here, never edited as a chip |
| Replacing or removing the cover deletes the old file from R2 after the save | Same as brand logos |
| **Delete refused while any order contains the IC**: "لا يمكن حذف آي سي موجود في 4 طلب…", counting distinct orders (also on the `P2003` race). Shared rule: `productService.remove` | `OrderItem → Product` is `Restrict`: an order is a receipt. Deactivate to withdraw a listing instead |
| Otherwise delete cascades to `IcDetails`, `IcPlatform`, gallery rows, cart lines and vehicle links, then removes the cover **and gallery** files from R2 | No orphaned images |
| Missing row → "الآي سي غير موجود — ربما حُذف." | |
| Money leaves the service as **strings** (`Decimal.toString()`) | `Decimal` is a class instance and can't cross to the client |

There is **no uniqueness rule on the part number**. The schema allows several listings of one part, for example two packages, or a pre-coded EEPROM for a specific car. Add a check here if the business decides otherwise.

---

## List

- Columns:
  - cover (hidden below `sm`);
  - the IC: part number in mono with a ★ when featured, the Arabic name beneath, and the markings on `lg`;
  - category with the maker beneath (`md`);
  - price, via `<Price>` with the real compare-at struck through (`sm`);
  - stock;
  - platform count (`lg`);
  - status (`md`);
  - actions.
- **Stock** follows design-system "Status tones": متوفر (`success`), كمية محدودة at or below the threshold (`warning`), نفد المخزون at 0 (`neutral`), with the unit count beneath.
- Sorted by last update, newest first.
- **Search uses identifier normalisation** over the part number, every marking, the name, maker + part number, the package and the slug: "5p08-c3" finds every chip marked 5P08C3, and "tc 1797" finds SAK-TC1797….
- A **category filter** (كل الأنواع / معالج / إيبروم…) combines with the search.
- The delete dialog blocks up front when `ordersCount > 0`, with the same sentence the service uses. `ordersCount` counts **distinct orders**, not order lines, so one order holding the IC twice says "1 طلب". This was fixed with the programmers CRUD.
- Mutations invalidate **the ICs and the platforms** queries, because the platforms table counts linked ICs.

---

## Form

- Layout: the chip, the listing and the platforms on the main column. Cover, price & stock and the two switches on the side.
- `MoneyInput` (inside `ic-form.tsx`): a text input with `inputMode="decimal"` and the "ج.م" suffix.
- Number fields go through `setValueAs`: `""` → `NaN` for required numbers, so validation fails; `""` → `null` for the optional pin count.
- Platform rows use `useFieldArray`. The picker lists every platform as "Bosch EDC17C46", and the "إضافة منصة" button disables once every platform (or 50) is used. With no platforms in the catalog, the card links to `/admin/platforms/new` instead.
- Zod runs the object-level checks (compare-at vs price, duplicate markings or platforms) only once the per-field types are valid. So "السعر قبل الخصم يجب أن يكون أعلى…" can appear on a second submit, after the category is picked.

---

## Not in this CRUD

- **Gallery images** (`ProductImage`): cover only. The delete already cleans gallery files.
- **Compatible vehicles** (`ProductVehicle`).
- **`weightGrams`**: unused while shipping is flat per governorate.

---

## Verified

- **Service**, through a temporary route since deleted, against the dev DB:
  - create with three markings, one of them a normal-form duplicate. It was de-duplicated, and both normalised columns were checked in the database;
  - duplicate slug → `fieldErrors.slug`;
  - an unknown platform id → `fieldErrors.platforms`, with no row written;
  - update: new price, compare-at removed, markings replaced, platform links dropped to 0;
  - the list item's counts;
  - `getById` with a non-IC id → `null`;
  - delete refused while an order line referenced the IC ("…في 1 طلب…"), then allowed once the order was removed;
  - deleting twice → not found;
  - schema: compare-at not higher, 3 decimals, a zero price, duplicate markings, duplicate platforms, a missing category, a `NaN` stock and a `javascript:` datasheet are all refused.

  All test rows (the IC, platform, user, zone and order) were removed.
- **UI**, on temporary pages since deleted:
  - the list with sample rows, and the three stock states;
  - normalised search on a marking, and the category filter;
  - the delete dialog blocked by orders;
  - the form's auto-slug from maker + part number;
  - chips from a comma-separated paste with the duplicate dropped;
  - the field errors, and the compare-at error;
  - a platform row;
  - the server's "admins only" refusal on submit;
  - no page overflow at 375px.
- **Guards**: all three routes redirect to sign-in when signed out.
- `tsc --noEmit` and `eslint` are clean.
- **Not exercised**:
  - the flow as a signed-in admin, which needs a Clerk account;
  - a real image upload for ICs. It uses the same `storageService.uploadImage` as brand logos, with the `products` folder.
