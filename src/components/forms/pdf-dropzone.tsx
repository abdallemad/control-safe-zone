"use client"

import { ExternalLink, FileText, FileUp, Loader2, RefreshCw, Trash2 } from "lucide-react"
import { useId, useRef, useState } from "react"

import { Ltr } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type PdfDropzoneMessages = {
  prompt: string
  uploading: string
  replace: string
  remove: string
  open: string
  saved: string
  pendingSave: string
  invalidType: string
  tooLarge: string
}

/** "2.4 MB" — Latin, like every size the admin reads off a file manager. */
const formatSize = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`

/**
 * PDF picker that uploads immediately (click or drag-and-drop) and holds the
 * returned **private storage key** as its value — the sibling of
 * FileDropzone, which holds an image URL and previews it. A key has no public
 * URL, so there is no preview: a just-picked file shows its name and size,
 * and a saved one shows `openHref` (the access-checked PDF route) when the
 * caller passes it. Presentational: the caller passes `upload` and messages.
 *
 * The type/size checks here are a courtesy; the server re-checks both (by
 * the file's "%PDF-" bytes, not its name).
 */
export function PdfDropzone({
  value,
  onChange,
  upload,
  accept,
  maxBytes,
  messages,
  openHref,
  invalid = false,
  disabled = false,
  onUploadingChange,
  id,
  "aria-describedby": describedBy,
}: {
  value: string | null
  onChange: (key: string | null) => void
  upload: (file: File) => Promise<string>
  /** MIME types, e.g. ["application/pdf"]. */
  accept: readonly string[]
  maxBytes: number
  messages: PdfDropzoneMessages
  /** Where the *saved* file opens. Leave unset for a file not saved yet. */
  openHref?: string
  invalid?: boolean
  disabled?: boolean
  onUploadingChange?: (uploading: boolean) => void
  id?: string
  "aria-describedby"?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const errorId = useId()
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // The file picked in this session — its name and size are only known here.
  const [picked, setPicked] = useState<{ key: string; name: string; size: number } | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    if (!accept.includes(file.type)) return setError(messages.invalidType)
    if (file.size > maxBytes) return setError(messages.tooLarge)

    setUploading(true)
    onUploadingChange?.(true)
    try {
      const key = await upload(file)
      setPicked({ key, name: file.name, size: file.size })
      onChange(key)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setUploading(false)
      onUploadingChange?.(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const busy = disabled || uploading
  const describedByIds = [describedBy, error ? errorId : undefined].filter(Boolean).join(" ") || undefined
  const fresh = picked && picked.key === value ? picked : null

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept.join(",")}
        className="sr-only"
        disabled={busy}
        aria-describedby={describedByIds}
        aria-invalid={invalid || Boolean(error) || undefined}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value ? (
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-lg border bg-primary-soft text-primary-ink">
              {uploading ? <Loader2 className="size-5 animate-spin" /> : <FileText className="size-5" />}
            </span>
            <div className="flex min-w-0 flex-col">
              {fresh ? (
                <>
                  <Ltr className="truncate text-sm font-medium">{fresh.name}</Ltr>
                  <span className="text-xs text-muted-foreground">
                    <Ltr>{formatSize(fresh.size)}</Ltr> — {messages.pendingSave}
                  </span>
                </>
              ) : (
                <span className="text-sm font-medium">{messages.saved}</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {openHref && !fresh && (
              <Button
                variant="outline"
                size="sm"
                render={<a href={openHref} target="_blank" rel="noopener noreferrer" />}
                nativeButton={false}
              >
                <ExternalLink data-icon="inline-start" />
                {messages.open}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              <RefreshCw data-icon="inline-start" />
              {messages.replace}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={busy}
              onClick={() => {
                setError(null)
                onChange(null)
              }}
            >
              <Trash2 data-icon="inline-start" />
              {messages.remove}
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            if (!busy) handleFile(e.dataTransfer.files?.[0])
          }}
          aria-describedby={describedByIds}
          className={cn(
            "flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center text-sm text-muted-foreground transition-colors outline-none",
            "hover:border-primary/50 hover:bg-primary-soft focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:pointer-events-none disabled:opacity-60",
            dragging && "border-primary bg-primary-soft",
            (invalid || error) && "border-destructive/60"
          )}
        >
          {uploading ? <Loader2 className="size-6 animate-spin text-primary" /> : <FileUp className="size-6" />}
          <span className="font-medium text-foreground">{uploading ? messages.uploading : messages.prompt}</span>
        </button>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
