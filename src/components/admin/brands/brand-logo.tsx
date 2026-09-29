import Image from "next/image"

import { cn } from "@/lib/utils"

/**
 * A brand's logo on a white tile (logos are drawn for light backgrounds), or
 * its first letter when it has none.
 */
export function BrandLogo({
  name,
  logoUrl,
  className,
}: {
  name: string
  logoUrl: string | null
  className?: string
}) {
  return (
    <span
      className={cn(
        "relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg border bg-white",
        className
      )}
    >
      {logoUrl ? (
        <Image src={logoUrl} alt={name} fill sizes="40px" className="object-contain p-1" />
      ) : (
        <span aria-hidden className="text-sm font-bold text-muted-foreground uppercase">
          {name.charAt(0)}
        </span>
      )}
    </span>
  )
}
