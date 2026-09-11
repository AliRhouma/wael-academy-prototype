import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { DropdownMenu } from "radix-ui"
import { Bell, BellOff, CalendarDays, FileText, TvMinimalPlay, type LucideIcon } from "lucide-react"
import { useMyHomeworks, useMySessions } from "@/features/student/dashboard/dashboard"
import { dateKey, formatAway, sessionStart, useNow } from "@/features/student/calendar/schedule"
import { cn } from "@/lib/utils"
import { useDemoStates } from "../demoStates"
import { BASE, useLookups, useV2Recent } from "../lib"
import { iconBtnClass } from "../ui"

interface Notif {
  id: string
  icon: LucideIcon
  chip: string
  title: string
  body: string
  at: number
  /** Overrides the « من … » line — a séance still to come says when it starts. */
  when?: string
  to: string
}

/**
 * The bell. Its feed is derived, never stored: the newest خدمة the profs sent,
 * the newest replays put online, and whatever séance is still ahead today.
 * Read/unread is this menu's own memory — opening an item marks it, and
 * « علّم الكل مقروء » clears the badge.
 */
function useFeed(now: Date): Notif[] {
  const homeworks = useMyHomeworks()
  const recent = useV2Recent(now)
  const sessions = useMySessions()
  const { subjectOf, subjectById, teacherOf } = useLookups()

  return useMemo(() => {
    const t = now.getTime()
    const today = dateKey(now)
    const out: Notif[] = []

    for (const hw of [...homeworks].sort((a, b) => b.sentAt.localeCompare(a.sentAt)).slice(0, 3)) {
      const teacher = teacherOf(hw.teacherId)
      const civ = teacher?.civility === "f" ? "مدام" : "مسيو"
      out.push({
        id: `hw-${hw.id}`,
        icon: FileText,
        chip: "bg-v2-chip-docs",
        title: `${civ} ${teacher?.name.split(" ")[0] ?? ""} بعثلك تمرين`,
        body: hw.title,
        at: new Date(hw.sentAt).getTime(),
        to: hw.sessionId ? `${BASE}/seance/${hw.sessionId}` : `${BASE}/calendrier`,
      })
    }

    for (const s of recent.slice(0, 2)) {
      out.push({
        id: `rec-${s.id}`,
        icon: TvMinimalPlay,
        chip: "bg-v2-brand",
        title: `تسجيل جديد في ${subjectOf(s)?.name ?? ""}`,
        body: s.title,
        at: new Date(s.publishedAt ?? s.date).getTime(),
        to: `${BASE}/seance/${s.id}`,
      })
    }

    for (const s of sessions) {
      if (s.date !== today || s.postponed || sessionStart(s).getTime() <= t) continue
      out.push({
        id: `ses-${s.id}`,
        icon: CalendarDays,
        chip: "bg-v2-chip-live",
        title: `عندك حصّة ${subjectById(s.subjectIds[0])?.name ?? ""} اليوم`,
        body: `على ${s.startTime} · ${s.title}`,
        // Pinned to the top: it's the only item with a deadline.
        at: t,
        when: `تبدا ${formatAway(sessionStart(s).getTime() - t)}`,
        to: `${BASE}/seance/${s.id}`,
      })
    }

    return out.sort((a, b) => b.at - a.at)
  }, [homeworks, recent, sessions, now, subjectOf, subjectById, teacherOf])
}

export function NotificationsMenu() {
  const navigate = useNavigate()
  const now = useNow()
  const { notifs } = useDemoStates()
  const feed = useFeed(now)
  const items = notifs === "empty" ? [] : feed
  const [read, setRead] = useState<Set<string>>(() => new Set())
  const unread = items.filter((n) => !read.has(n.id)).length

  return (
    <DropdownMenu.Root dir="rtl">
      <DropdownMenu.Trigger asChild>
        <button type="button" data-uisfx="notification" aria-label={`الإشعارات${unread ? ` — ${unread} جداد` : ""}`} className={iconBtnClass}>
          <Bell className="size-6" strokeWidth={1.6} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -end-0.5 grid h-6 min-w-6 place-items-center rounded-full border-2 border-v2-surface bg-v2-grad px-1 text-[12px] font-bold leading-none text-white">
              {unread}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={10}
          collisionPadding={12}
          className="z-50 w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-3xl border border-v2-ink/15 bg-v2-surface text-v2-ink shadow-xl shadow-v2-ink/10 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <div className="flex items-center justify-between gap-2 border-b border-v2-ink/10 px-4 py-3">
            <p className="text-[calc(10.5px*var(--ts))] font-bold">الإشعارات</p>
            {unread > 0 && (
              <button
                type="button"
                data-uisfx="check"
                onClick={() => setRead(new Set(items.map((n) => n.id)))}
                className="min-h-9 rounded-full px-3 text-[calc(8px*var(--ts))] font-semibold text-v2-brand transition hover:bg-v2-brand/10"
              >
                علّم الكل مقروء
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <span className="grid size-14 place-items-center rounded-full bg-v2-brand/[0.08]">
                <BellOff className="size-7 stroke-v2-grad" strokeWidth={1.5} />
              </span>
              <p className="mt-1 text-[calc(10px*var(--ts))] font-bold">ما عندك حتّى إشعار</p>
              <p className="text-[calc(8px*var(--ts))] text-v2-ink/55">كي يبعثلك أستاذ تمرين ولّا يتزاد تسجيل، يوصلك هوني.</p>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {items.map((n) => {
                const Icon = n.icon
                const fresh = !read.has(n.id)
                return (
                  <DropdownMenu.Item
                    key={n.id}
                    data-uisfx="open"
                    onSelect={() => {
                      setRead((prev) => new Set(prev).add(n.id))
                      navigate(n.to)
                    }}
                    className={cn(
                      "relative flex cursor-pointer items-start gap-3 rounded-2xl p-3 outline-none transition data-[highlighted]:bg-v2-ink/[0.05]",
                      fresh && "bg-v2-brand/[0.06]",
                    )}
                  >
                    <span className={cn("grid size-10 shrink-0 place-items-center rounded-full text-white", n.chip)}>
                      <Icon className="size-5" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[calc(9px*var(--ts))] font-bold leading-snug">{n.title}</span>
                      <span className="block truncate text-[calc(8px*var(--ts))] text-v2-ink/60">{n.body}</span>
                      <span className="mt-0.5 block text-[calc(7px*var(--ts))] text-v2-ink/45">
                        {n.when ?? formatAway(Math.min(n.at - now.getTime(), 0))}
                      </span>
                    </span>
                    {fresh && <span aria-label="جديد" className="mt-1.5 size-2.5 shrink-0 rounded-full bg-v2-grad" />}
                  </DropdownMenu.Item>
                )
              })}
            </div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
