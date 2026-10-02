/** A row of the admin pinouts table. */
export type PinoutListItem = {
  id: string
  name: string
  slug: string
  connector: string | null
  imageUrl: string | null
  /** Only whether there is one: the R2 key itself never leaves the server in a list. */
  hasPdf: boolean
  requiresSignIn: boolean
  isActive: boolean
  /** Null when the pinout is listed before its platform exists, or was unlinked. */
  platform: { id: string; name: string; manufacturer: string } | null
  updatedAt: Date
}

/** What the edit page loads — exactly the form's fields plus the id. */
export type PinoutDetail = {
  id: string
  name: string
  slug: string
  platformId: string | null
  connector: string | null
  imageUrl: string | null
  /** The private R2 key (`pinout-pdfs/<uuid>.pdf`), never a URL — read through /api/pinouts/[id]/pdf. */
  pdfKey: string | null
  requiresSignIn: boolean
  isActive: boolean
}
