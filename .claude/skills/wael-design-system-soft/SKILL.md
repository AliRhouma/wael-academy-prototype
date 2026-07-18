---
name: wael-design-system-soft
description: Apply the Wael Academy (soft) design system when building ANY page, screen, component, section, marketing block, dashboard, form, or visual interface for the Wael Academy product family — not just one screen type. Triggers whenever the user asks to build, mock up, restyle, or extend a Wael Academy UI, or says "use the Wael style", "our design system", "our theme", "the soft theme", "on-brand", "match the app", or references the warm green-teal-navy education aesthetic with gold + red accents, cream warmth, green-tinted soft shadows, Comic Relief display type and Rubik interface type. Use it for app shells, landing/marketing sections, auth screens, dashboards, tables, cards, chips, modals, empty states, settings — any surface. Consult this skill for every Wael Academy surface, even a single quick component, so the whole product stays on-brand and soft. Note this is the SOFT web/app UI system (green/gold/navy, warm, rounded), distinct from the WaelDocuments printable-PDF skill (wael-design-system).
---

# Wael Academy — Soft Design System

A complete visual language for the Wael Academy product: an education brand that should feel **warm,
soft, and trustworthy**, never cold or clinical. It is built on the brand's **green -> teal -> navy
gradient** DNA, warmed with **gold + cream**, grounded in **green-tinted neutrals**, set in **Comic
Relief** (display) over **Rubik** (interface), and rendered with **soft green-tinted elevation** on a
**warm canvas**. This is a full system - colors, type, surfaces, the background, spacing, motion, and
the UI-element patterns - not a template for one screen. Consult it for every surface, big or small;
staying on-brand *and warm* is the whole job.

## What this system is for

Any Wael Academy web/app surface: app shells and dashboards, planning/calendar views, landing and
marketing sections, auth, forms, settings, tables, and every small component in between. The theme is
product-agnostic - the same tokens and patterns dress a KPI dashboard, a pricing page, or a login
screen. When you need a concrete worked example, the planning dashboard in `patterns.md` shows the
system fully assembled.

## Start here, every time

1. **Install the tokens.** Ensure `assets/tokens.css` is imported into the project's global stylesheet
   (it's the source of truth - Tailwind v4 `@theme inline`, light + dark). For a standalone artifact,
   inline its `:root` / `[data-theme="dark"]` blocks in a `<style>`. Every utility below depends on it.
2. **Load the two fonts** at the app root (Comic Relief ships only 400/700):
   `<link href="https://fonts.googleapis.com/css2?family=Comic+Relief:wght@400;700&family=Rubik:wght@400;500;600;700&display=swap" rel="stylesheet">`
3. **Read the reference you need** (don't guess values or markup from memory):
   - `references/foundations.md` - **read this first.** The soft vibe explained as rules, the color
     roles, type system, the warm background, surfaces & elevation, radii, spacing, motion, iconography.
     This is the "why it feels the way it feels" layer that governs everything else.
   - `references/tokens.md` - every token, what it means, which Tailwind utility consumes it. Read
     before choosing any color or size.
   - `references/components.md` - copy-adaptable recipes for buttons, chips/badges, cards, CTAs,
     inputs, nav, tables, avatars, icon chips, modals, dropdowns, empty states, segmented controls,
     and the planning-specific pieces (calendar board, mini-calendar, reminders).
   - `references/patterns.md` - app shells, the warm-canvas page frame, and how full pages compose
     (dashboard, list/table, settings, marketing, auth), with the planning screen as the worked example.
4. **Build with tokens, never hex.** Use `bg-brand-500`, `text-ink-muted`, `border-border`, `bg-grad`,
   `bg-canvas`, `shadow-sm`, `font-display`, etc. Correctly-tokened components theme for light/dark
   automatically - that's the point. Hardcoded hex breaks theming and is off-brand.

## The system in one paragraph

Surfaces sit on a **warm canvas** (`bg-canvas` - a warm sage ground with a cream glow top-right and a
soft green glow bottom-left), never on flat white or grey. Content is white `surface` with quiet
`border-border`, **green-tinted** soft shadows, and generous rounded corners. The **brand gradient**
(`bg-grad`) is the loud brand signal, spent on a handful of surfaces per view - a primary CTA, an
active nav item, an avatar, a key control - never as a wash behind text. **Gold** is the kicker / seal
/ reward color; **red** is reserved for alerts, "today", and destructive; **emerald** and **navy** are
the two supporting brand greens. Display text (titles, big numbers, kickers) is **Comic Relief** at
700; all interface text is **Rubik**. Ink runs `ink -> ink-subtle -> ink-muted`, and is near-black-green,
never pure black. The feeling is warm, unhurried, and soft - warmth comes from the neutrals, the cream,
and the green-tinted shadows, not from loud accents; color is earned, not sprinkled.

## Non-negotiables (what keeps it soft and on-brand)

- **Warmth lives in the neutrals, not the accents.** The canvas is warm sage (never flat white/grey),
  cards are true white, ink is near-black-green (never `#000`), and **every shadow is green-tinted**
  (`rgb(21 58 45 / ...)`). Cold black shadows kill the vibe instantly - never use them.
- **The gradient is the DNA, spent sparingly.** `bg-grad` goes on the primary action, active nav, the
  avatar, and a few key controls - a handful of surfaces per view. Never paint a whole panel with it,
  and never put small body text directly on it.
- **Each accent means one thing.** Gold = kicker / seal / reward. Red = alert / today / destructive.
  Emerald = positive / supporting green. Navy = informational / depth. Don't reuse them as decoration.
- **Comic Relief is display-only, and only ever 700.** Titles, big numbers, kickers, brand wordmark,
  card/section titles. It ships no mid-weight - never set it to 400/500/600. All interface text is
  Rubik. Keep Comic Relief ~10% smaller than a grotesk at the same role - it runs wide and overflows fast.
- **Soft, roomy, rounded.** Chips/small `rounded-sm`; buttons / inputs / icon-chips `rounded-md`; cards
  `rounded-lg`; hero/shell/promo `rounded-xl`; pills/avatars `rounded-full`. Roomy padding (`p-4`+).
- **Text on tokens.** `text-ink` / `-subtle` / `-muted` - never raw `text-gray-*`.
- **Motion is a gentle rise.** Surfaces fade-up ~10px on load, staggered; interactive tiles lift a few
  px on hover. All of it dies under `prefers-reduced-motion`.

## Output format

- **React component / page** -> self-contained `.jsx`/`.tsx` artifact using Tailwind classes and
  `lucide-react` icons, matching `components.md`. Default export, no required props.
- **HTML mockup** -> single `.html` with `tokens.css` inlined in a `<style>` block and the two Google
  Fonts linked in `<head>`.
- When the user names a specific screen or element, follow the exact composition in `patterns.md` /
  `components.md` for it.
- French is the product's primary UI language (a Tunisian academy) - keep French labels unless asked
  otherwise. For Arabic, set `dir="rtl"` and prefer logical utilities (`ps-`, `me-`, `start-`).

## Frontend craft

For anything beyond a trivial snippet, also follow the general `frontend-design` skill
(`/mnt/skills/public/frontend-design/SKILL.md`) for layout polish and code quality - this skill governs
the *brand*, that one governs *build quality*. They compose.
