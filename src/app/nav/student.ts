import { BookOpen, CalendarDays, ClipboardList, LayoutDashboard } from "lucide-react"
import type { NavItem } from "./types"

export const studentNav: NavItem[] = [
  { label: "Tableau de bord", path: "/student", icon: LayoutDashboard },
  { label: "Mes cours", path: "/student/courses", icon: BookOpen },
  { label: "Emploi du temps", path: "/student/schedule", icon: CalendarDays },
  { label: "Notes", path: "/student/grades", icon: ClipboardList },
]
