/**
 * Is this a Prisma "known request" error with the given code?
 * (P2002 unique violation, P2003 foreign key, P2025 record not found.)
 *
 * Checked by shape, not `instanceof Prisma.PrismaClientKnownRequestError`:
 * lib/prisma.ts keeps one client on globalThis across dev hot reloads, so
 * after a reload the client throws errors built by the *previous* module's
 * class and `instanceof` against the freshly imported one is false — the
 * error would escape as a raw 500 instead of an Arabic field message.
 */
export function isPrismaError(
  error: unknown,
  code: string
): error is { code: string; meta?: Record<string, unknown> } {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { name?: unknown }).name === "PrismaClientKnownRequestError" &&
    (error as { code?: unknown }).code === code
  )
}

/** For P2002: the violated unique field(s), e.g. "slug" or "name". */
export function uniqueTarget(error: { meta?: Record<string, unknown> }): string {
  return String(error.meta?.target ?? "")
}
