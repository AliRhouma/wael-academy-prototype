/**
 * Play-button-in-a-squircle glyph for "Assistance" — the section is help videos,
 * so a play mark reads truer than a headset. Kept visually distinct from
 * LiveIcon (a camcorder) so the two never blur in the rail. Token-driven
 * (data-palette). Paths only — see ClassementIcon for why.
 */
import { useGlyphId } from "./useGlyphId"

export function AssistanceIcon({ className }: { className?: string }) {
  const uid = useGlyphId()
  return (
    <svg
      viewBox="0 0 26 26"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Squircle with the play mark punched out as an evenodd hole, so the mark
          survives the active pill (where every path is forced white) — it shows
          the sidebar when idle and the gradient when selected. */}
      <path
        fillRule="evenodd"
        d="M8 1.6 H18 A6.4 6.4 0 0 1 24.4 8 V18 A6.4 6.4 0 0 1 18 24.4 H8 A6.4 6.4 0 0 1 1.6 18 V8 A6.4 6.4 0 0 1 8 1.6 Z M10.4 8.6 L18.2 12.35 C18.75 12.62 18.75 13.38 18.2 13.65 L10.4 17.4 C9.9 17.64 9.4 17.31 9.4 16.75 V9.25 C9.4 8.69 9.9 8.36 10.4 8.6 Z"
        fill={`url(#aidBody-${uid})`}
      />
      <defs>
        <linearGradient id={`aidBody-${uid}`} x1="1.6" y1="1.6" x2="24.4" y2="24.4" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-400)" />
          <stop offset="1" stopColor="var(--brand-700)" />
        </linearGradient>
      </defs>
    </svg>
  )
}
