import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useAuth } from "@/stores/useAuth"
import { GameSoon } from "@/features/game/shared/parts"
import { gBtn, gCta } from "@/features/game/shared/ui"
import { WebHeader } from "./WebGameLayout"

/** After the door — the web town is the next step. */
export function WebHome() {
  const navigate = useNavigate()
  const user = useAuth((s) => s.currentUser)
  const logout = useAuth((s) => s.logout)
  const first = user?.name.split(" ")[0]
  return (
    <div className="flex min-h-dvh flex-col bg-v2-mint-grid">
      <WebHeader minimal />
      <main className="flex-1">
        <GameSoon
          title={first ? `مرحبا ${first}، مدينتك تتبنى` : "ما دخلتش بعد"}
          body={first ? "الدخول خدم. المدينة، النقاط والدوري هوما الخطوة الجاية في الويب." : "ادخل بالكونط متاعك باش تلقى مدينتك."}
          actions={
            first ? (
              <>
                <Link to="/webgame" data-uisfx="back" className={cn(gBtn, "h-12 px-5 text-[calc(9.5px*var(--ts))]")}>
                  الصفحة الرئيسية
                </Link>
                <button
                  type="button"
                  data-uisfx="close"
                  onClick={() => {
                    logout()
                    navigate("/webgame")
                  }}
                  className={cn(gCta, "h-12 px-6 text-[calc(9.5px*var(--ts))]")}
                >
                  خروج
                </button>
              </>
            ) : (
              <Link to="/webgame/connexion" data-uisfx="forward" className={cn(gCta, "h-12 px-6 text-[calc(9.5px*var(--ts))]")}>
                ادخل
              </Link>
            )
          }
        />
      </main>
    </div>
  )
}

const SOON: Record<string, string> = {
  inscription: "أعمل كونط",
  oublie: "نسيت كلمة السر",
}

/** Any `/webgame/*` not built yet. */
export function WebSoon() {
  const seg = useLocation().pathname.split("/")[2] ?? ""
  return (
    <div className="flex min-h-dvh flex-col bg-v2-mint-grid">
      <WebHeader minimal />
      <main className="flex-1">
        <GameSoon
          title={SOON[seg] ?? "الصفحة هاذي"}
          body="مازالت ما تبناتش في نسخة الويب — الخطوة الجاية."
          actions={
            <>
              <Link to="/webgame" data-uisfx="back" className={cn(gBtn, "h-12 px-5 text-[calc(9.5px*var(--ts))]")}>
                الصفحة الرئيسية
              </Link>
              <Link to="/webgame/connexion" data-uisfx="forward" className={cn(gCta, "h-12 px-6 text-[calc(9.5px*var(--ts))]")}>
                ادخل
              </Link>
            </>
          }
        />
      </main>
    </div>
  )
}
