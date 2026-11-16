import { cn } from "@/lib/utils"
import { gCta } from "@/features/game/shared/ui"
import { useGamePlatform, type GamePlatform } from "./MobileGameLayout"

/**
 * The game app's controls, sized and shaped per platform — the numbers of
 * `wael-mobile-ios` and `wael-mobile-android` (their SKILL.md tables), on the
 * `play` skin's content look:
 *
 *                iOS (HIG, Liquid Glass era)        Android (M3 Expressive, One UI 9)
 *   prominent    50 pt capsule, lime + lip          56 dp full-round, lime + lip, ripple
 *   secondary    navy 8 % fill capsule, SAME 50 pt  outlined, SAME 56 dp as the prominent
 *   back         44 pt chevron in a glass circle    48 dp icon button, state layer + ripple
 *   input        44 pt, radius 12 (measure in kit)  56 dp, radius 4 (M3 outlined field)
 *   targets      ≥ 44 pt (menus ≥ 28)               ≥ 48 dp
 *   text scale   --ts 1.6, floor 11 pt              --ts 1.55, floor 11 sp
 *   landscape    compact height: no large title, no collapsing headline, controls
 *                clear of the notch / home bar; Android runs immersive (no status bar)
 *
 * A primary and a secondary in one row share a height — style, not size,
 * marks the preferred choice (Apple HIG Buttons; M3E matches sizes in a row).
 * Source of the numbers: the skills, updated from docs/mobile/pattern-audit-2026-11.md.
 *
 * Both: inputs ≥ 16 px (Safari zooms below), the back chevron points RIGHT
 * (RTL), a 3 px teal focus ring, a `data-uisfx` cue on every control (the
 * stand-in for the haptic). The lime CTA keeps the play lip — content look is
 * the skin's; size, shape and chrome are the platform's.
 */
export interface PlatformUi {
  ts: number
  cta: string
  secondary: string
  secondaryDark: string
  back: string
  input: string
  inputText: string
  link: string
  target: string
}

const focus = "focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-v2-brand"

const IOS: PlatformUi = {
  ts: 1.6,
  cta: cn(gCta, "h-[50px] rounded-full px-7"),
  secondary: cn(
    "inline-flex h-[50px] items-center justify-center gap-2 rounded-full bg-v2-ink/[0.08] px-6 font-semibold text-v2-ink",
    "transition-[transform,opacity] duration-150 ease-[cubic-bezier(.2,.8,.2,1)] active:scale-[.97] active:opacity-80",
    focus,
  ),
  secondaryDark: cn(
    "inline-flex h-[50px] items-center justify-center gap-2 rounded-full bg-white/15 px-6 font-semibold text-white",
    "transition-[transform,opacity] duration-150 ease-[cubic-bezier(.2,.8,.2,1)] active:scale-[.97] active:opacity-80",
    focus,
  ),
  // iOS 26+ draws bar buttons, back included, as a symbol in a glass circle.
  // The glass owns the press (it glows and swells, never fades). Bar symbols
  // are monochrome on iOS 26+, so the chevron is ink, not the teal tint.
  back: cn("ios-glass grid size-11 shrink-0 place-items-center rounded-full text-v2-ink", focus),
  input: "h-11 rounded-xl",
  inputText: "text-[max(16px,calc(10px*var(--ts)))]",
  link: cn("inline-flex min-h-11 items-center font-semibold text-v2-brand-text transition-opacity active:opacity-50", focus),
  target: "min-h-11",
}

const ANDROID: PlatformUi = {
  ts: 1.55,
  cta: cn(gCta, "m3-ripple h-14 rounded-full px-8"),
  secondary: cn(
    "m3-ripple inline-flex h-14 items-center justify-center gap-2 rounded-full border border-m3-outline-variant px-7 font-medium text-v2-brand-text",
    "transition-colors duration-150 hover:bg-v2-brand/[0.08]",
    focus,
  ),
  secondaryDark: cn(
    "m3-ripple inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/40 px-7 font-medium text-white",
    "transition-colors duration-150 hover:bg-white/[0.08]",
    focus,
  ),
  back: cn("m3-ripple grid size-12 shrink-0 place-items-center rounded-full text-v2-ink transition-colors hover:bg-v2-ink/[0.08]", focus),
  input: "h-14 rounded-sm",
  inputText: "text-[max(16px,calc(10.3px*var(--ts)))]",
  link: cn("m3-ripple inline-flex min-h-12 items-center rounded-full px-2 font-medium text-v2-brand-text", focus),
  target: "min-h-12",
}

export const PLATFORM_UI: Record<GamePlatform, PlatformUi> = { ios: IOS, android: ANDROID }

export function usePlatformUi(): PlatformUi {
  return PLATFORM_UI[useGamePlatform()]
}
