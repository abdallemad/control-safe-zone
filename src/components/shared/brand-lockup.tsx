import { ShieldCheck } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { ar } from "@/messages/ar"

/**
 * The mark + name. `href` makes it a home link (navbar); omit it for a
 * static lockup (auth pages, loader).
 */
function BrandLockup({
  href,
  size = "default",
  className,
}: {
  href?: string
  size?: "sm" | "default" | "lg"
  className?: string
}) {
  const content = (
    <>
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground",
          size === "sm" && "size-7 [&_svg]:size-4",
          size === "default" && "size-9 [&_svg]:size-5",
          size === "lg" && "size-14 rounded-2xl [&_svg]:size-8"
        )}
      >
        <ShieldCheck />
      </span>
      <span
        className={cn(
          "leading-none font-bold whitespace-nowrap",
          size === "sm" && "text-base",
          size === "default" && "text-lg",
          size === "lg" && "text-2xl"
        )}
      >
        {ar.brand.name}
      </span>
    </>
  )

  const classes = cn("inline-flex items-center gap-2.5", className)

  return href ? (
    <Link href={href} className={classes} aria-label={ar.brand.name}>
      {content}
    </Link>
  ) : (
    <span className={classes}>{content}</span>
  )
}

export { BrandLockup }
