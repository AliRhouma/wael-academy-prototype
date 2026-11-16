import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ChevronDown, Library } from "lucide-react"
import { cn } from "@/lib/utils"
import { useData } from "@/stores/useData"
import { matiereOf } from "@/data/matiere"
import { subjectTint } from "@/features/student/subjectTint"
import { BASE, dropDay } from "../lib"
import { PortraitStage } from "../PortraitStage"
import { PanelEmpty, tileClass } from "../ui"
import { useSubjectSections, type SubjectSection } from "./matieres"

type Filter = "all" | "filled"

/** A matière with what is actually published behind it. */
interface Card {
  subject: SubjectSection["subjects"][number]
  chapters: number
  contents: number
  /** Contenus carrying a replay — what the card actually counts. */
  videos: number
}

/** A filière, its matières counted, ready to draw. */
interface Section {
  year: SubjectSection["year"]
  mine: boolean
  cards: Card[]
  contents: number
}

/**
 * « موادي » — the way in to the matière page: every matière of the élève's
 * filière, Wael dressed for it among the designer's doodles, and what is
 * actually published behind each one.
 *
 * Same card as « تسجيلات » on purpose. The two pages are the same gesture —
 * pick a matière, then look inside — and an élève should not have to learn the
 * grid twice. What changes is the number: replays there, chapitres here.
 *
 * THE WHOLE PROGRAMME, IN ONE PAGE. The six bacs are all here now, one section
 * each, because they are one library: the philo chapitre published for les
 * sciences is the same chapitre in maths, lettres and technique. But the page
 * is still « موادي » and not a catalogue — the élève's own filière leads, wears
 * « شعبتك », and is the only section that starts open. The others are a line of
 * text each until they are asked for, so a page that holds a hundred-odd
 * matières still opens on the eighteen that are the élève's.
 *
 * « فيها محتوى » cuts across all of them at once and opens every section it
 * keeps — asking to see what's published and then having to unfold six
 * headings to find it would be the filter refusing to do its job.
 */
export default function V2SubjectsScreen() {
  const sections = useSubjectSections()
  const chapters = useData((s) => s.chapters)
  const lessons = useData((s) => s.lessons)
  const [filter, setFilter] = useState<Filter>("all")
  // Only mine starts open; the store is synchronous, so the first render
  // already knows which filière that is.
  const [open, setOpen] = useState<string[]>(() =>
    sections.filter((s) => s.mine).map((s) => s.year.id),
  )

  const all = useMemo<Section[]>(
    () =>
      sections.map((section) => {
        const cards = section.subjects.map((subject) => {
          const mine = chapters.filter((c) => c.subjectIds.includes(subject.id))
          const ids = new Set(mine.map((c) => c.id))
          const items = lessons.filter((l) => ids.has(l.chapterId))
          return {
            subject,
            chapters: mine.length,
            contents: items.length,
            videos: items.filter((l) => l.videoUrl).length,
          }
        })
        return {
          year: section.year,
          mine: section.mine,
          cards,
          contents: cards.reduce((n, c) => n + c.contents, 0),
        }
      }),
    [sections, chapters, lessons],
  )

  /** The same sections with only the matières that have something in them. */
  const shown = useMemo<Section[]>(() => {
    if (filter === "all") return all
    return all
      .map((s) => ({ ...s, cards: s.cards.filter((c) => c.contents > 0) }))
      .filter((s) => s.cards.length > 0)
  }, [all, filter])

  // Calculé une fois pour la page : toutes les matières vides annoncent le
  // même jour, et la valeur ne change pas d'une carte à l'autre.
  const drop = dropDay()

  const subjectCount = all.reduce((n, s) => n + s.cards.length, 0)
  const filled = all.reduce((n, s) => n + s.cards.filter((c) => c.contents > 0).length, 0)
  const contents = all.reduce((n, s) => n + s.contents, 0)

  if (subjectCount === 0) {
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
          <h1 className="text-[calc(15px*var(--ts))] font-bold text-v2-ink md:text-[calc(18px*var(--ts))]">الدروس</h1>
          <p className="text-[calc(8.5px*var(--ts))] text-v2-ink-2">
            {contents} محتوى في {filled} مواد · {shown.length} شعب
          </p>
        </div>
        <div role="tablist" aria-label="فرز المواد" className="v2-seg flex rounded-full border border-v2-ink/15 bg-v2-surface p-1">
          {(
            [
              ["all", `الكل · ${subjectCount}`],
              ["filled", `فيها محتوى · ${filled}`],
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
                "v2-chip min-h-11 rounded-full px-4 text-[calc(8.5px*var(--ts))] font-semibold transition",
                filter === value ? "bg-v2-cta text-v2-on-cta" : "text-v2-ink/70 hover:text-v2-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 md:gap-5">
        {shown.map((section) => {
          // The filter opens what it keeps; otherwise the élève decides.
          const expanded = filter === "filled" || open.includes(section.year.id)
          const gridId = `v2-mat-${section.year.id}`
          return (
            <section key={section.year.id} aria-labelledby={`${gridId}-h`}>
              {/* THE HEADING IS THE CONTROL. A separate chevron button would put
                  a 24px target next to a title nobody could tap — the whole row
                  opens the filière instead, and stays a heading for a reader. */}
              <h2 id={`${gridId}-h`}>
                <button
                  type="button"
                  data-uisfx={expanded ? "collapse" : "expand"}
                  onClick={() =>
                    setOpen((ids) =>
                      ids.includes(section.year.id)
                        ? ids.filter((id) => id !== section.year.id)
                        : [...ids, section.year.id],
                    )
                  }
                  aria-expanded={expanded}
                  aria-controls={gridId}
                  disabled={filter === "filled"}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-start transition",
                    "hover:bg-v2-surface disabled:cursor-default disabled:hover:bg-transparent",
                  )}
                >
                  <ChevronDown
                    aria-hidden
                    className={cn(
                      "size-4 shrink-0 text-v2-ink-2 transition-transform",
                      !expanded && "-rotate-90 rtl:rotate-90",
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="truncate text-[calc(11px*var(--ts))] font-bold text-v2-ink md:text-[calc(12.5px*var(--ts))]">
                        {section.year.name}
                      </span>
                      {section.mine && (
                        <span className="rounded-full bg-v2-cta px-2 py-0.5 text-[calc(7.5px*var(--ts))] font-semibold text-v2-on-cta">
                          شعبتك
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[calc(8px*var(--ts))] text-v2-ink-2">
                      {section.cards.length} مواد
                      {section.contents > 0 ? ` · ${section.contents} محتوى` : " · مازال ما فمّاش محتوى"}
                    </span>
                  </span>
                </button>
              </h2>

              {expanded && (
                <ul
                  id={gridId}
                  className="mt-3 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4 2xl:gap-6"
                >
                  {section.cards.map((card, i) => (
                    <li key={card.subject.id} className="rise min-w-0" style={{ ["--i" as string]: Math.min(i, 12) }}>
                      {/* A game tile under the play skin: the lip takes the
                          matière's own measured colour (`subjectTint`), so a
                          grid of twenty reads as twenty, not as one. */}
                      <Link
                        to={`${BASE}/matieres/${card.subject.id}`}
                        data-uisfx="open"
                        style={{ ["--v2-lip" as string]: subjectTint(card.subject.name).dot }}
                        className={cn(
                          tileClass,
                          "group flex h-full flex-col overflow-hidden rounded-3xl border border-v2-ink/15 bg-v2-surface transition hover:-translate-y-0.5 hover:border-v2-ink/30 hover:shadow-lg",
                        )}
                      >
                        <PortraitStage name={card.subject.name} />
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5 border-t border-v2-ink/10 px-3 py-3 md:px-4 md:py-4">
                          {/* La matière seule : la filière est déjà le titre de
                              la section au-dessus, la répéter sur chacune des
                              dix-huit cartes ne dit rien de plus. */}
                          <p className="truncate text-[calc(10px*var(--ts))] font-bold text-v2-ink md:text-[calc(11.5px*var(--ts))]" dir="auto">
                            {matiereOf(card.subject.name)}
                          </p>
                          <p
                            data-on={card.contents > 0}
                            className={cn(
                              "v2-count mt-1 text-[calc(8.5px*var(--ts))] font-semibold",
                              card.contents > 0 ? "text-v2-brand" : "text-v2-ink-2",
                            )}
                          >
                            {/* Les محاور et les vidéos : ce que l'élève vient
                                chercher. Un contenu sans replay (un document
                                seul) ne se compte pas ici — la carte promet
                                des vidéos, elle doit en promettre le nombre
                                exact. */}
                            {card.contents > 0
                              ? `${card.chapters} محاور · ${card.videos} فيديو`
                              : `يهبط غدوة · ${drop}`}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
