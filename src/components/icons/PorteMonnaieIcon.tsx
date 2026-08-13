/**
 * Wallet glyph for "المحفظة" — a card peeking out behind the wallet body,
 * with a side pocket and a coin. The wallet body carries the rail gold (money
 * reads warm, and it echoes the Matières folder further up the rail) while the
 * tucked card and the coin stay blue so they separate from it. Fixed hex, see
 * `navGlyphColors`. Paths only — see ClassementIcon for why.
 */
import { navGlyph } from "./navGlyphColors"
import { useGlyphId } from "./useGlyphId"

export function PorteMonnaieIcon({ className }: { className?: string }) {
  const uid = useGlyphId()
  return (
    <svg
      viewBox="0 0 26 26"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Card tucked in behind */}
      <path
        d="M6.2 3 H17.4 A2 2 0 0 1 19.4 5 V7 H4.2 V5 A2 2 0 0 1 6.2 3 Z"
        fill={`url(#wltCard-${uid})`}
      />
      {/* Wallet body, coin pocket punched out as an evenodd hole so the notch
          survives the active pill (where every path is forced white). */}
      <path
        fillRule="evenodd"
        d="M4.9 6.5 H21.1 A3.4 3.4 0 0 1 24.5 9.9 V18.1 A3.4 3.4 0 0 1 21.1 21.5 H4.9 A3.4 3.4 0 0 1 1.5 18.1 V9.9 A3.4 3.4 0 0 1 4.9 6.5 Z M17.2 11.6 H24.5 V16.4 H17.2 A2.4 2.4 0 0 1 17.2 11.6 Z"
        fill={`url(#wltBody-${uid})`}
      />
      {/* Coin */}
      <path d="M18.9 14 A1.5 1.5 0 1 0 21.9 14 A1.5 1.5 0 1 0 18.9 14 Z" fill={`url(#wltCoin-${uid})`} />
      <defs>
        <linearGradient id={`wltCard-${uid}`} x1="4.2" y1="3" x2="4.2" y2="7" gradientUnits="userSpaceOnUse">
          <stop stopColor={navGlyph.blue300} />
          <stop offset="1" stopColor={navGlyph.blue500} />
        </linearGradient>
        <linearGradient id={`wltBody-${uid}`} x1="1.5" y1="6.5" x2="20" y2="21.5" gradientUnits="userSpaceOnUse">
          <stop stopColor={navGlyph.gold500} />
          <stop offset="1" stopColor={navGlyph.gold700} />
        </linearGradient>
        <linearGradient id={`wltCoin-${uid}`} x1="18.9" y1="12.5" x2="21.9" y2="15.5" gradientUnits="userSpaceOnUse">
          <stop stopColor={navGlyph.blue500} />
          <stop offset="1" stopColor={navGlyph.blue700} />
        </linearGradient>
      </defs>
    </svg>
  )
}
