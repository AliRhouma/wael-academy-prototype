import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react"
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
