import { useMemo } from "react"
import { Link } from "react-router-dom"
import { BarChart3 } from "lucide-react"
import { CreamPanel, cream } from "@/components/kit/CreamPanel"
import { reportArt } from "@/features/student/dashboard/reportArt"
import { useMyHomeworks, useMySessions } from "@/features/student/dashboard/dashboard"
import { dateKey } from "@/features/student/calendar/schedule"

/**
 * Section 3 — برنامج اليوم: the day in two numbers.
 *
 * Numbers, not a list, because the list is Section 2 and Section 4 — this panel
 * answers "how big is today" in one glance, which is the question you ask before
 * you decide whether to read anything else. Each tile is a link to the screen
 * that expands it, so a number that looks wrong is one tap from its detail.
 *
 * Two numbers, and NOTHING under them. The séance tile used to carry « X كملت »
 * and a progress track counting the day down; both are gone. The agenda panel
 * beside this one already shows every séance of the day with its state on it,
 * so the count was the same fact in a weaker form — and a tile that answers
 * « how big is today » in one glance stops doing that the moment it needs two
 * lines and a bar to be read. The only line left under a number is the one that
 * appears when the number is ZERO, where the tile would otherwise say nothing.
 *
 * Referenced for density: HomeworkCard, the kit's stat rows.
 */
/**
 * The two tiles wear the delivered drawings, not glyphs.
 *
 * Inlined into the document rather than hung in an `<img>`: the delivered art is
 * greyscale and gets repainted in the brand teal (see `reportArt`), and a
 * `var(--brand-*)` inside an `<img>` would resolve against that file's own
 * document, where the token does not exist. They also come at three different
 * aspect ratios (346×239, 301×346, 366×336); the root's fixed size is stripped
 * and the viewBox left alone, so each fits its box the way `object-contain`
 * would and the three line up along a common baseline.
 *
 * The plate under them no longer floods with the brand gradient on hover — that
 * treatment exists to make a monochrome glyph flip to white, and under a
 * coloured drawing it just muddied it. The tile still lifts, and the plate warms.
 */
function Stat({
  art,
  value,
  label,
  hint,
  to,
}: {
  art: string
  value: number
  label: string
  /** Only ever the ZERO case — see the note at the top of the file. */
  hint?: string
  to: string
}) {
  return (
    <Link
      to={to}
      // Column at every width: side by side, the icon and a two-line label like
      // «خدمة مازالت» set a minimum width the tiles can't honour at 390px, and
      // the row pushed the whole page into a horizontal scroll.
      // A shallower bump than the CTAs: these are tiles you can push, not the
      // decision of the screen, and a 4px slab under a full-height plate reads
      // as the panel having a second floor.
      className="group btn-bump flex min-w-0 flex-1 flex-col items-start gap-2 rounded-[16px] border-2 p-3 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] md:p-4"
      style={{
        borderColor: cream.edge,
        ["--bump" as string]: "3px",
        // Its own frame, continued underneath — the tile reads as one card on
        // its edge rather than a button with a shadow.
        ["--bump-edge" as string]: cream.edge,
      }}
    >
      {/* No plate behind the drawing — it sits straight on the panel. The white
          one was there to lift a flat glyph off the cream; these carry their own
          form and it only boxed them in. The box stays for sizing: it's what
          keeps three different aspect ratios on one baseline. */}
      <span
        aria-hidden
        className="block h-11 w-12 shrink-0 transition motion-safe:group-hover:scale-105 md:h-12 md:w-14 [&>svg]:h-full [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: art }}
      />
      <span className="min-w-0">
        <span
          className="block font-display text-[calc(24px*var(--ts))] font-bold leading-none tabular-nums"
          style={{ color: cream.ink }}
        >
          {value}
        </span>
        <span
          className="mt-1 block text-[calc(12px*var(--ts))] font-medium leading-tight"
          style={{ color: cream.ink }}
        >
          {label}
        </span>
        {hint && (
          <span className="mt-0.5 block text-[calc(11px*var(--ts))]" style={{ color: cream.inkMuted }}>
            {hint}
          </span>
        )}
      </span>
    </Link>
  )
}

export function TodayReport({ now }: { now: Date }) {
  const mySessions = useMySessions()
  const homeworks = useMyHomeworks()
  const today = dateKey(now)

  const total = useMemo(
    () => mySessions.filter((s) => s.date === today).length,
    [mySessions, today],
  )

  // Work still open: anything not yet past its deadline, plus anything undated.
  const open = useMemo(
    () => homeworks.filter((h) => !h.dueDate || h.dueDate >= today).length,
    [homeworks, today],
  )

  return (
    <CreamPanel className="min-h-[11rem]" bodyClassName="gap-3 p-4 md:p-5">
      <h2
        className="flex items-center gap-2 font-display text-[calc(17px*var(--ts))] font-bold"
        style={{ color: cream.ink }}
      >
        {/* Not a cap: the first tile is now literally one, and the same shape
            twice in one panel reads as a mistake. */}
        <BarChart3 className="size-[19px]" style={{ color: cream.inkMuted }} />
        برنامج اليوم
      </h2>

      <div className="flex flex-1 gap-2.5 md:gap-3">
        <Stat
          art={reportArt.todaySeance}
          value={total}
          label="حصص لليوم"
          hint={total === 0 ? "نهار فارغ" : undefined}
          to="/student/calendrier"
        />
        <Stat
          art={reportArt.homework}
          value={open}
          label="تمارين لازم تخدمهم"
          hint={open === 0 ? "كل شيء سالك" : undefined}
          to="/student/matieres"
        />
      </div>
    </CreamPanel>
  )
}
