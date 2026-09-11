import type { SessionState } from "@/features/student/calendar/schedule"

/**
 * LA COULEUR D'UNE SÉANCE EST SON ÉTAT — one palette, four states, everywhere
 * the roznama draws a séance.
 *
 * The page used to colour two states out of four: rouge pour « دايرة توّا »,
 * or pour « تأجلت », and the other two shared the same tan hairline. Which
 * meant the two states an élève meets MOST — la séance qui arrive et celle qui
 * est passée — looked identical, and the only way to tell them apart was to
 * read the hour and do the arithmetic. Colour was doing half a job.
 *
 * Now every state owns a colour, and the accent it owns is the one the design
 * system already gives it:
 *
 * - **دايرة توّا** — `danger`. Red is « alerte / maintenant » in this system and
 *   nothing else; a séance running is the only thing on the page with a clock
 *   against it, so it gets the loudest surface and a wash strong enough to find
 *   from the other end of the grid.
 * - **تأجلت** — `accent` (gold). Not a warning and not a loss: something the
 *   élève has to NOT turn up to. Gold is the colour the app already spends on
 *   « attention, ça a changé » in the month cells, so it stays put.
 * - **مبرمجة** — `brand`. The normal case, and the calm one: teal edge, plain
 *   white ground. The séance the élève is heading towards next takes the same
 *   teal a step firmer plus a whisper of fill — it is a sub-state of « à
 *   venir », not a fifth state, so it must not read as a different colour.
 * - **انتهت** — `neutral`. A finished séance is settled, not muted-out: it
 *   keeps its full-ink title (it is a thing the élève may well want to find
 *   again) and it is the CARD that steps back, onto the warm grey ground. Grey
 *   is the one non-colour here, which is exactly what « plus rien à faire »
 *   should look like next to three coloured neighbours.
 *
 * TWO SETS OF THE SAME PALETTE, because the two halves of the page paint
 * differently. `card` / `hover` / `tag` are Tailwind classes, for the day
 * panel's cards — those react to the pointer, and an inline `background`
 * outranks any `hover:` the cascade can offer. `edge` / `fill` / `ink` are raw
 * CSS values, for the month grid's cells, which are painted by style because
 * they also carry the matière's own colour on the same element.
 *
 * Referenced for spacing & density: DayList (the card this dresses), MonthGrid
 * (the cell), CreamPanel (the tan edge the calm states sit on).
 */
export interface StateSkin {
  /** Raw CSS — surfaces painted by inline style (the month grid's cells). */
  edge: string
  fill: string
  /** The hour, and anything else the state colours in text. */
  ink: string
  /** Tailwind — surfaces that must keep reacting to the pointer. */
  card: string
  hover: string
  /** The state chip, when the state is worth naming out loud. */
  tag: string
}

const SKIN: Record<SessionState, StateSkin> = {
  "en-cours": {
    edge: "var(--danger-500)",
    fill: "color-mix(in srgb, var(--danger-500) 7%, var(--surface))",
    ink: "var(--danger-600)",
    card: "border-[var(--danger-500)] bg-[color-mix(in_srgb,var(--danger-500)_7%,var(--surface))]",
    hover: "hover:bg-[color-mix(in_srgb,var(--danger-500)_13%,var(--surface))]",
    tag: "bg-danger-50 text-danger-700",
  },
  reportee: {
    edge: "var(--accent-500)",
    fill: "color-mix(in srgb, var(--accent-500) 9%, var(--surface))",
    ink: "var(--accent-700)",
    card: "border-[var(--accent-500)] bg-[color-mix(in_srgb,var(--accent-500)_9%,var(--surface))]",
    hover: "hover:bg-[color-mix(in_srgb,var(--accent-500)_15%,var(--surface))]",
    tag: "bg-accent2-50 text-accent2-700",
  },
  prevue: {
    edge: "var(--brand-300)",
    fill: "var(--surface)",
    ink: "var(--brand-600)",
    card: "border-[var(--brand-300)] bg-[var(--surface)]",
    hover:
      "hover:border-[var(--brand-500)] hover:bg-[color-mix(in_srgb,var(--brand-500)_6%,var(--surface))]",
    tag: "bg-brand-50 text-brand-700",
  },
  terminee: {
    edge: "var(--neutral-200)",
    fill: "var(--neutral-50)",
    ink: "var(--ink-muted)",
    card: "border-[var(--neutral-200)] bg-[var(--neutral-50)]",
    hover: "hover:border-[var(--neutral-300)] hover:bg-[var(--neutral-100)]",
    tag: "bg-neutral-100 text-ink-subtle",
  },
}

/**
 * The skin a séance wears. `next` marks the ONE séance the élève is heading
 * towards — the same teal as any other séance à venir, one step firmer, so it
 * stands out of the list without leaving the state it belongs to.
 */
export function stateSkin(state: SessionState, next = false): StateSkin {
  if (!next || state !== "prevue") return SKIN[state]
  return {
    ...SKIN.prevue,
    edge: "var(--brand-500)",
    fill: "color-mix(in srgb, var(--brand-500) 6%, var(--surface))",
    card: "border-[var(--brand-500)] bg-[color-mix(in_srgb,var(--brand-500)_6%,var(--surface))]",
    hover: "hover:bg-[color-mix(in_srgb,var(--brand-500)_12%,var(--surface))]",
  }
}
