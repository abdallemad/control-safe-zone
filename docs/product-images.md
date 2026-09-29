# Images on R2

Every uploaded image (brand logos, IC and programmer covers today; controller photos and pinout previews next) lives in a **private Cloudflare R2 bucket** and is served by **our own route**, `GET /api/images/<key>`. The database stores the **path string**, never a bucket URL:

```text
Brand.logoUrl    = "/api/images/brands/3f0c…-….png"
Product.imageUrl = "/api/images/products/<uuid>.<ext>"      (ICs, programmers — productService.uploadImage)
Pinout.imageUrl  = "/api/images/pinouts/<uuid>.<ext>"       (planned)
```

Pinout **PDFs** do not use this route. They are served by `GET /api/pinouts/[id]/pdf` after the access check (`pinouts-feature.md`).

---

## Configuration

`.env.local` (not committed):

| Variable | Use |
|---|---|
| `R2_ACCOUNT_ID` | Fallback for the endpoint when `S3_API` is not set |
| `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | An R2 API token with Object Read & Write on the bucket |
| `R2_BUCKET_NAME` | `control-safe-zone` |
| `S3_API` | `https://<account>.r2.cloudflarestorage.com`, the S3-compatible endpoint |

Package: `@aws-sdk/client-s3` (R2 speaks the S3 API). `@aws-sdk/s3-request-presigner` is installed but **not used yet**. Uploads go through a Server Action (see below). It will be needed for direct browser uploads of large files, such as PDFs.

---

## Files

| File | Role |
|---|---|
| `lib/r2.ts` | `getR2()`: the `S3Client` (region `auto`, R2 endpoint), created on first use so a build without the variables still compiles. `getR2Bucket()`. `server-only` |
| `services/storage.service.ts` | The **only** file that talks to R2: `uploadImage(folder, file)`, `deleteImageByUrl(url)`, `getImage(key)`. Plus `imageUrlFromKey`, `keyFromImageUrl`, `isValidImageKey` |
| `constants/images.ts` | `IMAGE_MAX_BYTES` (2 MB) and `IMAGE_ACCEPT` (png, jpeg, webp), shared by the browser check and the server check |
| `app/api/images/[...key]/route.ts` | The public image route |
| `components/forms/file-dropzone.tsx` | The reusable picker (see `brands-feature.md`) |
| `next.config.ts` | `images.localPatterns` (next/image may optimise `/api/images/**` only, no query strings). `experimental.serverActions.bodySizeLimit: "3mb"` (2 MB image + multipart overhead) |

---

## Keys

```text
<folder>/<uuid>.<ext>      folder ∈ brands | products | pinouts,  ext ∈ png | jpg | webp
```

- A new UUID per upload means a key is **never overwritten**, so responses are cached for a year (`immutable`).
- `isValidImageKey` is the gate for both the route and deletes: only keys of that exact shape are read or removed.

---

## Upload rules (`storageService.uploadImage`)

1. A file is required and must be ≤ **2 MB**.
2. The type is identified from the **first bytes** (PNG `89 50 4E 47`, JPEG `FF D8 FF`, WEBP `RIFF….WEBP`). The file name and the browser's `type` are ignored.
3. **No SVG.** It can carry script, and images are served from our own origin.
4. Stored with its real `Content-Type` and `Cache-Control: public, max-age=31536000, immutable`.
5. Failures are `ServiceError`s with Arabic messages (`ar.errors.upload`).

Uploads run through a **Server Action** (the feature's upload action, e.g. `uploadBrandLogoAction`). That action carries the session, so it checks admin before anything reaches R2.

## Deletes

`deleteImageByUrl` is **best-effort**. It logs and swallows errors: a leftover object costs a few KB, while failing a save because of it would cost the admin their edit. Services call it after the database write succeeds (replaced logo, deleted brand).

## The route: `GET /api/images/[...key]`

- **Public**, on purpose. Logos and product photos are public, and `<img>`, next/image, crawlers and WhatsApp previews can't call Server Actions.
- An invalid key → **404** without touching R2. A missing object → **404**.
- Headers: `Content-Type` (from R2), `Cache-Control: public, max-age=31536000, immutable`, `X-Content-Type-Options: nosniff`, `Content-Length`, `ETag`.
- The body is streamed from R2 (`transformToWebStream()`).

## Displaying

Use `next/image` with the stored path (`<Image src={brand.logoUrl} fill sizes="40px" … />`). `localPatterns` allows it.

---

## Verified

- A test PNG was put to R2 with the `.env.local` credentials and read back through `/api/images/…`: 200, `image/png`, the year-long `immutable` cache header, identical bytes. It was then deleted, after which the route returned 404.
- A valid-looking key that doesn't exist gets 404 from R2 (`NoSuchKey`). A malformed key gets 404 in about 5 ms without touching R2.

## Later

- An orphan sweep for uploads never saved to a row (abandoned forms).
- Presigned PUT URLs (`s3-request-presigner`) for the pinout PDFs, which can exceed the Server Action body limit.
