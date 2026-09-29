import type { ActionResult } from "@/types/action-result"

/**
 * An `{ ok: false }` ActionResult, re-thrown on the client so React Query
 * treats it as an error. Forms read `fieldErrors` to highlight fields.
 */
export class ActionError extends Error {
  constructor(
    message: string,
    readonly fieldErrors?: Record<string, string>
  ) {
    super(message)
    this.name = "ActionError"
  }
}

/** For hooks: the data of a successful action, or throw an ActionError. */
export function unwrap<T>(result: ActionResult<T>): T {
  if (!result.ok) throw new ActionError(result.error, result.fieldErrors)
  return result.data
}
