import { BookOpen, CalendarDays, CreditCard, Layers, Settings, Tag, Users, UsersRound } from "lucide-react"
import { DashboardIcon } from "@/components/icons/DashboardIcon"
import type { NavItem } from "./types"

export const adminNav: NavItem[] = [
  { label: "Tableau de bord", path: "/admin", icon: DashboardIcon, colored: true },
  { label: "Programme", path: "/admin/curriculum", icon: Layers },
  { label: "Utilisateurs", path: "/admin/users", icon: Users },
  { label: "Groupes", path: "/admin/groups", icon: UsersRound },
  { label: "Cours", path: "/admin/courses", icon: BookOpen },
  { label: "Séances", path: "/admin/sessions", icon: CalendarDays },
  { label: "Offres", path: "/admin/offers", icon: Tag },
  { label: "Paiements", path: "/admin/payments", icon: CreditCard },
  { label: "Réglages", path: "/admin/settings", icon: Settings },
]
