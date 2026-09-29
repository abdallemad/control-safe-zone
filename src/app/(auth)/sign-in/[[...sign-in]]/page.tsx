import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

import { ar } from "@/messages/ar";

export const metadata: Metadata = { title: ar.auth.signInTitle };

// Catch-all: Clerk renders its own steps (factor two, reset…) under /sign-in/*.
export default function SignInPage() {
  return <SignIn />;
}
