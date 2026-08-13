import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { Toaster } from "sonner"
import { DEFAULT_PALETTE, PALETTES, type PaletteId } from "./palettes"
import { DEFAULT_FONT, FONTS, type FontId } from "./fonts"
import { PaletteDock } from "./PaletteDock"
import { FontDock } from "./FontDock"

type Theme = "light" | "dark"

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
  setTheme: (theme: Theme) => void
  /** Active color palette (id → data-palette on <html>). */
  palette: PaletteId
  setPalette: (palette: PaletteId) => void
  /** Active typeface (id → data-font on <html>). */
  font: FontId
  setFont: (font: FontId) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

/** Read the current theme + palette and change them. Must be used inside <Providers>. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within <Providers>")
  return ctx
}

const THEME_KEY = "wael-theme"
const PALETTE_KEY = "wael-palette"
const FONT_KEY = "wael-font"

function initTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY)
  return saved === "dark" ? "dark" : "light"
}

function initPalette(): PaletteId {
  const saved = localStorage.getItem(PALETTE_KEY)
  const known = PALETTES.some((p) => p.id === saved)
  return known ? (saved as PaletteId) : DEFAULT_PALETTE
}

function initFont(): FontId {
  const saved = localStorage.getItem(FONT_KEY)
  const known = FONTS.some((f) => f.id === saved)
  return known ? (saved as FontId) : DEFAULT_FONT
}

/**
 * App-root providers:
 *  - light/dark theme via `data-theme` on <html> (the design tokens key off it)
 *  - swappable color palette via `data-palette` on <html> (src/styles/palettes.css)
 *  - swappable typeface via `data-font` on <html> (src/styles/fonts.css)
 *  - the sonner <Toaster/> for action feedback (toasts).
 * Theme, palette and font all persist to localStorage so a chosen look survives
 * refresh.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initTheme)
  const [palette, setPalette] = useState<PaletteId>(initPalette)
  const [font, setFont] = useState<FontId>(initFont)

  // Tokens in src/styles/index.css switch on [data-theme="dark"].
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  // Palettes in src/styles/palettes.css switch on [data-palette].
  useEffect(() => {
    document.documentElement.setAttribute("data-palette", palette)
    localStorage.setItem(PALETTE_KEY, palette)
  }, [palette])

  // Typefaces in src/styles/fonts.css switch on [data-font].
  useEffect(() => {
    document.documentElement.setAttribute("data-font", font)
    localStorage.setItem(FONT_KEY, font)
  }, [font])

  const toggle = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"))

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme, palette, setPalette, font, setFont }}>
      {children}
      <PaletteDock />
      <FontDock />
      {/* RTL: toasts land on the reading-flow side — top-left mirrors top-right. */}
      <Toaster position="top-left" dir="rtl" theme={theme} richColors closeButton />
    </ThemeContext.Provider>
  )
}
