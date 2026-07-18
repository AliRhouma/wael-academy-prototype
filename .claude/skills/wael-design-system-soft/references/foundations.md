# Wael Academy — Foundations

The layer beneath tokens and components: *why* the system feels the way it feels, and the rules that
keep it that way. Read this first. Everything in `tokens.md`, `components.md`, and `patterns.md` is an
application of what's here.

---

## 1. The vibe, in one word: soft

Every choice serves one feeling — **warm, soft, unhurried, trustworthy.** It is an education product
for students and parents, so it must read approachable and human, never cold, corporate, or clinical.
"Soft" here is not vague; it is produced by five concrete, repeatable levers. If a screen feels off,
one of these is usually missing:

1. **Green-tinted shadows, never black.** This is the single biggest lever. Every elevation
   (`shadow-xs → xl`) is tinted deep forest `rgb(21 58 45 / …)`. A black shadow on this palette
   instantly reads cold and generic. Warm shadow = soft product.
2. **A warm ground, never flat white or grey.** The page is `bg-canvas`: a warm sage with a cream glow
   and a soft green glow. Content floats on it. Flat `#fff` or `#f5f5f5` backgrounds kill the warmth.
3. **Ink is near-black-green, never `#000`.** Pure black is harsh. `--ink` (#101012) and its green-lean
   secondaries keep even dense text feeling gentle.
4. **Generous rounding + roomy padding.** Big soft corners and air around content read calm; tight
   corners and cramped padding read utilitarian.
5. **A friendly display face.** Cause's rounded, hand-drawn letters carry warmth in the type
   itself. It is the voice of the brand; Rubik is the quiet, legible body around it.

Warmth is carried by the **neutrals, the cream, and the shadows** — the quiet layer. The accents stay
disciplined. A screen gets its softness from the ground up, not from loud color.

---

## 2. Color — roles, not decoration

The palette is a small set of roles. Each color earns its place by meaning something; nothing is
sprinkled for variety.

### The brand DNA — the green → teal → navy gradient
`--grad` (`bg-grad`): `linear-gradient(148deg, #23ac76 → #149a76 → #0e7d7a → #155f74 → #183f6b)` —
emerald at the top, teal through the middle, navy at the bottom. **This is the brand.** It is the one
loud, saturated thing in the system, so it is spent sparingly: the primary action, the active nav
item, the avatar, one or two key controls per view. Never a panel wash; never behind small text. In a
mostly-white/sage layout, a single gradient CTA reads as *the* thing to do.

### The brand mid — teal (`brand`)
The readable teal pulled from the gradient's middle (`#0f8079`). This is the workhorse: solid buttons
when you don't want the full gradient, links, active-state text, the month label, the default chip.
Tints (`brand-50/100`) do hover states, icon-chip backgrounds, and quiet selected states.

### The two supporting greens — emerald & navy
- **Emerald** (`#1a9e6e`, the gradient's top) — "positive": success, completed, healthy counts, a
  second session color. Also the system's `success`.
- **Navy** (`#173f6d`, the gradient's bottom) — "depth / information": informational accents (`info`),
  deep chips, and heading ink when you want gravity. Navy is the calm, serious green-family note.

### The warm accents — gold & cream
- **Gold** (`accent2`, `#c98a00`) — the **kicker / seal / reward** color. Section kickers, the wax-seal
  motif, favorites, "best month" markers, a warm task chip. It signals attention/reward, not general
  info. Sparing use — gold is a spice.
- **Cream** (`accent2-100`, `#fbeecb`) & **surface-cream** (`#fdf7e9`) — the warm fill. Promo cards,
  "today" washes, soft callouts. Cream is where a lot of the warmth quietly lives.

### The one alarm — red (`danger`)
Red (`#de0000`) is **reserved**: alerts, the notification badge, "today", and destructive actions.
Never general emphasis, never decoration. Its rarity is what makes it read as urgent when it appears.

### Neutrals — warm, faintly green
Borders, dividers, muted text, disabled states, scaffolding. The ramp is warm and leans slightly
green so it agrees with the brand rather than fighting it with cold blue-grey.

**The discipline:** brand/gradient for the loud brand moment, status colors only for status, gold for
kicker/reward, red only for alert/destructive. A surface that's mostly white/sage with one gradient
action and a couple of soft-tinted elements is on-brand. Five competing accent fills is not.

---

## 3. Type — two faces, strict roles

- **Cause** — the **display** voice (`font-display`, and auto-applied to `h1–h6`). Page titles,
  section/card titles, big numbers (stats, week numbers), kickers, the brand wordmark, key button
  labels. It is the warmth in the typography.
  - **Ships only 400 and 700.** There is no mid-weight, so display text **always runs 700.** Never set
    it to 400/500/600 — it looks broken.
  - **It runs wide** (big x-height). Set display sizes **~10% smaller** than you'd
    set a grotesk at the same role, or small titles overflow their containers.
- **Rubik** — **everything else** (`font-sans`, the `:root` default). Nav, body, inputs, secondary
  lines, times, table cells, labels. Soft-cornered, highly legible, calm. Weights: 400 (light body),
  500 (default), 600 (emphasis), 700 (rare).

Hierarchy is set by size + color, not by many weights: `text-ink` (primary) → `text-ink-subtle`
(secondary) → `text-ink-muted` (tertiary / labels / placeholders). Keep letter-spacing near-neutral on
Cause (`-0.004em`); don't tighten it hard.

> **Swap note.** Cause is the confirmed brand face. If a context needs more gravity (a formal
> report, a parent-facing legal page), Baloo 2 is the sanctioned alternate — same rounded warmth, full
> weight range. It's a two-line change: the `font-display` token in
> `tokens.css` and the `<link>`. Don't reach for it casually; it's the escape hatch, not the default.

---

## 4. The background — a warm canvas, not a fill

The page background is a system element, not an afterthought. Use `bg-canvas` on the outermost page
wrapper. It layers, over a warm-sage base (`surface-subtle` #edf2ed):

- a large **cream glow** top-right (the primary warmth),
- a soft **green glow** bottom-left (ties to the brand),
- a faint **navy glow** bottom-right (depth).

Content then floats above it on white cards. This "float on a warm, softly-lit ground" is the
system's signature staging — it's what the original reference got from its pink/lavender wash, done in
the Wael family instead. Never replace it with flat white or flat grey; that removes the warmth in one
move. In dark theme `bg-canvas` re-tints automatically to gold/green/navy glows on deep pine.

---

## 5. Surfaces & elevation — soft float

Three surface levels, all rounded, all lifted by **green-tinted** shadow:

- `surface` (#fff) — cards, inputs, popovers, primary content. Sits at `shadow-sm`/`shadow-md`.
- `surface-muted` (#f7faf8) — secondary panels, table headers, sidebars, control tracks. Quietly
  recessed, usually no shadow.
- `surface-raised` — menus, dropdowns, dialogs. Higher lift (`shadow-lg`); the floating app window and
  modals sit at `shadow-xl`.
- `surface-cream` (#fdf7e9) — warm callouts / promo.

Elevation ladder (all `rgb(21 58 45 / …)`): `shadow-xs` hairline → `shadow-sm` resting cards →
`shadow-md` hover / stat cards → `shadow-lg` menus → `shadow-xl` the floating window & modals.
`shadow-brand` is the teal glow that sits *under* gradient fills (CTA, active nav) — it makes the brand
moment feel like it's lifting off the page. **No shadow in this system is ever black or cool-grey.**

---

## 6. Shape & space — rounded and roomy

Rounding scale (soft, generous): `rounded-xs` 6 · `rounded-sm` 10 (chips) · `rounded-md` 14 (buttons,
inputs, icon-chips) · `rounded-lg` 20 (cards) · `rounded-xl` 28 (the app window, hero/promo cards).
Pills, avatars, and search are `rounded-full` where round.

Space is calm: card padding `p-4`–`p-[18px]`, section gaps `gap-4`–`gap-6`, real breathing room around
content. Tight, dense layouts read utilitarian and break the vibe — when unsure, add air.

---

## 7. Motion — a gentle rise

The whole system uses one motion idea: things **arrive softly and lift on touch.**

- **On load:** surfaces (cards, chips, CTA, promo) fade up ~10px with a small stagger
  (`@keyframes rise{from{opacity:0;transform:translateY(10px)}}`, delays ~.05s → .24s).
- **On hover:** interactive tiles lift a few px (`-translate-y-[3px]` for chips, `-translate-y-0.5` for
  the CTA) and deepen one shadow step; nav items nudge sideways `translate-x-0.5`.
- Transitions are short (`.18s–.2s`) and eased (`cubic-bezier(.2,.8,.3,1)`), never bouncy or fast.
- **Everything** is disabled under `@media (prefers-reduced-motion: reduce)`.

Motion should feel like paper settling, not UI snapping.

---

## 8. Iconography & illustration

- **Icons:** line icons, ~1.8 stroke, round caps/joins (lucide-react is the default set; matches the
  hand-drawn feel). Muted by default (`text-ink-muted`), brand/white when active. Small "accent dot"
  details are on-brand. Size ~`size-4`–`size-5` in UI, `size-[21px]` in nav.
- **Icon chip:** the signature titled-section marker — a small rounded square in a soft brand tint
  (`size-7 rounded-[9px] bg-brand-50 text-brand-600`), swapped to `bg-accent2-50 text-accent2-500` for
  reward/seal contexts. Reuse it to head any titled section.
- **Illustration:** soft, flat, brand-family SVG — sheets, a **gold wax seal**, a pen, small sparkles.
  Warm and hand-made, never photographic or corporate-3D. The promo art is the canonical example.

---

## 9. Voice & language

French is the primary UI language (a Tunisian academy): Planning, Séances, Ajouter, Rappels, Étudiants,
Paramètres, Déconnexion. Tone is warm and encouraging, not corporate. Numbers and dates follow French
formatting. Arabic/RTL is supported (see `patterns.md`); keep the same warmth and softness in RTL.

---

## 10. Quick self-check

A surface is on-brand when: the ground is the warm canvas (not flat white/grey) · shadows are
green-tinted (not black) · the gradient appears on at most a couple of surfaces (not as a wash) · gold
and red each mean their one thing · display text is Cause 700 and body is Rubik · corners are
soft and there's air around content · it lifts gently on hover. If all ten read true, it feels like
Wael. If it feels cold, start with the shadows and the ground.
