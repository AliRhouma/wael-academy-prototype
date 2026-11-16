import { BadgePercent, CalendarDays, LayoutGrid, LibraryBig, TvMinimalPlay, Users, type LucideIcon } from "lucide-react"
import type { NavItem } from "./types"

/** A NavItem whose glyph is always Lucide, so the shell can set its stroke. */
type V2NavItem = Omit<NavItem, "icon" | "colored"> & { icon: LucideIcon }

/**
 * The NEW élève space's rail — the six entries of the Figma frame, in its
 * order. Each glyph is a Lucide line icon stroked with the brand ramp by the
 * shell (`stroke-v2-grad`), which is how the frame draws them.
 *
 * What left the rail compared to /student (المحفظة، مفضّلاتي، كوداتي) now
 * lives in the avatar menu; مجموعاتي is new.
 */
export const studentV2Nav: V2NavItem[] = [
  { label: "الرئيسية", path: "/student-v2", icon: LayoutGrid },
  { label: "العروض", path: "/student-v2/offres", icon: BadgePercent },
  { label: "الرزنامة", path: "/student-v2/calendrier", icon: CalendarDays },
  { label: "تسجيلات", path: "/student-v2/seances", icon: TvMinimalPlay },
  { label: "مجموعاتي", path: "/student-v2/groupes", icon: Users },
  { label: "الدروس", path: "/student-v2/matieres", icon: LibraryBig },
]

/**
 * The PHONE's tab bar — five, not six. Both platforms stop at five (Apple's
 * tab bar, Material's navigation bar); a sixth squeezes every label past
 * legibility on a 390 pt screen. « العروض » is the one that steps out: it is a
 * place you go on purpose, not a place you live in, so it joins المحفظة and
 * كوداتي in the avatar menu (and stays on the desktop rail, which has room).
 */
export const studentV2Tabs: V2NavItem[] = studentV2Nav.filter((item) => item.path !== "/student-v2/offres")
