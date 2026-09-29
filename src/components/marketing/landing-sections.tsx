import {
  ArrowLeft,
  Banknote,
  CircuitBoard,
  Cpu,
  FileText,
  MessageCircle,
  PackageCheck,
  Truck,
  Usb,
} from "lucide-react"
import Link from "next/link"

import { LandingCtaActions } from "@/components/marketing/landing-cta-actions"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ROUTES } from "@/constants/routes"
import { ar } from "@/messages/ar"

const t = ar.landing

// Placeholder until PRODUCT_TYPE_META (src/constants/product-types.ts) exists —
// then this grid reads its icon, label and route from the registry.
const CATEGORIES = [
  { href: ROUTES.ics, icon: Cpu, ...t.categories.ics },
  { href: ROUTES.controllers, icon: CircuitBoard, ...t.categories.controllers },
  { href: ROUTES.programmers, icon: Usb, ...t.categories.programmers },
  { href: ROUTES.pinouts, icon: FileText, ...t.categories.pinouts },
]

const TRUST = [
  { icon: PackageCheck, ...t.trust.stock },
  { icon: Banknote, ...t.trust.cod },
  { icon: Truck, ...t.trust.shipping },
  { icon: MessageCircle, ...t.trust.support },
]

export function CategoriesSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="mb-8 text-2xl font-bold">{t.categoriesTitle}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map(({ href, icon: Icon, title, description }) => (
          <Link key={href} href={href} className="group rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <Card className="h-full transition-shadow group-hover:shadow-md group-hover:ring-primary/40">
              <CardHeader className="gap-3">
                <span className="grid size-12 place-items-center rounded-xl bg-primary-soft text-primary-ink transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-6" />
                </span>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription className="leading-relaxed">{description}</CardDescription>
                <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary-ink">
                  {t.browse}
                  <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                </span>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function TrustSection() {
  return (
    <section className="border-y bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="mb-8 text-2xl font-bold">{t.trustTitle}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-background text-primary-ink ring-1 ring-border">
                <Icon className="size-5" />
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CtaSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      {/* Soft tint, not a red slab: body text on the light-red fill would be
          3.1:1 (docs/design-system.md "The contrast rule"). */}
      <div className="flex flex-col items-start gap-6 rounded-2xl bg-primary-soft p-8 ring-1 ring-primary/20 md:flex-row md:items-center md:justify-between md:p-12">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold md:text-3xl">{t.ctaTitle}</h2>
          <p className="text-muted-foreground">{t.ctaDescription}</p>
        </div>
        <LandingCtaActions />
      </div>
    </section>
  )
}
