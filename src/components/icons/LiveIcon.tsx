/**
 * Camcorder + red "on air" dot for "Séances en direct". Body/lens ride the brand
 * and accent ramps; only the live dot uses `--danger-500`, which is the whole
 * point of the glyph (something is broadcasting now). Token-driven throughout.
 * Paths only — see ClassementIcon for why.
 */
import { useGlyphId } from "./useGlyphId"

export function LiveIcon({ className }: { className?: string }) {
  const uid = useGlyphId()
  return (
    <svg
      viewBox="0 0 26 26"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* "On air" dot, riding above the body */}
      <path d="M18.4 4.6 A3.1 3.1 0 1 0 24.6 4.6 A3.1 3.1 0 1 0 18.4 4.6 Z" fill="var(--danger-500)" />
      {/* Camera body, play mark punched out as an evenodd hole so it survives the
          active pill (where every path is forced white). */}
      <path
        fillRule="evenodd"
        d="M4 8 H14.4 A3 3 0 0 1 17.4 11 V17 A3 3 0 0 1 14.4 20 H4 A3 3 0 0 1 1 17 V11 A3 3 0 0 1 4 8 Z M7.8 11.4 L12.6 14 L7.8 16.6 Z"
        fill={`url(#liveBody-${uid})`}
      />
      {/* Lens prism */}
      <path
        d="M16.6 13.05 L23.9 9.6 C24.5 9.2 25.3 9.63 25.3 10.35 V17.65 C25.3 18.37 24.5 18.8 23.9 18.4 L16.6 14.95 Z"
        fill={`url(#liveLens-${uid})`}
      />
      <defs>
        <linearGradient id={`liveBody-${uid}`} x1="1" y1="8" x2="15" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-400)" />
          <stop offset="1" stopColor="var(--brand-700)" />
        </linearGradient>
        <linearGradient id={`liveLens-${uid}`} x1="18.6" y1="9.6" x2="25.3" y2="18.4" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--accent-500)" />
          <stop offset="1" stopColor="var(--accent-700)" />
        </linearGradient>
      </defs>
    </svg>
  )
}
