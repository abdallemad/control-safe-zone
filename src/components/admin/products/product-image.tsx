import type { LucideIcon } from "lucide-react"
import Image from "next/image"

import { cn } from "@/lib/utils"

/**
 * A product's cover on a white tile, or its type's glyph (Cpu for ICs, Usb
 * for programmers…) when it has none — never a placeholder photo
 * (prisma/schema.prisma `Product.imageUrl`).
 */
export function ProductImage({
  name,
  imageUrl,
  icon: Icon,
  className,
}: {
  name: string
  imageUrl: string | null
  icon: LucideIcon
  className?: string
}) {
  return (
    <span
      className={cn(
        "relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg border bg-white",
        className
      )}
    >
      {imageUrl ? (
        <Image src={imageUrl} alt={name} fill sizes="40px" className="object-contain p-1" />
      ) : (
        <Icon aria-hidden className="size-5 text-muted-foreground" />
      )}
    </span>
  )
}
