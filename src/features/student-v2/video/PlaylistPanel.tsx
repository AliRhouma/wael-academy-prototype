import { useEffect, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { ChevronDown, Maximize2, Minimize2, PanelRightClose, PanelRightOpen, Play } from "lucide-react"
import type { GroupTab, PlayerVideo } from "@/features/student/player/types"
import { cn } from "@/lib/utils"
import { LatinLine } from "../ui"

/**
 * How much room the list takes — the three widths of the player page.
 *   split  the frame: list and player side by side.
 *   list   the list EXPANDED — two columns of fuller rows, the player narrows;
 *          for choosing what to watch next.
 *   video  the reverse — the list folds to a rail of numbers and the video takes
 *          the width; for actually watching.
 */
export type PlaylistMode = "split" | "list" | "video"

export interface PlaylistRow {
  video: PlayerVideo
  /** « هبطت 20 أوت 2026 » */
  published: string
  /** Duration · prof — only shown when the list is expanded. */
  detail?: string
}

/**
 * How long the column takes to change width — the grid track transition in
 * `VideoScreen` runs on the same number. The two-column list waits this long.
 */
export const WIDTH_MS = 500

/** « 02. » — the frame's numbering, pinned LTR so the dot trails the digits. */
const num = (i: number) => `${String(i + 1).padStart(2, "0")}.`

export function PlaylistPanel({
  rows,
  activeId,
  label,
  groups,
  mode,
  onMode,
  wide,
}: {
  rows: PlaylistRow[]
  activeId: string
  label: string
  groups?: { activeId: string; list: GroupTab[] }
  mode: PlaylistMode
  onMode: (mode: PlaylistMode) => void
  /** lg+ — below it there is no side column to fold, only a list to open. */
  wide: boolean
}) {
  // Phone: the list sits under the player in the page's flow; « the reverse »
  // there is simply folding it shut, and a long one opens four at a time.
  const [shut, setShut] = useState(false)
  const [all, setAll] = useState(false)

  /**
   * SMOOTHNESS — why the change of width doesn't jump:
   *
   * - The frame (border, ground, corners) belongs to the column and animates
   *   with it; the content inside keeps a fixed minimum width and is CLIPPED by
   *   the frame rather than squeezed, so no text reflows mid-animation.
   * - Folding crossfades: the list fades out first, the rail fades in once
   *   the column is nearly narrow; opening is the same backwards. Both stay
   *   mounted, so nothing is created or destroyed during the move.
   * - Two columns only once the widening is DONE — switching as it starts would
   *   lay two columns into a panel still half its final width. They arrive with
   *   a short fade instead of popping in.
   */
  const folded = wide && mode === "video"
  const [twoCol, setTwoCol] = useState(mode === "list")
  useEffect(() => {
    if (mode !== "list") {
      setTwoCol(false)
      return
    }
    const t = window.setTimeout(() => setTwoCol(true), WIDTH_MS)
    return () => window.clearTimeout(t)
  }, [mode])

  const expanded = wide && twoCol
  // Folded on a phone: the first four — and always the one playing, wherever it sits.
  const shown = wide || all ? rows : rows.filter((r, i) => i < 4 || r.video.id === activeId)

  return (
    <section className="relative flex min-h-0 flex-col overflow-hidden rounded-3xl border border-v2-ink/15 bg-v2-surface lg:max-h-[calc(100dvh-3rem)]">
      <div
        inert={folded}
        className={cn(
          "flex min-h-0 flex-1 flex-col p-4 transition-opacity md:p-5 lg:min-w-[19rem]",
          // Out FIRST (the column waits for it, see `VideoScreen`); back in only
          // near the end of the widening, when the reflow is already done.
          folded ? "opacity-0 duration-100" : "opacity-100 duration-200 delay-[350ms]",
        )}
      >
        {/* Groupes — the frame's pills: the active one lime, the others outlined. */}
        <div className="flex items-start gap-2">
          {groups && groups.list.length > 0 && (
            <div className="flex min-w-0 flex-1 flex-wrap gap-2">
              {groups.list.map((g) => {
                const active = g.id === groups.activeId
                return (
                  <Link data-uisfx="select"
                    key={g.id}
                    to={g.to}
                    replace
                    title={g.title}
                    className={cn(
                      "inline-flex min-h-11 items-center gap-2 rounded-2xl border px-4 text-[calc(9px*var(--ts))] font-semibold transition 2xl:min-h-14 2xl:px-6 2xl:text-[calc(11px*var(--ts))]",
                      active
                        ? "border-transparent bg-v2-cta text-v2-on-cta"
                        : "border-v2-ink/60 text-v2-ink hover:border-v2-brand hover:text-v2-brand",
                    )}
                  >
                    <bdi>{g.label}</bdi>
                    <span className={cn("text-[calc(7.5px*var(--ts))] tabular-nums", active ? "text-v2-on-cta/70" : "text-v2-ink/50")}>
                      {g.count}
                    </span>
                    {g.mine && <span aria-label="مجموعتي" className="size-1.5 rounded-full bg-v2-brand" />}
                  </Link>
                )
              })}
            </div>
          )}
          <div className="ms-auto flex shrink-0 items-center gap-1">
            {wide ? (
              <>
                <IconToggle
                  sound={expanded ? "collapse" : "expand"}
                  label={expanded ? "رجّع القائمة لقياسها" : "كبّر القائمة"}
                  onClick={() => onMode(expanded ? "split" : "list")}
                >
                  {expanded ? <Minimize2 className="size-[18px]" /> : <Maximize2 className="size-[18px]" />}
                </IconToggle>
                <IconToggle sound="collapse" label="صغّر القائمة — الفيديو ياخو البلاصة" onClick={() => onMode("video")}>
                  <PanelRightClose className="size-5" />
                </IconToggle>
              </>
            ) : (
              <IconToggle sound={shut ? "expand" : "collapse"} label={shut ? "حلّ القائمة" : "سكّر القائمة"} onClick={() => setShut((v) => !v)}>
                <ChevronDown className={cn("size-5 transition", shut && "rotate-180")} />
              </IconToggle>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <h2 className="text-[calc(13px*var(--ts))] font-bold text-v2-ink md:text-[calc(14.5px*var(--ts))] 2xl:text-[calc(17px*var(--ts))]">{label}</h2>
          <span className="text-[calc(8px*var(--ts))] text-v2-ink/50">· {rows.length} فيديو</span>
        </div>

        {!shut && (
          <ol
            key={expanded ? "two" : "one"}
            className={cn(
              "mt-4 min-h-0 flex-1 gap-2 overflow-y-auto pe-3 animate-in fade-in-0 duration-300 [scrollbar-color:var(--v2-brand)_color-mix(in_srgb,var(--v2-brand)_16%,transparent)]",
              expanded ? "grid grid-cols-2 content-start gap-3" : "flex flex-col",
            )}
          >
            {shown.map(({ video, published, detail }) => {
              const i = rows.findIndex((r) => r.video.id === video.id)
              const active = video.id === activeId
              return (
                <li key={video.id} className="min-w-0">
                  <Link data-uisfx="play"
                    to={video.to}
                    replace
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl p-3 transition md:p-4",
                      active ? "bg-v2-live-card" : "hover:bg-v2-ink/[0.035]",
                      expanded && !active && "border border-v2-ink/10",
                    )}
                  >
                    {active ? (
                      <span className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-v2-surface/80 bg-v2-ink/15 text-v2-surface 2xl:size-12">
                        <Play className="size-4 translate-x-[-1px] fill-current" />
                      </span>
                    ) : (
                      <span
                        dir="ltr"
                        className="grid size-10 shrink-0 place-items-center rounded-full bg-v2-brand/20 text-[calc(8px*var(--ts))] font-bold tabular-nums text-v2-ink transition group-hover:bg-v2-grad group-hover:text-white 2xl:size-12 2xl:text-[calc(9.5px*var(--ts))]"
                      >
                        {num(i)}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      {expanded ? (
                        // Expanded, a row has room to say its whole title — two lines, not an ellipsis.
                        <span dir="ltr" className="line-clamp-2 block text-right text-[calc(9.5px*var(--ts))] font-bold leading-snug text-v2-ink 2xl:text-[calc(11px*var(--ts))]">
                          {video.title}
                        </span>
                      ) : (
                        <LatinLine className="text-[calc(9.5px*var(--ts))] font-bold text-v2-ink md:text-[calc(10.5px*var(--ts))] 2xl:text-[calc(13px*var(--ts))]">
                          {video.title}
                        </LatinLine>
                      )}
                      <span className="mt-0.5 block truncate text-[calc(7.5px*var(--ts))] text-v2-ink/60 2xl:text-[calc(9px*var(--ts))]">{published}</span>
                      {expanded && detail && (
                        <span className="mt-0.5 block truncate text-[calc(7.5px*var(--ts))] text-v2-ink/50">{detail}</span>
                      )}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ol>
        )}

        {!wide && !shut && rows.length > 4 && (
          <button
            type="button"
            data-uisfx={all ? "collapse" : "expand"} onClick={() => setAll((v) => !v)}
            className="mt-2 min-h-11 rounded-full text-[calc(8.5px*var(--ts))] font-semibold text-v2-brand transition hover:bg-v2-brand/10"
          >
            {all ? "صغّر" : `شوف الكل (${rows.length})`}
          </button>
        )}
      </div>

      {wide && <Rail rows={rows} activeId={activeId} onOpen={() => onMode("split")} shown={folded} />}
    </section>
  )
}

function IconToggle({
  label,
  onClick,
  sound,
  children,
}: {
  label: string
  onClick: () => void
  /** The uisfx cue this toggle answers with. */
  sound: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      data-uisfx={sound}
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid size-11 place-items-center rounded-full border border-v2-ink/15 text-v2-ink/70 transition hover:border-v2-brand/50 hover:text-v2-brand"
    >
      {children}
    </button>
  )
}

/** The list folded: one number per video, the playing one on the ramp. */
function Rail({
  rows,
  activeId,
  onOpen,
  shown,
}: {
  rows: PlaylistRow[]
  activeId: string
  onOpen: () => void
  shown: boolean
}) {
  return (
    // Pinned to the START edge at the rail's own width, so it never stretches
    // with the column while that animates — it only fades.
    <div
      inert={!shown}
      className={cn(
        "absolute inset-y-0 start-0 flex w-[5.5rem] flex-col items-center gap-3 px-2 py-4 transition-opacity",
        shown ? "opacity-100 duration-200 delay-[380ms]" : "pointer-events-none opacity-0 duration-100",
      )}
    >
      <IconToggle sound="expand" label="حلّ القائمة" onClick={onOpen}>
        <PanelRightOpen className="size-5" />
      </IconToggle>
      <span className="text-[calc(7px*var(--ts))] text-v2-ink/50">{rows.length}</span>
      <ol className="flex min-h-0 flex-col items-center gap-2 overflow-y-auto px-1 pb-1 [scrollbar-width:none]">
        {rows.map(({ video }, i) => {
          const active = video.id === activeId
          return (
            <li key={video.id}>
              <Link data-uisfx="play"
                to={video.to}
                replace
                title={video.title}
                aria-label={video.title}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "grid size-11 place-items-center rounded-full text-[calc(7.5px*var(--ts))] font-bold tabular-nums transition",
                  active
                    ? "bg-v2-grad text-white shadow-md shadow-v2-brand/30"
                    : "bg-v2-brand/15 text-v2-ink hover:bg-v2-brand/30",
                )}
              >
                {active ? <Play className="size-4 translate-x-[-1px] fill-current" /> : <span dir="ltr">{num(i)}</span>}
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
