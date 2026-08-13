import { Link } from "react-router-dom"
import { ChevronLeft, MonitorPlay } from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { HomeworkList } from "@/features/student/dashboard/HomeworkList"
import { RecentSeances } from "@/features/student/dashboard/RecentSeances"
import { TodayReport } from "@/features/student/dashboard/TodayReport"
import { WaelMessage } from "@/features/student/dashboard/WaelMessage"
import { WeekAgenda } from "@/features/student/dashboard/WeekAgenda"
import { RECENT_DAYS, useRecentlyAdded } from "@/features/student/dashboard/dashboard"
import { useNow } from "@/features/student/calendar/schedule"
import { useIsMobile, useMediaQuery } from "@/lib/hooks"
import { cream } from "@/components/kit/CreamPanel"
import { cn } from "@/lib/utils"
import waelCharacter from "../../../svg icons/Caracter.png"

/**
 * Élève — لوحة القيادة.
 *
 * Four panels around a character, then the board of new replays. The order is
 * the order an élève asks the questions: **someone is talking to me** (وائل's
 * message of the day, the panel whose tail points at him), **how big is today**
 * (the report, three numbers), **where do I have to be** (the week strip and the
 * day's séances) and **what do I owe** (the خدمة queue).
 *
 * The character is the axis the top row is built around: the message's tail
 * points at him and the agenda below is notched so he has floor to stand on. He
 * is decoration with a job — he makes the message read as spoken, which is the
 * difference between a greeting and an announcement.
 *
 * He and both bites of the frames are DESKTOP ONLY. At 390px there is no room
 * for a column of character beside a panel, and a speech tail pointing at
 * nothing is worse than no tail — so the phone gets the same four panels, plain,
 * stacked in the same order.
 *
 * Referenced for spacing & density: StudentSeancesScreen (section kicker +
 * rhythm), SeanceSubjectScreen (matière glyph plates and replay cards).
 */

/** 185 × 328 as delivered. */
const CHARACTER_RATIO = 328 / 185

/**
 * ONE number drives the whole right column — how wide the character is drawn.
 * The other two follow from it and must, or the column comes apart: the gutter
 * row 1 leaves him is that plus a hair, so he stands CLEAR of the panel beside
 * him (overlapping it, the tail had nothing to point across), and the notch row
 * 2 bites is that minus a hair, so his feet land on floor rather than in the
 * air. Change the width alone and the rest keeps up.
 */
function characterMetrics(width: number) {
  return {
    width,
    height: width * CHARACTER_RATIO,
    gutter: width + 16,
    /**
     * Height is fixed — it's how deep his shoes sit into the panel, not a scale
     * — and it is CAPPED by the panel, not by him: the agenda's day chips begin
     * about 59px down (padding + title row + gap), so a bite deeper than that
     * takes a slice out of إثنين, the first chip under it.
     */
    notch: [width - 16, 52] as [number, number],
  }
}

/**
 * How far above the notch's floor he rides, in px. The delivered PNG carries a
 * little transparent margin under the shoes, so landing its bottom edge exactly
 * on the floor reads as standing IN the panel rather than on it. Nudge this to
 * move him up or down; nothing else depends on it.
 */
const CHARACTER_LIFT = 8

/**
 * He gets the big size once there is a desktop's worth of room. Below that he
 * still has to fit beside a panel AND leave the agenda's title a corner to start
 * in, and at 215px on a 900px window the notch ate half that row.
 */
const CHARACTER_W_WIDE = 215
const CHARACTER_W_MD = 158

export default function StudentDashboard() {
  const now = useNow()
  const recent = useRecentlyAdded(now)
  // The notch exists to give the character floor. He is desktop-only, so it is
  // too — a bite out of a corner with nothing standing in it is just damage.
  const isMobile = useIsMobile()
  const roomy = useMediaQuery("(min-width: 1280px)")
  const wael = characterMetrics(roomy ? CHARACTER_W_WIDE : CHARACTER_W_MD)

  return (
    <div className="flex flex-col gap-6" style={{ ["--gutter" as string]: `${wael.gutter}px` }}>
      <div className="flex flex-col gap-4">
        {/* Row 1 — the message and the report. Padded clear of the character on
            the start edge so the message's tail points AT him, not through him. */}
        {/* `min-w-0` on every column: a long French homework title or séance
            name is a flex item's automatic minimum size, and without it the
            panel refuses to shrink and eats the row from its neighbour. */}
        {/* The row is inset by the gutter, so the space the character stands in
            is taken out BEFORE the two panels split what's left. */}
        <div className="flex flex-col gap-4 md:flex-row md:[padding-inline-start:var(--gutter)]">
          {/* Near-equal halves, the message a shade wider — it carries prose,
              the report carries three numbers. */}
          <div className="min-w-0 md:flex-[1.08]">
            <WaelMessage now={now} />
          </div>
          <div className="min-w-0 md:flex-1">
            <TodayReport now={now} />
          </div>
        </div>

        {/* Row 2 — the week, and the queue. The agenda runs under the character
            and is notched for his feet; the queue is the column beside it. */}
        <div className="relative flex flex-col gap-4 md:flex-row">
          {/* Anchored to THIS row, not the block: his feet have to land in the
              notch whatever height the row above settles at, so he hangs from
              the notch upward rather than dropping from the top down. */}
          <img
            src={waelCharacter}
            alt=""
            aria-hidden
            className="pointer-events-none absolute end-auto right-0 z-20 hidden select-none md:block"
            style={{ width: wael.width, top: wael.notch[1] - wael.height - CHARACTER_LIFT }}
          />
          {/* The agenda takes the row; the queue is a column beside it, the way
              the mockup splits them. It runs the full width — under the
              character, notched for his feet — rather than stopping where row 1
              stops. */}
          {/* 4:1 once there's room, as the mockup splits them — but at the
              narrow end of desktop that leaves the queue ~180px, where a خدمة
              title truncates to two syllables. There it backs off to 2.4:1. */}
          <div className={cn("min-w-0", roomy ? "md:flex-[4]" : "md:flex-[2.4]")}>
            <WeekAgenda now={now} notch={isMobile ? undefined : wael.notch} />
          </div>
          <div className="min-w-0 md:flex-1">
            <HomeworkList now={now} />
          </div>
        </div>
      </div>

      {/* The board — replays put online these last few days. */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="font-display text-base font-bold" style={{ color: cream.ink }}>
              آخر الحصص المضافة
            </h2>
            <span className="shrink-0 text-[calc(11.5px*var(--ts))]" style={{ color: cream.inkMuted }}>
              {`آخر ${RECENT_DAYS} أيام`}
            </span>
          </div>
          <Link
            to="/student/seances"
            className="inline-flex shrink-0 items-center gap-1 text-[calc(13px*var(--ts))] font-medium text-brand-600 transition hover:text-brand-700"
          >
            الكلّ <ChevronLeft className="size-4" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface">
            <EmptyState
              icon={MonitorPlay}
              title="ما تزادت حتّى حصّة"
              description="كي يتنشر تسجيل حصّة جديدة، يظهرلك هوني قبل كلّ شيء."
              action={
                <Link
                  to="/student/seances"
                  className="inline-flex h-11 items-center gap-2 rounded-md border border-border-strong bg-surface px-4 text-sm font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"
                >
                  <MonitorPlay className="size-4" />
                  شوف المكتبة الكل
                </Link>
              }
            />
          </div>
        ) : (
          <RecentSeances sessions={recent} now={now} />
        )}
      </section>
    </div>
  )
}
