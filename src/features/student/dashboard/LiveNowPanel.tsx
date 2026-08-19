import { Link } from "react-router-dom"
import { CalendarClock, ChevronLeft, Radio, Video } from "lucide-react"
import { SubjectIcon } from "@/components/icons/subjects"
import { CreamPanel, cream } from "@/components/kit/CreamPanel"
import { PanelEmpty } from "@/features/student/dashboard/PanelEmpty"
import { type LiveToday } from "@/features/student/dashboard/dashboard"
import { subjectTint } from "@/features/student/subjectTint"
import { cn } from "@/lib/utils"
import { useData } from "@/stores/useData"

/**
 * Section 3 — « مباشر توّا »: is there a room the élève has to be in RIGHT NOW?
 *
 * This is the only panel on the dashboard with a deadline attached to it, so it
 * is the only one built around a button. Everything else here answers a
 * question ("how big is today", "what's on Thursday"); this one asks for a
 * decision, and a live séance is worthless five minutes late — so the join
 * button is full-width, it is the largest control on the page, and nothing else
 * in the panel competes with it.
 *
 * The panel has exactly TWO states and both are designed:
 *
 * - **الحصة بدات** — the frame's own edge turns `--danger-500` and a pulsing dot
 *   sits in the kicker. The state is carried by the FRAME rather than a ring or
 *   an outline, because the panel is clipped for the character's notch and a
 *   ring would be sliced off at the cut.
 * - **ما فماش مباشر** — a calm, quiet card. It is the state the élève sees most
 *   days, so it must not read as an error: no red, no dashed empty box round the
 *   whole panel, just a muted glyph and a way back to the roznama.
 *
 * A live scheduled for later today lands between the two: calm brand treatment,
 * the hour said out loud, and the button still there but not shouting.
 *
 * Referenced for spacing & density: NextUpCard (matière glyph on its measured
 * tint, kicker → title → meta order, the footer action row), WeekAgenda (panel
 * title row), DayList (the live/prévue colour split).
 */
export function LiveNowPanel({ item, notch }: { item: LiveToday | null; notch?: [number, number] }) {
  const subjects = useData((s) => s.subjects)

  /* ---------------------------------------------------------------- *
   * Nothing live. A real state, and a calm one.
   * ---------------------------------------------------------------- */
  if (!item) {
    return (
      <CreamPanel
        notch={notch}
        // Elevated even while empty: the lift belongs to the live SECTION, not
        // to whether there happens to be a séance in it this hour.
        shadow="var(--shadow-panel)"
        className="min-h-[13rem]"
        bodyClassName="gap-3 p-4 md:p-5"
      >
        <div style={{ paddingInlineStart: notch ? notch[0] - 8 : 0 }}>
          <h2
            className="flex items-center gap-2 font-display text-[calc(17px*var(--ts))] font-bold leading-tight"
            style={{ color: cream.ink }}
          >
            <Radio className="size-[18px] shrink-0" style={{ color: cream.inkMuted }} />
            مباشر
          </h2>
        </div>

        {/* This shape is now the dashboard's empty state everywhere — the
            agenda and the documents queue wear it too. See PanelEmpty. */}
        <PanelEmpty
          icon={CalendarClock}
          title="ما فماش حصّة مباشرة توّا"
          description="كي تبدا حصّة مباشرة، تلقى زرّ الدخول هوني."
          action={
            <Link
              to="/student/calendrier"
              className="mt-1 inline-flex min-h-11 items-center gap-1 text-[calc(12.5px*var(--ts))] font-medium transition hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
              style={{ color: "var(--brand-600)" }}
            >
              شوف الروزنامة <ChevronLeft className="size-4" />
            </Link>
          }
        />
      </CreamPanel>
    )
  }

  const { live, running, start } = item
  const subject = subjects.find((s) => live.subjectIds.includes(s.id))
  const tint = subjectTint(subject?.name ?? "", subject?.category)
  const hhmm = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`

  return (
    <CreamPanel
      notch={notch}
      // The frame IS the state. See the note at the top of the file.
      edge={running ? "var(--danger-500)" : cream.edge}
      // …and while it is actually RUNNING the frame gets help: 6% of the alert
      // colour through the body, and the light under the panel goes red too.
      // A red hairline is findable once you are looking at the panel; this is
      // what makes the panel findable from the other end of the page. Both stay
      // far below the level where the body text on top stops being comfortable
      // — the wash is a temperature, not a fill.
      fill={running ? "color-mix(in srgb, var(--danger-500) 6%, var(--surface))" : undefined}
      // The ONLY panel on the dashboard that leaves the page. The others are
      // flat plates on their edge; this one carries a deadline, so it gets the
      // elevation to itself — and turns that light red once a séance is
      // actually running.
      shadow={
        running
          ? "drop-shadow(0 12px 22px color-mix(in srgb, var(--danger-500) 26%, transparent)) drop-shadow(0 2px 4px rgb(21 58 45 / 0.06))"
          : "var(--shadow-panel)"
      }
      className="min-h-[13rem]"
      bodyClassName="gap-3 p-4 md:p-5"
    >
      <div
        className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1"
        style={{ paddingInlineStart: notch ? notch[0] - 8 : 0 }}
      >
        <h2
          className="flex items-center gap-2 font-display text-[calc(17px*var(--ts))] font-bold leading-tight"
          style={{ color: running ? "var(--danger-600)" : cream.ink }}
        >
          {running ? (
            // Ping + dot: the one animated thing on the dashboard, spent on the
            // one fact that expires.
            <span className="relative flex size-2.5 shrink-0">
              <span className="absolute inline-flex size-full rounded-full bg-danger-500 motion-safe:animate-ping" />
              <span className="relative inline-flex size-2.5 rounded-full bg-danger-500" />
            </span>
          ) : (
            <Radio className="size-[18px] shrink-0" style={{ color: cream.inkMuted }} />
          )}
          {running ? "الحصة بدات" : "مباشر اليوم"}
        </h2>
        {/* Only the SCHEDULED state earns a second line here. « الحصة بدات »
            already says it is live, and the notch leaves this row about 200px
            at desktop — a redundant word was enough to wrap the heading. */}
        {!running && (
          <span
            className="shrink-0 text-[calc(11.5px*var(--ts))] font-semibold tabular-nums"
            style={{ color: cream.inkMuted }}
          >
            {`على ${hhmm}`}
          </span>
        )}
      </div>

      <div className="flex items-start gap-3">
        {/* The matière's own drawing on its measured tint — the same plate the
            séance cards use, so a live reads as the same kind of object. */}
        <span
          className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-[16px] md:size-16"
          style={{ backgroundColor: tint.panel }}
        >
          <span
            className="absolute size-12 rounded-full blur-2xl"
            style={{ backgroundColor: tint.halo }}
          />
          {subject ? (
            <SubjectIcon name={subject.name} className="relative size-12 md:size-14" />
          ) : (
            <Radio className="relative size-5" style={{ color: cream.inkMuted }} />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <h3
            dir="auto"
            className="font-display text-[calc(15px*var(--ts))] font-bold leading-snug line-clamp-2"
            style={{ color: cream.ink }}
          >
            {live.name}
          </h3>
          {subject && (
            <p
              dir="auto"
              className="mt-1 truncate text-[calc(12px*var(--ts))]"
              style={{ color: cream.inkMuted }}
            >
              {subject.name}
            </p>
          )}
        </div>
      </div>

      {/* The decision. Full width at every size — it is the point of the panel,
          and a live you have to hunt for is a live you miss. */}
      <a
        href={live.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "mt-auto inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] px-4 font-display text-[calc(14px*var(--ts))] font-bold text-white transition",
          // Stands on its own edge and drops onto it when pressed — the panel's
          // card physics, on the one control the panel exists for.
          "btn-bump hover:brightness-105",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
          running ? "bg-danger-500 hover:bg-danger-600" : "bg-grad",
        )}
        // The slab is the button's own darker side, so the running state takes
        // its red all the way down into the edge instead of standing on teal.
        style={
          running
            ? {
                ["--bump-edge" as string]: "color-mix(in oklab, var(--danger-500) 72%, black)",
              }
            : undefined
        }
      >
        <Video className="size-[18px] shrink-0" />
        {running ? "أدخل توّا" : "أدخل للحصّة"}
      </a>
    </CreamPanel>
  )
}
