import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight, Clock3, Play } from "lucide-react"
import { durationLabel } from "@/features/student/seances/replays"
import { seanceVideoPath } from "@/features/student/player/links"
import { addedLabel } from "@/features/student/dashboard/dashboard"
import { subjectTheme } from "@/features/student/subjectTheme"
import { subjectTint } from "@/features/student/subjectTint"
import type { Session } from "@/data/types"
import { edgeMask, useScrollEdges } from "@/lib/hooks"
import { cn } from "@/lib/utils"
import { useData } from "@/stores/useData"

/**
 * « آخر الحصص المضافة » — the replays that went online in the last few days,
 * as a rail the élève flicks through.
 *
 * A rail rather than a list on purpose: this is browsing, not a task. It costs
 * one row of the page at any width, it never competes with the خدمة above it
 * for attention, and a card that is half-cut at the edge is the affordance that
 * says "there's more, push me".
 *
 * Each replay is a PLAIN CARD — surface, hairline border, generous radius — the
 * same container the matières grid and the séance lists use. It used to be a
 * note pinned to a board (`PaperNote`, from `svg icons/sessions card.svg`), with
 * a pin colour cycling down the rail. That was one drawn object too many: the
 * page above it is already five framed panels and a character, and six pinned
 * sheets under them made the bottom of the screen the busiest part of it. The
 * board reads as a quiet shelf now, which is what a browsing row should be.
 *
 * The colour that survived the change is the one that MEANS something: each
 * card's play chip and label take the matière's own tint, so a card is coloured
 * by its subject rather than by its position in the row.
 *
 * No thumbnails: a YouTube still is somebody else's crop of a whiteboard, it
 * says nothing a title doesn't say better, and it made the whole rail depend on
 * a third-party image loading. The play chip carries the "this is a video"
 * signal, and the card answers a pointer by lifting.
 *
 * Referenced for spacing & density: SeancesScreen (the card shell — border,
 * radius, hover lift), HomeworkCard (rail card footer), SeanceCard (label →
 * title → meta order).
 */
/**
 * The two nudges that sit over the rail from `md` up.
 *
 * They are PHYSICAL — one scrolls left, one scrolls right, and each wears the
 * arrow for the way it goes — because a rail under `dir="rtl"` starts at the
 * right, and a « next » arrow would point at whichever side you happened to
 * think in. Below `md` they are not drawn at all: the half-cut card is the
 * affordance on touch, and a floating button over a scroller you flick is
 * something to hit by accident.
 *
 * Shape is the system's stepper — a small plate on the surface, not a filled
 * brand button. This is navigation inside a section, not an action on the page.
 *
 * Hidden from assistive tech, and out of the tab order, on purpose: the rail is
 * a plain scroller and every card in it is already a link that can be tabbed
 * to, so these two would add a stop that says nothing. They are a pointer
 * convenience, no more.
 */
function RailNudge({
  side,
  show,
  onClick,
}: {
  side: "left" | "right"
  show: boolean
  onClick: () => void
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={-1}
      aria-hidden
      className={cn(
        "absolute top-[calc(50%-6px)] z-10 hidden size-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface text-ink-subtle shadow-sm transition hover:border-brand-200 hover:text-brand-600 md:grid",
        show ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      style={{ [side]: 0 }}
    >
      <Icon className="size-4" />
    </button>
  )
}

export function RecentSeances({ sessions, now }: { sessions: Session[]; now: Date }) {
  const subjects = useData((s) => s.subjects)
  // The scrollbar is hidden, so without this the rail has no way of saying
  // whether the card at the edge is the last one or the fifth of nine.
  const { ref, edges } = useScrollEdges<HTMLUListElement>("x", sessions.length)

  // Four fifths of a screenful, so a card the eye was already on stays on
  // screen and the jump has something to land against.
  const nudge = (dir: -1 | 1) => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" })
  }

  return (
    <div className="relative">
      <RailNudge side="left" show={edges.before} onClick={() => nudge(-1)} />
      <RailNudge side="right" show={edges.after} onClick={() => nudge(1)} />
      <ul
        ref={ref}
        // `pt-1` is the hover lift's headroom, and it is not optional: this
        // scroller is `overflow-x-auto` (which forces `overflow-y: auto`) AND
        // carries a mask, and BOTH clip to the box. Without the padding a card
        // rising 3px has its top border and corners shaved flat for exactly as
        // long as the cursor is on it.
        className="flex gap-3 overflow-x-auto scroll-touch pb-1 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        // The cut edge fades only while there IS something behind it, so the
        // first card is never dimmed for no reason.
        style={{ scrollSnapType: "x proximity", ...edgeMask("x", edges) }}
      >
        {sessions.map((session) => {
          const subject = subjects.find((s) => session.subjectIds.includes(s.id))
          const duration = durationLabel(session.startTime, session.endTime)
          const added = session.publishedAt ? addedLabel(session.publishedAt, now) : ""
          // Brand-new today deserves the gold seal; two days old is just a card.
          const fresh = added === "تزادت اليوم"
          const theme = subjectTheme(subject?.category)
          const tint = subjectTint(subject?.name ?? "", subject?.category)

          return (
            <li
              key={session.id}
              className="w-[14.5rem] shrink-0 md:w-[15.5rem]"
              style={{ scrollSnapAlign: "start" }}
            >
              <Link
                to={seanceVideoPath(session.id, {
                  subjectId: subject?.id,
                  groupId: session.groupIds[0],
                })}
                className="group flex h-full flex-col rounded-[16px] border border-border bg-surface p-3.5 outline-none transition duration-200 hover:border-brand-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-safe:hover:-translate-y-[3px]"
              >
                <span className="flex items-center gap-2.5">
                  {/* NO drawing here. A replay is picked by its TITLE — the row
                      below — and a strip of cards each carrying the same face at
                      40px turned the board into a row of thumbnails of one man.
                      The matière still names itself, in its own colour, which is
                      all this line was ever doing. A séance with no matière keeps
                      the tinted play plate, so its header is not empty. */}
                  {subject ? (
                    <span
                      dir="auto"
                      className={cn(
                        "min-w-0 flex-1 truncate text-[calc(11px*var(--ts))] font-semibold uppercase tracking-[.08em]",
                        theme.name,
                      )}
                    >
                      {subject.name}
                    </span>
                  ) : (
                    <span
                      className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-[12px]"
                      style={{ backgroundImage: tint.gradient }}
                    >
                      <Play className={cn("size-4 translate-x-px fill-current", theme.icon)} />
                    </span>
                  )}
                </span>

                <span
                  dir="auto"
                  className="mt-2.5 line-clamp-2 block font-display text-[calc(13.5px*var(--ts))] font-bold leading-snug text-ink"
                >
                  {session.title}
                </span>

                <span className="mt-auto flex items-center gap-2 pt-2.5 text-[calc(11px*var(--ts))] text-ink-muted">
                  {fresh ? (
                    // A badge, not a line of meta: « جديدة » is the one thing
                    // in this row that expires, and on the red it is read
                    // before the two grey facts beside it. No glyph — at 10px
                    // a sparkle is a speck, and the word is already short.
                    <span className="inline-flex shrink-0 items-center rounded-full bg-danger-500 px-1.5 py-0.5 text-[calc(10px*var(--ts))] font-bold leading-none text-white">
                      جديدة
                    </span>
                  ) : (
                    <span className="truncate">{added}</span>
                  )}
                  {duration && (
                    <>
                      <span aria-hidden>·</span>
                      <span className="inline-flex shrink-0 items-center gap-1 tabular-nums">
                        <Clock3 className="size-3" />
                        {duration}
                      </span>
                    </>
                  )}
                  {/* The play affordance moved here, small and at the end: the
                      card is a link, and the plate is the matière's now. */}
                  <span className="ms-auto inline-flex shrink-0 items-center text-brand-600 transition group-hover:text-brand-700">
                    <Play className="size-3 fill-current" />
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
