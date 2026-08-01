import { DashboardIcon } from "@/components/icons/DashboardIcon"
import { ClassementIcon } from "@/components/icons/ClassementIcon"
import { OffresIcon } from "@/components/icons/OffresIcon"
import { MatieresIcon } from "@/components/icons/MatieresIcon"
import { CalendrierIcon } from "@/components/icons/CalendrierIcon"
import { LiveIcon } from "@/components/icons/LiveIcon"
import { ReplayIcon } from "@/components/icons/ReplayIcon"
import { BoutiqueIcon } from "@/components/icons/BoutiqueIcon"
import { PorteMonnaieIcon } from "@/components/icons/PorteMonnaieIcon"
import { FavorisIcon } from "@/components/icons/FavorisIcon"
import { AssistanceIcon } from "@/components/icons/AssistanceIcon"
import type { NavItem } from "./types"

/**
 * The élève rail. Every entry is a gradient glyph, so all of them are
 * `colored: true` — the shell then forces them white on the active pill instead
 * of trying to tint a multi-stop fill via currentColor.
 */
export const studentNav: NavItem[] = [
  { label: "Tableau de bord", path: "/student", icon: DashboardIcon, colored: true },
  { label: "Classement", path: "/student/classement", icon: ClassementIcon, colored: true },
  { label: "Offres", path: "/student/offres", icon: OffresIcon, colored: true },
  { label: "Matières", path: "/student/matieres", icon: MatieresIcon, colored: true },
  { label: "Calendrier", path: "/student/calendrier", icon: CalendrierIcon, colored: true },
  { label: "Séances en direct", path: "/student/direct", icon: LiveIcon, colored: true },
  { label: "Séances enregistrées", path: "/student/seances", icon: ReplayIcon, colored: true },
  { label: "Boutique", path: "/student/boutique", icon: BoutiqueIcon, colored: true },
  { label: "Porte-monnaie", path: "/student/porte-monnaie", icon: PorteMonnaieIcon, colored: true },
  { label: "Mes favoris", path: "/student/favoris", icon: FavorisIcon, colored: true },
  { label: "Assistance", path: "/student/assistance", icon: AssistanceIcon, colored: true },
]
