import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { sfx } from "@/features/student-v2/sound"
import { FlowScreen, STEPS, WaelAside, tileClass, usePlatformCorners } from "./parts"
import { LEVEL_GROUPS, groupOf, useOnboarding, yearById, type LevelGroup } from "./flow"

/**
 * Level and section in ONE step: four big tiles (أولى · ثانية · ثالثة · باك);
 * from ثانية on, the sections open in place under them, so the choice reads
 * as one question, not a form. A single choice advances on its own after a
 * 300 ms "selected" beat (the lime lands, then the screen moves) — Back is
 * always there to change it.
 */
const ADVANCE_MS = 300

/** What Wael says once a level is tapped — derja, second person. */
function reaction(g: LevelGroup | null): string {
  if (!g) return "في أنا سنة تقرا؟"
  if (g.years.length === 1) return "أولى ثانوي، مرحبا! نختارو مادة."
  if (g.short === "باك") return "عام الباك! أنا معاك فيه. أما شعبة؟"
  return `${g.short} ثانوي، باهي. وأما شعبة؟`
}

export default function LevelScreen() {
  const navigate = useNavigate()
  const { card } = usePlatformCorners()
  const yearId = useOnboarding((s) => s.yearId)
  const setYear = useOnboarding((s) => s.setYear)
  // The open group: the chosen year's, or the one just tapped.
  const [open, setOpen] = useState<LevelGroup | null>(() => groupOf(yearById(yearId)))
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  function pickYear(id: string) {
    setYear(id)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => navigate("/mobilegame/matiere"), ADVANCE_MS)
  }

  function pickGroup(g: LevelGroup) {
    setOpen(g)
    if (g.years.length === 1) {
      sfx("select")
      pickYear(g.years[0].id)
    } else {
      sfx("expand")
    }
  }

  const chosen = yearById(yearId)
  return (
    <FlowScreen step={STEPS.level} back="/mobilegame/bienvenue" aside={<WaelAside say={reaction(open)} tone={open ? "yay" : "calm"} />}>
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto ps-2 pb-2">
        <h1 className="text-[calc(12.5px*var(--ts))] font-black leading-tight text-v2-ink">في أنا سنة تقرا؟</h1>
        <div role="radiogroup" aria-label="المستوى" className="grid grid-cols-4 gap-2.5">
          {LEVEL_GROUPS.map((g) => {
            const on = open?.level === g.level
            return (
              <button
                key={g.level}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => pickGroup(g)}
                className={cn(tileClass(on, card), "min-h-[84px] gap-0.5 py-2")}
              >
                <bdi dir="ltr" className={cn("text-[calc(17px*var(--ts))] font-black leading-none", on ? "text-v2-on-cta" : "text-v2-brand")}>
                  {g.mark}
                </bdi>
                <span className="text-[calc(9px*var(--ts))] font-extrabold">{g.short}</span>
                <span className={cn("text-[calc(7.1px*var(--ts))]", on ? "text-v2-on-cta/80" : "text-v2-ink-2")}>
                  {g.years.length === 1 ? "جذع مشترك" : `${g.years.length} شعب`}
                </span>
              </button>
            )
          })}
        </div>

        {open && open.years.length > 1 && (
          <div key={open.level} className="motion-safe:animate-[game-rise_240ms_ease-out_both]">
            <p className="mb-1.5 text-[calc(8px*var(--ts))] font-bold text-v2-ink-2">الشعبة متاعك في {open.short}</p>
            <div role="radiogroup" aria-label="الشعبة" className="flex flex-wrap gap-2 pb-1">
              {open.years.map((y) => {
                const on = chosen?.id === y.id
                return (
                  <button
                    key={y.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    data-uisfx="select"
                    onClick={() => pickYear(y.id)}
                    className={cn(tileClass(on, "rounded-full"), "min-h-11 flex-row px-4 text-[calc(8.5px*var(--ts))] font-bold")}
                  >
                    {y.section}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </FlowScreen>
  )
}
