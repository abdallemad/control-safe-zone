import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";

import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ROUTES } from "@/constants/routes";
import { clerkAppearance, clerkLocalization } from "@/lib/clerk";
import "./globals.css";

// Arabic + Latin in one family — see docs/design-system.md "Typography".
const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

// Identifiers shown on their own: part numbers, hardware numbers, order numbers.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "كنترول سيف زون — قطع إلكترونيات السيارات",
    template: "%s | كنترول سيف زون",
  },
  description:
    "آي سيهات، كنترولات، أجهزة برمجة وبن أوت لفنيي إلكترونيات السيارات في مصر. الدفع أونلاين أو عند الاستلام، والشحن لكل المحافظات.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${plexArabic.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Every sign-in and sign-up ends on /auth-callback, which syncs the
            user with the database and routes by role (docs/auth-feature.md).
            "Force", not "fallback": a sign-in started from /admin must still
            pass through the sync. */}
        <ClerkProvider
          localization={clerkLocalization}
          appearance={clerkAppearance}
          signInForceRedirectUrl={ROUTES.authCallback}
          signUpForceRedirectUrl={ROUTES.authCallback}
          afterSignOutUrl={ROUTES.home}
        >
          <QueryProvider>
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster dir="rtl" position="top-center" />
          </QueryProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
