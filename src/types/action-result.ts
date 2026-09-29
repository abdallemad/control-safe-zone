/**
 * What every Server Action returns. Never throws across the wire: the error is
 * an Arabic sentence the UI can show as-is. `fieldErrors` points a failure at
 * specific form fields (e.g. a duplicate slug) so the form can highlight them.
 */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }
