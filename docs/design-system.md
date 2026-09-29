# Design System

Control Safe Zone — **كنترول سيف زون**

The visual language of the store: colour, type, components and the rules that keep them consistent across the storefront and the admin. Everything here is implemented, not aspirational:

| What | Where |
|---|---|
| Tokens (colour, radius, fonts) | `src/app/globals.css` |
| Fonts, `lang="ar" dir="rtl"`, providers | `src/app/layout.tsx` |
| Primitives (shadcn, Base UI, **RTL mode**) | `src/components/ui/` |
| Shared building blocks | `src/components/shared/` — `Ltr`, `Price`, `StatusBadge` |
| Living reference | **`/design-system`** — every token and component, in Arabic, light and dark |

Open `/design-system` after any change here. It is not linked from the storefront and is `noindex`.

---

# Principles

1. **Search-first, not showroom.** A technician arrives with a part number. Identifiers are the loudest thing on a card after the name, and they are never truncated.
2. **One red action per screen.** The light-red primary marks *the* thing to do — "أضف إلى السلة", "إتمام الطلب". Everything else is outline, secondary, ghost or soft.
3. **Status is never colour alone.** Every state badge has a dot *and* an Arabic word; destructive actions have an icon *and* a verb.
4. **Arabic first, Latin exact.** The page is RTL; identifiers stay LTR, exactly as printed on the component.
5. **Mobile, in a workshop.** Big touch targets for primary actions (`size="xl"`, 44px), high contrast, nothing that depends on hover.

---

# Colour

## Brand scale — light red

A fixed scale, the same in light and dark themes. Use it through the semantic tokens below. Reach for `brand-*` directly only for illustrations, charts and one-off brand moments.

| Step | Hex | Contrast vs white | Use |
|---|---|---|---|
| `brand-50` | `#fff3f3` | — | `--primary-soft`: selected filter, active nav item, "فيرجن" |
| `brand-100` | `#ffe7e7` | — | soft-button hover |
| `brand-200` | `#ffd0d1` | — | text selection |
| `brand-300` | `#ffb0b0` | — | `--primary-ink` in dark mode |
| `brand-400` | `#ff8987` | 2.3 : 1 | `--ring` (focus) |
| **`brand-500`** | **`#f3625f`** | **3.1 : 1** | **`--primary`** — fills only |
| `brand-600` | `#de3b3d` | 4.4 : 1 | primary hover / pressed |
| `brand-700` | `#ba2b2b` | 6.0 : 1 | `--primary-ink`: red *text* on light surfaces |
| `brand-800`–`950` | `#942222` → `#430f10` | 8.4 → 16 : 1 | accent foreground, deep text on red tints |

### The contrast rule

`#f3625f` is a *light* red: white on it is **3.1 : 1**. That passes WCAG AA for UI components and large/bold text, but **not** for body text. Hence:

- A primary button or badge label is **always semibold** (built into the `default` variants).
- Red **text** on a light background is `text-primary-ink` (brand-700, 6 : 1), **never** `text-primary`.
- Hover **darkens** to `brand-600`; it never fades the fill with opacity.

If a later audit requires AA for the button label too, the one-line change is `--primary: var(--brand-600)` in `:root`. Nothing else moves.

## Semantic tokens

Components use these, never raw colours. Each is redefined under `.dark`.

| Token | Tailwind | Meaning |
|---|---|---|
| `--primary` / `-foreground` | `bg-primary text-primary-foreground` | the one main action |
| `--primary-soft` | `bg-primary-soft` | tinted brand surface |
| `--primary-ink` | `text-primary-ink` | red text, links |
| `--secondary`, `--muted`, `--accent` | … | quiet surfaces; `accent` is the brand tint for menus/hover |
| `--destructive` | `text-destructive` | delete, failure. A **deeper crimson** (`#b7191c`) than the brand |
| `--success` / `-soft` | `text-success bg-success-soft` | in stock, delivered, paid |
| `--warning` / `-soft` / `-ink` | `bg-warning-soft text-warning-ink` | low stock, awaiting payment/confirmation |
| `--info` / `-soft` | `text-info bg-info-soft` | new, confirmed, shipped |
| `--border`, `--input`, `--ring` | … | ring is `brand-400` |
| `--chart-1…5` | … | brand first, then blue, green, amber, grey |

Neutrals carry a faint warm tint (hue 20) so greys sit with the red instead of looking blue beside it.

### Red brand vs. destructive

With a red brand, "delete" can look like "buy". Three things keep them apart:

1. **Shade**: destructive is darker and bluer (crimson) than the coral primary.
2. **Shape**: the destructive button is **outlined**, never filled; the primary is filled; the soft primary is a filled tint.
3. **Words**: a destructive action always has a `Trash2`/`X` icon and an explicit verb ("حذف", "إلغاء الطلب").

---

# Typography

| Role | Font | Token |
|---|---|---|
| Everything | **IBM Plex Sans Arabic** (400/500/600/700): Arabic *and* Latin | `font-sans`, `font-heading` |
| Identifiers shown on their own | **IBM Plex Mono** (400/500) | `font-mono` via `<Ltr mono>` |

One family covers both scripts, so a part number inside an Arabic sentence does not change typeface mid-line.

- Body `line-height: 1.7`. Arabic needs the room for dots and tall ascenders.
- Scale in use: `text-4xl` bold (hero), `text-2xl` semibold (page title), `text-xl` bold (section), `text-base` (body), `text-sm` (cards, tables), `text-xs` (badges).
- Prices use `tabular-nums` so columns of prices align.

## Digits, currency, direction

- **Western digits** everywhere a technician reads a number: prices, part numbers, order numbers, phone numbers.
- `formatPrice()` (`src/utils/format-price.ts`): `Intl.NumberFormat("ar-EG", { currency: "EGP", numberingSystem: "latn" })` → `1,250 ج.م.` / `99.50 ج.م.`. Always render through `<Price>`.
- Every identifier goes through **`<Ltr>`**, a `<bdi dir="ltr">`. Without it `2.0 TDI` renders as `TDI 2.0`, and `0281 018 758` can reorder around Arabic text. Use `<Ltr mono>` when the identifier stands alone (spec rows, order numbers, cart lines).
- `<Ltr>` is `w-fit`. As a flex/grid item it would otherwise stretch, and a stretched LTR box aligns left inside an RTL row.
- Inputs for LTR values (phone, part number) are `dir="ltr"` with `text-end`. Inside such an input, logical padding flips too: `pe-*` is the right side.

---

# Layout & shape

- **RTL**: `<html lang="ar" dir="rtl">`. Only logical utilities: `ms/me`, `ps/pe`, `start/end`, `text-start/end`, `border-s/e`. `components.json` has `"rtl": true`, so `npx shadcn add` generates logical classes and `rtl:` variants. **Always add components through the CLI**, never by copy-paste.
- Direction-bound icons (chevrons, arrows) take `rtl:rotate-180`; the generated breadcrumb, pagination and submenu already do.
- Sheets and drawers open from the **start** side, which is `side="right"` in RTL (cart, mobile nav, filters).
- Radius `--radius: 0.625rem`: inputs and buttons `rounded-lg`, cards `rounded-xl`, badges fully rounded, `size="xl"` CTA `rounded-xl`.
- Container `max-w-6xl`, gutter `px-4` on mobile, `sm:px-6`.

---

# Components

All primitives are **shadcn (base-nova style, Base UI)**, installed with the CLI into `src/components/ui/`. Base UI composes with `render` instead of Radix's `asChild`:

```tsx
<DialogTrigger render={<Button variant="destructive" />}>حذف</DialogTrigger>
```

Installed: `alert avatar badge breadcrumb button card checkbox collapsible dialog dropdown-menu field input label pagination radio-group select separator sheet sidebar skeleton sonner switch table tabs textarea tooltip`. `TooltipProvider` and `<Toaster dir="rtl" position="top-center" />` are mounted in the root layout.

## Brand additions to the generated primitives

Kept small and marked with comments in the files. Re-apply them if a component is ever re-added with `--overwrite`.

**Button** (`ui/button.tsx`)

| Variant | Use |
|---|---|
| `default` | the one primary action. Semibold, hover `brand-600` |
| `soft` | secondary brand action: "تحميل البن أوت", "عرض التوافق" |
| `outline` / `secondary` / `ghost` | everything else |
| `destructive` | **outlined** crimson, always with icon + verb |
| `link` | `text-primary-ink` |

Sizes add **`xl`** (h-11, `text-base`), the mobile CTA for "أضف إلى السلة" and "إتمام الطلب".

**Badge** (`ui/badge.tsx`) adds tone variants `brand`, `success`, `warning`, `info`, `neutral`. The `default` badge is semibold for the same contrast reason as the button.

**Sidebar** (`ui/sidebar.tsx`): the screen-reader labels (mobile sheet title/description, trigger text) are Arabic. Use it with `side="right"` (the start side in RTL), and pass `tooltip={{ children, side: "left" }}` to `SidebarMenuButton` — the primitive's default tooltip side is `right`, off-screen for a right-hand sidebar. Its colours are the `--sidebar-*` tokens (active item = brand-50 tint, brand-800 text). Usage: [`admin-dashboard.md`](./admin-dashboard.md).

## Shared (`@/components/shared`)

| Component | Purpose |
|---|---|
| `<Ltr mono?>` | LTR island for identifiers |
| `<Price amount compareAt? size?>` | EGP price, strikes through a *real* `compareAtPrice` only |
| `<StatusBadge tone>` | the one badge for every domain state: dot + Arabic label |

---

# Status tones

`StatusBadge` is domain-neutral. The `constants/` files (`order-status.ts`, `product-types.ts`), written with their features, map each enum value to a tone and an Arabic label. This is the mapping they must follow:

**Stock** (derived from `stockQuantity` / `lowStockThreshold`). Implemented: `stockState()` in `utils/stock-state.ts`, labels and tones in `STOCK_STATE_META` (`constants/product-types.ts`)

| State | Label | Tone |
|---|---|---|
| in stock | متوفر | `success` |
| `≤ lowStockThreshold` | كمية محدودة | `warning` |
| `0` | نفد المخزون | `neutral` (still listed and searchable, not buyable) |

**`ProductCondition`** + `isVirgin`

| Value | Label | Tone |
|---|---|---|
| `NEW` | جديد | `info` |
| `USED` | مستعمل | `neutral` |
| `REFURBISHED` | مجدد | `success` |
| `isVirgin` | فيرجن | `brand` (shown *in addition* to the condition) |

**`OrderStatus`**

| Value | Label | Tone |
|---|---|---|
| `PENDING_PAYMENT` | في انتظار الدفع | `warning` |
| `PENDING_CONFIRMATION` | في انتظار التأكيد | `warning` |
| `CONFIRMED` | تم التأكيد | `info` |
| `PROCESSING` | قيد التجهيز | `info` |
| `SHIPPED` | تم الشحن | `info` |
| `DELIVERED` | تم التوصيل | `success` |
| `CANCELLED` | ملغي | `destructive` |
| `RETURNED` | مرتجع | `neutral` |

**`PaymentStatus`**: `PENDING` → `warning`, `SUCCESS` → `success`, `FAILED` → `destructive`, `REFUNDED` → `neutral`.

**Programmer support** (`ProgrammerSupport.obd/boot/bench`): `Check` in `text-success` with `aria-label="مدعوم"`, `Minus` in `text-muted-foreground` with `aria-label="غير مدعوم"`. Not badges: the compatibility table is scanned by column. The one exception is the admin programmers **list**, which summarises a tool's derived modes as `info` badges (OBD · Boot · Bench, labels from `PROGRAMMER_MODE_META`), because it's a row summary, not a table to scan.

---

# Patterns

- **Product card**: cover (or the category glyph when `imageUrl` is null, never a placeholder photo), type badge at the start corner, "خصم" badge only with a real `compareAtPrice`, name, identifier in `<Ltr mono>`, meta line, stock + condition badges, `<Price>` and a cart icon button (disabled at zero stock). One card for all types, driven by `PRODUCT_TYPE_META`.
- **Checkout**: governorate `Select` → city → address; phone `dir="ltr"`; payment method as bordered radio cards (`has-data-checked:border-primary has-data-checked:bg-primary-soft`); summary with `<Price>`; one `size="xl"` primary button.
- **Errors**: `aria-invalid` on the field (red ring from the primitive) and an Arabic message in `text-sm text-destructive` below it. In forms, `<Field data-invalid>` plus `<FieldError>` from `ui/field` do both. An action's overall error goes in a destructive `Alert` above the buttons.
- **Image upload**: `FileDropzone` (`components/forms/file-dropzone.tsx`): a dashed drop area, then a preview on a white tile with replace and remove (remove is the outlined destructive button). Its strings are `ar.dropzone`.
- **List of identifiers** (IC markings): `TagInput` (`components/forms/tag-input.tsx`), mono LTR chips with an `X` each. Enter or a comma adds one, a pasted list adds all, and duplicates are dropped by `normalizeIdentifier`.
- **Alerts**: `Alert` for info, `variant="destructive"` for failures; success/warning use the `*-soft` background with the matching text token (see `/design-system`).
- **Loading**: `Skeleton` in the exact shape of the content it replaces.
- **Toasts**: `toast.success("تمت الإضافة إلى السلة", { description })`, top-center.

---

# Dark mode

Tokens are ready under `.dark` (class strategy, `@custom-variant dark`). The primary stays the same light red; `primary-ink` switches to `brand-300`; soft surfaces become 14% tints. The storefront theme switcher (planned in `storefront-layout.md`) should use `next-themes` (installed with `sonner`) with `attribute="class"`.
