# Sound effects — élève space (`/student-v2`)

> **Read this before adding or changing ANY interaction in `src/features/student-v2`**
> (a button, a link, a dialog, a toggle, a new feature such as chat, messages or
> delete). Every user action in the space answers with a sound; a new action
> without one is a bug, and a sound with the wrong meaning is worse.
> This file is written for **developers and AI coding agents alike**.

---

## 1. In one paragraph

The new élève space uses **UI SFX** (`uisfx`), a semantic UI-sound library: code
asks for a *meaning* (`select`, `send`, `delete`, `achievement`…) and the library
plays that meaning in the current *sound pack*. Sounds are **synthesized in the
browser** from recipes — no audio file is downloaded. One document-level binding
plays a cue when an element carrying `data-uisfx="<cue>"` is clicked; outcomes
that don't come from a click call `sfx("<cue>")` in code. The élève can mute
(speaker in the top bar) and the choice is remembered. Default pack: **`arcade`**
("gamified learning"); the other 11 packs can be auditioned from the states dock.

---

## 2. Source, version, license

| | |
|---|---|
| Library | **UI SFX** — npm package [`uisfx`](https://www.npmjs.com/package/uisfx), version **0.4.0** (pinned `^0.4.0`) |
| Author | Romain Simon / Yuki Capital — [github.com/romainsimon/uisfx](https://github.com/romainsimon/uisfx) · [uisfx.com](https://uisfx.com) (listen to every cue and pack there) |
| Code license | **MIT** (`node_modules/uisfx/LICENSE`) |
| Audio license | **CC0 1.0** — public domain, commercial use OK, no attribution required (`node_modules/uisfx/LICENSE-AUDIO`) |
| Runtime size | ~12 kB, zero dependencies; sounds are rendered with Web Audio from deterministic recipes and cached |
| Catalogue | 78 semantic cues in 13 categories × 12 packs (936 sounds; MP3/Ogg copies ship in `node_modules/uisfx/sounds/` for native/video use) |

**Alternatives that were evaluated and not chosen**

| Option | Why not |
|---|---|
| [Kenney — Interface Sounds / UI Audio / Digital Audio](https://kenney.nl/assets/category:Audio) (CC0) | Good sounds, but a folder of `.ogg` files: we would have to host them and build the player, the naming and the mute logic ourselves. |
| [SND — `snd-lib`](https://snd.dev/) (free to use, MIT code) | Only 3 kits and ~14 sounds; the audio is fetched from a CDN at runtime (the prototype is offline by design). |
| [`use-sound`](https://github.com/joshwcomeau/use-sound) / [`react-sounds`](https://github.com/e3ntity/react-sounds) | Players, not a sound design: `use-sound` needs our own files; `react-sounds` streams its sounds from a CDN. |

---

## 3. How it is wired

| File | Role |
|---|---|
| `src/features/student-v2/sound.ts` | **The only place that talks to uisfx.** Lazy player singleton (`soundPlayer()`), `sfx(cue)`, `useSound()` (reactive `{enabled, pack}`), `setSoundEnabled()`, `setSoundPack()`, `mountSound()`, `PACK_LABELS`, `DEFAULT_PACK`. |
| `src/features/student-v2/V2Layout.tsx` | `useEffect(() => mountSound(), [])` — binds `data-uisfx` on the **whole document** while the space is mounted (so dialogs, sheets and Radix menus, which portal to `<body>`, are covered) and unlocks Web Audio on the first real pointer/key. Unbinds and stops all sound on unmount. |
| `src/features/student-v2/V2Shell.tsx` | `SoundToggle` — the speaker button in the top bar (phone + desktop). |
| `src/features/auth/AuthFrame.tsx` | The same `mountSound()`, for the screens **outside** the space (`/connexion`, `/inscription`, `/mot-de-passe-oublie`) — the binding lives on the document, so a screen that never mounts `V2Layout` has to mount it itself or its `data-uisfx` attributes are silent. |
| `src/features/student-v2/demoStates.tsx` | `SoundRow` in the « حالات » dock: on/off + the 12 packs (tapping a pack switches the whole space and plays a sample). |
| `scripts/check-sounds.mjs` | `npm run check:sounds` — validates every cue name used (see §8). |

**Settings & persistence** — player created with `{ pack: "arcade", volume: 0.6, preferences: { key: "wael-v2:sound" } }`: enabled / pack / volume persist in `localStorage` under `wael-v2:sound`.

**Playback policy (library default)** — max 8 voices; a repeated one-shot *restarts* instead of layering; high-frequency cues get a short cooldown. So a double click does not double the sound.

**Scope** — only `/student-v2/*`. The public site (`/`, `/a-propos`) is silent on purpose. The old spaces (`/student`, `/admin`…) have no sound.

---

## 4. The sound grammar (meaning → cue)

One meaning = one cue, **everywhere**. Pick the cue by what the action *means*
to the élève, not by what the widget looks like.

| When the élève… | Cue |
|---|---|
| picks an item in a set (menu entry, day, group chip, search result, list row) | `select` |
| switches a binary option / filter tab ON · OFF | `toggle-on` · `toggle-off` |
| opens a menu, dropdown, dialog, sheet, detail view | `open` |
| closes one (X, overlay, Esc, « سكّر ») | `close` |
| reveals more / folds back (accordion, panel, list) | `expand` · `collapse` |
| goes back (back link, logo, « رجوع », « اليوم ») | `back` |
| moves on to another place (« الكل », « شوف الرزنامة », « أقرب حصّة ») | `forward` |
| moves through a sequence spatially (week arrows, carousels) | `swipe` |
| focuses one element inside a view (a séance block in the week grid) | `focus` |
| starts a video / opens a replay | `play` · next/previous video: `skip-next` · `skip-previous` |
| joins a live séance | `connect` · logs out: `disconnect` |
| completes an action successfully (download, save) | `success` |
| reaches a rare milestone (all the week's files taken) | `achievement` (other rewards: `reward`, `level-up`, `streak`, `badge`, `bonus`) |
| sends something (comment, message, contact form) | `send` · receives something: `receive` |
| deletes (committed) · abandons · reverts | `delete` · `cancel` · `undo` |
| hits a lock / not allowed (recording without subscription) | `blocked` · failure: `error` · risky state: `warning` |
| confirms a paid / contractual request | `purchase` |
| opens the notifications bell · marks all as read | `notification` · `check` |
| wakes / silences something (Wael's eyes on/off) | `wake` · `sleep` |
| repeats a trivial action (re-download a file already taken) | `press` |

---

## 5. Where each cue is used today

| Screen / component | Element → cue |
|---|---|
| **The door** `features/auth/*` | logo & « الرجوع إلى الصفحة الرئيسية » → `back` · « نسيت كلمة السر؟ » / « أعمل كونط » → `forward` · « تسجيل الدخول » (from sign-up) / « أرجع للدخول » → `back` · reveal eye → `toggle-on`/`toggle-off` · level & optional-matière select → `select` · signed in / account made → `connect`, refused → `error` · « ابعث الكود » / « أرجع ابعث الكود » / « ابعث الطلب » → `send` · « ما وصلنيش الكود » → `expand` · password changed → `success` |
| **Shell** `V2Shell.tsx` | rail & bottom-bar links → `select` · logo → `back` · settings gear → `press` · « خروج » → `disconnect` · speaker → plays `toggle-on` when turned on |
| **Header** `header/*` | bell → `notification` · « علّم الكل مقروء » → `check` · a notification → `open` · avatar menu → `open`, items → `select`, logout → `disconnect` · search result → `select` (Enter → `select`, or `error` when nothing matches) · clear search → `delete` |
| **Dashboard** `dashboard/*` | recent replay card → `play` · « الكل » (`SeeAll`) → `forward` · live « أدخل للمباشر » → `connect` · « تفاصيل الحصّة » / « شوف الرزنامة » → `forward` · « وثائق الحصّة » → `open` · « شوف التسجيل » → `play` · calendar collapse → `expand`/`collapse` · week/month arrows → `swipe` · « رجوع لليوم » → `back` · day chip / month cell / view item → `select` · view switch → `open` · « أقرب حصّة » → `forward` · séance title & homework chip → `open` |
| **Documents** `downloads.tsx`, `DocsPanel.tsx`, `DocsSheet.tsx` | download → `success` (again → `press`) · the LAST file of the list → `achievement` (380 ms after the `success`) · closing the sheet → `close` |
| **Calendar** `calendar/*` | « اليوم » → `back` · week arrows → `swipe` · day head / column → `select` · séance block → `focus` · empty-week « أقرب حصّة » → `forward` |
| **Recordings** `recordings/*` | subject card → `open` · filter tabs → `toggle-on` · group chip → `select` · year → `toggle-on` · trimester → `expand`/`collapse` (empty → `blocked`) · recording → `play` · locked recording → `blocked` · back → `back` |
| **Video** `video/*` | poster → `play` · « السابق » / « الجاي » → `skip-previous` / `skip-next` · playlist row & rail number → `play` · group pill → `select` · expand / fold / open rail → `expand`/`collapse` · « شوف الكل » → `expand`/`collapse` · post comment → `send` · delete comment → `delete` |
| **Offers** `offers/*` | « اكتب للأكاديمية » / « اشترك الآن » / « تفاصيل الدفع » → `open` · send contact → `send` · send subscription request → `purchase` · closing any dialog → `close` |
| **Séance page** `SeanceScreen.tsx` | back → `back` · join zoom → `connect` · recording → `play` |
| **States dock** `demoStates.tsx` | open/close dock → `open`/`close` · option → `toggle-on` · reset → `undo` · eyes on/off → `wake`/`sleep` · pack → plays `success` as a sample |

---

## 6. How to add sound to a NEW feature — checklist

1. **Name the meaning** of each user action with the grammar in §4 (or the full list in §9). Reuse before inventing: the same meaning must sound the same as elsewhere.
2. **A click on a button or link → declarative.** Put the attribute on the clickable element itself (never on a container — the binding uses `closest("[data-uisfx]")`):
   ```tsx
   <button type="button" data-uisfx="send" onClick={send}>ابعث</button>
   ```
3. **The cue depends on state → an expression**, evaluated at click time:
   ```tsx
   <button data-uisfx={open ? "collapse" : "expand"} onClick={() => setOpen(!open)} />
   ```
4. **Not a click → call `sfx()`** from `../sound` (typed `CueName`): keyboard Enter, a result that arrives later, an incoming message, a milestone derived from state.
   ```ts
   import { sfx } from "../sound"
   sfx("receive")
   ```
   Call it in an **event handler** or an **effect reacting to a user-caused change** — never during render, never inside a `setState` updater (React may run those twice).
5. **Never both** a `data-uisfx` and an `sfx()` for the same click.
6. **A wrapper component** (icon button, step button…) must forward the cue: give it a `sound` prop and render `data-uisfx={sound}` (see `IconToggle` in `video/PlaylistPanel.tsx`, `StepButton` in `video/VideoScreen.tsx`).
7. **Radix menus**: `data-uisfx` on `DropdownMenu.Trigger`'s button and on `DropdownMenu.Item` works (click bubbles from the portal). Keyboard selection doesn't emit a click — call `sfx()` in `onSelect` if keyboard use matters.
8. **Loops** (`loading`, `processing`, `recording`, `connecting`, `scanning`, `streaming`): keep the handle and stop it when the visible state ends.
   ```ts
   const h = soundPlayer().play("processing"); try { await upload() ; h?.stop(); sfx("success") } catch { h?.stop(); sfx("error") }
   ```
9. **Don't make noise the élève didn't cause**: nothing on page load, mount, polling or re-render. Exception: communication that is *about* the élève (`receive`, `mention`, `notification`) — throttle it, skip their own messages, and skip when `document.visibilityState !== "visible"`.
10. **Run `npm run check:sounds`** (catches typos — uisfx silently ignores unknown names), then `npx tsc -b`.
11. **Update §5 of this file** with the new rows.

---

## 7. Recipes for the features coming next

**Chat & messages**

| Action | Cue | How |
|---|---|---|
| open a conversation / the chat panel | `open` | `data-uisfx="open"` on the row / launcher |
| close the chat panel | `close` | on the close button (or `sfx` in `onOpenChange(false)`) |
| send a message (button or Enter) | `send` | attribute on the send button **and** `sfx("send")` in the Enter handler — *not both for the same event* |
| a message arrives from someone else | `receive` | effect on the last message id; only if `msg.userId !== me`, tab visible; throttle (e.g. ≥ 1.5 s between two) |
| the élève is @mentioned | `mention` | instead of `receive` for that message |
| add an emoji reaction | `reaction` | attribute on the reaction chip |
| attach a file | `drop` (drag) / `success` (upload done) | use the `processing` loop while uploading |
| message failed to send · retry | `error` · `retry` | in the send promise / on the retry button |
| copy a message | `copy` | |
| new unread messages badge | `notification` | once per burst, not per message |

**Delete**

| Action | Cue |
|---|---|
| open the confirm dialog | `open` |
| confirm — the item is really deleted | `delete` |
| cancel the dialog | `cancel` |
| « تراجع » (undo) in the toast | `undo` |
| delete not allowed (not your item, locked) | `blocked` |
| delete failed | `error` |

**Other patterns**

| Feature | Cues |
|---|---|
| forms: save OK / validation error / risky change | `success` / `error` / `warning` |
| checkbox, task done / undone | `check` / `uncheck` |
| drag & drop | `drag-start` → `drop` (or `invalid-drop`) · reorder list: `reorder` |
| quiz: right answer / wrong answer | `success` / `error` |
| finish a lesson / chapter / exam | `complete` · new level `level-up` · daily streak `streak` · badge earned `badge` · surprise gift `bonus` |
| payments: promo code accepted / payment done / refund | `coupon` / `purchase` / `refund` |

---

## 8. Checking your work

```bash
npm run check:sounds   # every cue name valid? prints usage counts
npx tsc -b             # types
```

Manual: open `/student-v2`, click once anywhere (browsers only start audio after a gesture), then exercise the feature. Mute with the speaker in the top bar; audition packs in the « حالات » dock → « الأصوات ».

Automated (what was used to verify this feature): in a headless browser, wrap `AudioBufferSourceNode.prototype.start` to count calls, click the element, and assert the count went up by one (and by zero when muted).

---

## 9. All 78 cues (uisfx 0.4.0)

`(loop)` = continuous until `.stop()`; everything else is a one-shot.

| Category | Cues |
|---|---|
| input | `hover`, `press`, `release`, `double-click`, `focus`, `long-press` |
| selection | `select`, `deselect`, `toggle-on`, `toggle-off`, `check`, `uncheck` |
| editing | `delete`, `cancel`, `undo`, `redo`, `copy`, `paste` |
| navigation | `open`, `close`, `back`, `forward`, `expand`, `collapse` |
| movement | `drag-start`, `drop`, `snap`, `swipe`, `reorder`, `invalid-drop` |
| communication | `send`, `receive`, `notification`, `mention`, `typing`, `reaction` |
| feedback | `success`, `error`, `warning`, `info`, `blocked`, `retry` |
| progress | `start`, `stop`, `progress-step`, `complete`, `queued`, `checkpoint` |
| loops | `loading` (loop), `processing` (loop), `recording` (loop), `connecting` (loop), `scanning` (loop), `streaming` (loop) |
| media | `play`, `pause`, `seek`, `volume-change`, `skip-next`, `skip-previous` |
| system | `connect`, `disconnect`, `lock`, `unlock`, `wake`, `sleep` |
| reward | `reward`, `level-up`, `achievement`, `streak`, `badge`, `bonus` |
| commerce | `add-to-cart`, `remove-from-cart`, `checkout`, `purchase`, `coupon`, `refund` |

Definitions of each cue: `node_modules/uisfx/manifest.json` (`cues[].description`) or [uisfx.com](https://uisfx.com).

**Packs** (`setSoundPack()` / dock): `arcade` (default — games, streaks, gamified learning) · `rubber` (playful, bouncy) · `soft` (warm, reassuring) · `organic` (wood & water — education, kids) · `glass` · `dreamy` · `zen` · `minimal` · `scifi` · `mechanical` · `studio` · `cinematic`. To change the default for everyone: `DEFAULT_PACK` in `sound.ts` (a pack already saved in a browser's `localStorage` wins — bump the key `wael-v2:sound` to reset everyone).

---

## 10. Rules that must not be broken

- Sound **reinforces** visible feedback; it is never the only signal (accessibility).
- The mute switch must keep working: never create another `AudioContext` or play audio outside `sound.ts`.
- No hover sounds in dense UI; no sounds on load.
- One meaning = one cue across the whole space.
- New action ⇒ new row in §5.
