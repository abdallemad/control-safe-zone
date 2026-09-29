import type { NextRequest } from "next/server";

import { isValidImageKey, storageService } from "@/services/storage.service";

// GET /api/images/<folder>/<uuid>.<ext> — images from the private R2 bucket
// (docs/product-images.md). One of the three Route Handlers in the app: it
// serves bytes to <img>, next/image, crawlers and WhatsApp link previews,
// none of which can call a Server Action.
//
// Public on purpose (logos and product photos are public). Only keys we could
// have written are served, so the route cannot be used to read anything else
// in the bucket. Keys are never reused → cache for a year.
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/images/[...key]">) {
  const { key: segments } = await ctx.params;
  const key = segments.join("/");

  if (!isValidImageKey(key)) {
    return new Response("Not found", { status: 404 });
  }

  const image = await storageService.getImage(key);
  if (!image) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers({
    "Content-Type": image.contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  });
  if (image.contentLength) headers.set("Content-Length", String(image.contentLength));
  if (image.etag) headers.set("ETag", image.etag);

  return new Response(image.body, { headers });
}
