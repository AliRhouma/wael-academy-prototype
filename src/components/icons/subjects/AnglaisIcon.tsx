/**
 * AnglaisIcon — converted from `svg icons/Anglais.svg` (supplied art), recoloured to
 * the Wael tokens: blues ride the brand ramp, lavenders the accent ramp, outlines
 * the neutral ramp, warm/pink details the warning & danger tokens. Token-driven
 * throughout, so it follows whatever palette is active (data-palette) instead of
 * being locked to the source blues.
 *
 * Gradient ids are namespaced `anglais-*` — a grid of these renders at once and
 * duplicate defs ids would cross-wire between cards.
 * Generated, then reviewed; edit here (not the source svg).
 */
import { useGlyphId } from "../useGlyphId"

export function AnglaisIcon({ className }: { className?: string }) {
  const uid = useGlyphId()
  return (
    <svg viewBox="0 0 59 59" className={className} fill="none" aria-hidden="true">
      <g clipPath={`url(#anglais-clip0_8660_250078-${uid})`}>
      <path d="M39.5948 36.1609C39.5948 30.4817 34.975 25.8619 29.2958 25.8619C23.6166 25.8619 18.9968 30.4817 18.9968 36.1609C18.9968 41.8402 23.6166 46.46 29.2958 46.46C34.975 46.46 39.5948 41.8402 39.5948 36.1609ZM39.5948 48.1765H18.9968C18.048 48.1765 17.2803 48.9442 17.2803 49.893V56.8734C17.2803 57.8222 18.048 58.5899 18.9968 58.5899H39.5948C40.5436 58.5899 41.3113 57.8222 41.3113 56.8734V49.893C41.3113 48.9442 40.5436 48.1765 39.5948 48.1765ZM29.2958 12.1299L17.2803 15.5629V22.4289C17.2803 23.39 18.0354 24.1454 18.9968 24.1454H39.5948C40.5562 24.1454 41.3113 23.39 41.3113 22.4289V15.5629L29.2958 12.1299Z" fill={`url(#anglais-paint0_linear_8660_250078-${uid})`}/>
      <path d="M43.0287 20.7125H15.5646C14.6033 20.7125 13.8481 21.4676 13.8481 22.429V49.893C13.8481 50.8542 14.6033 51.6096 15.5646 51.6096H43.0287C43.9901 51.6096 44.7452 50.8542 44.7452 49.893V22.429C44.7452 21.4676 43.9901 20.7125 43.0287 20.7125ZM29.2967 44.7435C24.5591 44.7435 20.7142 40.8986 20.7142 36.161C20.7142 31.4235 24.5591 27.5785 29.2967 27.5785C34.0342 27.5785 37.8792 31.4235 37.8792 36.161C37.8792 40.8986 34.0342 44.7435 29.2967 44.7435ZM40.7971 14.3613L31.0132 4.57734V1.7165C31.0132 0.767735 30.2454 0 29.2967 0C28.3479 0 27.5802 0.767735 27.5802 1.7165V4.57734L17.7962 14.3614C17.4529 14.6704 17.2812 15.1167 17.2812 15.563H41.3122C41.3122 15.1167 41.1404 14.6704 40.7971 14.3613Z" fill={`url(#anglais-paint1_linear_8660_250078-${uid})`}/>
      <path d="M26.6333 35.4486L28.8521 37.264C29.0359 37.4144 29.3038 37.401 29.4717 37.2331L33.5676 33.1372" stroke={`url(#anglais-paint2_linear_8660_250078-${uid})`} strokeWidth="1.38685" strokeLinecap="round"/>
      </g>
      <defs>
      <linearGradient id={`anglais-paint0_linear_8660_250078-${uid}`} x1="28.756" y1="14.0106" x2="29.3928" y2="71.3269" gradientUnits="userSpaceOnUse">
      <stop stopColor="var(--brand-50)"/>
      <stop offset="0.9959" stopColor="var(--accent-100)"/>
      </linearGradient>
      <linearGradient id={`anglais-paint1_linear_8660_250078-${uid}`} x1="19.2041" y1="-1.91054" x2="40.857" y2="47.7636" gradientUnits="userSpaceOnUse">
      <stop stopColor="var(--brand-200)"/>
      <stop offset="1" stopColor="var(--brand-500)"/>
      </linearGradient>
      <linearGradient id={`anglais-paint2_linear_8660_250078-${uid}`} x1="26.6337" y1="35.3331" x2="33.568" y2="35.3331" gradientUnits="userSpaceOnUse">
      <stop stopColor="var(--neutral-600)"/>
      <stop offset="1" stopColor="var(--neutral-700)"/>
      </linearGradient>
      <clipPath id={`anglais-clip0_8660_250078-${uid}`}>
      <rect width="58.59" height="58.59" fill="white"/>
      </clipPath>
      </defs>
    </svg>
  )
}
