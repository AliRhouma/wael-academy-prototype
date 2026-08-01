import { useId } from "react"

/**
 * A unique, CSS-safe prefix for one icon instance's <defs> ids.
 *
 * WHY THIS EXISTS: the shell renders the SAME nav glyph twice at once — in the
 * desktop sidebar (`hidden md:flex`) and in the mobile bottom bar. Both copies
 * are in the DOM, so hardcoded ids like `dashGrad` appeared twice and
 * `url(#dashGrad)` resolved to the FIRST match, which at mobile widths lives
 * inside the `display:none` sidebar. Chromium won't paint a gradient whose
 * defining subtree isn't rendered, so every gradient nav icon vanished from the
 * mobile bar (labels only). Namespacing per COMPONENT isn't enough here —
 * it has to be per INSTANCE.
 *
 * The colons React puts in useId() are legal in HTML ids and fine inside an SVG
 * `url(#…)` fragment reference, but they break `querySelector`, so strip them.
 */
export function useGlyphId(): string {
  return useId().replace(/:/g, "")
}
