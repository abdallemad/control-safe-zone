"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2, TriangleAlert } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"

import { FileDropzone } from "@/components/forms/file-dropzone"
import { Ltr } from "@/components/shared"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { IMAGE_ACCEPT, IMAGE_MAX_BYTES } from "@/constants/images"
import { ActionError } from "@/lib/action-result"
import { ar } from "@/messages/ar"
import { brandSchema, type BrandInput } from "@/schemas/brand.schema"
import { slugify } from "@/utils/slugify"

const t = ar.brands.form

/**
 * Create / edit a brand. Presentational (docs/folder-structure.md "forms/"):
 * the caller owns the mutation and passes `onSubmit`; a thrown ActionError's
 * fieldErrors land on the matching fields, its message above the buttons.
 * Validation is `brandSchema` — the same schema the Server Action runs.
 */
export function BrandForm({
  defaultValues,
  onSubmit,
  uploadLogo,
  submitLabel,
  cancelHref,
  autoSlug,
}: {
  defaultValues: BrandInput
  onSubmit: (values: BrandInput) => Promise<void>
  uploadLogo: (file: File) => Promise<string>
  submitLabel: string
  cancelHref: string
  /** Fill the slug from the name until it's edited by hand (create mode). */
  autoSlug: boolean
}) {
  const form = useForm<BrandInput>({
    resolver: standardSchemaResolver(brandSchema),
    defaultValues,
  })
  const { errors, isSubmitting, isSubmitted } = form.formState
  // useWatch, not form.watch: safe under the React Compiler.
  const name = useWatch({ control: form.control, name: "name" })
  const slug = useWatch({ control: form.control, name: "slug" })
  const [uploading, setUploading] = useState(false)

  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (error) {
      if (error instanceof ActionError) {
        for (const [field, message] of Object.entries(error.fieldErrors ?? {})) {
          if (field in values) form.setError(field as keyof BrandInput, { message })
        }
        form.setError("root", { message: error.message })
      } else {
        form.setError("root", { message: ar.errors.unexpected })
      }
    }
  })

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card>
          <CardHeader>
            <CardTitle>{t.detailsTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={Boolean(errors.name) || undefined}>
                <FieldLabel htmlFor="brand-name">{t.name}</FieldLabel>
                <Input
                  id="brand-name"
                  dir="ltr"
                  className="text-end"
                  autoComplete="off"
                  aria-invalid={Boolean(errors.name) || undefined}
                  aria-describedby="brand-name-hint"
                  {...form.register("name", {
                    // Auto-fill the slug until the admin types in it. setValue
                    // without shouldDirty keeps the slug "pristine", so only a
                    // hand edit makes it dirty and stops the auto-fill.
                    onChange: (e) => {
                      if (!autoSlug || form.getFieldState("slug").isDirty) return
                      form.setValue("slug", slugify(e.target.value), { shouldValidate: isSubmitted })
                    },
                  })}
                />
                <FieldDescription id="brand-name-hint">{t.nameHint}</FieldDescription>
                <FieldError errors={[errors.name]} />
              </Field>

              <Field data-invalid={Boolean(errors.nameAr) || undefined}>
                <FieldLabel htmlFor="brand-name-ar">{t.nameAr}</FieldLabel>
                <Input
                  id="brand-name-ar"
                  autoComplete="off"
                  aria-invalid={Boolean(errors.nameAr) || undefined}
                  aria-describedby="brand-name-ar-hint"
                  {...form.register("nameAr")}
                />
                <FieldDescription id="brand-name-ar-hint">{t.nameArHint}</FieldDescription>
                <FieldError errors={[errors.nameAr]} />
              </Field>

              <Field data-invalid={Boolean(errors.slug) || undefined}>
                <FieldLabel htmlFor="brand-slug">{t.slug}</FieldLabel>
                <Input
                  id="brand-slug"
                  dir="ltr"
                  className="text-end font-mono"
                  autoComplete="off"
                  aria-invalid={Boolean(errors.slug) || undefined}
                  aria-describedby="brand-slug-hint"
                  {...form.register("slug")}
                />
                <FieldDescription id="brand-slug-hint">
                  {t.slugHint} <Ltr mono className="text-foreground">/brands/{slug || "…"}</Ltr>
                </FieldDescription>
                <FieldError errors={[errors.slug]} />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.logo}</CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                control={form.control}
                name="logoUrl"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid || undefined}>
                    <FileDropzone
                      id="brand-logo"
                      value={field.value}
                      onChange={field.onChange}
                      upload={uploadLogo}
                      accept={IMAGE_ACCEPT}
                      maxBytes={IMAGE_MAX_BYTES}
                      messages={ar.brands.dropzone}
                      alt={name || t.logo}
                      invalid={fieldState.invalid}
                      disabled={isSubmitting}
                      onUploadingChange={setUploading}
                      aria-describedby="brand-logo-hint"
                    />
                    <FieldDescription id="brand-logo-hint">{t.logoHint}</FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Controller
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldLabel htmlFor="brand-active">{t.isActive}</FieldLabel>
                      <FieldDescription>{t.isActiveHint}</FieldDescription>
                    </FieldContent>
                    <Switch
                      id="brand-active"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </Field>
                )}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {errors.root?.message && (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={isSubmitting || uploading}>
          {isSubmitting && <Loader2 data-icon="inline-start" className="animate-spin" />}
          {submitLabel}
        </Button>
        <Button
          variant="ghost"
          size="lg"
          render={<Link href={cancelHref} />}
          nativeButton={false}
        >
          {t.cancel}
        </Button>
      </div>
    </form>
  )
}
