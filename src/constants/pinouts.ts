import type { StatusTone } from "@/components/shared/status-badge"
import { ar } from "@/messages/ar"

// Pinouts are not a sold type (no `ProductType` member), so their labels live
// here rather than in product-types.ts.

/** `Pinout.requiresSignIn` → label + tone (design-system.md "Status tones"). */
export const PINOUT_ACCESS_META = {
  signedIn: { label: ar.pinouts.access.signedIn, tone: "info" },
  public: { label: ar.pinouts.access.public, tone: "success" },
} as const satisfies Record<string, { label: string; tone: StatusTone }>

export const pinoutAccess = (requiresSignIn: boolean) =>
  PINOUT_ACCESS_META[requiresSignIn ? "signedIn" : "public"]

/** GET route that serves a pinout's PDF after the access check. */
export const pinoutPdfHref = (id: string) => `/api/pinouts/${id}/pdf`
