/** "14:32" if today, else "12 juil. 14:32" — compact stamp under chat bubbles. */
export function formatChatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  const time = d.toLocaleTimeString("ar-TN-u-nu-latn", { hour: "2-digit", minute: "2-digit", hour12: false })
  if (sameDay) return time
  const day = d.toLocaleDateString("ar-TN-u-nu-latn", { day: "numeric", month: "short" })
  return `${day} ${time}`
}
