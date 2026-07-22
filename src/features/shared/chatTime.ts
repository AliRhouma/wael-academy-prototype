/** "14:32" if today, else "12 juil. 14:32" — compact stamp under chat bubbles. */
export function formatChatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  if (sameDay) return time
  const day = d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  return `${day} ${time}`
}
