"use client"

import Link from "next/link"
import { Controller, type UseFormReturn } from "react-hook-form"

import { FileDropzone } from "@/components/forms/file-dropzone"
import { Ltr } from "@/components/shared"
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
import { IMAGE_ACCEPT, IMAGE_MAX_BYTES } from "@/constants/images"
import { ADMIN_ROUTES } from "@/constants/routes"
import { ar } from "@/messages/ar"
import type { ProductListingInput } from "@/schemas/product.schema"

// Form parts every sold type's form shares (IcForm, ProgrammerForm…): the
// cover, price & stock and visibility cards, and the platform picker. They
// only touch the `Product` listing fields (product.schema.ts), which every
// type's form values include.

const t = ar.products.form

/** "" → NaN, so a cleared required number fails validation instead of becoming 0. */
export const toNumber = (v: unknown) => (v === "" || v == null ? Number.NaN : Number(v))
export const toOptionalNumber = (v: unknown) => (v === "" || v == null ? null : Number(v))

/**
 * The cards are generic over the form's values; inside they address only the
 * shared listing fields, which every `T` has — so they work on the form as
 * that narrower shape.
 */
function asListingForm<T extends ProductListingInput>(form: UseFormReturn<T>) {
  return form as unknown as UseFormReturn<ProductListingInput>
}

/**
 * An EGP amount typed as text (money never passes through a float). The input
 * is LTR, so its start padding is the left side — where the currency sits
 * (`end-*` in the RTL wrapper).
 */
export function MoneyInput({
  invalid,
  ...props
}: React.ComponentProps<typeof Input> & { invalid: boolean }) {
  return (
    <div className="relative">
      <Input
        type="text"
        inputMode="decimal"
        dir="ltr"
        autoComplete="off"
        className="ps-10 text-end tabular-nums"
        aria-invalid={invalid || undefined}
        {...props}
      />
      <span className="pointer-events-none absolute end-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
        {t.currency}
      </span>
    </div>
  )
}

/** The cover image: FileDropzone → R2 (products/), held as `imageUrl`. */
export function ProductImageCard<T extends ProductListingInput>({
  form: typedForm,
  idPrefix,
  uploadImage,
  hint,
  alt,
  onUploadingChange,
}: {
  form: UseFormReturn<T>
  idPrefix: string
  uploadImage: (file: File) => Promise<string>
  /** Type-specific: which glyph shows without an image. */
  hint: string
  alt: string
  onUploadingChange: (uploading: boolean) => void
}) {
  const form = asListingForm(typedForm)
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.image}</CardTitle>
      </CardHeader>
      <CardContent>
        <Controller
          control={form.control}
          name="imageUrl"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FileDropzone
                id={`${idPrefix}-image`}
                value={field.value}
                onChange={field.onChange}
                upload={uploadImage}
                accept={IMAGE_ACCEPT}
                maxBytes={IMAGE_MAX_BYTES}
                messages={ar.dropzone}
                alt={alt || t.image}
                invalid={fieldState.invalid}
                disabled={form.formState.isSubmitting}
                onUploadingChange={onUploadingChange}
                aria-describedby={`${idPrefix}-image-hint`}
              />
              <FieldDescription id={`${idPrefix}-image-hint`}>{hint}</FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </CardContent>
    </Card>
  )
}

/** Price, compare-at price, stock and the low-stock threshold. */
export function ProductPricingCard<T extends ProductListingInput>({
  form: typedForm,
  idPrefix,
}: {
  form: UseFormReturn<T>
  idPrefix: string
}) {
  const form = asListingForm(typedForm)
  const { errors } = form.formState
  const id = (name: string) => `${idPrefix}-${name}`

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.pricingTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field data-invalid={Boolean(errors.price) || undefined}>
            <FieldLabel htmlFor={id("price")}>{t.price}</FieldLabel>
            <MoneyInput id={id("price")} invalid={Boolean(errors.price)} {...form.register("price")} />
            <FieldError errors={[errors.price]} />
          </Field>

          <Field data-invalid={Boolean(errors.compareAtPrice) || undefined}>
            <FieldLabel htmlFor={id("compare-at")}>{t.compareAtPrice}</FieldLabel>
            <MoneyInput
              id={id("compare-at")}
              invalid={Boolean(errors.compareAtPrice)}
              aria-describedby={id("compare-at-hint")}
              {...form.register("compareAtPrice")}
            />
            <FieldDescription id={id("compare-at-hint")}>{t.compareAtPriceHint}</FieldDescription>
            <FieldError errors={[errors.compareAtPrice]} />
          </Field>

          <Field data-invalid={Boolean(errors.stockQuantity) || undefined}>
            <FieldLabel htmlFor={id("stock")}>{t.stockQuantity}</FieldLabel>
            <Input
              id={id("stock")}
              type="number"
              inputMode="numeric"
              min={0}
              dir="ltr"
              className="text-end tabular-nums"
              aria-invalid={Boolean(errors.stockQuantity) || undefined}
              aria-describedby={id("stock-hint")}
              {...form.register("stockQuantity", { setValueAs: toNumber })}
            />
            <FieldDescription id={id("stock-hint")}>{t.stockQuantityHint}</FieldDescription>
            <FieldError errors={[errors.stockQuantity]} />
          </Field>

          <Field data-invalid={Boolean(errors.lowStockThreshold) || undefined}>
            <FieldLabel htmlFor={id("low-stock")}>{t.lowStockThreshold}</FieldLabel>
            <Input
              id={id("low-stock")}
              type="number"
              inputMode="numeric"
              min={0}
              dir="ltr"
              className="text-end tabular-nums"
              aria-invalid={Boolean(errors.lowStockThreshold) || undefined}
              aria-describedby={id("low-stock-hint")}
              {...form.register("lowStockThreshold", { setValueAs: toNumber })}
            />
            <FieldDescription id={id("low-stock-hint")}>{t.lowStockThresholdHint}</FieldDescription>
            <FieldError errors={[errors.lowStockThreshold]} />
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

/** The two switches: active (type-specific wording) and featured. */
export function ProductVisibilityCard<T extends ProductListingInput>({
  form: typedForm,
  idPrefix,
  isActiveLabel,
  isActiveHint,
}: {
  form: UseFormReturn<T>
  idPrefix: string
  isActiveLabel: string
  isActiveHint: string
}) {
  const form = asListingForm(typedForm)
  const disabled = form.formState.isSubmitting

  return (
    <Card>
      <CardContent>
        <FieldGroup>
          <Controller
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor={`${idPrefix}-active`}>{isActiveLabel}</FieldLabel>
                  <FieldDescription>{isActiveHint}</FieldDescription>
                </FieldContent>
                <Switch
                  id={`${idPrefix}-active`}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor={`${idPrefix}-featured`}>{t.isFeatured}</FieldLabel>
                  <FieldDescription>{t.isFeaturedHint}</FieldDescription>
                </FieldContent>
                <Switch
                  id={`${idPrefix}-featured`}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              </Field>
            )}
          />
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

export type PlatformOption = { value: string; label: string }

/** One platform picker — the first field of every platform link row. */
export function PlatformSelect({
  id,
  value,
  onChange,
  onBlur,
  options,
  invalid,
  disabled,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  options: PlatformOption[]
  invalid: boolean
  disabled: boolean
}) {
  return (
    <Select items={options} value={value || null} onValueChange={(v) => onChange(v ?? "")} disabled={disabled}>
      <SelectTrigger id={id} className="w-full" aria-invalid={invalid || undefined} onBlur={onBlur}>
        <SelectValue placeholder={t.platformPlaceholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((p) => (
          <SelectItem key={p.value} value={p.value}>
            <Ltr>{p.label}</Ltr>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * What a platform-rows card says with no rows: the type's "none linked yet",
 * or — when the catalog has no platforms at all — a link to create one.
 */
export function NoPlatformRows({ hasOptions, emptyText }: { hasOptions: boolean; emptyText: string }) {
  return (
    <p className="text-sm text-muted-foreground">
      {hasOptions ? (
        emptyText
      ) : (
        <>
          {t.noPlatformsYet}{" "}
          <Link
            href={`${ADMIN_ROUTES.platforms}/new`}
            className="text-primary-ink underline-offset-4 hover:underline"
          >
            {t.createPlatform}
          </Link>
        </>
      )}
    </p>
  )
}
