import { useNavigate } from "react-router-dom"
import { GameLoginForm } from "@/features/game/shared/parts"
import { TownArt } from "@/features/game/shared/TownArt"
import { gPanel } from "@/features/game/shared/ui"
import character from "../../../svg icons/Caracter.png"
import { WebHeader, wContainer } from "./WebGameLayout"
import { cn } from "@/lib/utils"

/**
 * `/webgame/connexion` — the form on the reading start, Wael and the town on
 * the end, at md+. On a phone the art shrinks to a band above the form, so the
 * fields stay above the keyboard.
 */
export default function LoginPage() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-dvh flex-col bg-v2-mint-grid text-v2-ink">
      <WebHeader minimal />
      <main className={cn(wContainer, "flex flex-1 items-center py-6 md:py-12")}>
        <div className={cn(gPanel, "grid w-full overflow-hidden md:grid-cols-[1fr_1.05fr]")}>
          <div className="order-2 p-5 sm:p-8 md:order-1 md:p-12">
            <p className="text-v2-grad text-[calc(9px*var(--ts))] font-bold">مرحبا بيك في أكاديمية وائل</p>
            <h1 className="mt-1 text-[calc(18px*var(--ts))] font-black leading-tight md:text-[calc(22px*var(--ts))]">ادخل لمدينتك</h1>
            <p className="mt-2 text-[calc(9px*var(--ts))] text-v2-ink-2">نفس الكونط متاع فضاء التلميذ.</p>
            <div className="mt-6 md:mt-8">
              <GameLoginForm forgotTo="/webgame/oublie" registerTo="/webgame/inscription" onSuccess={() => navigate("/webgame/app")} />
            </div>
          </div>

          <div className="relative order-1 h-44 overflow-hidden bg-v2-chapter sm:h-56 md:order-2 md:h-auto md:min-h-[34rem]">
            <TownArt className="absolute -bottom-[14%] -end-[10%] w-[90%] opacity-90 md:-bottom-[8%] md:w-[105%]" />
            <img src={character} alt="" aria-hidden className="absolute bottom-0 start-[8%] h-[92%] object-contain drop-shadow-[0_10px_20px_rgb(0_0_0/.35)] md:h-[78%]" />
            <div className="absolute end-4 top-4 max-w-[55%] rounded-2xl rounded-ss-sm border-2 border-v2-ink bg-v2-surface px-3 py-2 text-[calc(8.5px*var(--ts))] font-bold leading-snug shadow-[0_3px_0_var(--v2-ink)] md:end-8 md:top-8 md:max-w-[50%] md:px-4 md:py-3 md:text-[calc(10px*var(--ts))]">
              مرحبا! مدينتك تستنّى فيك — ادخل نكمّلو نبنيو.
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
