import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { Toaster } from "sonner"

type Theme = "light" | "dark"

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

/** Read the current theme + toggle it. Must be used inside <Providers>. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within <Providers>")
  return ctx
}

/**
 * App-root providers:
 *  - light/dark theme via `data-theme` on <html> (the design tokens key off it)
 *  - the sonner <Toaster/> for action feedback (toasts).
 */
export function Providers({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")

  // Tokens in src/styles/index.css switch on [data-theme="dark"].
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  const toggle = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"))

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
      <Toaster position="top-right" theme={theme} richColors closeButton />
    </ThemeContext.Provider>
  )
}
