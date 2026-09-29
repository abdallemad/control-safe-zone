"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2, TriangleAlert } from "lucide-react"
import Link from "next/link"
import { Controller, useForm, useWatch } from "react-hook-form"

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
import { Textarea } from "@/components/ui/textarea"
import { ActionError } from "@/lib/action-result"
import { ar } from "@/messages/ar"
import { platformSchema, type PlatformInput } from "@/schemas/platform.schema"
import { slugify } from "@/utils/slugify"

const t = ar.platforms.form

/**
 * Create / edit a controller platform. Presentational, like BrandForm (the
 * reference): the caller owns the mutation; a thrown ActionError's
 * fieldErrors land on their fields. Validation is `platformSchema` — the
 * same schema the Server Action runs.
 */
export function PlatformForm({
  defaultValues,
  onSubmit,
  submitLabel,
  cancelHref,
  autoSlug,
  manufacturerSuggestions = [],
}: {
  defaultValues: PlatformInput
  onSubmit: (values: PlatformInput) => Promise<void>
  submitLabel: string
  cancelHref: string
  /** Fill the slug from manufacturer + name until it's edited by hand (create mode). */
  autoSlug: boolean
  /** Existing manufacturers, offered as the admin types — keeps "Bosch" spelled one way. */
  manufacturerSuggestions?: string[]
}) {
  const form = useForm<PlatformInput>({
    resolver: standardSchemaResolver(platformSchema),
    defaultValues,
  })
  const { errors, isSubmitting, isSubmitted } = form.formState
  const slug = useWatch({ control: form.control, name: "slug" })

  // "Bosch" + "EDC17C46" → "bosch-edc17c46", until the slug is typed in.
  // setValue without shouldDirty keeps the slug pristine, so only a hand edit
  // makes it dirty and stops the auto-fill.
  function refreshSlug() {
    if (!autoSlug || form.getFieldState("slug").isDirty) return
    const { manufacturer, name } = form.getValues()
    form.setValue("slug", slugify(`${manufacturer} ${name}`), { shouldValidate: isSubmitted })
  }

  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (error) {
      if (error instanceof ActionError) {
        for (const [field, message] of Object.entries(error.fieldErrors ?? {})) {
          if (field in values) form.setError(field as keyof PlatformInput, { message })
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
              <div className="grid gap-6 sm:grid-cols-2">
                <Field data-invalid={Boolean(errors.manufacturer) || undefined}>
                  <FieldLabel htmlFor="platform-manufacturer">{t.manufacturer}</FieldLabel>
                  <Input
                    id="platform-manufacturer"
                    dir="ltr"
                    className="text-end"
                    autoComplete="off"
                    list="platform-manufacturers"
                    aria-invalid={Boolean(errors.manufacturer) || undefined}
                    aria-describedby="platform-manufacturer-hint"
                    {...form.register("manufacturer", { onChange: refreshSlug })}
                  />
                  <datalist id="platform-manufacturers">
                    {manufacturerSuggestions.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                  <FieldDescription id="platform-manufacturer-hint">{t.manufacturerHint}</FieldDescription>
                  <FieldError errors={[errors.manufacturer]} />
                </Field>

                <Field data-invalid={Boolean(errors.name) || undefined}>
                  <FieldLabel htmlFor="platform-name">{t.name}</FieldLabel>
                  <Input
                    id="platform-name"
                    dir="ltr"
                    className="text-end font-mono"
                    autoComplete="off"
                    aria-invalid={Boolean(errors.name) || undefined}
                    aria-describedby="platform-name-hint"
                    {...form.register("name", { onChange: refreshSlug })}
                  />
                  <FieldDescription id="platform-name-hint">{t.nameHint}</FieldDescription>
                  <FieldError errors={[errors.name]} />
                </Field>
              </div>

              <Field data-invalid={Boolean(errors.slug) || undefined}>
                <FieldLabel htmlFor="platform-slug">{t.slugLabel}</FieldLabel>
                <Input
                  id="platform-slug"
                  dir="ltr"
                  className="text-end font-mono"
                  autoComplete="off"
                  aria-invalid={Boolean(errors.slug) || undefined}
                  aria-describedby="platform-slug-hint"
                  {...form.register("slug")}
                />
                <FieldDescription id="platform-slug-hint">
                  {t.slugHint} <Ltr mono className="text-foreground">/platforms/{slug || "…"}</Ltr>
                </FieldDescription>
                <FieldError errors={[errors.slug]} />
              </Field>

              <Field data-invalid={Boolean(errors.description) || undefined}>
                <FieldLabel htmlFor="platform-description">{t.description}</FieldLabel>
                <Textarea
                  id="platform-description"
                  rows={4}
                  aria-invalid={Boolean(errors.description) || undefined}
                  aria-describedby="platform-description-hint"
                  {...form.register("description")}
                />
                <FieldDescription id="platform-description-hint">{t.descriptionHint}</FieldDescription>
                <FieldError errors={[errors.description]} />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardContent>
              <Controller
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldLabel htmlFor="platform-active">{t.isActive}</FieldLabel>
                      <FieldDescription>{t.isActiveHint}</FieldDescription>
                    </FieldContent>
                    <Switch
                      id="platform-active"
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
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 data-icon="inline-start" className="animate-spin" />}
          {submitLabel}
        </Button>
        <Button variant="ghost" size="lg" render={<Link href={cancelHref} />} nativeButton={false}>
          {t.cancel}
        </Button>
      </div>
    </form>
  )
}
