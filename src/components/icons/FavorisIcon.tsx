/**
 * Bookmark + star glyph for "Mes favoris". Ribbon rides the rail blue, the star
 * the rail gold so a saved item reads as "kept / prized". Fixed hex, see
 * `navGlyphColors`. Paths only — see ClassementIcon for why.
 */
import { navGlyph } from "./navGlyphColors"
import { useGlyphId } from "./useGlyphId"

export function FavorisIcon({ className }: { className?: string }) {
  const uid = useGlyphId()
  return (
    <svg
      viewBox="0 0 26 26"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Ribbon with the notched foot */}
      <path
        d="M5.2 2.5 H20.8 A2.6 2.6 0 0 1 23.4 5.1 V23.2 C23.4 24.1 22.4 24.6 21.7 24.1 L13 18.2 L4.3 24.1 C3.6 24.6 2.6 24.1 2.6 23.2 V5.1 A2.6 2.6 0 0 1 5.2 2.5 Z"
        fill={`url(#favBody-${uid})`}
      />
      {/* Star */}
      <path
        d="M13 6.2 L14.046 8.96 L16.995 9.102 L14.693 10.95 L15.469 13.798 L13 12.18 L10.531 13.798 L11.307 10.95 L9.005 9.102 L11.954 8.96 Z"
        fill={`url(#favStar-${uid})`}
      />
      <defs>
        <linearGradient id={`favBody-${uid}`} x1="2.6" y1="2.5" x2="21" y2="24.4" gradientUnits="userSpaceOnUse">
          <stop stopColor={navGlyph.blue400} />
          <stop offset="1" stopColor={navGlyph.blue700} />
        </linearGradient>
        <linearGradient id={`favStar-${uid}`} x1="9" y1="6.2" x2="17" y2="13.8" gradientUnits="userSpaceOnUse">
          <stop stopColor={navGlyph.gold500} />
          <stop offset="1" stopColor={navGlyph.gold600} />
        </linearGradient>
      </defs>
    </svg>
  )
}
