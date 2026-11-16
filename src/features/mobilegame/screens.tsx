import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useAuth } from "@/stores/useAuth"
import { GameSoon } from "@/features/game/shared/parts"
import { MobileScreen } from "./MobileGameLayout"
import { usePlatformUi } from "./platformUi"
import { matiereKey } from "@/data/matiere"
import { useOnboarding, useScore } from "./onboarding/flow"

/**
 * Where the door leads for now — the town is the next step. Signed out (a
 * refresh empties the in-memory session) → back to the door.
 */
export function MobileHome() {
  const navigate = useNavigate()
  const user = useAuth((s) => s.currentUser)
  const logout = useAuth((s) => s.logout)
  const first = user?.name.split(" ")[0]
  const ui = usePlatformUi()
  // The first-launch game, kept by the new account.
  const { finished, subject, replay } = useOnboarding()
  const { right, total, points } = useScore()
  const saved = first && finished && subject
  return (
    <MobileScreen className="bg-v2-chapter">
      <GameSoon
        dark
        title={first ? `مرحبا ${first}، مدينتك تتبنى` : "ما دخلتش بعد"}
        body={
          saved ? (
            <>
              نتيجتك في {matiereKey(subject)} تسجّلت: <bdi dir="ltr">{right}/{total}</bdi> · <bdi dir="ltr">+{points}</bdi> نقطة لمدينتك. الجولة
              الثانية تحلّت.
            </>
          ) : first ? (
            "الدخول خدم. المدينة، النقاط والدوري هوما الخطوة الجاية في التطبيق."
          ) : (
            "ادخل بالكونط متاعك باش تلقى مدينتك."
          )
        }
        actions={
          first ? (
            <>
              {saved ? (
                <button
                  type="button"
                  data-uisfx="start"
                  onClick={() => {
                    replay()
                    navigate("/mobilegame/defi")
                  }}
                  className={cn(ui.cta, "text-[calc(9.5px*var(--ts))]")}
                >
                  العب الجولة الثانية
                </button>
              ) : (
                <Link to="/mobilegame" data-uisfx="back" className={cn(ui.secondaryDark, "text-[calc(9px*var(--ts))]")}>
                  ارجع للبداية
                </Link>
              )}
              <button
                type="button"
                data-uisfx="close"
                onClick={() => {
                  logout()
                  navigate("/mobilegame")
                }}
                className={cn(saved ? ui.secondaryDark : ui.cta, saved ? "text-[calc(9px*var(--ts))]" : "text-[calc(9.5px*var(--ts))]")}
              >
                خروج
              </button>
            </>
          ) : (
            <Link to="/mobilegame/connexion" data-uisfx="forward" className={cn(ui.cta, "text-[calc(9.5px*var(--ts))]")}>
              ادخل
            </Link>
          )
        }
      />
    </MobileScreen>
  )
}

const SOON: Record<string, string> = {
  inscription: "أعمل كونط",
  oublie: "نسيت كلمة السر",
}

/** Any `/mobilegame/*` not built yet. */
export function MobileSoon() {
  const seg = useLocation().pathname.split("/")[2] ?? ""
  const ui = usePlatformUi()
  return (
    <MobileScreen className="bg-v2-mint-grid">
      <GameSoon
        title={SOON[seg] ?? "الشاشة هاذي"}
        body="مازالت ما تبناتش في التطبيق — الخطوة الجاية."
        actions={
          <Link to="/mobilegame/connexion" data-uisfx="back" className={cn(ui.secondary, "text-[calc(9px*var(--ts))]")}>
            رجوع للدخول
          </Link>
        }
      />
    </MobileScreen>
  )
}
