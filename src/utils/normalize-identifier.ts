/**
 * The one normal form for technical identifiers (docs/business-analysis.md
 * "Identifier normalisation"): upper-case, no spaces, dashes, dots, slashes
 * or underscores — so "TC-1797", "tc1797" and "TC 1797" all compare equal.
 *
 *   normalizeIdentifier("sak-tc 1797.512") → "SAKTC1797512"
 *
 * Services write it into the *Normalized columns; search runs the query
 * through it too. Safe on Arabic text (upper-casing is a no-op there), so
 * admin tables use it for their client-side search.
 */
export function normalizeIdentifier(value: string): string {
  return value.toUpperCase().replace(/[\s\-._/]+/g, "")
}
