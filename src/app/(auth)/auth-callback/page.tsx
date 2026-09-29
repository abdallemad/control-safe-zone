import type { Metadata } from "next";

import { AuthCallbackView } from "@/components/auth/auth-callback-view";
import { ar } from "@/messages/ar";
import { authService } from "@/services/auth.service";

export const metadata: Metadata = {
  title: ar.authCallback.metaTitle,
  robots: { index: false, follow: false },
};

// Where Clerk lands every sign-in / sign-up. The view syncs the user with the
// database (useAuthCallback → syncUserAction → userService) and redirects to
// /admin or / by role. Signed-out visitors are sent to sign-in first.
export default async function AuthCallbackPage() {
  await authService.requireSignedIn();
  return <AuthCallbackView />;
}
