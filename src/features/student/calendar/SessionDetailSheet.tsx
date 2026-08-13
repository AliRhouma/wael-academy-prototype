import type { ReactNode } from "react"
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Hourglass,
  MapPin,
  PlayCircle,
  UsersRound,
  Video,
} from "lucide-react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Avatar } from "@/components/kit/Avatar"
import { Badge } from "@/components/kit/Badge"
import { SubjectIcon } from "@/components/icons/subjects"
import { useSessionLabels } from "@/features/shared/session/sessionLabels"
import { SessionHomework } from "@/features/student/calendar/SessionHomework"
import {
  STATE_LABEL,
  formatDuration,
  sessionState,
  useHomeworkBySession,
  useSessionVisual,
  type SessionState,
} from "@/features/student/calendar/schedule"
import { cn, formatSessionDayLong, formatTimeRange } from "@/lib/utils"
import type { Session } from "@/data/types"
import { useIsMobile } from "@/lib/hooks"

export interface SessionDetailSheetProps {
  session: Session | null
  onOpenChange: (open: boolean) => void
  /** Current clock — passed in so the sheet and the grid agree on the state. */
  now: Date
  /** Terminée + a published replay → open the player. */
  onWatchRecording: (session: Session) => void
  /** Prévue / en cours → join the séance. */
  onJoin: (session: Session) => void
}

/** One meta row: icon chip, label, value. */
function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-surface-muted text-ink-muted">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[calc(11px*var(--ts))] font-medium uppercase tracking-[.12em] text-ink-muted">{label}</p>
        <div className="truncate text-sm font-medium text-ink">{children}</div>
      </div>
    </div>
  )
}

const STATE_TONE: Record<SessionState, "neutral" | "danger" | "brand"> = {
  terminee: "neutral",
  "en-cours": "danger",
  prevue: "brand",
}

/**
 * Élève — the details of one séance, and the one thing to do with it: rejoindre
 * a séance à venir, or revoir l'enregistrement of a séance terminée. Bottom
 * sheet on mobile, centered dialog on desktop (the FormSheet split), because the
 * élève opens this from a tap on a card and must get out of it just as fast.
 *
 * Referenced for spacing & density: FormSheet (frame + footer), SessionCard
 * (meta order), StudentSubjectDetailScreen (matière identity block).
 */
export function SessionDetailSheet({
  session,
  onOpenChange,
  now,
  onWatchRecording,
  onJoin,
}: SessionDetailSheetProps) {
  const isMobile = useIsMobile()
  const { teacherName, groupNames } = useSessionLabels()
  const visual = useSessionVisual()
  const homeworkOf = useHomeworkBySession()

  if (!session) return null

  const homeworks = homeworkOf(session)
  const state = sessionState(session, now)
  const { subjectName, theme, tint } = visual(session)
  const teacher = teacherName(session.teacherId)
  const groups = groupNames(session.groupIds)
  const isDone = state === "terminee"
  const hasReplay = Boolean(session.recordingUrl)

  const header = (
    <div className="flex items-start gap-3.5 border-b border-border p-5 pe-12">
      <span
        className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg"
        style={{ backgroundColor: tint.panel }}
      >
        <span
          className="absolute size-12 rounded-full blur-2xl"
          style={{ backgroundColor: tint.halo }}
        />
        <SubjectIcon name={subjectName ?? ""} className="relative size-12" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={STATE_TONE[state]} dot={state !== "terminee"}>
            {state === "terminee" && <CheckCircle2 className="size-3" />}
            {STATE_LABEL[state]}
          </Badge>
          {subjectName && (
            <span dir="auto" className={cn("text-[calc(12px*var(--ts))] font-medium", theme.name)}>
              {subjectName}
            </span>
          )}
        </div>
        <h2
          dir="auto"
          className="mt-1.5 font-display text-[calc(19px*var(--ts))] font-bold leading-snug text-ink"
        >
          {session.title}
        </h2>
      </div>
    </div>
  )

  const body = (
    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto scroll-touch p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Row icon={<CalendarDays className="size-[18px]" />} label="التاريخ">
          <span className="inline-block first-letter:uppercase">
            {formatSessionDayLong(session.date)}
          </span>
        </Row>
        <Row icon={<Clock3 className="size-[18px]" />} label="التوقيت">
          <span className="tabular-nums">
            {formatTimeRange(session.startTime, session.endTime)}
          </span>
          <span className="text-ink-muted">
            {" · "}
            {formatDuration(session.startTime, session.endTime)}
          </span>
        </Row>
        <Row
          icon={
            teacher ? (
              <Avatar name={teacher} size="sm" className="size-9" />
            ) : (
              <Hourglass className="size-[18px]" />
            )
          }
          label="أستاذ"
        >
          {teacher ? (
            <span dir="auto">{teacher}</span>
          ) : (
            <span className="text-ink-muted">في انتظار التأكيد</span>
          )}
        </Row>
        <Row icon={<MapPin className="size-[18px]" />} label="البلاصة">
          {session.room ?? <span className="text-ink-muted">ما تحدّدش</span>}
        </Row>
      </div>

      {groups.length > 0 && (
        <div>
          <p className="mb-2 text-[calc(11px*var(--ts))] font-medium uppercase tracking-[.12em] text-accent2-600">
            فوج
          </p>
          <div className="flex flex-wrap gap-1.5">
            {groups.map((g) => (
              <Badge key={g} tone="brand" dot>
                <UsersRound className="size-3" />
                <span dir="auto">{g}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-[calc(11px*var(--ts))] font-medium uppercase tracking-[.12em] text-accent2-600">
          Au programme
        </p>
        {session.description ? (
          <p dir="auto" className="text-sm leading-relaxed text-ink-subtle">
            {session.description}
          </p>
        ) : (
          <p className="text-sm text-ink-muted">
            الأستاذ مازال ما فصّلش محتوى الحصّة هذي.
          </p>
        )}
      </div>

      {/* What the red dot on the card was about. */}
      <SessionHomework homeworks={homeworks} sessionDate={session.date} />
    </div>
  )

  /* The single primary action — what the élève came here to do. */
  const primary = isDone ? (
    hasReplay ? (
      <button
        type="button"
        onClick={() => onWatchRecording(session)}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 sm:w-auto"
      >
        <PlayCircle className="size-[18px]" /> شوف التسجيل
      </button>
    ) : (
      <span className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-dashed border-border-strong px-4 text-sm font-medium text-ink-muted sm:w-auto">
        <Hourglass className="size-4" /> التسجيل في التحضير
      </span>
    )
  ) : (
    <button
      type="button"
      onClick={() => onJoin(session)}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 sm:w-auto"
    >
      {state === "en-cours" ? (
        <>
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full rounded-full bg-white/70 motion-safe:animate-ping" />
            <span className="relative inline-flex size-2.5 rounded-full bg-white" />
          </span>
          ادخل توّا
        </>
      ) : (
        <>
          <Video className="size-[18px]" /> ادخل للحصّة
        </>
      )}
    </button>
  )

  const footer = (
    <div className="flex flex-col gap-2 border-t border-border p-5 sm:flex-row-reverse sm:items-center sm:justify-start">
      {primary}
      <button
        type="button"
        onClick={() => onOpenChange(false)}
        className="inline-flex h-11 w-full items-center justify-center rounded-md border border-border-strong bg-surface px-4 font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600 sm:w-auto"
      >
        سكّر
      </button>
      {isDone && hasReplay && (
        <p className="text-[calc(12px*var(--ts))] text-ink-muted sm:me-auto">التسجيل متوفّر 30 يوم.</p>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          aria-describedby={undefined}
          className="max-h-[92dvh] gap-0 rounded-t-xl border-border bg-surface-raised p-0"
        >
          <div className="flex max-h-[92dvh] min-w-0 flex-col pb-safe">
            <SheetTitle className="sr-only">{session.title}</SheetTitle>
            {header}
            {body}
            {footer}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="gap-0 overflow-hidden rounded-xl bg-surface-raised p-0 sm:max-w-xl"
      >
        <div className="flex max-h-[85dvh] min-w-0 flex-col">
          <DialogTitle className="sr-only">{session.title}</DialogTitle>
          {header}
          {body}
          {footer}
        </div>
      </DialogContent>
    </Dialog>
  )
}
