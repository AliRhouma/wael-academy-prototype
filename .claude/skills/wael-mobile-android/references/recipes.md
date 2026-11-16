# Wael Academy — Android skin recipes

Copy-adapt these. They are in this codebase's idiom: Tailwind v4 utilities, `cn()` from
`@/lib/utils`, the space's tokens (`text-v2-ink`, `bg-v2-surface`, `bg-v2-cta`,
`text-v2-brand`, `border-v2-ink/15`), the Material roles from `android.css`
(`bg-m3-surface-container[-low|-high|-highest]`, `bg-m3-secondary-container`,
`bg-m3-primary`, `border-m3-outline-variant`), `m3-ripple`, every font size as
`text-[calc(Npx*var(--ts))]` (N = sp ÷ 1.55 — table in `SKILL.md`), logical utilities, and
a `data-uisfx` cue on every clickable element. Imports used below:

```tsx
import { usePlatform } from "@/app/platform"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/lib/hooks"
import { Sheet, SheetContent, SheetGrabber, SheetTitle } from "@/components/ui/sheet"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { btnClass, ctaClass, iconBtnClass, tileClass } from "@/features/student-v2/ui"
import { sfx } from "@/features/student-v2/sound"
```

Radii are not restated per component: `rounded-3xl` becomes 28 px, `rounded-2xl` 16 px and
a bottom sheet's top 28 px through `android.css` once `data-platform="android"` is on
`<html>`. The `ease-m3-*` utilities come from recipe 14 — add them to `android.css` first.

## 1. The flexible navigation bar

**When:** never from scratch — it is `AndroidNavBar` in `src/features/student-v2/V2Shell.tsx`,
picked by `BottomBar` through `usePlatform()`. Extend it there. The lines that carry the spec:

```tsx
// 64 dp + the gesture inset, docked on surface-container; off after 24 px of downward scroll, back on any upward scroll.
<nav aria-label="القائمة" className={cn("fixed inset-x-0 bottom-0 z-30 bg-m3-surface-container pb-[var(--sai-bottom)] transition-transform duration-250 ease-[cubic-bezier(.2,0,0,1)] motion-reduce:transition-none lg:hidden", hidden && "translate-y-full motion-reduce:translate-y-0")}>
  <ul className="grid h-16 grid-cols-5">…
    <NavLink to={path} end={path === BASE} data-uisfx="select"
      className={({ isActive }) => cn("m3-ripple flex h-full flex-col items-center justify-center gap-1 px-0.5 py-1.5 text-[calc(7.5px*var(--ts))] font-medium transition-colors", isActive ? "text-v2-ink" : "text-v2-ink/65")}>
      {/* The 56 × 32 pill carries the selection — the label never goes bold. */}
      <span className={cn("grid h-8 w-14 place-items-center rounded-full transition-colors duration-200", isActive && "bg-m3-secondary-container text-m3-on-secondary-container")}>
        <Icon className="size-6" strokeWidth={isActive ? 2.4 : 2} />
      </span>
      <span className="max-w-full truncate">{label}</span>
    </NavLink>
```

**Rules:** five destinations from `studentV2Tabs`, never six; Material fills the active
glyph — Lucide has none, so the stroke thickens and the pill does the rest; the pill is
`secondary-container`, lime-tinted here, not the research's apricot.

## 2. A headline that collapses into the app bar

**When:** section roots (a matière, a replay list). The dashboard keeps `TopBar`'s greeting,
already headline-medium under Android; a pushed screen uses the bar alone (recipe 13).

```tsx
function Headline({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  useEffect(() => {
    // The 28 sp headline scrolls out over 56 px; the bar's title fades in and the bar takes surface-container.
    const onScroll = () => setCollapsed(window.scrollY > 56)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return (
    <>
      <header className={cn("fixed inset-x-0 top-0 z-20 pt-[var(--sai-top)] transition-colors duration-150 ease-m3-effects", collapsed ? "bg-m3-surface-container" : "bg-transparent")}>
        <div className="flex h-16 items-center gap-1 px-1">
          <h1 aria-hidden={!collapsed} className={cn("min-w-0 flex-1 truncate ps-3 text-[calc(14.2px*var(--ts))] font-semibold text-v2-ink transition-opacity duration-150", collapsed ? "opacity-100" : "opacity-0")}>{title}</h1>
          {action}{/* ≤ 2 icon buttons in text-v2-ink/70 */}
        </div>
      </header>
      <h1 className="px-4 pt-[calc(var(--sai-top)+64px)] text-[calc(18px*var(--ts))] font-bold leading-[1.4] text-v2-ink">{title}</h1>
      {children}
    </>
  )
}
```

**Rules:** headline-medium in flow, title-large start-aligned in the bar; tone says
"content is under me", never a border or a blur — One UI 8.5/9 apps use translucent
floating bars; ours stays tonal and opaque (M3E) — a choice, not a platform rule. In compact
height (landscape) there is no headline: the bar alone, or none in a game.

## 3. Tonal card vs outlined tappable card

**When:** every card. Passive information is tonal; anything that opens is a tile.

```tsx
{/* Passive: Material's filled card — surface-container-highest, 12 dp, no border, no lip, no shadow. */}
<div className="rounded-xl bg-m3-surface-container-highest p-4">…</div>

{/* Tappable: Material's outlined card — surface + outline-variant (android.css thins border-v2-ink/15 to it).
    tileClass hands it to play: 2 px border, 3 px lip, press collapse. 16 dp — a list-sized shape. */}
<Link to={to} data-uisfx="open" className={cn(tileClass, "m3-ripple block rounded-2xl border border-v2-ink/15 bg-v2-surface p-4 transition")}>…</Link>
```

**Rules:** 8 px between cards (`gap-2`); never a border plus a blurred shadow — the lip is
a pressable's edge, so a passive card gets neither; don't hand-set border colours.

## 4. Lists (56 / 72 / 88, grouped)

**When:** chapters, documents, settings — anything that is a list, not hero content.

```tsx
{/* Grouped (M3E): 16 outer radius, 2 px gaps, rows on surface-container-low. */}
<ul className="flex flex-col gap-0.5 overflow-hidden rounded-2xl">
  {rows.map((row) => (
    <li key={row.id}>
      {/* min-h-14 one line · min-h-[72px] two · min-h-[88px] three; 16 px side padding. */}
      <Link to={row.to} data-uisfx="open" className="m3-ripple flex min-h-[72px] items-center gap-4 bg-m3-surface-container-low px-4 py-2 text-v2-ink active:bg-v2-ink/[0.10]">
        <Icon className="size-6 shrink-0 text-v2-ink/70" strokeWidth={2} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[calc(10.3px*var(--ts))]">{row.title}</span>
          <span className="block truncate text-[calc(9px*var(--ts))] text-v2-ink/60">{row.meta}</span>
        </span>
        {/* Points where navigation goes — left, in Arabic. Only on rows that navigate. */}
        <ChevronLeft className="size-6 shrink-0 text-v2-ink/50" strokeWidth={2} />
      </Link>
    </li>
  ))}
</ul>
```

**Rules:** body-large headline, body-medium supporting; selected row
`bg-m3-secondary-container`; `open` for a row that drills down, `select` for an option row
(checkmark, no chevron); no divider lines — the gap is the separator.

## 5. Modal bottom sheet

**When:** a scoped task — documents, filters, the profile. Desktop gets a `Dialog` through
`useIsMobile()`, as `DocsSheet.tsx` does; that is the only branch.

```tsx
function M3Sheet({ open, onOpenChange, title, actions, children }: Props) {
  const change = (o: boolean) => { if (!o) sfx("close"); onOpenChange(o) }
  return (
    <Sheet open={open} onOpenChange={change}>
      {/* 28 dp top, surface-container-low body, the 32 × 4 handle and the 32 % scrim come from android.css.
          data-space="v2": the sheet portals out of the shell, so --ts and the skin must be re-stamped. */}
      <SheetContent side="bottom" showCloseButton={false} data-space="v2"
        className="max-h-[90dvh] gap-3 overflow-y-auto rounded-t-3xl border-0 bg-v2-surface px-4 pb-[max(1.25rem,var(--sai-bottom))] pt-0 text-v2-ink">
        <div className="grid h-12 shrink-0 place-items-center"><SheetGrabber /></div>{/* 48 dp hit area */}
        <SheetTitle className="text-[calc(14.2px*var(--ts))] font-bold text-v2-ink">{title}</SheetTitle>
        {children}
        {/* A button row at the bottom — a Cancel / Done header is iOS. */}
        {actions && <div className="mt-2 flex justify-end gap-2">{actions}</div>}
      </SheetContent>
    </Sheet>
  )
}
```

**Rules:** one sheet at a time; scrim and Esc always close — drag is polish; back should
close the sheet before it navigates (no history entry is pushed yet — verify).

## 6. Buttons on `ctaClass`

**When:** every action. Material fills its button with `primary`; here the one prominent
action is the lime pill and the `play` skin owns its chunk, lip and 800 weight.

```tsx
// The one prominent action — 56 px (Material's M size). One per screen.
<button type="button" data-uisfx="connect" className={cn(ctaClass, "m3-ripple min-h-14 px-6 text-[calc(10.3px*var(--ts))]")}>أدخل للمباشر</button>
// Secondary — Material's tonal secondary-container would be lime-tinted here and fight the CTA; the outlined btnClass (40) stands in.
<button type="button" data-uisfx="forward" className={cn(btnClass, "m3-ripple min-h-10 px-4 text-[calc(9px*var(--ts))]")}>شوف الرزنامة</button>
// Text — tertiary: label-large in the tint, 12 px padding, no fill. Destructive = the same in text-v2-live-strong.
<button type="button" data-uisfx="expand" className="m3-ripple inline-flex min-h-10 items-center justify-center rounded-full px-3 text-[calc(9px*var(--ts))] font-semibold text-v2-brand hover:bg-v2-brand/[0.08] active:bg-v2-brand/[0.10]">شوف الكل</button>
// Icon — 48 px (iconBtnClass is 44), glyph in on-surface-variant, always named.
<button type="button" aria-label="شارك" data-uisfx="open" className={cn(iconBtnClass, "m3-ripple size-12 text-v2-ink/70")}><Share2 className="size-6" strokeWidth={2} /></button>
```

**Rules:** labels start with a verb, one line; disabled is `opacity-[.38]`; a slow action
shows its activity inside the button (recipe 11), never a page spinner; Material's
press-shape morph is skipped on the CTA — the lip collapse is its press.

## 7. Connected button group — the filter control

**When:** the kind filter on a chapitre (cours · exercice · série · résumé · quiz), the
replays' year — views of one dataset. The `Chip` in `matieres/parts.tsx` keeps the `play`
pill look for counts; this is the connected form.

```tsx
<div role="tablist" aria-label="نوع المحتوى" className="flex gap-0.5">{/* 2 px gaps */}
  {KINDS.map(([value, label], i) => {
    const on = kind === value
    return (
      <button key={value} type="button" role="tab" aria-selected={on} data-uisfx="toggle-on" onClick={() => setKind(value)}
        className={cn("v2-chip m3-ripple min-h-10 flex-1 px-3 text-[calc(9px*var(--ts))] font-semibold transition-[border-radius,background-color] duration-250 ease-m3-fast",
          // Outer ends full, inner corners 8 (4 while pressed); the selected member morphs into a pill.
          // Material says secondary-container for it; here it is solid lime — the one selected thing (play's .v2-chip rule).
          on ? "rounded-full bg-v2-cta text-v2-on-cta"
             : cn("rounded-lg bg-m3-surface-container text-v2-ink/80 active:rounded-[4px]", i === 0 && "rounded-s-full", i === KINDS.length - 1 && "rounded-e-full"))}>
        {label}
      </button>
    )
  })}
</div>
```

**Rules:** ≤ 5 members, equal widths, text only; exactly one `aria-selected`; the cue is
`toggle-on`, as the existing filter tabs; for separate sections use the nav bar.

## 8. Switch (52 × 32)

**When:** a binary setting **inside a list row**; anywhere else a toggle button with
`aria-pressed` (`SoundToggle`). If an iOS twin exists, merge them behind `usePlatform()` at
the component boundary — never two files.

```tsx
function M3Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    // On: primary track, 24 px white thumb. Off: surface-container-highest + 2 px outline, 16 px thumb. Pressed: thumb 28.
    <button type="button" role="switch" aria-checked={on} aria-label={label} data-uisfx={on ? "toggle-off" : "toggle-on"} onClick={() => onChange(!on)}
      className={cn("group relative h-8 w-[52px] shrink-0 rounded-full transition-colors duration-150 ease-m3-effects", on ? "bg-m3-primary" : "border-2 border-v2-ink/50 bg-m3-surface-container-highest")}>
      {/* Logical start-* moves the thumb, so RTL mirrors with no rtl: variant. */}
      <span className={cn("absolute top-1/2 -translate-y-1/2 rounded-full transition-all duration-250 ease-m3-fast group-active:size-7", on ? "start-[24px] size-6 bg-white" : "start-[6px] size-4 bg-v2-ink/60")} />
    </button>
  )
}
```

**Rules:** the cue is evaluated at click time; the row's label names the switch and the
row may toggle it too (that is the 48 px hit); Material's optional 16 px check icon in the
on thumb is fine, text never.

## 9. Search bar (56 dp, leading icon)

**When:** in-page filtering on الدروس or تسجيلات. The combobox with results is
`header/SearchBox.tsx` — it already takes this shape under Android.

```tsx
<label className="flex h-14 items-center gap-3 rounded-full bg-m3-surface-container-high pe-1 ps-4">
  {/* Leading magnifier — a physical object, never mirrored. 16 px margins come from the page's px-4. */}
  <Search className="size-6 shrink-0 text-v2-ink/70" strokeWidth={2} />
  <input type="search" inputMode="search" enterKeyHint="search" placeholder="لوّج على درس…" value={q} onChange={(e) => setQ(e.target.value)}
    className="h-full min-w-0 flex-1 bg-transparent text-[max(16px,calc(10.3px*var(--ts)))] text-v2-ink outline-none placeholder:text-v2-ink/50 [&::-webkit-search-cancel-button]:hidden" />
  {q && (
    <button type="button" aria-label="امسح" data-uisfx="delete" onClick={() => setQ("")} className={cn(iconBtnClass, "m3-ripple size-12 text-v2-ink/70")}>
      <X className="size-6" strokeWidth={2} />
    </button>
  )}
</label>
```

**Rules:** body-large text, ≥ 16 px; the clear button trails in a 48 px target; no border;
Material's full-screen search view is not built (verify before promising one).

## 10. Menu (4 dp, 48 dp rows) → confirm dialog

**When:** secondary actions on a card or row. The trigger is a visible "⋮" — long-press may
open the same menu, never alone. A destructive item confirms in a dialog.

```tsx
import { DropdownMenu } from "radix-ui"
const item = "m3-ripple flex min-h-12 cursor-pointer items-center gap-3 px-3 text-[calc(10.3px*var(--ts))] text-v2-ink outline-none data-[highlighted]:bg-v2-ink/[0.08] active:bg-v2-ink/[0.10]"

<DropdownMenu.Root dir="rtl">
  <DropdownMenu.Trigger asChild>
    <button type="button" aria-label="خيارات" data-uisfx="open" className={cn(iconBtnClass, "m3-ripple size-12")}><EllipsisVertical className="size-6" /></button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Portal>
    {/* data-space="v2" so --ts reaches the portal; v2-menu is the hook android.css restyles (below). 112–280 wide, 48 dp from the edge. */}
    <DropdownMenu.Content data-space="v2" align="start" sideOffset={4} collisionPadding={48}
      className="v2-menu z-50 min-w-[112px] max-w-[280px] rounded-3xl bg-v2-surface py-2 text-v2-ink shadow-v2-lift data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
      <DropdownMenu.Item data-uisfx="select" onSelect={share} className={item}><Share2 className="size-6 text-v2-ink/70" strokeWidth={2} />شارك</DropdownMenu.Item>
      <DropdownMenu.Item data-uisfx="open" onSelect={() => setConfirm(true)} className={cn(item, "text-v2-live-strong")}><Trash2 className="size-6" strokeWidth={2} />فسخ</DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>

{/* The dialog: 28 dp, surface-container-high, 24 px padding, text actions at the end, confirming last. */}
<Dialog open={confirm} onOpenChange={setConfirm}>
  <DialogContent showCloseButton={false} data-space="v2" className="w-[calc(100%-2rem)] min-w-[280px] max-w-[560px] rounded-3xl border-0 bg-m3-surface-container-high p-6 text-v2-ink">
    <DialogTitle className="text-[calc(15.5px*var(--ts))] font-semibold">نفسخ التعليق؟</DialogTitle>
    <div className="mt-2 flex justify-end gap-2">
      <DialogClose data-uisfx="cancel" className="m3-ripple min-h-10 rounded-full px-3 text-[calc(9px*var(--ts))] font-semibold text-v2-brand">إلغاء</DialogClose>
      <button type="button" data-uisfx="delete" onClick={remove} className="m3-ripple min-h-10 rounded-full px-3 text-[calc(9px*var(--ts))] font-semibold text-v2-live-strong">فسخ</button>
    </div>
  </DialogContent>
</Dialog>
```

```css
/* android.css — menus portal to <body>: Material's baseline 4 dp corners on surface-container; the web keeps 28, iOS draws a glass menu (≈ 22–26). */
[data-platform="android"] .v2-menu { border-radius: 4px; background-color: var(--m3-surface-container); }
```

**Rules:** an icon on every row, destructive last and red, unavailable items hidden, not
dimmed; `data-uisfx` on `Trigger` and `Item` works because the click bubbles from the
portal — call `sfx()` in `onSelect` only if keyboard use matters.

**Which menu the app uses:** the **baseline 4 dp menu above, one style app-wide**. The M3
Expressive *vertical menu* (Nov 2025; Compose's expressive menu APIs promoted in 1.5) is an
allowed future change, not the current rule — if it is adopted, it replaces the baseline
everywhere in one go, never mixed. Its shape, for that day:

```tsx
{/* Expressive vertical menu: rounded container on surface-container-low, rows grouped with gaps instead of
    dividers (one or two gaps per menu at most), the selected row tinted. Material says tertiary-container;
    we have no tertiary (that job is --v2-cta), so it maps to the lime-tinted secondary-container.
    The container radius has no primary source — rounded-2xl (16) until one is confirmed. */}
<DropdownMenu.Content data-space="v2" align="start" sideOffset={4} collisionPadding={48}
  className="v2-menu-expressive z-50 flex min-w-[112px] max-w-[280px] flex-col gap-0.5 bg-transparent text-v2-ink">
  <DropdownMenu.Group className="overflow-hidden rounded-2xl bg-m3-surface-container-low py-1 shadow-v2-lift">
    <DropdownMenu.Item data-uisfx="select" onSelect={share} className={item}><Share2 className="size-6 text-v2-ink/70" strokeWidth={2} />شارك</DropdownMenu.Item>
    <DropdownMenu.Item data-uisfx="select" onSelect={pin} className={cn(item, "bg-m3-secondary-container text-m3-on-secondary-container")}>…</DropdownMenu.Item>
  </DropdownMenu.Group>
  <DropdownMenu.Group className="overflow-hidden rounded-2xl bg-m3-surface-container-low py-1 shadow-v2-lift">
    <DropdownMenu.Item data-uisfx="open" onSelect={() => setConfirm(true)} className={cn(item, "text-v2-live-strong")}><Trash2 className="size-6" strokeWidth={2} />فسخ</DropdownMenu.Item>
  </DropdownMenu.Group>
</DropdownMenu.Content>
```

## 11. Linear progress (4 dp, gap, stop dot)

**When:** *activity* — a download, an upload, buffering — over 200 ms. Progress-as-score
(2/5 files taken) is the `play` bar (`.v2-bar`, lime, in `DocsPanel.tsx`); don't swap them.

```tsx
function LinearProgress({ value, label }: { value: number; label: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    // A flex row in RTL starts at the right, so the fill runs right → left by itself. 4 dp high, 4 dp gap,
    // 4 dp stop dot. M3E tints the track with secondary-container; here that reads as lime selection, so it stays tonal.
    <div role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="relative flex h-1 items-center gap-1">
      <div className="h-full rounded-full bg-m3-primary transition-[width] duration-150 ease-m3-effects" style={{ width: `${pct}%` }} />
      <div className="h-full min-w-0 flex-1 rounded-full bg-m3-surface-container-highest" />
      <span aria-hidden className="absolute end-0 size-1 rounded-full bg-m3-primary" />
    </div>
  )
}
```

**Rules:** under 200 ms show nothing; 0.2–5 s pair it with the `processing` loop cue and
end on `success` / `error`; it lives inside the control it reports on, never across the
page; the wavy variant and the morphing loading indicator are not built (verify).

## 12. Ripple on press

**When:** every tappable. `m3-ripple` (in `android.css`) is CSS-only: on `:active` a circle
of `currentColor` grows from the centre to 200 % over 320 ms (`cubic-bezier(.2,0,0,1)`) at
12 %, fades in 120 ms, and is instant under reduced motion.

```tsx
<button type="button" data-uisfx="select"
  className="m3-ripple min-h-12 rounded-full px-4 text-v2-ink hover:bg-v2-ink/[0.08] focus-visible:bg-v2-ink/[0.10] focus-visible:outline-[3px] focus-visible:outline-v2-brand">
  …
</button>
```

**Rules:** on the element that takes the tap, not a wrapper; it sets `overflow: hidden` and
`isolation: isolate`, so an element whose badge sits outside its box (the bell's dot) puts
the ripple on an inner span; the layer is `currentColor`, so a lime CTA ripples navy and a
text button ripples teal. Material grows the ripple from the touch point; this one grows
from the centre — a JS ripple is a later upgrade, not a rule.

## 13. Status-bar-safe fixed header

**When:** a pushed screen's bar, the player's overlay — anything fixed to the top.

```tsx
{/* The frame paints the status bar; the app only keeps clear of it — through the variable, never env(). */}
<header className="fixed inset-x-0 top-0 z-20 bg-m3-surface-container pt-[var(--sai-top)]">
  <div className="flex h-16 items-center gap-1 px-1">
    <button type="button" aria-label="رجوع" data-uisfx="back" onClick={() => navigate(-1)} className={cn(iconBtnClass, "m3-ripple size-12")}><ChevronRight className="size-6" strokeWidth={2} /></button>{/* back points right */}
    <h1 className="min-w-0 flex-1 truncate ps-1 text-[calc(14.2px*var(--ts))] font-semibold text-v2-ink">{title}</h1>
    {action}
  </div>
</header>
{/* Content starts under the bar and ends clear of the navigation bar. */}
<main className="pt-[calc(var(--sai-top)+64px)] pb-[calc(var(--sai-bottom)+64px+16px)]">…</main>
```

**Rules:** an in-flow header uses `pt-[max(1rem,var(--sai-top))]` (the `TopBar` idiom); a
wrapper without competing padding can use `pt-safe` / `pb-safe`; the bar is tonal and
opaque — no `backdrop-blur`, no border.

## 14. The expressive springs as `linear()` easings

**When:** any transition. Each spring (mass 1, damping ratio / stiffness) is sampled at 25
points over its settle time (to 1 %, rounded up to 50 ms). Spatial springs overshoot;
effects never. Add to `android.css`:

```css
@theme inline {
  /* fast spatial 0.6 / 800 — 250 ms, +9 %: switches, chips, the pill */
  --ease-m3-fast: linear(0, 0.038, 0.135, 0.266, 0.411, 0.556, 0.69, 0.806, 0.902, 0.976, 1.03, 1.066, 1.086, 1.094, 1.093, 1.085, 1.074, 1.06, 1.047, 1.033, 1.022, 1.012, 1.004, 0.999, 1);
  /* default spatial 0.8 / 380 — 350 ms, +1.5 %: sheets, menus, expanding items */
  --ease-m3-default: linear(0, 0.035, 0.119, 0.229, 0.349, 0.467, 0.576, 0.673, 0.755, 0.823, 0.878, 0.92, 0.953, 0.976, 0.992, 1.003, 1.01, 1.014, 1.015, 1.015, 1.014, 1.012, 1.011, 1.009, 1);
  /* slow spatial 0.8 / 200 — 450 ms, +1.5 %: full-screen moves */
  --ease-m3-slow: linear(0, 0.03, 0.106, 0.206, 0.317, 0.428, 0.533, 0.629, 0.713, 0.784, 0.843, 0.89, 0.927, 0.956, 0.977, 0.992, 1.003, 1.009, 1.013, 1.015, 1.015, 1.014, 1.013, 1.012, 1);
  /* fast effects 1.0 / 3800 — 150 ms, no overshoot: colour, opacity (default 1600 → 200 ms, slow 800 → 250 ms exist; keep effects ≤ 150) */
  --ease-m3-effects: linear(0, 0.058, 0.181, 0.321, 0.456, 0.574, 0.672, 0.751, 0.813, 0.861, 0.897, 0.924, 0.945, 0.96, 0.971, 0.979, 0.985, 0.989, 0.992, 0.994, 0.996, 0.997, 0.998, 0.999, 1);
}
```

Tailwind v4 turns `--ease-*` into utilities; pair each with its duration:
`duration-250 ease-m3-fast` (thumb, chip morph, pill) · `duration-350 ease-m3-default`
(sheet rise, menu open, accordion) · `duration-[450ms] ease-m3-slow` (screen push) ·
`duration-150 ease-m3-effects` (colour, opacity) · `motion-reduce:ease-m3-effects` or
`motion-reduce:transition-none`.

**Rules:** the duration IS the spring's settle time — don't pair a spatial curve with a
longer or shorter one; colour and opacity never take a spatial curve; nothing over 600 ms;
under reduced motion the overshoot goes.
