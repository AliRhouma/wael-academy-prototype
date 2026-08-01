/**
 * Two stacked screens with a play mark for "Séances enregistrées" — an archive
 * of replays, not a live broadcast (that's LiveIcon). The back card rides the
 * accent ramp, the front one the brand ramp, and the play triangle is punched
 * out as an evenodd hole so it survives the active pill, where every path is
 * forced white. Token-driven throughout; paths only.
 */
import { useGlyphId } from "./useGlyphId"

export function ReplayIcon({ className }: { className?: string }) {
  const uid = useGlyphId()
  return (
    <svg
      viewBox="0 0 26 26"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Back card — the "archive" behind the one being played */}
      <path
        d="M9.5 2.5 H21.5 A3 3 0 0 1 24.5 5.5 V16 A3 3 0 0 1 21.5 19 H20.5 V8.5 A3 3 0 0 0 17.5 5.5 H9.5 Z"
        fill={`url(#replayBack-${uid})`}
      />
      {/* Front card, play mark punched out */}
      <path
        fillRule="evenodd"
        d="M4.5 6.5 H17.5 A3 3 0 0 1 20.5 9.5 V20.5 A3 3 0 0 1 17.5 23.5 H4.5 A3 3 0 0 1 1.5 20.5 V9.5 A3 3 0 0 1 4.5 6.5 Z M9 11.2 L14.8 15 L9 18.8 Z"
        fill={`url(#replayFront-${uid})`}
      />
      <defs>
        <linearGradient
          id={`replayBack-${uid}`}
          x1="9.5"
          y1="2.5"
          x2="24.5"
          y2="19"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--accent-500)" />
          <stop offset="1" stopColor="var(--accent-700)" />
        </linearGradient>
        <linearGradient
          id={`replayFront-${uid}`}
          x1="1.5"
          y1="6.5"
          x2="18"
          y2="23.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--brand-400)" />
          <stop offset="1" stopColor="var(--brand-700)" />
        </linearGradient>
      </defs>
    </svg>
  )
}
