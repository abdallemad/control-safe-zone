# Changelog

Notable changes to Control Safe Zone, newest first. Milestones refer to
[docs/business-analysis.md](docs/business-analysis.md#milestones).

---

## 2026-10-01 — Pinouts CRUD (M2)

**الهاردوير › البن أوت** gets the same admin treatment as controllers. The
placeholder is replaced by a list plus create, edit and delete, with create
and edit as full pages. A pinout is **not a `Product`** (no price, stock or
orders), so it uses the reference-CRUD layers rather than the shared product
layer. It has two files: a **preview image** on R2 (public, like covers) and a
**PDF** in the private side of the bucket, served only by the new
`GET /api/pinouts/[id]/pdf` after an access check. This finishes the admin
side of M2's catalog. Full reference:
[docs/pinouts-admin-feature.md](docs/pinouts-admin-feature.md).

### Added

- **Pages**:
  - `/admin/hardware/pinouts`: the list, prefetched and hydrated. It shows the preview, the name with the connector beneath, the platform (or **بدون منصة**), a **PDF / بدون PDF** badge, the **download access** badge (للمسجّلين / للجميع) and status. It has normalised search, a **platform filter** (including "بدون منصة"), a row menu with **فتح الـ PDF**, and loading, empty, error and no-results states.
  - `/admin/hardware/pinouts/new` and `/[id]/edit`: full-page forms that prefetch the platforms. Every page calls `requireAdmin()`.
- **Route**: `GET /api/pinouts/[id]/pdf`, the third Route Handler. The access rule lives in `pinoutService.openPdf`:
  - admins can open every PDF, including an inactive pinout's;
  - otherwise an inactive pinout is a 404;
  - with `requiresSignIn`, someone signed out is sent to `/sign-in`;
  - the response is `application/pdf`, `inline`, named after the slug, `private, no-store`.
- **Layers**:
  - `schemas/pinout.schema.ts`:
    - name 2–120;
    - an optional platform and connector;
    - only our own preview URL and PDF key;
    - **at least one of the two files**.
  - `repositories/pinout.repository.ts` and `types/pinout.ts`. The list carries `hasPdf`, never the key.
  - `services/pinout.service.ts`, with these rules:
    - an unknown platform is an error on `platformId`;
    - update can link, move or unlink the platform;
    - a replaced or removed preview **or PDF** is deleted from R2 after the save;
    - the delete is never refused, and both files leave R2 with the row.
  - `actions/pinout/*`, including `upload-pinout-pdf.ts`.
  - `hooks/use-pinouts.ts`, which also invalidates the platforms list.
  - `queryKeys.pinouts`.
- **Components**:
  - `components/admin/pinouts/*`: view, editor, delete dialog.
  - `components/forms/pinout-form.tsx`:
    - the slug fills from platform + connector, or from the name when no platform is picked, with a live `/pinouts/…` preview;
    - the files card (preview + PDF);
    - the access card (`requiresSignIn`, on by default per open question 1, and `isActive`).
  - `components/forms/pdf-dropzone.tsx`, **reusable**: the PDF sibling of `FileDropzone`. It holds a private key, shows the picked file's name and size, and opens the saved file through the PDF route.
- **Constants**: `constants/pdf.ts` (`PDF_MAX_BYTES` 10 MB, `PDF_ACCEPT`) and `constants/pinouts.ts` (`PINOUT_ACCESS_META`, `pinoutPdfHref`).
- **Strings**: `ar.pinouts`, `ar.pdfDropzone`, `ar.errors.uploadPdf`.
- **Docs**: `docs/pinouts-admin-feature.md`.

### Changed

- **`storage.service.ts`**:
  - PDFs: `uploadPdf`, which checks the `%PDF-` magic bytes and the 10 MB cap; `deletePdfByKey`; `getPdf`; and `isValidPdfKey`.
  - Keys are `pinout-pdfs/<uuid>.pdf`, a prefix the public image route can never serve.
  - The image functions now share private put / delete / get helpers, with no behaviour change.
- **`next.config.ts`**: `serverActions.bodySizeLimit` goes from `3mb` to `11mb` for the 10 MB PDFs. Each service still enforces its own cap.
- **Docs**:
  - `admin-dashboard.md`: pinouts marked as built.
  - `folder-structure.md`: ticks the new doc, and marks the new files and the PDF route.
  - `product-images.md`: pinout previews are live; PDFs, the body limit and the presigner note.
  - `design-system.md`: the pinout access tones.
  - `brands-feature.md`: copy checklist.

### Notes

- **Verified against the dev DB and R2**, using a temporary route since deleted:
  - three PDF upload refusals (wrong bytes, too large, empty);
  - create; duplicate slug; an unknown platform on `platformId` with nothing written;
  - seven schema cases;
  - the platform's delete refused while the pinout is linked;
  - update replacing the PDF and removing the preview, with **both old objects confirmed gone from R2**;
  - delete removing the new PDF; not found twice.
- **Verified over HTTP**: the PDF route returned 303 to sign-in, 404 for an unknown id, 200 with the right headers and bytes once public, and 404 once inactive. The PDF's key requested through the **image** route returned 404.

  The run confirmed no test rows or R2 objects were left.
- **Verified in the browser**, on a temporary page since deleted:
  - the list's badges, search and no-results state, and the **platform filter and row menu popups**;
  - the delete dialog's "admins only" refusal and the empty state;
  - the form's errors, both auto-slug paths, and the PDF picker's browser and server refusals;
  - the edit form pre-filled, with the saved PDF's فتح link;
  - 375px layout; no console errors.

  All pinout routes redirect to sign-in when signed out.
- **Not exercised**:
  - the signed-in admin flow;
  - the PDF route as a signed-in customer or admin.
- `npm run lint` already failed before this change, on the generated Prisma client (`src/generated`). Everything else lints clean.

---

## 2026-09-30 — Controllers CRUD (M2)

**الهاردوير › الكنترولات** gets the same admin treatment as ICs and
programmers. The placeholder is replaced by a list plus create, edit and
delete, with create and edit as full pages and the cover on R2. A controller
is the third sold type: a `Product` plus its `ControllerDetails` row (one
platform, the label's numbers, condition and the فيرجن flag), written
together on the shared product layer. Full reference:
[docs/controllers-admin-feature.md](docs/controllers-admin-feature.md).

### Added

- **Pages**:
  - `/admin/hardware/controllers`: the list, prefetched and hydrated. It shows the cover, the hardware number with the software number and Arabic name beneath, the platform, the **condition** and **فيرجن** badges, price with a real compare-at, stock and status. It has normalised search, a **condition filter**, a row menu, and loading, empty, error and no-results states.
  - `/admin/hardware/controllers/new` and `/[id]/edit`: full-page forms that prefetch the platforms. Every page calls `requireAdmin()`.
- **Layers**:
  - `schemas/controller.schema.ts`: a required platform, the hardware number (2–60), optional software / part / serial numbers, a required condition, and litres kept as a string matching `Decimal(3, 1)`.
  - `repositories/controller.repository.ts`: scoped to `type: "CONTROLLER"`, the list selecting the unit's platform.
  - `services/controller.service.ts`, with these rules:
    - **`hardwareNumberNormalized`, `softwareNumberNormalized` and `partNumberNormalized` are written on every save** (`null` when the number is empty);
    - an unknown platform is an error on the **`platformId`** field;
    - update can move the unit to another platform;
    - the delete is refused by order history, as for every sold type.
  - `actions/controller/*`, `hooks/use-controllers.ts` (which also invalidates the platforms list) and `types/controller.ts`.
  - `queryKeys.controllers`.
- **Components**:
  - `components/admin/controllers/*`: view, editor, delete dialog.
  - `components/forms/controller-form.tsx`:
    - the platform picker, which fills the manufacturer when it is empty;
    - hardware, software, part and serial numbers, condition, litres and the فيرجن switch;
    - the slug fills from platform + hardware + software number, with a live `/controllers/…` preview.
- **Constants**: `CONTROLLER_CONDITIONS`, `CONDITION_META` and `VIRGIN_META`, with the design-system tones.
- **Strings**: `ar.controllers`.
- **Docs**: `docs/controllers-admin-feature.md`.

### Changed

- **Shared product layer**, backwards-compatible:
  - `productService.assertPlatformsExist` and `productService.rethrow` take an optional form field for the "platform no longer exists" error. ICs and programmers keep `platforms`; controllers use `platformId`.
  - `refineProductListing` accepts a value without `platforms`.
- **Docs**:
  - `admin-dashboard.md`: controllers marked as built.
  - `folder-structure.md`: ticks the new doc and marks the new files.
  - `programmers-admin-feature.md`: the shared layer notes controllers and the new parameters.
  - `brands-feature.md`: copy checklist.
  - `product-images.md` and `design-system.md` (condition tones implemented).

### Notes

- **Verified against the dev DB**, using a temporary route since deleted:
  - create, with the three normalised twins checked in the database;
  - duplicate slug, and an unknown platform on `platformId` with nothing written;
  - update moving platforms and clearing the optional numbers;
  - the platform's delete refused while the unit sits on it;
  - the order block, counting distinct orders, then delete, then not found;
  - eight schema refusals;
  - an **IC regression** through the changed shared helpers, and type scoping both ways.

  The run confirmed no test rows were left.
- **Verified in the browser**, on a temporary page since deleted:
  - the list's condition, فيرجن and stock badges, and normalised search;
  - the form's auto-slug, the required-field and litres errors, and the edit form pre-filled;
  - the compare-at error and the "admins only" refusal;
  - 375px layout.

  All controller routes redirect to sign-in when signed out.
- **Not exercised**:
  - the signed-in admin flow;
  - a real image upload;
  - opening the platform and condition pickers, the condition filter and the row menu. The browser pane was hidden, so popups couldn't open. They are the same components exercised on the IC pages.
- **No uniqueness on hardware / software / serial numbers**: open question 6 (one listing per unit, or per number with stock) is still open.

---

## 2026-09-29 — Programmers CRUD and the shared product layer (M2)

**الهاردوير › المبرمجات** gets the same admin treatment as ICs. The
placeholder is replaced by a list plus create, edit and delete, with create
and edit as full pages and the cover on R2. It also adds the
**compatibility editor**: which controller platforms a tool reads, over
OBD, Boot or Bench.

Programmers are the second sold type, so what they share with ICs moved into
`product.*` files instead of being copied. The IC CRUD now runs on them,
re-verified. Full reference:
[docs/programmers-admin-feature.md](docs/programmers-admin-feature.md).

### Added

- **Pages**:
  - `/admin/hardware/programmers`: the list, prefetched and hydrated. It shows the cover, tool name, edition badge, Arabic name, maker, price with a real compare-at, stock, the derived **support-mode badges** (OBD · Boot · Bench), platform count and status. It has normalised search, a **mode filter**, a row menu, and loading, empty, error and no-results states.
  - `/admin/hardware/programmers/new` and `/[id]/edit`: full-page forms that prefetch the platforms. Every page calls `requireAdmin()`.
- **Layers**:
  - `schemas/programmer.schema.ts`: each support row needs **at least one mode ticked**.
  - `repositories/programmer.repository.ts`: scoped to `type: "PROGRAMMER"`.
  - `services/programmer.service.ts`, with these rules:
    - **tool names are unique regardless of case**, checked up front and on `P2002` ("kess v3" = "KESS V3");
    - supports are replaced on update;
    - the list's `modes` are derived from the support rows.
  - `actions/programmer/*`, `hooks/use-programmers.ts` (which also invalidates the platforms list) and `types/programmer.ts`.
- **Components**:
  - `components/admin/programmers/*`: view, editor, delete dialog.
  - `components/forms/programmer-form.tsx`:
    - tool, maker (with suggestions), edition and box contents;
    - the slug fills from maker + tool + edition;
    - support rows with a platform picker, OBD / Boot / Bench checkboxes and notes.
- **Shared product layer**, used by ICs and programmers, and next by controllers:
  - `schemas/product.schema.ts`: the listing fields and cross-field rules.
  - `repositories/product.repository.ts`.
  - `services/product.service.ts`: listing columns, money as strings, Prisma error wording, platform checks, cover cleanup, and the order-history delete rule.
  - `components/forms/product-listing-fields.tsx`: the image, pricing and visibility cards, `MoneyInput`, `PlatformSelect` and `NoPlatformRows`.
  - `components/admin/products/product-image.tsx` and `stock-cell.tsx`.
- **Constants**: `PROGRAMMER_MODES` and `PROGRAMMER_MODE_META`.
- **Strings**: `ar.programmers`, plus the shared `ar.products`.
- **Docs**: `docs/programmers-admin-feature.md`.

### Changed

- **ICs moved onto the shared layer**, with the same behaviour:
  - `ic.schema.ts` spreads `productListingShape`;
  - `ic.service.ts` and `ic.repository.ts` keep only the chip-specific parts;
  - `ic-form.tsx` uses the shared cards;
  - `ics-view.tsx` uses `ProductImage` and `StockCell`, and `ic-image.tsx` is removed.
- **Strings**: the IC listing labels, validation and errors that both types share moved from `ar.ics` to `ar.products`. `ar.ics` keeps the chip fields and the IC wording.
- **Docs**:
  - `ics-admin-feature.md`: files and the shared layer.
  - `admin-dashboard.md`: programmers marked as built.
  - `folder-structure.md`: ticks the new doc and marks the new files.
  - `brands-feature.md`: copy checklist.
  - `product-images.md` and `design-system.md`.

### Fixed

- **The order-history delete message counted order lines, not orders.** One order holding a product twice said "موجود في 2 طلب". Both the refusal (`countOrders`) and the list's `ordersCount` (`productOrdersSelect`) now count distinct orders. This affected ICs too.

### Notes

- **Verified against the dev DB**, using a temporary route since deleted:
  - programmer create, update and delete;
  - case-insensitive tool name, duplicate slug and unknown platform;
  - derived modes, and the platforms' programmer counts;
  - scoping by type, both ways;
  - the order block, with distinct orders;
  - six schema refusals;
  - an **IC regression** through the shared layer.

  The run confirmed no test rows were left.
- **Verified in the browser**, on temporary pages since deleted:
  - the list, search, and the blocked delete dialog;
  - form auto-slug, support rows, and the mode-required and compare-at errors;
  - the "admins only" refusal;
  - the IC form on the shared cards;
  - 375px layout.

  All programmer routes redirect to sign-in when signed out.
- **Not exercised**:
  - the signed-in admin flow;
  - a real image upload;
  - opening the platform picker and mode-filter dropdowns on the programmer pages. The browser pane was hidden, so popups couldn't open. They are the same `Select` components exercised on the IC pages.
- **One listing per tool**: `ProgrammerDetails.toolName` is unique, so Master and Slave editions can't be separate listings until that index changes.

---

## 2026-09-29 — ICs CRUD (M2)

**الهاردوير › الآي سيهات** gets the same admin treatment as brands. The
placeholder is replaced by a list plus create, edit and delete, with create
and edit as full pages. The cover image goes to R2 and each IC can be linked
to controller platforms. It is the first sold type: an IC is a `Product`
plus its `IcDetails` row and `IcPlatform` links, all written together. Full
reference: [docs/ics-admin-feature.md](docs/ics-admin-feature.md).

### Added

- **Pages**:
  - `/admin/hardware/ics`: the list, prefetched and hydrated. It shows the cover, part number, name, markings, category and maker, price with a real compare-at, stock badge and count, platform count and status. It has normalised search, a category filter, a row menu, and loading, empty, error and no-results states.
  - `/admin/hardware/ics/new` and `/admin/hardware/ics/[id]/edit`: full-page forms. Both prefetch the platforms for the picker. Every page calls `requireAdmin()`.
- **Layers**:
  - `schemas/ic.schema.ts`:
    - money is a string (`^\d{1,8}(\.\d{1,2})?$`) end to end, so it never goes through a float;
    - the compare-at price must be higher than the price;
    - markings and platforms can't repeat;
    - the datasheet link must be `http(s)`.
  - `repositories/ic.repository.ts`: every query scoped to `type: "IC"`.
  - `services/ic.service.ts`, with these rules:
    - one nested write for `Product` + `IcDetails` + platform links;
    - **`partNumberNormalized` and `markingsNormalized` are written on every save**;
    - platform links are replaced on update;
    - an unknown platform or a duplicate slug returns an error on that field;
    - a replaced cover is deleted from R2;
    - **delete is refused while any order line references the IC**; otherwise the cover and gallery files leave R2 too.
  - `actions/ic/*`: list, create, update, delete and upload-image.
  - `hooks/use-ics.ts`: mutations also invalidate the platforms list, whose IC counts change.
  - `types/ic.ts`.
- **Components**:
  - `components/admin/ics/*`: view, editor, delete dialog, `IcImage`.
  - `components/forms/ic-form.tsx`:
    - the slug fills from maker + part number, with a live `/ics/…` preview;
    - maker suggestions;
    - a category `Select`;
    - platform rows through `useFieldArray`;
    - `MoneyInput` with the "ج.م" suffix.
  - `components/forms/tag-input.tsx`, **reusable**: a `string[]` edited as chips. Enter or a comma adds one, a pasted list adds all of them, duplicates are dropped by a caller-supplied normal form, and Backspace removes the last.
- **Shared**:
  - `constants/product-types.ts`: `IC_CATEGORIES`, kept in sync with the Prisma enum by `satisfies`. Also `IC_CATEGORY_META` (Arabic labels) and `STOCK_STATE_META` (design-system stock tones).
  - `utils/stock-state.ts`: `stockState(qty, threshold)`.
- **Strings**: `ar.ics`, `ar.stock`, and `ar.dropzone`, which is now shared by every image picker.
- **Docs**: `docs/ics-admin-feature.md`.

### Changed

- **The dropzone strings** moved from `ar.brands.dropzone` to `ar.dropzone`, and `brand-form.tsx` reads them from there. There's no visible change.
- **Docs**:
  - `admin-dashboard.md`: ICs marked as built.
  - `folder-structure.md`: ticks the new doc and marks the new files as built.
  - `brands-feature.md`: the copy checklist lists ICs, and the strings row points at `ar.dropzone`.
  - `product-images.md`: `Product.imageUrl` is live.
  - `design-system.md`: the stock tones are implemented, and the chip-input pattern is added.

### Notes

- **Verified against the dev DB**, using a temporary route since deleted:
  - create, with markings de-duplicated and both normalised columns checked;
  - duplicate slug;
  - unknown platform, with nothing written;
  - update, including replacing the links;
  - list counts;
  - a non-IC id returns not-found;
  - delete blocked by an order line, then allowed;
  - delete twice returns not-found;
  - nine schema refusals.

  All test rows were removed.
- **Verified in the browser**, on temporary pages since deleted:
  - the list's three stock states;
  - normalised marking search and the category filter;
  - the blocked delete dialog;
  - auto-slug and the chip input;
  - field and compare-at errors;
  - a platform row;
  - the "admins only" refusal on submit;
  - 375px layout.

  All three routes redirect to sign-in when signed out.
- **Not exercised**: the flow as a signed-in admin (needs a Clerk account), and a real IC image upload. The upload uses the same storage path as brand logos.
- **Not in this CRUD**: gallery images, compatible vehicles and `weightGrams`.
- **Part numbers are not unique**, as in the schema. Two listings of one part are allowed.

---

## 2026-09-28 — Controller platforms CRUD (M1)

**منصات الكنترول** gets the same admin treatment as brands: a list plus
create, edit and delete, with create and edit as full pages. The second CRUD
pulled three pieces into shared code, and its test exposed a dev-only
Prisma error-handling bug that also affected brands, now fixed. Full
reference: [docs/controller-platforms-feature.md](docs/controller-platforms-feature.md).

### Added

- **Pages**:
  - `/admin/platforms`: the list, prefetched and hydrated. It shows the name, manufacturer, slug, the four link counts (controllers, ICs, programmers, pinouts) and status, with search, a row menu, and loading, empty and error states.
  - `/admin/platforms/new` and `/admin/platforms/[id]/edit`: full-page forms. Every page calls `requireAdmin()`.
- **Layers**:
  - `schemas/platform.schema.ts`.
  - `repositories/platform.repository.ts`: link counts and a case-insensitive name lookup.
  - `services/platform.service.ts`, with these rules:
    - **names are unique regardless of case** ("edc17c46" = "EDC17C46");
    - a duplicate slug returns an error on that field;
    - **delete is refused while any controller, IC, programmer or pinout links to the platform**, naming the counts;
  - `actions/platform/*`, `hooks/use-platforms.ts` and `types/platform.ts`.
- **Components**:
  - `components/admin/platforms/*`: view, editor, delete dialog.
  - `components/forms/platform-form.tsx`:
    - the slug fills from manufacturer + name (`bosch-edc17c46`), with a live `/platforms/…` preview;
    - existing manufacturers are suggested through a `<datalist>`.
- **Shared, now used by brands and platforms**:
  - `components/admin/shared/confirm-delete-dialog.tsx`.
  - `components/shared/empty-state.tsx`.
  - `utils/normalize-identifier.ts`: the docs' identifier normalisation, used by both tables' search.
  - `utils/describe-platform-links.ts`.
  - `lib/prisma-errors.ts`: `isPrismaError` and `uniqueTarget`.
- **Strings**: `ar.platforms`.
- **Docs**: `docs/controller-platforms-feature.md`.

### Fixed

- **Prisma errors escaping as 500s after a dev hot reload.**
  - The Prisma client is cached on `globalThis` across reloads, so after a reload it throws errors built by the *previous* module's class.
  - The services' `instanceof Prisma.PrismaClientKnownRequestError` checks then failed, and a duplicate slug surfaced as a raw error instead of "هذا الرابط مستخدم…".
  - `brand.service`, `platform.service` and `user.service` now check the error's name and code through `isPrismaError`.
  - `storage.service` checks `NoSuchKey` by name for the same reason.
  - Production (no hot reload) was not affected, but dev now behaves the same.

### Changed

- **Brands** now use the shared `ConfirmDeleteDialog`, `EmptyState` and `normalizeIdentifier`, with the same behavior as before.
- **Platforms section description** now starts in Arabic. Opening with a Latin run read in a confusing order in RTL.
- **Docs**:
  - `folder-structure.md`: ticks the new doc and marks the new files as built.
  - `admin-dashboard.md`: platforms marked as built.
  - `brands-feature.md`: the shared plumbing table gains `isPrismaError`, `ConfirmDeleteDialog`, `EmptyState` and `normalizeIdentifier`, and the copy checklist is updated.

### Notes

- **No image for platforms**: the schema has no logo column, so R2 isn't involved.
- **Verified against the dev DB**, using temporary code since deleted:
  - create;
  - a case-insensitive duplicate name, and a duplicate slug;
  - update;
  - list counts;
  - delete blocked by a linked pinout, then allowed.

  The error mapping was re-checked after a hot reload. All test rows were removed.
- **Verified in the browser**, on temporary pages since deleted: the list, search, the blocked delete, the form's auto-slug, the refusal message, and the brands empty state after the refactor. All three platform routes redirect when signed out.
- **Not exercised**: the flow as a signed-in admin (needs a Clerk account).

---

## 2026-09-28 — Brands CRUD with logos on Cloudflare R2 (M1)

الماركات and منصات الكنترول move out of الكتالوج into their own sidebar
group, **البيانات المرجعية**. The brands section is the first real admin
feature: a list plus create, edit and delete, with create and edit as full
pages, and the logo uploaded to Cloudflare R2. It is written as the
**reference CRUD** that later CRUDs copy. Full references:
[docs/brands-feature.md](docs/brands-feature.md) and
[docs/product-images.md](docs/product-images.md).

### Added

- **Brand pages**:
  - `/admin/brands`: the list, prefetched on the server and hydrated into React Query. It has search, a table with loading, empty, error and no-results states, and a row menu for edit and delete.
  - `/admin/brands/new` and `/admin/brands/[id]/edit`: full-page forms. Every page calls `requireAdmin()`.
- **Brand layers**:
  - `schemas/brand.schema.ts`: shared by the form and the actions, with Arabic messages.
  - `repositories/brand.repository.ts`.
  - `services/brand.service.ts`, with these rules:
    - duplicate name or slug returns an error on that field;
    - a replaced or removed logo is deleted from R2;
    - **deleting a brand that still has models is refused**, because the schema would cascade the delete to its models and product links;
    - deleting a brand removes its logo.
  - `actions/brand/*`: list, create, update, delete and upload-logo.
  - `hooks/use-brands.ts`.
  - `types/brand.ts`.
- **Brand components**:
  - `components/admin/brands/*`: view, editor, delete dialog, logo tile.
  - `components/forms/brand-form.tsx`: presentational, react-hook-form with `standardSchemaResolver`. The slug fills itself from the name until edited by hand, with a live `/brands/<slug>` preview.
  - `components/forms/file-dropzone.tsx`: the reusable image picker (click or drop, instant upload, preview, replace or remove).
- **Cloudflare R2**:
  - `lib/r2.ts`: the S3 client, reading `.env.local`.
  - `services/storage.service.ts`:
    - uploads are identified by their **magic bytes**, limited to PNG, JPEG and WEBP, and capped at 2 MB, with **no SVG**;
    - keys look like `<folder>/<uuid>.<ext>`;
    - deletes are best-effort.
  - `constants/images.ts`.
  - **`GET /api/images/[...key]`**: a public image route. It serves only keys we could have written, streams from R2 and caches for a year.
- **Shared action plumbing** for every later CRUD:
  - `lib/errors.ts` (`ServiceError`).
  - `lib/action-handler.ts` (`forbiddenUnlessAdmin`, `invalidInput`, `runAction`).
  - `lib/action-result.ts` (`unwrap`, `ActionError`).
  - `ActionResult` can now carry `fieldErrors`.
  - `authService.getAdmin()`.
- **Utilities**: `utils/slugify.ts` (`slugify`, `SLUG_PATTERN`).
- **Breadcrumb tails**: `/new` → إضافة and `/<id>/edit` → تعديل. The section crumb becomes a link on those pages.
- **shadcn `field`**, added via the CLI with no overwrites.
- **Dependencies**: `zod`, `react-hook-form` and `@hookform/resolvers`, declared explicitly. You had already installed `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`; the presigner is not used yet.
- **Strings**: `ar.brands`, `ar.admin.groups.reference`, `ar.admin.crumbs`, and `ar.errors.forbidden` / `invalidInput` / `unexpected` / `upload`.
- **Docs**: `docs/brands-feature.md` and `docs/product-images.md`.

### Changed

- **Sidebar**: الكتالوج now holds only الهاردوير. الماركات and منصات الكنترول form the new **البيانات المرجعية** group.
- **`next.config.ts`**:
  - `images.localPatterns` limits next/image to `/api/images/**` with no query string.
  - `experimental.serverActions.bodySizeLimit` is `"3mb"`, for 2 MB uploads plus multipart overhead.
- **`lib/query-client.ts`**: queries don't retry on an `ActionError` (e.g. "admins only"). Other failures retry twice.
- **Docs**:
  - `folder-structure.md`: ticks both new docs and marks the new files as built.
  - `admin-dashboard.md`: brands marked as built, the new group, breadcrumb tails.
  - `design-system.md`: adds `field` and the upload pattern.

### Notes

- **Verified against the real dev database and R2**, using temporary code since deleted:
  - upload, and rejection of a fake PNG;
  - create, and duplicate name or slug errors;
  - update with logo swap and old-logo deletion;
  - delete with logo cleanup.

  All test data was removed.
- **Verified in the browser**, on temporary pages since deleted: the list, search, delete blocking, the form, auto-slug, validation and mobile layout. All three brand routes redirect to sign-in when signed out.
- **Not exercised**: the end-to-end flow **as a signed-in admin**, which needs a Clerk account.
- **Abandoned uploads** (a picked logo on a form that is never saved) stay in R2 as small orphans. A cleanup job can come later.

---

## 2026-09-28 — Admin catalog: الهاردوير folder

The sidebar's الكتالوج group now opens with a collapsible **الهاردوير**
folder holding **المبرمجات، الكنترولات، البن أوت، الآي سيهات**, followed by
الماركات and منصات الكنترول. Each sold type gets its own admin page, which
replaces the single "المنتجات" page with tabs.

### Added

- **shadcn `collapsible`**, added via the CLI with no overwrites.
- **Routes** under `/admin/hardware/`: `programmers`, `controllers`, `pinouts` and `ics`, each a guarded placeholder. `/admin/hardware` itself redirects to المبرمجات.
- **Folder support in the registry** (`constants/admin-navigation.ts`):
  - The `AdminFolder` type and `HARDWARE_FOLDER`.
  - `ADMIN_NAV` items can be sections or folders.
  - `findAdminFolder()` for breadcrumbs.
- **Sidebar** `NavFolder`:
  - A collapsible sub-menu, open by default, when the sidebar is expanded or on mobile.
  - A dropdown opening to the left in icon mode, highlighted when the current page is inside it.
- **Breadcrumbs** show the folder: لوحة التحكم › الهاردوير › الكنترولات.
- **Strings**: `ar.admin.folders.hardware`, plus sections `programmers`, `controllers` and `ics` with their planned features.

### Changed

- **`ADMIN_ROUTES`**:
  - Removed `products`.
  - `pinouts` moved to `/admin/hardware/pinouts`.
  - Added `programmers`, `controllers` and `ics`.
  - Added `ADMIN_HARDWARE_ROOT`.
- **Icons**: الهاردوير uses `Package`, and منصات الكنترول now uses `Layers`, so no two items share an icon.
- **Removed** `app/(admin)/admin/products/` and `app/(admin)/admin/pinouts/`.
- **Docs**:
  - `admin-dashboard.md`: sections table, folder behaviour, registry, how to add a folder.
  - `folder-structure.md`: the `(admin)` tree and `admin/products/` note.
  - `design-system.md`: `collapsible` added to the installed list.

---

## 2026-09-28 — Admin shell with sidebar, placeholder pages, navbar admin button (M1)

The `/admin` console shell: an Arabic, RTL layout with the **sidebar on the
right**, a header with breadcrumbs, and every admin section as a guarded
placeholder page. Admins also get a "لوحة التحكم" button in the storefront
navbar. Full reference: [docs/admin-dashboard.md](docs/admin-dashboard.md).

### Added

- **shadcn `sidebar`** via the CLI. The overwrite prompts for the existing primitives were declined, so the brand variants in `button.tsx` survived. The CLI also added `hooks/use-mobile.ts`.
- **Admin shell**:
  - `app/(admin)/admin/layout.tsx`: `SidebarProvider`, `AdminSidebar` and `SidebarInset` with the header and content. The server-rendered sidebar state comes from the `sidebar_state` cookie. Set to `noindex`.
  - `components/admin/layout/admin-sidebar.tsx`:
    - `side="right"`, `collapsible="icon"`.
    - Brand at the top, grouped links (نظرة عامة / الكتالوج / المبيعات / النظام), "العودة للمتجر" at the bottom, and a rail.
    - Tooltips open to the left when collapsed.
    - On mobile it is a sheet from the right that closes when a link is followed.
  - `components/admin/layout/admin-breadcrumbs.tsx`: لوحة التحكم › section.
  - `components/admin/layout/admin-header.tsx` (rewritten): sidebar trigger, breadcrumbs, back-to-store and the Clerk `UserButton`.
- **Section registry** `constants/admin-navigation.ts`: `ADMIN_SECTIONS` (route, icon, milestone, strings), `ADMIN_NAV` (the sidebar groups) and `findAdminSection(pathname)` (longest match). It drives the sidebar, breadcrumbs, titles and placeholders.
- **`ADMIN_ROUTES`** in `constants/routes.ts`.
- **Pages**:
  - Placeholders: `/admin/products`, `/pinouts`, `/brands`, `/platforms`, `/orders`, `/customers`, `/shipping-zones` and `/settings`. Each calls `authService.requireAdmin()` and renders `<SectionPlaceholder>`.
  - `/admin`: now uses `PageHeader`.
- **Admin shared** (`components/admin/shared/`):
  - `PageHeader`.
  - `SectionPlaceholder` (temporary): a "قيد الإنشاء" badge, the milestone, and what the section will do (from business-analysis "Administration").
  - `index.ts`, which re-exports `components/shared`.
- **Navbar admin button**, shown only to admins, on desktop and in the mobile sheet:
  - `components/layout/nav-admin-link.tsx`.
  - `hooks/use-session.ts`, keyed by the Clerk user id.
  - `actions/auth/get-session.ts` (`getSessionAction` → `{ fullName, role }`).
  - `queryKeys.auth.session(clerkUserId)`.
  - `SessionSummary` type.
- **Strings**: `ar.admin.shell`, `.groups`, `.placeholder` and `.sections` (title, description and planned features per section).
- **Docs**: `docs/admin-dashboard.md`.

### Changed

- **`hooks/use-mobile.ts`**: rewritten with `useSyncExternalStore`. The generated version failed the `react-hooks/set-state-in-effect` lint rule.
- **`ui/sidebar.tsx`**: the screen-reader labels (sheet title and description, trigger text) are in Arabic.
- **`hooks/use-auth-callback.ts`**: invalidates the cached session after a sync, so a newly promoted admin sees the navbar button straight away.
- **`components/layout/nav-auth.tsx` and `mobile-nav.tsx`**: render `NavAdminLink` before the user menu, and the mobile sheet closes on tap.
- **`docs/folder-structure.md`**:
  - Ticks `admin-dashboard.md`.
  - Marks the `(admin)` routes, `components/admin/layout` and `components/admin/shared` as built.
  - Adds `admin-navigation.ts`, `use-session.ts`, `use-mobile.ts` and `get-session.ts`.
- **`docs/auth-feature.md`**: adds the admin button (how it reads the role, and why hiding it is only cosmetic).
- **`docs/design-system.md`**: adds `sidebar` to the installed list, with its right-side and tooltip usage.

### Notes

- **Placeholder pages** keep their `requireAdmin()` call when a real page replaces `<SectionPlaceholder>`. Delete `section-placeholder.tsx` once no section uses it.
- **Re-adding the sidebar** with `shadcn add sidebar --overwrite` discards the Arabic labels in `ui/sidebar.tsx`, so re-apply them.

---

## 2026-09-28 — Auth with Clerk, user sync, landing page (M0 Foundation)

Sign-in and sign-up with Clerk in Arabic. Every sign-in passes through
**`/auth-callback`**, which syncs the user into the database, then sends
admins to `/admin` and everyone else to `/`. There is also a placeholder
landing page with the storefront navbar. Full reference:
[docs/auth-feature.md](docs/auth-feature.md).

### Added

- **Auth flow, layer by layer**, following `docs/folder-structure.md`:
  - `app/(auth)/auth-callback/page.tsx` renders `components/auth/auth-callback-view.tsx`, which shows the syncing, redirecting and error states.
  - `hooks/use-auth-callback.ts` uses React Query and redirects with `router.replace`.
  - `actions/auth/sync-user.ts` is `syncUserAction`, returning `ActionResult<{ role, redirectTo }>`.
  - `services/auth.service.ts` is the only server file that reads Clerk. It provides `getIdentity`, `getCurrentUser` (cached), `requireSignedIn` and `requireAdmin`.
  - `services/user.service.ts` holds `syncFromIdentity`, which finds the user by `clerkId`, else claims the row by verified email, else creates a customer. It applies the `ADMIN_EMAILS` promotion.
  - `repositories/user.repository.ts` does the reads and writes, selecting session columns only.
- **Database provider** `lib/prisma.ts`: a single `PrismaClient`, cached on `globalThis` in dev and `server-only`.
- **React Query**:
  - `lib/query-client.ts`: a fresh client per server request and one in the browser.
  - `components/providers/query-provider.tsx`: the provider.
- **Clerk config** `lib/clerk.ts`: `arSA` localization, and `appearance` mapped to the design tokens so Clerk follows the brand and dark mode.
- **`lib/env.ts`**: `ADMIN_EMAILS` (optional, comma-separated) promotes those users to ADMIN on sign-in.
- **Routes**:
  - `(auth)` group: `/sign-in/[[...sign-in]]`, `/sign-up/[[...sign-up]]`, `/auth-callback`, with a centred brand layout.
  - `(marketing)` group: a layout with Navbar and Footer, and a placeholder landing at `/` with the search hero, categories, trust points and a sign-up call to action.
  - `(admin)/admin`: a header layout and a placeholder dashboard gated by `requireAdmin()`.
  - `not-found.tsx`: the Arabic 404. Nav links to features not built yet land here.
- **Navigation**:
  - `components/layout/`: `navbar`, `nav-links` (active state), `nav-auth` (Clerk `<Show>`, sign-in/up buttons, `UserButton`), `mobile-nav` (a sheet from the right) and `footer`.
  - `components/admin/layout/admin-header.tsx`.
  - `components/shared/brand-lockup.tsx`.
- **Marketing**: `components/marketing/hero.tsx`, `landing-sections.tsx` and `landing-cta-actions.tsx`.
- **Constants**: `routes.ts` (`ROUTES`, `HOME_BY_ROLE`), `navigation.ts` (`MAIN_NAV`) and `query-keys.ts`.
- **Types**: `action-result.ts` (`ActionResult<T>`) and `user.ts` (`ClerkIdentity`, `SessionUser`, `AuthCallbackResult`).
- **Strings**: `messages/ar.ts` holds every new UI string: brand, nav, auth, auth callback, landing, admin, 404 and errors.
- **Migrations**:
  - `prisma/migrations/0_init` baselines the existing database, which had been created without migration history, and is marked as applied.
  - `20260928120000_add_user_clerk_id` adds `users.clerkId TEXT NOT NULL UNIQUE`.
- **Docs**: `docs/auth-feature.md`.

### Changed

- **`prisma/schema.prisma`**: `User.clerkId String @unique`, with docs on the Clerk ↔ database split.
- **Root layout**:
  - Wraps the app in `ClerkProvider` (Arabic, brand appearance) and `QueryProvider`.
  - `signInForceRedirectUrl` and `signUpForceRedirectUrl` point to `/auth-callback`, and `afterSignOutUrl` to `/`.
- **`src/proxy.ts`**: stays a plain `clerkMiddleware()`. Route guarding moved into pages via `authService`, because Clerk Core 3 deprecates `createRouteMatcher`.
- **`globals.css`**: declares `@layer theme, base, clerk, components, utilities` so Tailwind utilities override Clerk's styles.
- **`src/app/page.tsx`**: the create-next-app starter is replaced by `(marketing)/page.tsx`.
- **`docs/folder-structure.md`**:
  - Adds the `(auth)` group, `components/auth` and `components/providers`.
  - Marks what is built (✓) in `lib`, services, actions, hooks, types, constants and migrations.
  - Adds the architecture rule: "auth checks in pages and actions, never only in the proxy or a layout".

### Dependencies

- `@clerk/localizations` (the `arSA` localization) and `@tanstack/react-query`.

### Notes

- **Making an admin**: add the email to `ADMIN_EMAILS` in `.env` and sign in again, or set `users.role = 'ADMIN'` in the database. Nothing demotes automatically.
- **Migrations**: from now on use `npx prisma migrate dev --name …`. `db push` would bring the history drift back.
- **Email is required**: a Clerk account without a verified primary email gets an Arabic error on the callback. Phone-only sign-up would need `User.email` to become optional first.
- **Untested sign-in**: the real sign-in round-trip was not exercised, because it needs a Clerk account. The signed-out guard, the Arabic Clerk UI, the loader and the error state were all checked in the browser.

---

## 2026-09-28 — Design system (M0 Foundation)

The storefront's visual foundation: a light-red brand, Arabic RTL root,
shadcn primitives in RTL mode, and the shared components every feature will
use. Full reference: [docs/design-system.md](docs/design-system.md), and live
at **`/design-system`**.

### Added

- **Brand tokens** (`src/app/globals.css`)
  - The light-red scale `--brand-50` … `--brand-950`, exposed as `bg-brand-*` / `text-brand-*`.
  - **Primary is `brand-500` `#f3625f`.**
  - New semantic tokens:
    - `--primary-soft` for tinted surfaces.
    - `--primary-ink` for red text, at 6 : 1 contrast.
    - `--success`, `--warning`, `--info`, each with a `-soft` background. Warning also has `--warning-ink`.
  - Warm-tinted neutrals, charts that lead with the brand color, and a matching `.dark` theme.
- **Typography**: IBM Plex Sans Arabic for Arabic and Latin text (`font-sans`, `font-heading`), and IBM Plex Mono for identifiers (`font-mono`). Body line-height is 1.7.
- **shadcn primitives** installed through the CLI in RTL mode:
  - Forms: input, textarea, label, select, checkbox, radio-group, switch.
  - Layout: card, separator, skeleton, table.
  - Navigation: tabs, breadcrumb, pagination.
  - Feedback: alert, badge, sonner.
  - Overlays: dialog, sheet, dropdown-menu, tooltip.
  - Other: avatar.
- **Brand variants on the primitives**
  - `Button`:
    - `variant="soft"`: tinted secondary brand action.
    - `size="xl"`: 44px mobile call to action.
  - `Badge`: tones `brand`, `success`, `warning`, `info`, `neutral`.
- **Shared components** (`@/components/shared`)
  - `Ltr`: a `<bdi dir="ltr">` island for part, hardware and order numbers. `mono` switches to Plex Mono. It is `w-fit` so it stays at the start of flex rows.
  - `Price`: EGP via `formatPrice`, plus a struck-through `compareAt` when it is a real discount.
  - `StatusBadge`: dot plus Arabic label, with the tone supplied by the caller.
- **`src/utils/format-price.ts`**: `ar-EG` currency with Western digits. Gives `1,250 ج.م.` or `99.50 ج.م.` and accepts a serialised `Decimal` string.
- **`/design-system` route** (`src/app/design-system/`): renders every token and component with real catalog shapes in light and dark. It covers:
  - product cards
  - checkout form
  - compatibility table
  - order table
  - cart sheet
  - dialogs
  - toasts

  The route is `noindex` and not linked from the storefront.
- **Docs**: `docs/design-system.md`, which covers principles, colour and contrast rules, typography and bidi rules, components, status-tone mapping for stock, condition, order and payment, patterns, and dark mode.
- **`.claude/launch.json`**: dev-server config (`npm run dev`, port 3000).

### Changed

- **Root layout** (`src/app/layout.tsx`)
  - `<html lang="ar" dir="rtl">`, replacing Geist with the Plex fonts.
  - Arabic title template (`%s | كنترول سيف زون`) and description.
  - Mounts `TooltipProvider` and `<Toaster dir="rtl" position="top-center" />`.
- **`components.json`**: `"rtl": true`. The CLI now writes logical classes and `rtl:` variants, so the manual "replace physical classes" step is no longer needed.
- **Button**
  - `default` is semibold and hovers to `brand-600` instead of fading with opacity.
  - `destructive` is now **outlined** crimson, so it cannot be mistaken for the red brand.
  - `link` uses `text-primary-ink`.
- **Badge**: `default` is semibold, hovers to `brand-600`, and `link` uses `text-primary-ink`.
- **`docs/folder-structure.md`**
  - Lists `design-system.md` and the `/design-system` route.
  - Updates the `ui/` RTL rule for the CLI's RTL mode and warns about `--overwrite`.
  - Marks the shared components and `format-price.ts` that now exist.

### Dependencies

- Added by the shadcn CLI: `sonner` (toasts) and `next-themes` (theme detection for the toaster, and the future theme switcher).

### Notes

- **Contrast**: white on `#f3625f` is 3.1 : 1. That passes AA for UI components and bold text but not body text. Primary labels are therefore always semibold, and red text uses `text-primary-ink`. To meet AA for button labels as well, set `--primary: var(--brand-600)` (4.4 : 1).
- **Re-adding a primitive with `--overwrite`** discards the brand additions in `button.tsx` and `badge.tsx`. They are commented in the source, so re-apply them.
- **Not done yet**: `src/app/page.tsx` is still the create-next-app starter. The Clerk (`arSA`) and React Query providers from the planned root layout are not mounted yet.
- **Linting**: `npx eslint src` reports errors from the generated Prisma client in `src/generated/`. Lint the hand-written code with `--ignore-pattern "src/generated/**"`, or add that folder to `eslint.config.mjs`.
