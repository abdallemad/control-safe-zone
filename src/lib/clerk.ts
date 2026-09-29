import { arSA } from "@clerk/localizations"
import type { ClerkProvider } from "@clerk/nextjs"

type ClerkProviderProps = React.ComponentProps<typeof ClerkProvider>

/** Clerk in Arabic (docs/business-analysis.md: "Clerk, Arabic localization"). */
export const clerkLocalization = arSA

/**
 * Clerk's UI drawn with the design-system tokens (docs/design-system.md), so
 * sign-in, sign-up and the user menu follow the light-red brand and dark mode
 * without a second palette to maintain.
 */
export const clerkAppearance = {
  // Matches the `@layer … clerk …` order declared in globals.css, so Tailwind
  // utilities can still override Clerk's styles.
  cssLayerName: "clerk",
  variables: {
    colorPrimary: "var(--primary)",
    colorPrimaryForeground: "var(--primary-foreground)",
    colorDanger: "var(--destructive)",
    colorSuccess: "var(--success)",
    colorWarning: "var(--warning)",
    colorBackground: "var(--card)",
    colorForeground: "var(--card-foreground)",
    colorMuted: "var(--muted)",
    colorMutedForeground: "var(--muted-foreground)",
    colorInput: "var(--background)",
    colorInputForeground: "var(--foreground)",
    colorRing: "var(--ring)",
    // Clerk draws borders from this at low alpha, so it wants the *dark*
    // base colour (as its default does); passing the already-light --border
    // made input outlines disappear.
    colorNeutral: "var(--foreground)",
    fontFamily: "var(--font-plex-arabic)",
    borderRadius: "var(--radius)",
  },
} satisfies ClerkProviderProps["appearance"]
