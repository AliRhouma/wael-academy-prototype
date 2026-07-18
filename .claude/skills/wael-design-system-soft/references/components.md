# Wael Academy — Component Recipes

Copy-adapt these. Every class references a token from `tokens.css`, so they theme automatically.
Snippets are React/JSX + Tailwind v4 with `lucide-react` icons. Keep semantics identical when porting
to plain HTML. Display text uses `font-display` (Comic Relief 700); everything else is Rubik (default).
Recipes 1–6 and 10–14 are general — they dress any Wael surface. Recipes 7–9 (calendar board,
mini-calendar, reminders) are the planning-specific family, kept here as a worked set; build other
product areas from the general recipes plus the patterns in `patterns.md`.

## Table of contents
1. Buttons
2. Chips (session/task) & status badges
3. Cards (content, stat, promo)
4. The primary CTA ("Ajouter une séance")
5. Inputs, search, selects, toggles
6. Sidebar nav & top bar
7. The calendar board (month grid)
8. Mini-calendar
9. Reminders list
10. Avatars & icon chips
11. Modal / dialog
12. Dropdown menu
13. Empty states
14. Segmented control

---

## 1. Buttons
Shape `rounded-md`, `font-medium`, `px-4 h-10`, focus → `focus-visible:ring-2 ring-ring ring-offset-2`.

```jsx
// Primary — solid gradient (rare; the main one is the CTA, §4)
<button className="inline-flex items-center gap-2 rounded-md bg-grad px-4 h-10 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  <Plus className="size-4" /> Ajouter
</button>

// Secondary / outline
<button className="inline-flex items-center gap-2 rounded-md border border-border-strong bg-surface px-4 h-10 font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600">
  Modifier
</button>

// Nudge / stepper (calendar month arrows) — 30px square, active one is gradient
<button className="grid size-[30px] place-items-center rounded-[9px] border border-border bg-surface-muted text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"><ChevronLeft className="size-3.5" /></button>
<button className="grid size-[30px] place-items-center rounded-[9px] bg-grad text-ink-inverted shadow-brand"><ChevronRight className="size-3.5" /></button>

// Icon button (kebab, bell) — ghost
<button className="grid size-9 place-items-center rounded-md text-ink-muted transition hover:bg-surface-muted hover:text-ink"><MoreVertical className="size-4" /></button>

// Danger text (Déconnexion in menus)
<button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-danger-600 transition hover:bg-danger-50"><LogOut className="size-4" /> Déconnexion</button>
```

## 2. Chips (session / task) & status badges
The signature board element: a soft-bg tile with a 4px left border in a status color, `rounded-sm`,
Comic Relief title, Rubik time line, and a gentle hover-lift. Drive the color with CSS vars so one
component serves every status.

```jsx
// Session chip. variant ∈ {teal(default), green, gold, red, navy}
const CHIP = {
  teal:  "border-l-brand-500  bg-brand-50   [--ct:var(--brand-700)]",
  green: "border-l-emerald-500 bg-emerald-50 [--ct:var(--emerald-700)]",
  gold:  "border-l-accent2-500 bg-accent2-50 [--ct:var(--accent2-700)]",
  red:   "border-l-danger-500  bg-danger-50  [--ct:var(--danger-700)]",
  navy:  "border-l-navy-500    bg-navy-50    [--ct:var(--navy-700)]",
};
<button className={`group block w-full text-left mt-[7px] rounded-sm border-l-4 ${CHIP[variant]} p-[9px_10px_8px] shadow-sm transition-transform duration-200 hover:-translate-y-[3px] hover:shadow-md`}>
  <span className="font-display text-[10.5px] font-bold leading-[1.45] text-[color:var(--ct)]">Anatomie — Système cardiovasculaire</span>
  <span className="mt-1.5 flex items-center gap-1.5 text-[9.5px] text-ink-muted">
    <Clock className="size-2.5 opacity-75" /> 09:00 – 10:30
  </span>
</button>
```
A chip that spans into the next day uses `w-[154%]` (`chip-wide`) so a long title isn't cramped.

**Status badge** (compact pill): `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium`, soft bg + matching text.
```jsx
<span className="... bg-success-50 text-success-700">Actif</span>
<span className="... bg-neutral-100 text-neutral-600">Terminé</span>
<span className="... bg-accent2-50 text-accent2-700">À rendre</span>
<span className="... bg-danger-50 text-danger-700">Aujourd’hui</span>
```

## 3. Cards
Base card: `rounded-lg border border-border bg-surface p-[18px] shadow-md`. The window shell and promo use `rounded-xl`.

```jsx
// Content card (mini-calendar, reminders live in these)
<div className="rounded-lg border border-border bg-surface p-[18px] shadow-md">…</div>

// Stat card — label above, Comic Relief value, muted sub. The "active" one is gradient.
<div>
  <p className="mb-[7px] text-[11px] text-ink-muted">Meilleur mois</p>
  <div className="relative overflow-hidden rounded-md bg-surface p-[14px_12px] shadow-md">
    <span className="pointer-events-none absolute -right-3.5 -bottom-3.5 size-[52px] rounded-full border-[5px] border-accent2-50" /> {/* seal */}
    <b className="block font-display text-[14.5px] font-bold text-ink">Juin</b>
    <span className="text-[11px] text-ink-muted">96 h de cours</span>
  </div>
</div>
// Active variant: swap the inner card for `bg-grad text-ink-inverted shadow-brand`, sub → text-white/80.
```

## 4. The primary CTA ("Ajouter une séance")
The one hero action — full gradient, icon chip, two lines, a faint dotted texture, lifts on hover.
```jsx
<button className="group relative flex w-full items-center gap-3 overflow-hidden rounded-lg bg-grad p-4 text-left text-ink-inverted shadow-brand transition-transform duration-200 hover:-translate-y-0.5">
  <span className="pointer-events-none absolute inset-y-[-6px] right-[-6px] w-[78px] opacity-50 [background:radial-gradient(rgba(255,255,255,.85)_1.1px,transparent_1.1px)] [background-size:9px_9px] [mask-image:linear-gradient(90deg,transparent,#000_75%)]" />
  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-white/20"><Plus className="size-[18px]" /></span>
  <span>
    <b className="block font-display text-[14px] font-bold">Ajouter une séance</b>
    <span className="text-[11px] text-white/80">Cours, correction ou export</span>
  </span>
</button>
```

## 5. Inputs, search, selects, toggles
```jsx
// Search (top bar) — muted fill, gradient go-button
<div className="flex items-center gap-2 rounded-xl border border-border bg-surface-muted p-[5px_5px_5px_14px] shadow-[inset_0_1px_2px_rgb(21_58_45/.03)] transition focus-within:border-brand-200 focus-within:ring-4 focus-within:ring-brand-500/10">
  <input placeholder="Rechercher une séance, un étudiant…" className="min-w-0 flex-1 bg-transparent text-[13px] font-normal text-ink placeholder:text-ink-muted focus:outline-none" />
  <button className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-grad text-ink-inverted"><Search className="size-[15px]" /></button>
</div>

// Labeled input
<label className="block">
  <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Titre de la séance</span>
  <input className="h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20" />
</label>

// Select (Mois ▾)
<button className="flex items-center gap-5 rounded-md border border-border-strong bg-surface px-3 py-2 text-[12.5px] font-medium text-ink-subtle">Mois <ChevronDown className="size-3" /></button>

// Toggle (teal when on)
<button role="switch" aria-checked={on} className={`relative h-6 w-11 rounded-full transition ${on ? "bg-brand-500" : "bg-neutral-300"}`}>
  <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition ${on ? "left-[22px]" : "left-0.5"}`} />
</button>
```

## 6. Sidebar nav & top bar
**Sidebar nav item** — `rounded-md`; active = full gradient with white text + white icon; idle icon is muted, hover tints teal:
```jsx
<a aria-current={active ? "page" : undefined}
   className={`group flex items-center gap-3 rounded-md px-3.5 py-3 text-[14px] font-medium transition
     ${active ? "bg-grad text-ink-inverted shadow-brand"
              : "text-ink-subtle hover:-translate-x-0 hover:bg-brand-50 hover:text-brand-600"}`}>
  <Calendar className={`size-[21px] ${active ? "text-white" : "text-ink-muted group-hover:text-brand-600"}`} /> Planning
</a>
```
**Top bar** — page title (`font-display`) + a thin `border-border` rule + a muted running count, centered search, then bell (with red badge) · avatar · kebab. See `patterns.md` for the row.
```jsx
// notification bell with red count
<button className="relative grid size-[38px] place-items-center rounded-md text-ink-subtle transition hover:bg-surface-muted">
  <Bell className="size-[21px]" />
  <b className="absolute right-px top-px grid h-[17px] min-w-[17px] place-items-center rounded-full border-2 border-surface bg-danger-500 px-1 text-[10px] font-medium text-white">4</b>
</button>
```

## 7. The calendar board (month grid)
A white `surface` card, `rounded-lg`, with a muted header row and week rows. Grid is
`grid-template-columns: 64px repeat(7, minmax(0,1fr))` — a 64px week-number gutter + 7 days.
```jsx
<div className="min-w-[760px] overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
  {/* header row */}
  <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b border-border bg-surface-muted">
    <div className="py-[15px] pl-[18px] text-left font-sans text-[10px] font-medium uppercase tracking-[.14em] text-ink-muted">Semaine</div>
    {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(d=>(
      <div key={d} className="py-[15px] text-center font-display text-[11px] font-bold text-ink-subtle">{d}</div>
    ))}
  </div>
  {/* one week row */}
  <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b border-border last:border-b-0">
    <div className="flex flex-col justify-center gap-0.5 border-r border-border pl-[18px] [background:linear-gradient(90deg,#fbfdfb,#fff)]">
      <span className="text-[9px] font-medium uppercase tracking-[.1em] text-ink-muted">Sem.</span>
      <b className="font-display text-[14px] font-bold text-navy-500">27</b>
    </div>
    {/* a day cell */}
    <div className="relative min-h-[108px] border-r border-border p-[9px_8px] last:border-r-0">
      <span className="dn inline-flex h-5 min-w-[21px] items-center justify-center rounded-[7px] text-[11.5px] font-medium text-ink-muted">1</span>
      {/* chips go here — §2 */}
    </div>
  </div>
</div>
```
**Today's cell** gets a cream wash + a red date pill:
```jsx
<div className="relative min-h-[108px] border-r border-border p-[9px_8px] [background:linear-gradient(180deg,rgb(251_238_203/.42),transparent_78%)]">
  <span className="inline-flex h-5 min-w-[21px] items-center justify-center rounded-[7px] bg-danger-500 text-[11.5px] font-bold text-white shadow-[0_5px_12px_-4px_rgb(222_0_0/.7)]">17</span>
</div>
```
Muted (adjacent-month) days: date text → `text-neutral-300`.

## 8. Mini-calendar
Inside a content card. 7-col grid; weekday initials in Comic Relief (weekend in gold); day buttons
with an optional status dot; the selected day is a gradient pill.
```jsx
<div className="grid grid-cols-7 gap-y-0.5 text-center">
  {["L","M","M","J","V","S","D"].map((d,i)=>(
    <div key={i} className={`pb-2 font-display text-[10.5px] font-bold ${i>4?"text-accent2-500":"text-brand-500"}`}>{d}</div>
  ))}
  {/* idle day with a teal event dot */}
  <button className="relative h-[29px] rounded-[9px] text-[11.5px] font-medium text-ink-subtle transition hover:bg-brand-50 hover:text-brand-600">
    9<i className="absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-brand-500" />
  </button>
  {/* selected day */}
  <button className="relative h-[29px] rounded-[9px] bg-grad text-[11.5px] font-bold text-ink-inverted shadow-brand">17</button>
  {/* off-month */}
  <button className="h-[29px] rounded-[9px] text-[11.5px] font-medium text-neutral-300">1</button>
</div>
```
Dot colors: `bg-brand-500` (session), `bg-accent2-500` (gold task), `bg-danger-500` (deadline), `bg-navy-500` (corrigé).

## 9. Reminders list
Card with a bell icon-chip header, then rows: colored icon chip · text + action link · time.
```jsx
<div className="flex items-center gap-3 border-t border-border py-2.5 first:border-t-0">
  <span className="grid size-[30px] shrink-0 place-items-center rounded-[9px] bg-accent2-50 text-accent2-500"><Pencil className="size-[15px]" /></span>
  <span className="min-w-0 flex-1">
    <p className="text-[11.5px] font-medium leading-[1.35] text-ink">3 corrigés attendent ta relecture</p>
    <a href="#" className="text-[10.5px] font-bold text-brand-600 hover:underline">Ouvrir</a>
  </span>
  <span className="shrink-0 pt-0.5 text-[10px] text-ink-muted">18:30</span>
</div>
```
Icon-chip tints cycle: `bg-accent2-50 text-accent2-500` · `bg-brand-50 text-emerald-500` · `bg-navy-50 text-navy-500`.

## 10. Avatars & icon chips
```jsx
// Avatar — gradient fill, white initial, cream ring
<div className="grid size-[38px] place-items-center rounded-full bg-grad font-display text-[15px] font-bold text-ink-inverted shadow-[0_0_0_2.5px_var(--surface),0_0_0_4px_var(--brand-100)]">W</div>

// Icon chip — the signature titled-section marker (bell, calendar, etc.)
<span className="grid size-7 place-items-center rounded-[9px] bg-brand-50 text-brand-600"><Bell className="size-3.5" /></span>
```
The brand mark (logo badge): `size-9 rounded-[11px] bg-grad grid place-items-center shadow-brand` with a white icon inside.

## 11. Modal / dialog
Dim blurred backdrop, centered `rounded-xl` card, icon-in-circle header, optional cream note, gradient primary, close X.
```jsx
<div className="fixed inset-0 z-50 grid place-items-center bg-neutral-900/40 p-4 backdrop-blur-sm">
  <div className="relative w-full max-w-md rounded-xl bg-surface p-7 text-center shadow-xl">
    <button className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-ink-muted hover:bg-surface-muted"><X className="size-4" /></button>
    <span className="mx-auto grid size-14 place-items-center rounded-full bg-accent2-100 text-accent2-600"><CalendarPlus className="size-6" /></span>
    <h2 className="mt-4 font-display text-xl font-bold text-ink">Nouvelle séance</h2>
    <p className="mt-2 text-sm text-ink-muted">Ajoutez un cours, une correction ou un export…</p>
    <div className="mt-5 flex items-center gap-2 rounded-md bg-surface-cream px-4 py-3 text-left text-sm text-accent2-700"><Info className="size-4 shrink-0" /> Les exports illimités nécessitent le plan Pro.</div>
    <button className="mt-5 h-11 w-full rounded-md bg-grad font-medium text-ink-inverted shadow-brand hover:brightness-105">Créer</button>
  </div>
</div>
```

## 12. Dropdown menu
Raised white card, `rounded-lg`, `shadow-lg`, icon rows; danger items use danger text.
```jsx
<div className="w-64 rounded-lg border border-border bg-surface-raised p-1.5 shadow-lg">
  <button className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink hover:bg-surface-muted"><Settings className="size-4 text-ink-muted" /> Paramètres</button>
  <div className="my-1 h-px bg-border" />
  <button className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-danger-600 hover:bg-danger-50"><LogOut className="size-4" /> Déconnexion</button>
</div>
```

## 13. Empty states
Centered, neutral icon chip, muted copy.
```jsx
<div className="flex flex-col items-center justify-center py-14 text-center">
  <span className="grid size-12 place-items-center rounded-full bg-neutral-100 text-ink-muted"><CalendarX className="size-5" /></span>
  <p className="mt-3 text-sm text-ink-muted">Aucune séance ce mois-ci</p>
</div>
```

## 14. Segmented control (grille / colonnes view switch)
Track `bg-surface-muted rounded-[11px] p-1`; active segment `bg-surface rounded-[7px] shadow-sm`.
```jsx
<div className="inline-flex gap-1 rounded-[11px] border border-border bg-surface-muted p-1">
  {opts.map(o=>(
    <button key={o.id} aria-pressed={active===o.id}
      className={`grid h-[26px] w-8 place-items-center rounded-[7px] transition ${active===o.id?"bg-surface text-brand-600 shadow-sm":"text-ink-muted"}`}>
      <o.icon className="size-[15px]" />
    </button>
  ))}
</div>
```
