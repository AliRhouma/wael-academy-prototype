/**
 * Folder glyph for "Matières" — a dark back plate with a lighter front flap so
 * it reads with depth at 21px. Both ride the brand ramp (`--brand-*`), so the
 * folder follows whatever palette is active (data-palette).
 * Paths only — see ClassementIcon for why.
 */
import { useGlyphId } from "./useGlyphId"

export function MatieresIcon({ className }: { className?: string }) {
  const uid = useGlyphId()
  return (
    <svg
      viewBox="0 0 26 26"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Back plate, with the tab that carries the folder silhouette */}
      <path
        d="M1 6.4 A2 2 0 0 1 3 4.4 H9.2 C9.96 4.4 10.66 4.83 11 5.5 L11.9 7.3 H23 A2 2 0 0 1 25 9.3 V19.9 A2 2 0 0 1 23 21.9 H3 A2 2 0 0 1 1 19.9 Z"
        fill={`url(#matBack-${uid})`}
      />
      {/* Front flap, inset and lighter */}
      <path
        d="M2.3 12.5 A2 2 0 0 1 4.3 10.5 H21.7 A2 2 0 0 1 23.7 12.5 V19.9 A2 2 0 0 1 21.7 21.9 H4.3 A2 2 0 0 1 2.3 19.9 Z"
        fill={`url(#matFront-${uid})`}
      />
      <defs>
        <linearGradient id={`matBack-${uid}`} x1="4" y1="4.4" x2="21" y2="21.9" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-500)" />
          <stop offset="1" stopColor="var(--brand-700)" />
        </linearGradient>
        <linearGradient id={`matFront-${uid}`} x1="4" y1="10.5" x2="19" y2="21.9" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-200)" />
          <stop offset="1" stopColor="var(--brand-400)" />
        </linearGradient>
      </defs>
    </svg>
  )
}
