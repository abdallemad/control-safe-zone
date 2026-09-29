"use client"

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"

import { NavAdminLink } from "@/components/layout/nav-admin-link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ar } from "@/messages/ar"

/**
 * Signed out: sign-in / sign-up. Signed in: Clerk's user menu.
 * Admins also get a "لوحة التحكم" button (NavAdminLink).
 * A client component so the marketing pages it sits on stay static.
 * After either flow Clerk lands on /auth-callback (ClerkProvider props in the
 * root layout), which syncs the user and routes by role.
 */
export function NavAuth({
  stacked = false,
  onNavigate,
}: {
  stacked?: boolean
  onNavigate?: () => void
}) {
  return (
    <>
      <Show when="signed-out">
        <div className={cn("flex items-center gap-2", stacked && "flex-col items-stretch")}>
          <SignInButton>
            <Button variant="ghost" size={stacked ? "xl" : "default"}>
              {ar.nav.signIn}
            </Button>
          </SignInButton>
          <SignUpButton>
            <Button size={stacked ? "xl" : "default"}>{ar.nav.signUp}</Button>
          </SignUpButton>
        </div>
      </Show>
      <Show when="signed-in">
        <div className={cn("flex items-center gap-3", stacked && "flex-col items-stretch")}>
          <NavAdminLink stacked={stacked} onNavigate={onNavigate} />
          <UserButton />
        </div>
      </Show>
    </>
  )
}
