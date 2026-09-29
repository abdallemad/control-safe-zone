/** A row of the admin brands table. */
export type BrandListItem = {
  id: string
  name: string
  nameAr: string | null
  slug: string
  logoUrl: string | null
  isActive: boolean
  /** Vehicle models under the brand — a brand with models can't be deleted. */
  modelsCount: number
  createdAt: Date
}

/** What the edit page loads — exactly the form's fields plus the id. */
export type BrandDetail = {
  id: string
  name: string
  nameAr: string | null
  slug: string
  logoUrl: string | null
  isActive: boolean
}
