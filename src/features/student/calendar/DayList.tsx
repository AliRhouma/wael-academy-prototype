import { useState } from "react"
import {
  CalendarOff,
  ChevronRight,
  ChevronLeft,
  Hourglass,
  PlayCircle,
  Video,
} from "lucide-react"
import { CreamPanel, cream } from "@/components/kit/CreamPanel"
import { HomeworkDocsButton } from "@/features/student/HomeworkDocsButton"
import { PanelEmpty } from "@/features/student/dashboard/PanelEmpty"
import {
  STATE_LABEL,
  cardTiming,
  sessionState,
  useHomeworkBySession,
  useSessionVisual,
} from "@/features/student/calendar/schedule"
import { cn, formatSessionDayLong, formatTimeRange } from "@/lib/utils"
import type { Session } from "@/data/types"
import { useData } from "@/stores/useData"

export interface DayListProps {
  /** "YYYY-MM-DD" of the day shown. */
  day: string
  sessions: Session[]
  now: Date
  isToday: boolean
  /** The séance the élève is heading towards, if it falls on this day. */
  nextId?: string
  onPickDay: (day: string) => void
  /** Join a séance of today — the card's own action. */
  onJoin: (session: Session) => void
  /** Open the replay of a séance already given, where there is one. */
  onWatchRecording: (session: Session) => void
  className?: string
}

/**
 * Élève — the séances of ONE day, the panel the month grid feeds.
 *
 * The grid answers « quand », this answers « quoi » — so everything the cells
 * gave up lives here, in words: la matière, l'heure, le prof, l'état, et le
 * travail à rendre.
 *
 * THE CARD IS THE WHOLE THING — there is no fiche behind it any more. Opening a
 * modal to read four lines the card had already shown, and to reach two buttons
 * the card can carry itself, was a click charged for nothing. So the actions
 * moved out onto the card (rejoindre, les exercices, le replay) and the sheet
 * came out. What it alone used to say — la salle, la description — is gone with
 * it, and neither was information the élève came to this page for.
 *
 * It replaces the hour-axis timeline that used to be the day view. A time axis
 * is worth its height when a day is dense and overlapping; an élève's day is two
 * or three séances, and the axis spent most of the page drawing the four empty
 * hours between them. A list says the same thing in a third of the room and
 * leaves the rest of the page to the month.
 *
 * The card is the dashboard's agenda row, grown by a line: same
 * border-as-state trick, same matière dot leading it — and it is the SAME dot
 * the grid draws, in the same colour, which is what ties the two halves of the
 * page together. (It carried the matière's badge for a while. Six medallions
 * beside forty in the grid made a calendar that read like a sticker album; the
 * art has room to be art in the fiche a click opens.)
 *
 * Referenced for spacing & density: WeekAgenda (row shape, cream inks),
 * MonthGrid (matière dots, selection colours), PdfModal (the documents sheet).
 */
export function DayList({
  day,
  sessions,
  now,
  isToday,
  nextId,
  onPickDay,
  onJoin,
  onWatchRecording,
  className,
}: DayListProps) {
  const date = new Date(`${day}T00:00:00`)
  const shift = (delta: number) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta)
    onPickDay(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
    )
  }

  const navBtn =
    "grid size-8 shrink-0 place-items-center rounded-full transition hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"

  return (
    <CreamPanel className={className} bodyClassName="gap-3 p-4 md:p-5">
      <div className="flex items-start gap-1">
        <div className="min-w-0 flex-1">
          <h2
            className="font-display text-[calc(16px*var(--ts))] font-bold leading-tight first-letter:uppercase md:text-[calc(18px*var(--ts))]"
            style={{ color: cream.ink }}
          >
            {isToday ? "اليوم" : formatSessionDayLong(day)}
          </h2>
          <p className="mt-0.5 text-[calc(11.5px*var(--ts))]" style={{ color: cream.inkMuted }}>
            {isToday && <span className="me-1">{formatSessionDayLong(day)} ·</span>}
            {sessions.length === 0 ? "ما فماش حصص" : `${sessions.length} حصّة`}
          </p>
        </div>

        {/* Step off the day without going back to the grid — the two arrows are
            the whole navigation this panel needs. */}
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="النهار اللي قبل"
            className={navBtn}
            style={{ color: cream.inkMuted }}
          >
            <ChevronRight className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            aria-label="النهار اللي بعد"
            className={navBtn}
            style={{ color: cream.inkMuted }}
          >
            <ChevronLeft className="size-5" />
          </button>
        </div>
      </div>

      {sessions.length === 0 ? (
        // ONE LINE, and it is the fact itself. « نهار فاضي » was a heading over
        // a sentence that then said the same thing twice — and the second half
        // of it (« اختار نهار آخر ») told the élève to do the very thing they
        // had just done to get here. The day the panel is showing is named in
        // its own title row above; this only has to say what is in it.
        <PanelEmpty icon={CalendarOff} title={isToday ? "ما فماش حصص اليوم" : "ما فماش حصص"} />
      ) : (
        <ul className="flex flex-col gap-2">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              now={now}
              isToday={isToday}
              nextId={nextId}
              onJoin={onJoin}
              onWatchRecording={onWatchRecording}
            />
          ))}
        </ul>
      )}

    </CreamPanel>
  )
}

/**
 * ONE séance, as a card that can be pressed anywhere.
 *
 * A component of its own rather than a block inside `DayList`'s `.map`, because
 * it needs state (the documents sheet) and a hook can't be called in a loop.
 *
 * THE WHOLE CARD IS THE PRIMARY ACTION. The buttons on it stay — they name what
 * they do, and naming it is half of what makes the élève press it — but the card
 * around them is now a target for the SAME thing, through a stretched button
 * underneath the content. On a phone that turns a 44px button into a 90px card,
 * which is the difference between aiming and tapping.
 *
 * Which action the card takes is the one the card is offering, in the order the
 * day makes them true: rejoindre (today), sinon le replay (already given, and
 * published), sinon les documents. A séance with none of the three — reportée,
 * or given with nothing published and nothing to hand out — is not a target at
 * all, and it doesn't pretend to be: no lift, no pointer, nothing to press.
 */
function SessionCard({
  session,
  now,
  isToday,
  nextId,
  onJoin,
  onWatchRecording,
}: {
  session: Session
  now: Date
  isToday: boolean
  nextId?: string
  onJoin: (session: Session) => void
  onWatchRecording: (session: Session) => void
}) {
  const visual = useSessionVisual()
  const homeworkOf = useHomeworkBySession()
  const teachers = useData((s) => s.teachers)
  /** The documents sheet is CONTROLLED here, so the card can open it too. */
  const [docsOpen, setDocsOpen] = useState(false)

  const { subjectName, tint } = visual(session)
  const state = sessionState(session, now)
  const done = state === "terminee"
  const live = state === "en-cours"
  const off = state === "reportee"
  const isNext = session.id === nextId && !live && !off
  const homeworks = homeworkOf(session)
  const teacher = teachers.find((t) => t.id === session.teacherId)
  /*
   * ONE primary action per card, and which one is a question of WHEN.
   * Today → the door, whatever hour it is: a séance whose slot has just passed
   * is still the one the élève is asking about, and the prototype has no
   * business deciding the room shut at 10:30 sharp. Any other day, once it is
   * behind them → the replay, where there is one. A séance reportée has
   * neither, which is the point of saying so on the card.
   */
  const canJoin = isToday && !off
  const canReplay = !canJoin && done && Boolean(session.recordingUrl)
  // Given, and nothing to watch yet. The élève asks « et le replay ? » of every
  // séance that has ended, and a card that answers with an empty row lets them
  // think they missed the button. Saying « pas encore » IS the answer; a
  // greyed-out play button would be a promise about when.
  const noReplayYet = done && !session.recordingUrl
  // The docs button renders itself away when there is nothing to hand over, so
  // the action row only has to know whether it COULD appear — otherwise an
  // empty row keeps its top margin.
  const canDocs = homeworks.some((h) => h.pdfs.length > 0)
  const docsLabel = done ? "وثائق الحصة" : "تمارين لازم تخدمهم"

  /** What pressing the card does, and what to call it out loud. */
  const activate = canJoin
    ? { run: () => onJoin(session), label: live ? "ادخل توّا" : "ادخل للحصّة" }
    : canReplay
      ? { run: () => onWatchRecording(session), label: "شوف التسجيل" }
      : canDocs
        ? { run: () => setDocsOpen(true), label: docsLabel }
        : null

  /** The state colour the card wears, or null for a card with nothing to say. */
  const edge = live
    ? "border-[var(--danger-500)]"
    : off
      ? "border-[var(--accent-500)]"
      : isNext
        ? "border-[var(--brand-500)]"
        : null

  return (
    <li
      className={cn(
        "group relative flex items-start gap-2.5 rounded-[16px] border-2 px-3 py-2.5",
        "bg-[var(--surface)] transition duration-150",
        "focus-within:ring-2 focus-within:ring-[var(--ring)]/40",
        // EVERY colour here is a class, never an inline style: an inline
        // `background` or `borderColor` outranks any `hover:` the cascade can
        // offer, and this card's whole point is that it reacts.
        edge ?? "border-[var(--brand-200)]",
        activate && [
          "cursor-pointer",
          "hover:bg-[color-mix(in_srgb,var(--brand-500)_6%,var(--surface))]",
          "hover:shadow-[0_10px_20px_-12px_color-mix(in_srgb,var(--brand-700)_60%,transparent)]",
          "motion-safe:hover:-translate-y-0.5",
          // A card already wearing a state keeps its colour on hover — the
          // border is saying « en cours », not « survolé ». Only the quiet ones
          // deepen.
          !edge && "hover:border-[var(--brand-400)]",
        ],
      )}
    >
      {/*
        THE CARD AS A TARGET. Stretched over the row rather than wrapped around
        it: absolutely positioned, so it paints (and catches the pointer) above
        the static content, while the real buttons below lift over it with
        `z-10`. That is what lets the card and its buttons both take a click
        without a button ever nesting inside another.
      */}
      {activate && (
        <button
          type="button"
          onClick={activate.run}
          aria-label={`${activate.label} — ${session.title}`}
          className="absolute inset-0 rounded-[14px] focus:outline-none"
        />
      )}

      {/* The matière, as the grid says it. Pulsing while it runs, HOLLOW once it
          is off — the same ring the month cell draws, so a séance reportée looks
          the same wherever it is met. */}
      <span
        className={cn("mt-1 size-2.5 shrink-0 rounded-full", live && "motion-safe:animate-pulse")}
        style={
          off
            ? { boxShadow: `inset 0 0 0 2px ${tint.dot}` }
            : { background: live ? "var(--danger-500)" : tint.dot }
        }
      />

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              "shrink-0 text-[calc(12px*var(--ts))] font-bold tabular-nums",
              // The slot is still what the élève had written down — struck,
              // because nothing is happening in it.
              off && "line-through decoration-1",
            )}
            style={{
              color: live ? "var(--danger-600)" : off ? cream.inkMuted : "var(--brand-600)",
            }}
          >
            <span className="num">{formatTimeRange(session.startTime, session.endTime)}</span>
          </span>
          {/*
            THE STATE — and only when there is one worth reading. A séance still
            to come says nothing at all: « مبرمجة » on every future card is a
            word repeated down the whole list for the days it is NOT true, and
            those are the three that are marked. Silence is the normal case.
          */}
          {state !== "prevue" && (
            <span
              className={cn(
                "shrink-0 rounded-full px-1.5 py-px text-[calc(10px*var(--ts))] font-bold",
                live && "bg-danger-50 text-danger-700",
                off && "bg-accent2-50 text-accent2-700",
                // Red, like the séance running: the two are the states of the
                // day the élève is IN, and the tag is the only thing on the card
                // that says so now that the title no longer fades. They never
                // collide — one séance can't be both, and the words differ.
                done && "bg-danger-50 text-danger-700",
              )}
            >
              {live ? "دايرة توّا" : STATE_LABEL[state]}
            </span>
          )}
        </span>

        {/* THE SAME TITLE IN EVERY STATE — full ink, full weight, whether the
            séance is coming, gone or called off. It used to fade out once it was
            behind the élève, and a faded line reads as « moins important » when
            what it actually is, is « déjà fait » — a thing the élève may well
            want to find again. The tag says which state it is; the title is not
            the place to say it twice. */}
        <span
          dir="auto"
          title={session.title}
          className="truncate font-display text-[calc(13.5px*var(--ts))] font-bold leading-tight"
          style={{ color: cream.ink }}
        >
          {subjectName ?? session.title}
        </span>

        <span
          dir="auto"
          className="truncate text-[calc(11px*var(--ts))]"
          style={{ color: cream.inkMuted }}
        >
          {[teacher?.name, live || isNext ? cardTiming(session, now) : null]
            .filter(Boolean)
            .join(" · ")}
        </span>

        {/*
          WHAT THE ÉLÈVE CAN DO WITH IT, spelled out. `z-10` lifts these over the
          card's own target, so each takes its own click — and the first of them
          does the same thing the card does, on purpose: the button NAMES the
          action, the card just makes it a bigger place to press.
        */}
        {(canJoin || canReplay || noReplayYet || canDocs) && (
          <span className="relative z-10 mt-2 flex flex-wrap items-center gap-1.5">
            {canJoin && (
              <button
                type="button"
                onClick={() => onJoin(session)}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-[12px] bg-grad px-3 text-[calc(12px*var(--ts))] font-bold text-ink-inverted shadow-brand transition hover:brightness-105"
              >
                {live ? (
                  <>
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full rounded-full bg-white/70 motion-safe:animate-ping" />
                      <span className="relative inline-flex size-2 rounded-full bg-white" />
                    </span>
                    ادخل توّا
                  </>
                ) : (
                  <>
                    <Video className="size-4" /> ادخل للحصّة
                  </>
                )}
              </button>
            )}

            {canReplay && (
              <button
                type="button"
                onClick={() => onWatchRecording(session)}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-[12px] border-2 px-3 text-[calc(12px*var(--ts))] font-bold transition hover:bg-surface-muted"
                style={{ borderColor: cream.edge, color: cream.ink }}
              >
                <PlayCircle className="size-4 shrink-0" /> شوف التسجيل
              </button>
            )}

            {/* NOT a button — there is nothing to press. Dashed and muted, the
                shape the fiche used to give it, so it reads as a slot waiting to
                be filled rather than as an action the élève is failing to
                find. */}
            {noReplayYet && (
              <span
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-[12px] border-2 border-dashed px-3 text-[calc(11.5px*var(--ts))] font-medium"
                style={{ borderColor: cream.edge, color: cream.inkMuted }}
              >
                <Hourglass className="size-4 shrink-0" /> التسجيل مزال ما هبطش
              </span>
            )}

            {/* Same button, same sheet, as on the dashboard's agenda. */}
            <HomeworkDocsButton
              homeworks={homeworks}
              past={done}
              open={docsOpen}
              onOpenChange={setDocsOpen}
              className="flex-1"
            />
          </span>
        )}
      </span>
    </li>
  )
}
