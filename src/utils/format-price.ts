// EGP with the ar-EG currency label but Western digits — technicians read
// numbers in Latin (docs/business-analysis.md, Non-Functional Requirements).
const withFraction = new Intl.NumberFormat("ar-EG", {
  style: "currency",
  currency: "EGP",
  numberingSystem: "latn",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const whole = new Intl.NumberFormat("ar-EG", {
  style: "currency",
  currency: "EGP",
  numberingSystem: "latn",
  maximumFractionDigits: 0,
})

/**
 * `1250` → "1,250 ج.م.", `99.5` → "99.50 ج.م.".
 * Accepts a string because Prisma `Decimal` reaches the client serialised.
 */
export function formatPrice(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount
  return Number.isInteger(value) ? whole.format(value) : withFraction.format(value)
}
