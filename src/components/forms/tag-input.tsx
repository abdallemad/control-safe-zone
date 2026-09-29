"use client"

import { X } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"

/**
 * A list of short Latin values (IC markings…) edited as chips: type, then
 * Enter or a comma adds one; Backspace on an empty input removes the last.
 * Pasting "TC1797, 5P08C3" adds both. Holds a `string[]`, so it drops into a
 * react-hook-form Controller. `normalize` decides what counts as a duplicate.
 */
export function TagInput({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  removeLabel,
  normalize = (v) => v,
  maxLength,
  invalid = false,
  disabled = false,
  "aria-describedby": describedBy,
}: {
  id?: string
  value: string[]
  onChange: (value: string[]) => void
  onBlur?: () => void
  placeholder?: string
  removeLabel: (tag: string) => string
  normalize?: (value: string) => string
  maxLength?: number
  invalid?: boolean
  disabled?: boolean
  "aria-describedby"?: string
}) {
  const [draft, setDraft] = useState("")

  function add(raw: string) {
    const next = [...value]
    const seen = new Set(next.map(normalize))
    for (const part of raw.split(/[,،\n]/)) {
      const tag = part.trim()
      if (!tag || seen.has(normalize(tag))) continue
      seen.add(normalize(tag))
      next.push(tag)
    }
    if (next.length !== value.length) onChange(next)
    setDraft("")
  }

  return (
    <div
      className={cn(
        "flex min-h-8 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-1.5 py-1 transition-colors",
        "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30",
        invalid && "border-destructive ring-3 ring-destructive/20",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md bg-muted py-0.5 ps-2 pe-1 text-sm"
        >
          <bdi dir="ltr" className="font-mono tracking-tight">
            {tag}
          </bdi>
          <button
            type="button"
            className="grid size-4 place-items-center rounded-sm text-muted-foreground hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label={removeLabel(tag)}
            onClick={() => onChange(value.filter((t) => t !== tag))}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        dir="ltr"
        value={draft}
        maxLength={maxLength}
        disabled={disabled}
        placeholder={value.length ? undefined : placeholder}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        autoComplete="off"
        className="h-6 min-w-24 flex-1 bg-transparent px-1 text-end font-mono text-sm outline-none placeholder:text-muted-foreground"
        onChange={(e) => {
          // A pasted or typed separator commits what came before it.
          if (/[,،\n]/.test(e.target.value)) add(e.target.value)
          else setDraft(e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            add(draft)
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1))
          }
        }}
        onBlur={() => {
          if (draft.trim()) add(draft)
          onBlur?.()
        }}
      />
    </div>
  )
}
