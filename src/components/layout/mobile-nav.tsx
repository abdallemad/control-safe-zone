"use client"

import { Menu } from "lucide-react"
import { useState } from "react"

import { NavAuth } from "@/components/layout/nav-auth"
import { NavLinks } from "@/components/layout/nav-links"
import { BrandLockup } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ar } from "@/messages/ar"

/** Below `md`: the links in a sheet from the start side (right, in RTL). */
export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon-lg" className="md:hidden" aria-label={ar.nav.menu} />}
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle>
            <BrandLockup size="sm" />
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 px-4">
          <NavLinks orientation="vertical" onNavigate={() => setOpen(false)} />
          <Separator />
          <NavAuth stacked onNavigate={() => setOpen(false)} />
        </nav>
      </SheetContent>
    </Sheet>
  )
}
