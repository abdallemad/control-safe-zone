"use client"

import { ImageUp, Loader2, RefreshCw, Trash2 } from "lucide-react"
import Image from "next/image"
import { useId, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type FileDropzoneMessages = {
  prompt: string
  uploading: string
  replace: string
  remove: string
  invalidType: string
  tooLarge: string
}

/**
 * Image picker that uploads immediately (click or drag-and-drop) and holds
 * the resulting URL as its value — so it drops into a react-hook-form
 * Controller like any input. Presentational: the caller passes `upload`
 * (a mutation) and the Arabic messages.
 *
 * The type/size checks here are a courtesy for fast feedback; the server
 * re-checks both (by the file's bytes, not its name).
 */
export function FileDropzone({
  value,
  onChange,
  upload,
  accept,
  maxBytes,
  messages,
  alt,
  invalid = false,
  disabled = false,
  onUploadingChange,
  id,
  "aria-describedby": describedBy,
}: {
  value: string | null
  onChange: (url: string | null) => void
  upload: (file: File) => Promise<string>
  /** MIME types, e.g. ["image/png", "image/jpeg", "image/webp"]. */
  accept: readonly string[]
  maxBytes: number
  messages: FileDropzoneMessages
  alt: string
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

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    if (!accept.includes(file.type)) return setError(messages.invalidType)
    if (file.size > maxBytes) return setError(messages.tooLarge)

    setUploading(true)
    onUploadingChange?.(true)
    try {
      onChange(await upload(file))
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
        <div className="flex items-center gap-4 rounded-xl border bg-card p-3">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border bg-white">
            <Image src={value} alt={alt} fill sizes="80px" className="object-contain p-1.5" />
            {uploading && (
              <div className="absolute inset-0 grid place-items-center bg-background/70">
                <Loader2 className="size-5 animate-spin text-primary" />
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
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
          {uploading ? (
            <Loader2 className="size-6 animate-spin text-primary" />
          ) : (
            <ImageUp className="size-6" />
          )}
          <span className="font-medium text-foreground">
            {uploading ? messages.uploading : messages.prompt}
          </span>
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
