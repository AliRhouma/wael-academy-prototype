import { Link } from "react-router-dom"
import { Clock3, Play, Sparkles } from "lucide-react"
import { durationLabel } from "@/features/student/seances/replays"
import { seanceVideoPath } from "@/features/student/player/links"
import { addedLabel } from "@/features/student/dashboard/dashboard"
import { PIN, PaperNote, paper, pinAt } from "@/components/kit/PaperNote"
import type { Session } from "@/data/types"
import { useData } from "@/stores/useData"

/**
 * « آخر الحصص المضافة » — the replays that went online in the last few days,
 * as a rail the élève flicks through.
 *
 * A rail rather than a list on purpose: this is browsing, not a task. It costs
 * one row of the page at any width, it never competes with the خدمة above it
 * for attention, and a card that is half-cut at the edge is the affordance that
 * says "there's more, push me" — no arrows needed on touch.
 *
 * Each replay is a note pinned to a board (`PaperNote`, from `svg icons/sessions
 * card.svg`) rather than a plain surface card: the section is "what just went
 * up", and a pinned sheet says that before a word is read. The pin colour cycles
 * down the rail so the row reads as six separate notes instead of one striped
 * block — the same trick the reference board uses.
 *
 * No thumbnails: a YouTube still is somebody else's crop of a whiteboard, it
 * says nothing a title doesn't say better, and it made the whole rail depend on
 * a third-party image loading. The play chip carries the "this is a video"
 * signal, and it lights up on hover so the card still answers a pointer.
 *
 * Colour note: the note takes the palette now (see `paper`), so everything inked
 * on it reads `--paper-ink` from the sheet — which IS the theme's ink, and flips
 * with dark mode. The one thing that stays fixed is the pin: six hand-picked
 * heads, so the rail reads as separate notes rather than one striped block.
 *
 * Referenced for spacing & density: HomeworkCard (rail card shell + footer),
 * SeanceCard (label → title → meta order), ChapitresTab (video card meta).
 */
export function RecentSeances({ sessions, now }: { sessions: Session[]; now: Date }) {
  const subjects = useData((s) => s.subjects)

  return (
    <ul
      className="flex gap-3.5 overflow-x-auto scroll-touch pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ scrollSnapType: "x proximity" }}
    >
      {sessions.map((session, i) => {
        const subject = subjects.find((s) => session.subjectIds.includes(s.id))
        const duration = durationLabel(session.startTime, session.endTime)
        const added = session.publishedAt ? addedLabel(session.publishedAt, now) : ""
        // Brand-new today deserves the gold seal; two days old is just a card.
        const fresh = added === "تزادت اليوم"
        const pin = pinAt(i)
        const hue = PIN[pin]

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
              className="group block h-full rounded-[11px] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {/* pt-8 clears the needle and the brown rim around it (PIN_DEPTH) */}
              <PaperNote pin={pin} className="h-full" sheetClassName="px-3.5 pb-3 pt-8">
                <span className="flex items-center gap-2.5">
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-md transition group-hover:shadow-sm"
                    style={{
                      background: `color-mix(in srgb, ${hue} 16%, ${paper.sheetLit})`,
                      border: `1.5px solid color-mix(in srgb, ${hue} 45%, transparent)`,
                      color: hue,
                    }}
                  >
                    <Play className="size-4 translate-x-px fill-current" />
                  </span>
                  {subject && (
                    <span
                      dir="auto"
                      className="min-w-0 flex-1 truncate text-[calc(11px*var(--ts))] font-semibold uppercase tracking-[.08em]"
                      style={{ color: hue }}
                    >
                      {subject.name}
                    </span>
                  )}
                </span>

                <span
                  dir="auto"
                  className="mt-2.5 block font-display text-[calc(13.5px*var(--ts))] font-bold leading-snug line-clamp-2"
                  style={{ color: "var(--paper-ink)" }}
                >
                  {session.title}
                </span>

                {/* pl-, not ps-: the dog-ear is physically bottom-left in both
                    directions — it's part of the drawing, not a layout edge. */}
                <span
                  className="mt-auto flex items-center gap-2 pl-12 pt-2.5 text-[calc(11px*var(--ts))]"
                  style={{ color: "var(--paper-ink-muted)" }}
                >
                  {fresh ? (
                    <span
                      className="inline-flex shrink-0 items-center gap-1 font-semibold"
                      style={{ color: paper.ink }}
                    >
                      <Sparkles className="size-3" style={{ color: PIN.gold }} />
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
                </span>
              </PaperNote>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
