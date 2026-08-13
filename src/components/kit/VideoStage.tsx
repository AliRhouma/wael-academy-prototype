import { useCallback, useEffect, useRef, useState } from "react"
import {
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react"
import { formatTime } from "@/data/media"
import { cn } from "@/lib/utils"
import { useFullscreen, type YouTubeController } from "@/lib/youtube"

export interface VideoStageProps {
  /** The controller from `useYouTubePlayer` — owned by the parent, so the page
   *  around the stage can read the current time and seek (notes, chapters…). */
  player: YouTubeController
  title: string
  kindLabel?: string
  context?: string
  /** Position in the playlist (1-based); omit to hide the counter. */
  position?: { index: number; total: number }
  onPrev?: () => void
  onNext?: () => void
  className?: string
  /** Extra control rendered at the end of the bar (e.g. a close button). */
  children?: React.ReactNode
}

const AUTO_HIDE_MS = 2600

/**
 * The video stage: the YouTube frame plus OUR own chrome.
 *
 * The iframe runs with `controls: 0` so the timeline and the vidéo précédente /
 * suivante buttons survive fullscreen — YouTube's native chrome can't be
 * extended, and stepping through a chapter's videos without leaving fullscreen
 * is the whole point. Controls fade while playing and come back on the first
 * pointer move, wheel or key.
 *
 * Presentational on purpose: the player controller is passed IN, so the screen
 * hosting the stage can drive it too (a note jumps to its timestamp).
 */
export function VideoStage({
  player,
  title,
  kindLabel,
  context,
  position,
  onPrev,
  onNext,
  className,
  children,
}: VideoStageProps) {
  const { hostRef, ready, playing, time, duration, muted, toggle, seek, nudge, toggleMute } = player

  const stageRef = useRef<HTMLDivElement | null>(null)
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(stageRef)

  const [uiVisible, setUiVisible] = useState(true)
  const hideTimer = useRef<number | undefined>(undefined)

  const wake = useCallback(() => {
    setUiVisible(true)
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setUiVisible(false), AUTO_HIDE_MS)
  }, [])

  // Paused or not playing yet → controls stay put; there's nothing to hide for.
  useEffect(() => {
    if (!playing) {
      window.clearTimeout(hideTimer.current)
      setUiVisible(true)
      return
    }
    wake()
    return () => window.clearTimeout(hideTimer.current)
  }, [playing, wake])

  const step = useCallback(
    (go?: () => void) => {
      if (!go) return
      go()
      wake()
    },
    [wake],
  )

  /* ---- keyboard ---------------------------------------------------------- */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName
      // Let a focused field own its keys (the page has note & avis fields), and
      // let a focused control button own Space/Enter — otherwise the button
      // click AND this handler both fire.
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
      if (tag === "BUTTON" && (e.key === " " || e.key === "Enter")) return
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault()
          toggle()
          break
        case "ArrowLeft":
          e.preventDefault()
          nudge(5)
          break
        case "ArrowRight":
          e.preventDefault()
          nudge(-5)
          break
        case "n":
          step(onNext)
          break
        case "p":
          step(onPrev)
          break
        case "f":
          toggleFullscreen()
          break
        case "m":
          toggleMute()
          break
        default:
          return
      }
      wake()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [toggle, nudge, step, onNext, onPrev, toggleFullscreen, toggleMute, wake])

  // Leaving a stranded fullscreen behind when the stage unmounts.
  useEffect(() => () => void (document.fullscreenElement && document.exitFullscreen()), [])

  const pct = duration > 0 ? Math.min((time / duration) * 100, 100) : 0

  const stepButton = (dir: "prev" | "next") => {
    const go = dir === "prev" ? onPrev : onNext
    const Icon = dir === "prev" ? SkipBack : SkipForward
    return (
      <button
        type="button"
        onClick={() => step(go)}
        disabled={!go}
        aria-label={dir === "prev" ? "الفيديو اللي قبل" : "الفيديو اللي بعد"}
        className="grid size-9 shrink-0 place-items-center rounded-full text-white/90 transition hover:bg-white/15 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <Icon className="size-[18px]" />
      </button>
    )
  }

  return (
    <div
      ref={stageRef}
      onPointerMove={wake}
      onWheel={wake}
      onTouchStart={wake}
      className={cn(
        "group relative select-none bg-neutral-900",
        isFullscreen ? "h-full w-full" : "aspect-video w-full",
        className,
      )}
    >
      <div ref={hostRef} className="absolute inset-0" />

      {/* Click-to-play surface. Not focusable on purpose — the play button in
          the control bar is the keyboard/AT path, and a focusable layer here
          would swallow the Space shortcut. */}
      <div aria-hidden="true" onClick={toggle} className="absolute inset-0" />

      {/* Big centre play badge while paused — the one obvious action. */}
      {!playing && ready && (
        <button
          type="button"
          onClick={toggle}
          aria-label="شغّل الفيديو"
          className="pointer-events-auto absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-grad text-ink-inverted shadow-brand transition hover:brightness-110 motion-safe:hover:scale-105"
        >
          <Play className="size-7 translate-x-0.5 fill-current" />
        </button>
      )}

      {/* Title strip — the only way to know what's playing in fullscreen. */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 flex items-start gap-3 bg-gradient-to-b from-neutral-900/85 to-transparent p-4 pt-[calc(1rem+env(safe-area-inset-top))] transition-opacity duration-200 sm:pt-4",
          uiVisible ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="min-w-0 flex-1">
          {kindLabel && (
            <p className="text-[calc(11px*var(--ts))] font-medium uppercase tracking-[.12em] text-white/70">
              {kindLabel}
              {context ? ` · ${context}` : ""}
            </p>
          )}
          <p dir="auto" className="truncate font-display text-[calc(15px*var(--ts))] font-bold text-white">
            {title}
          </p>
        </div>
        {position && position.total > 1 && (
          <span className="shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-[calc(11px*var(--ts))] font-medium tabular-nums text-white/80">
            <span className="num">{position.index + 1}/{position.total}</span>
          </span>
        )}
      </div>

      {/* Side steppers — thumb-reachable in fullscreen. */}
      {isFullscreen && (
        <>
          {onPrev && (
            <button
              type="button"
              onClick={() => step(onPrev)}
              aria-label="الفيديو اللي قبل"
              className={cn(
                "absolute start-4 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-neutral-900/60 text-white backdrop-blur transition hover:bg-neutral-900/80",
                uiVisible ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              <ChevronRight className="size-6" />
            </button>
          )}
          {onNext && (
            <button
              type="button"
              onClick={() => step(onNext)}
              aria-label="الفيديو اللي بعد"
              className={cn(
                "absolute end-4 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-neutral-900/60 text-white backdrop-blur transition hover:bg-neutral-900/80",
                uiVisible ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              <ChevronLeft className="size-6" />
            </button>
          )}
        </>
      )}

      {/* Control bar — pinned to dir="ltr". A media transport is a time axis, not
          text: the scrub bar must fill left→right and play/skip must keep their
          universal orientation even in an RTL app. Only the labels are Arabic. */}
      <div
        dir="ltr"
        className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/60 to-transparent px-3 pb-3 pt-8 transition-opacity duration-200 sm:px-4 sm:pb-4",
          uiVisible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {/* Timeline */}
        <div className="relative flex h-4 items-center">
          <div className="absolute inset-x-0 h-1.5 rounded-full bg-white/25" />
          <div className="absolute h-1.5 rounded-full bg-brand-400" style={{ width: `${pct}%` }} />
          <span
            className="absolute size-3.5 -translate-x-1/2 rounded-full bg-white shadow-md transition-transform group-hover:scale-110"
            style={{ insetInlineStart: `${pct}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.5}
            value={time}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="تقدّم الفيديو"
            aria-valuetext={`${formatTime(time)} من ${formatTime(duration)}`}
            className="absolute inset-0 w-full cursor-pointer appearance-none bg-transparent opacity-0"
          />
        </div>

        <div className="mt-2 flex items-center gap-1">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "وقّف" : "شغّل"}
            className="grid size-10 shrink-0 place-items-center rounded-full text-white transition hover:bg-white/15"
          >
            {playing ? (
              <Pause className="size-5 fill-current" />
            ) : (
              <Play className="size-5 translate-x-0.5 fill-current" />
            )}
          </button>
          {stepButton("prev")}
          {stepButton("next")}
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "رجّع الصوت" : "سكّر الصوت"}
            className="hidden size-9 shrink-0 place-items-center rounded-full text-white/90 transition hover:bg-white/15 hover:text-white sm:grid"
          >
            {muted ? <VolumeX className="size-[18px]" /> : <Volume2 className="size-[18px]" />}
          </button>

          <span className="ms-1.5 shrink-0 text-[calc(12px*var(--ts))] font-medium tabular-nums text-white/85">
            {formatTime(time)} <span className="text-white/45">/ {formatTime(duration)}</span>
          </span>

          <span className="flex-1" />

          {children}

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "اخرج من الشاشة الكاملة" : "شاشة كاملة"}
            className="grid size-10 shrink-0 place-items-center rounded-full text-white transition hover:bg-white/15"
          >
            {isFullscreen ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
