import { BrandLockup } from "@/components/shared";
import { ROUTES } from "@/constants/routes";

// Sign-in, sign-up and the auth callback: centred on a quiet brand wash,
// no navigation to wander off into mid-flow.
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-8 px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--brand-50),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(0.68_0.18_24/12%),transparent_60%)]"
      />
      <BrandLockup href={ROUTES.home} className="relative" />
      <div className="relative flex w-full justify-center">{children}</div>
    </main>
  );
}
