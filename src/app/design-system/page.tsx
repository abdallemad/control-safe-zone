import type { Metadata } from "next";
import { Showcase } from "./_components/showcase";

// The living reference for docs/design-system.md — every token and primitive
// rendered in Arabic, RTL, with real catalog shapes. Not linked from the
// storefront and not indexed.
export const metadata: Metadata = {
  title: "نظام التصميم",
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  return <Showcase />;
}
