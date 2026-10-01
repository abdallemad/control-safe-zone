"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2, TriangleAlert } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { CONDITION_META, CONTROLLER_CONDITIONS } from "@/constants/product-types"
import { ActionError } from "@/lib/action-result"
import { ar } from "@/messages/ar"
import { controllerSchema, type ControllerInput } from "@/schemas/controller.schema"
import { slugify } from "@/utils/slugify"

const t = ar.controllers.form
const shared = ar.products.form

const CONDITION_ITEMS = CONTROLLER_CONDITIONS.map((value) => ({ value, label: CONDITION_META[value].label }))

/** A platform picker option, plus its maker — prefills the controller's manufacturer. */
export type ControllerPlatformOption = PlatformOption & { manufacturer: string }

/**
 * Create / edit a controller unit. Presentational, like IcForm and
 * ProgrammerForm: the caller owns the mutations and passes `onSubmit` /
 * `uploadImage`; a thrown ActionError's fieldErrors land on their fields, its
 * message above the buttons. Validation is `controllerSchema` — the same
 * schema the Server Action runs. The side column is shared with every sold
 * type: product-listing-fields.tsx.
 */
export function ControllerForm({
  defaultValues,
  onSubmit,
  uploadImage,
  submitLabel,
  cancelHref,
  autoSlug,
  platformOptions,
  manufacturerSuggestions = [],
}: {
  defaultValues: ControllerInput
  onSubmit: (values: ControllerInput) => Promise<void>
  uploadImage: (file: File) => Promise<string>
  submitLabel: string
  cancelHref: string
  /** Fill the slug from platform + hardware + software number until it's edited by hand (create mode). */
  autoSlug: boolean
  /** Controller platforms the unit can belong to. */
  platformOptions: ControllerPlatformOption[]
  /** Existing ECU makers, offered as the admin types — keeps "Bosch" spelled one way. */
  manufacturerSuggestions?: string[]
}) {
  const form = useForm<ControllerInput>({
    resolver: standardSchemaResolver(controllerSchema),
    defaultValues,
  })
  const { errors, isSubmitting, isSubmitted } = form.formState
  // useWatch, not form.watch: safe under the React Compiler.
  const slug = useWatch({ control: form.control, name: "slug" })
  const name = useWatch({ control: form.control, name: "name" })
  const [uploading, setUploading] = useState(false)

  // "Bosch EDC17C46" + "0281 018 758" + "1037 541 778" →
  // "bosch-edc17c46-0281018758-1037541778", until the slug is typed in. Two
  // units with one hardware number and different software are different
  // listings, so the software number is part of it. setValue without
  // shouldDirty keeps the slug pristine, so only a hand edit stops the auto-fill.
  function refreshSlug() {
    if (!autoSlug || form.getFieldState("slug").isDirty) return
    const { platformId, manufacturer, hardwareNumber, softwareNumber } = form.getValues()
    const platform = platformOptions.find((p) => p.value === platformId)?.label ?? manufacturer
    form.setValue("slug", slugify(`${platform} ${hardwareNumber} ${softwareNumber}`), {
      shouldValidate: isSubmitted,
    })
  }

  // The unit's maker is its platform's maker; fill it in when still empty.
  function onPlatformPicked(platformId: string) {
    const platform = platformOptions.find((p) => p.value === platformId)
    if (platform && !form.getValues("manufacturer").trim()) {
      form.setValue("manufacturer", platform.manufacturer, { shouldValidate: isSubmitted })
    }
    refreshSlug()
  }

  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (error) {
      if (error instanceof ActionError) {
        for (const [field, message] of Object.entries(error.fieldErrors ?? {})) {
          if (field in values) form.setError(field as keyof ControllerInput, { message })
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
        <div className="flex min-w-0 flex-col gap-6">
          {/* ── The unit ── */}
          <Card>
            <CardHeader>
              <CardTitle>{t.unitTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Controller
                    control={form.control}
                    name="platformId"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid || undefined}>
                        <FieldLabel htmlFor="controller-platform">{shared.platform}</FieldLabel>
                        {platformOptions.length > 0 ? (
                          <PlatformSelect
                            id="controller-platform"
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value)
                              onPlatformPicked(value)
                            }}
                            onBlur={field.onBlur}
                            options={platformOptions}
                            invalid={fieldState.invalid}
                            disabled={isSubmitting}
                          />
                        ) : (
                          <NoPlatformRows hasOptions={false} emptyText="" />
                        )}
                        <FieldDescription>{t.platformHint}</FieldDescription>
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />

                  <Field data-invalid={Boolean(errors.manufacturer) || undefined}>
                    <FieldLabel htmlFor="controller-manufacturer">{t.manufacturer}</FieldLabel>
                    <Input
                      id="controller-manufacturer"
                      dir="ltr"
                      className="text-end"
                      autoComplete="off"
                      list="controller-manufacturers"
                      aria-invalid={Boolean(errors.manufacturer) || undefined}
                      aria-describedby="controller-manufacturer-hint"
                      {...form.register("manufacturer", { onChange: refreshSlug })}
                    />
                    <datalist id="controller-manufacturers">
                      {manufacturerSuggestions.map((m) => (
                        <option key={m} value={m} />
                      ))}
                    </datalist>
                    <FieldDescription id="controller-manufacturer-hint">{t.manufacturerHint}</FieldDescription>
                    <FieldError errors={[errors.manufacturer]} />
                  </Field>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <Field data-invalid={Boolean(errors.hardwareNumber) || undefined}>
                    <FieldLabel htmlFor="controller-hardware">{t.hardwareNumber}</FieldLabel>
                    <Input
                      id="controller-hardware"
                      dir="ltr"
                      className="text-end font-mono"
                      autoComplete="off"
                      aria-invalid={Boolean(errors.hardwareNumber) || undefined}
                      aria-describedby="controller-hardware-hint"
                      {...form.register("hardwareNumber", { onChange: refreshSlug })}
                    />
                    <FieldDescription id="controller-hardware-hint">{t.hardwareNumberHint}</FieldDescription>
                    <FieldError errors={[errors.hardwareNumber]} />
                  </Field>

                  <Field data-invalid={Boolean(errors.softwareNumber) || undefined}>
                    <FieldLabel htmlFor="controller-software">{t.softwareNumber}</FieldLabel>
                    <Input
                      id="controller-software"
                      dir="ltr"
                      className="text-end font-mono"
                      autoComplete="off"
                      aria-invalid={Boolean(errors.softwareNumber) || undefined}
                      aria-describedby="controller-software-hint"
                      {...form.register("softwareNumber", { onChange: refreshSlug })}
                    />
                    <FieldDescription id="controller-software-hint">{t.softwareNumberHint}</FieldDescription>
                    <FieldError errors={[errors.softwareNumber]} />
                  </Field>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <Field data-invalid={Boolean(errors.partNumber) || undefined}>
                    <FieldLabel htmlFor="controller-part">{t.partNumber}</FieldLabel>
                    <Input
                      id="controller-part"
                      dir="ltr"
                      className="text-end font-mono"
                      autoComplete="off"
                      aria-invalid={Boolean(errors.partNumber) || undefined}
                      aria-describedby="controller-part-hint"
                      {...form.register("partNumber")}
                    />
                    <FieldDescription id="controller-part-hint">{t.partNumberHint}</FieldDescription>
                    <FieldError errors={[errors.partNumber]} />
                  </Field>

                  <Field data-invalid={Boolean(errors.serialNumber) || undefined}>
                    <FieldLabel htmlFor="controller-serial">{t.serialNumber}</FieldLabel>
                    <Input
                      id="controller-serial"
                      dir="ltr"
                      className="text-end font-mono"
                      autoComplete="off"
                      aria-invalid={Boolean(errors.serialNumber) || undefined}
                      aria-describedby="controller-serial-hint"
                      {...form.register("serialNumber")}
                    />
                    <FieldDescription id="controller-serial-hint">{t.serialNumberHint}</FieldDescription>
                    <FieldError errors={[errors.serialNumber]} />
                  </Field>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <Controller
                    control={form.control}
                    name="condition"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid || undefined}>
                        <FieldLabel htmlFor="controller-condition">{t.condition}</FieldLabel>
                        <Select
                          items={CONDITION_ITEMS}
                          value={field.value || null}
                          onValueChange={(value) => field.onChange(value ?? "")}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger
                            id="controller-condition"
                            className="w-full"
                            aria-invalid={fieldState.invalid || undefined}
                            onBlur={field.onBlur}
                          >
                            <SelectValue placeholder={t.conditionPlaceholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {CONDITION_ITEMS.map((c) => (
                              <SelectItem key={c.value} value={c.value}>
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />

                  <Field data-invalid={Boolean(errors.litres) || undefined}>
                    <FieldLabel htmlFor="controller-litres">{t.litres}</FieldLabel>
                    <Input
                      id="controller-litres"
                      type="text"
                      inputMode="decimal"
                      dir="ltr"
                      className="text-end tabular-nums"
                      autoComplete="off"
                      aria-invalid={Boolean(errors.litres) || undefined}
                      aria-describedby="controller-litres-hint"
                      {...form.register("litres")}
                    />
                    <FieldDescription id="controller-litres-hint">{t.litresHint}</FieldDescription>
                    <FieldError errors={[errors.litres]} />
                  </Field>
                </div>

                <Controller
                  control={form.control}
                  name="isVirgin"
                  render={({ field }) => (
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldLabel htmlFor="controller-virgin">{t.isVirgin}</FieldLabel>
                        <FieldDescription>{t.isVirginHint}</FieldDescription>
                      </FieldContent>
                      <Switch
                        id="controller-virgin"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </Field>
                  )}
                />
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
                  <FieldLabel htmlFor="controller-name">{t.name}</FieldLabel>
                  <Input
                    id="controller-name"
                    autoComplete="off"
                    aria-invalid={Boolean(errors.name) || undefined}
                    aria-describedby="controller-name-hint"
                    {...form.register("name")}
                  />
                  <FieldDescription id="controller-name-hint">{t.nameHint}</FieldDescription>
                  <FieldError errors={[errors.name]} />
                </Field>

                <Field data-invalid={Boolean(errors.slug) || undefined}>
                  <FieldLabel htmlFor="controller-slug">{t.slugLabel}</FieldLabel>
                  <Input
                    id="controller-slug"
                    dir="ltr"
                    className="text-end font-mono"
                    autoComplete="off"
                    aria-invalid={Boolean(errors.slug) || undefined}
                    aria-describedby="controller-slug-hint"
                    {...form.register("slug")}
                  />
                  <FieldDescription id="controller-slug-hint">
                    {t.slugHint} <Ltr mono className="text-foreground">/controllers/{slug || "…"}</Ltr>
                  </FieldDescription>
                  <FieldError errors={[errors.slug]} />
                </Field>

                <Field data-invalid={Boolean(errors.description) || undefined}>
                  <FieldLabel htmlFor="controller-description">{t.description}</FieldLabel>
                  <Textarea
                    id="controller-description"
                    rows={4}
                    aria-invalid={Boolean(errors.description) || undefined}
                    aria-describedby="controller-description-hint"
                    {...form.register("description")}
                  />
                  <FieldDescription id="controller-description-hint">{t.descriptionHint}</FieldDescription>
                  <FieldError errors={[errors.description]} />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <ProductImageCard
            form={form}
            idPrefix="controller"
            uploadImage={uploadImage}
            hint={t.imageHint}
            alt={name}
            onUploadingChange={setUploading}
          />
          <ProductPricingCard form={form} idPrefix="controller" />
          <ProductVisibilityCard
            form={form}
            idPrefix="controller"
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
