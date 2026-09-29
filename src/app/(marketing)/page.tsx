import { Hero } from "@/components/marketing/hero";
import { CategoriesSection, CtaSection, TrustSection } from "@/components/marketing/landing-sections";

// Placeholder landing page — the real one is landing-page.md (M3).
export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoriesSection />
      <TrustSection />
      <CtaSection />
    </>
  );
}
