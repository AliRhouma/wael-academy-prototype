import { CheckCheck, Download, FileText } from "lucide-react"
import { CreamPanel, cream } from "@/components/kit/CreamPanel"
import { PanelEmpty } from "@/features/student/dashboard/PanelEmpty"
import { profName } from "@/features/student/homework"
import { useDemoDocs, type TodayDoc } from "@/features/student/dashboard/dashboard"
import { pdfFileName, pdfSrc } from "@/data/media"
import { edgeMask, useScrollEdges } from "@/lib/hooks"
import { useData } from "@/stores/useData"

/**
 * Section 4 — تمارين لازم تخدمهم: the documents due for today's remaining
 * séances.
 *
 * Scoped deliberately. The panel used to list every open خدمة the profs had
 * ever sent, which made it a backlog — and a backlog is something you scroll
 * past, not something you act on. Cut to "the séances still ahead of you today"
 * it becomes a packing list: these are the files to have open when you walk in,
 * and the list empties itself as the day goes by.
 *
 * One row per PDF, not per خدمة, because the élève downloads files — a خدمة
 * carrying three documents is three things to fetch and should count as three.
 *
 * The list SCROLLS inside a fixed height rather than growing the panel: it
 * shares a row with the live section and the day's agenda, and a panel that
 * stretches to fit eleven documents drags both of its neighbours down with it.
 *
 * Referenced for spacing & density: WeekAgenda (the same bordered card per
 * item), RecentSeances (document row), LiveNowPanel (title row).
 */
/** Stable, so the empty state never hands the list a new array each render. */
const EMPTY: TodayDoc[] = []

function DocRow({ row }: { row: TodayDoc }) {
  const teachers = useData((s) => s.teachers)
  const subjects = useData((s) => s.subjects)
  const teacher = teachers.find((t) => t.id === row.homework.teacherId)
  const subject = subjects.find((s) => s.id === row.homework.subjectId)

  return (
    // Each document is a thing to pick up and take, so it is drawn as an object
    // with edges rather than as a line in a ruled list.
    //
    // THE WHOLE ROW is the download — one link filling the card, not a link
    // parked in the corner of one. A row that is 240px of nothing plus a 36px
    // target makes the élève aim; and the row says nothing the button doesn't,
    // so there was never a second thing here to click. The plate on the end
    // stays as the AFFORDANCE (it lights on `group-hover`), but it is now
    // decoration — `aria-hidden`, no tab stop of its own — because an anchor
    // inside an anchor is not a thing.
    <li>
      <a
        href={pdfSrc(row.pdf)}
        download={pdfFileName(row.pdf.name)}
        // No background wash on hover. Flooding the card with `brand-50` put
        // the title on a tinted ground, cost it its contrast, and read as a
        // SELECTED row rather than one you are about to take — three plates of
        // colour on a 40px row, none of them saying which one acts. What moves
        // now is the frame (a step darker), the slab under the card (it lifts,
        // see `.btn-bump`), the title, and the one plate that does the work.
        className="group btn-bump flex w-full items-center gap-2.5 rounded-[14px] border-2 border-brand-200 bg-surface px-2.5 py-2 text-start transition hover:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
        style={{ ["--bump" as string]: "3px", ["--bump-edge" as string]: cream.edge }}
      >
        <span
          className="grid size-8 shrink-0 place-items-center rounded-[10px] border-2 transition"
          style={{ borderColor: cream.edge, color: "var(--ink-muted)" }}
        >
          <FileText className="size-4" />
        </span>

        <span className="min-w-0 flex-1">
          <span
            dir="auto"
            title={`${row.pdf.name} — ${profName(teacher)}`}
            // No `block`: line-clamp sets its own display and `block` wins over it.
            className="font-display text-[calc(12px*var(--ts))] font-bold leading-tight text-ink transition line-clamp-2 group-hover:text-brand-700"
          >
            {row.pdf.name}
          </span>
          <span
            className="mt-0.5 flex items-center gap-1 text-[calc(10.5px*var(--ts))]"
            style={{ color: cream.inkMuted }}
          >
            <span dir="auto" className="truncate">
              {subject?.name}
            </span>
            {/* The hour is what ranks this row against the others — it says how
              long you have, which the document's name never does. */}
            <span className="shrink-0 font-semibold tabular-nums">· {row.session.startTime}</span>
          </span>
        </span>

        {/* The affordance, not the target — the row around it is the link. */}
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-[10px] border-2 transition group-hover:[background:var(--brand-500)] group-hover:text-white"
          style={{ borderColor: cream.edge, color: "var(--brand-600)" }}
        >
          <Download className="size-4" />
        </span>
      </a>
    </li>
  )
}

/**
 * `show` is the dashboard's K-key demo switch, not a product prop: false renders
 * the empty state on demand, so both halves of the panel are reachable from one
 * screen at any hour. See `StudentDashboard` for why the control is invisible.
 */
export function HomeworkList({ now, show }: { now: Date; show: boolean }) {
  const pool = useDemoDocs(now)
  const docs = show ? pool : EMPTY
  // The queue is clipped at a fixed height, so the row at the fold is cut
  // mid-card with nothing to say there are four more under it.
  const { ref, edges } = useScrollEdges<HTMLUListElement>("y", docs.length)

  return (
    <CreamPanel className="min-h-[13rem]" bodyClassName="gap-2 p-4 md:p-5">
      {/* The counter floats rather than sitting in a flex row: this column is
          the narrow one and the title already wraps, and a flex sibling would
          reserve its width on EVERY line instead of only the one it sits on.
          `leading-none` keeps its box shorter than a line so it doesn't bleed
          into the second. */}
      <div>
        {docs.length > 0 && (
          <span
            className="float-end ms-2 mt-[5px] text-[calc(11.5px*var(--ts))] leading-none"
            style={{ color: cream.inkMuted }}
          >
            {docs.length}
          </span>
        )}
        <h2
          className="font-display text-[calc(17px*var(--ts))] font-bold leading-tight"
          style={{ color: cream.ink }}
        >
          تمارين لازم تخدمهم
        </h2>
        <p className="mt-0.5 text-[calc(11.5px*var(--ts))]" style={{ color: cream.inkMuted }}>
          وثائق حصص اليوم الجايّة
        </p>
      </div>

      {docs.length === 0 ? (
        <PanelEmpty
          icon={CheckCheck}
          title="ما فماش وثيقة تستنّاك"
          description="حصص اليوم الجايّة ما عندهاش وثائق تتحمّل. مبروك عليك."
        />
      ) : (
        // Scrolls inside its own box. `overscroll-contain` so reaching the end
        // doesn't hand the gesture to the page and jump the whole dashboard.
        <ul
          ref={ref}
          // `py-1` is headroom for the rows' own lift and the slab under them:
          // this box scrolls AND is masked, and both clip to it, so without the
          // padding the first row loses its top edge on hover and the last one
          // sits on a cut-off edge.
          className="flex max-h-[13.5rem] flex-1 flex-col gap-2 overflow-y-auto overscroll-contain py-1 pe-1"
          style={edgeMask("y", edges)}
        >
          {docs.map((row) => (
            <DocRow key={row.id} row={row} />
          ))}
        </ul>
      )}
    </CreamPanel>
  )
}
