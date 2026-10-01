// React Query keys — one factory per feature, so invalidation is typo-proof.
export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    callback: ["auth", "callback"] as const,
    /** Keyed by Clerk user id, so signing in / out / switching user refetches. */
    session: (clerkUserId: string) => ["auth", "session", clerkUserId] as const,
  },
  brands: {
    all: ["brands"] as const,
    list: () => ["brands", "list"] as const,
  },
  platforms: {
    all: ["platforms"] as const,
    list: () => ["platforms", "list"] as const,
  },
  ics: {
    all: ["ics"] as const,
    list: () => ["ics", "list"] as const,
  },
  programmers: {
    all: ["programmers"] as const,
    list: () => ["programmers", "list"] as const,
  },
  controllers: {
    all: ["controllers"] as const,
    list: () => ["controllers", "list"] as const,
  },
}
