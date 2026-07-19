import type { ComponentType } from "react"

/** Any icon that takes a className — Lucide icons and our custom SVG glyphs both fit. */
export type NavIcon = ComponentType<{ className?: string }>

/** One navigation entry. Roles differ only by their list of these. */
export interface NavItem {
  label: string
  path: string
  icon: NavIcon
  /** true = the icon carries its own fill (e.g. a gradient glyph); the shell
   *  forces it white on the active pill instead of tinting via currentColor. */
  colored?: boolean
}
