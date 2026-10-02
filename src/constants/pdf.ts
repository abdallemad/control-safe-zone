// Upload rules for pinout PDFs, shared by the browser (fast feedback in
// PdfDropzone) and the server (the real check, by magic bytes, in
// services/storage.service.ts).

export const PDF_MAX_BYTES = 10 * 1024 * 1024 // 10 MB — next.config's bodySizeLimit leaves room above this

export const PDF_ACCEPT = ["application/pdf"] as const
