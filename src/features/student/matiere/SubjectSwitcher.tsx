import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { SubjectIcon } from "@/components/icons/subjects"
import { subjectTheme } from "@/features/student/subjectTheme"
import { subjectTint } from "@/features/student/subjectTint"
import { cn } from "@/lib/utils"
import type { Subject } from "@/data/types"

/**
 * The matière switcher that sits under the page title — every matière of the
 * élève's année, one tap away, without a trip back to the list.
 *
 * Accessibility is the point here, so it's a real `<nav>` of real links:
 * `aria-current="page"` marks the open matière, the active tile is scrolled
 * into view on arrival, and the rail is arrow-key scrollable with visible
 * chevrons at `md+` (touch users just swipe). Tiles are 44px+ tall.
 *
 * `hrefFor` lets another section reuse the rail against its own routes — the
 * séances enregistrées library passes its own page + année scolaire.
 */
export function SubjectSwitcher({
  subjects,
  activeId,
  hrefFor = (subject) => `/student/matieres/${subject.id}`,
}: {
  subjects: Subject[]
  activeId: string
  hrefFor?: (subject: Subject) => string
}) {
  const railRef = useRef<HTMLDivElement | null>(null)
  const [overflow, setOverflow] = useState({ start: false, end: false })

  const measure = useCallback(() => {
    const el = railRef.current
    if (!el) return
    // `scrollLeft` goes negative under RTL — compare on the absolute distance.
    const x = Math.abs(el.scrollLeft)
    const max = el.scrollWidth - el.clientWidth
    setOverflow({ start: x > 8, end: max - x > 8 })
  }, [])

  useEffect(() => {
    measure()
    const el = railRef.current
    if (!el) return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure, subjects.length])

  // Land on the open matière even when it sits far down the rail.
  useEffect(() => {
    railRef.current
      ?.querySelector('[aria-current="page"]')
      ?.scrollIntoView({ block: "nearest", inline: "center" })
  }, [activeId])

  function scrollBy(direction: -1 | 1) {
    const el = railRef.current
    if (!el) return
    el.scrollBy({ left: direction * Math.round(el.clientWidth * 0.7), behavior: "smooth" })
  }

  const arrow = (side: "start" | "end") => {
    const shown = side === "start" ? overflow.start : overflow.end
    const Icon = side === "start" ? ChevronLeft : ChevronRight
    return (
      <button
        type="button"
        onClick={() => scrollBy(side === "start" ? -1 : 1)}
        tabIndex={-1}
        aria-hidden="true"
        className={cn(
          "absolute top-1/2 z-10 hidden size-8 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface text-ink-subtle shadow-md transition hover:text-brand-600 md:grid",
          side === "start" ? "start-0 -ms-1" : "end-0 -me-1",
          shown ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <Icon className="size-4" />
      </button>
    )
  }

  return (
    <nav aria-label="Changer de matière" className="relative">
      {arrow("start")}
      {arrow("end")}

      <div
        ref={railRef}
        onScroll={measure}
        className="-mx-1 flex gap-2 overflow-x-auto scroll-touch px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {subjects.map((subject) => {
          const active = subject.id === activeId
          const theme = subjectTheme(subject.category)
          return (
            <Link
              key={subject.id}
              to={hrefFor(subject)}
              aria-current={active ? "page" : undefined}
              title={subject.name}
              className={cn(
                "inline-flex h-11 shrink-0 items-center gap-2 rounded-md border bg-surface ps-1.5 pe-3 transition",
                active
                  ? cn("ring-2", theme.ring)
                  : "border-border-strong hover:border-brand-200 hover:shadow-sm",
              )}
            >
              <span
                className="grid size-8 shrink-0 place-items-center rounded-[9px]"
                style={{ backgroundColor: subjectTint(subject.name, subject.category).panel }}
              >
                <SubjectIcon name={subject.name} className="size-7" />
              </span>
              <span
                dir="auto"
                className={cn(
                  "max-w-[9rem] truncate text-[13px] font-medium",
                  active ? theme.name : "text-ink-subtle",
                )}
              >
                {subject.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
