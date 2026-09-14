import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Library } from "lucide-react"
import { cn } from "@/lib/utils"
import { useData } from "@/stores/useData"
import { BASE, frenchName } from "../lib"
import { PortraitStage } from "../PortraitStage"
import { PanelEmpty } from "../ui"
import { useMySubjects } from "./matieres"

type Filter = "all" | "filled"

/**
 * « موادي » — the way in to the matière page: every matière of the élève's
 * année, Wael dressed for it among the designer's doodles, and what is
 * actually published behind each one.
 *
 * Same card as « تسجيلات » on purpose. The two pages are the same gesture —
 * pick a matière, then look inside — and an élève should not have to learn the
 * grid twice. What changes is the number: replays there, chapitres here.
 */
export default function V2SubjectsScreen() {
  const subjects = useMySubjects()
  const chapters = useData((s) => s.chapters)
  const lessons = useData((s) => s.lessons)
  const [filter, setFilter] = useState<Filter>("all")

  const cards = useMemo(
    () =>
      subjects.map((subject) => {
        const mine = chapters.filter((c) => c.subjectIds.includes(subject.id))
        const ids = new Set(mine.map((c) => c.id))
        return {
          subject,
          chapters: mine.length,
          contents: lessons.filter((l) => ids.has(l.chapterId)).length,
        }
      }),
    [subjects, chapters, lessons],
  )

  const filled = cards.filter((c) => c.contents > 0)
  const shown = filter === "filled" ? filled : cards
  const total = filled.reduce((n, c) => n + c.contents, 0)

  if (cards.length === 0) {
    return (
      <PanelEmpty
        icon={Library}
        title="ما فمّاش مواد"
        body="المستوى متاعك مازال ما تعمّرش بالمواد. كي يتعمّر، تلقاهم الكل هوني."
      />
    )
  }

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[calc(15px*var(--ts))] font-bold text-v2-ink md:text-[calc(18px*var(--ts))]">موادي</h1>
          <p className="text-[calc(8.5px*var(--ts))] text-v2-ink/55">
            {total} محتوى في {filled.length} مواد
          </p>
        </div>
        <div role="tablist" aria-label="فرز المواد" className="flex rounded-full border border-v2-ink/15 bg-v2-surface p-1">
          {(
            [
              ["all", `الكل · ${cards.length}`],
              ["filled", `فيها محتوى · ${filled.length}`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={filter === value}
              data-uisfx="toggle-on"
              onClick={() => setFilter(value)}
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
        {shown.map((card, i) => (
          <li key={card.subject.id} className="rise min-w-0" style={{ ["--i" as string]: Math.min(i, 12) }}>
            <Link
              to={`${BASE}/matieres/${card.subject.id}`}
              data-uisfx="open"
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-v2-ink/15 bg-v2-surface transition hover:-translate-y-0.5 hover:border-v2-ink/30 hover:shadow-lg"
            >
              <PortraitStage name={card.subject.name} />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 border-t border-v2-ink/10 px-3 py-3 md:px-4 md:py-4">
                <p className="truncate text-[calc(10px*var(--ts))] font-bold text-v2-ink md:text-[calc(11.5px*var(--ts))]" dir="auto">
                  {card.subject.name}
                </p>
                <p className="truncate text-[calc(8px*var(--ts))] text-v2-ink/50" dir="ltr">
                  {frenchName(card.subject.name)}
                </p>
                <p
                  className={cn(
                    "mt-1 text-[calc(8.5px*var(--ts))] font-semibold",
                    card.contents > 0 ? "text-v2-brand" : "text-v2-ink/45",
                  )}
                >
                  {card.contents > 0 ? `${card.chapters} فصول · ${card.contents} محتوى` : "مازال ما فمّاش محتوى"}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
