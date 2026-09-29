import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

// Header-only shell for the public pages (docs/folder-structure.md "app/").
export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </>
  );
}
