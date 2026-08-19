import { Link } from "react-router-dom"
import { ChevronLeft, MonitorPlay } from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { DayHeader } from "@/features/student/dashboard/DayHeader"
import { HomeworkList } from "@/features/student/dashboard/HomeworkList"
import { LiveNowPanel } from "@/features/student/dashboard/LiveNowPanel"
import { RecentSeances } from "@/features/student/dashboard/RecentSeances"
import { TodayReport } from "@/features/student/dashboard/TodayReport"
import { WaelMessage } from "@/features/student/dashboard/WaelMessage"
import { WeekAgenda } from "@/features/student/dashboard/WeekAgenda"
import {
  RECENT_DAYS,
  pickLive,
  useDemoRecent,
  useMyLivesToday,
} from "@/features/student/dashboard/dashboard"
import { useNow } from "@/features/student/calendar/schedule"
import { useDemoToggle } from "@/lib/demoToggle"
import { useIsMobile, useMeasuredHeight, useMediaQuery } from "@/lib/hooks"
import { cream } from "@/components/kit/CreamPanel"
import type { Session } from "@/data/types"
import waelCharacter from "../../../svg icons/Caracter.png"

/**
 * Élève — لوحة القيادة.
 *
 * Five panels around a character, then the board of new replays. The order is
 * the order an élève asks the questions: **someone is talking to me** (وائل's
 * message of the day, the panel whose tail points at him), **how big is today**
 * (the report, two numbers), **do I have to be somewhere RIGHT NOW** (the live
 * section and its join button), **where do I have to be next** (the day's
 * séances, with the week as a way to step off it) and **what do I owe** (the
 * documents due for today's remaining séances).
 *
 * Row 2 reads the day in order rather than by size: the agenda holds the start
 * edge — first thing read in an RTL page, first thing scrolled to on a phone —
 * because « where do I have to be today » is the question the élève arrives
 * with, and it stays true all day; the live panel sits beside it, loud enough
 * to be found without holding the corner, since it only has something to say
 * for the hour it is running. The documents queue scrolls inside a fixed height
 * so it can never drag the other two down.
 *
 * The character is the axis the top row is built around: the message's tail
 * points at him and the panel below is notched so he has floor to stand on.
 * The notch belongs to whatever holds the start corner of row 2 — the agenda —
 * and it is only 52px deep, so it costs that panel a slice of its title row and
 * nothing else.
 *
 * He and both bites of the frame are XL-ONLY (>=1280). Below that, row 2 falls
 * to two columns and there is no longer a column to stand him in — and a speech
 * tail pointing at nothing is worse than no tail — so phone and tablet get the
 * same five panels, plain, in the same order.
 *
 * Referenced for spacing & density: StudentSeancesScreen (section kicker +
 * rhythm), SeanceSubjectScreen (matière glyph plates and replay cards).
 */

/** Stable, so the empty board never hands the rail a new array each render. */
const NO_SESSIONS: Session[] = []

/** 185 × 328 as delivered. */
const CHARACTER_RATIO = 328 / 185

/** The gap between row 1 and row 2, in px (`gap-4`). */
const ROW_GAP = 16

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
     * — and it is CAPPED by the panel, not by him: the panel's title row begins
     * about 59px down (padding + line), so a bite deeper than that takes a
     * slice out of the heading under it.
     */
    notch: [width - 16, 52] as [number, number],
    /**
     * How far his head reaches ABOVE row 2, in px — he hangs from the notch
     * upward, so this is his whole height less the depth his shoes sit in.
     * ~337px at the delivered size. The header measures its clearance against
     * this; see `headroom` in the screen below.
     */
    reach: width * CHARACTER_RATIO + CHARACTER_LIFT - 52,
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
 * He is drawn at one size or not at all.
 *
 * There used to be a smaller md variant, from when row 2 was two panels and the
 * first of them had most of the row to itself. Row 2 is three panels now and
 * collapses to two columns below 1280, where the panel holding the notch is
 * ~275px — a 142px bite out of its title row left « الحصة بدات » breaking
 * mid-word. Under 1280 there is simply no column to stand him in, so he and
 * both bites of the frame sit out and the panels get their corners back.
 */
const CHARACTER_W_WIDE = 215

export default function StudentDashboard() {
  const now = useNow()
  const recentPool = useDemoRecent(now)
  const livesToday = useMyLivesToday(now)
  // The notch exists to give the character floor, so the two travel together:
  // a bite out of a corner with nothing standing in it is just damage.
  const roomy = useMediaQuery("(min-width: 1280px)")
  const wael = characterMetrics(CHARACTER_W_WIDE)

  // How much of his reach row 1 does NOT absorb — measured, not assumed. He
  // hangs from row 2 upward; row 1 and the gap under it stand in the way, and
  // on a normal day that row runs ~310px against a ~337px reach, so what is
  // left over for the header to reserve is a few px and often nothing at all.
  // Sizing this against row 1's `min-h` instead (176px) reserved 145px of empty
  // band under the title — a hole with nothing standing in it.
  const row1 = useMeasuredHeight<HTMLDivElement>()
  const headroom = roomy ? Math.max(0, wael.reach - row1.height - ROW_GAP) : 0

  /**
   * Two panels have a loud state and an empty one, and a demo has to be able to
   * show both from one screen at any hour of any day — so each gets a switch.
   *
   * H — the live panel. ON prefers the TRUTH (the live actually running, or the
   * next one still to come today) and only falls back to dressing the day's last
   * live in the running state once there is genuinely nothing left.
   * K — the homework panel. ON is today's real documents, topped up to six from
   * the élève's others only when today is too thin to fill the scroll.
   * S — the board of new replays. ON is the last few days' uploads, topped up to
   * nine from the next-newest so the rail always has more than fits.
   *
   * All three default ON, and OFF is the empty state in each case.
   */
  const liveOn = useDemoToggle("KeyH")
  const docsOn = useDemoToggle("KeyK")
  const recentOn = useDemoToggle("KeyS")
  const recent = recentOn ? recentPool : NO_SESSIONS

  const truthful = pickLive(livesToday, now)
  const liveItem = !liveOn
    ? null
    : (truthful ??
      (livesToday.length > 0 ? { ...livesToday[livesToday.length - 1], running: true } : null))

  /**
   * A live that is RUNNING jumps to the top of the phone.
   *
   * On a phone every panel is full width and stacked, so the live section sits
   * four scrolls down — behind the message, the report and the day's agenda. That
   * is the right place for it while it is merely SCHEDULED, but the moment a
   * séance is actually on air it stops being one panel among five: it is the only
   * thing on the page with a deadline, and it is worth nothing if the élève has
   * to go looking for it. So it — and only it — hoists above the fold, and drops
   * back into the row the moment the séance ends.
   *
   * ONE instance either way, moved rather than duplicated: a second copy behind
   * `hidden` would put a second « rejoins » link in the page for anything reading
   * it, and both would have to stay in step. Desktop never hoists — the row is
   * three columns there and the live panel is already in view.
   */
  const phone = useIsMobile()
  const liveOnTop = phone && !!liveItem?.running
  const livePanel = <LiveNowPanel item={liveItem} />

  return (
    <div
      className="flex flex-col gap-6"
      style={{ ["--gutter" as string]: roomy ? `${wael.gutter}px` : "0px" }}
    >
      {/* Flush with the start edge — the title is the page's first line and it
          holds the same corner as the agenda panel two rows down. It clears the
          character VERTICALLY instead of stepping aside for him: at xl it pads
          his whole reach under itself, so he comes up to the greeting and
          stops. Below xl he is not drawn and the padding is 0. */}
      <div className="rise" style={{ ["--i" as string]: 0, paddingBottom: headroom }}>
        <DayHeader now={now} />
      </div>

      <div className="flex flex-col gap-4">
        {liveOnTop && (
          <div className="rise min-w-0" style={{ ["--i" as string]: 0 }}>
            {livePanel}
          </div>
        )}

        {/* Row 1 — the message and the report. Padded clear of the character on
            the start edge so the message's tail points AT him, not through him. */}
        {/* `min-w-0` on every column: a long French homework title or séance
            name is a flex item's automatic minimum size, and without it the
            panel refuses to shrink and eats the row from its neighbour. */}
        {/* The row is inset by the gutter, so the space the character stands in
            is taken out BEFORE the two panels split what's left. */}
        <div
          ref={row1.ref}
          className="flex flex-col gap-4 md:flex-row md:[padding-inline-start:var(--gutter)]"
        >
          {/* Near-equal halves, the message a shade wider — it carries prose,
              the report carries two numbers. */}
          <div className="rise min-w-0 md:flex-[1.08]" style={{ ["--i" as string]: 1 }}>
            <WaelMessage now={now} />
          </div>
          <div className="rise min-w-0 md:flex-1" style={{ ["--i" as string]: 2 }}>
            <TodayReport now={now} />
          </div>
        </div>

        {/* Row 2 — the day, live, the documents. The agenda takes the start
            corner (and the character with it), the live sits in the middle,
            and the queue closes the row. */}
        {/* At md there is not room for three, so the queue drops to a full-width
            band under the other two rather than being squeezed to a sliver. */}
        {/* The start column is the widest of the three on purpose, and by more
            than its content needs: it carries the 199px notch, and at 1.25fr the
            1280px case left the heading under it ~157px — a two-word title broke
            mid-air. 1.45fr buys the row back. The tracks do NOT travel with the
            panels: the wide one belongs to the corner the character stands in. */}
        <div className="relative grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)_minmax(0,1.05fr)]">
          {/* Anchored to THIS row, not the block: his feet have to land in the
              notch whatever height the row above settles at, so he hangs from
              the notch upward rather than dropping from the top down. */}
          {roomy && (
            <img
              src={waelCharacter}
              alt=""
              aria-hidden
              className="rise pointer-events-none absolute end-auto right-0 z-20 select-none"
              // He rides in with the panel he stands in, not on his own beat.
              style={{
                width: wael.width,
                top: wael.notch[1] - wael.height - CHARACTER_LIFT,
                ["--i" as string]: 3,
              }}
            />
          )}
          <div className="rise min-w-0" style={{ ["--i" as string]: 3 }}>
            <WeekAgenda now={now} notch={roomy ? wael.notch : undefined} />
          </div>
          {!liveOnTop && (
            <div className="rise min-w-0" style={{ ["--i" as string]: 4 }}>
              {livePanel}
            </div>
          )}
          <div className="rise min-w-0 md:col-span-2 xl:col-span-1" style={{ ["--i" as string]: 5 }}>
            <HomeworkList now={now} show={docsOn} />
          </div>
        </div>
      </div>

      {/* The board — replays put online these last few days. */}
      <section className="rise" style={{ ["--i" as string]: 6 }}>
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
                  className="btn-bump inline-flex h-11 items-center gap-2 rounded-md border border-border-strong bg-surface px-4 text-sm font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                  style={{
                    ["--bump" as string]: "3px",
                    ["--bump-edge" as string]: "var(--border-strong)",
                  }}
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
