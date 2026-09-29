import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

import { ar } from "@/messages/ar";

export const metadata: Metadata = { title: ar.auth.signUpTitle };

// Catch-all: Clerk renders its own steps (verify email…) under /sign-up/*.
export default function SignUpPage() {
  return <SignUp />;
}
