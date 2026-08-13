/**
 * Wall calendar with two rings and a gold "today" pip, for the élève's
 * "الروزنامة". Body rides the rail blue, the pip the rail gold (kicker), the
 * rings sit on the deepest gold so they read against the active gradient pill.
 * Fixed hex, see `navGlyphColors`. Paths only — see ClassementIcon for why.
 */
import { navGlyph } from "./navGlyphColors"
import { useGlyphId } from "./useGlyphId"

export function CalendrierIcon({ className }: { className?: string }) {
  const uid = useGlyphId()
  return (
    <svg
      viewBox="0 0 26 26"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Hanging rings */}
      <path d="M7.4 1.2 A1.3 1.3 0 0 1 8.7 2.5 V5.2 A1.3 1.3 0 0 1 6.1 5.2 V2.5 A1.3 1.3 0 0 1 7.4 1.2 Z" fill={navGlyph.gold700} />
      <path d="M18.6 1.2 A1.3 1.3 0 0 1 19.9 2.5 V5.2 A1.3 1.3 0 0 1 17.3 5.2 V2.5 A1.3 1.3 0 0 1 18.6 1.2 Z" fill={navGlyph.gold700} />
      {/* Body — the header band is punched out as an evenodd hole, so it stays
          readable even on the active pill (where every path is forced white). */}
      <path
        fillRule="evenodd"
        d="M5 3.4 H21 A3.4 3.4 0 0 1 24.4 6.8 V21.2 A3.4 3.4 0 0 1 21 24.6 H5 A3.4 3.4 0 0 1 1.6 21.2 V6.8 A3.4 3.4 0 0 1 5 3.4 Z M3.9 9.9 H22.1 V21.2 A1.1 1.1 0 0 1 21 22.3 H5 A1.1 1.1 0 0 1 3.9 21.2 Z"
        fill={`url(#calBody-${uid})`}
      />
      {/* Grid of days inside the punched-out page */}
      <path
        d="M7 13 H9.4 V15.1 H7 Z M11.8 13 H14.2 V15.1 H11.8 Z M16.6 13 H19 V15.1 H16.6 Z M7 17.4 H9.4 V19.5 H7 Z M11.8 17.4 H14.2 V19.5 H11.8 Z"
        fill={`url(#calGrid-${uid})`}
      />
      {/* Today */}
      <path d="M17.8 18.45 A1.7 1.7 0 1 0 21.2 18.45 A1.7 1.7 0 1 0 17.8 18.45 Z" fill={navGlyph.gold500} />
      <defs>
        <linearGradient id={`calBody-${uid}`} x1="1.6" y1="3.4" x2="22" y2="24.6" gradientUnits="userSpaceOnUse">
          <stop stopColor={navGlyph.blue400} />
          <stop offset="1" stopColor={navGlyph.blue700} />
        </linearGradient>
        <linearGradient id={`calGrid-${uid}`} x1="7" y1="13" x2="19" y2="19.5" gradientUnits="userSpaceOnUse">
          <stop stopColor={navGlyph.blue300} />
          <stop offset="1" stopColor={navGlyph.blue500} />
        </linearGradient>
      </defs>
    </svg>
  )
}
