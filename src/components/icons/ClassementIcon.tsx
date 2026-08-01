/**
 * Podium + gold star glyph for "Classement". Steps ride the brand ramp
 * (`--brand-*`), the winner's star rides `--warning-*` — the one place a warm
 * gold is semantically right (a gold medal) and still fully token-driven, so it
 * follows whatever palette is active (data-palette).
 *
 * All shapes are <path> on purpose: the shell forces `[&_path]:fill-white` on a
 * `colored: true` NavItem, so a <rect>/<circle> would stay tinted on the active
 * gradient pill. Same rule in every glyph here.
 */
import { useGlyphId } from "./useGlyphId"

export function ClassementIcon({ className }: { className?: string }) {
  const uid = useGlyphId()
  return (
    <svg
      viewBox="0 0 26 26"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* 2nd place — left step */}
      <path
        d="M2 14 H7 A1.6 1.6 0 0 1 8.6 15.6 V23.4 A1.6 1.6 0 0 1 7 25 H2 A1.6 1.6 0 0 1 0.4 23.4 V15.6 A1.6 1.6 0 0 1 2 14 Z"
        fill={`url(#clsSide-${uid})`}
      />
      {/* 3rd place — right step (shortest) */}
      <path
        d="M19 16.5 H24 A1.6 1.6 0 0 1 25.6 18.1 V23.4 A1.6 1.6 0 0 1 24 25 H19 A1.6 1.6 0 0 1 17.4 23.4 V18.1 A1.6 1.6 0 0 1 19 16.5 Z"
        fill={`url(#clsSide-${uid})`}
      />
      {/* 1st place — centre step, tallest and darkest so the eye lands here */}
      <path
        d="M10.4 10.4 H15.6 A1.8 1.8 0 0 1 17.4 12.2 V23.2 A1.8 1.8 0 0 1 15.6 25 H10.4 A1.8 1.8 0 0 1 8.6 23.2 V12.2 A1.8 1.8 0 0 1 10.4 10.4 Z"
        fill={`url(#clsCentre-${uid})`}
      />
      {/* Gold star crowning the podium */}
      <path
        d="M13 2 L14.146 5.022 L17.374 5.179 L14.855 7.203 L15.704 10.321 L13 8.55 L10.296 10.321 L11.145 7.203 L8.626 5.179 L11.854 5.022 Z"
        fill={`url(#clsStar-${uid})`}
      />
      <defs>
        <linearGradient id={`clsSide-${uid}`} x1="13" y1="14" x2="13" y2="25" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-300)" />
          <stop offset="1" stopColor="var(--brand-500)" />
        </linearGradient>
        <linearGradient id={`clsCentre-${uid}`} x1="13" y1="10.4" x2="13" y2="25" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-500)" />
          <stop offset="1" stopColor="var(--brand-700)" />
        </linearGradient>
        <linearGradient id={`clsStar-${uid}`} x1="8.6" y1="2" x2="17.4" y2="10.3" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--warning-500)" />
          <stop offset="1" stopColor="var(--warning-600)" />
        </linearGradient>
      </defs>
    </svg>
  )
}
