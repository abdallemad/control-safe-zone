import { clerkMiddleware } from '@clerk/nextjs/server';

// Makes the Clerk session available to `auth()` everywhere. It guards nothing:
// path-matching guards (`createRouteMatcher`) are deprecated in Clerk Core 3,
// and the Next.js auth guide keeps checks next to the data. Each protected
// page calls `authService.requireSignedIn()` / `requireAdmin()` itself
// (docs/auth-feature.md).
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/:path*',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
