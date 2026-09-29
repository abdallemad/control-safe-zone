import Link from "next/link";

import { BrandLockup } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { ar } from "@/messages/ar";

// Arabic 404. Most nav links land here until their feature is built.
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <BrandLockup href={ROUTES.home} />
      <p className="font-mono text-7xl font-bold text-primary">404</p>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{ar.notFound.title}</h1>
        <p className="text-muted-foreground">{ar.notFound.description}</p>
      </div>
      <Button size="xl" render={<Link href={ROUTES.home} />} nativeButton={false}>
        {ar.notFound.home}
      </Button>
    </main>
  );
}
