import { useState } from "react"
import { Check, Moon, Palette, Sun, X } from "lucide-react"
import { useTheme } from "./providers"
import { PALETTES } from "./palettes"
import { cn } from "@/lib/utils"

/**
 * Floating palette + theme switcher for the experimentation phase.
 *
 * A collapsed round button (bottom-end, clears the mobile bottom bar) opens a
 * small popover listing every palette in the registry plus a light/dark toggle.
 * Selecting one flips `data-palette` / `data-theme` on <html> live — the whole
 * app re-themes through the tokens, no reload. Styled entirely from tokens, so
 * it themes with whatever palette is active.
 *
 * This is a dev/exploration tool; remove it (and its render in providers.tsx)
 * once a palette is chosen.
 */
export function PaletteDock() {
  const { palette, setPalette, theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    // Sits ABOVE the student chat bubble (which owns the bottom corner).
    <div className="fixed bottom-40 end-4 z-50 md:bottom-24 md:end-6">
      {open && (
        <div
          role="dialog"
          aria-label="اختار لوحة ألوان"
          className="mb-3 w-64 overflow-hidden rounded-xl border border-border bg-surface-raised shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="font-display text-sm font-bold text-ink">لوحة الألوان</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="سكّر"
              className="grid size-7 place-items-center rounded-md text-ink-muted transition hover:bg-surface-muted hover:text-ink"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex flex-col gap-1 p-2">
            {PALETTES.map((p) => {
              const active = p.id === palette
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPalette(p.id)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-2.5 py-2 text-start transition",
                    active ? "bg-brand-50" : "hover:bg-surface-muted",
                  )}
                >
                  <span className="flex shrink-0 overflow-hidden rounded-md shadow-sm ring-1 ring-border">
                    {p.swatch.map((c, i) => (
                      <span key={i} className="size-5" style={{ background: c }} />
                    ))}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-sm font-medium", active ? "text-brand-700" : "text-ink")}>
                      {p.name}
                    </span>
                    <span className="block truncate text-[calc(11px*var(--ts))] text-ink-muted">{p.hint}</span>
                  </span>
                  {active && <Check className="size-4 shrink-0 text-brand-600" />}
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
            <span className="text-[calc(13px*var(--ts))] font-medium text-ink-subtle">
              {theme === "dark" ? "غامق" : "فاتح"}
            </span>
            <button
              type="button"
              onClick={toggle}
              aria-label={theme === "dark" ? "دوّر للفاتح" : "دوّر للغامق"}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border-strong bg-surface px-3 text-[calc(13px*var(--ts))] font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              {theme === "dark" ? "فاتح" : "غامق"}
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="لوحة الألوان والثيم"
        aria-expanded={open}
        className="grid size-12 place-items-center rounded-full bg-grad text-ink-inverted shadow-brand transition hover:brightness-105 active:scale-95"
      >
        <Palette className="size-5" />
      </button>
    </div>
  )
}
