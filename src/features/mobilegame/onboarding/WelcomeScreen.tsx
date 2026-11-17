import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { BookOpen, Gamepad2, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePlatformUi } from "../platformUi"
import { FlowScreen, STEPS, WaelAside, usePlatformCorners } from "./parts"

/**
 * « أهلا، أنا وائل » — the first thing a new student sees after the door.
 * Wael says who he is and what the next minute holds; the three steps are
 * drawn as a little route so the end (the game) is visible from the start.
 * One lime action; « عندي كونط » stays one tap away for anyone who already
 * has an account (a new phone, a reinstall) — never forced through the game.
 */
const ROUTE = [
  { icon: GraduationCap, title: "قلّي شنوّة تقرا", body: "المستوى والشعبة" },
  { icon: BookOpen, title: "اختار مادة تحبّها", body: "من البرنامج متاعك" },
  { icon: Gamepad2, title: "العب 3 أسئلة", body: "في دقيقة، بلا ما تعمل كونط" },
]

export default function WelcomeScreen() {
  const ui = usePlatformUi()
  const { card } = usePlatformCorners()
  // he greets you, then turns to present the route once the cards are on screen
  const [pose, setPose] = useState<"wave" | "present">("wave")
  useEffect(() => {
    const t = window.setTimeout(() => setPose("present"), 1800)
    return () => clearTimeout(t)
  }, [])
  return (
    <FlowScreen
      step={STEPS.welcome}
      back="/mobilegame"
      backLabel="رجوع للبداية"
      end={
        <Link to="/mobilegame/connexion" data-uisfx="forward" className={cn(ui.link, "text-[calc(8px*var(--ts))]")}>
          عندي كونط
        </Link>
      }
      aside={<WaelAside say="أهلا، أنا وائل! خلّيني نعرفك في دقيقة، ومبعد نلعبو." pose={pose} poses={["wave", "present"]} />}
    >
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-3 ps-2">
        <div>
          <p className="text-v2-grad text-[calc(7.5px*var(--ts))] font-bold">مرحبا بيك في مدينة وائل</p>
          <h1 className="text-[calc(14px*var(--ts))] font-black leading-tight text-v2-ink">نبداو بلعبة صغيرة</h1>
        </div>
        <ol className="grid grid-cols-3 gap-2.5">
          {ROUTE.map((r, i) => (
            <li
              key={r.title}
              className={cn("relative flex flex-col gap-1.5 border-2 border-v2-ink/10 bg-v2-surface p-3 motion-safe:animate-[game-rise_240ms_ease-out_both]", card)}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className="flex items-center gap-2">
                <span className={cn("grid size-8 place-items-center rounded-xl text-white", i === 2 ? "bg-v2-cta text-v2-on-cta" : "bg-v2-brand")}>
                  <r.icon className="size-[18px]" strokeWidth={2.2} />
                </span>
                <bdi dir="ltr" className="text-[calc(9px*var(--ts))] font-black tabular-nums text-v2-ink/25">
                  {i + 1}
                </bdi>
              </span>
              <span className="text-[calc(8.5px*var(--ts))] font-extrabold leading-tight text-v2-ink">{r.title}</span>
              <span className="text-[calc(7.1px*var(--ts))] leading-snug text-v2-ink-2">{r.body}</span>
            </li>
          ))}
        </ol>
        <div className="flex items-center gap-3">
          <Link to="/mobilegame/niveau" data-uisfx="forward" className={cn(ui.cta, "text-[calc(10px*var(--ts))]")}>
            يلّا نبداو
          </Link>
          <span className="text-[calc(7.1px*var(--ts))] text-v2-ink-2">بلا كونط، بلا كلمة سر</span>
        </div>
      </div>
    </FlowScreen>
  )
}
