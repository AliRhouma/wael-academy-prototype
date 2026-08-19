---
name: wael-subject-eyes
description: Wire a newly delivered Wael Academy subject badge (matière illustration) into the app and make its eyes follow the cursor. Triggers whenever the user drops a new subject SVG into `svg icons/` and asks to add it, update the subject art, "make the eyes move", "add the eye feature", "add the eyes to this one", or re-delivers a badge that already had eyes. Covers the fill-opacity marking convention, the generator, the invariants that must hold, how to verify the gaze visually, and the constants that tune it. Use it for every new badge, even a single one — the failure modes are silent and look like "it works" until you zoom in.
---

# Subject badge eyes — the whole pipeline

The designer delivers one illustration per matière ("badge": a circular medallion,
Wael inside a navy-ringed disc, head breaking over the top). When a badge ships as
**SVG with its eye shapes flagged**, its eyes track the cursor. PNG badges keep
their drawn gaze and are fine — the feature only ever adds.

**Read `scripts/extract-eyes.mjs` and `src/components/icons/subjects/Eyes.tsx`
before changing anything here.** Both carry the reasoning inline.

## The designer's convention

Every eye shape is flagged with **99 % fill opacity** — exports as
`fill-opacity="0.99"`. It is visually a no-op but survives every export, so it
needs no layer naming.

### The colour contract

Two inks are FIXED, and they are what says which parts hold still. Everything
else in the marked set moves.

| Part | Ink | Opacity | Behaviour |
|---|---|---|---|
| The white — the ring the iris sits in | **exactly `#FDFDFD`** | 99 % | static, drawn UNDER the iris |
| The arc — dark lid shadow capping the eye | **exactly `#0F090A`** | 99 % | static, drawn OVER the iris |
| Iris, pupil, shading, catchlight | anything **except those two** | 99 % | MOVES |
| Everything that is not an eye | anything | 100 % | untouched |

The ring is therefore two-tone: dark arc across the top, white below. Both are
part of the eye's *socket*, not of the thing that swivels inside it.

The arc is **optional** — a badge with no lid shadow just has an empty `over`
list, which costs nothing. Philosophie is that case: it uses `#0F090A` elsewhere
in the drawing at 100 %, which is why the marker is opacity AND ink, never ink
alone.

Only those two hexes are fixed. The moving parts keep their own fills, so a badge
can have any eye colour and any number of parts.

The generator matches `#FDFDFD` outright. If an eye has no shape at that hex it
falls back to a guess — the largest combined bounding box, arc excluded, which is
the white because the ring encloses the iris — and **warns loudly**. A warning
means verify that eye by hand, and prefer fixing the art.

## Steps

1. **Optimise, then put it in `svg icons/subjects/`**, named for the matière —
   `Group 60.svg` / `Group (1).svg` are Figma defaults and mean nothing later.

   ```
   npm i -D svgo && npx svgo -f "svg icons/New Subject svg" -o "svg icons/subjects"
   ```

   `svgo.config.mjs` at the repo root is NOT preset-default — it turns off
   `removeViewBox` (the overlay draws on it) and `mergePaths` (it welds both
   eyes' whites into one path, and the left/right split then collapses). Takes
   about a third off. Verify the marked set survived before trusting it: same
   count, same fills, same viewBox.
2. **Check the framing before anything else.** The family is a 1434×1654 figure
   drawn at (363,146) on a **2118×2014** canvas. A badge exported cropped to its
   own content (anglais shipped at 1435×1649, disc filling 99 % of the width)
   renders noticeably bigger than its neighbours under `object-contain`. Nothing
   is missing — only the margin — so restore the window by editing the viewBox,
   e.g. `viewBox="-363 -146 2118 2014"` with matching width/height. Compare the
   disc diameter as a share of canvas width: it should be **67 %**. Do this BEFORE
   generating, since the overlay draws on that viewBox.
3. **Register the art** in `src/components/icons/subjects.tsx`: `import` it, then
   add it to `BADGE_BY_NAME` keyed by the matière name **exactly as seeded** in
   `src/data/seed/subjects.json` (Arabic).
4. **Measure a card tint** for `BADGE_COLOR` in
   `src/features/student/subjectTint.ts` — sample the DISC BACKDROP, not the whole
   canvas. It is the same character on every badge, so his skin and jacket would
   flatten every card into one beige; the backdrop is what distinguishes them.
   Feed the RAW measurement — `subjectTint` keeps the hue and pins lightness, so a
   dark backdrop still yields a readable card.
5. **Map the file to the matière** in `SUBJECT_BY_FILE` at the top of
   `scripts/extract-eyes.mjs`.
6. **Generate:** `npm i -D playwright && node scripts/extract-eyes.mjs`, then
   `npm uninstall -D playwright`. It is only needed to RUN the script; nothing
   ships with it. Output is `src/components/icons/subjects/eyeGeometry.ts` —
   generated, never hand-edited.
7. **Read the script's output.** Per file it prints the shape count, how many of
   them sit over the iris, and the travel; it warns on the failure modes below.
   Treat every warning as real — they were all written after the thing they
   describe was found the hard way, in art that looked fine in a screenshot.
8. **Verify visually** (mandatory — see below), then `npx tsc -b && npm run build`.

## The invariants

Break any of these and it still *renders*; it just looks subtly wrong.

**0. Mask, never `<clipPath>`.** A clipPath's children are combined into ONE
path and the winding rule is applied across the lot, so two overlapping children
wound in OPPOSITE directions cancel instead of uniting. The white ring and the
iris overlap by construction, and the art winds them opposite — so a clip bites a
hole out of the iris exactly where the ring passes under it, and the iris renders
as a crescent. It looks like a travel or geometry fault and is neither. A `<mask>`
composites luminance instead of resolving windings: white over white is white.
Give the mask `maskUnits="userSpaceOnUse"` and the whole frame as its region — the
default is 120 % of the MASKED content's box, which is the iris, far too tight
once it travels.

**0b. One path can hold BOTH eyes.** `anglais` keeps a piece of each iris in a
single path. Handed to one eye it makes that iris three times the width of its
white and travel comes out NEGATIVE; left out of the mask and repaint it leaves a
hole where the eye's own half should be. So it is given to BOTH eyes, and each
eye's mask `region` — its own box, padded by a third — is what discards the far
half. The generator detects and reports these.

**1. The white is a RING, not a disc.** It is drawn around the iris, so neither
shape is a complete eye alone. The repaint and the clip both use **`sclera ∪ over
∪ iris`**. Clipping to the ring alone punches a hole exactly where the iris must
travel, so only the sliver crossing the ring moves — the symptom is "just a thin
stroke moves with the cursor". To check a new file, render only the shapes matched
as white onto a garish background: green through the middle means ring.

**2. Nothing may be painted over the eyes** — except the marked arc, which the
overlay handles. The overlay repaints the eye, so any *unmarked* art on top of it
gets erased. The generator counts paths drawn after the eye shapes that overlap
them and warns. If it warns, those shapes must be marked too, or the gaze punches
a hole in the drawing. This is the trap on the badges where Wael wears glasses: a
lens glare drawn over the eye has to be marked, or it disappears.

**3. Only the white may use `#FDFDFD`, and only the arc `#0F090A`, inside the
marked set.** Both misfires are silent:

- A catchlight at `#FDFDFD` is read as white. It stops moving and joins the
  repaint — a dead highlight stuck to the eye while the iris slides under it.
  Keep catchlights off-white (Philosophie's is `#FBEEE6`).
- A **pupil at `#0F090A` is read as the arc.** It stops moving and gets painted
  back on top, so the eye looks permanently front-on while a ring of iris wobbles
  behind it. This is the easy mistake, because pupil and lid shadow are both
  near-black. Give the pupil any other dark ink.

**3b. The arc goes on WHICHEVER SIDE the file drew it.** Most badges draw the lid
shadow under the iris; a few draw it over; `gestion` and `electricite` do one of
each across their two eyes. Painting it always-on-top eats the top of an iris the
artist drew above it. The generator reads it from the document order per eye into
`under` and `over`, and the renderer paints each at its own ink either side of the
moving iris.

**4. The arc is symmetric.** Both eyes get one or neither does. The generator
warns on a one-sided arc, which nearly always means the other eye's arc shipped
at a different ink — and it will therefore MOVE.

**5. `sclera ∪ over ∪ iris` must cover the whole eye.** If part of the white or
the arc is left unmarked, the drawn iris shows through underneath as a seam.

## Verifying the gaze

Never ship this on a static screenshot — a broken clip looks fine at card size.

- Drive a real cursor with Playwright to **left, right, above, below** the card and
  screenshot the eye region at high `deviceScaleFactor` (4–6). Map the eye box to
  screen through the overlay's `getScreenCTM()` to get a tight clip.
- The **whole iris** must swing — pupil, shading and catchlight together — with
  clean white behind. A thin moving sliver means invariant 1; an iris rendered as
  a CRESCENT, with a bite out of it even at rest, means invariant 0.
- **Compare against the delivered art at translate 0,0.** Render the marked shapes
  as drawn beside the renderer's output with no offset: they must be identical.
  That one comparison separates a renderer bug from a tuning problem, and it is
  much faster than reasoning about which shape ate what.
- The **dark arc must not move at all**, and the iris must pass UNDER it. An arc
  that travels with the iris means it was not marked `#0F090A`; an iris that
  rides over the arc means the repaint order in `Eyes.tsx` was disturbed.
- A **small nudge** just outside the card must look identical to the cursor at the
  far edge of the screen. That is the sensitivity working.
- **Hovering the card** must snap the eyes dead front (he looks at you, not the
  pointer). Note the card scales on hover, so a clip computed before hovering will
  no longer line up — recompute it.

## Tuning (all in `Eyes.tsx`)

| Constant | Now | Effect |
|---|---|---|
| `REACH` | `0.2` | Distance for full deflection, in icon widths. **Lower = twitchier.** |
| `OVERSHOOT` | `1.45` | Push past the measured room. Safe — the clip is the guarantee; worst case the iris flattens against the eye's corner, which is the hard-look. |
| `MIN_TRAVEL_Y` | `11` | Vertical floor. This art leaves only ~3 units of real room, so honouring it exactly reads as purely horizontal. |
| transition | `90ms` | Snap. A slow ease blunts it now deflection saturates fast. |

Too jumpy → `REACH` to 0.3–0.4 and `OVERSHOOT` to ~1.2.

## What the generator checks for you

| Warning | Means |
|---|---|
| *N unflagged shapes were RECOVERED as iris* | Part of an eye shipped without the flag and the generator took it as iris anyway. The gaze works; the art still wants re-exporting. |
| *the ‹side› iris fills only N % of its white* | A piece of the iris is missing and recovery did not catch it. Only the pupil would move, sliding out of an iris pinned where it was drawn. |
| *paths paint over the eyes* | Art on top of the eye that the repaint would erase. |
| *N shapes span BOTH eyes in one path* | Handled (see invariant 0b), but the art is cleaner split per eye. |
| *only one eye has an arc* | The other eye's arc shipped at some other ink, so it will MOVE. |
| *no #FDFDFD shape* | The white was guessed. Verify that eye by hand. |

### Recovery, and why it is safe

`physique` and `islamique` both shipped with an eye's green body simply not
flagged — twice each, across re-exports. So an unflagged shape is taken as iris
when it is (a) drawn among that eye's own shapes, (b) wholly inside that eye's
box, and (c) **big**: at least `MIN_ADOPT` (3 %) of the eye. The two populations
are nowhere near each other, which is what makes the floor safe — real unflagged
iris bodies measure 9–51 % of their eye, and every other unflagged shape inside
an eye is a 2×2-unit Figma crumb at 0 %.

Recovery is reported, never silent. It is a safety net, not the contract: the
flag is still what the designer owes.

Two size floors elsewhere, for the same reason — bounding boxes are rectangles
but drawings are not:

- *paints over the eyes* ignores anything under 1 % of the eye box (crumbs) AND
  anything over 3× it — physique's lab coat is a 663×598 shape well below the
  face whose box still reaches up past the eyes.

**A badge that cannot be salvaged can still ship** — leave it out of
`SUBJECT_BY_FILE` and it renders as a plain drawing with its drawn gaze, which is
why the overlay can only ever add. Put it back when the art is re-exported.

## Gotchas that cost time before

- **The attribute is `fill-opacity`, not `opacity`.** `grep 'opacity="0.99"'`
  matches both — as a SUBSTRING of `fill-opacity` — so it will happily convince
  you a file is fine, or broken, either way. `querySelectorAll('[opacity="0.99"]')`
  matches neither. Two separate hours have gone into this one grep.
- **The value is `0.99` as delivered and `.99` after SVGO**, which strips the
  leading zero. Compare it as a NUMBER; a string match silently finds nothing.
- **Never parse `d` for bounding boxes.** Curve control points sit outside the
  drawn shape, so min/max of the numbers is simply wrong — cross-eye boxes, bad
  front offsets. Use a real `getBBox()` in a browser, which is why the generator
  needs Playwright.
- **These SVGs inline safely** (no `<style>`, no classes, no ids — every path
  carries its own fill), unlike the old `illustrations/` portraits which had 364
  class attributes. The badges still render as `<img>` for DOM weight; the overlay
  is only the eyes.
- **Don't apply the old portrait `Eyes` geometry to a badge.** Every badge poses
  the face differently, which is the whole reason the geometry is generated.

## Where things live

| | |
|---|---|
| Delivered art | `svg icons/New Subject svg/` (raw), `svg icons/wael subject new/` (older PNG set) |
| Optimised, in use | `svg icons/subjects/` — named per matière; what the app imports |
| SVGO settings | `svgo.config.mjs` (repo root) |
| Art registry | `src/components/icons/subjects.tsx` — `BADGE_BY_NAME`, `SubjectIcon` |
| Card tints | `src/features/student/subjectTint.ts` — `BADGE_COLOR` |
| Generator | `scripts/extract-eyes.mjs` |
| Generated geometry | `src/components/icons/subjects/eyeGeometry.ts` |
| The overlay | `src/components/icons/subjects/Eyes.tsx` |
