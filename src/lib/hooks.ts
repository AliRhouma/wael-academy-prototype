import { useCallback, useEffect, useRef, useState } from "react"

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

/**
 * The live height of an element in px — 0 until it has been measured once.
 *
 * For layout that has to answer a question about a box the CSS cannot ask:
 * « how much taller than this row is the character standing beside it ». Read
 * from the box itself rather than assumed from its `min-h`, because the
 * assumption is wrong by 130px on a row whose panels grow with their content.
 */
export function useMeasuredHeight<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const read = () => setHeight(el.getBoundingClientRect().height)
    read()
    const observer = new ResizeObserver(read)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, height }
}

/**
 * Which edges of a scroller still have content beyond them.
 *
 * A rail with its scrollbar hidden and a queue clipped at a max-height both lie
 * about their own size: content stops at the edge with nothing to say whether
 * that is the end or the middle. Feed this into a `mask-image` (and, on a rail,
 * into a pair of arrows) and the cut edge fades instead — which reads as «
 * there is more this way » rather than as a broken layout.
 *
 * Edges are PHYSICAL — `before` is left (or top), `after` is right (or bottom)
 * — because a mask gradient is physical too. Only the arrows care about
 * direction, and they scroll by signed delta, which the caller owns.
 *
 * `watch` re-measures when the list itself changes: a ResizeObserver sees the
 * scroller's own box change, never its content growing a card longer.
 */
export function useScrollEdges<T extends HTMLElement>(axis: "x" | "y" = "x", watch?: unknown) {
  const ref = useRef<T | null>(null)
  const [edges, setEdges] = useState({ before: false, after: false })

  const measure = useCallback(() => {
    const el = ref.current
    if (!el) return
    // 2px of slack: sub-pixel layout leaves a scroller that is visually at its
    // end reporting a fraction of a pixel to go, and the fade would never clear.
    if (axis === "y") {
      const max = el.scrollHeight - el.clientHeight
      setEdges({ before: el.scrollTop > 2, after: max - el.scrollTop > 2 })
      return
    }
    const max = el.scrollWidth - el.clientWidth
    // RTL browsers run `scrollLeft` from -max (the far end) up to 0 (the start,
    // which is the RIGHT edge), so the distance to the physical left edge is not
    // |scrollLeft| in both worlds — it has to be worked out per direction.
    const rtl = getComputedStyle(el).direction === "rtl"
    const left = rtl ? max + el.scrollLeft : el.scrollLeft
    setEdges({ before: left > 2, after: max - left > 2 })
  }, [axis])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    measure()
    el.addEventListener("scroll", measure, { passive: true })
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => {
      el.removeEventListener("scroll", measure)
      observer.disconnect()
    }
  }, [measure, watch])

  return { ref, edges, measure }
}

/** Fade in px at a scroller's cut edge — wide enough to read as a fade. */
const FADE = 28

/** `mask-image` for a scroller, fading only the edges that have more behind them. */
export function edgeMask(axis: "x" | "y", edges: { before: boolean; after: boolean }) {
  const to = axis === "x" ? "right" : "bottom"
  const image = `linear-gradient(to ${to}, ${edges.before ? "transparent" : "#000"} 0, #000 ${FADE}px, #000 calc(100% - ${FADE}px), ${edges.after ? "transparent" : "#000"} 100%)`
  return { maskImage: image, WebkitMaskImage: image }
}
