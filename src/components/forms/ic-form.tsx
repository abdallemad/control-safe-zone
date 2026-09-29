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
  toOptionalNumber,
  type PlatformOption,
} from "@/components/forms/product-listing-fields"
import { TagInput } from "@/components/forms/tag-input"
import { Ltr } from "@/components/shared"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { IC_CATEGORIES, IC_CATEGORY_META } from "@/constants/product-types"
import { ActionError } from "@/lib/action-result"
import { ar } from "@/messages/ar"
import { icSchema, type IcInput } from "@/schemas/ic.schema"
import { normalizeIdentifier } from "@/utils/normalize-identifier"
import { slugify } from "@/utils/slugify"

const t = ar.ics.form
const shared = ar.products.form

const CATEGORY_ITEMS = IC_CATEGORIES.map((value) => ({ value, label: IC_CATEGORY_META[value].label }))

/**
 * Create / edit an IC. Presentational, like BrandForm (the reference): the
 * caller owns the mutations and passes `onSubmit` / `uploadImage`; a thrown
 * ActionError's fieldErrors land on their fields, its message above the
 * buttons. Validation is `icSchema` — the same schema the Server Action runs.
 * The side column (cover, price & stock, visibility) is shared with every
 * sold type: product-listing-fields.tsx.
 */
export function IcForm({
  defaultValues,
  onSubmit,
  uploadImage,
  submitLabel,
  cancelHref,
  autoSlug,
  platformOptions,
  manufacturerSuggestions = [],
}: {
  defaultValues: IcInput
  onSubmit: (values: IcInput) => Promise<void>
  uploadImage: (file: File) => Promise<string>
  submitLabel: string
  cancelHref: string
  /** Fill the slug from manufacturer + part number until it's edited by hand (create mode). */
  autoSlug: boolean
  /** Controller platforms to link the chip to. */
  platformOptions: PlatformOption[]
  /** Existing chip makers, offered as the admin types — keeps "Infineon" spelled one way. */
  manufacturerSuggestions?: string[]
}) {
  const form = useForm<IcInput>({
    resolver: standardSchemaResolver(icSchema),
    defaultValues,
  })
  const { errors, isSubmitting, isSubmitted } = form.formState
  // useWatch, not form.watch: safe under the React Compiler.
  const slug = useWatch({ control: form.control, name: "slug" })
  const name = useWatch({ control: form.control, name: "name" })
  const platforms = useFieldArray({ control: form.control, name: "platforms" })
  const [uploading, setUploading] = useState(false)

  // "Infineon" + "SAK-TC1797" → "infineon-sak-tc1797", until the slug is typed in.
  // setValue without shouldDirty keeps the slug pristine, so only a hand edit
  // makes it dirty and stops the auto-fill.
  function refreshSlug() {
    if (!autoSlug || form.getFieldState("slug").isDirty) return
    const { manufacturer, partNumber } = form.getValues()
    form.setValue("slug", slugify(`${manufacturer} ${partNumber}`), { shouldValidate: isSubmitted })
  }

  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (error) {
      if (error instanceof ActionError) {
        for (const [field, message] of Object.entries(error.fieldErrors ?? {})) {
          if (field in values) form.setError(field as keyof IcInput, { message })
        }
        form.setError("root", { message: error.message })
      } else {
        form.setError("root", { message: ar.errors.unexpected })
      }
    }
  })

  const platformsError = errors.platforms?.message ?? errors.platforms?.root?.message
  const markingsError = errors.markings?.message ?? errors.markings?.find?.((e) => e)?.message

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* ── The chip ── */}
          <Card>
            <CardHeader>
              <CardTitle>{t.chipTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field data-invalid={Boolean(errors.partNumber) || undefined}>
                    <FieldLabel htmlFor="ic-part-number">{t.partNumber}</FieldLabel>
                    <Input
                      id="ic-part-number"
                      dir="ltr"
                      className="text-end font-mono"
                      autoComplete="off"
                      aria-invalid={Boolean(errors.partNumber) || undefined}
                      aria-describedby="ic-part-number-hint"
                      {...form.register("partNumber", { onChange: refreshSlug })}
                    />
                    <FieldDescription id="ic-part-number-hint">{t.partNumberHint}</FieldDescription>
                    <FieldError errors={[errors.partNumber]} />
                  </Field>

                  <Field data-invalid={Boolean(errors.manufacturer) || undefined}>
                    <FieldLabel htmlFor="ic-manufacturer">{t.manufacturer}</FieldLabel>
                    <Input
                      id="ic-manufacturer"
                      dir="ltr"
                      className="text-end"
                      autoComplete="off"
                      list="ic-manufacturers"
                      aria-invalid={Boolean(errors.manufacturer) || undefined}
                      aria-describedby="ic-manufacturer-hint"
                      {...form.register("manufacturer", { onChange: refreshSlug })}
                    />
                    <datalist id="ic-manufacturers">
                      {manufacturerSuggestions.map((m) => (
                        <option key={m} value={m} />
                      ))}
                    </datalist>
                    <FieldDescription id="ic-manufacturer-hint">{t.manufacturerHint}</FieldDescription>
                    <FieldError errors={[errors.manufacturer]} />
                  </Field>
                </div>

                <Controller
                  control={form.control}
                  name="category"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid || undefined}>
                      <FieldLabel htmlFor="ic-category">{t.category}</FieldLabel>
                      <Select
                        items={CATEGORY_ITEMS}
                        value={field.value || null}
                        onValueChange={(value) => field.onChange(value ?? "")}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger
                          id="ic-category"
                          className="w-full sm:w-64"
                          aria-invalid={fieldState.invalid || undefined}
                          onBlur={field.onBlur}
                        >
                          <SelectValue placeholder={t.categoryPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORY_ITEMS.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label} <Ltr className="text-xs text-muted-foreground">{c.value}</Ltr>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="markings"
                  render={({ field }) => (
                    <Field data-invalid={Boolean(markingsError) || undefined}>
                      <FieldLabel htmlFor="ic-markings">{t.markings}</FieldLabel>
                      <TagInput
                        id="ic-markings"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        placeholder={t.markingsPlaceholder}
                        removeLabel={t.removeMarking}
                        normalize={normalizeIdentifier}
                        maxLength={40}
                        invalid={Boolean(markingsError)}
                        disabled={isSubmitting}
                        aria-describedby="ic-markings-hint"
                      />
                      <FieldDescription id="ic-markings-hint">{t.markingsHint}</FieldDescription>
                      <FieldError>{markingsError}</FieldError>
                    </Field>
                  )}
                />

                <div className="grid gap-6 sm:grid-cols-2">
                  <Field data-invalid={Boolean(errors.package) || undefined}>
                    <FieldLabel htmlFor="ic-package">{t.package}</FieldLabel>
                    <Input
                      id="ic-package"
                      dir="ltr"
                      className="text-end font-mono"
                      autoComplete="off"
                      aria-invalid={Boolean(errors.package) || undefined}
                      aria-describedby="ic-package-hint"
                      {...form.register("package")}
                    />
                    <FieldDescription id="ic-package-hint">{t.packageHint}</FieldDescription>
                    <FieldError errors={[errors.package]} />
                  </Field>

                  <Field data-invalid={Boolean(errors.pinCount) || undefined}>
                    <FieldLabel htmlFor="ic-pin-count">{t.pinCount}</FieldLabel>
                    <Input
                      id="ic-pin-count"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      dir="ltr"
                      className="text-end tabular-nums"
                      aria-invalid={Boolean(errors.pinCount) || undefined}
                      aria-describedby="ic-pin-count-hint"
                      {...form.register("pinCount", { setValueAs: toOptionalNumber })}
                    />
                    <FieldDescription id="ic-pin-count-hint">{t.pinCountHint}</FieldDescription>
                    <FieldError errors={[errors.pinCount]} />
                  </Field>
                </div>

                <Field data-invalid={Boolean(errors.datasheetUrl) || undefined}>
                  <FieldLabel htmlFor="ic-datasheet">{t.datasheetUrl}</FieldLabel>
                  <Input
                    id="ic-datasheet"
                    type="url"
                    dir="ltr"
                    className="text-end"
                    autoComplete="off"
                    placeholder="https://"
                    aria-invalid={Boolean(errors.datasheetUrl) || undefined}
                    aria-describedby="ic-datasheet-hint"
                    {...form.register("datasheetUrl")}
                  />
                  <FieldDescription id="ic-datasheet-hint">{t.datasheetUrlHint}</FieldDescription>
                  <FieldError errors={[errors.datasheetUrl]} />
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
                  <FieldLabel htmlFor="ic-name">{t.name}</FieldLabel>
                  <Input
                    id="ic-name"
                    autoComplete="off"
                    aria-invalid={Boolean(errors.name) || undefined}
                    aria-describedby="ic-name-hint"
                    {...form.register("name")}
                  />
                  <FieldDescription id="ic-name-hint">{t.nameHint}</FieldDescription>
                  <FieldError errors={[errors.name]} />
                </Field>

                <Field data-invalid={Boolean(errors.slug) || undefined}>
                  <FieldLabel htmlFor="ic-slug">{t.slugLabel}</FieldLabel>
                  <Input
                    id="ic-slug"
                    dir="ltr"
                    className="text-end font-mono"
                    autoComplete="off"
                    aria-invalid={Boolean(errors.slug) || undefined}
                    aria-describedby="ic-slug-hint"
                    {...form.register("slug")}
                  />
                  <FieldDescription id="ic-slug-hint">
                    {t.slugHint} <Ltr mono className="text-foreground">/ics/{slug || "…"}</Ltr>
                  </FieldDescription>
                  <FieldError errors={[errors.slug]} />
                </Field>

                <Field data-invalid={Boolean(errors.description) || undefined}>
                  <FieldLabel htmlFor="ic-description">{t.description}</FieldLabel>
                  <Textarea
                    id="ic-description"
                    rows={4}
                    aria-invalid={Boolean(errors.description) || undefined}
                    aria-describedby="ic-description-hint"
                    {...form.register("description")}
                  />
                  <FieldDescription id="ic-description-hint">{t.descriptionHint}</FieldDescription>
                  <FieldError errors={[errors.description]} />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* ── Controller platforms ── */}
          <Card>
            <CardHeader>
              <CardTitle>{t.platformsTitle}</CardTitle>
              <CardDescription>{t.platformsDescription}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {platforms.fields.length === 0 && (
                <NoPlatformRows hasOptions={platformOptions.length > 0} emptyText={t.noPlatforms} />
              )}

              {platforms.fields.map((row, index) => {
                const rowErrors = errors.platforms?.[index]
                return (
                  <div
                    key={row.id}
                    className="grid items-start gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_auto]"
                  >
                    <Controller
                      control={form.control}
                      name={`platforms.${index}.platformId`}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid || undefined}>
                          <FieldLabel htmlFor={`ic-platform-${index}`}>{shared.platform}</FieldLabel>
                          <PlatformSelect
                            id={`ic-platform-${index}`}
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

                    <Field data-invalid={Boolean(rowErrors?.role) || undefined}>
                      <FieldLabel htmlFor={`ic-platform-role-${index}`}>{t.role}</FieldLabel>
                      <Input
                        id={`ic-platform-role-${index}`}
                        dir="ltr"
                        className="text-end"
                        autoComplete="off"
                        placeholder={t.rolePlaceholder}
                        aria-invalid={Boolean(rowErrors?.role) || undefined}
                        {...form.register(`platforms.${index}.role`)}
                      />
                      <FieldError errors={[rowErrors?.role]} />
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
                  onClick={() => platforms.append({ platformId: "", role: "" })}
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
            idPrefix="ic"
            uploadImage={uploadImage}
            hint={t.imageHint}
            alt={name}
            onUploadingChange={setUploading}
          />
          <ProductPricingCard form={form} idPrefix="ic" />
          <ProductVisibilityCard form={form} idPrefix="ic" isActiveLabel={t.isActive} isActiveHint={t.isActiveHint} />
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
