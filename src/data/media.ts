/**
 * Prototype media.
 *
 * Videos: a seed row that carries a REAL link plays that link (Philosophie is
 * seeded from the academy's own YouTube playlist). Rows still holding a
 * placeholder link fall back to one demo clip, so nothing is ever a dead
 * player. Documents have no real files yet, so every PDF opens one demo
 * document copied to `public/docs`.
 *
 * When real documents land, `pdfSrc` returns the stored url the same way.
 */

/** Fallback clip for seed rows that still carry a placeholder link. */
export const DEMO_VIDEO_URL = "https://www.youtube.com/watch?v=B_Etim1UXQ4"

/** The one demo document every PDF viewer opens (served from `public/docs`). */
export const DEMO_PDF_URL = "/docs/correction-concours-reo.pdf"

/**
 * Placeholder ids left over from the first seed pass — recognisable joke/demo
 * clips, not real lessons. They resolve to the demo video instead of playing
 * something absurd inside a cours.
 */
const PLACEHOLDER_IDS = new Set([
  "dQw4w9WgXcQ",
  "oHg5SJYRHA0",
  "9bZkp7q19f0",
  "3JZ_D3ELwOQ",
  "2Z4m4lnjxkY",
])

/** Playable source for a stored video link — the real one when there is one. */
export function videoSrc(storedUrl?: string): string {
  if (!storedUrl) return DEMO_VIDEO_URL
  const id = youtubeId(storedUrl)
  if (!id || PLACEHOLDER_IDS.has(id)) return DEMO_VIDEO_URL
  return storedUrl
}

/** Openable source for a stored document. Prototype: always the demo PDF. */
export function pdfSrc(_stored?: { url?: string }): string {
  return DEMO_PDF_URL
}

/** File name suggested when the élève downloads a document. */
export function pdfFileName(name: string): string {
  const slug = name
    .normalize("NFD")
    // Strip the combining accents NFD just split off, so "Corrigé" → "corrige".
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
  return `${slug || "document"}.pdf`
}

/**
 * The 11-char YouTube id inside a watch / youtu.be / embed link — the IFrame
 * API needs the id, not the url. Returns undefined when nothing matches.
 */
export function youtubeId(url: string): string | undefined {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /\/embed\/([a-zA-Z0-9_-]{11})/,
    /\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return undefined
}

/** "7:04" / "1:02:11" — omits the hour block when there isn't one. */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0
  const s = Math.floor(seconds % 60)
  const m = Math.floor((seconds / 60) % 60)
  const h = Math.floor(seconds / 3600)
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m)
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`
}
