import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Session } from "@/data/types"
import { useMySessions } from "@/features/student/dashboard/dashboard"
import { addDays, dateKey, sessionStart, useNow } from "@/features/student/calendar/schedule"
import { cn } from "@/lib/utils"
import { DayList, WeekStrip } from "../dashboard/CalendarPanel"
import { DocsPanel } from "../dashboard/DocsPanel"
import { LivePanel } from "../dashboard/LivePanel"
import { useDemoStates } from "../demoStates"
import { DocsSheet } from "../DocsSheet"
import { MONTHS, dayLabel, parseDay, useDocsPool, useLiveState, weekStart } from "../lib"
import { Panel, iconBtnClass } from "../ui"
import { WeekGrid } from "./WeekGrid"

const NONE: Session[] = []
const ORDINAL = ["الأوّل", "الثاني", "الثالث", "الرابع", "الخامس"]

/**
 * « الأسبوع الثاني من شهر سبتمبر » — the frame's own way of naming a week. A
 * week belongs to the month its Thursday falls in (so 31 Aug – 6 Sep is the
 * FIRST week of September, as the frame has it).
 */
function weekTitle(monday: Date): string {
  const thursday = addDays(monday, 3)
  return `الأسبوع ${ORDINAL[Math.ceil(thursday.getDate() / 7) - 1]} من شهر ${MONTHS[thursday.getMonth()]}`
}

/** "7 – 13 سبتمبر" · "31 أوت – 6 سبتمبر" */
function weekRange(monday: Date): string {
  const end = addDays(monday, 6)
  const same = end.getMonth() === monday.getMonth()
  return `⁦${monday.getDate()}${same ? "" : ` ${MONTHS[monday.getMonth()]}`} – ${end.getDate()} ${MONTHS[end.getMonth()]}⁩`
}

/**
 * روزنامتي — the frame « Main Pgae - Calendar months (3) », with the one change
 * asked for: the month grid becomes a WEEK.
 *
 * Layout as drawn: the calendar holds the start side and the full height; the
 * dashboard's live panel and documents panel stack beside it — the same
 * components, so every state they have there they have here. Under the week,
 * the selected day's séances as cards, with their actions (documents, replay):
 * the frame's subtitle is literally « pick a day and see its séances ».
 *
 * On a phone the time grid has no room (six columns on 390px is 50px a day),
 * so the week becomes the dashboard's strip of seven chips; the day list below
 * is the same. The live panel leads there, as on the dashboard.
 */
export default function V2CalendarScreen() {
  const now = useNow()
  const demo = useDemoStates()
  const mine = useMySessions()
  const sessions = demo.calendar === "empty" ? NONE : mine
  const docs = useDocsPool(now, demo.docs)
  const { pick, stateFor } = useLiveState(now)

  const today = dateKey(now)
  const [selected, setSelected] = useState(today)
  const [focusId, setFocusId] = useState<string | null>(null)
  const [docsFor, setDocsFor] = useState<{ session: Session; started: boolean } | null>(null)
  const openDocs = (session: Session, started: boolean) => setDocsFor({ session, started })

  const byDay = useMemo(() => {
    const map = new Map<string, Session[]>()
    for (const s of sessions) {
      const list = map.get(s.date)
      if (list) list.push(s)
      else map.set(s.date, [s])
    }
    for (const list of map.values()) list.sort((a, b) => sessionStart(a).getTime() - sessionStart(b).getTime())
    return map
  }, [sessions])

  const monday = weekStart(parseDay(selected))
  const sundayKey = dateKey(addDays(monday, 6))
  const mondayKey = dateKey(monday)
  const thisWeek = mondayKey === dateKey(weekStart(parseDay(today)))
  const inWeek = sessions.filter((s) => s.date >= mondayKey && s.date <= sundayKey)
  const nextAfter =
    sessions
      .filter((s) => s.date > sundayKey && !s.postponed)
      .sort((a, b) => sessionStart(a).getTime() - sessionStart(b).getTime())[0] ?? null

  const select = (key: string) => {
    setSelected(key)
    setFocusId(null)
  }
  const step = (dir: 1 | -1) => select(dateKey(addDays(parseDay(selected), dir * 7)))
  const openFromGrid = (s: Session) => {
    setSelected(s.date)
    setFocusId(s.id)
    // After the list re-renders for that day, bring the card into view.
    window.setTimeout(() => {
      document.getElementById(`v2-ses-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 60)
  }

  const dayCount = byDay.get(selected)?.length ?? 0

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div>
        <h1 className="text-[calc(15px*var(--ts))] font-bold text-v2-ink md:text-[calc(18px*var(--ts))] 2xl:text-[calc(20px*var(--ts))]">
          روزنامتي
        </h1>
        <p className="mt-1 text-[calc(9px*var(--ts))] text-v2-ink/70 md:text-[calc(10px*var(--ts))]">
          اختار نهار من الروزنامة وشوف حصصو.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] xl:grid-rows-[auto_1fr] 2xl:grid-cols-[minmax(0,1fr)_minmax(0,29rem)] 2xl:gap-8">
        <div className="rise min-w-0 xl:col-start-2 xl:row-start-1" style={{ ["--i" as string]: 1 }}>
          <LivePanel pick={pick} now={now} onOpenDocs={openDocs} />
        </div>

        <div className="rise min-w-0 xl:col-start-1 xl:row-span-2 xl:row-start-1" style={{ ["--i" as string]: 0 }}>
          <Panel
            title={weekTitle(monday)}
            meta={`${weekRange(monday)} · ${inWeek.length === 0 ? "ما فمّا حتّى حصّة" : `${inWeek.length} ${inWeek.length <= 10 ? "حصص" : "حصّة"}`}`}
            className="h-full"
            action={
              <div className="flex items-center gap-1">
                {!thisWeek || selected !== today ? (
                  <button
                    type="button"
                    data-uisfx="back" onClick={() => select(today)}
                    className="me-1 min-h-9 rounded-full bg-v2-brand/10 px-3 text-[calc(7.5px*var(--ts))] font-semibold text-v2-brand transition hover:bg-v2-brand/20"
                  >
                    اليوم
                  </button>
                ) : null}
                <button type="button" data-uisfx="swipe" onClick={() => step(-1)} aria-label="الجمعة اللّي فاتت" className={cn(iconBtnClass, "border border-v2-ink/15")}>
                  <ChevronRight className="size-5" />
                </button>
                <button type="button" data-uisfx="swipe" onClick={() => step(1)} aria-label="الجمعة الجاية" className={cn(iconBtnClass, "border border-v2-ink/15")}>
                  <ChevronLeft className="size-5" />
                </button>
              </div>
            }
          >
            {/* md+: the time grid. Phone: the seven-chip strip. */}
            <div className="hidden md:block">
              <WeekGrid
                monday={monday}
                byDay={byDay}
                today={today}
                selected={selected}
                now={now}
                stateFor={stateFor}
                onSelect={select}
                onOpen={openFromGrid}
                nextAfter={nextAfter}
              />
            </div>
            <div className="md:hidden">
              <WeekStrip
                monday={monday}
                selected={selected}
                today={today}
                byDay={byDay}
                stateFor={stateFor}
                onSelect={select}
                onStep={step}
              />
            </div>

            <div className="mt-6 border-t border-v2-ink/10 pt-5">
              <p className="mb-3 flex items-baseline gap-2 text-[calc(10.5px*var(--ts))] font-bold text-v2-ink">
                حصص {dayLabel(selected)}
                {dayCount > 0 && <span className="text-[calc(8px*var(--ts))] font-normal text-v2-ink/50">· {dayCount}</span>}
              </p>
              <DayList
                key={selected}
                day={selected}
                list={byDay.get(selected) ?? []}
                all={sessions}
                now={now}
                stateFor={stateFor}
                onPick={select}
                onOpenDocs={openDocs}
                focusId={focusId}
              />
            </div>
          </Panel>
        </div>

        <div className="rise min-w-0 xl:col-start-2 xl:row-start-2 xl:self-start" style={{ ["--i" as string]: 2 }}>
          <DocsPanel docs={docs} now={now} allTaken={demo.docs === "done"} layout="stack" />
        </div>
      </div>

      <DocsSheet
        session={docsFor?.session ?? null}
        started={docsFor?.started ?? false}
        onOpenChange={(open) => !open && setDocsFor(null)}
      />
    </div>
  )
}
