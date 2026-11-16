import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, CalendarClock, CalendarX2, CheckCircle2, CirclePlay, Clock, FileCheck2, Video } from "lucide-react"
import type { Session } from "@/data/types"
import { formatAway, formatCountdown, sessionEnd, useSecond } from "@/features/student/calendar/schedule"
import { cn, formatTimeRange } from "@/lib/utils"
import { BASE, SOON_MS, relativeDay, useLookups, v2VideoPath, type LivePick } from "../lib"
import { Num, Panel, PanelEmpty, Ring, ctaClass, liveOutlineClass } from "../ui"

/**
 * « الحصة بدات » — is there somewhere I have to BE right now?
 *
 * Six states, one panel, in the order the clock walks through them:
 *   countdown  a séance still to come today — the designer's red variant, a
 *              clock instead of the pulsing dot.
 *   soon       the same, under 15 minutes out: the countdown drops to mm:ss
 *              and the way in OPENS early — the élève shouldn't have to wait
 *              for the second the séance starts to click.
 *   live       the frame's red box — « فمّا حصّة مباشرة توّا », the loud
 *              « توّا » and the way in. Red is reserved for this: on air.
 *   ended      just over: nothing to join, so it goes calm and green and hands
 *              over what's useful now — the documents, the replay when it lands.
 *   postponed  the séance the élève was waiting for won't run: amber, the one
 *              colour here that means « change of plan », and the next one.
 *   none       nothing today. Deliberately NOT red: a pink alarm box that says
 *              "nothing" reads as an error, so it goes quiet and teal.
 *
 * Under the play skin this is the dashboard's QUEST CARD — the loudest object
 * on the page: a 2 px border in the state's colour, the countdown drawn as a
 * ring that empties over the last hour, « انتهت » as a stamp. Same tree in
 * both skins; `.v2-play` / `.v2-soft` pick which clock shows.
 */
export function LivePanel({
  pick,
  now,
  onOpenDocs,
}: {
  pick: LivePick
  now: Date
  onOpenDocs?: (session: Session, started: boolean) => void
}) {
  // One heartbeat for the whole panel, and only while a countdown is on screen.
  useSecond(pick.kind === "countdown")
  const left = pick.kind === "countdown" ? pick.target - Date.now() : 0
  const soon = pick.kind === "countdown" && left <= SOON_MS

  const title =
    pick.kind === "live"
      ? "الحصة بدات"
      : pick.kind === "countdown"
        ? soon
          ? "تبدا توّا… حضّر روحك"
          : "الحصّة الجاية"
        : pick.kind === "ended"
          ? // « completed », not « over » — and the replay promised only while it
            // is still on its way; once it is here the line below says so.
            pick.session.recordingUrl
            ? "الحصّة كمّلت"
            : "الحصّة كمّلت — التسجيل جاي"
          : pick.kind === "postponed"
            ? "الحصّة تأجلت"
            : "الحصّة المباشرة"

  return (
    <Panel icon={Video} chip="bg-v2-chip-live" title={title} className="h-full">
      {pick.kind === "live" && <OnAir session={pick.session} />}
      {pick.kind === "countdown" && <Countdown session={pick.session} left={left} soon={soon} />}
      {pick.kind === "ended" && <Ended session={pick.session} now={now} onOpenDocs={onOpenDocs} />}
      {pick.kind === "postponed" && <Postponed session={pick.session} next={pick.next} now={now} />}
      {pick.kind === "none" && <Nothing next={pick.next} now={now} />}
    </Panel>
  )
}

function SessionLine({ session, className }: { session: Session; className?: string }) {
  const { subjectOf, teacherName } = useLookups()
  const teacher = teacherName(session.teacherId)
  return (
    <p className={cn("mt-1 text-[calc(8.5px*var(--ts))] text-v2-ink/70", className)}>
      {subjectOf(session)?.name} · {formatTimeRange(session.startTime, session.endTime)}
      {teacher && ` · ${teacher}`}
    </p>
  )
}

/** The panel's inner box — every state is one of these, in its own colour. */
function Box({ tone, children }: { tone: "live" | "calm" | "done" | "off"; children: ReactNode }) {
  return (
    <div
      data-tone={tone}
      className={cn(
        "v2-quest relative flex flex-1 flex-col items-center justify-center rounded-2xl border px-4 py-6 text-center md:px-6",
        tone === "live" && "border-v2-live bg-v2-live-soft",
        tone === "calm" && "border-v2-live/60 bg-v2-live-soft",
        tone === "done" && "border-v2-brand/40 bg-v2-brand/[0.07]",
        tone === "off" && "border-dashed border-v2-done-line bg-v2-done/[0.07]",
      )}
    >
      {children}
    </div>
  )
}

function OnAir({ session }: { session: Session }) {
  return (
    <Box tone="live">
      <span aria-hidden className="v2-onair absolute end-4 top-4 size-4 rounded-full bg-v2-live ring-4 ring-v2-surface/80" />
      <p className="text-[calc(10.5px*var(--ts))] font-medium text-v2-ink">فمّا حصّة مباشرة توّا</p>
      <SessionLine session={session} />

      <div className="mt-4 w-full max-w-[29rem] rounded-2xl border border-dashed border-v2-live bg-v2-live/15 p-1.5">
        <div className="flex items-center justify-center gap-3 rounded-2xl bg-v2-live/20 px-3 py-2.5 md:gap-5">
          <span className="text-[calc(9.5px*var(--ts))] font-bold text-v2-live-strong">المباشر يخدم</span>
          <span className="text-[calc(28px*var(--ts))] font-black leading-none text-v2-live-strong">توّا</span>
          <span className="text-[calc(9.5px*var(--ts))] font-bold text-v2-live-strong">
            في <span dir="ltr">zoom</span>
          </span>
        </div>
      </div>

      {/* The way in. The frame's text link with its hand-drawn arrow; under
          the play skin the same link is the chunky lime pill (`v2-cta`) and
          the arrow steps aside. */}
      <Link data-uisfx="connect"
        to={`${BASE}/seance/${session.id}`}
        className="v2-cta group mt-1 inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-[calc(10px*var(--ts))] font-semibold text-v2-ink transition hover:text-v2-live-strong"
      >
        {/* The frame's hand-drawn arrow, curling from the box down to the link. */}
        <svg viewBox="0 0 48 40" className="v2-soft -mt-6 h-9 w-11 text-v2-ink" fill="none" aria-hidden>
          <path d="M40 2c3 16-6 29-30 33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 29l-7 6 9 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        يلّا، ادخل للمباشر
        <ArrowLeft className="size-5 transition group-hover:-translate-x-1" />
      </Link>
    </Box>
  )
}

/** How long the ring takes to empty: the last hour before the séance. */
const RING_MS = 3_600_000

function Countdown({ session, left, soon }: { session: Session | null; left: number; soon: boolean }) {
  // Under an hour, hours are noise: « 12:43 » reads faster than « 00:12:43 ».
  const full = formatCountdown(left)
  const clock = left < RING_MS ? full.slice(3) : full
  // The ring's digits: under an hour, mm:ss with the seconds rolling; over
  // it, hh:mm large and the seconds small underneath — eight digits in a
  // ring is a wall, not a clock.
  const [hh, mm, ss] = full.split(":")

  return (
    <Box tone="calm">
      {soon ? (
        <span aria-hidden className="absolute end-4 top-4 size-3 rounded-full bg-v2-live/70 motion-safe:animate-pulse" />
      ) : (
        <CalendarClock aria-hidden className="absolute end-4 top-4 size-5 text-v2-live" strokeWidth={1.75} />
      )}
      <p className="text-[calc(10.5px*var(--ts))] font-medium text-v2-ink">
        {soon ? "حضّر روحك، الحصّة قريب تبدا" : "ما فمّاش حصّة مباشرة توّا"}
      </p>

      {/* The frame's clock: a red dashed box. Soft skin only. */}
      <div className="v2-soft mt-4 w-full max-w-[29rem] rounded-2xl border border-dashed border-v2-live bg-v2-live/10 p-1.5">
        <div className="flex items-center justify-center gap-4 rounded-2xl bg-v2-surface/70 px-3 py-2.5">
          <span className="text-[calc(9.5px*var(--ts))] font-bold text-v2-live-strong">
            {soon ? "تبدا بعد" : "تبدا في أقلّ من"}
          </span>
          <span dir="ltr" className="text-[calc(24px*var(--ts))] font-black leading-none tabular-nums text-v2-live-strong">
            {clock}
          </span>
        </div>
      </div>

      {/* The quest's ring: full until the last hour, then it empties second
          by second. Play skin only. */}
      <div className="v2-play mt-4 flex flex-col items-center gap-2">
        <Ring fraction={left / RING_MS}>
          <span dir="ltr" className="v2-ring-digits flex flex-col items-center">
            {left < RING_MS ? (
              <span className="text-[calc(17px*var(--ts))]">
                {mm}:<Num value={ss} />
              </span>
            ) : (
              <>
                <span className="text-[calc(17px*var(--ts))]">
                  {hh}:{mm}
                </span>
                <span className="mt-1 text-[calc(8px*var(--ts))] font-semibold text-v2-ink-2">
                  <Num value={ss} />
                </span>
              </>
            )}
          </span>
        </Ring>
        <span className="text-[calc(8.5px*var(--ts))] font-bold text-v2-live-strong">
          {soon ? "تبدا بعد" : "تبدا في أقلّ من"}
          {left >= RING_MS && ` ${hh === "00" ? "" : `${Number(hh)} سا`}`}
        </span>
      </div>

      {session && <SessionLine session={session} />}
      {session &&
        (soon ? (
          <Link data-uisfx="connect" to={`${BASE}/seance/${session.id}`} className={cn(ctaClass, "mt-3")}>
            <Video className="size-5" strokeWidth={1.75} />
            يلّا، ادخل للمباشر
          </Link>
        ) : (
          <Link data-uisfx="forward"
            to={`${BASE}/seance/${session.id}`}
            className="group mt-2 inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[calc(10px*var(--ts))] font-semibold text-v2-ink transition hover:text-v2-brand"
          >
            تفاصيل الحصّة
            <ArrowLeft className="size-5 transition group-hover:-translate-x-1" />
          </Link>
        ))}
      {soon && (
        <p className="mt-1 text-[calc(7.5px*var(--ts))] text-v2-ink-2">الباب يتحلّ 15 دقيقة قبل الحصّة.</p>
      )}
    </Box>
  )
}

function Ended({
  session,
  now,
  onOpenDocs,
}: {
  session: Session
  now: Date
  onOpenDocs?: (session: Session, started: boolean) => void
}) {
  return (
    <Box tone="done">
      {/* The tick in the corner (soft), or the « انتهت » stamp (play). */}
      <CheckCircle2 aria-hidden className="v2-soft absolute end-4 top-4 size-5 text-v2-brand" strokeWidth={1.75} />
      <span aria-hidden className="v2-stamp v2-play absolute end-4 top-4 text-[calc(9px*var(--ts))]">
        انتهت
      </span>
      <p className="text-[calc(10.5px*var(--ts))] font-medium text-v2-ink">
        كمّلت الحصّة — وفات {formatAway(sessionEnd(session).getTime() - now.getTime())}
      </p>
      <SessionLine session={session} />
      <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-v2-surface/80 px-3 py-1 text-[calc(8px*var(--ts))] text-v2-ink/70">
        <Clock className="size-3.5" />
        {session.recordingUrl ? "التسجيل حاضر" : "التسجيل يوصل في غضون سوايع"}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        {onOpenDocs && (
          <button type="button" data-uisfx="open" onClick={() => onOpenDocs(session, true)} className={cn(ctaClass, "border border-v2-ink")}>
            <FileCheck2 className="size-5" strokeWidth={1.75} />
            وثائق الحصّة
          </button>
        )}
        {session.recordingUrl && (
          <Link data-uisfx="play" to={v2VideoPath(session.id, { subjectId: session.subjectIds[0] })} className={liveOutlineClass}>
            <CirclePlay className="size-5" strokeWidth={1.75} />
            عاود شوف الحصّة
          </Link>
        )}
      </div>
    </Box>
  )
}

function Postponed({ session, next, now }: { session: Session; next: Session | null; now: Date }) {
  const { subjectOf } = useLookups()
  return (
    <Box tone="off">
      <CalendarX2 aria-hidden className="absolute end-4 top-4 size-5 text-v2-done" strokeWidth={1.75} />
      <p className="text-[calc(10.5px*var(--ts))] font-bold text-v2-ink">
        حصّة {subjectOf(session)?.name} ما عادش باش تصير {relativeDay(session.date, now) === "اليوم" ? "اليوم" : relativeDay(session.date, now)}
      </p>
      <p className="mt-1 text-[calc(8.5px*var(--ts))] text-v2-ink-2 line-through decoration-v2-ink/30">
        {formatTimeRange(session.startTime, session.endTime)}
      </p>
      <p className="mt-2 text-[calc(8.5px*var(--ts))] text-v2-ink/70">الأستاذ أجّلها — الموعد الجديد يوصلك في إشعار.</p>
      {next && (
        <p className="mt-4 rounded-full bg-v2-surface px-4 py-1.5 text-[calc(8.5px*var(--ts))] text-v2-ink/75">
          الحصّة الجاية: <span className="font-bold text-v2-ink">{subjectOf(next)?.name}</span> ·{" "}
          {relativeDay(next.date, now)} على {next.startTime}
        </p>
      )}
      <Link data-uisfx="forward"
        to={`${BASE}/calendrier`}
        className="group mt-2 inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[calc(10px*var(--ts))] font-semibold text-v2-ink transition hover:text-v2-brand"
      >
        شوف الرزنامة
        <ArrowLeft className="size-5 transition group-hover:-translate-x-1" />
      </Link>
    </Box>
  )
}

/**
 * A rest day is a state, not an absence: « اليوم راحة » when a next séance is
 * known, and Wael dressed for THAT matière looking at the empty box — the
 * one character the panel can honestly show.
 */
function Nothing({ next, now }: { next: Session | null; now: Date }) {
  const { subjectOf } = useLookups()
  const nextSubject = next ? subjectOf(next) : undefined
  return (
    <PanelEmpty
      icon={CalendarClock}
      character={nextSubject?.name}
      title={next ? "اليوم راحة" : "ما فمّاش حصّة مباشرة توّا"}
      body="كي تبدا حصّة مباشرة، تلقى زرّ الدخول هوني."
      action={
        <div className="flex flex-col items-center gap-3">
          {next && (
            <p className="rounded-full bg-v2-surface px-4 py-1.5 text-[calc(8.5px*var(--ts))] text-v2-ink/75">
              أقرب حصّة: <span className="font-bold text-v2-ink">{nextSubject?.name}</span> ·{" "}
              {relativeDay(next.date, now)} على {next.startTime}
            </p>
          )}
          <Link data-uisfx="forward" to={`${BASE}/calendrier`} className={ctaClass}>
            شوف الرزنامة
            <ArrowLeft className="size-4" />
          </Link>
        </div>
      }
    />
  )
}
