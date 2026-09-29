import "server-only"

/**
 * Emails that are made ADMIN when they sign in — the bootstrap for the first
 * admin(s). Comma-separated, case-insensitive: `ADMIN_EMAILS=a@x.com,b@y.com`.
 * Promotion only: removing an email here does not demote anyone.
 */
export const adminEmails: ReadonlySet<string> = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
)
