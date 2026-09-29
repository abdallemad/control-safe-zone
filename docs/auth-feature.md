# Auth Feature

Sign-in and sign-up with **Clerk** (Arabic), a `User` row in our database for every Clerk account, and role-based routing: **admins land on `/admin`, customers on `/`**.

Clerk owns *identity*: passwords, OAuth, email verification, sessions. The database owns everything the store needs: **role**, phone, addresses, orders. The **auth callback** keeps the two in sync.

---

## The flow

```text
Visitor clicks "تسجيل الدخول" / "إنشاء حساب" (navbar)
↓
/sign-in or /sign-up          Clerk's <SignIn /> / <SignUp />, Arabic, brand-themed
↓  signInForceRedirectUrl / signUpForceRedirectUrl  (root layout)
/auth-callback                 loader: "جاري تجهيز حسابك"
↓
useAuthCallback()              React Query, runs once, retries twice
↓
syncUserAction()               Server Action: is anyone signed in?
↓
authService.getIdentity()      Clerk user → ClerkIdentity (verified email only)
↓
userService.syncFromIdentity() find / claim / create the User row, apply ADMIN_EMAILS
↓
userRepository                 Prisma → PostgreSQL (users)
↓
{ role, redirectTo }           HOME_BY_ROLE: ADMIN → /admin, CUSTOMER → /
↓
router.replace(redirectTo)
```

Every sign-in goes through the callback, including one that started on a protected page such as `/admin`. That is why the root layout uses Clerk's **force** redirect URLs, not the fallback ones: a fallback would let Clerk honour `?redirect_url=/admin` and skip the sync. The `NEXT_PUBLIC_CLERK_*_FALLBACK_REDIRECT_URL` entries in `.env` also point at `/auth-callback`, as a second line.

Sign-out returns to `/` (`afterSignOutUrl`).

---

## Files, layer by layer

Same layered flow as every feature (`folder-structure.md`):

| Layer | File | Responsibility |
|---|---|---|
| Route | `app/(auth)/sign-in/[[...sign-in]]/page.tsx`, `sign-up/[[...sign-up]]/page.tsx` | Clerk's components. Catch-all segments, because Clerk renders its own steps under them |
| Route | `app/(auth)/auth-callback/page.tsx` | `requireSignedIn()`, then renders the view |
| Route | `app/(auth)/layout.tsx` | Centred, brand-washed shell with no navigation, so users can't wander off mid-flow |
| UI | `components/auth/auth-callback-view.tsx` | Three states: syncing → done (redirecting) → error (retry / home) |
| Hook | `hooks/use-auth-callback.ts` | `useQuery` on the action, then `router.replace` |
| Action | `actions/auth/sync-user.ts` | Authenticate, call the services, return `ActionResult<AuthCallbackResult>` with an Arabic error |
| Service | `services/auth.service.ts` | The **only** server file that talks to Clerk: `getIdentity`, `getCurrentUser`, `requireSignedIn`, `requireAdmin` |
| Service | `services/user.service.ts` | `syncFromIdentity`: the business rules below |
| Repository | `repositories/user.repository.ts` | `findByClerkId`, `findByEmail`, `create`, `update`. Selects only session columns |
| DB provider | `lib/prisma.ts` | The single `PrismaClient` (cached on `globalThis` in dev) |
| Config | `lib/clerk.ts` | `arSA` localization, `appearance` mapped to design tokens |
| Config | `lib/env.ts` | `ADMIN_EMAILS` parsed into a `Set` |
| Types | `types/user.ts`, `types/action-result.ts` | `ClerkIdentity`, `SessionUser`, `AuthCallbackResult`, `ActionResult<T>` |
| Action | `actions/auth/get-session.ts` | `getSessionAction`: `{ fullName, role }` of the signed-in user, or `null` (navbar) |
| Hook | `hooks/use-session.ts` | `useSession()` → `{ session, isAdmin }`, keyed by the Clerk user id |
| UI | `components/layout/nav-admin-link.tsx` | the admin-only "لوحة التحكم" button in the navbar |
| Constants | `constants/routes.ts`, `constants/query-keys.ts` | `ROUTES`, `HOME_BY_ROLE`, `queryKeys.auth.callback` / `.session(clerkUserId)` |
| Strings | `messages/ar.ts` | `auth`, `authCallback`, `errors` |

`auth.service.ts` is the only file that imports `@clerk/nextjs/server` for reading the session. Everything else gets our own `ClerkIdentity` / `SessionUser` types, so a change of auth provider stays inside one file.

---

## Sync rules (`userService.syncFromIdentity`)

1. **Find** the row by `clerkId`.
2. Else **claim** a row with the same email. This lets you seed a user by email (the first admin, say), and it links on their first sign-in. It is safe because the identity's email is **verified** by Clerk (`getIdentity` returns `null` otherwise).
3. Else **create** a `CUSTOMER`.
4. On every sync, refresh `email` and `fullName` from Clerk. Clerk owns identity.
5. Write `phone` only when Clerk has a valid Egyptian mobile (`+201[0125]XXXXXXXX`), so a phone typed at checkout is never wiped.
6. **Role is owned by the database.** The only automatic change is **promotion** to `ADMIN` when the email is in `ADMIN_EMAILS`. Nothing demotes.
7. It is idempotent, and a race between two tabs (unique violation `P2002`) resolves to the row the other request created.

The name falls back in this order: first + last name, then username, then the part of the email before `@`.

---

## Making someone an admin

Pick one:

- **`ADMIN_EMAILS`** in `.env`, comma-separated, case-insensitive:
  ```env
  ADMIN_EMAILS=owner@example.com,ops@example.com
  ```
  The person is promoted on their next sign-in. Removing them from the list does **not** demote them.
- **Directly in the database**: set `users.role = 'ADMIN'` (Prisma Studio: `npx prisma studio`). This is also how you demote.

---

## Protecting pages

- **`proxy.ts`** runs `clerkMiddleware()` so `auth()` works everywhere. It **does not** guard routes. Clerk Core 3 deprecates path-matching guards (`createRouteMatcher`), and the Next.js auth guide (`node_modules/next/dist/docs/01-app/02-guides/authentication.md`) says the proxy must not be the only line of defence.
- **Each protected page checks itself**, next to the data:

  | Need | Call | On failure |
  |---|---|---|
  | anyone signed in | `await authService.requireSignedIn()` | → Clerk sign-in, then back |
  | an admin | `const admin = await authService.requireAdmin()` | signed out → sign-in · not synced → `/auth-callback` · customer → `/` |
  | optional user | `await authService.getCurrentUser()` | `null` |

- **Not in layouts.** A layout does not re-run on client navigation and does not stop its pages from rendering. `(admin)/admin/layout.tsx` is chrome only. Every admin page, and later every admin Server Action, calls `requireAdmin()` itself.
- `getCurrentUser` is wrapped in React `cache()`, so calling it several times in one render costs one query.

---

## UI

- **Navbar** (`components/layout/navbar.tsx`): the links from `constants/navigation.ts`, plus `NavAuth`, a client component using Clerk's `<Show when="signed-out|signed-in">` with `SignInButton` / `SignUpButton` / `UserButton`. Being client-side keeps the marketing pages static. `<SignedIn>` / `<SignedOut>` were **removed** in Clerk Core 3; use `<Show>`.
- **Mobile**: `MobileNav` opens a `Sheet` from the start side (`side="right"`) with the same links and the stacked auth buttons.
- **Admin button**: signed-in admins see a soft "لوحة التحكم" button before the user menu, in both the navbar and the mobile sheet (`NavAdminLink`). It works like this:
  - Clerk does not know roles, so the button reads ours: `useSession()` → `getSessionAction()` → `authService.getCurrentUser()`.
  - The query only runs when Clerk has a user.
  - Its key includes the Clerk user id, so sign-in, sign-out and account switches refetch it.
  - `/auth-callback` invalidates it after every sync, so a freshly promoted admin sees the button straight away.
  - Hiding the button is **cosmetic**. `/admin` is guarded by `requireAdmin()` on every page.
- **Clerk theme** (`lib/clerk.ts`): `appearance.variables` point at the CSS variables in `globals.css`, so Clerk follows the light-red brand and dark mode. Clerk's CSS sits in the `clerk` layer (`cssLayerName`), declared before `components` / `utilities` in `globals.css`, so Tailwind classes still override it. `colorNeutral` is the dark foreground on purpose: Clerk draws borders from it at low alpha.
- **Loader**: the brand mark with a soft pulse, a spinner, and `role="status"` / `aria-live="polite"` so screen readers announce progress.

---

## Environment

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | `.env` | Clerk instance |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `…_SIGN_UP_URL=/sign-up` | `.env` | Where Clerk sends signed-out users |
| `NEXT_PUBLIC_CLERK_SIGN_IN/UP_FALLBACK_REDIRECT_URL=/auth-callback` | `.env` | Backup for the force redirect in the layout |
| `ADMIN_EMAILS` | `.env` (optional) | Admin bootstrap |
| `DATABASE_URL` | `.env` | Postgres (Neon) |

In the Clerk dashboard, the application name shown on the sign-in card ("للمتابعة إلى …") is set under *Application → Name*.

---

## Database

`User` gained **`clerkId String @unique`**. Migration `20260928120000_add_user_clerk_id`.

The database had been created with `db push`, without migration history, so it was **baselined** first:

- `prisma/migrations/0_init/` holds the schema as it was.
- It was marked applied with `prisma migrate resolve --applied 0_init`.
- The `clerkId` migration was then applied with `migrate deploy`.

From here on, schema changes go through `npx prisma migrate dev --name <change>`. Don't use `db push` any more: it would make the history drift again.

A `User` still requires an **email**. A Clerk account without a verified primary email, such as phone-only sign-up if it is ever enabled, gets the Arabic error "لا يوجد بريد إلكتروني مؤكَّد على حسابك." on the callback. Supporting phone-only accounts means making `User.email` optional first.

---

## Testing it

1. `npm run dev`, then open `/`. The navbar shows "تسجيل الدخول" and "إنشاء حساب".
2. Sign up, verify the email, and you land on `/auth-callback`, see the loader, then `/`. A row appears in `users` with `role = CUSTOMER`.
3. Put your email in `ADMIN_EMAILS`, restart the dev server, sign out and in again. You are promoted and land on `/admin`.
4. As a customer, open `/admin` and you are sent to `/`. Signed out, `/admin` sends you to `/sign-in`.
