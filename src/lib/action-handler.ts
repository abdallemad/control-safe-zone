import "server-only"

import type { z } from "zod"

import { ServiceError } from "@/lib/errors"
import { ar } from "@/messages/ar"
import { authService } from "@/services/auth.service"
import type { ActionResult } from "@/types/action-result"

// Shared plumbing for Server Actions, so each action file is just
// "who may call it, what it accepts, which service it calls".

/** `{ ok: false }` for a non-admin caller. */
export async function forbiddenUnlessAdmin(): Promise<ActionResult<never> | null> {
  return (await authService.getAdmin()) ? null : { ok: false, error: ar.errors.forbidden }
}

/** Zod issues → `{ field: firstMessage }` for the form. */
export function invalidInput(error: z.ZodError): ActionResult<never> {
  const fieldErrors: Record<string, string> = {}
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "")
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message
  }
  return { ok: false, error: ar.errors.invalidInput, fieldErrors }
}

/**
 * Run the service call. A ServiceError becomes its Arabic message (and field
 * errors); anything else is logged and hidden behind a generic message — a
 * stack trace never reaches the browser.
 */
export async function runAction<T>(label: string, run: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await run() }
  } catch (error) {
    if (error instanceof ServiceError) {
      return { ok: false, error: error.message, fieldErrors: error.fieldErrors }
    }
    console.error(`[${label}]`, error)
    return { ok: false, error: ar.errors.unexpected }
  }
}
