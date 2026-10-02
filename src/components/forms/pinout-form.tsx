"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2, TriangleAlert } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"

import { FileDropzone } from "@/components/forms/file-dropzone"
import { PdfDropzone } from "@/components/forms/pdf-dropzone"
import { type PlatformOption } from "@/components/forms/product-listing-fields"
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
import { IMAGE_ACCEPT, IMAGE_MAX_BYTES } from "@/constants/images"
import { PDF_ACCEPT, PDF_MAX_BYTES } from "@/constants/pdf"
import { ADMIN_ROUTES } from "@/constants/routes"
import { ActionError } from "@/lib/action-result"
import { ar } from "@/messages/ar"
import { pinoutSchema, type PinoutInput } from "@/schemas/pinout.schema"
import { slugify } from "@/utils/slugify"

const t = ar.pinouts.form

/** The platform is optional; the select needs a real value for "none". */
const NO_PLATFORM = "none"

/**
 * Create / edit a pinout. Presentational, like ControllerForm: the caller
 * owns the mutations and passes `onSubmit`, `uploadImage` and `uploadPdf`; a
 * thrown ActionError's fieldErrors land on their fields, its message above
 * the buttons. Validation is `pinoutSchema` — the same schema the Server
 * Action runs.
 */
export function PinoutForm({
  defaultValues,
  onSubmit,
  uploadImage,
  uploadPdf,
  submitLabel,
  cancelHref,
  autoSlug,
  platformOptions,
  savedPdfHref,
}: {
  defaultValues: PinoutInput
  onSubmit: (values: PinoutInput) => Promise<void>
  uploadImage: (file: File) => Promise<string>
  uploadPdf: (file: File) => Promise<string>
  submitLabel: string
  cancelHref: string
  /** Fill the slug from platform + connector (or the name) until it's edited by hand (create mode). */
  autoSlug: boolean
  /** Controller platforms the pinout can be linked to. */
  platformOptions: PlatformOption[]
  /** Edit mode: where the PDF saved on this pinout opens (the access-checked route). */
  savedPdfHref?: { pdfKey: string; href: string }
}) {
  const form = useForm<PinoutInput>({
    resolver: standardSchemaResolver(pinoutSchema),
    defaultValues,
  })
  const { errors, isSubmitting, isSubmitted } = form.formState
  // useWatch, not form.watch: safe under the React Compiler.
  const slug = useWatch({ control: form.control, name: "slug" })
  const name = useWatch({ control: form.control, name: "name" })
  const pdfKey = useWatch({ control: form.control, name: "pdfKey" })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingPdf, setUploadingPdf] = useState(false)

  const platformItems = [{ value: NO_PLATFORM, label: t.noPlatform }, ...platformOptions]

  // "Bosch EDC17C46" + "A" → "bosch-edc17c46-a"; with no platform, the name.
  // setValue without shouldDirty keeps the slug pristine, so only a hand
  // edit stops the auto-fill.
  function refreshSlug() {
    if (!autoSlug || form.getFieldState("slug").isDirty) return
    const { platformId, connector, name } = form.getValues()
    const platform = platformOptions.find((p) => p.value === platformId)?.label
    form.setValue("slug", slugify(platform ? `${platform} ${connector}` : name), { shouldValidate: isSubmitted })
  }

  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (error) {
      if (error instanceof ActionError) {
        for (const [field, message] of Object.entries(error.fieldErrors ?? {})) {
          if (field in values) form.setError(field as keyof PinoutInput, { message })
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
          {/* ── The pinout ── */}
          <Card>
            <CardHeader>
              <CardTitle>{t.detailsTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field data-invalid={Boolean(errors.name) || undefined}>
                  <FieldLabel htmlFor="pinout-name">{t.name}</FieldLabel>
                  <Input
                    id="pinout-name"
                    autoComplete="off"
                    aria-invalid={Boolean(errors.name) || undefined}
                    aria-describedby="pinout-name-hint"
                    {...form.register("name", { onChange: refreshSlug })}
                  />
                  <FieldDescription id="pinout-name-hint">{t.nameHint}</FieldDescription>
                  <FieldError errors={[errors.name]} />
                </Field>

                <div className="grid gap-6 sm:grid-cols-2">
                  <Controller
                    control={form.control}
                    name="platformId"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid || undefined}>
                        <FieldLabel htmlFor="pinout-platform">{t.platform}</FieldLabel>
                        <Select
                          items={platformItems}
                          value={field.value || NO_PLATFORM}
                          onValueChange={(value) => {
                            field.onChange(!value || value === NO_PLATFORM ? "" : value)
                            refreshSlug()
                          }}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger
                            id="pinout-platform"
                            className="w-full"
                            aria-invalid={fieldState.invalid || undefined}
                            aria-describedby="pinout-platform-hint"
                            onBlur={field.onBlur}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {platformItems.map((p) => (
                              <SelectItem key={p.value} value={p.value}>
                                {p.value === NO_PLATFORM ? p.label : <Ltr>{p.label}</Ltr>}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldDescription id="pinout-platform-hint">
                          {t.platformHint}
                          {platformOptions.length === 0 && (
                            <>
                              {" "}
                              <Link
                                href={`${ADMIN_ROUTES.platforms}/new`}
                                className="text-primary-ink underline-offset-4 hover:underline"
                              >
                                {ar.products.form.createPlatform}
                              </Link>
                            </>
                          )}
                        </FieldDescription>
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />

                  <Field data-invalid={Boolean(errors.connector) || undefined}>
                    <FieldLabel htmlFor="pinout-connector">{t.connector}</FieldLabel>
                    <Input
                      id="pinout-connector"
                      dir="ltr"
                      className="text-end font-mono"
                      autoComplete="off"
                      aria-invalid={Boolean(errors.connector) || undefined}
                      aria-describedby="pinout-connector-hint"
                      {...form.register("connector", { onChange: refreshSlug })}
                    />
                    <FieldDescription id="pinout-connector-hint">{t.connectorHint}</FieldDescription>
                    <FieldError errors={[errors.connector]} />
                  </Field>
                </div>

                <Field data-invalid={Boolean(errors.slug) || undefined}>
                  <FieldLabel htmlFor="pinout-slug">{t.slugLabel}</FieldLabel>
                  <Input
                    id="pinout-slug"
                    dir="ltr"
                    className="text-end font-mono"
                    autoComplete="off"
                    aria-invalid={Boolean(errors.slug) || undefined}
                    aria-describedby="pinout-slug-hint"
                    {...form.register("slug")}
                  />
                  <FieldDescription id="pinout-slug-hint">
                    {t.slugHint} <Ltr mono className="text-foreground">/pinouts/{slug || "…"}</Ltr>
                  </FieldDescription>
                  <FieldError errors={[errors.slug]} />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          {/* ── Files ── */}
          <Card>
            <CardHeader>
              <CardTitle>{t.filesTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Controller
                  control={form.control}
                  name="imageUrl"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid || undefined}>
                      <FieldLabel htmlFor="pinout-image">{t.image}</FieldLabel>
                      <FileDropzone
                        id="pinout-image"
                        value={field.value}
                        onChange={field.onChange}
                        upload={uploadImage}
                        accept={IMAGE_ACCEPT}
                        maxBytes={IMAGE_MAX_BYTES}
                        messages={ar.dropzone}
                        alt={name || t.image}
                        invalid={fieldState.invalid}
                        disabled={isSubmitting}
                        onUploadingChange={setUploadingImage}
                        aria-describedby="pinout-image-hint"
                      />
                      <FieldDescription id="pinout-image-hint">{t.imageHint}</FieldDescription>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="pdfKey"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid || undefined}>
                      <FieldLabel htmlFor="pinout-pdf">{t.pdf}</FieldLabel>
                      <PdfDropzone
                        id="pinout-pdf"
                        value={field.value}
                        onChange={field.onChange}
                        upload={uploadPdf}
                        accept={PDF_ACCEPT}
                        maxBytes={PDF_MAX_BYTES}
                        messages={ar.pdfDropzone}
                        // Only the file already saved on this pinout can be opened by id.
                        openHref={savedPdfHref && savedPdfHref.pdfKey === pdfKey ? savedPdfHref.href : undefined}
                        invalid={fieldState.invalid}
                        disabled={isSubmitting}
                        onUploadingChange={setUploadingPdf}
                        aria-describedby="pinout-pdf-hint"
                      />
                      <FieldDescription id="pinout-pdf-hint">{t.pdfHint}</FieldDescription>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
          </Card>

          {/* ── Access & visibility ── */}
          <Card>
            <CardHeader>
              <CardTitle>{t.accessTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Controller
                  control={form.control}
                  name="requiresSignIn"
                  render={({ field }) => (
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldLabel htmlFor="pinout-requires-sign-in">{t.requiresSignIn}</FieldLabel>
                        <FieldDescription>{t.requiresSignInHint}</FieldDescription>
                      </FieldContent>
                      <Switch
                        id="pinout-requires-sign-in"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldLabel htmlFor="pinout-active">{t.isActive}</FieldLabel>
                        <FieldDescription>{t.isActiveHint}</FieldDescription>
                      </FieldContent>
                      <Switch
                        id="pinout-active"
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
        </div>
      </div>

      {errors.root?.message && (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={isSubmitting || uploadingImage || uploadingPdf}>
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
