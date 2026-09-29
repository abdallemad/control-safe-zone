"use client"

import { Show, SignUpButton } from "@clerk/nextjs"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"
import { ar } from "@/messages/ar"

/** Sign-up for visitors, straight to search for signed-in users. */
export function LandingCtaActions() {
  return (
    <>
      <Show when="signed-out">
        <SignUpButton>
          <Button size="xl">
            {ar.nav.signUp}
          </Button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <Button
          size="xl"
          render={<Link href={ROUTES.search} />}
          nativeButton={false}
        >
          {ar.landing.ctaSignedIn}
        </Button>
      </Show>
    </>
  )
}
