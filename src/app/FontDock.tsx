import { useState } from "react"
import { Check, Type, X } from "lucide-react"
import { useTheme } from "./providers"
import { FONTS } from "./fonts"
import { cn } from "@/lib/utils"

/**
 * Floating typeface switcher for the experimentation phase — the PaletteDock's
 * twin, one notch higher in the same corner.
 *
 * A collapsed round button opens a popover listing every face in the registry.
 * Selecting one flips `data-font` on <html>; the two live type slots
 * (`--ui-display` / `--ui-sans`, see src/styles/fonts.css) are re-pointed and
 * the whole app re-types, no reload.
 *
 * Each row draws its OWN specimen in its OWN face — a name in the wrong font
 * tells you nothing, so the sample carries both Arabic and Latin (the pair a
 * mixed ar-TN interface actually has to set). The Latin half also exposes a
 * face that ships no Latin: it falls back visibly instead of silently.
 *
 * This is a dev/exploration tool; remove it (and its render in providers.tsx)
 * once a typeface is chosen.
 */
export function FontDock() {
  const { font, setFont } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    // One step above the PaletteDock, which itself clears the chat bubble.
    <div className="fixed bottom-56 end-4 z-50 md:bottom-40 md:end-6">
      {open && (
        <div
          role="dialog"
          aria-label="اختار خطّ"
          className="mb-3 w-72 overflow-hidden rounded-xl border border-border bg-surface-raised shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="font-display text-sm font-bold text-ink">الخطّ</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="سكّر"
              className="grid size-7 place-items-center rounded-md text-ink-muted transition hover:bg-surface-muted hover:text-ink"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex max-h-[60dvh] flex-col gap-1 overflow-y-auto scroll-touch p-2">
            {FONTS.map((f) => {
              const active = f.id === font
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFont(f.id)}
                  aria-pressed={active}
                  className={cn(
                    "flex flex-col gap-1 rounded-md px-2.5 py-2 text-start transition",
                    active ? "bg-brand-50" : "hover:bg-surface-muted",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate text-sm font-medium",
                        active ? "text-brand-700" : "text-ink",
                      )}
                    >
                      {f.name}
                    </span>
                    {f.caveat && (
                      <span className="shrink-0 rounded-full bg-warning-50 px-1.5 py-0.5 text-[calc(10px*var(--ts))] font-medium text-warning-700">
                        {f.caveat}
                      </span>
                    )}
                    {active && <Check className="size-4 shrink-0 text-brand-600" />}
                  </span>

                  {/* The specimen. `dir="auto"` per half so the Arabic sets RTL
                      and the Latin sets LTR inside the same row. */}
                  <span
                    className="block truncate text-[calc(19px*var(--ts))] leading-[1.7] text-ink"
                    style={{ fontFamily: f.preview }}
                  >
                    <span dir="auto">أهلا وائل</span>{" "}
                    <span dir="ltr" className="text-ink-subtle">
                      Wael 123
                    </span>
                  </span>

                  <span className="block truncate text-[calc(11px*var(--ts))] text-ink-muted">{f.hint}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="بدّل الخطّ"
        aria-expanded={open}
        className="grid size-12 place-items-center rounded-full border border-border-strong bg-surface text-ink-subtle shadow-lg transition hover:border-brand-200 hover:text-brand-600 active:scale-95"
      >
        <Type className="size-5" />
      </button>
    </div>
  )
}
