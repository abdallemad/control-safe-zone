import { Search } from "lucide-react"
import Link from "next/link"

import { Ltr } from "@/components/shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ROUTES } from "@/constants/routes"
import { ar } from "@/messages/ar"

const t = ar.landing

// Real identifiers a technician would type — shown as one-tap searches.
const POPULAR_SEARCHES = ["TC1797", "EDC17C46", "95320", "MED17.5", "KESS V3"]

/** Search-first hero: the store's front door is the search box. */
export function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      {/* Brand wash + a faint circuit grid, all from tokens. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--brand-100),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(0.68_0.18_24/18%),transparent_65%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-size-[40px_40px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />

      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 md:py-28">
        <Badge variant="brand" className="h-7 px-3 text-sm">
          {t.eyebrow}
        </Badge>
        <h1 className="text-4xl leading-tight font-bold text-balance md:text-5xl md:leading-tight">
          {t.title}
        </h1>
        <p className="max-w-2xl text-lg text-pretty text-muted-foreground">{t.description}</p>

        <form action={ROUTES.search} className="flex w-full max-w-xl gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              type="search"
              placeholder={t.searchPlaceholder}
              aria-label={t.searchPlaceholder}
              className="h-11 rounded-xl bg-background ps-10 text-base shadow-sm md:text-base"
            />
          </div>
          <Button type="submit" size="xl">
            {t.searchButton}
          </Button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="text-muted-foreground">{t.popular}</span>
          {POPULAR_SEARCHES.map((term) => (
            <Link
              key={term}
              href={`${ROUTES.search}?q=${encodeURIComponent(term)}`}
              className="rounded-full border bg-background px-3 py-1 font-mono text-xs transition-colors hover:border-primary hover:text-primary-ink"
            >
              <Ltr>{term}</Ltr>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
