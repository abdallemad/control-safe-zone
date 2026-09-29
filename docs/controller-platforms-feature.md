# Controller Platforms Feature

Admin CRUD for **controller platforms**: "Bosch EDC17C46", "Bosch MED17.5", "Continental SIMOS 18.1". They are the reference data every catalog category links to:

```text
ControllerPlatform ──< ControllerDetails   controller units for sale   (onDelete: Restrict)
                   ──< IcPlatform          ICs used on it              (onDelete: Cascade)
                   ──< ProgrammerSupport   programmers that read it    (onDelete: Cascade)
                   ──< Pinout              wiring diagrams             (onDelete: SetNull)
```

- Routes: `/admin/platforms` (list), `/admin/platforms/new`, `/admin/platforms/[id]/edit`. Create and edit are full pages.
- Sidebar: group **البيانات المرجعية**, next to الماركات.
- Built **the same way as brands**, the reference CRUD. Read [`brands-feature.md`](./brands-feature.md) for the layers, conventions and shared plumbing. This doc covers what differs.

There is **no image**. `ControllerPlatform` has no logo column, so there's no upload and no R2 here.

---

## Files

| Layer | File |
|---|---|
| Pages | `app/(admin)/admin/platforms/page.tsx` (prefetch + `HydrationBoundary`), `new/page.tsx`, `[id]/edit/page.tsx`. Each starts with `requireAdmin()` |
| UI | `components/admin/platforms/platforms-view.tsx`, `platform-editor.tsx`, `delete-platform-dialog.tsx` |
| Form | `components/forms/platform-form.tsx` (presentational, `standardSchemaResolver(platformSchema)`) |
| Hooks | `hooks/use-platforms.ts`: `usePlatforms`, `useCreatePlatform`, `useUpdatePlatform`, `useDeletePlatform` |
| Actions | `actions/platform/list-, create-, update-, delete-platform.ts` |
| Schema | `schemas/platform.schema.ts`: `platformSchema`, `platformIdSchema` |
| Service | `services/platform.service.ts` |
| Repository | `repositories/platform.repository.ts` (`prisma.controllerPlatform`) |
| Types | `types/platform.ts`: `PlatformListItem` (with `links`), `PlatformDetail`, `PlatformLinkCounts` |
| Utils | `utils/describe-platform-links.ts`: "12 كنترول، 3 آي سي" from the counts, shared by service and dialog |
| Strings | `messages/ar.ts` → `platforms` |

---

## Fields

| Field | Rule | Notes |
|---|---|---|
| `manufacturer` | 2–40 | The **ECU maker** (Bosch, Continental, Delphi, Denso), not a car brand. The form suggests existing manufacturers (`<datalist>`) so "Bosch" stays one spelling |
| `name` | 2–40 | As printed on the unit: `EDC17C46`, `MED17.5`, `SIMOS 18.1`. LTR, mono |
| `slug` | 2–80, `SLUG_PATTERN` | Auto-filled from **manufacturer + name**: Bosch + EDC17C46 → `bosch-edc17c46`, matching the schema's `/platforms/bosch-edc17c46`. Stops once typed in; never changes on edit |
| `description` | ≤ 500, optional | Notes for technicians. `""` → `null` |
| `isActive` | boolean | Inactive platforms are hidden from the store, and their links are kept |

---

## Rules (`platform.service.ts`)

| Rule | Why |
|---|---|
| **Name unique case-insensitively**: "edc17c46" = "EDC17C46" (`findByNameInsensitive`, excluding the row being edited) | The DB's unique index is case-sensitive, and a technician wouldn't see two platforms there. Error on the `name` field: "توجد منصة بنفس الاسم." |
| Duplicate slug (`P2002`) → field error "هذا الرابط مستخدم لمنصة أخرى." | Same as brands |
| **Delete refused while anything links to the platform** | See below |
| Missing row → "المنصة غير موجودة — ربما حُذفت." | |

### Why delete checks all four links

The schema reacts differently to each relation:

- **controller units**: the database **refuses** (`Restrict`), which would surface as a raw FK error;
- **IC links and programmer supports**: **silently deleted** (`Cascade`), losing compatibility data;
- **pinouts**: **silently unlinked** (`SetNull`).

So the service counts all four first and refuses with one sentence naming them: "لا يمكن حذف منصة مرتبطة بـ 12 كنترول، 3 آي سي، 5 جهاز برمجة، 2 بن أوت. عطّلها بدلًا من الحذف، أو أزل الارتباطات أولًا." The delete dialog shows the same sentence **before** the click (from the list's counts) and disables the button.

---

## List

- Columns: platform (name in mono, manufacturer beneath), slug, then the four **link counts** (كنترولات · آي سيهات · أجهزة · بن أوت, with zeros greyed), status and actions. On narrow screens the slug and three of the counts hide; the controllers count stays down to `sm`.
- Sorted by manufacturer, then name.
- **Search uses identifier normalisation** (`normalizeIdentifier`): "edc 17-c46" finds EDC17C46, "bosch med" finds MED17.5 (manufacturer + name), and "simos18.1" finds SIMOS 18.1.

---

## Verified

- **Service** (temporary route, since deleted), against the dev DB:
  - create;
  - a different-case duplicate name → field error;
  - a duplicate slug → field error;
  - update (description, deactivate), including keeping its own name in a different case;
  - list counts;
  - delete refused while a pinout was linked ("1 بن أوت"), then allowed once unlinked;
  - deleting twice → not found.

  All test rows were removed.
- **UI** (temporary pages, since deleted):
  - the list with sample rows;
  - normalised search;
  - the delete dialog blocked with all four counts;
  - the form's auto-slug from manufacturer + name, which stops after a manual edit;
  - the live `/platforms/…` preview and the manufacturer suggestions;
  - the server's "admins only" refusal shown on submit.
- **Guards**: all three routes redirect to sign-in when signed out.
- **Not exercised**: the flow as a signed-in admin (needs a Clerk account).
