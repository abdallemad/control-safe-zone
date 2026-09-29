/** What links to a platform — each blocks its deletion. */
export type PlatformLinkCounts = {
  controllers: number
  ics: number
  programmers: number
  pinouts: number
}

/** A row of the admin platforms table. */
export type PlatformListItem = {
  id: string
  name: string
  slug: string
  manufacturer: string
  isActive: boolean
  links: PlatformLinkCounts
  updatedAt: Date
}

/** What the edit page loads — exactly the form's fields plus the id. */
export type PlatformDetail = {
  id: string
  name: string
  slug: string
  manufacturer: string
  description: string | null
  isActive: boolean
}
