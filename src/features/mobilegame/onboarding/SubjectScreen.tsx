import { useEffect, type CSSProperties } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Clock3, Gamepad2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Subject3D } from "./art3d"
import { usePlatformUi } from "../platformUi"
import { FlowScreen, STEPS, Tag, WaelAside, tileClass, usePlatformCorners } from "./parts"
import { matieresOf, quizFor, useOnboarding, yearById, yearLabel } from "./flow"

/**
 * The favourite matière, from the student's own programme: the subject badges
 * (their eyes follow the pointer) in a grid. Tapping one does NOT start the
 * game — Wael says what he understood (« باك علوم · رياضيات · 3 أسئلة ·
 * دقيقة ») and the lime « يلّا نلعبو » starts it. Picking is a choice;
 * starting is a commitment, so it gets its own button.
 */
export default function SubjectScreen() {
  const navigate = useNavigate()
  const ui = usePlatformUi()
  const { card } = usePlatformCorners()
  const { yearId, subject, setSubject } = useOnboarding()
  const year = yearById(yearId)
  const matieres = matieresOf(yearId)

  // Landed here without a level (a deep link, a refresh): go and pick one.
  useEffect(() => {
    if (!year) navigate("/mobilegame/niveau", { replace: true })
  }, [year, navigate])

  const picked = matieres.find((m) => m.name === subject) ?? null
  const ready = !!picked && quizFor(yearId, picked.name).length === 3
  const cols = matieres.length > 8 ? "grid-cols-5" : "grid-cols-4"

  return (
    <FlowScreen
      step={STEPS.subject}
      back="/mobilegame/niveau"
      aside={
        <WaelAside
          say={picked ? `${picked.label}؟ اختيار باهي! حضّرتلك 3 أسئلة من البرنامج.` : "شنيّة المادة اللي تحبّها برشا؟"}
          tone={picked ? "yay" : "calm"}
          pose={picked ? "nod" : "present"}
          poses={["present", "nod"]}
        />
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-2 ps-2">
        <div className="flex items-center gap-2">
          <h1 className="text-[calc(14px*var(--ts))] font-black leading-tight text-white">اختار مادة تحبّها</h1>
          <Tag>{yearLabel(year)}</Tag>
        </div>

        <div role="radiogroup" aria-label="المادة" className={cn("deal grid min-h-0 flex-1 auto-rows-fr gap-2 overflow-y-auto px-0.5 pt-1 pb-1.5 [scrollbar-width:none]", cols)}>
          {matieres.map((m, i) => {
            const on = m.name === subject
            return (
              <button
                key={m.name}
                type="button"
                role="radio"
                aria-checked={on}
                data-uisfx="select"
                onClick={() => setSubject(m.name)}
                style={{ "--i": i } as CSSProperties}
                className={cn(tileClass(on, card), "group min-h-[64px] gap-0.5 px-1 py-1.5")}
              >
                <Subject3D name={m.name} className="aspect-square min-h-0 w-auto max-h-[4.1rem] flex-1 transition-transform duration-150 group-active:scale-x-[1.06] group-active:scale-y-[.94]" />
                <span className="line-clamp-1 text-[calc(7.5px*var(--ts))] font-extrabold leading-tight">{m.label}</span>
              </button>
            )
          })}
        </div>

        <div className={cn("flex shrink-0 items-center gap-3 border-2 border-white/15 bg-[#0b2d3a]/85 p-2 ps-3", card)}>
          {picked ? (
            <p className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5 text-[calc(7.5px*var(--ts))] font-bold text-white">
              <span className="truncate">{yearLabel(year)} · {picked.label}</span>
              <span className="inline-flex items-center gap-1 text-white/65">
                <Gamepad2 className="size-3.5" strokeWidth={2.2} /> <bdi dir="ltr">3</bdi> أسئلة
              </span>
              <span className="inline-flex items-center gap-1 text-white/65">
                <Clock3 className="size-3.5" strokeWidth={2.2} /> دقيقة
              </span>
            </p>
          ) : (
            <p className="flex-1 text-[calc(7.5px*var(--ts))] text-white/70">اختار مادة، ووائل يحضّرلك التحدّي.</p>
          )}
          {ready ? (
            <Link viewTransition to="/mobilegame/defi" data-uisfx="start" className={cn(ui.cta, "shrink-0 text-[calc(9.5px*var(--ts))]")}>
              يلّا نلعبو
            </Link>
          ) : (
            <span aria-disabled className={cn(ui.cta, "shrink-0 cursor-default text-[calc(9.5px*var(--ts))] opacity-50 shadow-none")}>
              يلّا نلعبو
            </span>
          )}
        </div>
      </div>
    </FlowScreen>
  )
}
