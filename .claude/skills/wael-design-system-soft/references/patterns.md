# Wael Academy — Layout & Page Patterns

How the system assembles into real screens. The frame and shells here dress the whole product, not
one screen. The planning dashboard is the worked example that shows every piece together; the other
compositions (dashboard, list/table, settings, marketing, auth) reuse the same frame, surfaces, and
type.

## The page frame — a warm canvas
Every full page starts the same way: the warm canvas wrapper, content centered inside. Whether the
content is an app shell, a marketing hero, or a login card, it floats on `bg-canvas`.

```jsx
<div className="min-h-screen bg-canvas">
  <div className="mx-auto w-full max-w-[1220px] px-4 py-10 sm:px-6">
    {/* app shell, or centered content, or marketing sections */}
  </div>
</div>
```

## Shell A — floating window (rail · content · optional side)
The signature app shell: one big `rounded-xl` `shadow-xl` window on the canvas, with a left rail, main
content, and (optionally) a right side-panel. Used by the planning dashboard and any app-level screen.

```jsx
<div className="flex min-h-screen justify-center bg-canvas p-[44px_30px_96px]">
  <div className="relative w-full max-w-[1220px]">
    <div className="grid grid-cols-[236px_1fr] overflow-hidden rounded-xl bg-surface shadow-xl isolate">

      {/* LEFT RAIL */}
      <aside className="flex flex-col gap-8 border-r border-border bg-surface-muted p-[30px_18px_150px]">
        <div className="flex items-center gap-3">{/* brand mark (bg-grad) + wordmark (font-display) + gold "Académie" kicker */}</div>
        <nav className="flex flex-col gap-1">{/* nav items — components.md §6; active one is bg-grad */}</nav>
      </aside>

      {/* STAGE */}
      <div className="flex min-w-0 flex-col">
        <header className="flex items-center gap-6 border-b border-border p-[26px_30px]">
          <h1 className="font-display text-[26px] font-bold text-ink">{/* page title */}</h1>
          <div className="mx-auto max-w-[330px] flex-1">{/* search — components.md §5 */}</div>
          <div className="ml-auto flex flex-none items-center gap-[18px]">{/* bell · avatar · kebab */}</div>
        </header>
        <main className="min-w-0 flex-1 p-[26px_30px]">{/* page content, or a two-column content+side grid */}</main>
      </div>
    </div>
  </div>
</div>
```

## Shell B — sidebar + top bar (flat, full-bleed)
When the floating window is too much (data-heavy back-office, long scrolling lists), use a flat shell:
fixed rail, top bar, scrolling content — still on `bg-canvas`, still green-tinted shadows.

```jsx
<div className="flex min-h-screen bg-canvas">
  <aside className="hidden w-[236px] shrink-0 border-r border-border bg-surface-muted lg:flex lg:flex-col">
    <div className="flex h-16 items-center gap-3 px-5">{/* brand */}</div>
    <nav className="flex flex-col gap-1 px-3 py-2">{/* nav — components.md §6 */}</nav>
  </aside>
  <div className="flex min-w-0 flex-1 flex-col">
    <header className="flex h-16 items-center gap-4 border-b border-border bg-surface px-6">
      <div className="max-w-md flex-1">{/* search */}</div>
      <div className="ml-auto flex items-center gap-3">{/* bell · avatar */}</div>
    </header>
    <main className="flex-1 overflow-y-auto p-6">{/* page content */}</main>
  </div>
</div>
```

## Page header convention
Every page opens with a `font-display text-[26px] font-bold text-ink` title, an optional
`text-sm text-ink-muted` subtitle (or a thin rule + a running count), and the primary action pinned
right on the same row (`flex items-center justify-between`).

---

## Page compositions

### Planning (the worked example)
Shell A. Header = title + rule + running count + centered search + bell/avatar. Content is a two-column
grid `grid-cols-[1fr_306px]`:
- **Board:** a board-head row (`"Séances du mois"` · rule · month in teal `font-display` · prev/next
  nudge arrows, next = gradient · `Mois ▾` select · grille/colonnes segments) then the **calendar
  board** (`components.md` §7) filled with **session chips** (§2).
- **Side rail** (`bg-surface-muted`, `gap-4`): **mini-calendar** card (§8) → **"Ajouter une séance"**
  CTA (§4) → **stat cards** pair (`grid-cols-2`, one gradient-active) → **Rappels** card (§9).
- **Promo** breaks out of the bottom-left corner (`absolute -bottom-[54px] -left-4`), cream card with
  a gold-wax-seal SVG and a gradient footer.

### Dashboard / KPIs (any product area)
Shell A or B. Page-head → a KPI row of **stat cards** (`components.md` §3) in
`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` → **content cards** (`lg:grid-cols-2`) for charts, lists,
or activity. Each titled section leads with the brand **icon chip**
(`size-7 rounded-[9px] bg-brand-50 text-brand-600`). One gradient CTA per view, no more.

### List / table (Étudiants, Cours, …)
Page-head (title + subtitle left, primary action right) → a thin summary strip (totals + a success
dot) → a **data table** in a `rounded-lg` white card:
```jsx
<div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
  <table className="w-full text-sm">
    <thead className="bg-surface-muted">
      <tr className="text-left text-xs font-medium uppercase tracking-wide text-ink-muted">
        <th className="px-4 py-3">Étudiant</th><th className="px-4 py-3">Groupe</th><th className="px-4 py-3">Statut</th><th className="px-4 py-3 text-right">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-border">
      <tr className="transition hover:bg-neutral-50">
        <td className="px-4 py-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-brand-100 font-display text-xs font-bold text-brand-700">MB</span><span className="font-medium text-ink">Mohamed B.</span></div></td>
        <td className="px-4 py-4 text-ink-subtle">Bac Sciences</td>
        <td className="px-4 py-4"><span className="inline-flex items-center rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-medium text-success-700">Actif</span></td>
        <td className="px-4 py-4 text-right">{/* icon buttons — components.md §1 */}</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Settings (Paramètres)
Page-head → stacked **section cards**, each with its own `font-display` title + muted subtitle and a
`md:grid-cols-2` form grid (inputs — `components.md` §5) → **toggle rows** for optional features
(label + description left, toggle right, divided by `border-border`).

### Marketing / landing section
The system dresses marketing too. A hero on `bg-canvas`: a gold **kicker** (`font-display` uppercase,
`text-accent2-600`, tiny + tracked), a large `font-display` headline, a Rubik sub, and a **gradient
CTA** (`components.md` §4 without the icon-chip, or a plain `bg-grad` button). Feature blocks are white
`surface` cards with an icon chip, a `font-display` title, and muted copy — same cards as the app,
lower density. Keep the one-gradient-moment rule: one hero CTA, everything else quiet.

### Auth (login / signup)
The page frame, content centered, a single `rounded-xl` white card `shadow-xl` (max-w-md): brand mark
+ wordmark at top, `font-display` title, labeled inputs (§5), a full-width `bg-grad` submit, a muted
secondary link. The card floats on the warm canvas — no flat background.

---

## Responsive collapse (Shell A)
- `≤1120px`: a content+side `grid-cols-[1fr_306px]` collapses to one column; the side rail drops below
  the content (`border-l`→`border-t`); wide chips go full width.
- `≤880px`: the window goes single-column; the left rail becomes a **horizontal** top-rail (`flex-row`,
  nav labels hidden, icons only, `overflow-x-auto`); search drops full-width; a breakout promo tucks
  inline (`left/right-2`).

## Motion
Cards, chips, CTAs, and hero elements fade-up ~10px on load with a small stagger
(`@keyframes rise{from{opacity:0;transform:translateY(10px)}}`, delays .05s→.24s). Interactive tiles
lift on hover (`-translate-y-[3px]`); nav items nudge `translate-x-0.5`. Everything is disabled under
`@media (prefers-reduced-motion:reduce)`. See `foundations.md` §7.

## RTL / Arabic
For `lang="ar"` set `dir="rtl"` on the shell/frame; flip `border-r`→`border-l`, mirror any leading
gutter, swap `left`/`right` on breakout elements and badges. Prefer logical utilities (`ps-`/`pe-`,
`ms-`/`me-`, `start-`/`end-`). Keep Comic Relief for Latin display; for Arabic display, Rubik's Arabic
covers both so a single `font-sans` heading is acceptable in RTL. Keep the same warmth and softness.

## Density & restraint
Warm, soft, unhurried — lots of `bg-canvas` and `surface-muted` breathing room, quiet `border-border`,
green-tinted `shadow-sm`. Color is earned: the gradient for a handful of loud surfaces, status colors
only for status, gold for kicker/seal/reward, red only for alert / today / destructive. A screen that's
mostly white/sage with one gradient action and a few soft elements is on-brand; five competing accent
fills is not. See `foundations.md` §10 for the self-check.
