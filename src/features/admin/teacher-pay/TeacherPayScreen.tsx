import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { AlertTriangle, Wallet } from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { DataTable, type Column } from "@/components/kit/DataTable"
import { StatTile } from "@/features/shared/StatTile"
import { Avatar } from "@/components/kit/Avatar"
import { useMoney } from "@/features/shared/payments/paymentLib"
import { payPeriods, paySummary, teacherSessions } from "@/features/shared/teacherPay"
import { useData } from "@/stores/useData"
import type { Teacher } from "@/data/types"

interface Row {
  teacher: Teacher
  sessionCount: number
  total: number
  unpriced: number
}

const MODE_LABEL: Record<string, string> = {
  manual: "Manuel",
  auto: "Automatique",
}

/**
 * Admin — « خلاص الأساتذة ». Every prof, how they are paid and what they have
 * earned. The mode lives here and ONLY here: this is the screen the admin opens
 * to decide it, and the prof's own page never names it.
 *
 * A prof with no mode set is the state worth seeing first, so it is flagged in
 * the row rather than left blank — nobody gets paid until someone chooses.
 *
 * Referenced for spacing & density: admin/payments/PaymentsScreen (table +
 * stat row), admin/users/UsersScreen (avatar cell).
 */
export default function AdminTeacherPayScreen() {
  const navigate = useNavigate()
  const teachers = useData((s) => s.teachers)
  const sessions = useData((s) => s.sessions)
  const rates = useData((s) => s.teacherRates)
  const payouts = useData((s) => s.teacherPayouts)
  const { dt } = useMoney()

  const rows: Row[] = useMemo(
    () =>
      teachers.map((teacher) => {
        const periods = payPeriods(teacher, sessions, rates, payouts, "fr")
        const summary = paySummary(periods)
        return {
          teacher,
          sessionCount: teacherSessions(sessions, teacher.id).length,
          total: summary.total,
          unpriced: summary.unpriced,
        }
      }),
    [teachers, sessions, rates, payouts],
  )

  const unset = rows.filter((r) => !r.teacher.payMode).length
  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0)

  const columns: Column<Row>[] = [
    {
      key: "teacher",
      header: "Enseignant",
      render: (r) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar name={r.teacher.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{r.teacher.name}</p>
            {r.teacher.subject && (
              <p className="truncate text-[calc(12px*var(--ts))] text-ink-muted">
                {r.teacher.subject}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "mode",
      header: "Mode de paie",
      render: (r) =>
        r.teacher.payMode ? (
          <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-[calc(12px*var(--ts))] font-medium text-brand-700">
            {MODE_LABEL[r.teacher.payMode]}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-warning-50 px-2.5 py-0.5 text-[calc(12px*var(--ts))] font-medium text-warning-700">
            <AlertTriangle className="size-3" />
            Non défini
          </span>
        ),
    },
    {
      key: "sessionCount",
      header: "Séances",
      render: (r) => (
        <span className="tabular-nums text-ink-subtle">
          <span className="num">{r.sessionCount}</span>
          {r.unpriced > 0 && (
            <span className="ms-1.5 text-[calc(11px*var(--ts))] text-warning-700">
              (<span className="num">{r.unpriced}</span> sans tarif)
            </span>
          )}
        </span>
      ),
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      render: (r) => (
        <span className="font-display font-bold tabular-nums text-ink">
          <span className="num">{dt(r.total)}</span>
        </span>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Paie des enseignants"
        subtitle="Choisissez le mode de calcul de chaque enseignant et suivez ce qu'il a cumulé."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile icon={Wallet} label="Total à payer" value={dt(grandTotal)} />
        <StatTile icon={Wallet} label="Enseignants" value={teachers.length} />
        <StatTile icon={AlertTriangle} label="Sans mode de paie" value={unset} />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.teacher.id}
        onRowClick={(r) => navigate(`/admin/teacher-pay/${r.teacher.id}`)}
      />
    </div>
  )
}
