import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Gamepad2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/stores/useAuth"
import { GameLogo } from "@/features/game/shared/parts"
import townIsland from "@/assets/splash/town_island.webp"
import { Wael3D } from "@/features/game/shared/Wael3D"
import { MobileScreen } from "./MobileGameLayout"
import { usePlatformUi } from "./platformUi"
import { useOnboarding } from "./onboarding/flow"
import "./splash.css"

/**
 * The app's first screen — Option B of docs/3d/3d-characters-and-ui-effects.md
 * § 6, « presenter beside his town »: the floating 3D town at the end side,
 * وائل in 3D at the inner edge of the art, turned toward the CTA, the text and
 * one lime CTA at the start side under the right thumb.
 *
 * - First paint = the flat --v2-deep (the OS launch colour); the chapter
 *   gradient and the glow fade in. The CTA is tappable from frame one. No fake
 *   loading bar: the splash is a door, not a wait.
 * - Entrance under 600 ms (splash.css), first visit of the session only. One
 *   ambient loop (the island bob), a blink every 4–7 s, and for a new guest one
 *   gaze nudge: after ~5 s وائل turns from waving at you to presenting the CTA.
 *   All of it stops after 20 s idle or when the page is hidden, and none of it
 *   runs under reduced motion (the final composite is simply there).
 * - Who sees what: a new guest gets the wave + « يلّا نبداو »; a guest who
 *   finished the 3 questions and a signed-in student get the presenting pose.
 * - Per platform (wael-mobile-ios / -android): the CTA's size (50 pt capsule
 *   vs 56 dp) and the secondary (white-tinted fill vs outlined).
 */

// the entrance plays once per session; coming back to the splash just shows it
let enteredThisSession = false

type Pose = "wave" | "present"

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

/** The wave→present nudge once; after 20 s the bob and the blink go to sleep. */
function useWaelLife(startPose: Pose, nudge: boolean) {
  const [pose, setPose] = useState<Pose>(startPose)
  const [asleep, setAsleep] = useState(false)
  const timers = useRef<number[]>([])

  useEffect(() => setPose(startPose), [startPose])

  useEffect(() => {
    if (reducedMotion()) return
    const t = timers.current
    let alive = true
    const later = (fn: () => void, ms: number) => t.push(window.setTimeout(() => alive && fn(), ms))
    if (nudge) later(() => setPose("present"), 5000)
    later(() => {
      alive = false
      setAsleep(true)
    }, 20000)
    return () => {
      alive = false
      t.forEach(clearTimeout)
      timers.current = []
    }
  }, [nudge])

  return { pose, asleep }
}

export default function SplashScreen() {
  const user = useAuth((s) => s.currentUser)
  const finished = useOnboarding((s) => s.finished)
  const ui = usePlatformUi()
  const newGuest = !user && !finished
  const { pose, asleep } = useWaelLife(newGuest ? "wave" : "present", newGuest)
  const [enter] = useState(() => !enteredThisSession)
  useEffect(() => {
    enteredThisSession = true
  }, [])

  return (
    <MobileScreen className={cn("bg-v2-deep text-white", enter && "sp-enter")}>
      {/* L1 — the chapter gradient, the brand's graph paper and a glow behind the town; they fade in over the flat launch colour */}
      <div aria-hidden className="sp-glow pointer-events-none absolute inset-0 bg-v2-chapter" />
      <div
        aria-hidden
        className="sp-glow pointer-events-none absolute inset-0 opacity-[.07]"
        style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }}
      />
      <div
        aria-hidden
        className="sp-glow pointer-events-none absolute inset-y-0 end-0 w-[60%]"
        style={{ background: "radial-gradient(48% 52% at 42% 40%, color-mix(in oklab, var(--v2-cta) 22%, transparent), transparent 70%)" }}
      />

      <div className="relative grid h-full grid-cols-[1fr_1.12fr] items-center gap-4 ps-4 pe-2">
        {/* L6 — the words and the one way in */}
        <div className="relative z-10">
          <GameLogo light className="sp-text h-9 w-[4.2rem]" />
          <span
            className="sp-text mt-4 inline-flex items-center gap-1.5 rounded-full bg-v2-cta px-2.5 py-1 text-[calc(7.1px*var(--ts))] font-extrabold text-v2-on-cta"
            style={{ ["--i" as string]: 1 }}
          >
            <Gamepad2 className="size-3.5" strokeWidth={2.4} /> وضع اللعب
          </span>
          <h1 className="sp-text mt-2 text-[calc(22px*var(--ts))] font-black leading-[1.1] text-white" style={{ ["--i" as string]: 2 }}>
            مدينة وائل
          </h1>
          <p className="sp-text mt-2 max-w-[30ch] text-[calc(8.5px*var(--ts))] leading-relaxed text-white/80" style={{ ["--i" as string]: 3 }}>
            كل تمرين، فيديو ولا حصّة يجيبلك نقاط. بالنقاط تبني مدينتك وتطلع في الدوري.
          </p>
          <div className="sp-text mt-5 flex items-center gap-3" style={{ ["--i" as string]: 2 }}>
            {user ? (
              <Link to="/mobilegame/accueil" data-uisfx="open" className={cn(ui.cta, "text-[calc(10px*var(--ts))]")}>
                ادخل لمدينتك
              </Link>
            ) : (
              <>
                {/* First launch plays before it asks: the game, then the account. */}
                <Link
                  to={finished ? "/mobilegame/resultat" : "/mobilegame/bienvenue"}
                  data-uisfx="open"
                  className={cn(ui.cta, "text-[calc(10px*var(--ts))]")}
                >
                  {finished ? "شوف نتيجتك" : "يلّا نبداو"}
                </Link>
                <Link to="/mobilegame/connexion" data-uisfx="forward" className={cn(ui.secondaryDark, "text-[calc(9px*var(--ts))]")}>
                  عندي كونط
                </Link>
              </>
            )}
          </div>
        </div>

        {/* The art: the town floats behind, وائل stands at its inner edge, turned toward the words */}
        <div className="relative h-full">
          {/* L3 — the island, behind and above his shoulder, never behind his face */}
          <div className={cn("sp-bob absolute end-[-6%] top-[6%] w-[72%]", asleep && "sp-paused")}>
            <img
              src={townIsland}
              alt="مدينة وائل: المدرسة، المكتبة، برج الرياضيات والبيت الأخضر"
              className="sp-island w-full select-none"
              // a soft contact shadow tinted with the deep teal, not black (A3)
              style={{ filter: "drop-shadow(0 18px 22px color-mix(in oklab, var(--v2-deep) 70%, black))" }}
              draggable={false}
            />
          </div>

          {/* L4 — وائل at the art's START edge (next to the words): the shared 3D pose set, a blink, a tinted contact shadow */}
          <Wael3D
            pose={pose}
            poses={["wave", "present"]}
            blink={!asleep}
            className="sp-wael absolute bottom-[2px] start-[-4%] h-[86%] origin-bottom"
          />

          {/* L5 — one flat chip: it isn't tappable, so no lip (A4) */}
          <span className="sp-chip absolute end-[4%] top-[8%] inline-flex items-center gap-1 rounded-xl border-2 border-v2-ink bg-v2-surface px-2 py-1 text-[calc(7.1px*var(--ts))] font-extrabold text-v2-ink">
            <Sparkles className="size-3.5 text-v2-brand" strokeWidth={2.4} /> <bdi dir="ltr">+30</bdi> نقطة
          </span>
        </div>
      </div>
      <p className="absolute bottom-[calc(var(--gs-bottom)+6px)] start-[calc(var(--gs-right)+16px)] text-[calc(7.1px*var(--ts))] text-white/60">نسخة تجريبية</p>
    </MobileScreen>
  )
}
