import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { useToast } from "@/components/kit/Toast"
import { sfx } from "./sound"

/**
 * « اضغط للتحميل » — there is no real file behind a mock PDF, so a download is
 * a confirmation and a remembered tick. Held at the layout, not per panel, so a
 * file taken from the documents panel reads as taken in the séance's sheet
 * too. UI memory only: it resets on refresh like everything else.
 */
interface Ctx {
  has: (id: string) => boolean
  download: (id: string, name: string) => void
  /** The same toast, for any other « something happened » (joining a live). */
  notify: (message: string) => void
}

const DownloadsContext = createContext<Ctx | null>(null)

export function DownloadsProvider({ children }: { children: ReactNode }) {
  const [taken, setTaken] = useState<Set<string>>(() => new Set())
  // Mirrors `taken` for the click handler — the sound decision must not live in
  // a state updater (React may run those twice).
  const takenRef = useRef(taken)
  takenRef.current = taken
  const { toast, show } = useToast()

  const download = useCallback(
    (id: string, name: string) => {
      // A first download is a small win; taking the same file again is just a tap.
      sfx(takenRef.current.has(id) ? "press" : "success")
      setTaken((prev) => new Set(prev).add(id))
      show(`بدا تحميل « ${name} »`)
    },
    [show],
  )

  return (
    <DownloadsContext.Provider value={{ has: (id) => taken.has(id), download, notify: show }}>
      {children}
      {toast}
    </DownloadsContext.Provider>
  )
}

export function useDownloads(): Ctx {
  const ctx = useContext(DownloadsContext)
  if (!ctx) throw new Error("useDownloads must be used inside <DownloadsProvider>")
  return ctx
}

/**
 * The last file of a list taken by the élève's OWN hand — the list's small
 * victory, and the one celebration a screen gets. Plays `achievement` 380 ms
 * after the download's own `success` has had its moment, and returns the
 * instant it did (0 until then) so the caller fires its burst off the same
 * clock. Never on load, never for a demo state that forces « done » — that
 * is what `live` is for.
 */
export function useAllTaken(done: boolean, live = true): number {
  const was = useRef(done)
  const [at, setAt] = useState(0)
  useEffect(() => {
    if (done && !was.current && live) {
      const t = window.setTimeout(() => {
        sfx("achievement")
        setAt(Date.now())
      }, 380)
      was.current = done
      return () => window.clearTimeout(t)
    }
    was.current = done
  }, [done, live])
  return at
}
