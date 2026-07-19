import { PageHeader } from "@/components/kit/PageHeader"
import { Avatar } from "@/components/kit/Avatar"
import { SessionList } from "@/features/shared/SessionList"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"
import { nowStamp, sessionStamp } from "@/lib/utils"

/** Scoped to the current parent: their children + the children's sessions. */
export default function ParentDashboard() {
  const user = useAuth((s) => s.currentUser)
  const { students, sessions, users, groups } = useData()

  const childIds = new Set(user?.childrenIds ?? [])
  const children = students.filter((s) => childIds.has(s.id))

  // Reach each child's year + groups through their student user account.
  const childUsers = users.filter((u) => u.studentId && childIds.has(u.studentId))
  const childUserIds = new Set(childUsers.map((u) => u.id))
  const childYearIds = new Set(
    childUsers.map((u) => u.yearId).filter((id): id is string => Boolean(id)),
  )
  const childGroupIds = new Set(
    groups.filter((g) => g.studentIds.some((id) => childUserIds.has(id))).map((g) => g.id),
  )
  const now = nowStamp()
  const childSessions = sessions
    .filter(
      (s) =>
        sessionStamp(s) >= now &&
        (s.groupIds.some((id) => childGroupIds.has(id)) ||
          s.yearIds.some((id) => childYearIds.has(id))),
    )
    .sort((a, b) => sessionStamp(a).localeCompare(sessionStamp(b)))
  const firstName = user?.name.split(" ")[0] ?? ""

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`Bonjour, ${firstName}`} subtitle="Le suivi de vos enfants à l’académie" />

      <section>
        <h2 className="mb-3 font-display text-base font-bold text-ink">Mes enfants</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {children.map((child) => (
            <div
              key={child.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm"
            >
              <Avatar name={child.name} size="lg" />
              <div className="min-w-0">
                <p className="truncate font-display text-[14px] font-bold text-ink">{child.name}</p>
                <p className="text-[12px] text-ink-muted">
                  {child.group} · {child.courseIds?.length ?? 0} cours
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-base font-bold text-ink">Séances à venir</h2>
        <SessionList sessions={childSessions} empty="Aucune séance pour vos enfants" />
      </section>
    </div>
  )
}
