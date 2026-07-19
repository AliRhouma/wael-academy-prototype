import { BookOpen, CalendarDays, ClipboardList } from "lucide-react"
import { DashboardIcon } from "@/components/icons/DashboardIcon"
import type { NavItem } from "./types"

export const studentNav: NavItem[] = [
  { label: "Tableau de bord", path: "/student", icon: DashboardIcon, colored: true },
  { label: "Mes cours", path: "/student/courses", icon: BookOpen },
  { label: "Emploi du temps", path: "/student/schedule", icon: CalendarDays },
  { label: "Notes", path: "/student/grades", icon: ClipboardList },
]
