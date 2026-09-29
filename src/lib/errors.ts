/**
 * A business-rule failure with an Arabic message the user can act on —
 * thrown by services ("this slug is taken"), turned into
 * `{ ok: false, error, fieldErrors }` by the action. Anything that is *not* a
 * ServiceError is a bug or an outage: actions log it and show a generic
 * message instead of leaking internals.
 */
export class ServiceError extends Error {
  constructor(
    message: string,
    readonly fieldErrors?: Record<string, string>
  ) {
    super(message)
    this.name = "ServiceError"
  }
}
