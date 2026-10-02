import type { NextRequest } from "next/server";

import { ROUTES } from "@/constants/routes";
import { pinoutService } from "@/services/pinout.service";

// GET /api/pinouts/<id>/pdf — a pinout's PDF from the private side of R2
// (docs/pinouts-admin-feature.md). One of the three Route Handlers in the app:
// a download link can't call a Server Action. The access rule
// (inactive → admins only, requiresSignIn → a signed-in user) lives in
// pinoutService.openPdf; this file only turns its answer into a response.
export async function GET(request: NextRequest, ctx: RouteContext<"/api/pinouts/[id]/pdf">) {
  const { id } = await ctx.params;
  const result = await pinoutService.openPdf(id);

  if (result.status === "notFound") {
    return new Response("Not found", { status: 404 });
  }
  if (result.status === "signIn") {
    // Sign-in always lands on /auth-callback (forced redirect), so no return URL.
    return Response.redirect(new URL(ROUTES.signIn, request.url), 303);
  }

  const { file, filename } = result;
  const headers = new Headers({
    "Content-Type": "application/pdf",
    // Opens in the browser's viewer; "Save" uses the slug as the file name.
    "Content-Disposition": `inline; filename="${filename}"`,
    // Access-checked per request — never cached by a shared cache.
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  });
  if (file.contentLength) headers.set("Content-Length", String(file.contentLength));

  return new Response(file.body, { headers });
}
