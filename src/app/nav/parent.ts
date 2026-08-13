import { CalendarDays, CreditCard, Users } from "lucide-react"
import { DashboardIcon } from "@/components/icons/DashboardIcon"
import type { NavItem } from "./types"

export const parentNav: NavItem[] = [
  { label: "لوحة القيادة", path: "/parent", icon: DashboardIcon, colored: true },
  { label: "أولادي", path: "/parent/children", icon: Users },
  { label: "الحصص", path: "/parent/sessions", icon: CalendarDays },
  { label: "الخلاص", path: "/parent/payments", icon: CreditCard },
]
