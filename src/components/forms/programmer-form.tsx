"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2, Plus, Trash2, TriangleAlert } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"

import {
  NoPlatformRows,
  PlatformSelect,
  ProductImageCard,
  ProductPricingCard,
  ProductVisibilityCard,
  type PlatformOption,
} from "@/components/forms/product-listing-fields"
import { Ltr } from "@/components/shared"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PROGRAMMER_MODE_META, PROGRAMMER_MODES } from "@/constants/product-types"
import { ActionError } from "@/lib/action-result"
import { ar } from "@/messages/ar"
import { programmerSchema, type ProgrammerInput } from "@/schemas/programmer.schema"
import { slugify } from "@/utils/slugify"

const t = ar.programmers.form
const shared = ar.products.form

/**
 * Create / edit a programmer. Presentational, like IcForm: the caller owns
 * the mutations and passes `onSubmit` / `uploadImage`; a thrown ActionError's
 * fieldErrors land on their fields, its message above the buttons. Validation
 * is `programmerSchema` — the same schema the Server Action runs. The side
 * column is shared with every sold type: product-listing-fields.tsx.
 */
export function ProgrammerForm({
  defaultValues,
  onSubmit,
  uploadImage,
  submitLabel,
  cancelHref,
  autoSlug,
  platformOptions,
  manufacturerSuggestions = [],
}: {
  defaultValues: ProgrammerInput
  onSubmit: (values: ProgrammerInput) => Promise<void>
  uploadImage: (file: File) => Promise<string>
  submitLabel: string
  cancelHref: string
  /** Fill the slug from manufacturer + tool + edition until it's edited by hand (create mode). */
  autoSlug: boolean
  /** Controller platforms the tool can support. */
  platformOptions: PlatformOption[]
  /** Existing tool makers, offered as the admin types — keeps "Alientech" spelled one way. */
  manufacturerSuggestions?: string[]
}) {
  const form = useForm<ProgrammerInput>({
    resolver: standardSchemaResolver(programmerSchema),
    defaultValues,
  })
  const { errors, isSubmitting, isSubmitted } = form.formState
  // useWatch, not form.watch: safe under the React Compiler.
  const slug = useWatch({ control: form.control, name: "slug" })
  const name = useWatch({ control: form.control, name: "name" })
  const platforms = useFieldArray({ control: form.control, name: "platforms" })
  const [uploading, setUploading] = useState(false)

  // "Alientech" + "KESS V3" + "Master" → "alientech-kess-v3-master", until the
  // slug is typed in. setValue without shouldDirty keeps the slug pristine, so
  // only a hand edit makes it dirty and stops the auto-fill.
  function refreshSlug() {
    if (!autoSlug || form.getFieldState("slug").isDirty) return
    const { manufacturer, toolName, edition } = form.getValues()
    form.setValue("slug", slugify(`${manufacturer} ${toolName} ${edition}`), { shouldValidate: isSubmitted })
  }

  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (error) {
      if (error instanceof ActionError) {
        for (const [field, message] of Object.entries(error.fieldErrors ?? {})) {
          if (field in values) form.setError(field as keyof ProgrammerInput, { message })
        }
        form.setError("root", { message: error.message })
      } else {
        form.setError("root", { message: ar.errors.unexpected })
      }
    }
  })

  const platformsError = errors.platforms?.message ?? errors.platforms?.root?.message

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* ── The tool ── */}
          <Card>
            <CardHeader>
              <CardTitle>{t.toolTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field data-invalid={Boolean(errors.toolName) || undefined}>
                    <FieldLabel htmlFor="programmer-tool-name">{t.toolName}</FieldLabel>
                    <Input
                      id="programmer-tool-name"
                      dir="ltr"
                      className="text-end font-mono"
                      autoComplete="off"
                      aria-invalid={Boolean(errors.toolName) || undefined}
                      aria-describedby="programmer-tool-name-hint"
                      {...form.register("toolName", { onChange: refreshSlug })}
                    />
                    <FieldDescription id="programmer-tool-name-hint">{t.toolNameHint}</FieldDescription>
                    <FieldError errors={[errors.toolName]} />
                  </Field>

                  <Field data-invalid={Boolean(errors.manufacturer) || undefined}>
                    <FieldLabel htmlFor="programmer-manufacturer">{t.manufacturer}</FieldLabel>
                    <Input
                      id="programmer-manufacturer"
                      dir="ltr"
                      className="text-end"
                      autoComplete="off"
                      list="programmer-manufacturers"
                      aria-invalid={Boolean(errors.manufacturer) || undefined}
                      aria-describedby="programmer-manufacturer-hint"
                      {...form.register("manufacturer", { onChange: refreshSlug })}
                    />
                    <datalist id="programmer-manufacturers">
                      {manufacturerSuggestions.map((m) => (
                        <option key={m} value={m} />
                      ))}
                    </datalist>
                    <FieldDescription id="programmer-manufacturer-hint">{t.manufacturerHint}</FieldDescription>
                    <FieldError errors={[errors.manufacturer]} />
                  </Field>
                </div>

                <Field data-invalid={Boolean(errors.edition) || undefined}>
                  <FieldLabel htmlFor="programmer-edition">{t.edition}</FieldLabel>
                  <Input
                    id="programmer-edition"
                    dir="ltr"
                    className="text-end sm:w-64"
                    autoComplete="off"
                    aria-invalid={Boolean(errors.edition) || undefined}
                    aria-describedby="programmer-edition-hint"
                    {...form.register("edition", { onChange: refreshSlug })}
                  />
                  <FieldDescription id="programmer-edition-hint">{t.editionHint}</FieldDescription>
                  <FieldError errors={[errors.edition]} />
                </Field>

                <Field data-invalid={Boolean(errors.boxContents) || undefined}>
                  <FieldLabel htmlFor="programmer-box">{t.boxContents}</FieldLabel>
                  <Textarea
                    id="programmer-box"
                    rows={3}
                    aria-invalid={Boolean(errors.boxContents) || undefined}
                    aria-describedby="programmer-box-hint"
                    {...form.register("boxContents")}
                  />
                  <FieldDescription id="programmer-box-hint">{t.boxContentsHint}</FieldDescription>
                  <FieldError errors={[errors.boxContents]} />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* ── The listing ── */}
          <Card>
            <CardHeader>
              <CardTitle>{t.listingTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field data-invalid={Boolean(errors.name) || undefined}>
                  <FieldLabel htmlFor="programmer-name">{t.name}</FieldLabel>
                  <Input
                    id="programmer-name"
                    autoComplete="off"
                    aria-invalid={Boolean(errors.name) || undefined}
                    aria-describedby="programmer-name-hint"
                    {...form.register("name")}
                  />
                  <FieldDescription id="programmer-name-hint">{t.nameHint}</FieldDescription>
                  <FieldError errors={[errors.name]} />
                </Field>

                <Field data-invalid={Boolean(errors.slug) || undefined}>
                  <FieldLabel htmlFor="programmer-slug">{t.slugLabel}</FieldLabel>
                  <Input
                    id="programmer-slug"
                    dir="ltr"
                    className="text-end font-mono"
                    autoComplete="off"
                    aria-invalid={Boolean(errors.slug) || undefined}
                    aria-describedby="programmer-slug-hint"
                    {...form.register("slug")}
                  />
                  <FieldDescription id="programmer-slug-hint">
                    {t.slugHint} <Ltr mono className="text-foreground">/programmers/{slug || "…"}</Ltr>
                  </FieldDescription>
                  <FieldError errors={[errors.slug]} />
                </Field>

                <Field data-invalid={Boolean(errors.description) || undefined}>
                  <FieldLabel htmlFor="programmer-description">{t.description}</FieldLabel>
                  <Textarea
                    id="programmer-description"
                    rows={4}
                    aria-invalid={Boolean(errors.description) || undefined}
                    aria-describedby="programmer-description-hint"
                    {...form.register("description")}
                  />
                  <FieldDescription id="programmer-description-hint">{t.descriptionHint}</FieldDescription>
                  <FieldError errors={[errors.description]} />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* ── Supported platforms, and how ── */}
          <Card>
            <CardHeader>
              <CardTitle>{t.supportsTitle}</CardTitle>
              <CardDescription>{t.supportsDescription}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {platforms.fields.length === 0 && (
                <NoPlatformRows hasOptions={platformOptions.length > 0} emptyText={t.noSupports} />
              )}

              {platforms.fields.map((row, index) => {
                const rowErrors = errors.platforms?.[index]
                // The "at least one mode" rule reports on `obd` (programmer.schema.ts).
                const modeError = rowErrors?.obd
                return (
                  <div key={row.id} className="flex flex-col gap-3 rounded-lg border p-3">
                    <div className="grid items-start gap-3 sm:grid-cols-[1fr_1fr_auto]">
                      <Controller
                        control={form.control}
                        name={`platforms.${index}.platformId`}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid || undefined}>
                            <FieldLabel htmlFor={`programmer-platform-${index}`}>{shared.platform}</FieldLabel>
                            <PlatformSelect
                              id={`programmer-platform-${index}`}
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              options={platformOptions}
                              invalid={fieldState.invalid}
                              disabled={isSubmitting}
                            />
                            <FieldError errors={[fieldState.error]} />
                          </Field>
                        )}
                      />

                      <Field data-invalid={Boolean(rowErrors?.notes) || undefined}>
                        <FieldLabel htmlFor={`programmer-notes-${index}`}>{t.notes}</FieldLabel>
                        <Input
                          id={`programmer-notes-${index}`}
                          autoComplete="off"
                          placeholder={t.notesPlaceholder}
                          aria-invalid={Boolean(rowErrors?.notes) || undefined}
                          {...form.register(`platforms.${index}.notes`)}
                        />
                        <FieldError errors={[rowErrors?.notes]} />
                      </Field>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="self-end max-sm:justify-self-end"
                        aria-label={shared.removePlatform}
                        disabled={isSubmitting}
                        onClick={() => platforms.remove(index)}
                      >
                        <Trash2 />
                      </Button>
                    </div>

                    <FieldSet data-invalid={Boolean(modeError) || undefined} className="gap-2">
                      <FieldLegend variant="label" className="mb-0">
                        {t.modes}
                      </FieldLegend>
                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {PROGRAMMER_MODES.map((mode) => (
                          <Controller
                            key={mode}
                            control={form.control}
                            name={`platforms.${index}.${mode}`}
                            render={({ field }) => (
                              <Label className="font-normal">
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={(checked) => {
                                    field.onChange(checked)
                                    // Re-check the row's "at least one mode" rule once it has failed.
                                    if (isSubmitted) void form.trigger(`platforms.${index}.obd`)
                                  }}
                                  onBlur={field.onBlur}
                                  disabled={isSubmitting}
                                  aria-invalid={Boolean(modeError) || undefined}
                                />
                                <Ltr>{PROGRAMMER_MODE_META[mode].label}</Ltr>
                              </Label>
                            )}
                          />
                        ))}
                      </div>
                      <FieldError errors={[modeError]} />
                    </FieldSet>
                  </div>
                )
              })}

              {platformsError && (
                <p role="alert" className="text-sm text-destructive">
                  {platformsError}
                </p>
              )}

              {platformOptions.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  className="self-start"
                  disabled={isSubmitting || platforms.fields.length >= Math.min(50, platformOptions.length)}
                  onClick={() =>
                    platforms.append({ platformId: "", obd: false, boot: false, bench: false, notes: "" })
                  }
                >
                  <Plus data-icon="inline-start" />
                  {shared.addPlatform}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <ProductImageCard
            form={form}
            idPrefix="programmer"
            uploadImage={uploadImage}
            hint={t.imageHint}
            alt={name}
            onUploadingChange={setUploading}
          />
          <ProductPricingCard form={form} idPrefix="programmer" />
          <ProductVisibilityCard
            form={form}
            idPrefix="programmer"
            isActiveLabel={t.isActive}
            isActiveHint={t.isActiveHint}
          />
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
        <Button variant="ghost" size="lg" render={<Link href={cancelHref} />} nativeButton={false}>
          {t.cancel}
        </Button>
      </div>
    </form>
  )
}
