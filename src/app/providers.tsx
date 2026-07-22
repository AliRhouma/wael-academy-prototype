import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { Toaster } from "sonner"
import { DEFAULT_PALETTE, PALETTES, type PaletteId } from "./palettes"
import { PaletteDock } from "./PaletteDock"

type Theme = "light" | "dark"

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
  setTheme: (theme: Theme) => void
  /** Active color palette (id → data-palette on <html>). */
  palette: PaletteId
  setPalette: (palette: PaletteId) => void
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

function initTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY)
  return saved === "dark" ? "dark" : "light"
}

function initPalette(): PaletteId {
  const saved = localStorage.getItem(PALETTE_KEY)
  const known = PALETTES.some((p) => p.id === saved)
  return known ? (saved as PaletteId) : DEFAULT_PALETTE
}

/**
 * App-root providers:
 *  - light/dark theme via `data-theme` on <html> (the design tokens key off it)
 *  - swappable color palette via `data-palette` on <html> (src/styles/palettes.css)
 *  - the sonner <Toaster/> for action feedback (toasts).
 * Both theme + palette persist to localStorage so a chosen look survives refresh.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initTheme)
  const [palette, setPalette] = useState<PaletteId>(initPalette)

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

  const toggle = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"))

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme, palette, setPalette }}>
      {children}
      <PaletteDock />
      <Toaster position="top-right" theme={theme} richColors closeButton />
    </ThemeContext.Provider>
  )
}
