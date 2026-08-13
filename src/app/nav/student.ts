import { DashboardIcon } from "@/components/icons/DashboardIcon"
import { OffresIcon } from "@/components/icons/OffresIcon"
import { SubjectsIcon } from "@/components/icons/SubjectsIcon"
import { CalendrierIcon } from "@/components/icons/CalendrierIcon"
import { ReplayIcon } from "@/components/icons/ReplayIcon"
import { PorteMonnaieIcon } from "@/components/icons/PorteMonnaieIcon"
import { FavorisIcon } from "@/components/icons/FavorisIcon"
import type { NavItem } from "./types"

/**
 * The élève rail. Every entry is a gradient glyph, so all of them are
 * `colored: true` — the shell then forces them white on the active pill instead
 * of trying to tint a multi-stop fill via currentColor.
 *
 * Four entries were taken OFF the rail — الترتيب, حصص مباشرة, الحانوت,
 * المساعدة. Their ROUTES are untouched and still reachable (a direct link, or
 * anything in-app that points at them); they just no longer earn a permanent
 * slot in the élève's navigation.
 */
export const studentNav: NavItem[] = [
  { label: "لوحة القيادة", path: "/student", icon: DashboardIcon, colored: true },
  { label: "العروض", path: "/student/offres", icon: OffresIcon, colored: true },
  { label: "موادّي", path: "/student/matieres", icon: SubjectsIcon, colored: true },
  { label: "الروزنامة", path: "/student/calendrier", icon: CalendrierIcon, colored: true },
  { label: "حصص مسجّلة", path: "/student/seances", icon: ReplayIcon, colored: true },
  { label: "المحفظة", path: "/student/porte-monnaie", icon: PorteMonnaieIcon, colored: true },
  { label: "مفضّلاتي", path: "/student/favoris", icon: FavorisIcon, colored: true },
]
