# Controllers Admin Feature

Admin CRUD for **controllers**, the physical ECU units the store sells: "Bosch EDC17C46 0281 018 758", "Continental SIMOS 18.1 5WP45519AA". It covers the list, create, edit and delete, with the cover image on R2, the unit's **platform**, its hardware, software and part numbers, and its **condition** (جديد · مستعمل · مجدد) plus the **فيرجن** flag.

- Routes: `/admin/hardware/controllers` (list), `/admin/hardware/controllers/new`, `/admin/hardware/controllers/[id]/edit`. Create and edit are full pages.
- Sidebar: **الكتالوج › الهاردوير › الكنترولات**.
- Built **the same way as ICs and programmers**, on the shared product layer. Read [`programmers-admin-feature.md`](./programmers-admin-feature.md#shared-product-layer) for that layer and [`ics-admin-feature.md`](./ics-admin-feature.md) for the listing fields. This doc covers what differs.
- The storefront side (`/controllers`, search by hardware / software number) is still to come in `controllers-feature.md`.

A controller is written as two rows, in **one nested Prisma write**:

```text
Product (type CONTROLLER)   listing: name, slug, manufacturer, price, stock, cover, flags
└── ControllerDetails       the unit: platform, hardware / software / part numbers
                            (+ normalised twins), condition, isVirgin, litres, serial
    >── ControllerPlatform  exactly one — onDelete: Restrict
```

Unlike ICs and programmers, a controller has **no link rows**: a unit belongs to exactly one platform (`ControllerDetails.platformId`, required).

---

## Files

| Layer | File |
|---|---|
| Pages | `app/(admin)/admin/hardware/controllers/page.tsx` (prefetch + `HydrationBoundary`), `new/page.tsx` and `[id]/edit/page.tsx` (both prefetch the platforms for the picker). Each starts with `requireAdmin()` |
| UI | `components/admin/controllers/controllers-view.tsx`, `controller-editor.tsx`, `delete-controller-dialog.tsx`. The cover tile (`ProductImage` with the `CircuitBoard` glyph) and the stock column (`StockCell`) are shared |
| Form | `components/forms/controller-form.tsx` (presentational, `standardSchemaResolver(controllerSchema)`). The side column and the `PlatformSelect` come from `product-listing-fields.tsx` |
| Hooks | `hooks/use-controllers.ts`: `useControllers`, `useCreateController`, `useUpdateController`, `useDeleteController`, `useUploadControllerImage` |
| Actions | `actions/controller/list-controllers.ts`, `create-controller.ts`, `update-controller.ts`, `delete-controller.ts`, `upload-controller-image.ts` |
| Schema | `schemas/controller.schema.ts`: `controllerSchema`, `controllerIdSchema` |
| Service | `services/controller.service.ts` |
| Repository | `repositories/controller.repository.ts` (`prisma.product`, scoped to `type: "CONTROLLER"`) |
| Types | `types/controller.ts`: `ControllerListItem` (with its `platform`), `ControllerDetail` |
| Constants | `constants/product-types.ts`: `CONTROLLER_CONDITIONS` (kept in sync with the Prisma enum by `satisfies`), `CONDITION_META` (label + tone), `VIRGIN_META` |
| Query keys | `queryKeys.controllers` |
| Strings | `messages/ar.ts` → `controllers`, plus the shared `products` |

### Shared-layer changes

Two small, backwards-compatible additions, because a controller's platform is **one field** (`platformId`), not link rows (`platforms`):

- `productService.assertPlatformsExist(ids, field = "platforms")` and `productService.rethrow(error, notFound, platformField = "platforms")` take the form field the "platform no longer exists" error lands on. ICs and programmers keep the default.
- `refineProductListing` accepts a value without `platforms`, so the controller schema can use it for the compare-at rule.

---

## Fields

**The unit** (`ControllerDetails`)

| Field | Rule | Notes |
|---|---|---|
| `platformId` | required | Picked from every platform as "Bosch EDC17C46". Picking one **fills the manufacturer** when it is still empty. With no platforms in the catalog, the field links to `/admin/platforms/new` instead |
| `manufacturer` | 2–40 | The **ECU maker** (Bosch, Continental). Stored on `Product`. Suggestions come from existing controllers and platforms |
| `hardwareNumber` | 2–60 | **As printed on the label, spaces and all**: "0281 018 758". LTR, mono. The service also writes `hardwareNumberNormalized` (`0281018758`) |
| `softwareNumber` | ≤ 60, optional | Not every label shows it, and a virgin unit may have none. With `softwareNumberNormalized` (both `null` when empty) |
| `partNumber` | ≤ 60, optional | The car-maker's number: "03L906018JJ". With `partNumberNormalized` |
| `condition` | `ProductCondition` | جديد · مستعمل · مجدد. Required: the select starts empty |
| `isVirgin` | boolean | "فيرجن": wiped and ready to code to a new car. **Independent of the condition**: a used unit can be virgin |
| `litres` | optional, `^\d{1,2}(\.\d)?$`, > 0 | Engine capacity, `Decimal(3, 1)`: "1.6", "2". **A string end to end**, like money |
| `serialNumber` | ≤ 60, optional | The unit's own serial, for when a listing is one physical unit |

**The listing**: shared with every sold type, see [`ics-admin-feature.md`](./ics-admin-feature.md#fields). The slug fills from **platform + hardware number + software number** (`bosch-edc17c46-0281018758-1037541778`) with a live `/controllers/…` preview. The software number is in it because two units with the same hardware number but different software are different listings (business-analysis "Notes per category"). Before a platform is picked, the manufacturer stands in for it.

---

## Rules (`controller.service.ts`)

Everything in the shared layer applies: one nested write, the slug unique across all products, the cover replaced in R2, and the delete refused by order history. What is specific:

| Rule | Why |
|---|---|
| **Normalised twins** on every write: `hardwareNumberNormalized`, `softwareNumberNormalized`, `partNumberNormalized` (`normalizeIdentifier`), `null` when the number is empty | Search matches the normalised query against these (business-analysis "Identifier normalisation") |
| The platform must exist, checked before the write. Otherwise a field error on **`platformId`**: "إحدى المنصات المختارة لم تعد موجودة…". The same on a `P2018` / `P2003` race | The form's platform list can be stale |
| Update can **move the unit to another platform** (`platform: { connect }` in the same write) | |
| Every query is scoped to `type: "CONTROLLER"` | An IC's or programmer's id is "not found" here |
| **Delete refused while any order contains the controller**: "لا يمكن حذف كنترول موجود في 1 طلب…", counting distinct orders (`productService.remove`) | `OrderItem → Product` is `Restrict`. Deactivate instead |
| A platform with controllers on it can't be deleted | Already enforced by `platform.service.ts` ("1 كنترول"); the schema's `Restrict` backs it. Controller mutations invalidate the platforms query, so its counts stay right |
| `litres` leaves the service as a **string** | `Decimal` can't cross to the client |

There is **no uniqueness rule** on the hardware, software or serial number. Open question 6 (one listing per physical unit, or one per hardware/software number with a stock count) is undecided, and the schema has no unique index. Add a check here once it is decided.

---

## List

- Columns:
  - cover (`CircuitBoard` glyph without one, hidden below `sm`);
  - the unit: the hardware number in mono with a ★ when featured, "سوفتوير …" beneath when there is one, then the Arabic name;
  - platform, "Bosch EDC17C46" (`lg`);
  - **condition** badge plus **فيرجن** when set (`md`), toned per design-system "Status tones": جديد `info`, مستعمل `neutral`, مجدد `success`, فيرجن `brand`;
  - price with the real compare-at (`sm`);
  - stock (`StockCell`);
  - status, labelled **العرض** since الحالة is the condition here (`md`);
  - actions.
- **Search** uses identifier normalisation over the hardware, software, part and serial numbers, the platform name, manufacturer + platform, the Arabic name and the slug: "0281-018.758" finds "0281 018 758", and "simos18.1" finds every SIMOS 18.1 unit.
- A **condition filter** (كل الحالات / جديد / مستعمل / مجدد) combines with the search.
- The delete dialog blocks up front when the controller is in any order.
- Mutations invalidate **the controllers and the platforms** queries.

---

## Not in this CRUD

- Gallery images, compatible vehicles (`ProductVehicle`: "كنترولات تويوتا") and `weightGrams`, as with ICs.
- The reverse views on a controller: its ICs, the programmers that read its platform, its pinout. They belong to the storefront.

---

## Verified

- **Service**, through a temporary route since deleted, against the dev DB:
  - create with all three numbers; the normalised twins were checked in the database (`0281018758`, `1037541778`, `03L906018JJ`), and litres came back as `"1.6"`;
  - duplicate slug → `fieldErrors.slug`;
  - an unknown platform → `fieldErrors.platformId`, with nothing written;
  - update moving the unit to another platform, clearing the software and part numbers (the twins went to `null`), clearing litres and the compare-at, and changing the condition and the virgin flag;
  - the list item, with its platform;
  - `getById` of a missing id → `null`;
  - the platform's delete refused: "…مرتبطة بـ 1 كنترول…";
  - delete refused while in an order, with `ordersCount` = 1 for one order holding it twice, then allowed; the detail row cascaded; deleting twice → not found;
  - schema: no condition, no platform, a short hardware number, litres `1.65`, `0` and `100`, a compare-at not higher, and a long serial are all refused.
- **Shared layer regression** in the same run: an IC with an unknown platform still reports on `platforms`; an IC id is not found as a controller (get and delete), and a controller id is not found as an IC.
- All test rows (platforms, products, user, zone, order) were removed, and the run confirmed nothing was left.
- **UI**, on a temporary page since deleted:
  - the list with sample rows: the condition and فيرجن badges, the three stock states, the compare-at price, an inactive row;
  - normalised search on a hardware number, a software number and a platform;
  - the form's auto-slug from the typed numbers;
  - the platform-required, condition-required, litres and name errors;
  - the edit form pre-filled: the platform, condition, فيرجن switch and litres;
  - the compare-at error, and the server's "admins only" refusal on submit;
  - no overflow at 375px on the list and the form; no console errors.
- **Guards**: all three routes redirect to sign-in when signed out.
- `tsc --noEmit` and `eslint` are clean.
- **Not exercised**:
  - the flow as a signed-in admin, which needs a Clerk account;
  - a real image upload, which is the same shared path as ICs and programmers;
  - opening the platform and condition pickers, the condition filter and the row menu (so the delete dialog). The browser pane was hidden during this run, so popups could not open. They are the same `Select`, `DropdownMenu` and `ConfirmDeleteDialog` components exercised on the IC pages.
