import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { GameSoon } from "@/features/game/shared/parts"
import TownMapPage from "@/features/map/TownMapPage"
import { MobileScreen } from "./MobileGameLayout"
import { usePlatformUi } from "./platformUi"

/**
 * Where login (and « ادخل لمدينتك ») leads: the student's town — the same
 * isometric map as `/map`, framed in the phone (notch and home bar respected).
 * The round back button returns to the door.
 */
export function MobileTown() {
  return <TownMapPage framed back="/mobilegame" />
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
