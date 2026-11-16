import { Link, useNavigate } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { DemoFillButton, GameLoginForm } from "@/features/game/shared/parts"
import { TownArt } from "@/features/game/shared/TownArt"
import character from "../../../svg icons/Caracter.png"
import { MobileScreen, useGamePlatform } from "./MobileGameLayout"
import { usePlatformUi } from "./platformUi"

/**
 * « ادخل لمدينتك » on a phone held sideways. ~350px of usable height, so the
 * screen splits instead of stacking: the form on the start side (under the
 * right thumb in RTL), Wael and the town on the end side. On a real phone the
 * keyboard covers the bottom half — the form pane scrolls.
 *
 * Per platform (wael-mobile-ios / -android): the back control (44 pt tinted
 * chevron vs 48 dp icon button with a state layer — both point RIGHT in RTL),
 * field and button sizes, 48 dp link targets on Android, the art panel's
 * corner (22 concentric on iOS, 28 on Android).
 */
export default function LoginScreen() {
  const navigate = useNavigate()
  const ui = usePlatformUi()
  const ios = useGamePlatform() === "ios"
  return (
    <MobileScreen className="bg-v2-mint-grid">
      <div className="grid h-full grid-cols-[1.08fr_1fr] gap-3">
        <div className="min-h-0 overflow-y-auto ps-2 pe-1 pb-2">
          <div className="mb-1 flex items-center gap-1">
            <Link to="/mobilegame" data-uisfx="back" aria-label="رجوع للبداية" className={ui.back}>
              <ChevronRight className="size-6" strokeWidth={ios ? 2.4 : 2} />
            </Link>
            <div>
              <p className="text-v2-grad text-[calc(7.5px*var(--ts))] font-bold">مرحبا بيك في أكاديمية وائل</p>
              <h1 className="text-[calc(12.5px*var(--ts))] font-bold leading-tight text-v2-ink">ادخل لمدينتك</h1>
            </div>
          </div>
          <GameLoginForm
            compact
            ui={ui}
            showDemo={false}
            forgotTo="/mobilegame/oublie"
            registerTo="/mobilegame/inscription"
            onSuccess={() => navigate("/mobilegame/accueil")}
          />
        </div>

        <div className={cn("relative my-1 me-1 overflow-hidden border-2 border-[#052a30] bg-v2-chapter", ios ? "rounded-[22px]" : "rounded-[28px]")}>
          {/* #052a30 = --v2-edge-deep, the chapter's own edge */}
          <TownArt className="absolute -bottom-[18%] -end-[14%] w-[95%] opacity-90" />
          <img src={character} alt="" aria-hidden className="absolute bottom-0 start-[6%] h-[86%] object-contain drop-shadow-[0_8px_16px_rgb(0_0_0/.35)]" />
          <div className="absolute end-4 top-4 max-w-[58%] rounded-2xl rounded-ss-sm border-2 border-v2-ink bg-v2-surface px-3 py-2 text-[calc(7.5px*var(--ts))] font-bold leading-snug text-v2-ink shadow-[0_3px_0_var(--v2-ink)]">
            مرحبا! مدينتك تستنّى فيك — ادخل نكمّلو نبنيو.
          </div>
          <DemoFillButton
            className={cn(
              "absolute bottom-3 end-3 border-white/50 bg-v2-deep/80 text-[calc(7px*var(--ts))] text-white hover:border-v2-cta",
              ui.target,
              !ios && "m3-ripple",
            )}
          />
        </div>
      </div>
    </MobileScreen>
  )
}
