import { tagOf, type Locale } from "@/i18n/locale"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** Merge Tailwind classes, resolving conflicts (shadcn convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Simulate a short async pause for prototype interactions (saving a form, etc.).
 * There is no real network — this just lets optimistic UI feel real.
 */
export function fakeDelay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Format an ISO date-time as a short French label (e.g. "lun. 20 juil., 09:00"). */
export function formatDateTime(iso: string, locale: Locale = "ar"): string {
  return new Date(iso).toLocaleString(tagOf(locale), {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

/** A session's start as a sortable/comparable stamp — "YYYY-MM-DDTHH:MM". */
export function sessionStamp(s: { date: string; startTime: string }): string {
  return `${s.date}T${s.startTime}`
}

/** Local "now" as the same "YYYY-MM-DDTHH:MM" stamp, for upcoming/past filtering. */
export function nowStamp(): string {
  const n = new Date()
  const p = (v: number) => String(v).padStart(2, "0")
  return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}T${p(n.getHours())}:${p(n.getMinutes())}`
}

/** Format a "YYYY-MM-DD" day as a short French label (e.g. "lun. 20 juil."). */
export function formatSessionDay(date: string, locale: Locale = "ar"): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString(tagOf(locale), {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}

/** Format a "YYYY-MM-DD" day as a full French label (e.g. "lundi 20 juillet 2026"). */
export function formatSessionDayLong(date: string, locale: Locale = "ar"): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString(tagOf(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/** A time range label from two "HH:MM" strings (e.g. "09:00 – 10:30").
 *  Wrapped in LRI/PDI so the two times keep their order under dir="rtl" —
 *  without it the neutral dash inherits RTL and the range reads backwards. */
export function formatTimeRange(start: string, end: string): string {
  return `⁦${start} – ${end}⁩`
}
