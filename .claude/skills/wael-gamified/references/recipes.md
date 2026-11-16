# Wael Academy — `play` skin recipes

Copy-adapt these. They are in this codebase's idiom: Tailwind v4, `cn()`, the space's tokens
(`text-v2-ink`, `bg-v2-surface`, `bg-v2-cta`, `text-v2-brand`, `border-v2-ink/15`), font sizes as
`text-[calc(Npx*var(--ts))]`, logical utilities (`ps-`/`pe-`, `start-`/`end-`), a `data-uisfx` cue on
every clickable element — and the **hook classes** that `src/styles/skins/play.css` dresses. Keep
the soft-skin utilities on the element (`border`, `bg-v2-grad`, `shadow-v2-card`…): the same tree
renders under `?skin=soft`, and `play.css` overrides what it needs to. Imports used below:

```tsx
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Check, Download, FileText, Files, Library, Lock, SkipBack, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { subjectTint } from "@/features/student/subjectTint"
import { formatCountdown } from "@/features/student/calendar/schedule"
import { Burst, CtaLink, Num, Panel, PanelEmpty, Ring, SeeAll, btnClass, ctaClass, ctaGhostClass, tileClass, useShake } from "@/features/student-v2/ui"
import { useAllTaken, useDownloads } from "@/features/student-v2/downloads"
import { Chip, Disc, Ribbon, fileId } from "@/features/student-v2/matieres/parts"
import { kindOf } from "@/features/student-v2/matieres/matieres" // meta = kindOf(item.kind); Glyph = meta.icon
import { PortraitStage } from "@/features/student-v2/PortraitStage"
import { sfx } from "@/features/student-v2/sound"
import { BASE } from "@/features/student-v2/lib"
```

## 1. The chunky CTA — and its ghost once the job is done

**When:** the one primary action of a card or screen. Built in `dashboard/DocsPanel.tsx`,
`DocsSheet.tsx`, `dashboard/LivePanel.tsx`.

```tsx
// Navigation: the cue is the tap's MEANING (connect, forward, open, play…).
<Link data-uisfx="connect" to={`${BASE}/seance/${session.id}`} className={cn(ctaClass, "mt-3")}>
  <Video className="size-5" strokeWidth={1.75} /> يلّا، ادخل للمباشر
</Link>

// A download: no data-uisfx — download() plays `success` (then `press` on a repeat).
// Once taken, the same pill becomes the quiet ghost: still pressable, no longer a win.
<button type="button" onClick={() => download(doc.id, doc.pdf.name)}
  className={cn(ctaClass, "mt-1 min-h-10 px-4", taken && ctaGhostClass)}>
  {taken ? <>تحمّل <Check className="size-4" /></> : <>اضغط للتحميل <ArrowLeft className="size-4" /></>}
</button>
```

**Rules:** one lime pill per card; navy text on lime, never white; never both a `data-uisfx`
and an `sfx()` for one click; a disabled CTA loses its lip (the skin does it — don't fake depth).

## 2. A secondary `.v2-btn`

**When:** the other action beside a CTA — « السابق / الجاي », « رجوع », a tel/mail link.
Built as `StepButton` in `video/VideoScreen.tsx`.

```tsx
<button type="button" data-uisfx="skip-next" onClick={onClick} disabled={!onClick} className={cn(btnClass, "px-3")}>
  <SkipBack className="size-4" /> الجاي
</button>
```

**Rules:** outlined, 2 px line, 3 px tile lip — the skin's; `disabled` drops the lip; a
secondary never takes lime.

## 3. A pressable tile with its own lip

**When:** any card that navigates or acts as one target. Built in `matieres/SubjectsScreen.tsx`
(subject tint), `matieres/SubjectScreen.tsx` `ItemCard` (kind), `dashboard/RecentSection.tsx`.

```tsx
// The lip takes the matière's measured colour, so twenty cards read as twenty.
<Link to={`${BASE}/matieres/${subject.id}`} data-uisfx="open"
  style={{ ["--v2-lip" as string]: subjectTint(subject.name).dot }}
  className={cn(tileClass, "group flex h-full flex-col overflow-hidden rounded-3xl border border-v2-ink/15 bg-v2-surface")}>
  <PortraitStage name={subject.name} />
  …
</Link>

// A contenu wears its KIND: border in the kind at 35 %, lip in its edge, a 40 px plate at md+.
<article className={cn(tileClass, `v2-kind-${item.kind}`, "group relative flex items-center gap-3 rounded-2xl border border-v2-ink/10 bg-v2-surface")}>
  <Ribbon tone={item.kind}>{meta.ribbon}</Ribbon>
  <span aria-hidden className={cn("v2-play v2-plate", `v2-kind-${item.kind}`)}><Glyph strokeWidth={2} /></span>
  …
</article>
```

**Rules:** `tileClass` goes on the element that takes the tap, never on a wrapper; a custom
`--v2-lip` is a `--v2-edge-*` token or a measured tint, never a new hue; a tile inside a
scrolling row needs `.v2-rail` (or its own bottom padding) so the lip is not clipped.

## 4. A flat information panel

**When:** a section that informs — the actions inside it press, the panel does not. `Panel`
in `ui.tsx`; a bare `.v2-panel` article is `SessionCard` in `dashboard/CalendarPanel.tsx`.

```tsx
<Panel icon={Files} chip="bg-v2-chip-docs" title="تمارين والكور متع الحصص الجاية" meta={meta} action={<SeeAll to={`${BASE}/devoirs`} />}>
  …
</Panel>

<article className="v2-panel relative rounded-2xl border border-v2-ink/15 p-4 md:p-5">…</article>
```

**Rules:** depth = pressable, so a panel has no lip and no blurred shadow (2 px border, title
800 — the skin's); never `tileClass` on a panel; keep the 24 px radius (`rounded-3xl`, which
the platform skins remap).

## 5. A collectible document tile — taken, tick pop, `success`

**When:** a file the élève can take. Built in `DocsSheet.tsx`, `matieres/parts.tsx`
`FilesSheet`, `dashboard/DocsPanel.tsx`, `SeanceScreen.tsx`, `video/VideoScreen.tsx`.

```tsx
const { has, download } = useDownloads()
const isTaken = has(doc.id)
<div data-taken={isTaken} className={cn(tileClass, "v2-sheet-row flex items-center gap-3 rounded-2xl border border-v2-ink/15 p-3")}>
  <span className="v2-doc-plate relative grid size-11 shrink-0 place-items-center rounded-xl bg-v2-brand/10" data-kind={doc.kind}>
    <FileText className="size-5 stroke-v2-grad" strokeWidth={1.75} />
    {isTaken && (
      <span className="v2-tick absolute -bottom-0.5 -end-0.5 grid size-4 place-items-center rounded-full bg-v2-brand text-white ring-2 ring-v2-surface">
        <Check className="size-2.5" strokeWidth={3} />
      </span>
    )}
  </span>
  <p dir="auto" className="min-w-0 flex-1 truncate text-right text-[calc(9.5px*var(--ts))] font-semibold text-v2-ink">{doc.pdf.name}</p>
  <button type="button" onClick={() => download(doc.id, doc.pdf.name)} aria-label={isTaken ? `تحمّل ${doc.pdf.name}` : `حمّل ${doc.pdf.name}`}
    className={cn(ctaClass, "min-h-10 shrink-0 px-3.5", isTaken && ctaGhostClass)}>
    {isTaken ? <Check className="size-4" /> : <Download className="size-4" />}
  </button>
</div>
```

**Rules:** `data-taken` on the tile — the lip leaves with the take; the tick is mounted only
when taken, so `v2-pop` plays on the same frame as `success`; the memory is `useDownloads`
(session only) — never a stored flag.

## 6. The countdown `Ring` with `Num` digits

**When:** a real deadline — today the séance clock only (`Countdown` in
`dashboard/LivePanel.tsx`). Keep the soft skin's clock as a `.v2-soft` sibling.

```tsx
const RING_MS = 3_600_000 // the ring empties over the last hour
const [hh, mm, ss] = formatCountdown(left).split(":")
<div className="v2-play mt-4 flex flex-col items-center gap-2">
  <Ring fraction={left / RING_MS}>
    <span dir="ltr" className="v2-ring-digits flex flex-col items-center">
      <span className="text-[calc(17px*var(--ts))]">{mm}:<Num value={ss} /></span>
    </span>
  </Ring>
  <span className="text-[calc(8.5px*var(--ts))] font-bold text-v2-live-strong">تبدا بعد</span>
</div>
```

**Rules:** `fraction` is how much is LEFT; only the digit that changes is a `<Num>`; the
heartbeat (`useSecond`) runs only while the countdown is on screen; no countdown that is not
the real séance clock.

## 7. The « انتهت » / « كمّلت » stamp

**When:** something has ended (orange) or been finished (lime — a win). Built in `StateChip`
and LivePanel `Ended` (`.v2-soft` tick beside it), and the finish overlay in `video/VideoScreen.tsx`.

```tsx
<span aria-hidden className="v2-stamp v2-play absolute end-4 top-4 text-[calc(9px*var(--ts))]">انتهت</span>

<span data-tone="cta" className="v2-stamp inline-flex rounded-xl border-2 border-v2-cta bg-v2-surface px-4 py-1.5 text-[calc(14px*var(--ts))] font-extrabold text-v2-ink">
  كمّلت الحصّة! الجاية؟
</span>
```

**Rules:** orange only for ended, lime only for finished; a stamp informs, so no lip; one
exclamation mark per screen, then a question that moves on.

## 8. The chapter ladder with `data-state`

**When:** an ordered list of steps with real locked / open / current states —
`ChapterList` + `Disc` in `matieres/SubjectScreen.tsx` and `parts.tsx`.

```tsx
<ul className="v2-ladder flex flex-col gap-4 2xl:gap-8">
  {chapters.map((b, i) => (
    <li key={b.chapter.id} className="v2-ladder-step rise"
      data-state={b.empty ? "locked" : open === b.chapter.id ? "current" : "open"}
      style={{ ["--i" as string]: Math.min(i, 12) }}>
      {/* shut: a tileClass section · open: "v2-chapter-open bg-v2-chapter" · locked: recipe 9 */}
      <Disc n={n} open={isOpen} muted={b.empty} done={done} />
      …
    </li>
  ))}
</ul>
// The ONE honest « done »: every file of the chapitre taken this session.
const withFiles = items.filter((i) => i.files.length > 0)
const done = withFiles.length > 0 && withFiles.every((i) => i.files.every((f) => has(fileId(i.title, f.name))))
```

**Rules:** states read off data that exists — there is no completion record, so « done » is
session evidence only; the rail's x per breakpoint lives in `play.css` (`--rail-x`,
`--disc`, `--disc-top`) — move the disc, update those; the path pauses under the open step.

## 9. A locked tile that shakes and plays `blocked`

**When:** a door that is shut — a « قريباً » chapitre (`SubjectScreen.tsx`), a recording for
subscribers (`recordings/SubjectRecordingsScreen.tsx`).

```tsx
const [shake, doShake] = useShake()
// Goes nowhere: answers the tap, says why.
<button type="button" data-uisfx="blocked" onClick={doShake} data-locked="true" aria-label={`${chapter.name} — مسكّر توّا`}
  className={cn(tileClass, shake, "relative flex min-h-[5rem] w-full items-center gap-3 rounded-2xl border border-v2-ink/10 bg-v2-surface/55 text-start")}>
  <Ribbon tone="soon">قريباً</Ribbon>…
</button>

// Leads somewhere: the shake gets its 320 ms, then the offers (straight through under reduced motion).
const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches
<Link data-uisfx="blocked" to={`${BASE}/offres`} data-locked="true"
  onClick={(e) => { e.preventDefault(); doShake(); window.setTimeout(() => navigate(`${BASE}/offres`), calm ? 0 : 320) }}
  className={cn(tileClass, shake, "group block rounded-2xl border border-v2-ink/10 bg-v2-ink/[0.025] p-4")}>
  <Lock className="size-3.5" /> هالتسجيل للمشتركين — شوف العروض …
</Link>
```

**Rules:** locked = flat, dashed, grey, no lip (`data-locked` does it); the cue is `blocked`,
never `error`; it explains in words and may offer the door — never a silent paywall, never a
disabled-looking row.

## 10. One celebration per screen — `Burst` + the `achievement` guard

**When:** a real completion only: the last file of a list (`useAllTaken` in `DocsPanel`,
`DocsSheet`, `FilesSheet`) or a video's real end (`VideoScreen.tsx`).

```tsx
// A list: fires once, 380 ms after the last `success`; never on load, never for the demo's forced state.
const done = docs.length > 0 && taken === docs.length
const burstAt = useAllTaken(done, !allTaken)
<p className="relative …">الكل عندك. جاهز للحصّة <Burst at={burstAt} /></p>

// A video: component memory, once per video per session; gone in 1.2 s or on tap (`close`).
const fired = useRef<Set<string>>(new Set())
useEffect(() => {
  if (!ended || !activeVideoId || fired.current.has(activeVideoId)) return
  fired.current.add(activeVideoId)
  sfx("achievement")
  setFinish({ id: activeVideoId, at: Date.now() })
  const t = window.setTimeout(() => setFinish(null), 1200)
  return () => window.clearTimeout(t)
}, [ended, activeVideoId])
```

**Rules:** one `Burst` per screen, inside a `relative` parent — the element that earned it;
`sfx("achievement")` only from an effect reacting to a user-caused change; the next action
never waits on the celebration.

## 11. A character empty state

**When:** a panel or page with nothing to show and a matière honestly in context
(`SubjectScreen`, `DocsSheet`, LivePanel `Nothing`). Also for lists emptied by deletes.

```tsx
<PanelEmpty icon={Library} character={subject.name} title="محتوى المادة يهبط قريب"
  body="دروس المادة هاذي يهبطو غدوة ولا بعد غدوة. كي يوصلو، تلقاهم هوني مرتّبين بالمحاور."
  action={<CtaLink data-uisfx="forward" to={`${BASE}/seances`}>شوف التسجيلات</CtaLink>} />
```

**Rules:** `character` only when the matière is real (the next séance's, the page's) — without
one, omit it and the glyph stays (no neutral Wael exists); one warm line, one chunky action;
the box is flat.

## 12. The mascot squash

**When:** a card that shows a subject badge — `PortraitStage` already carries `.v2-squash`;
the card must be the `group`. Built in `SubjectsScreen.tsx`, `RecentSection.tsx`.

```tsx
<Link data-uisfx="play" to={to} className={cn(tileClass, "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-v2-ink/15 bg-v2-surface")}>
  <PortraitStage name={subject.name} />
  …
</Link>
```

**Rules:** the squash is the whole badge (`scale 1.06 .94` while held); the eyes are the
pipeline's (`wael-subject-eyes`) — no dilate / squint / blink from the skin; no speech bubbles.

## 13. A lime segmented control

**When:** switching views or filters over one dataset — `SubjectsScreen.tsx`,
`recordings/RecordingsScreen.tsx`; `Chip` in `parts.tsx` for the deep panel's families.

```tsx
<div role="tablist" aria-label="فرز المواد" className="v2-seg flex rounded-full border border-v2-ink/15 bg-v2-surface p-1">
  {options.map(([value, label]) => (
    <button key={value} type="button" role="tab" aria-selected={filter === value} data-uisfx="toggle-on" onClick={() => setFilter(value)}
      className={cn("v2-chip min-h-10 rounded-full px-4 text-[calc(8.5px*var(--ts))] font-semibold transition", filter === value ? "bg-v2-grad text-white" : "text-v2-ink/70 hover:text-v2-ink")}>
      {label}
    </button>
  ))}
</div>
```

**Rules:** the skin reads `aria-selected` / `aria-pressed` / `data-on` — set one of them;
exactly one segment in force (lime + 2 px lip; the soft gradient is overridden); counts go in
a `.v2-chip-count` span.

## 14. A 12 px progress bar

**When:** a real count of real things — files taken of files to take (`DocsPanel`, the sheets).

```tsx
{taken > 0 && !done && (
  <div className="v2-bar mb-3 h-1.5 overflow-hidden rounded-full bg-v2-ink/[0.07]" aria-hidden>
    <div className="v2-bar-fill h-full rounded-full bg-v2-grad transition-[width] duration-500" style={{ width: `${(taken / docs.length) * 100}%` }} />
  </div>
)}
// Play only (a sheet): <div className="v2-play v2-bar"><div className="v2-bar-fill" style={{ width }} /></div>
```

**Rules:** width from the store's counts, never a timer; show it only while there is
something in between (0 and all have their own states); the fill starts at the start edge, so
it reads right → left under RTL on its own.

## 15. A NEW screen in the play skin

1. **Reference first:** open the two or three closest built screens (dashboard panels,
   `SubjectScreen`, `VideoScreen`) and match their density. Compose from `Panel`,
   `PanelEmpty`, `tileClass`, `ctaClass`, `btnClass`, `Chip`: information flat, actions on lips.
2. **Hooks on the right element:** `tileClass` on what takes the tap; `data-taken` /
   `data-locked` when those states exist; `--v2-lip` when the tile has its own hue; `<Num>`
   on counters; `.v2-bar` or `Ring` for progress; one lime CTA per card; a `Burst` only
   behind a real completion; `PanelEmpty character` where a matière is in context.
3. **A look no hook gives?** Add a hook class in the component (`.v2-<thing>`), its rule
   under `[data-skin="play"] [data-space="v2"]` in `play.css` (and its line in the
   reduced-motion block), the structural minimum in `v2.css` if it must exist in both
   skins, `.v2-play` / `.v2-soft` for a one-skin element. Never `useSkin()` in a screen,
   never a radius the platform maps, never a tab-bar / header / sheet-chrome rule.
4. **Sound:** `data-uisfx` on every clickable, `sfx()` for outcomes, cues from
   `docs/sound-effects.md` §4; add the screen's rows to §5; `npm run check:sounds`.
5. **Verify both skins:** `npm run dev`, `/student-v2/<route>` and `?skin=soft`, ~390 px and
   desktop, light and dark; `npm run shot -- "http://localhost:5173/student-v2/<route>" 390 844 out.png`;
   a reduced-motion pass; `npx tsc -b`; then the SKILL.md checklist and one line stating the
   screen's main UX decision.
