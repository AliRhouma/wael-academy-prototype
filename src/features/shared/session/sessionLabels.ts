import { useMemo } from "react"
import { useData } from "@/stores/useData"

/**
 * Resolver maps for a séance's relations (teacher / years / subjects / groups),
 * built once from the store. Shared by the admin manager, the teacher agenda and
 * the dashboards so every surface labels a session the same way.
 */
export function useSessionLabels() {
  const teachers = useData((s) => s.teachers)
  const years = useData((s) => s.years)
  const subjects = useData((s) => s.subjects)
  const groups = useData((s) => s.groups)

  return useMemo(() => {
    const teacherMap = new Map(teachers.map((t) => [t.id, t.name]))
    const yearMap = new Map(years.map((y) => [y.id, y.name]))
    const subjectMap = new Map(subjects.map((s) => [s.id, s.name]))
    const groupMap = new Map(groups.map((g) => [g.id, g.title]))
    const names = (ids: string[], m: Map<string, string>) =>
      ids.map((id) => m.get(id)).filter((n): n is string => Boolean(n))
    return {
      teacherName: (id?: string) => (id ? teacherMap.get(id) : undefined),
      yearNames: (ids: string[]) => names(ids, yearMap),
      subjectNames: (ids: string[]) => names(ids, subjectMap),
      groupNames: (ids: string[]) => names(ids, groupMap),
    }
  }, [teachers, years, subjects, groups])
}
