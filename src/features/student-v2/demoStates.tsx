import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { Eye, Layers, RotateCcw, Volume2, X } from "lucide-react"
import type { PackName } from "uisfx"
import { setGazeMode, useGazeMode, type GazeMode } from "@/app/gaze"
import { useMediaQuery } from "@/lib/hooks"
import { cn } from "@/lib/utils"
import { applySound, PACK_LABELS, setSoundEnabled, setSoundPack, useSound } from "./sound"

/**
 * The states each panel of the new space can be in, and a small dock to flip
 * them — so every state the frame DIDN'T draw can still be shown from one
 * screen at any hour of any day.
 *
 * `auto` is always the truth: the store read against the clock. The other
 * values are demo overrides; none of them writes to the store.
 *
 * Like the palette dock, this is a prototype control, not product UI.
 */

export type LiveMode = "auto" | "live" | "soon" | "countdown" | "ended" | "postponed" | "none"
export type FillMode = "auto" | "empty"
/** The documents panel has two more: a crowded week, and everything already taken. */
export type DocsMode = "auto" | "many" | "done" | "empty"

export interface DemoStates {
  live: LiveMode
  calendar: FillMode
  docs: DocsMode
  recent: FillMode
  notifs: FillMode
  /** The player page: a long programme in the list, and an empty comment wall. */
  playlist: "auto" | "many"
  comments: FillMode
  /** The offers page: the élève's real subscription, or none at all. */
  offers: "auto" | "none"
  /** When `live` last changed — a made-up countdown ticks from here. */
  anchor: number
}

type Key = Exclude<keyof DemoStates, "anchor">

const INITIAL: DemoStates = {
  live: "auto",
  calendar: "auto",
  docs: "auto",
  recent: "auto",
  notifs: "auto",
  playlist: "auto",
  comments: "auto",
  offers: "auto",
  anchor: 0,
}

interface Ctx {
  states: DemoStates
  set: <K extends Key>(key: K, value: DemoStates[K]) => void
  reset: () => void
}

const DemoStatesContext = createContext<Ctx | null>(null)

/**
 * A state can also be set from the URL — `?live=countdown&docs=empty` — so a
 * given state is a link you can send, and a screenshot can be taken of it.
 * Unknown keys and values are ignored.
 */
function fromUrl(): Partial<DemoStates> {
  const params = new URLSearchParams(window.location.search)
  const out: Partial<Record<Key, string>> = {}
  for (const row of ROWS) {
    const v = params.get(row.key)
    if (v && row.options.some((o) => o.value === v)) out[row.key] = v
  }
  return out as Partial<DemoStates>
}

/**
 * The mobile gallery shows the space in two phones at once, and flips their
 * states from ONE panel on its own page. The gallery's provider LEADS — it
 * posts every change, and answers a phone that (re)loads and says hello; the
 * providers inside the phones FOLLOW and draw no dock of their own. Same
 * origin, so a BroadcastChannel is the whole wire. Sound and the eyes ride
 * along: they are module state, one copy per window.
 */
export type StatesSync = "lead" | "follow"

const CHANNEL = "wael-v2:states"

interface Snapshot {
  type: "sync"
  states: DemoStates
  sound: { enabled: boolean; pack: PackName }
  gaze: GazeMode
}
type Message = Snapshot | { type: "hello" }

function useStatesSync(sync: StatesSync | undefined, states: DemoStates, apply: (s: DemoStates) => void) {
  const { enabled, pack } = useSound()
  const gaze = useGazeMode()
  const channel = useRef<BroadcastChannel | null>(null)
  const latest = useRef<Snapshot | null>(null)

  useEffect(() => {
    if (!sync || typeof BroadcastChannel === "undefined") return
    const ch = new BroadcastChannel(CHANNEL)
    channel.current = ch
    ch.onmessage = (e: MessageEvent<Message>) => {
      const m = e.data
      if (sync === "lead" && m.type === "hello" && latest.current) ch.postMessage(latest.current)
      if (sync === "follow" && m.type === "sync") {
        apply(m.states)
        applySound(m.sound)
        setGazeMode(m.gaze)
      }
    }
    if (sync === "follow") ch.postMessage({ type: "hello" } satisfies Message)
    return () => {
      ch.close()
      channel.current = null
    }
  }, [sync, apply])

  useEffect(() => {
    const snapshot: Snapshot = { type: "sync", states, sound: { enabled, pack }, gaze }
    latest.current = snapshot
    if (sync === "lead") channel.current?.postMessage(snapshot)
  }, [sync, states, enabled, pack, gaze])
}

export function DemoStatesProvider({ children, sync }: { children: ReactNode; sync?: StatesSync }) {
  const [states, setStates] = useState<DemoStates>(() => ({ ...INITIAL, ...fromUrl(), anchor: Date.now() }))
  const set: Ctx["set"] = (key, value) =>
    setStates((s) => ({ ...s, [key]: value, anchor: key === "live" ? Date.now() : s.anchor }))
  const reset = () => setStates({ ...INITIAL, anchor: Date.now() })
  useStatesSync(sync, states, setStates)
  return (
    <DemoStatesContext.Provider value={{ states, set, reset }}>{children}</DemoStatesContext.Provider>
  )
}

export function useDemoStates(): DemoStates {
  const ctx = useContext(DemoStatesContext)
  if (!ctx) throw new Error("useDemoStates must be used inside <DemoStatesProvider>")
  return ctx.states
}

const ROWS: { key: Key; label: string; options: { value: string; label: string }[] }[] = [
  {
    key: "live",
    label: "الحصّة المباشرة",
    options: [
      { value: "auto", label: "حقيقي" },
      { value: "live", label: "بدات" },
      { value: "soon", label: "تبدا توّا" },
      { value: "countdown", label: "العدّ" },
      { value: "ended", label: "وفات" },
      { value: "postponed", label: "تأجلت" },
      { value: "none", label: "ما فمّاش" },
    ],
  },
  {
    key: "calendar",
    label: "حصص المباشرة",
    options: [
      { value: "auto", label: "حقيقي" },
      { value: "empty", label: "فارغة" },
    ],
  },
  {
    key: "docs",
    label: "التمارين والكور",
    options: [
      { value: "auto", label: "حقيقي" },
      { value: "many", label: "برشا" },
      { value: "done", label: "تحمّلو الكل" },
      { value: "empty", label: "فارغة" },
    ],
  },
  {
    key: "recent",
    label: "آخر الحصص المضافة",
    options: [
      { value: "auto", label: "حقيقي" },
      { value: "empty", label: "فارغة" },
    ],
  },
  {
    key: "notifs",
    label: "الإشعارات",
    options: [
      { value: "auto", label: "حقيقي" },
      { value: "empty", label: "فارغة" },
    ],
  },
  {
    key: "playlist",
    label: "قائمة الفيديوات",
    options: [
      { value: "auto", label: "حقيقي" },
      { value: "many", label: "برشا" },
    ],
  },
  {
    key: "offers",
    label: "العروض",
    options: [
      { value: "auto", label: "حقيقي" },
      { value: "none", label: "بلا اشتراك" },
    ],
  },
  {
    key: "comments",
    label: "التعليقات",
    options: [
      { value: "auto", label: "حقيقي" },
      { value: "empty", label: "فارغة" },
    ],
  },
]

/**
 * Where the controls are drawn: `light` on the app's own surface (the dock
 * inside the space), `dark` on the mobile gallery's petrol ground.
 */
type Tone = "light" | "dark"

const chipClass = (tone: Tone, active: boolean) =>
  cn(
    "min-h-9 rounded-full border px-3 text-[calc(8px*var(--ts))] font-semibold transition",
    tone === "light"
      ? active
        ? "border-transparent bg-v2-grad text-white"
        : "border-v2-ink/15 text-v2-ink/75 hover:border-v2-brand/50 hover:text-v2-ink"
      : active
        ? "border-transparent bg-v2-cta text-v2-on-cta"
        : "border-white/20 text-white/75 hover:bg-white/10 hover:text-white",
  )

const labelClass = (tone: Tone) =>
  cn(
    "mb-1.5 flex items-center gap-1.5 text-[calc(8px*var(--ts))] font-semibold",
    tone === "light" ? "text-v2-ink/70" : "text-white/70",
  )

const hintClass = (tone: Tone) => (tone === "light" ? "font-normal text-v2-ink-2" : "font-normal text-white/45")

/**
 * Sound — on/off and the FEEL, auditioned in place: picking a pack switches
 * the whole space to it and plays a sample, so the twelve can be compared by
 * ear in a few taps. Remembered (see `sound.ts`).
 */
function SoundRow({ tone }: { tone: Tone }) {
  const { enabled, pack } = useSound()
  const chip = (active: boolean) => cn(chipClass(tone, active), "text-[calc(7.5px*var(--ts))]")
  return (
    <div>
      <p className={labelClass(tone)}>
        <Volume2 className="size-4" /> الأصوات <span className={hintClass(tone)}>· UI SFX (CC0)</span>
      </p>
      <div className="flex flex-wrap gap-1.5">
        <button type="button" aria-pressed={enabled} onClick={() => setSoundEnabled(true)} className={chip(enabled)}>
          شاعلة
        </button>
        <button type="button" aria-pressed={!enabled} onClick={() => setSoundEnabled(false)} className={chip(!enabled)}>
          مطفية
        </button>
      </div>
      {enabled && (
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {PACK_LABELS.map((p) => (
            <button
              key={p.pack}
              type="button"
              title={p.hint}
              aria-pressed={pack === p.pack}
              onClick={() => setSoundPack(p.pack)}
              className={cn(chip(pack === p.pack), "px-2")}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Wael's eyes — the app-wide gaze switch (`app/gaze.ts`, also the S key),
 * surfaced here because it is otherwise invisible: it survives a reload, and S
 * is also a demo key on the old dashboard, so it is easy to switch off by
 * accident and then read as "the eyes don't work". The row also names the one
 * thing that silences them without that switch — the system's reduced-motion
 * setting (Windows: « Animation effects » off), which the overlay honours.
 */
function GazeRow({ tone }: { tone: Tone }) {
  const mode = useGazeMode()
  const fine = useMediaQuery("(any-pointer: fine)")
  const calm = useMediaQuery("(prefers-reduced-motion: reduce)")
  const on = mode !== "off"

  return (
    <div>
      <p className={labelClass(tone)}>
        <Eye className="size-4" /> عيون وائل <span className={hintClass(tone)}>· زرّ S</span>
      </p>
      <div className="flex flex-wrap gap-1.5">
        {([true, false] as const).map((value) => (
          <button
            key={String(value)}
            type="button"
            aria-pressed={on === value}
            data-uisfx={value ? "wake" : "sleep"} onClick={() => setGazeMode(value ? (mode === "always" ? "always" : "on") : "off")}
            className={chipClass(tone, on === value)}
          >
            {value ? "تتبّع الفأرة" : "ثابتة"}
          </button>
        ))}
      </div>
      {on && !fine && (
        <p className="mt-1.5 text-[calc(7px*var(--ts))] leading-relaxed text-v2-live-strong">ما تخدمش باللمس — تحتاج فأرة.</p>
      )}
      {on && fine && calm && mode === "on" && (
        <div className="mt-2 rounded-2xl bg-v2-live/[0.08] p-2.5">
          <p className="text-[calc(7px*var(--ts))] leading-relaxed text-v2-live-strong">
            النظام طالب حركة أقل (Animation effects مطفية في Windows)، فالعيون ثابتة.
          </p>
          <button
            type="button"
            data-uisfx="wake" onClick={() => setGazeMode("always")}
            className="mt-1.5 min-h-9 rounded-full bg-v2-cta px-3 text-[calc(7.5px*var(--ts))] font-semibold text-v2-on-cta"
          >
            شغّلها رغم هذا
          </button>
        </div>
      )}
      {mode === "always" && calm && (
        <p className={cn("mt-1.5 text-[calc(7px*var(--ts))] leading-relaxed", tone === "light" ? "text-v2-ink-2" : "text-white/55")}>
          تخدم رغم إعداد « حركة أقل » متاع النظام.
        </p>
      )}
    </div>
  )
}

/** Every row of the panel — the same in the dock and on the gallery page. */
function StatesRows({ tone }: { tone: Tone }) {
  const ctx = useContext(DemoStatesContext)
  if (!ctx) return null
  const { states, set } = ctx
  return (
    <div className="flex flex-col gap-3 p-4">
      <SoundRow tone={tone} />
      <GazeRow tone={tone} />
      {ROWS.map((row) => (
        <div key={row.key}>
          <p className={labelClass(tone)}>{row.label}</p>
          <div className="flex flex-wrap gap-1.5">
            {row.options.map((o) => (
              <button
                key={o.value}
                type="button"
                aria-pressed={states[row.key] === o.value}
                data-uisfx="toggle-on" onClick={() => set(row.key, o.value as never)}
                className={chipClass(tone, states[row.key] === o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/** How many panels are forced off the truth — the dock's badge, the panel's count. */
function useForced(): number {
  const ctx = useContext(DemoStatesContext)
  return ctx ? ROWS.filter((r) => ctx.states[r.key] !== "auto").length : 0
}

/**
 * The panel on the mobile gallery's page — open beside the phones, driving
 * both of them at once (its provider leads, see `StatesSync`). `onClose` only
 * where it is drawn as a drawer, on a screen too narrow to keep it open.
 */
export function StatesPanel({ onClose, className }: { onClose?: () => void; className?: string }) {
  const ctx = useContext(DemoStatesContext)
  const forced = useForced()
  if (!ctx) return null
  return (
    <section
      aria-label="حالات الشاشة"
      className={cn("flex min-h-0 flex-col rounded-3xl border border-white/15 bg-white/[0.04] text-white", className)}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-v2-grad">
            <Layers className="size-4" />
          </span>
          <div>
            <p className="text-[calc(10px*var(--ts))] font-bold">حالات الشاشة</p>
            <p className="text-[calc(7.5px*var(--ts))] text-white/55">
              {forced > 0 ? `${forced} مبدّلة · للهاتفين مع بعض` : "للهاتفين مع بعض — ما يبدّل حتّى داتا."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            data-uisfx="undo" onClick={ctx.reset}
            aria-label="رجّع الكل للحقيقي"
            title="رجّع الكل للحقيقي"
            className="grid size-9 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <RotateCcw className="size-4" />
          </button>
          {onClose && (
            <button
              type="button"
              data-uisfx="close" onClick={onClose}
              aria-label="سكّر"
              className="grid size-9 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto scroll-touch">
        <StatesRows tone="dark" />
      </div>
    </section>
  )
}

/** The floating « حالات » button + popover. Sits under the palette dock. */
export function StatesDock() {
  const ctx = useContext(DemoStatesContext)
  const [open, setOpen] = useState(false)
  const forced = useForced()
  if (!ctx) return null

  return (
    // Above the phone's tab bar, whichever platform drew it: the bar's own
    // height plus the system inset it keeps clear of (see src/app/platform.ts).
    <div className="fixed bottom-[calc(var(--sai-bottom)+6rem)] end-4 z-50 lg:bottom-6 lg:end-6">
      {open && (
        <div
          role="dialog"
          aria-label="حالات الشاشة"
          className="mb-3 max-h-[calc(100dvh-9rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-3xl border border-v2-ink/15 bg-v2-surface text-v2-ink shadow-xl"
        >
          <div className="flex items-center justify-between gap-2 border-b border-v2-ink/10 px-4 py-3">
            <div>
              <p className="text-[calc(10px*var(--ts))] font-bold">حالات الشاشة</p>
              <p className="text-[calc(7.5px*var(--ts))] text-v2-ink-2">نموذج فقط — ما يبدّل حتّى داتا.</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                data-uisfx="undo" onClick={ctx.reset}
                aria-label="رجّع الكل للحقيقي"
                className="grid size-9 place-items-center rounded-full text-v2-ink-2 transition hover:bg-v2-ink/5 hover:text-v2-ink"
              >
                <RotateCcw className="size-4" />
              </button>
              <button
                type="button"
                data-uisfx="close" onClick={() => setOpen(false)}
                aria-label="سكّر"
                className="grid size-9 place-items-center rounded-full text-v2-ink-2 transition hover:bg-v2-ink/5 hover:text-v2-ink"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
          <StatesRows tone="light" />
        </div>
      )}
      <button
        type="button"
        data-uisfx={open ? "close" : "open"} onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="حالات الشاشة"
        className="relative ms-auto grid size-12 place-items-center rounded-full bg-v2-grad text-white shadow-lg transition hover:brightness-105 active:scale-95"
      >
        <Layers className="size-5" />
        {forced > 0 && (
          <span className="absolute -top-1 -end-1 grid size-5 place-items-center rounded-full border-2 border-v2-surface bg-v2-live text-[11px] font-bold">
            {forced}
          </span>
        )}
      </button>
    </div>
  )
}
