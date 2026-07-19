import { useCallback, useEffect, useState } from "react"
import { CheckCircle2 } from "lucide-react"

/**
 * Minimal transient confirmation — a soft pill that fades in bottom-center and
 * auto-dismisses. Sits above the mobile tab bar (safe-area padded). Purely for
 * "something happened" feedback after an add / edit / delete; no queue, one at a
 * time. Use via `useToast()`: render `toast` in the tree, call `show("…")`.
 */
export function useToast() {
  const [state, setState] = useState<{ id: number; message: string } | null>(null)

  const show = useCallback((message: string) => {
    setState({ id: Date.now() + Math.floor(performance.now()), message })
  }, [])

  useEffect(() => {
    if (!state) return
    const t = setTimeout(() => setState(null), 2400)
    return () => clearTimeout(t)
  }, [state])

  const toast = state ? (
    <div
      key={state.id}
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+1.25rem))] md:pb-8"
    >
      <div className="flex items-center gap-2.5 rounded-full border border-border bg-surface-raised px-4 py-2.5 text-sm font-medium text-ink shadow-lg motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-200">
        <span className="grid size-5 place-items-center rounded-full bg-success-50 text-success-600">
          <CheckCircle2 className="size-3.5" />
        </span>
        {state.message}
      </div>
    </div>
  ) : null

  return { show, toast }
}
