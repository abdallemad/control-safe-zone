// Upload rules shared by the browser (fast feedback in FileDropzone) and the
// server (the real check, by magic bytes, in services/storage.service.ts).

export const IMAGE_MAX_BYTES = 2 * 1024 * 1024 // 2 MB — next.config's bodySizeLimit leaves room above this

/** No SVG: it can carry script, and images are served from our own origin. */
export const IMAGE_ACCEPT = ["image/png", "image/jpeg", "image/webp"] as const
