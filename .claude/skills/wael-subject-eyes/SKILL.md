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

| What | Value |
|---|---|
| Eye shapes flagged with | **99 % fill opacity** — exports as `fill-opacity="0.99"` |
| The white of the eye | **usually `#FDFDFD`** (not relied on — see below) |
| Everything else marked | iris, pupil, shading, catchlight — the parts that MOVE |

99 % is visually a no-op but survives every export, so it needs no layer naming.

**The white is DETECTED, not assumed.** Within each eye the generator groups the
marked shapes by fill and takes the group with the largest combined bounding box.
That is always the white, because the white is drawn as a **ring around** the iris
and therefore encloses it. A redelivery only has to keep the structure, not the
exact hex. `EXPECT_WHITE` in the script is a sanity check that warns on a
mismatch; it does not filter.

## Steps

1. **Put the SVG in `svg icons/`.** Ask the designer to name it for the matière —
   `Group 60.svg` is Figma's default and means nothing later.
2. **Register the art** in `src/components/icons/subjects.tsx`: `import` it, then
   add it to `BADGE_BY_NAME` keyed by the matière name **exactly as seeded** in
   `src/data/seed/subjects.json` (Arabic).
3. **Measure a card tint** for `BADGE_COLOR` in
   `src/features/student/subjectTint.ts` — sample the DISC BACKDROP, not the whole
   canvas. It is the same character on every badge, so his skin and jacket would
   flatten every card into one beige; the backdrop is what distinguishes them.
   Feed the RAW measurement — `subjectTint` keeps the hue and pins lightness, so a
   dark backdrop still yields a readable card.
4. **Map the file to the matière** in `SUBJECT_BY_FILE` at the top of
   `scripts/extract-eyes.mjs`.
5. **Generate:** `npm i -D playwright && node scripts/extract-eyes.mjs`, then
   `npm uninstall -D playwright`. It is only needed to RUN the script; nothing
   ships with it. Output is `src/components/icons/subjects/eyeGeometry.ts` —
   generated, never hand-edited.
6. **Read the script's output.** It prints shape count and travel per file, and
   warns on the two failure modes below.
7. **Verify visually** (mandatory — see below), then `npx tsc -b && npm run build`.

## The three invariants

Break any of these and it still *renders*; it just looks subtly wrong.

**1. The white is a RING, not a disc.** It is drawn around the iris, so neither
shape is a complete eye alone. Both the repaint and the clip use **`sclera ∪
iris`**. Clipping to the ring alone punches a hole exactly where the iris must
travel, so only the sliver crossing the ring moves — the symptom is "just a thin
stroke moves with the cursor". To check a new file, render only the shapes matched
as white onto a garish background: green through the middle means ring.

**2. Nothing may be painted over the eyes.** The overlay repaints the eye, so any
art on top of it gets erased. The generator counts paths drawn after the eye
shapes that overlap them and warns. If it warns, those shapes must be marked too,
or the gaze punches a hole in the drawing.

**3. `sclera ∪ iris` must cover the whole eye.** If part of the white is left
unmarked, the original iris shows through underneath as a seam.

## Verifying the gaze

Never ship this on a static screenshot — a broken clip looks fine at card size.

- Drive a real cursor with Playwright to **left, right, above, below** the card and
  screenshot the eye region at high `deviceScaleFactor` (4–6). Map the eye box to
  screen through the overlay's `getScreenCTM()` to get a tight clip.
- The **whole iris** must swing — pupil, shading and catchlight together — with
  clean white behind. A thin moving sliver means invariant 1.
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

## Gotchas that cost time before

- **The attribute is `fill-opacity`, not `opacity`.** `grep 'opacity="0.99"'`
  matches both; `querySelectorAll('[opacity="0.99"]')` matches neither.
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
| Delivered art | `svg icons/` (badges), `svg icons/wael subject new/` (PNG set) |
| Art registry | `src/components/icons/subjects.tsx` — `BADGE_BY_NAME`, `SubjectIcon` |
| Card tints | `src/features/student/subjectTint.ts` — `BADGE_COLOR` |
| Generator | `scripts/extract-eyes.mjs` |
| Generated geometry | `src/components/icons/subjects/eyeGeometry.ts` |
| The overlay | `src/components/icons/subjects/Eyes.tsx` |
