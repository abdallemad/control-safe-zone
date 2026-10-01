# Brands Feature

Admin CRUD for **car brands** (Toyota, Volkswagen…): list, create, edit, delete, with the logo uploaded to **Cloudflare R2**. It is the **reference CRUD**: every later admin CRUD (platforms, shipping zones, products…) copies its layers, file names and conventions.

- Routes: `/admin/brands` (list), `/admin/brands/new`, `/admin/brands/[id]/edit`. Create and edit are full pages, not dialogs.
- Sidebar: group **البيانات المرجعية** (reference data), next to منصات الكنترول.
- Images: see [`product-images.md`](./product-images.md).

---

## Layer by layer

```text
BrandsView / BrandEditor (UI)
↓
useBrands · useCreateBrand · useUpdateBrand · useDeleteBrand · useUploadBrandLogo (hooks)
↓
listBrandsAction · createBrandAction · updateBrandAction · deleteBrandAction · uploadBrandLogoAction
↓   admin check → Zod (brandSchema) → runAction()
brandService                         business rules, Arabic ServiceErrors
↓                  ↘
brandRepository    storageService → R2
↓
Prisma → brands
```

| Layer | File | Notes |
|---|---|---|
| Pages | `app/(admin)/admin/brands/page.tsx` | `requireAdmin()`. Prefetches the list on the server (`brandService.list()`) into React Query and hydrates `BrandsView`: the read-only first-paint exception |
| | `…/brands/new/page.tsx` | `requireAdmin()` → `<BrandEditor />` |
| | `…/brands/[id]/edit/page.tsx` | `requireAdmin()`, loads the brand (`brandService.getById`), `notFound()` if missing → `<BrandEditor brand />` |
| UI | `components/admin/brands/brands-view.tsx` | Header + "إضافة ماركة", search, table, row actions menu. Loading skeleton, error with retry, empty state, "no results" |
| | `components/admin/brands/brand-editor.tsx` | Owns the mutations for create/edit. Toast, then back to the list |
| | `components/admin/brands/delete-brand-dialog.tsx` | Wraps the shared `ConfirmDeleteDialog`. Blocks up front when the brand has models |
| | `components/admin/brands/brand-logo.tsx` | Logo on a white tile, or the brand's first letter |
| Forms | `components/forms/brand-form.tsx` | **Presentational**: `defaultValues`, `onSubmit`, `uploadLogo`. react-hook-form + `standardSchemaResolver(brandSchema)` |
| | `components/forms/file-dropzone.tsx` | Reusable image picker: click or drag-and-drop, uploads immediately, preview, replace/remove |
| Hooks | `hooks/use-brands.ts` | Query + mutations. Every mutation invalidates `queryKeys.brands.all` |
| Actions | `actions/brand/*.ts` | One file per action. Each: `forbiddenUnlessAdmin()` → `safeParse` → `runAction(service call)` |
| Schema | `schemas/brand.schema.ts` | `brandSchema`, `brandIdSchema`. Arabic messages. **Shared by form and action** |
| Service | `services/brand.service.ts` | `list`, `getById`, `create`, `update`, `remove`, `uploadLogo` |
| Repository | `repositories/brand.repository.ts` | The only Prisma access. `detailSelect` / `listSelect` (with `_count.models`) |
| Types | `types/brand.ts` | `BrandListItem`, `BrandDetail`: DTOs, never raw rows |
| Strings | `messages/ar.ts` → `brands` | list, form, delete, toasts, errors, validation. The dropzone strings are the shared `ar.dropzone` |

### Shared plumbing introduced here (reuse it)

| File | What it gives every CRUD |
|---|---|
| `lib/errors.ts` | `ServiceError(message, fieldErrors?)`: a business-rule failure with an Arabic message |
| `lib/action-handler.ts` | `forbiddenUnlessAdmin()`, `invalidInput(zodError)` (Zod issues → `fieldErrors`), `runAction(label, fn)` (ServiceError → its message; anything else → logged + "حدث خطأ غير متوقع") |
| `types/action-result.ts` | `ActionResult<T>` now carries optional `fieldErrors` |
| `lib/action-result.ts` | `unwrap(result)` for hooks → data or `ActionError` (message + `fieldErrors`) |
| `lib/query-client.ts` | Queries **don't retry** on `ActionError` ("admins only" won't change on retry). Real failures retry twice |
| `services/auth.service.ts` | `getAdmin()`: the admin or `null`, for actions (which must return, not redirect) |
| `utils/slugify.ts` | `slugify("Land Rover")` → `land-rover`, `SLUG_PATTERN` |
| `lib/prisma-errors.ts` | `isPrismaError(error, "P2002")`, `uniqueTarget(error)`. Services use these, **never** `instanceof Prisma.PrismaClientKnownRequestError`: the Prisma client is cached on `globalThis` across dev hot reloads, so after a reload its errors come from the previous module's class and `instanceof` fails, letting a duplicate slug escape as a 500 |
| `components/admin/shared/confirm-delete-dialog.tsx` | `ConfirmDeleteDialog`: title, description, `blockedReason` (disables the button), `error`, `pending`. Entity dialogs wrap it |
| `components/shared/empty-state.tsx` | `EmptyState`: icon, title, description, action |
| `utils/normalize-identifier.ts` | `normalizeIdentifier("sak-tc 1797.512")` → `SAKTC1797512`. Used by the admin tables' search, and later by the `*Normalized` columns |

---

## Rules (`brand.service.ts`)

| Rule | Why |
|---|---|
| `nameAr` `""` → `null`, slug lower-cased | One representation in the DB |
| Duplicate **name** / **slug** (Prisma `P2002`) → `ServiceError` with `fieldErrors.name` / `.slug` | The form highlights the exact field: "يوجد ماركة بنفس الاسم." / "هذا الرابط مستخدم لماركة أخرى." |
| Update with a new or removed logo → the **old file is deleted from R2** after the save | No orphaned logos |
| **Delete refused while the brand has vehicle models** ("لا يمكن حذف ماركة لها 12 موديل…") | The schema cascades `Brand → VehicleModel → ProductVehicle`, so one click would silently unlink products. Deactivate (`isActive = false`) to hide a brand instead |
| Delete → the logo is removed from R2 too | |
| Not found (`P2025` / missing row) → "الماركة غير موجودة — ربما حُذفت." | Stale list, two admins |

Validation (`brand.schema.ts`, same on both sides):

| Field | Rule |
|---|---|
| `name` | 2–60 chars, trimmed. Latin, as the brand is written worldwide |
| `nameAr` | ≤ 60, optional |
| `slug` | 2–80, `^[a-z0-9]+(-[a-z0-9]+)*$` |
| `logoUrl` | `null` or `/api/images/brands/<uuid>.(png\|jpg\|webp)`, so only a logo **we** uploaded can be saved |
| `isActive` | boolean |

---

## Logo upload flow

1. The admin picks or drops a file in `FileDropzone`, which checks type and size in the browser for quick feedback.
2. `useUploadBrandLogo` → `uploadBrandLogoAction(FormData)`, admin only.
3. `storageService.uploadImage("brands", file)`:
   - checks size ≤ 2 MB;
   - identifies the type from the file's **magic bytes** (PNG/JPEG/WEBP), never from its name or the browser-supplied type;
   - puts `brands/<uuid>.<ext>` in R2;
   - returns `/api/images/brands/<uuid>.<ext>`.
4. The URL goes into the form's `logoUrl`, and the preview renders through `/api/images`.
5. **Save** stores the URL with the brand. **Replace/remove + save** deletes the previous file.

A logo uploaded and then abandoned (the form is cancelled) stays in R2 as an orphan. It is a few KB, and a periodic cleanup of unreferenced keys can come later.

---

## UI details

- **Slug** fills itself from the name ("Land Rover" → `land-rover`) until the admin types in the slug field; the dirty state stops the auto-fill. On edit it never auto-changes, so existing links don't break. The hint shows the live link `/brands/<slug>` inside `<Ltr>`, because a leading `/` flips in Arabic text.
- **Name and slug inputs** are `dir="ltr"` / `text-end`, as the design system specifies for Latin values.
- **Search** is client-side over name, Arabic name and slug, through `normalizeIdentifier` (ignores case, spaces, dashes and dots). The brand list is small; move it server-side with pagination if that changes.
- **Table on phones**: the slug and model columns hide below `md`/`sm`, and the table scrolls horizontally if needed.
- **Status**: `StatusBadge`, `success` مفعّلة / `neutral` معطّلة.
- **Errors**: field errors under each field (`FieldError`), the action's message in an `Alert` above the buttons, and delete errors inside the dialog.

---

## Copying this for another CRUD

Done four times already: [`controller-platforms-feature.md`](./controller-platforms-feature.md), [`ics-admin-feature.md`](./ics-admin-feature.md), [`programmers-admin-feature.md`](./programmers-admin-feature.md) and [`controllers-admin-feature.md`](./controllers-admin-feature.md). **For a sold type** (a `Product` plus its detail row), start from the shared product layer described in the programmers doc instead of this file alone.

1. `schemas/<entity>.schema.ts`: Zod with Arabic messages.
2. `repositories/<entity>.repository.ts`: selects, CRUD.
3. `services/<entity>.service.ts`: rules, a `rethrow` that uses `isPrismaError` (`P2002` → field errors, `P2025` → not found), and `ServiceError`s.
4. `actions/<entity>/*.ts`: `forbiddenUnlessAdmin` → `safeParse` → `runAction`.
5. `queryKeys.<entity>`, `hooks/use-<entity>.ts`: `unwrap`, invalidate on success.
6. `components/forms/<entity>-form.tsx` (presentational), plus `components/admin/<entity>/…` for the view (with `EmptyState`), the editor, and a delete dialog wrapping `ConfirmDeleteDialog`.
7. Pages: list (prefetch + `HydrationBoundary`), `new`, `[id]/edit`, each starting with `requireAdmin()`.
8. Strings in `messages/ar.ts`. Replace the section's `SectionPlaceholder`.

---

## Verified

- **Service** (temporary route, since deleted), against the dev DB and R2:
  - upload stores the file;
  - a fake "PNG" containing SVG text is rejected;
  - create works, and duplicate name or slug returns the right `fieldErrors`;
  - update swaps the logo and deletes the old one from R2;
  - the list shows `modelsCount`;
  - delete removes the brand and its logo, and deleting twice returns the not-found error.

  The test data was removed afterwards.
- **UI** (temporary pages, since deleted):
  - the list with rows, search in Arabic and Latin, and no-results;
  - the delete dialog blocking a brand with models;
  - the form's auto-slug, client validation, and the server's "admins only" refusal;
  - no overflow at 375px.
- **Guards**: all three routes redirect to sign-in when signed out.
- **Not exercised**: the full create/edit/delete round-trip *as a signed-in admin*, which needs a Clerk account.
