# Wael Academy — Design Tokens

The single source of truth is `assets/tokens.css` (Tailwind v4 `@theme inline`). Drop that file
into the project's global stylesheet and every utility below resolves automatically. This file
documents what each token means and which Tailwind utility consumes it, so you pick the right one.
For the *why* behind these choices — the soft vibe and color roles — read `foundations.md` first.

**Never hardcode hex values in components.** Always reference a token via its Tailwind class
(`bg-brand-500`, `text-ink-muted`, `border-border`, `bg-grad`). That is what keeps light/dark theming
working — the `[data-theme="dark"]` block re-points every variable, so a correctly-tokened component
themes for free.

---

## Fonts

Two faces, strict division of labor:

- **Cause** — display only (`font-display`, and auto-applied to `h1–h6`). Titles, month label,
  week numbers, chip titles, big stat numbers, the CTA label, brand wordmark. **Ships only 400 and
  700** — there is no mid-weight, so display text always runs **700**. It runs wide (Comic Sans
  metrics), so set display sizes ~10% smaller than you would a grotesk, or small titles overflow.
- **Rubik** — everything else (`font-sans`, the `:root` default). Nav, inputs, body, secondary lines,
  times (`09:00 – 10:30`), labels, table cells. Weights: 400 (light body), 500 (default body/nav),
  600 (emphasis), 700 (rare).

Load once at the app root:
```html
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Cause:wght@400;700&display=swap" rel="stylesheet">
```

---

## Color tokens

### Brand (teal) — `brand-50 … brand-900`, `brand-foreground`
The product's spine — the readable mid-teal pulled from the middle of the brand gradient. Solid
buttons, links, active nav/tabs text, focus rings, month label, chip default.
- Solid actions: `bg-brand-500` base, `bg-brand-600` for heavier fills. Hover one step up.
- Tints: `bg-brand-50` / `bg-brand-100` for active-nav backgrounds (when not using the gradient),
  icon containers, hover states, reminder icon chips.
- Text on brand fills: `text-brand-foreground` (white). Brand text on light: `text-brand-600/700`.
- `--ring` = brand-500 → focus ring + `shadow-focus`.

### The gradient (`bg-grad`) — the DNA
`--grad` is `linear-gradient(148deg, #23ac76 → #149a76 → #0e7d7a → #155f74 → #183f6b)` — emerald at
the top, navy at the bottom. This is the brand asset. Use `bg-grad` for the loud surfaces only:
active nav item, the primary CTA, the avatar, the search button, the selected mini-calendar day, the
brand mark, the promo footer. **Never** as a panel wash, and never behind small body text. It holds
its colors in dark theme too (it's an asset, not a neutral).

### Emerald & Navy — supporting brand greens
- `emerald-500/600/700` (top of the gradient) — the "green" session chip, positive success accents.
- `navy-500/600/700` (bottom of the gradient) — deep "corrigé type" chips, informational (`info`)
  accents. Navy is also the heading ink inside the gradient family when you want depth.

### Accent (gold) — `accent2-50/100/500/600/700`, `accent2-foreground`
Kickers, the wax-seal illustration, "meilleur mois" seal ring, favorites/rewards, and the gold
session chip (réunions, exports). `accent2-100` is the **cream**. Sparing use — it signals
kicker/reward/attention, not general info.

### Neutrals (green-tinted warm grey) — `neutral-50 … neutral-900`
Borders, dividers, muted backgrounds, disabled, the muted day numbers. Warm, faintly green — the
quiet scaffolding that carries most of the warmth.

### Surfaces & Ink (use these for layout, not raw neutrals)
- `bg-surface` (#fff) — cards, popovers, inputs, the calendar board.
- `bg-surface-subtle` (#edf2ed, warm sage) — the page background. Prefer the `bg-canvas` utility,
  which adds the cream + green ambient glows. This is `bg-background` too.
- `bg-surface-muted` (#f7faf8) — the right side-panel, table headers, calendar header row, control
  tracks, the sidebar rail wash.
- `bg-surface-raised` — dialogs, dropdown menus, sheets.
- `bg-surface-cream` (#fdf7e9) — the promo card, warm callouts.
- `text-ink` — primary. `text-ink-subtle` — secondary. `text-ink-muted` — tertiary / placeholders /
  labels. `text-ink-inverted` — text on gradient/brand fills.

### Status — each has `-50` (soft bg), `-500` (solid), `-600/700` (text/hover), `-foreground`
- `success` (emerald green) — positive counts, "actif", completed.
- `warning` (gold) — cautions, gold-coded tasks/deadlines you don't want to alarm on.
- `danger` (red `#de0000`) — **"today"**, delete, destructive, the notification badge. Reserved —
  never general emphasis. `bg-destructive` / `text-destructive` are aliases.
- `info` (navy) — informational, distinct from brand teal.

### shadcn semantic aliases (if using shadcn/ui)
`background, foreground, card, card-foreground, popover, primary, secondary, muted, accent,
destructive, border, input, ring` — all mapped to the tokens above. shadcn components work out of the box.

---

## Radii — corners are soft and generous
- `rounded-xs` 6px · `rounded-sm` 10px · `rounded-md` 14px · `rounded-lg` 20px · `rounded-xl` 28px.
- **Defaults in this UI:** chips `rounded-sm`; buttons / inputs / icon-chips / segmented tracks
  `rounded-md`; cards `rounded-lg`; the window shell & hero/promo cards `rounded-xl`; pills / avatars
  / search / nav-active `rounded-full` where round, else `rounded-md`.

## Shadows — soft, GREEN-TINTED, never black
`shadow-xs → shadow-xl`. Cards sit at `shadow-sm`; raised menus/dropdowns at `shadow-md`/`shadow-lg`;
the floating window shell and modals at `shadow-xl`. `shadow-brand` is the teal glow that sits under
gradient fills (CTA, active nav). `shadow-focus` is the soft green focus glow. **Every** shadow token
is tinted `rgb(21 58 45 / …)` (deep forest) — this is what makes the whole UI feel warm. Never swap in
a black/neutral shadow.

---

## The warm canvas (`bg-canvas`)
The page background is not a flat fill. `bg-canvas` = warm sage `surface-subtle` + a large cream glow
top-right + a soft green glow bottom-left + a faint navy glow bottom-right. Put it on the outermost
page wrapper. In dark theme it re-tints to gold/green/navy glows on deep pine automatically.

## Dark theme
Add `data-theme="dark"` to `<html>` (or any ancestor). `tokens.css` re-points every variable to a
deep-pine palette (page `#0d1613`, cards `#14201c`, brighter teal so `text-brand-*` stays readable).
Because components reference tokens, **nothing in component code changes** — that's the entire point.
The gradient (`bg-grad`) is preserved as-is; it's a brand asset. Shadows deepen to black-based in dark
(green-tint only reads on light grounds).

## Spacing & layout rhythm
- Page container: `.container` (max 1220px — the window width). The window itself is the frame.
- Card padding: `p-4` to `p-[18px]`. Section gaps inside the rails: `gap-4`.
- The shell is a 3-column grid: `236px · 1fr · 306px` (rail · board · side), collapsing to 1 column
  under ~1120px, then to a horizontal top-rail under ~880px. See `patterns.md`.
- Calendar board: a 7-day grid with a 64px leading "week number" gutter.
