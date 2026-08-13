import type { CSSProperties } from "react"

/**
 * Arabic letters drifting up behind a matière card.
 *
 * Only the LANGUAGE matières get this, and only Arabic so far: the point is
 * that the card shows you what the matière is made of before you read its name
 * — the same job the illustration does, one layer down. A card that has both a
 * drawing of Wael in a jebba AND its own alphabet floating behind him says
 * "عربية" twice, in two registers, without a word of UI.
 *
 * THE SET IS NOT RANDOM. It opens with the abjad — أ ب ج د / ه و ز / ح ط ي —
 * the order every Tunisian child learns before the alphabet, and closes on ض,
 * the letter Arabic names itself after (لغة الضاد). A pile of arbitrary glyphs
 * would have read as decoration; this reads as the language.
 *
 * Positions are HAND-PLACED, not random, and they all live in one band: the
 * badge medallion is a disc as wide as the card, so the only places a letter is
 * ever SEEN are the two side strips, the four corners the disc doesn't reach,
 * and the label area under it. Every lane is drawn inside that band and climbs
 * along it. The first pass scattered them evenly over the card and nine of ten
 * letters spent their whole life behind Wael's face.
 *
 * Everything animates on transform + opacity only, so a card full of these
 * stays on the compositor. See `.wael-letter` in index.css — under
 * prefers-reduced-motion the letters stop where they are and simply sit there,
 * which is a finished design on its own.
 */

/** The matières that get letters, by name exactly as seeded. Keyed by name like
 *  the art registries next door (`badgeFor`, `sceneFor`) — this is the same
 *  kind of per-matière decision. */
const WITH_LETTERS = new Set(["عربية", "الأدب العربي"])

/** Does this matière float its own alphabet? */
export function hasFloatingLetters(name: string): boolean {
  return WITH_LETTERS.has(name)
}

interface Letter {
  /** The glyph. */
  ch: string
  /** Distance from the card's START edge (right, under `dir="rtl"`), in %. */
  start: number
  /** Where the letter begins its climb, in % down the card. */
  top: number
  /** Font size in px, at the card's own scale. */
  size: number
  /** How far it climbs, in px. Bigger letters travel further — a near/far
   *  parallax that gives the layer depth instead of one flat sheet. */
  rise: number
  /** Sideways drift over the climb, in px. Signed, so the field doesn't lean. */
  sway: number
  /** Seconds for one climb. All different — a shared duration would have them
   *  re-syncing every few cycles no matter how they're delayed. */
  dur: number
  /** NEGATIVE, so the card opens mid-flight instead of with an empty box that
   *  fills up over the first ten seconds. */
  delay: number
  /** Peak opacity. The layer has to stay a whisper: it's behind a drawing. */
  peak: number
}

const LETTERS: Letter[] = [
  // START-side strip, climbing the edge.
  { ch: "أ", start: 4, top: 70, size: 22, rise: 78, sway: 5, dur: 13, delay: -1.5, peak: 0.34 },
  { ch: "ه", start: 3, top: 30, size: 17, rise: 62, sway: 6, dur: 15, delay: -9, peak: 0.28 },
  { ch: "ط", start: 9, top: 6, size: 15, rise: 46, sway: 4, dur: 16, delay: -12, peak: 0.24 },
  // END-side strip.
  { ch: "ج", start: 92, top: 66, size: 24, rise: 82, sway: -6, dur: 12, delay: -4.5, peak: 0.36 },
  { ch: "د", start: 95, top: 34, size: 15, rise: 56, sway: -5, dur: 17, delay: -11, peak: 0.26 },
  { ch: "ح", start: 88, top: 8, size: 18, rise: 50, sway: -6, dur: 15, delay: -6, peak: 0.28 },
  // The label band under the medallion — the widest open ground on the card,
  // so it carries the biggest glyphs.
  { ch: "ب", start: 26, top: 92, size: 17, rise: 40, sway: -4, dur: 16, delay: -7, peak: 0.3 },
  { ch: "و", start: 70, top: 95, size: 19, rise: 44, sway: 5, dur: 14, delay: -2.5, peak: 0.32 },
  { ch: "ز", start: 46, top: 97, size: 14, rise: 34, sway: -3, dur: 18, delay: -13, peak: 0.24 },
  // لغة الضاد — the big one, lowest and slowest, the last to leave the card.
  { ch: "ض", start: 14, top: 97, size: 30, rise: 52, sway: -6, dur: 11, delay: -8.5, peak: 0.34 },
]

/**
 * The layer. Sized by its parent, so it wants a positioned, clipping ancestor —
 * on the matière card that's the card itself.
 */
export function FloatingLetters({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={className}>
      {LETTERS.map((l, i) => (
        <span
          key={`${l.ch}-${i}`}
          /* `font-display` rather than a hardcoded family: the letters then
             follow whichever type pack is active (see FontDock), which is the
             whole point of that dock — a brush-Arabic pack turns this layer
             into brushwork for free. */
          className="wael-letter font-display absolute select-none font-bold leading-none"
          style={
            {
              insetInlineStart: `${l.start}%`,
              top: `${l.top}%`,
              fontSize: `${l.size}px`,
              animationDuration: `${l.dur}s`,
              animationDelay: `${l.delay}s`,
              "--rise": `${l.rise}px`,
              "--sway": `${l.sway}px`,
              "--peak": l.peak,
            } as CSSProperties
          }
        >
          {l.ch}
        </span>
      ))}
    </span>
  )
}
