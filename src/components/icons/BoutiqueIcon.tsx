/**
 * Storefront glyph for "Boutique" — striped awning over a shopfront with a door.
 * The one red glyph in the rail: a red-and-cream awning is what makes a shop
 * read as a shop, and it anchors the bottom half of the nav the way the gold
 * folder anchors the top. Body stays on the rail blue. Fixed hex, see
 * `navGlyphColors`. Paths only — see ClassementIcon for why.
 */
import { navGlyph } from "./navGlyphColors"
import { useGlyphId } from "./useGlyphId"

export function BoutiqueIcon({ className }: { className?: string }) {
  const uid = useGlyphId()
  return (
    <svg
      viewBox="0 0 26 26"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Shopfront, doorway punched out as an evenodd hole so the door survives
          the active pill (where every path is forced white). */}
      <path
        fillRule="evenodd"
        d="M3.2 10.6 H22.8 V22 A2 2 0 0 1 20.8 24 H5.2 A2 2 0 0 1 3.2 22 Z M9.6 24 V17.2 A2 2 0 0 1 11.6 15.2 H14.4 A2 2 0 0 1 16.4 17.2 V24 Z"
        fill={`url(#shopBody-${uid})`}
      />
      {/* Awning + alternating stripes */}
      <path
        d="M3.6 3.4 H22.4 A2 2 0 0 1 24.4 5.4 V10.6 H1.6 V5.4 A2 2 0 0 1 3.6 3.4 Z"
        fill={`url(#shopAwning-${uid})`}
      />
      <g clipPath={`url(#shopAwningClip-${uid})`}>
        <path d="M1.6 3.4 H5.4 V10.6 H1.6 Z" fill={navGlyph.gold100} />
        <path d="M9.2 3.4 H13 V10.6 H9.2 Z" fill={navGlyph.gold100} />
        <path d="M16.8 3.4 H20.6 V10.6 H16.8 Z" fill={navGlyph.gold100} />
      </g>
      <defs>
        <linearGradient id={`shopBody-${uid}`} x1="3.2" y1="10.6" x2="20" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor={navGlyph.blue400} />
          <stop offset="1" stopColor={navGlyph.blue700} />
        </linearGradient>
        <linearGradient id={`shopAwning-${uid}`} x1="1.6" y1="3.4" x2="1.6" y2="10.6" gradientUnits="userSpaceOnUse">
          <stop stopColor={navGlyph.red500} />
          <stop offset="1" stopColor={navGlyph.red600} />
        </linearGradient>
        <clipPath id={`shopAwningClip-${uid}`}>
          <path d="M3.6 3.4 H22.4 A2 2 0 0 1 24.4 5.4 V10.6 H1.6 V5.4 A2 2 0 0 1 3.6 3.4 Z" />
        </clipPath>
      </defs>
    </svg>
  )
}
