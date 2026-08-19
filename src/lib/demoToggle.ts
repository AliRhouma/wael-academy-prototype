import { useEffect, useState } from "react"

/**
 * A demo switch bound to one key. The key flips it; `initial` is where it
 * starts.
 *
 * These are prototype controls, not features of the product, so they have NO
 * on-screen affordance — the page reads exactly as the real one does, and the
 * person driving the demo works the keyboard.
 *
 * Keyed off `code`, not `key`, so it stays the PHYSICAL key whatever layout is
 * active: on an Arabic keyboard H types أ and K types لا, and matching on the
 * character would make the shortcuts unreachable for exactly the audience this
 * app is written for.
 *
 * Ignored while typing, and while any modifier is down, so a switch can never
 * fire from a browser shortcut or eat a letter someone meant to write.
 *
 * THE SWITCHES IN USE, so two screens never claim the same key:
 *   H — dashboard, the live panel · K — dashboard, the documents queue
 *   S — dashboard, the board of new replays
 *   1 — calendar, the month view (cards ⇄ dots; starts on whichever the
 *       form factor calls for)
 *   1 — video page, a crowded programme (the contenus column filled to ~24
 *       items, so the scroll inside the player's height can be shown). Shares
 *       the key with the calendar's switch on purpose: the two screens are
 *       never on at once, and a demo is easier to drive when the same finger
 *       means « show me the busy version » wherever you are.
 */
export function useDemoToggle(code: string | string[], initial = true): boolean {
  const [on, setOn] = useState(initial)
  // An array of codes so one switch can answer to the same key in two places on
  // the board — « 1 » is Digit1 on the number row and Numpad1 on the pad, and
  // nobody pressing 1 means only one of them. Joined into a string so the effect
  // isn't re-bound on every render by a fresh array literal.
  const codes = Array.isArray(code) ? code.join(" ") : code

  useEffect(() => {
    const wanted = codes.split(" ")
    const onKeyDown = (event: KeyboardEvent) => {
      if (!wanted.includes(event.code)) return
      if (event.altKey || event.ctrlKey || event.metaKey) return
      const target = event.target as HTMLElement | null
      if (target?.isContentEditable || target?.closest("input, textarea, select")) return
      event.preventDefault()
      setOn((v) => !v)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [codes])

  return on
}
