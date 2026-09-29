"use client"

import { CircleCheck, Loader2, RotateCw, ShieldCheck, TriangleAlert } from "lucide-react"
import Link from "next/link"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"
import { useAuthCallback } from "@/hooks/use-auth-callback"
import { ar } from "@/messages/ar"

const t = ar.authCallback

/**
 * The screen between Clerk and the store: syncs the user with the database,
 * then hands off to /admin or / (the hook does the redirect). Three states —
 * syncing, done (redirecting), failed (retry). The (auth) layout already
 * shows the brand lockup, so this shows only the mark.
 */
export function AuthCallbackView() {
  const { data, error, isError, isFetching, refetch } = useAuthCallback()

  if (isError && !isFetching) {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>{t.errorTitle}</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
        <div className="flex w-full flex-col gap-2">
          <Button size="xl" onClick={() => refetch()}>
            <RotateCw data-icon="inline-start" />
            {t.retry}
          </Button>
          <Button variant="ghost" render={<Link href={ROUTES.home} />} nativeButton={false}>
            {t.home}
          </Button>
        </div>
      </div>
    )
  }

  const done = Boolean(data)

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-8 text-center"
    >
      <div className="relative grid place-items-center">
        {/* A soft brand-coloured pulse behind the mark while we wait. */}
        {!done && (
          <span
            aria-hidden
            className="absolute size-24 animate-ping rounded-3xl bg-primary/20 [animation-duration:1.6s]"
          />
        )}
        <span className="relative grid size-20 place-items-center rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
          <ShieldCheck className="size-10" />
        </span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-lg font-semibold">
          {done ? (
            <CircleCheck className="size-5 text-success" />
          ) : (
            <Loader2 className="size-5 animate-spin text-primary" />
          )}
          {done ? t.successTitle : t.loadingTitle}
        </div>
        <p className="text-sm text-muted-foreground">
          {done ? t.successDescription : t.loadingDescription}
        </p>
      </div>
    </div>
  )
}
