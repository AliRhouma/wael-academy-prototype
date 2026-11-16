import { cn } from "@/lib/utils"

/**
 * « مدينة وائل » — the student's town, drawn as the brand draws: flat colour,
 * one 3px navy outline, a darker lip under the island. Original, education-
 * themed buildings (no borrowed game art): Wael's house in the middle, the
 * library tower of stacked books, the maths observatory, the physics lab, the
 * greenhouse (SVT) and the languages pavilion.
 *
 * Fills use the v2 tokens where one exists. The few illustration-only shades
 * (grass, glass, wood) have no token — they are the subject hues of
 * `subjectTint.ts` lightened, kept here as hex with this note.
 *
 * Motion: the flags wave and two clouds drift, both off under reduced motion.
 */
const OL = {
  stroke: "var(--v2-ink)",
  strokeWidth: 3,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
}

function Tree({ x, y, s = 1, c = "#3f9a5c" }: { x: number; y: number; s?: number; c?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-3.5" y="-14" width="7" height="15" rx="3" fill="#8a5a2b" {...OL} strokeWidth={2.5} />
      <circle cy="-26" r="15" fill={c} {...OL} strokeWidth={2.5} />
      <circle cx="-5" cy="-31" r="4.5" fill="#fff" opacity=".28" />
    </g>
  )
}

/** A building name, haloed in white so it reads over grass and paths. */
function Label({ x = 0, y, children }: { x?: number; y: number; children: string }) {
  return (
    <text x={x} y={y} textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--v2-ink)" stroke="#fff" strokeWidth={4} strokeLinejoin="round" paintOrder="stroke">
      {children}
    </text>
  )
}

function Flag({ x, y, c = "var(--v2-cta)" }: { x: number; y: number; c?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0v-22" {...OL} strokeWidth={2.5} fill="none" />
      <path className="town-flag" d="M0 -22l15 4-15 5z" fill={c} {...OL} strokeWidth={2} />
    </g>
  )
}

export function TownArt({ className, labels = false }: { className?: string; labels?: boolean }) {
  return (
    <svg
      viewBox="0 0 420 290"
      className={cn("block", className)}
      role="img"
      aria-label="مدينة وائل: دار وائل، برج المكتبة، مرصد الرياضيات، مخبر الفيزياء، البيت الأخضر وجناح اللغات"
      style={{ direction: "ltr" }}
    >
      <style>{`
        .town-flag { transform-box: fill-box; transform-origin: left center; animation: town-wave 2.4s ease-in-out infinite; }
        .town-cloud { animation: town-drift 14s ease-in-out infinite alternate; }
        .town-cloud.b { animation-duration: 18s; animation-delay: -6s; }
        @keyframes town-wave { 0%,100% { transform: skewY(0) scaleX(1); } 50% { transform: skewY(-8deg) scaleX(.86); } }
        @keyframes town-drift { from { transform: translateX(-10px); } to { transform: translateX(14px); } }
        @media (prefers-reduced-motion: reduce) { .town-flag, .town-cloud { animation: none; } }
      `}</style>

      {/* clouds */}
      <g className="town-cloud" opacity=".9">
        <path d="M58 52a14 14 0 0 1 26-6 11 11 0 0 1 17 9H50a9 9 0 0 1 8-3z" fill="#fff" {...OL} strokeWidth={2.5} />
      </g>
      <g className="town-cloud b" opacity=".9">
        <path d="M318 36a13 13 0 0 1 24-5 10 10 0 0 1 15 8h-46a8 8 0 0 1 7-3z" fill="#fff" {...OL} strokeWidth={2.5} />
      </g>

      {/* water + island (the lip is the darker ellipse under it) */}
      <ellipse cx="210" cy="212" rx="204" ry="66" fill="var(--v2-brand)" opacity=".14" />
      <ellipse cx="210" cy="200" rx="176" ry="60" fill="#5bcd3f" {...OL} />
      <ellipse cx="210" cy="190" rx="176" ry="60" fill="#d3f8c2" {...OL} />
      <ellipse cx="96" cy="214" rx="20" ry="7" fill="var(--v2-brand)" opacity=".35" />

      {/* paths */}
      <g stroke="#fff" strokeWidth="9" strokeLinecap="round" opacity=".95" fill="none">
        <path d="M210 192 L128 158" />
        <path d="M210 192 L298 156" />
        <path d="M210 192 L118 212" />
        <path d="M210 192 L306 216" />
        <path d="M210 192 L210 238" />
      </g>

      {/* library tower — stacked books */}
      <g transform="translate(128 160)">
        <rect x="-22" y="-14" width="44" height="14" rx="3" fill="var(--v2-brand)" {...OL} />
        <rect x="-19" y="-28" width="38" height="14" rx="3" fill="#7b4ddb" {...OL} />
        <rect x="-23" y="-42" width="46" height="14" rx="3" fill="var(--v2-done)" {...OL} />
        <rect x="-18" y="-56" width="36" height="14" rx="3" fill="#4a7fd4" {...OL} />
        <path d="M-14 -56 L0 -74 L14 -56z" fill="var(--v2-deep)" {...OL} />
        <Flag x={0} y={-74} />
        {labels && <Label y={22}>برج المكتبة</Label>}
      </g>

      {/* maths observatory */}
      <g transform="translate(298 158)">
        <rect x="-20" y="-30" width="40" height="30" rx="4" fill="#fff" {...OL} />
        <path d="M-24 -30a24 24 0 0 1 48 0z" fill="#3f9a5c" {...OL} />
        <path d="M2 -52l14 -12" {...OL} strokeWidth={5} />
        <text x="0" y="-9" textAnchor="middle" fontSize="15" fontWeight="900" fill="var(--v2-ink)" fontFamily="Georgia, serif">π</text>
        {labels && <Label y={20}>مرصد الرياضيات</Label>}
      </g>

      {/* Wael's house — the heart of the town */}
      <g transform="translate(210 194)">
        <rect x="-38" y="-40" width="76" height="40" rx="5" fill="#fff" {...OL} />
        <path d="M-26 -40a26 26 0 0 1 52 0z" fill="var(--v2-brand)" {...OL} />
        <rect x="-10" y="-24" width="20" height="24" rx="10" fill="var(--v2-deep)" {...OL} />
        <rect x="-31" y="-30" width="13" height="11" rx="3" fill="#d4eef1" {...OL} strokeWidth={2.5} />
        <rect x="18" y="-30" width="13" height="11" rx="3" fill="#d4eef1" {...OL} strokeWidth={2.5} />
        <Flag x={0} y={-66} c="var(--v2-live)" />
        {labels && <Label x={0} y={-94}>دار وائل</Label>}
      </g>

      {/* physics lab */}
      <g transform="translate(116 218)">
        <rect x="-24" y="-30" width="48" height="30" rx="4" fill="#4a7fd4" {...OL} />
        <path d="M-27 -30h54l-6 -10h-42z" fill="var(--v2-ink)" {...OL} />
        <path d="M-4 -24v6l-7 12h22l-7 -12v-6" fill="#fff" {...OL} strokeWidth={2.5} />
        <circle cx="0" cy="-9" r="2.5" fill="var(--v2-cta)" />
        {labels && <Label y={16}>مخبر الفيزياء</Label>}
      </g>

      {/* greenhouse (SVT) */}
      <g transform="translate(308 222)">
        <path d="M-28 0v-16a28 22 0 0 1 56 0v16z" fill="#bfe9f0" {...OL} />
        <path d="M-14 0v-28M0 0v-34M14 0v-28" {...OL} strokeWidth={2} fill="none" />
        <circle cx="-8" cy="-6" r="5" fill="#3f9a5c" />
        <circle cx="9" cy="-7" r="6" fill="#3f9a5c" />
        {labels && <Label y={16}>البيت الأخضر</Label>}
      </g>

      {/* languages pavilion */}
      <g transform="translate(210 250)">
        <rect x="-18" y="-18" width="36" height="18" rx="3" fill="#fff" {...OL} />
        <path d="M-24 -18L0 -36L24 -18z" fill="var(--v2-done)" {...OL} />
        <text x="-7" y="-4" textAnchor="middle" fontSize="9" fontWeight="900" fill="var(--v2-ink)">ع</text>
        <text x="7" y="-4" textAnchor="middle" fontSize="8" fontWeight="900" fill="var(--v2-ink)">Fr</text>
      </g>

      {/* trees */}
      <Tree x={62} y={186} s={0.9} />
      <Tree x={168} y={150} s={0.75} c="#57b26f" />
      <Tree x={256} y={146} s={0.7} />
      <Tree x={356} y={180} s={0.9} c="#57b26f" />
      <Tree x={160} y={244} s={0.7} />
      <Tree x={262} y={246} s={0.75} c="#57b26f" />
      <Tree x={372} y={222} s={0.6} />
    </svg>
  )
}
