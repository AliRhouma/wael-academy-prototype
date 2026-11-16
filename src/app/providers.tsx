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
import { useGazeHotkey } from "./gaze"
import { getDevice } from "./platform"
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

/**
 * The two floating design docks — the palette swatches and the type picker —
 * are AUTHORING tools, not product UI. They stay in the tree so a palette or a
 * typeface can be tried live; flip either to `false` to take it off screen.
 * Hidden, the app still honours whatever palette/font was last picked (both are
 * read from localStorage above), so nothing about the look changes.
 *
 * They are two switches rather than one because they come and go separately:
 * the palette is still being chosen (and gets shown in demos), while the
 * typeface is settled and its dock is just a button in the corner.
 */
const SHOW_PALETTE_DOCK = true
const SHOW_FONT_DOCK = false

const THEME_KEY = "wael-theme"
/**
 * VERSIONNÉE, et c'est le point : le suffixe monte quand `DEFAULT_PALETTE`
 * change.
 *
 * Le dock écrit la palette choisie ici, donc toute machine ayant servi à une
 * démo porte un choix enregistré — et un choix enregistré gagne sur le défaut.
 * Résultat sans le suffixe : on change la palette par défaut, on pousse, et
 * personne dans l'équipe ne la voit, chacun restant sur celle qu'il avait
 * cliquée un jour. Monter le numéro périme les anciens choix d'un coup ; tout
 * le monde atterrit sur le nouveau défaut, et repart de là avec ses propres
 * choix qui persistent normalement.
 */
const PALETTE_KEY = "wael-palette-2"
const FONT_KEY = "wael-font"

const DARK_QUERY = "(prefers-color-scheme: dark)"

/**
 * A theme someone picked (the gallery's moon, a toggle) wins; otherwise the
 * device's own appearance — a phone in dark mode opens the app dark, as
 * Apple and Material both expect (docs/mobile/apple-design-audit.md, I3).
 */
function savedTheme(): Theme | null {
  const saved = localStorage.getItem(THEME_KEY)
  return saved === "dark" || saved === "light" ? saved : null
}

function initTheme(): Theme {
  return savedTheme() ?? (window.matchMedia(DARK_QUERY).matches ? "dark" : "light")
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
  const [theme, applyTheme] = useState<Theme>(initTheme)
  // Only an explicit choice is remembered — so with none saved, the app keeps
  // following the device when it switches between light and dark.
  const setTheme = (next: Theme) => {
    localStorage.setItem(THEME_KEY, next)
    applyTheme(next)
  }
  const [palette, setPalette] = useState<PaletteId>(initPalette)
  const [font, setFont] = useState<FontId>(initFont)

  // S stops and restarts Wael's cursor-following eyes, everywhere at once. Bound
  // here because it is app-wide: the faces are on the matières grid, the séance
  // lists and the dashboard, and no one screen owns them.
  useGazeHotkey()

  // Tokens in src/styles/index.css switch on [data-theme="dark"].
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  // Follow the device while nothing has been picked.
  useEffect(() => {
    const mql = window.matchMedia(DARK_QUERY)
    const onChange = () => {
      if (!savedTheme()) applyTheme(mql.matches ? "dark" : "light")
    }
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

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

  const toggle = () => setTheme(theme === "light" ? "dark" : "light")

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme, palette, setPalette, font, setFont }}>
      {children}
      {/* Not inside a phone frame: the docks re-point the OLD space's
          primitives and would only cover the screen being looked at. */}
      {SHOW_PALETTE_DOCK && !getDevice().framed && <PaletteDock />}
      {SHOW_FONT_DOCK && !getDevice().framed && <FontDock />}
      {/* RTL: toasts land on the reading-flow side — top-left mirrors top-right. */}
      <Toaster position="top-left" dir="rtl" theme={theme} richColors closeButton />
    </ThemeContext.Provider>
  )
}
