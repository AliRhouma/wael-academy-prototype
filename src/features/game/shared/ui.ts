import { cn } from "@/lib/utils"

/**
 * The game apps' pressables — the `play` skin's lip, written out as classes.
 *
 * `/mobilegame` and `/webgame` live outside `[data-space="v2"]`, where
 * `play.css`'s hooks apply, so they carry the same physics themselves: a
 * zero-blur lip in the hue's own darker edge that collapses in ~80 ms under
 * the finger and springs back. Unlike the élève space, these apps ARE allowed
 * the game mechanics (points, levels, leagues) — that is what they are for.
 *
 * The edges come from the play tokens on <html data-skin="play">, with the
 * light value as fallback for `?skin=soft`.
 */
const press =
  "transition-[translate,box-shadow,filter,border-color,background-color] duration-200 ease-[cubic-bezier(.34,1.56,.64,1)] active:duration-75 focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-v2-brand"

/** The one lime action of a screen. */
export const gCta = cn(
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-v2-cta font-extrabold text-v2-on-cta",
  "shadow-[0_4px_0_var(--v2-edge-cta,#5bcd3f)] hover:brightness-[1.03] active:translate-y-[4px] active:shadow-none",
  "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
  press,
)

/** A secondary pill — white, 2px line, a quiet lip. */
export const gBtn = cn(
  "inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-v2-ink/15 bg-v2-surface font-bold text-v2-ink",
  "shadow-[0_3px_0_var(--v2-edge-tile,rgb(23_46_91/.14))] hover:border-v2-brand/40 active:translate-y-[3px] active:shadow-none",
  press,
)

/** Secondary on a dark (chapter) ground. */
export const gGhostDark = cn(
  "inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/25 bg-white/10 font-bold text-white",
  "shadow-[0_3px_0_rgb(0_0_0/.25)] hover:bg-white/15 active:translate-y-[3px] active:shadow-none",
  press,
)

/** A section that only informs — flat, 2px border, no lip. */
export const gPanel = "rounded-3xl border-2 border-v2-ink/10 bg-v2-surface"

export const gInput = cn(
  "block w-full rounded-2xl border-2 border-v2-ink/15 bg-v2-surface px-4 text-v2-ink outline-none transition",
  "placeholder:text-v2-ink-3 hover:border-v2-ink/30 focus:border-v2-brand focus:ring-4 focus:ring-v2-brand/15",
)

/** The 40px icon plate — one hue per meaning, white glyph. */
export const gPlate = "grid shrink-0 place-items-center rounded-xl text-white"
