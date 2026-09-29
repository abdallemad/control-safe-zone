# Programmers Admin Feature

Admin CRUD for **programmers**, the tools the store sells: "KESS V3", "Autotuner", "PCMflash". It covers the list, create, edit and delete, with the cover image on R2 and the **compatibility editor**: which controller platforms each tool reads, and whether it does so over **OBD, Boot or Bench**.

- Routes: `/admin/hardware/programmers` (list), `/admin/hardware/programmers/new`, `/admin/hardware/programmers/[id]/edit`. Create and edit are full pages.
- Sidebar: **الكتالوج › الهاردوير › المبرمجات**.
- Built **the same way as ICs**. Read [`ics-admin-feature.md`](./ics-admin-feature.md) first, and [`brands-feature.md`](./brands-feature.md) for the layers. This doc covers what differs, plus the **shared product layer** that both sold types now use.
- Programmers are **sold with stock**. That is business-analysis open question 2, whose default is "sold", and the schema follows it: `ProgrammerDetails` hangs off a `Product`.
- The storefront side (`/programmers`, the compatibility table) is still to come in `programmers-feature.md`.

A programmer is written as three pieces, in **one nested Prisma write**:

```text
Product (type PROGRAMMER)   listing: name, slug, manufacturer, price, stock, cover, flags
└── ProgrammerDetails       the tool: toolName (unique), edition, boxContents
    └──< ProgrammerSupport  a platform it reads + obd / boot / bench + notes
```

---

## Files

| Layer | File |
|---|---|
| Pages | `app/(admin)/admin/hardware/programmers/page.tsx` (prefetch + `HydrationBoundary`), `new/page.tsx` and `[id]/edit/page.tsx` (both prefetch the platforms for the picker). Each starts with `requireAdmin()` |
| UI | `components/admin/programmers/programmers-view.tsx`, `programmer-editor.tsx`, `delete-programmer-dialog.tsx` |
| Form | `components/forms/programmer-form.tsx` (presentational, `standardSchemaResolver(programmerSchema)`) |
| Hooks | `hooks/use-programmers.ts`: `useProgrammers`, `useCreateProgrammer`, `useUpdateProgrammer`, `useDeleteProgrammer`, `useUploadProgrammerImage` |
| Actions | `actions/programmer/list-programmers.ts`, `create-programmer.ts`, `update-programmer.ts`, `delete-programmer.ts`, `upload-programmer-image.ts` |
| Schema | `schemas/programmer.schema.ts`: `programmerSchema`, `programmerIdSchema` |
| Service | `services/programmer.service.ts` |
| Repository | `repositories/programmer.repository.ts` (`prisma.product`, scoped to `type: "PROGRAMMER"`) |
| Types | `types/programmer.ts`: `ProgrammerListItem` (with derived `modes`), `ProgrammerDetail` |
| Constants | `constants/product-types.ts`: `PROGRAMMER_MODES` (`obd`, `boot`, `bench`, in display order), `PROGRAMMER_MODE_META` |
| Strings | `messages/ar.ts` → `programmers`, plus the shared `products` |

---

## Shared product layer

ICs were the first sold type and programmers are the second. Instead of a second copy, what they share now lives in `product.*` files. The IC CRUD was moved onto them, with the same behaviour, re-verified. **Controllers should use them too.**

| File | Gives every sold type |
|---|---|
| `schemas/product.schema.ts` | `productListingShape`: manufacturer, name, slug, description, imageUrl, price, compareAtPrice, stock, threshold and flags, with Arabic messages from `ar.products.validation`. Each type spreads it into its `z.object`. Also `refineProductListing` (compare-at must be higher than the price, and no platform twice), `platformIdField`, `platformLinks(row)` (≤ 50 rows), `wholeNumber()` and `productIdSchema` |
| `repositories/product.repository.ts` | `productListingSelect` (the listing columns), `productOrdersSelect` (the list's distinct orders), `findImageUrls(id, type)`, `countOrders(id)`, `countPlatforms(ids)`, `delete(id)` |
| `services/product.service.ts` | `toListingData(input)` (form → `Product` columns; money stays a string), `serializeMoney(row)` (Decimal → string), `assertPlatformsExist(ids)`, `rethrow(error, notFound)` (`P2002` slug, `P2018`/`P2003` platform, `P2025` not found), `cleanUpReplacedImage(old, new)`, `remove(id, type, messages)` (the order-history rule and R2 cleanup), `uploadImage(file)` |
| `components/forms/product-listing-fields.tsx` | `ProductImageCard`, `ProductPricingCard` (with `MoneyInput`), `ProductVisibilityCard`, `PlatformSelect`, `NoPlatformRows`, `toNumber` / `toOptionalNumber`. The cards are generic over the form (`T extends ProductListingInput`) and touch only the shared fields |
| `components/admin/products/product-image.tsx` | `ProductImage`: the cover on a white tile, or the type's glyph (`Cpu`, `Usb`). It replaces `IcImage` |
| `components/admin/products/stock-cell.tsx` | `StockCell`: the stock badge plus the unit count |
| `messages/ar.ts` → `products` | The shared form labels, `units`, `featured`, the shared errors (`slugTaken`, `platformMissing`) and the listing validation |

Each type still owns its detail fields, its link rows, its list columns, its delete dialog and its `notFound` / `inOrders` wording, because the Arabic differs ("آي سي … موجود" vs "جهاز … موجود").

---

## Fields

**The tool** (`ProgrammerDetails`)

| Field | Rule | Notes |
|---|---|---|
| `toolName` | 2–60, **unique regardless of case** | "KESS V3". LTR, mono. The DB index is case-sensitive, so the service also checks case-insensitively, excluding the row being edited: "kess v3" is refused next to "KESS V3" |
| `manufacturer` | 2–40 | The **tool maker** (Alientech, Magic Motorsport). Stored on `Product`. Existing makers are suggested |
| `edition` | ≤ 40, optional | "Master", "Slave", a license variant. Shown as a badge beside the tool name |
| `boxContents` | ≤ 1000, optional | Shown under "محتويات العلبة" in the store |

**The listing**: shared with ICs, see [`ics-admin-feature.md`](./ics-admin-feature.md#fields). The slug fills from **manufacturer + tool + edition** (`alientech-kess-v3-master`) with a live `/programmers/…` preview.

**Supported platforms** (`ProgrammerSupport`): up to 50 rows, no platform twice. Each row has:

| Field | Rule |
|---|---|
| `platformId` | required |
| `obd`, `boot`, `bench` | **at least one must be ticked**: "اختر طريقة واحدة على الأقل — OBD · Boot · Bench." A row that reads the ECU no way at all says nothing. The error is reported on `obd` and clears as soon as a box is ticked |
| `notes` | ≤ 120, optional: "read only", "needs adapter X" |

---

## Rules (`programmer.service.ts`)

Everything in the IC rules table applies through `product.service.ts`: one nested write, links replaced on update, platforms checked, slug unique across all products, the cover replaced in R2, and the delete refused by order history. What is specific:

| Rule | Why |
|---|---|
| **Tool name unique regardless of case**: a field error on `toolName`, "يوجد جهاز بنفس الاسم.", from the pre-check or from `P2002` on `toolName` | The schema's rule: "Kess V3" and "KESS v3" are one tool |
| **One listing per tool** | A consequence of that unique index. Editions (Master / Slave) can't be two listings of the same `toolName`. If the business sells them separately, the index must change first |
| Supports are replaced wholesale on update (`deleteMany` + `create`) | Same as IC links |
| The list's `modes` are **derived**: a mode is on if **any** support row has it | Business rule: "The programmer-level 'supports OBD' filter is derived" (schema comment) |

### Order-history count: distinct orders

The delete rule counts **orders**, not order lines (`countOrders`, and `productOrdersSelect` for the list). One order holding the same product twice now says "في 1 طلب", not "2". This was found while testing programmers and fixed for ICs as well.

---

## List

- Columns:
  - cover (`Usb` glyph without one, hidden below `sm`);
  - the tool: name in mono, the edition badge, a ★ when featured, and the Arabic name beneath;
  - maker (`md`);
  - price with the real compare-at (`sm`);
  - stock (`StockCell`);
  - **support modes** as `info` badges, OBD · Boot · Bench (`lg`);
  - supported-platform count (`lg`);
  - status (`md`);
  - actions.
- **Search** uses identifier normalisation over the tool name, tool + edition, maker + tool, the Arabic name and the slug: "alientech kess" finds KESS V3, and "pcm flash" finds PCMflash.
- A **mode filter** (كل الطرق / OBD / Boot / Bench) combines with the search.
- The delete dialog blocks up front when the programmer is in any order.
- Mutations invalidate **the programmers and the platforms** queries, because the platforms table counts linked programmers.

The mode badges are a list summary. The storefront compatibility table will use the design-system `Check` / `Minus` marks per column.

---

## Not in this CRUD

- Gallery images, compatible vehicles and `weightGrams`, as with ICs.
- The reverse view, "أجهزة تدعم هذا الكنترول" on a platform or controller. It belongs to the storefront and the controllers CRUD.

---

## Verified

- **Service**, through a temporary route since deleted, against the dev DB:
  - create with two support rows, with the flags and notes checked in the database;
  - "kess v3" refused next to "KESS V3" → `fieldErrors.toolName`;
  - duplicate slug → `fieldErrors.slug`;
  - an unknown platform → `fieldErrors.platforms`, with nothing written;
  - update keeping its own name in another case, removing the edition, and replacing the supports;
  - the list item's derived `modes` and counts;
  - the platforms' programmer counts;
  - an IC id is not found as a programmer, and the reverse;
  - `programmerService.remove(icId)` → not found;
  - delete refused while in an order, with the list's `ordersCount` = 1 for one order with two lines, then allowed;
  - supports cascaded;
  - deleting twice → not found;
  - schema: no mode ticked, a duplicate platform, compare-at not higher, a short tool name and long notes are all refused.
- **IC regression** in the same run: create, update, delete, a slug already taken by a programmer, and the IC schema, all through the shared layer.
- All test rows were removed, and the run confirmed nothing was left.
- **UI**, on temporary pages since deleted:
  - the list's stock states, mode badges and edition badges;
  - search;
  - the delete dialog blocked by orders;
  - the form's auto-slug from maker + tool + edition, with the preview;
  - adding a support row;
  - the platform-required, mode-required and compare-at errors;
  - the mode error clearing when OBD is ticked;
  - the server's "admins only" refusal on submit;
  - the IC form on the shared cards;
  - no overflow at 375px on the list and the form.
- **Guards**: all three routes redirect to sign-in when signed out.
- `tsc --noEmit` and `eslint` are clean.
- **Not exercised**:
  - the flow as a signed-in admin, which needs a Clerk account;
  - a real image upload, which is the same shared path as ICs;
  - picking a platform in the programmer form, and the mode filter's dropdown. The browser pane was hidden during this run, so popups could not open. Both are the same `Select` components already exercised on the IC pages.
