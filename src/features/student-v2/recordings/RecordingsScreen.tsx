import { useState } from "react"
import { Link } from "react-router-dom"
import { Clock, Play } from "lucide-react"
import { useNow } from "@/features/student/calendar/schedule"
import { cn } from "@/lib/utils"
import { BASE, frenchName } from "../lib"
import { PortraitStage } from "../PortraitStage"
import { recordingCount, useShelves, type SubjectShelf } from "./recordings"

type Filter = "all" | "recorded"

/**
 * تسجيلات — the frame « Recording »: one card per matière, Wael dressed for
 * it among the designer's doodles, then « 34 تسجيل », the matière and
 * « أدخل للتسجيل ».
 *
 * Every matière of the élève's filière gets its card — all seventeen drawings
 * appear, the five the frame left out coming from « Group 7 » — so the page
 * doubles as the full cast. Matières with replays lead; the rest keep their
 * card with a quiet « مازال ما فمّاش » instead of a fake count, and the filter
 * hides them in one tap. A matière with a replay from the last days wears the
 * dashboard's NEW corner.
 */
export default function V2RecordingsScreen() {
  const now = useNow()
  const shelves = useShelves(now)
  const [filter, setFilter] = useState<Filter>("all")

  const withReplays = shelves.filter((s) => s.recorded.length > 0)
  const total = withReplays.reduce((n, s) => n + s.recorded.length, 0)
  const shown = filter === "recorded" ? withReplays : shelves

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[calc(15px*var(--ts))] font-bold text-v2-ink md:text-[calc(18px*var(--ts))]">تسجيلات</h1>
          <p className="text-[calc(8.5px*var(--ts))] text-v2-ink/55">
            {total} تسجيل في {withReplays.length} مواد
          </p>
        </div>
        <div role="tablist" aria-label="فرز المواد" className="flex rounded-full border border-v2-ink/15 bg-v2-surface p-1">
          {(
            [
              ["all", `الكل · ${shelves.length}`],
              ["recorded", `فيها تسجيلات · ${withReplays.length}`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={filter === value}
              data-uisfx="toggle-on" onClick={() => setFilter(value)}
              className={cn(
                "min-h-10 rounded-full px-4 text-[calc(8.5px*var(--ts))] font-semibold transition",
                filter === value ? "bg-v2-grad text-white" : "text-v2-ink/70 hover:text-v2-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4 2xl:gap-6">
        {shown.map((shelf, i) => (
          <li key={shelf.subject.id} className="rise min-w-0" style={{ ["--i" as string]: Math.min(i, 12) }}>
            <ShelfCard shelf={shelf} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function ShelfCard({ shelf }: { shelf: SubjectShelf }) {
  const { subject, recorded, fresh } = shelf
  const empty = recorded.length === 0

  return (
    <Link data-uisfx="open"
      to={`${BASE}/seances/${subject.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-v2-ink/15 bg-v2-surface transition duration-300 hover:-translate-y-1 hover:border-v2-brand/40 hover:shadow-xl hover:shadow-v2-ink/[0.07] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v2-brand"
    >
      {fresh && (
        <span className="absolute end-0 top-0 z-10 rounded-es-2xl bg-v2-grad px-3 py-1 text-[calc(7.5px*var(--ts))] font-bold tracking-wide text-white md:px-4 md:py-1.5">
          NEW
        </span>
      )}

      <PortraitStage name={subject.name} />

      {/* Sized to the frame at xl (≈16 / 22 / 17 px); a phone's two columns
          get a step down so « Sciences de la vie et de la terre » still fits. */}
      <div className="mx-[7%] mb-[7%] flex flex-1 flex-col items-center justify-center rounded-2xl border border-v2-ink/20 px-2 py-2.5 text-center md:py-3 xl:py-3.5">
        <p
          className={cn(
            "text-[calc(7px*var(--ts))] md:text-[calc(8px*var(--ts))] xl:text-[calc(10px*var(--ts))]",
            empty ? "text-v2-ink/45" : "text-v2-ink/65",
          )}
        >
          {recordingCount(recorded.length)}
        </p>
        <p className="line-clamp-2 text-[calc(9px*var(--ts))] font-bold leading-snug text-v2-ink md:text-[calc(11px*var(--ts))] xl:text-[calc(13.5px*var(--ts))]">
          {frenchName(subject.name)}
        </p>
        {empty ? (
          <span className="mt-1 inline-flex items-center gap-1.5 text-[calc(7.5px*var(--ts))] text-v2-ink/45 xl:text-[calc(9.5px*var(--ts))]">
            <Clock className="size-3.5 xl:size-4" />
            التسجيلات جايين
          </span>
        ) : (
          <span className="mt-1 inline-flex items-center gap-1.5 text-[calc(7.5px*var(--ts))] font-medium text-v2-ink transition group-hover:text-v2-brand md:text-[calc(8.5px*var(--ts))] xl:text-[calc(11px*var(--ts))]">
            أدخل للتسجيل
            <span className="grid size-5 place-items-center rounded-full border-[1.5px] border-v2-brand text-v2-brand transition group-hover:border-transparent group-hover:bg-v2-grad group-hover:text-white xl:size-6">
              <Play className="size-2.5 translate-x-[-0.5px] fill-current xl:size-3" />
            </span>
          </span>
        )}
      </div>
    </Link>
  )
}
