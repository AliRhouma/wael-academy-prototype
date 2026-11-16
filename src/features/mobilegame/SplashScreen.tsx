import { Link } from "react-router-dom"
import { Gamepad2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/stores/useAuth"
import { GameLogo } from "@/features/game/shared/parts"
import { TownArt } from "@/features/game/shared/TownArt"
import { MobileScreen } from "./MobileGameLayout"
import { usePlatformUi } from "./platformUi"
import { useOnboarding } from "./onboarding/flow"

/**
 * Per platform (wael-mobile-ios / -android): the CTA's size (50 pt capsule vs
 * 56 dp), the secondary (white-tinted fill vs outlined), nothing animating on
 * load — only the town's flags and clouds move, and not under reduced motion.
 *
 * The app's first screen — the brand, the promise in one line, the town, and
 * one way in. No fake loading bar: the prototype has nothing to load, so the
 * splash is a door, not a wait. Already signed in → « ادخل » goes straight to
 * the town.
 */
export default function SplashScreen() {
  const user = useAuth((s) => s.currentUser)
  const finished = useOnboarding((s) => s.finished)
  const ui = usePlatformUi()
  return (
    <MobileScreen className="bg-v2-chapter text-white">
      {/* the graph paper of the brand, faint on the dark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[.07]"
        style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }}
      />
      <div className="relative grid h-full grid-cols-[1fr_1.12fr] items-center gap-4 ps-4 pe-2">
        <div>
          <GameLogo light className="h-9 w-[4.2rem]" />
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-v2-cta px-2.5 py-1 text-[calc(7.1px*var(--ts))] font-extrabold text-v2-on-cta">
            <Gamepad2 className="size-3.5" strokeWidth={2.4} /> وضع اللعب
          </span>
          <h1 className="mt-2 text-[calc(22px*var(--ts))] font-black leading-[1.1] text-white">مدينة وائل</h1>
          <p className="mt-2 max-w-[30ch] text-[calc(8.5px*var(--ts))] leading-relaxed text-white/80">
            كل تمرين، فيديو ولا حصّة يجيبلك نقاط. بالنقاط تبني مدينتك وتطلع في الدوري.
          </p>
          <div className="mt-5 flex items-center gap-3">
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

        <div className="relative h-full">
          <div aria-hidden className="absolute inset-[8%] rounded-full bg-white/10 blur-2xl" />
          <TownArt className="relative h-full w-full" />
          <span className="absolute end-[6%] top-[14%] inline-flex items-center gap-1 rounded-xl border-2 border-v2-ink bg-v2-surface px-2 py-1 text-[calc(7.1px*var(--ts))] font-extrabold text-v2-ink shadow-[0_3px_0_var(--v2-ink)]">
            <Sparkles className="size-3.5 text-v2-brand" strokeWidth={2.4} /> <bdi dir="ltr">+30</bdi> نقطة
          </span>
        </div>
      </div>
      <p className="absolute bottom-[calc(var(--gs-bottom)+6px)] start-[calc(var(--gs-right)+16px)] text-[calc(7.1px*var(--ts))] text-white/60">نسخة تجريبية</p>
    </MobileScreen>
  )
}
