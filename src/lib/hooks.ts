import { useEffect, useState } from "react"

const MOBILE_QUERY = "(max-width: 767px)"

/**
 * True below the `md` breakpoint (viewport < 768px), updated on resize.
 *
 * Use this ONLY where mobile and desktop must render *different* React
 * components (e.g. a bottom Sheet vs a centered Dialog). For pure show/hide,
 * prefer Tailwind responsive utilities (`hidden md:flex`, `md:hidden`).
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia(MOBILE_QUERY).matches : false,
  )

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY)
    const onChange = () => setIsMobile(mql.matches)
    onChange()
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
