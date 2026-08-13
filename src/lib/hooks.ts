import { useEffect, useRef, useState } from "react"

const MOBILE_QUERY = "(max-width: 767px)"

/** Live `matchMedia` result for any query — re-renders when it flips. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [query])

  return matches
}

/**
 * True below the `md` breakpoint (viewport < 768px), updated on resize.
 *
 * Use this ONLY where mobile and desktop must render *different* React
 * components (e.g. a bottom Sheet vs a centered Dialog). For pure show/hide,
 * prefer Tailwind responsive utilities (`hidden md:flex`, `md:hidden`).
 */
export function useIsMobile(): boolean {
  return useMediaQuery(MOBILE_QUERY)
}

/**
 * True when the visitor has asked their OS for less motion.
 *
 * Use it where the `motion-safe:` variant isn't enough — i.e. when reduced
 * motion should change WHAT IS RENDERED, not just whether it animates. The
 * matières belt is the case: a stopped conveyor would leave most of the list
 * parked off-window, so that screen renders a plain grid instead.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)")
}

/**
 * Tells a `sticky` element when it has actually stuck, so it can restyle
 * itself (grow a background, fold into a compact form…).
 *
 * Attach the returned ref to a 1px sentinel placed immediately BEFORE the
 * sticky element: once the sentinel scrolls out of the top of the scroll
 * container, the element below it is pinned. The observer roots on the nearest
 * `main` — the app shell scrolls there, not on the document — and falls back to
 * the viewport if there isn't one.
 */
export function useStuck(): [React.RefObject<HTMLDivElement | null>, boolean] {
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { root: sentinel.closest("main"), threshold: 0 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return [sentinelRef, stuck]
}
