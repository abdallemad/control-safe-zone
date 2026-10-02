# Pinouts Admin Feature

Admin CRUD for **pinouts**, the wiring diagrams the store offers: "EDC17C46 — الفيشة A", "SIMOS 18.1 — Main 94-pin". It covers the list, create, edit and delete, with **two files**: a **preview image** (public, R2 via `/api/images`) and a **PDF** (private R2 key, served only by `GET /api/pinouts/[id]/pdf` after an access check). A pinout can be linked to one controller platform.

- Routes: `/admin/hardware/pinouts` (list), `/admin/hardware/pinouts/new`, `/admin/hardware/pinouts/[id]/edit`. Create and edit are full pages.
- Sidebar: **الكتالوج › الهاردوير › البن أوت**.
- Built **the same way as the controllers page** (list, editor, delete dialog, prefetch + `HydrationBoundary`, platforms prefetched for the picker). But a pinout is **not a `Product`**: no price, stock, shipping or orders. So it sits on the **reference-CRUD layers** of [`brands-feature.md`](./brands-feature.md), not on the shared product layer, and nothing goes through `product.*`.
- The storefront side (`/pinouts`, search by controller, the download button) is still to come in `pinouts-feature.md`. The PDF route it will use is built here.

```text
Pinout                 name, slug, connector, requiresSignIn, isActive
├── imageUrl           /api/images/pinouts/<uuid>.<ext>   public, like product covers
├── pdfKey             pinout-pdfs/<uuid>.pdf             private R2 key, never a URL
└──> ControllerPlatform   optional — onDelete: SetNull
```

---

## Files

| Layer | File |
|---|---|
| Pages | `app/(admin)/admin/hardware/pinouts/page.tsx` (prefetch + `HydrationBoundary`), `new/page.tsx` and `[id]/edit/page.tsx` (both prefetch the platforms for the picker). Each starts with `requireAdmin()` |
| Route | `app/api/pinouts/[id]/pdf/route.ts`: the PDF download (see below) |
| UI | `components/admin/pinouts/pinouts-view.tsx`, `pinout-editor.tsx`, `delete-pinout-dialog.tsx`. The preview tile is the shared `ProductImage` with the `FileText` glyph |
| Form | `components/forms/pinout-form.tsx` (presentational, `standardSchemaResolver(pinoutSchema)`) |
| | `components/forms/pdf-dropzone.tsx`: **new, reusable**. The PDF sibling of `FileDropzone` (see below) |
| Hooks | `hooks/use-pinouts.ts`: `usePinouts`, `useCreatePinout`, `useUpdatePinout`, `useDeletePinout`, `useUploadPinoutImage`, `useUploadPinoutPdf` |
| Actions | `actions/pinout/list-pinouts.ts`, `create-pinout.ts`, `update-pinout.ts`, `delete-pinout.ts`, `upload-pinout-image.ts`, `upload-pinout-pdf.ts` |
| Schema | `schemas/pinout.schema.ts`: `pinoutSchema`, `pinoutIdSchema` |
| Service | `services/pinout.service.ts`: `list`, `getById`, `create`, `update`, `remove`, `uploadImage`, `uploadPdf`, `openPdf` |
| Repository | `repositories/pinout.repository.ts` (`prisma.pinout`) |
| Types | `types/pinout.ts`: `PinoutListItem` (with its `platform`, and `hasPdf` instead of the key), `PinoutDetail` |
| Constants | `constants/pinouts.ts`: `PINOUT_ACCESS_META` (label + tone), `pinoutAccess()`, `pinoutPdfHref()`. `constants/pdf.ts`: `PDF_MAX_BYTES` (10 MB), `PDF_ACCEPT` |
| Query keys | `queryKeys.pinouts` |
| Strings | `messages/ar.ts` → `pinouts`, `pdfDropzone`, `errors.uploadPdf` |

### Shared changes

- **`services/storage.service.ts`** gains the PDF side: `uploadPdf(file)`, `deletePdfByKey(key)`, `getPdf(key)`, `isValidPdfKey`, `PDF_FOLDER`. The image functions now share private `putObject` / `deleteObject` / `getObject` helpers, with the same behaviour as before (re-checked below). It is still the only file that talks to R2.
- **`next.config.ts`**: `serverActions.bodySizeLimit` goes from `3mb` to `11mb` (10 MB PDF + multipart overhead). Each service still enforces its own cap: 2 MB for images, 10 MB for PDFs.

---

## Fields

| Field | Rule | Notes |
|---|---|---|
| `name` | 2–120 | The title in the store: "EDC17C46 — الفيشة A". **Not unique**: two platforms each have a "main connector" |
| `platformId` | optional | Picked from every platform as "Bosch EDC17C46", or **بدون منصة**. A pinout can be listed before its platform exists (schema). `""` → no link |
| `connector` | ≤ 40, optional | "A", "B", "Main 94-pin". LTR, mono. `""` → `null` |
| `slug` | 2–80, `SLUG_PATTERN` | Fills from **platform + connector** (`bosch-edc17c46-a`), or from the **name** when no platform is picked, with a live `/pinouts/…` preview. Stops once typed in; never changes on edit |
| `imageUrl` | `null` or `/api/images/pinouts/<uuid>.(png\|jpg\|webp)` | Only a preview **we** uploaded |
| `pdfKey` | `null` or `pinout-pdfs/<uuid>.pdf` | Only a PDF **we** uploaded. A key, not a URL: the bucket is private |
| — | **at least one of the two files** | "ارفع صورة المعاينة أو ملف الـ PDF على الأقل.", reported on `pdfKey`. A pinout with neither shows a technician nothing |
| `requiresSignIn` | boolean, **default on** | Business-analysis open question 1, whose default is "free for signed-in users". Affects the PDF only: the preview is public either way |
| `isActive` | boolean | Inactive pinouts are hidden from the store, and their PDF opens for admins only |

---

## Rules (`pinout.service.ts`)

| Rule | Why |
|---|---|
| Duplicate slug (`P2002`) → field error "هذا الرابط مستخدم لبن أوت آخر." | `slug` is the only unique column |
| The platform, when one is picked, must exist. It is checked before the write (`platformService.getById`), and a `P2003` / `P2018` race gets the same treatment. Otherwise it is an error on **`platformId`**: "المنصة المختارة لم تعد موجودة…" | The form's platform list can be stale |
| Update can **link, move or unlink** the platform (`connect` / `disconnect`) | |
| Replacing or removing the **preview or the PDF** deletes the old file from R2 **after** the save (best-effort, as with brand logos) | No orphans |
| **Delete is never refused**. The row goes, then the preview and the PDF leave R2 | Nothing references a pinout: no orders, no links to it |
| Missing row → "البن أوت غير موجود — ربما حُذف." | |
| A platform with pinouts can't be deleted | Already enforced by `platform.service.ts` ("1 بن أوت"), even though the schema would `SetNull`. Pinout mutations invalidate the platforms query, so its counts stay right |

---

## PDFs

### Upload

1. The admin picks or drops a file in `PdfDropzone`, which checks the type (`application/pdf`) and the size (≤ 10 MB) in the browser for quick feedback.
2. `useUploadPinoutPdf` → `uploadPinoutPdfAction(FormData)`, admin only.
3. `storageService.uploadPdf(file)`:
   - checks the size is ≤ 10 MB;
   - checks the file starts with the **`%PDF-`** magic bytes, never trusting its name or browser type;
   - puts `pinout-pdfs/<uuid>.pdf` in R2 with `Cache-Control: private, no-store`;
   - returns the **key**.
4. The key goes into the form's `pdfKey`, and **Save** stores it with the pinout.

The PDF goes through a Server Action like images do. `@aws-sdk/s3-request-presigner` (presigned PUT straight to R2) stays unused: it would need CORS on the bucket and a "confirm" step, and 10 MB fits comfortably under the raised body limit. Move to it if PDFs ever need to be much larger.

### Keys are kept apart from images

PDFs live under `pinout-pdfs/`, a prefix the image route's allow-list (`brands|products|pinouts` + `png|jpg|webp`) never matches. Requesting `/api/images/pinout-pdfs/<uuid>.pdf` returns 404 (verified), so a PDF can never be read without the access check.

### `PdfDropzone`

`FileDropzone` holds an image URL and previews it. A PDF key has no public URL, so `PdfDropzone`:

- shows the **name and size** of a file picked in this session, with "يُحفظ مع البن أوت عند الضغط على حفظ.";
- shows **"ملف PDF محفوظ"** plus a **فتح** button for the file already saved on the pinout. The button links to `/api/pinouts/[id]/pdf` and appears only while the form's `pdfKey` still equals the saved one (`savedPdfHref`);
- has replace and remove buttons, drag-and-drop and inline errors, the same as `FileDropzone`. Its strings are `ar.pdfDropzone`.

### `GET /api/pinouts/[id]/pdf`

The third of the app's three Route Handlers (`folder-structure.md`). The access rule lives in `pinoutService.openPdf`, and the route only maps its answer:

| Case | Response |
|---|---|
| Unknown id, no PDF, or the object is missing from R2 | **404** |
| An admin (`authService.getCurrentUser()`, role `ADMIN`) | **200**, even when the pinout is inactive, so the admin can check it |
| Inactive pinout, anyone else | **404** |
| `requiresSignIn` and no synced user | **303 → `/sign-in`**. Sign-in always lands on `/auth-callback` (forced redirect, `auth-feature.md`), so no return URL is passed |
| Otherwise | **200** `application/pdf`, `Content-Disposition: inline; filename="<slug>.pdf"`, `Cache-Control: private, no-store`, `X-Content-Type-Options: nosniff`, streamed from R2 |

---

## List

- Columns:
  - preview (`FileText` glyph without one, hidden below `sm`);
  - the pinout: name, with "الفيشة …" in mono beneath when there is a connector;
  - platform, "Bosch EDC17C46", or a muted **بدون منصة** (`lg`);
  - **files**: `PDF` (`success`) or `بدون PDF` (`warning`). The preview tile already shows whether there is an image;
  - **التحميل**: `للمسجّلين` (`info`) / `للجميع` (`success`), from `requiresSignIn` (`md`);
  - status, labelled **العرض** as on the controllers page (`md`);
  - actions: edit, **فتح الـ PDF** (new tab, only when there is one) and delete.
- Sorted by last update.
- **Search** uses identifier normalisation over the name, slug, connector, platform name and manufacturer + platform: "main94" finds "Main 94-pin", and "bosch edc-17c46" finds every EDC17C46 pinout.
- A **platform filter** offers كل المنصات, بدون منصة, and every platform that has pinouts. It combines with the search. "بدون منصة" is how an admin finds pinouts still waiting for their platform.
- The delete dialog warns that the preview and the PDF go too. It has no blocked state.
- Mutations invalidate **the pinouts and the platforms** queries.
- The list never carries the R2 key: `PinoutListItem.hasPdf` is a boolean.

---

## Not in this CRUD

- The storefront (`/pinouts`, `/pinouts/[slug]`, the download button and the "pinout for this controller" link on the controller page). That is M3, `pinouts-feature.md`.
- Several connectors in one PDF, or several PDFs per pinout. The schema has one `pdfKey`.
- An orphan sweep for files uploaded and then abandoned (a cancelled form). This is the same open item as for images (`product-images.md` "Later").

---

## Verified

- **Service and storage**, through a temporary route since deleted, against the dev DB and R2:
  - `uploadPdf` refused PNG bytes named `.pdf` ("الملف ليس PDF."), a 10 MB + 1 byte file, and an empty file;
  - a PDF and a PNG preview uploaded, and create with a platform, the connector and both files;
  - duplicate slug → `fieldErrors.slug`;
  - an unknown platform → `fieldErrors.platformId`, with nothing written;
  - schema: no files (the error on `pdfKey`), a URL instead of a PDF key, a product image URL as the preview, a short name, a 41-character connector and a bad slug are all refused; a preview alone is accepted;
  - the list item: its platform, `hasPdf: true`, and no key;
  - the platform's delete refused: "…مرتبطة بـ 1 بن أوت…";
  - update replacing the PDF, removing the preview, unlinking the platform and clearing the connector. The old PDF and the old preview were then **gone from R2**, and the new PDF read back byte for byte;
  - update of a missing id → not found;
  - delete, after which the PDF was gone from R2; `getById` → `null`; deleting twice → not found; `openPdf` → not found.
- **The storage refactor**: the PNG preview went through the shared upload path, was served by `/api/images/pinouts/…` (200 `image/png`), and returned 404 once deleted.
- **The PDF route over HTTP**, signed out:
  - `requiresSignIn` → 303 to `/sign-in`;
  - unknown id → 404;
  - the PDF's key through the **image** route → 404;
  - once public → 200 with `application/pdf`, `inline; filename="zz-test-pinout-a.pdf"`, `private, no-store` and `nosniff`, and the exact bytes;
  - once inactive → 404.
- All test rows (platform and pinout) and R2 objects were removed, and the run confirmed nothing was left.
- **UI**, on a temporary page since deleted, with sample rows hydrated into the real components:
  - the list's file, access and status badges, the "بدون منصة" row and the connector line;
  - normalised search, including the no-results state;
  - the **platform filter** popup (four options), and filtering to "بدون منصة";
  - the **row menu** (edit, فتح الـ PDF → `/api/pinouts/<id>/pdf` in a new tab, delete);
  - the delete dialog and its inline "admins only" refusal;
  - the empty state;
  - the form's required-name, slug and at-least-one-file errors;
  - auto-slug from the name with no platform (`me7-5`), then from platform + connector (`bosch-edc17c46-a`), stopping after a hand edit;
  - the PDF picker refusing a `.txt` in the browser, and showing the server's "admins only" refusal for a real PDF;
  - the edit form pre-filled, the saved PDF's فتح link, the slug left unchanged on edit, the file rule after removing the PDF, and the "admins only" refusal on save;
  - no overflow at 375px on the list and the form; no console errors.
- **Guards**: all three routes redirect to sign-in when signed out.
- `tsc --noEmit` is clean, and `eslint` is clean outside `src/generated` (the generated Prisma client already failed `npm run lint` before this change).
- **Not exercised**:
  - the flow as a signed-in admin, which needs a Clerk account;
  - the PDF route as a signed-in customer and as an admin. The admin branch and the signed-in branch are each one condition in `openPdf`;
  - the browser pane was hidden, so the popups were driven by keyboard and DOM events instead of pointer clicks.
