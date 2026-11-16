# Wael Academy — iOS skin recipes

Copy-adapt these. They are in this codebase's idiom: Tailwind v4, `cn()`, the space's tokens
(`text-v2-ink`, `bg-v2-surface`, `bg-v2-cta`, `text-v2-brand`, `border-v2-ink/15`),
`ios-glass` from `src/styles/platform/ios.css`, font sizes as `text-[calc(Npx*var(--ts))]`
(N = pt ÷ 1.6 — table in `SKILL.md`), logical utilities (`ps-`/`pe-`, `ms-`/`me-`,
`start-`/`end-`), and a `data-uisfx` cue on every clickable element. Imports used below:

```tsx
import { Link, NavLink, useNavigate } from "react-router-dom"
import { ArrowRight, ChevronLeft, ChevronRight, Download, Ellipsis, Search, Share2, Trash2, X } from "lucide-react"
import { usePlatform } from "@/app/platform"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/lib/hooks"
import { Sheet, SheetClose, SheetContent, SheetGrabber, SheetTitle } from "@/components/ui/sheet"
import { ctaClass, iconBtnClass } from "@/features/student-v2/ui"
import { sfx } from "@/features/student-v2/sound"
import { BASE } from "@/features/student-v2/lib"
```

Radii come from `ios.css` (`rounded-3xl` → 22, `rounded-2xl` → 14, sheet top → 38) — never restate them.

## 1. The floating glass tab bar

**When:** never from scratch — the bar is `IosTabBar` in `src/features/student-v2/V2Shell.tsx`,
picked by `BottomBar` through `usePlatform()`. Extend it there. Its spec:

```tsx
// 64 px capsule, 16 px side margins, 8 px above the home indicator. Labels always shown.
<nav aria-label="القائمة" className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(var(--sai-bottom)+8px)] lg:hidden">
  <ul className="ios-glass pointer-events-auto mx-auto grid max-w-md grid-cols-5 rounded-full p-1.5">
    {studentV2Tabs.map(({ label, path, icon: Icon }) => (
      <li key={path} className="min-w-0">
        <NavLink to={path} end={path === BASE} data-uisfx="select"
          className={({ isActive }) => cn("flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-full px-1 text-[calc(6.9px*var(--ts))] transition-colors",
            isActive ? "bg-v2-brand/[0.12] font-semibold text-v2-brand-text" : "font-medium text-v2-ink-2 active:bg-v2-ink/[0.04]")}>
          {({ isActive }) => (<>
            <Icon aria-hidden className="size-[26px] shrink-0" strokeWidth={isActive ? 2.25 : 1.75} />
            <span className="max-w-full truncate">{label}</span>
          </>)}
        </NavLink>
      </li>
    ))}
  </ul>
</nav>
```

**Target vs today:** the snippet is today's `IosTabBar`. The SKILL table now wants the capsule
≈ 21 pt from the left, right and bottom edges (`px-[21px] pb-[21px]`, inside the home-indicator
band) and labels 11 regular, medium when selected — measure both in the iOS 27 kit before
changing the bar (SKILL "Known code drift").

**Rules:** five tabs from `studentV2Tabs`, never six; iOS tints the selected tab system blue —
here the text-safe teal `text-v2-brand-text` (the raw brand teal is 3.3 : 1), and nothing else
in the bar is coloured; unselected labels are `text-v2-ink-2`. **No minimize on scroll**: the
2026-11 Apple-design audit (C5) found it is reserved for bars with an accessory and that it
dropped the tab names; `useScrollingDown()` is now used only by the Android bar.

## 2. A large title that collapses

**When:** every tab-root screen. Pushed screens use only the collapsed bar (recipe 11).

```tsx
function LargeTitle({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const bar = useRef<HTMLDivElement>(null)
  const big = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    const onScroll = () => {
      if (bar.current && big.current) setCollapsed(big.current.getBoundingClientRect().bottom <= bar.current.getBoundingClientRect().bottom)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-20">
        {/* The scroll-edge effect, Apple's AUTOMATIC style: the collapsed title is text outside a glass
            control, so the band is opaque enough behind it, with only a short fade below. No border. */}
        <div aria-hidden className={cn("pointer-events-none absolute inset-x-0 top-0 h-[calc(var(--sai-top)+44px+12px)] bg-v2-surface/80 backdrop-blur-md [mask-image:linear-gradient(black_85%,transparent)] transition-opacity duration-250", collapsed ? "opacity-100" : "opacity-0")} />
        <div ref={bar} className="relative box-content flex h-11 items-center justify-center px-4 pt-[var(--sai-top)]">
          <h1 aria-hidden={!collapsed} className={cn("truncate text-[calc(10.6px*var(--ts))] font-semibold text-v2-ink transition-opacity duration-250", collapsed ? "opacity-100" : "opacity-0")}>{title}</h1>
          {action && <div className="absolute end-4">{action}</div>}
        </div>
      </header>
      <h1 ref={big} className="px-4 pt-[calc(var(--sai-top)+44px)] text-start text-[calc(21.25px*var(--ts))] font-bold leading-tight text-v2-ink">{title}</h1>
      {children}
    </>
  )
}
```

**Rules:** title under 15 characters; large = 34/41 right-aligned at the 16 px margin,
collapsed = 17 semibold centred; one trailing action at most. The band appears once collapsed
and stays opaque behind the title (HIG Scroll views, 2026-06: prefer the automatic style; iOS 27
draws a uniform bar background under floating bars); a soft, fill-less fade only for a bar that
holds nothing but glass buttons. In compact height (landscape) there is no large title.

## 3. Inset grouped list

**When:** chapters, documents, settings, playlists — anything that is a list, not hero content.

```tsx
<section aria-labelledby="h-docs">
  {/* 13 pt, sentence case — iOS 26 stopped shouting section headers. */}
  <h2 id="h-docs" className="mb-2 ps-4 text-[calc(8.1px*var(--ts))] text-v2-ink/60">وثائق الحصّة</h2>
  {/* 22 px on iOS via ios.css. Whether the panel keeps its border is the play skin's call. */}
  <ul className="overflow-hidden rounded-3xl border border-v2-ink/15 bg-v2-surface">
    {rows.map((row, i) => (
      <li key={row.id}>
        <Link to={row.to} data-uisfx="open" className="flex items-center gap-3 ps-4 transition active:bg-v2-ink/[0.08]">
          <Icon className="size-5 shrink-0 stroke-v2-grad" strokeWidth={1.75} />
          {/* The hairline sits on the inner span, so it starts at the text, not the edge. */}
          <span className={cn("flex min-h-[52px] min-w-0 flex-1 items-center gap-3 pe-3", i < rows.length - 1 && "border-b-[0.5px] border-v2-ink/15")}>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[calc(10.6px*var(--ts))] text-v2-ink">{row.title}</span>
              <span className="block truncate text-[calc(9.4px*var(--ts))] text-v2-ink/60">{row.meta}</span>
            </span>
            {/* Points where navigation goes — left, in Arabic. Only on rows that navigate. */}
            <ChevronLeft className="size-4 shrink-0 text-v2-ink/30" strokeWidth={2.25} />
          </span>
        </Link>
      </li>
    ))}
  </ul>
</section>
```

**Rules:** rows ≥ 52 px, 17 body / 15 secondary; press = `active:bg-v2-ink/[0.08]`, no hover
reveal; `open` for a row that drills down, `select` for an option row (checkmark, no chevron).

## 4. Bottom sheet with grabber and detents

**When:** a scoped task — documents, comments, filters, the profile. Desktop gets a `Dialog`
through `useIsMobile()`, as `DocsSheet.tsx` does.

```tsx
function IosSheet({ open, onOpenChange, title, onDone, children }: Props) {
  const [detent, setDetent] = useState<"medium" | "large">("medium")
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) sfx("close"); onOpenChange(o) }}>
      {/* iOS 26+: the medium detent floats — inset from the sides and bottom, corners following the
          53 px display radius (53 − 8 ≈ 44), on regular glass. The large detent goes opaque and
          attaches to the edges with 38 px top corners. Radii unverified — measure in the iOS 27 kit. */}
      <SheetContent side="bottom" showCloseButton={false} data-detent={detent}
        className={cn("gap-0 overflow-hidden border-0 px-4 pt-2 text-v2-ink transition-[height,inset,border-radius] duration-300 ease-[cubic-bezier(.2,.8,.2,1)]",
          detent === "medium"
            ? "inset-x-2 bottom-2 h-[50dvh] rounded-[44px] ios-glass"
            : "inset-x-0 bottom-0 h-[calc(100dvh-var(--sai-top)-10px)] rounded-t-3xl bg-v2-surface")}>
        {/* 36 × 5 on iOS (ios.css). Tapping it cycles the detents, as the HIG says it should. */}
        <button type="button" aria-label={detent === "medium" ? "كبّر" : "صغّر"} data-uisfx={detent === "medium" ? "expand" : "collapse"}
          onClick={() => setDetent((d) => (d === "medium" ? "large" : "medium"))} className="grid h-6 w-full place-items-center">
          <SheetGrabber />
        </button>
        <div className="flex h-11 items-center">
          {/* Cancel leads, Done trails. The close cue plays once, in onOpenChange, for every way out. */}
          <SheetClose className="min-h-11 px-2 text-[calc(10.6px*var(--ts))] text-v2-brand">سكّر</SheetClose>
          <SheetTitle className="flex-1 truncate text-center text-[calc(10.6px*var(--ts))] font-semibold text-v2-ink">{title}</SheetTitle>
          <button type="button" data-uisfx="success" onClick={onDone} className="min-h-11 px-2 text-[calc(10.6px*var(--ts))] font-semibold text-v2-brand">تم</button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(1.25rem,var(--sai-bottom))]">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
```

**Rules:** one sheet at a time; "تم" only when the sheet commits something (a read-only sheet
has just "سكّر"), and a "تم" is always paired with "سكّر" or a back button (HIG Sheets,
2026-03); never Cancel + Done + Back together; overlay and Esc always close — drag to
dismiss is polish, not the only exit. Rows and text inside the glass medium detent sit on
opaque grouped panels — never small text directly on the glass. `ios.css` today forces
`38px 38px 0 0` on every `[data-slot="sheet-content"][data-side="bottom"]` (and `sheet.tsx`
paints `bg-background`); scope that rule to `[data-detent="large"]` when this lands.

## 5. Buttons on `ctaClass`

**When:** every action. iOS fills its prominent button with the tint; here the one prominent
action is the lime capsule, and the `play` skin owns its chunk and press.

```tsx
// Filled — THE action of the screen, one per screen. 50 px, 17 semibold.
<button type="button" data-uisfx="connect" className={cn(ctaClass, "min-h-[50px] px-6 text-[calc(10.6px*var(--ts))] active:scale-[.97] active:opacity-80")}>أدخل للمباشر</button>
// Tinted — secondary. iOS: tint at ~15 % + tint text; here navy at 8 %, so lime stays unique.
<button type="button" data-uisfx="forward" className={cn(ctaClass, "min-h-[50px] bg-v2-ink/[0.08] text-v2-ink hover:shadow-none hover:brightness-100")}>شوف الرزنامة</button>
// Plain — tertiary, text in the tint, no fill.
<button type="button" data-uisfx="expand" className={cn(ctaClass, "bg-transparent px-2 text-v2-brand hover:shadow-none hover:brightness-100")}>شوف الكل</button>
// Destructive — red text; never the default choice.
<button type="button" data-uisfx="delete" className={cn(ctaClass, "bg-transparent px-2 text-v2-live-strong hover:shadow-none")}>فسخ</button>
// Icon-only — a 44 px glass circle, always named.
<button type="button" aria-label="شارك" data-uisfx="open" className={cn(iconBtnClass, "ios-glass")}><Share2 className="size-[22px]" strokeWidth={2} /></button>
```

**Rules:** labels start with a verb; primary and secondary in one row share a height — style,
not size, marks the preferred choice (both 50; both 44 in a compact-height landscape row); a
slow action shows its activity inside the button.

## 6. Segmented control

**When:** two to five views of one dataset (week / month, school year). Filter chips with
counts (`SubjectsScreen.tsx`) keep the `play` gradient — they are content, not a view switch.

```tsx
<div className="py-1.5">{/* 32 px track inside a 44 px hit area */}
  <div role="tablist" aria-label="العرض" className="flex rounded-full bg-v2-ink/[0.06] p-0.5">
    {VIEWS.map(([value, label]) => (
      <button key={value} type="button" role="tab" aria-selected={view === value} data-uisfx="toggle-on" onClick={() => setView(value)}
        className={cn("min-h-7 flex-1 rounded-full px-3 text-[calc(8.1px*var(--ts))] font-semibold transition duration-200",
          view === value ? "bg-v2-surface text-v2-ink shadow-v2-card" : "text-v2-ink/60")}>
        {label}
      </button>
    ))}
  </div>
</div>
```

**Rules:** equal widths (`flex-1`), text only — never text mixed with icons; ≤ 5 segments; for
separate sections use the tab bar.

## 7. Switch

**When:** a binary setting **inside a list row**. Anywhere else, a toggle button with
`aria-pressed` (`SoundToggle` in `V2Shell.tsx`).

```tsx
function IosSwitch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    // 51 × 31, thumb 27. iOS defaults to system green; here the tint — teal.
    <button type="button" role="switch" aria-checked={on} aria-label={label} data-uisfx={on ? "toggle-off" : "toggle-on"} onClick={() => onChange(!on)}
      className={cn("relative h-[31px] w-[51px] shrink-0 rounded-full p-0.5 transition-colors duration-200", on ? "bg-v2-brand" : "bg-v2-ink/20")}>
      {/* White in both modes, like iOS — not bg-v2-surface. `rtl:` flips the travel. */}
      <span className={cn("block size-[27px] rounded-full bg-white shadow-v2-card transition-transform duration-200 ease-[cubic-bezier(.2,.8,.2,1)]", on ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0")} />
    </button>
  )
}
```

**Rules:** the cue is evaluated at click time (`on ? "toggle-off" : "toggle-on"`); the row's
label names the switch; the row may toggle it too, which also gives the 44 px hit height.

## 8. Search field

**When:** inline under the large title of الدروس and تسجيلات; filters as you type. The full
combobox with results is `header/SearchBox.tsx`.

```tsx
<label className="flex h-9 items-center gap-2 rounded-full bg-v2-ink/[0.06] pe-1 ps-3">
  {/* The magnifying glass never mirrors — its handle is a physical thing. */}
  <Search className="size-4 shrink-0 text-v2-ink/50" strokeWidth={2} />
  <input type="search" inputMode="search" enterKeyHint="search" placeholder="لوّج على درس…" value={q} onChange={(e) => setQ(e.target.value)}
    className="h-full min-w-0 flex-1 bg-transparent text-[max(16px,calc(10px*var(--ts)))] text-v2-ink outline-none placeholder:text-v2-ink/45 [&::-webkit-search-cancel-button]:hidden" />
  {q && (
    <button type="button" aria-label="امسح" data-uisfx="delete" onClick={() => setQ("")} className="grid size-7 place-items-center rounded-full bg-v2-ink/30 text-white">
      <X className="size-3.5" strokeWidth={2.5} />
    </button>
  )}
</label>
```

**Rules:** text ≥ 16 px or Safari zooms (the `max()` guarantees it under every `--ts`); clear
button trailing; placeholder in derja. Form inputs are the taller cousin: 44 px, `rounded-xl`
(12), a label above *and* a placeholder, `inputMode` set.

## 9. Context menu → action sheet

**When:** secondary actions on a card or row. The trigger is a visible "…" — long-press may
open the same menu, never alone. A destructive item confirms through an action sheet —
anchored over the control when a control started it, from the bottom otherwise.

```tsx
import { DropdownMenu, Popover } from "radix-ui"
const item = "flex min-h-11 cursor-pointer items-center gap-3 rounded-[14px] px-3 text-[calc(10.6px*var(--ts))] text-v2-ink outline-none data-[highlighted]:bg-v2-ink/[0.06]"

<DropdownMenu.Root dir="rtl">
  <DropdownMenu.Trigger asChild>
    <button type="button" aria-label="خيارات" data-uisfx="open" className={iconBtnClass}><Ellipsis className="size-6" /></button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Portal>
    {/* iOS 26+: menus sit on regular glass. Radius ≈ 22–26 (Apple gives no number — measure in the
        iOS 27 kit), items concentric inside it; rows opaque enough to read (text never small on clear glass). */}
    <DropdownMenu.Content align="start" sideOffset={8} collisionPadding={12} className="ios-glass z-50 w-64 rounded-[22px] p-1.5 text-v2-ink data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
      <DropdownMenu.Item data-uisfx="select" onSelect={share} className={item}><Share2 className="size-5" strokeWidth={1.75} />شارك</DropdownMenu.Item>
      {canDownload && <DropdownMenu.Item data-uisfx="success" onSelect={download} className={item}><Download className="size-5" strokeWidth={1.75} />حمّل</DropdownMenu.Item>}
      <DropdownMenu.Separator className="my-1 h-px bg-v2-ink/10" />
      <DropdownMenu.Item data-uisfx="open" onSelect={() => setConfirm(true)} className={cn(item, "text-v2-live-strong data-[highlighted]:bg-v2-live/10")}><Trash2 className="size-5" strokeWidth={1.75} />فسخ</DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>

{/* Started from a control (the "…" above, a row's delete button): iOS 26 shows the action sheet
    OVER that control, as a glass popover — no Cancel row; tapping outside cancels. */}
<Popover.Root open={confirm} onOpenChange={setConfirm}>
  <Popover.Anchor asChild>{/* the control that started it */}<span /></Popover.Anchor>
  <Popover.Portal>
    <Popover.Content side="top" align="start" sideOffset={8} collisionPadding={12} className="ios-glass z-50 w-64 overflow-hidden rounded-[22px] p-1.5">
      <p className="px-3 py-2 text-center text-[calc(8.1px*var(--ts))] text-v2-ink-2">التعليق يتفسخ نهائيًا.</p>
      <button type="button" data-uisfx="delete" onClick={remove} className="flex min-h-11 w-full items-center justify-center rounded-[14px] text-[calc(10.6px*var(--ts))] font-semibold text-v2-live-strong active:bg-v2-live/10">فسخ التعليق</button>
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>

{/* Started from a sheet, or with no control to anchor to: a grouped list rising from the bottom,
    destructive row on top, Cancel apart. */}
<Sheet open={confirm} onOpenChange={setConfirm}>
  <SheetContent side="bottom" showCloseButton={false} className="gap-2 border-0 bg-transparent px-2 pb-[max(0.5rem,var(--sai-bottom))] shadow-none">
    <div className="overflow-hidden rounded-3xl bg-v2-surface">
      <p className="px-4 py-3 text-center text-[calc(8.1px*var(--ts))] text-v2-ink/60">التعليق يتفسخ نهائيًا.</p>
      <button type="button" data-uisfx="delete" onClick={remove} className="flex min-h-14 w-full items-center justify-center border-t-[0.5px] border-v2-ink/15 text-[calc(12.5px*var(--ts))] text-v2-live-strong">فسخ التعليق</button>
    </div>
    <SheetClose data-uisfx="cancel" className={cn(ctaClass, "min-h-14 w-full bg-v2-surface text-v2-brand hover:shadow-none")}>إلغاء</SheetClose>
  </SheetContent>
</Sheet>
```

**Rules:** use one of the two confirmation forms, not both — anchored when a control started it,
bottom sheet otherwise; ≤ 3 groups, an icon on every row, destructive last and red; unavailable items hidden
(`canDownload &&`), not dimmed; `data-uisfx` on `Trigger` and `Item` works (the click bubbles
from the portal) — `sfx()` in `onSelect` only if keyboard use matters.

## 10. Back row — the chevron points right

**When:** the top of every pushed screen. One component in `ui.tsx`; the platform branch is
the shape: iOS 26+ draws bar buttons, back included, as a symbol in a glass circle — no text.

```tsx
export function BackRow({ to, label = "رجوع" }: { to?: string; label?: string }) {
  const navigate = useNavigate()
  const ios = usePlatform() === "ios"
  const go = () => (to ? navigate(to) : window.history.length > 1 ? navigate(-1) : navigate(BASE))
  // iOS: a 44 px glass circle with the chevron; the label is spoken, not shown. Points RIGHT — back is to the right in Arabic.
  if (ios) {
    return (
      <button type="button" aria-label={label} data-uisfx="back" onClick={go}
        className="ios-glass grid size-11 shrink-0 place-items-center rounded-full text-v2-brand-text transition active:opacity-70">
        <ChevronRight className="size-6" strokeWidth={2.5} />
      </button>
    )
  }
  // The web look keeps the frame's arrow and its text.
  return (
    <button type="button" data-uisfx="back" onClick={go}
      className="inline-flex min-h-11 w-fit items-center gap-1 rounded-full pe-3 text-[calc(10.6px*var(--ts))] font-medium text-v2-brand transition active:opacity-70">
      <ArrowRight className="size-5" strokeWidth={2} />
      {label}
    </button>
  )
}
```

**Rules:** `ChevronRight` because the space is RTL-only; if it ever goes bidirectional, use
`ChevronLeft` + `rtl:-scale-x-100`. The browser's edge swipe (right edge in RTL) works
alongside — the row is never the only way back.

## 11. Status-bar-safe fixed header

**When:** a pushed screen's bar, the player's overlay — anything fixed to the top.

```tsx
{/* The frame paints the status bar; the app only keeps clear of it — through the variable, never env(). */}
<header className="fixed inset-x-0 top-0 z-20 pt-[var(--sai-top)]">
  <div className="flex h-11 items-center justify-between px-4">
    <BackRow />
    <button type="button" aria-label="شارك" data-uisfx="open" className={cn(iconBtnClass, "ios-glass")}><Share2 className="size-[22px]" strokeWidth={2} /></button>
  </div>
</header>
{/* Content starts under the bar and ends clear of the floating tab bar. */}
<main className="pt-[calc(var(--sai-top)+44px+8px)] pb-[calc(var(--sai-bottom)+8px+64px+16px)]">…</main>
```

**Rules:** an in-flow header uses `pt-[max(1rem,var(--sai-top))]` (the `TopBar` idiom), a
wrapper without competing padding `pt-safe` / `pb-safe`; the bar itself has no fill — glass
goes on its 44 px circles, and once content scrolls under a title, recipe 2's automatic
scroll-edge band sits behind it. The bottom padding follows today's tab-bar offset; switch it
to the bar's new ≈ 21 pt offset when `IosTabBar` moves.
