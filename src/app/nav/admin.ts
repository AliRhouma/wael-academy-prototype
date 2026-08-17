import { BookOpen, CalendarDays, CalendarRange, CreditCard, Layers, MessagesSquare, Radio, Settings, Users, UsersRound, Wallet } from "lucide-react"
import { DashboardIcon } from "@/components/icons/DashboardIcon"
import { OffresIcon } from "@/components/icons/OffresIcon"
import type { NavItem } from "./types"

export const adminNav: NavItem[] = [
  { label: "Tableau de bord", path: "/admin", icon: DashboardIcon, colored: true },
  { label: "Cursus", path: "/admin/curriculum", icon: Layers },
  { label: "Utilisateurs", path: "/admin/users", icon: Users },
  { label: "Groupes", path: "/admin/groups", icon: UsersRound },
  { label: "Cours", path: "/admin/courses", icon: BookOpen },
  { label: "Séances", path: "/admin/sessions", icon: CalendarDays },
  { label: "Séances en direct", path: "/admin/live", icon: Radio },
  { label: "Calendrier", path: "/admin/calendar", icon: CalendarRange },
  { label: "Messages", path: "/admin/messages", icon: MessagesSquare },
  { label: "Offres", path: "/admin/offers", icon: OffresIcon, colored: true },
  { label: "Paiements", path: "/admin/payments", icon: CreditCard },
  { label: "Paie des profs", path: "/admin/teacher-pay", icon: Wallet },
  { label: "Paramètres", path: "/admin/settings", icon: Settings },
]
