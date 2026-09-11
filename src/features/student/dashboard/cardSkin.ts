/**
 * The dashboard's SECOND skin — « les cartes pleines ».
 *
 * The page ships two designs and the demo switches between them with the D key
 * (see `useDemoToggle` in `StudentDashboard`). The default is the one that has
 * always been here: cream panels holding white cards on a tan edge. This is the
 * other one — the same layout, the same content, but every card INSIDE a panel
 * takes the brand fill the logo plate wears, and its ink flips to white.
 *
 * The rule that keeps it from becoming a blue page:
 *
 *   PANELS STAY CREAM. Only the objects inside them fill.
 *
 * The panel is the room; the cards are the things in it. Fill both and the page
 * loses its levels — a filled card on a filled panel has nothing to sit on, and
 * the frame that tells you where one section ends stops reading. So the two
 * برنامج اليوم tiles, the documents in the queue and the replays on the board go
 * blue, and the five panels around them do not.
 *
 * WHAT DOESN'T FILL, and why it would be a mistake to:
 *
 * - The week's séance rows. Their FRAME is the state — red while a séance runs,
 *   gold when one is reported, faded once it is done. A brand fill eats all
 *   three, and « where do I have to be » is the one place on this page that
 *   cannot afford to lose a state.
 * - The live panel's join button. It is already the loudest brand surface on the
 *   page; filling the cards around it costs it its rank, so the panel keeps its
 *   calm ground to hold the button up.
 *
 * THE BLUE is the logo plate's own — `bg-grad shadow-brand`, the two classes
 * straight out of `AppShell`, so a filled card reads as the same material as
 * the mark in the corner rather than as a blue that happens to be nearby.
 *
 * It is spent on the things you TAKE: a document to download, a replay to open.
 * Those are objects, they come in stacks, and a stack of them in the brand's
 * blue is what this skin is for.
 *
 * The برنامج اليوم tiles are NOT among them, and that was tried both ways. In
 * the logo's blue they outranked the queue and the board — two figures shouting
 * louder than a dozen things to do; in a pale wash of the same family they read
 * as two more objects rather than as one panel's summary. They keep the theme's
 * own ground in both skins: a frame around a drawing and two numbers, with the
 * panel showing through.
 *
 * Cards on the fill carry their own ink — white, below — because nothing else
 * in the palette survives on it.
 */
export const SOLID = {
  /** The card ground: the logo plate's fill and the glow under it. */
  box: "bg-grad shadow-brand",
  /** Ink on the fill. Flat white — the fill is dark enough at every palette. */
  ink: "#fff",
  /**
   * Secondary ink. 78 % rather than a grey: a grey on a coloured ground goes
   * muddy, where the ground showing through white stays the same hue as the
   * card and reads as one material.
   */
  inkMuted: "rgb(255 255 255 / 0.78)",
  /** A chip riding a filled card — a hole punched in the white. */
  chip: "rgb(255 255 255 / 0.18)",
  /** Its edge, and any hairline drawn on the fill. */
  edge: "rgb(255 255 255 / 0.30)",
} as const
