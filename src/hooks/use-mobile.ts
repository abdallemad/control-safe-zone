import * as React from "react"

// Installed by `shadcn add sidebar`; rewritten with useSyncExternalStore
// because the generated version set state inside an effect
// (react-hooks/set-state-in-effect). Same export, same breakpoint.
// A UI hook, not a React Query hook — the one exception in src/hooks/.

const MOBILE_BREAKPOINT = 768
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    // Server: render the desktop layout; the client corrects on hydration.
    () => false
  )
}
