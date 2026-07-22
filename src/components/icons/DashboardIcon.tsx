/**
 * Four-panel dashboard glyph (from `svg icons/dashboard.svg`), recolored to the
 * Wael brand via design tokens (`--emerald-500` → `--brand-600`), so it follows
 * whatever palette is active (data-palette) instead of a hardcoded green.
 * Carries its own fill — mark its NavItem `colored: true` so the shell forces it
 * white on the active gradient pill instead of tinting via `currentColor`.
 */
export function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 26 26"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M16.9008 16.8994C15.4648 16.8994 14.3008 18.0635 14.3008 19.4995V23.3995C14.3008 24.8355 15.4648 25.9996 16.9008 25.9996H16.932C18.5611 25.9996 19.959 25.914 21.1269 25.6544C22.3098 25.3915 23.3351 24.9333 24.1349 24.1335C24.9347 23.3337 25.3929 22.3084 25.6558 21.1255C25.775 20.5891 25.8537 20.0447 25.9053 19.4967C26.0401 18.0671 24.8369 16.8994 23.4009 16.8994H16.9008Z"
        fill="url(#dashGrad)"
      />
      <path
        d="M0 16.9305V14.2993C0 12.8633 1.16408 11.6992 2.60004 11.6992H9.10014C10.5361 11.6992 11.7002 12.8633 11.7002 14.2993V23.3994C11.7002 24.8354 10.5361 25.9994 9.10014 25.9994H9.06894C7.43984 25.9994 6.042 25.9139 4.87397 25.6543C3.69118 25.3914 2.66589 24.9332 1.86609 24.1334C1.06629 23.3336 0.608045 22.3083 0.345181 21.1254C0.0855934 19.9575 0 18.5596 0 16.9305Z"
        fill="url(#dashGrad)"
      />
      <path
        d="M26.001 11.7002C26.001 13.1362 24.8369 14.3002 23.4009 14.3002H16.9008C15.4648 14.3002 14.3008 13.1362 14.3008 11.7002V2.60004C14.3008 1.16408 15.4648 0 16.9008 0H16.932C18.5611 0 19.959 0.0855934 21.1269 0.345181C22.3098 0.608045 23.3351 1.06629 24.1349 1.86609C24.9347 2.66588 25.3929 3.69118 25.6558 4.87397C25.9154 6.042 26.001 7.43984 26.001 9.06894V11.7002Z"
        fill="url(#dashGrad)"
      />
      <path
        d="M11.7008 2.60004C11.7008 1.16408 10.5368 0 9.10077 0H9.06957C7.44047 0 6.04263 0.0855934 4.8746 0.345181C3.69182 0.608045 2.66652 1.06629 1.86672 1.86609C1.06692 2.66589 0.608677 3.69118 0.345813 4.87397C0.226588 5.41042 0.147911 5.95491 0.0962612 6.50283C-0.0384858 7.93246 1.16471 9.10014 2.60067 9.10014H9.10077C10.5368 9.10014 11.7008 7.93606 11.7008 6.5001V2.60004Z"
        fill="url(#dashGrad)"
      />
      <defs>
        {/* Token-driven brand sweep, echoing the app gradient (--grad). */}
        <linearGradient id="dashGrad" x1="13" y1="0" x2="13" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--emerald-500)" />
          <stop offset="1" stopColor="var(--brand-600)" />
        </linearGradient>
      </defs>
    </svg>
  )
}
