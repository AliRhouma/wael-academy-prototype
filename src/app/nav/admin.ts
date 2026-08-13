import { BookOpen, CalendarDays, CalendarRange, CreditCard, Layers, MessagesSquare, Radio, Settings, Users, UsersRound } from "lucide-react"
import { DashboardIcon } from "@/components/icons/DashboardIcon"
import { OffresIcon } from "@/components/icons/OffresIcon"
import type { NavItem } from "./types"

export const adminNav: NavItem[] = [
  { label: "لوحة القيادة", path: "/admin", icon: DashboardIcon, colored: true },
  { label: "البرنامج", path: "/admin/curriculum", icon: Layers },
  { label: "المستعملين", path: "/admin/users", icon: Users },
  { label: "الأفواج", path: "/admin/groups", icon: UsersRound },
  { label: "الدروس", path: "/admin/courses", icon: BookOpen },
  { label: "الحصص", path: "/admin/sessions", icon: CalendarDays },
  { label: "الحصص المباشرة", path: "/admin/live", icon: Radio },
  { label: "الروزنامة", path: "/admin/calendar", icon: CalendarRange },
  { label: "الرسائل", path: "/admin/messages", icon: MessagesSquare },
  { label: "العروض", path: "/admin/offers", icon: OffresIcon, colored: true },
  { label: "الخلاص", path: "/admin/payments", icon: CreditCard },
  { label: "الإعدادات", path: "/admin/settings", icon: Settings },
]
