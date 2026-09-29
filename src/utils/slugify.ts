/**
 * URL slug from a Latin name: `"Land Rover"` → `"land-rover"`,
 * `"Mercedes-Benz "` → `"mercedes-benz"`. Arabic and other non-Latin
 * characters are dropped, so an Arabic-only name gives `""` — the form then
 * asks for a slug by hand.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents: Škoda → skoda
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

/** What a stored slug must look like — lower-case words joined by single dashes. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
