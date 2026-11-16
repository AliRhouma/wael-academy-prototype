# Onboarding UI craft — components, micro-interactions and visual tips

First-launch flow of the Wael Academy élève app: **splash → Wael's welcome → level (+ section from 2ème) → favourite subject → 3-question mini-game → result → sign-up (phone + OTP)**. Arabic RTL, Tunisian derja, students 15–19.

This file collects UI craft from Dribbble, Pinterest, Mobbin, case studies and official docs (Apple HIG, Material, Android, web.dev, Rive, LottieFiles). Every tip ends with a **Wael fit:** line that maps it onto the two skills: `wael-design-system-soft` (the brand) and `wael-gamified` (the `play` skin: lips, 2 px outlines, one lime moment, colour as state, chunky progress, stamps, one burst, a character in empty states, sound on the same frame). When a tip goes against the skin, the line says so and says what to do instead. Conflicts are collected in the last section.

> Scope note: the élève space types everything in **Cairo** (`--ui-display` / `--ui-sans`, `src/styles/fonts.css`) and uses the `v2` tokens (`--v2-ink` #172e5b, `--v2-brand` #0491a5, `--v2-cta` #8aff6b), not the soft system's Cause/Rubik. Onboarding sits beside the door screens (`/connexion`, `/inscription`), so it should use the same v2 tokens and `play` hooks and stamp `data-space="v2"` on its root, the same way the portaled sheets do, so the skin's rules reach it.

---

## Top 15 UI moves for this flow

1. **Play first, sign up last.** Ask for the account only after the result, as "save your score". Duolingo moved sign-up behind the first lesson and reports about a 20 % DAU gain ([First Round](https://review.firstround.com/the-tenets-of-a-b-testing-from-duolingos-master-growth-hacker/)).
2. **Keep the splash under 1 s: logo only, no loading bar, skipped on later launches.** Android recommends that splash animations stay at or under 1 000 ms ([Android](https://developer.android.com/guide/topics/ui/splash-screen)).
3. **Wael enters once with a spring, then only reacts.** Each step has its own pose, and his eyes follow the card the student taps.
4. **Wael changes into the outfit of the subject the student picks.** It is the flow's surprise, and it puts the character on screen exactly where the skill allows one: when a matière is in context.
5. **Use tiles, not a form.** A 2×2 level grid, section tiles with glyphs that open in place under the chosen level, and the existing subject badges in a 3-column grid. No dropdowns, no radio buttons.
6. **Advance on tap for single choices, after a 300 ms selected beat.** Keep a visible back button; in RTL its arrow points right.
7. **Use one chunky progress bar for the whole flow:** 12 px, striped, filling from right to left, in three named phases (« ⁧إنت⁩ » · « ⁧المادة⁩ » · « ⁧اللعبة⁩ »).
8. **Make the question card flat and the answers pressable tiles of at least 56 px.** Tapping an answer commits it; there is no separate "Check" step.
9. **Show right and wrong on the same frame as the sound.** A right answer turns lime, its tick pops and `success` plays. A wrong answer greys, shakes and plays `error`, and the right answer is revealed in lime.
10. **Let the student set the pace from one feedback bar** with a single lime « ⁧الجاي⁩ ». No timer and no streak.
11. **Reveal the result as a big `Num` « 2/3 »** with three answer plates, one `Burst` from the score and Wael's reaction pose. No stars, no XP.
12. **Turn the result into a sign-up bridge:** a 3-node ladder whose locked 4th node shakes and explains what is behind it.
13. **On the sign-up screen, show what they keep** (level, subject with Wael, score) and lead with the phone field: a fixed +216 prefix and formatting as they type (« 29 340 118 »).
14. **Build the OTP as one real input drawn as 6 LTR boxes.** It takes `autocomplete="one-time-code"`, a paste fills every box, the resend countdown is written out in words, and an error clears the boxes and refocuses the first.
15. **Make "later" a quiet text button that keeps the session's result.** No guilt copy, no nag.

---

## 1. Splash and first impression

![Splash: a bird mark resolves into the wordmark on white](img/ui-1.png "A logo-only splash: the mark draws in, then the wordmark settles. One idea, under a second — MATEEFFECTS, [Splash screen animation](https://dribbble.com/shots/26625802-Splash-screen-animation) (Dribbble)")
![Illustrated splash with the mascot and one CTA](img/ui-2.png "An illustrated splash that is really the welcome screen: mascot, one line, one CTA — Asib Iquebal, [Gamified Language Learning App — Splash Screen UI](https://dribbble.com/shots/27624272-Gamified-Language-Learning-App-Splash-Screen-UI) (Dribbble)")

- **Keep the splash short and quiet.** Android's SplashScreen API puts the icon on a flat background and recommends animations of 1 000 ms or less ([Android](https://developer.android.com/guide/topics/ui/splash-screen)). Apple goes further: a launch screen is not a place for branding, and it should look like the first screen ([HIG Launching](https://developer.apple.com/design/human-interface-guidelines/launching)). For a web app or PWA, the system splash comes from the manifest (`background_color` plus the icon), so the in-app part is just the move from logo to Wael.
  - **Wael fit:** a white `--v2-surface` ground, the logo, and a single 240 ms `.rise` of the wordmark. Then cut straight to Wael's welcome. Total time on screen is about 600–900 ms, and nothing loops.
- **No fake loading bar.** The prototype has no network and the real app's first screen is local, so a bar would only be acting. Rule 9 of the skill bans "fake loading" outright.
  - **Wael fit:** if a real wait ever exists (fetching the programme's questions), use the 12 px `.v2-bar` with real progress, never a spinner.
- **Animate the logo once, as an entrance, never as a loop.** Draw the mark in (an SVG stroke over about 400 ms), let the wordmark rise, and stop. A splash that plays on every launch gets tiring by the third day.
  - **Wael fit:** only on the very first launch, stored in the onboarding state. Later launches open straight on the app. Under `prefers-reduced-motion` the logo just appears.
- **Make the welcome screen the real first impression.** Tip 2 in the gallery shows the stronger pattern: the "splash" is the welcome, with the character, one sentence and one button.
  - **Wael fit:** the welcome is a full screen with Wael, one bubble (« ⁧أهلا! أنا وائل. في دقيقتين نعرفو مستواك ونلعبو شوية⁩. ») and one lime CTA, « ⁧يلّا نبداو⁩ ». This is the screen's only lime moment.

---

## 2. The mascot — Wael

![Mascot jumps in on a night-sky card](img/ui-3.png "A mascot entrance with squash on landing and a few sparkles — one beat, then the UI takes over — Jagdev Soni, [Mascot Onboarding Animation](https://dribbble.com/shots/27664698-Mascot-Onboarding-Animation) (Dribbble)")
![Six expressions of one round mascot](img/ui-4.png "An expression sheet: angry, happy, content, cheeky, nervous, unimpressed — one face, six states, keyed to onboarding steps — Noah Jacobus, [Onboarding Mascots](https://dribbble.com/shots/2781684-Onboarding-Mascots) (Dribbble)")
![Monkey mascot built in Rive with speech bubbles](img/ui-5.png "An interactive Rive mascot: bubbles carry the words, the body carries the mood — Mahda Motion, [Monkey Translator — Interactive Rive Mascot](https://dribbble.com/shots/27798847-Monkey-Translator-Interactive-Rive-Mascot) (Dribbble)")
![Robot character centred, segmented progress on top, one CTA](img/ui-6.png "Character in the visual centre, segmented progress at the top, a single dark CTA at the thumb — Nixtio, [Animated Onboarding Flow — AI Language Learning App](https://dribbble.com/shots/27424578-Animated-Onboarding-Flow-AI-Language-Learning-App) (Dribbble)")

- **Place Wael in the upper third and keep the thumb zone for choices.** On a 390 × 844 phone the reliable layout is Wael at 112–140 px near the top, his bubble beside him on the reading side, and the tiles and CTA in the bottom half. Duolingo's onboarding uses the same split: Duo small at the top, the choices below ([GoodUX](https://goodux.appcues.com/blog/duolingo-user-onboarding)).
  - **Wael fit:** the size matches `PanelEmpty`'s character (112–128 px). In RTL the bubble sits on the **left** of Wael, with its tail pointing right toward him, because his face is where reading starts.
- **One pose per step, chosen for what the step asks.** Welcome: waving. Level: curious, head tilted. Section: nodding. Subject: dressed for the matière. Question: focused. Right answer: fist up. Wrong answer: an encouraging shrug. Result: proud. A pose sheet like gallery tip 4 is the brief to give the illustrator.
  - **Wael fit:** the skill says **there is no neutral Wael**: every portrait is dressed for a matière, and a neutral Wael is listed as "to commission". Splash, welcome, level and section therefore need that commission, or they use the logo and the matière glyphs until the subject is picked. *Conflicts with the skill as it stands*: see the last section.
- **Wael reacts to the choice; the choice doesn't wait for Wael.** Tap a tile and, on the same frame, Wael's eyes turn to it. The bubble updates 120 ms later (« ⁧باك؟ عام كبير. نعاونوك⁩. »). Make the bubble a reaction to the tap, not a gate in front of it.
  - **Wael fit:** the eyes pipeline already makes Wael's eyes follow the pointer (`wael-subject-eyes`, `Eyes.tsx`). Point the gaze at the selected tile's rect instead of the cursor. Never add an extra tap just to dismiss Wael.
- **Pop the bubble in; don't type it out.** A typewriter effect reads as "wait for me". If you use one, run it at about 40 characters per second with tap-to-finish, and keep each bubble to one line of 30–50 characters.
  - **Wael fit:** the skin allows nothing to animate on mount except `.rise`, and Wael never "speaks". Show the bubble with `v2-pop` (scale .6 → 1.15 → 1, 320 ms), with its text already in place. A typewriter needs a written skin amendment.
- **Lip-sync only when he really talks.** Duolingo's characters use one mouth shape (viseme) per sound, driven by Rive state machines, but only because the audio is real ([Duolingo blog](https://blog.duolingo.com/world-character-visemes), [Rive × Duolingo](https://rive.app/blog/creative-technologists-duolingo-s-solution-to-the-designer-to-developer-handoff)). Silent text with a moving mouth looks broken.
  - **Wael fit:** skip it. The face belongs to the eyes pipeline, and the skill lists eye expressions as out of scope.
- **Idle: blink, don't bob.** An idle loop (breathing, floating) pulls the eye away from the choices. A single blink or glance every few seconds feels alive without distracting.
  - **Wael fit:** rule 13 says nothing loops except the live halo, so even a blink loop needs an amendment. In-system alternatives: the eyes following the finger (reactive, not a loop) and the `.v2-squash` when Wael himself is tapped.

---

## 3. Choice screens — level, section, subject

![Three big level pills with illustrations and a check on the selected one](img/ui-7.png "Level as three big illustrated pills; the selected one carries a check badge; next step keeps a step counter 2/8 — Kumaravel, [Assessment Level Selection](https://dribbble.com/shots/5992583-Assessment-Level-Selection) (Dribbble)")
![Three difficulty cards, the middle one lifted and coloured](img/ui-8.png "Three columns, the selected card lifts and takes the accent; the others stay quiet — Rahul Chakraborty, [Difficulty Level Selection Interface](https://dribbble.com/shots/2644775-Difficulty-Level-Selection-Interface) (Dribbble)")
![Role tiles with illustrations, then a chip cloud of interests](img/ui-9.png "Single choice as illustrated tiles, multi choice as a chip cloud with + and ✕ — two input types, two shapes — shahzaib jugwal, [Onboarding Interest Selection Screen](https://dribbble.com/shots/24767729-Onboarding-Interest-Selection-Screen) (Dribbble)")
![Icon tiles with check badges and a step counter](img/ui-10.png "Icon + label tiles, a check badge in the corner of the chosen ones, step counter 2/3 in the header — Mironshoh, [Onboarding Preferences | Interest Selection](https://dribbble.com/shots/25855383-Onboarding-Preferences-Interest-Selection) (Dribbble)")

- **Level: four big tiles, with the number as the hero.** « 1 ⁧أولى⁩ » · « 2 ⁧ثانية⁩ » · « 3 ⁧ثالثة⁩ » · « ⁧باك⁩ », in a 2×2 grid on the phone and a row of 4 from `md`. A big number at 900 weight is faster to scan than words (gallery tips 7–8).
  - **Wael fit:** each one is a `tileClass` button (2 px border, 3 px lip). The chosen one turns lime with its 4 px `--v2-edge-cta` lip and navy text: the screen's one lime moment. Digits go in `<bdi dir="ltr">`, `data-uisfx="select"`.
- **Section: open it in place, under the level, rather than on a new screen.** Picking 2ème, 3ème or Bac folds the level grid into a summary chip (« ⁧ثانية ثانوي · بدّل⁩ ») and lets the section tiles `.rise` underneath. That makes it one question with a follow-up, not a form with two fields.
  - **Wael fit:** the chip becomes a `.v2-btn` (white, so the lime moves to the section). The tiles take the seed names: 2ème has 4 (⁧علوم · آداب · اقتصاد وخدمات · إعلامية⁩), and 3ème and Bac list 6 in `years.json` (⁧رياضيات · علوم تجريبية · اقتصاد وتصرّف · آداب · علوم تقنية · علوم إعلامية⁩). **The official seventh, ⁧رياضة⁩, is missing from the seed**: add it or decide to leave it out. Fold and unfold play `expand` / `collapse`.
- **Make seven sections feel like a set, not a form.** Use a 2-column grid of tiles, each with a 40 px glyph plate, a two-word label and no helper text. Order them by size of population, not alphabetically: in 2026, économie-gestion had the most Bac candidates, then sciences expérimentales, then lettres ([AllAfrica](https://fr.allafrica.com/stories/202606010670.html)). If the count is odd, the last tile spans both columns.
  - **Wael fit:** a `.v2-plate`-style 40 px glyph square with lucide icons (Sigma, FlaskConical, Cog, Code, ChartLine, BookOpen, Dumbbell). The plates stay in ink and brand tones; colour belongs to state, so don't give each section its own hue.
- **Subject: reuse the matière badges, eyes and all.** The prototype already has a character badge per subject (`subjects.tsx`), and its eyes follow the pointer. A grid of those badges, filtered to the chosen level and section, is the most on-brand picker possible. Picking one is the moment Wael changes outfit.
  - **Wael fit:** the badge sits in a `tileClass` tile with `--v2-lip = subjectTint().dot` (the existing subject card recipe) and does the `.v2-squash` on press. The chosen tile turns lime. Plays `select`.
- **Tap-to-advance or a Continue button?** For a **single** choice that is cheap to undo, advance on tap: hold the selected state for about 300 ms so the student sees the choice register, then slide on. For a **multi** choice, show a Continue button. All three questions here are single-choice, so none needs a button, and the screen's lime stays on the selected tile.
  - **Wael fit:** the 300 ms beat covers the 80 ms press, the 180 ms spring and a short hold. The step move plays `forward`. Back (top start, arrow pointing right) plays `back` and restores the previous selection.
- **Selected state: change at least two things, and colour can't be the only one.** Fill, lip and a corner check plate (gallery tips 7 and 10). Students in a sunny schoolyard won't read a tint change alone.
  - **Wael fit:** lime fill + 4 px lip + a 24 px `.v2-tick` that pops in 320 ms. Set `aria-pressed="true"` on the tile.

<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800;900&display=swap" rel="stylesheet">
<figure style="margin:16px 0;padding:18px;background:#f6faf3;border:2px solid rgb(23 46 91/.12);border-radius:16px">
<div style="display:flex;flex-wrap:wrap;gap:18px;justify-content:center;font-family:Cairo,system-ui,sans-serif;color:#172e5b" dir="rtl">
<div style="width:300px;background:#fff;border:2px solid rgb(23 46 91/.15);border-radius:24px;padding:16px">
<div style="display:flex;align-items:center;gap:10px"><span style="width:40px;height:40px;border-radius:12px;border:2px solid rgb(23 46 91/.15);display:grid;place-items:center;font-weight:800;font-size:18px">&#8594;</span><div style="flex:1;height:12px;border-radius:99px;background:rgb(23 46 91/.10);overflow:hidden;display:flex;justify-content:flex-start"><div style="width:30%;background:#8aff6b repeating-linear-gradient(-45deg,rgb(255 255 255/.35) 0 6px,transparent 6px 12px);border-radius:99px"></div></div></div>
<div style="display:flex;align-items:flex-start;gap:10px;margin:16px 0 12px"><div style="width:56px;height:56px;border-radius:50%;background:#0491a5;flex:none;display:grid;place-items:center;color:#fff;font-weight:800;font-size:12px">وائل</div><div style="background:#fff;border:2px solid rgb(23 46 91/.15);border-radius:16px;padding:8px 12px;font-weight:700;font-size:14px">في أمّا سنة تقرا؟</div></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding-bottom:4px">
<div style="background:#fff;border:2px solid rgb(23 46 91/.15);box-shadow:0 3px 0 rgb(23 46 91/.14);border-radius:16px;padding:12px;text-align:center"><div style="font-weight:900;font-size:30px;line-height:1"><bdi dir="ltr">1</bdi></div><div style="font-weight:700;font-size:13px">أولى</div></div>
<div style="background:#8aff6b;border:2px solid #5bcd3f;box-shadow:0 4px 0 #5bcd3f;border-radius:16px;padding:12px;text-align:center;position:relative"><span style="position:absolute;top:-8px;left:-8px;width:24px;height:24px;border-radius:8px;background:#fff;border:2px solid #5bcd3f;display:grid;place-items:center;font-size:13px;font-weight:900">&#10003;</span><div style="font-weight:900;font-size:30px;line-height:1"><bdi dir="ltr">2</bdi></div><div style="font-weight:800;font-size:13px">ثانية</div></div>
<div style="background:#fff;border:2px solid rgb(23 46 91/.15);box-shadow:0 3px 0 rgb(23 46 91/.14);border-radius:16px;padding:12px;text-align:center"><div style="font-weight:900;font-size:30px;line-height:1"><bdi dir="ltr">3</bdi></div><div style="font-weight:700;font-size:13px">ثالثة</div></div>
<div style="background:#fff;border:2px solid rgb(23 46 91/.15);box-shadow:0 3px 0 rgb(23 46 91/.14);border-radius:16px;padding:12px;text-align:center"><div style="font-weight:900;font-size:26px;line-height:1.15">باك</div><div style="font-weight:700;font-size:13px">الباكالوريا</div></div>
</div>
</div>
<div style="width:300px;background:#fff;border:2px solid rgb(23 46 91/.15);border-radius:24px;padding:16px">
<div style="display:flex;align-items:center;gap:10px"><span style="width:40px;height:40px;border-radius:12px;border:2px solid rgb(23 46 91/.15);display:grid;place-items:center;font-weight:800;font-size:18px">&#8594;</span><div style="flex:1;height:12px;border-radius:99px;background:rgb(23 46 91/.10);overflow:hidden;display:flex;justify-content:flex-start"><div style="width:45%;background:#8aff6b repeating-linear-gradient(-45deg,rgb(255 255 255/.35) 0 6px,transparent 6px 12px);border-radius:99px"></div></div></div>
<div style="margin:14px 0 10px;display:inline-flex;gap:8px;align-items:center;background:#fff;border:2px solid rgb(23 46 91/.15);box-shadow:0 3px 0 rgb(23 46 91/.14);border-radius:99px;padding:6px 14px;font-weight:700;font-size:13px">ثانية ثانوي <span style="color:#036b7a">· بدّل</span></div>
<div style="font-weight:800;font-size:15px;margin-bottom:10px">و أمّا شعبة؟</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding-bottom:4px">
<div style="background:#8aff6b;border:2px solid #5bcd3f;box-shadow:0 4px 0 #5bcd3f;border-radius:16px;padding:10px;display:flex;gap:8px;align-items:center"><span style="width:32px;height:32px;border-radius:10px;background:#172e5b;color:#8aff6b;display:grid;place-items:center;font-weight:900">&#9879;</span><b style="font-size:13px;font-weight:800">علوم</b></div>
<div style="background:#fff;border:2px solid rgb(23 46 91/.15);box-shadow:0 3px 0 rgb(23 46 91/.14);border-radius:16px;padding:10px;display:flex;gap:8px;align-items:center"><span style="width:32px;height:32px;border-radius:10px;background:rgb(4 145 165/.12);color:#036b7a;display:grid;place-items:center;font-weight:900">&#1571;</span><b style="font-size:13px">آداب</b></div>
<div style="background:#fff;border:2px solid rgb(23 46 91/.15);box-shadow:0 3px 0 rgb(23 46 91/.14);border-radius:16px;padding:10px;display:flex;gap:8px;align-items:center"><span style="width:32px;height:32px;border-radius:10px;background:rgb(4 145 165/.12);color:#036b7a;display:grid;place-items:center;font-weight:900">%</span><b style="font-size:13px">اقتصاد وخدمات</b></div>
<div style="background:#fff;border:2px solid rgb(23 46 91/.15);box-shadow:0 3px 0 rgb(23 46 91/.14);border-radius:16px;padding:10px;display:flex;gap:8px;align-items:center"><span style="width:32px;height:32px;border-radius:10px;background:rgb(4 145 165/.12);color:#036b7a;display:grid;place-items:center;font-weight:900;font-size:12px" dir="ltr">&lt;/&gt;</span><b style="font-size:13px">إعلامية</b></div>
</div>
</div>
</div>
<figcaption style="text-align:center">Mockup (drawn for this doc): the level picker as a 2×2 grid, then the same screen once 2ème is chosen. The level folds into a summary chip and the sections rise underneath. One lime tile per state, a 12 px striped bar filling from the right, and a back arrow pointing right (RTL).</figcaption>
</figure>

---

## 4. Progress through onboarding

![Kids app onboarding beside a winding map with done nodes and a door](img/ui-11.png "Onboarding that already looks like the game: a winding path of done nodes leading to a door — Mahima Mahajan, [Kids Bank App, Onboarding & Gamified Learning Map](https://dribbble.com/shots/27331734-Kids-Bank-App-Onboarding-Gamified-Learning-Map) (Dribbble)")
![Duolingo-like onboarding with a thin top bar and the mascot asking questions](img/ui-12.png "A progress bar at the top that grows per question, mascot + bubble asking, full-width option rows, one CONTINUE — Victoria Nduka, [Duolingo Onboarding Flow Redesign](https://dribbble.com/shots/25157600-Duolingo-Onboarding-Flow-Redesign) (Dribbble)")

- **Use a bar, not dots.** Dots suit 3–5 equal steps you can swipe through. This flow has steps of different weight (one tap versus three questions), so one continuous bar that grows by phase is clearer (gallery tip 12).
  - **Wael fit:** a `.v2-bar` (12 px, lime fill, inset stripe, width transition 500 ms) under the back button. Use real fractions only: level 1/6, section 2/6, subject 3/6, then questions 4–6. Never pad it.
- **In RTL the bar fills from right to left.** Apple: flip "controls that show progress from one value to another" ([HIG Right to left](https://developer.apple.com/design/human-interface-guidelines/right-to-left)).
  - **Wael fit:** under `dir="rtl"` a flex track with the fill as its first child already starts at the right. Never set a hardcoded `left: 0`.
- **During the game, show the answers in the bar.** Three segments, one per question, coloured by outcome after each answer: lime for right, grey for missed. The student sees their score building without a separate counter.
  - **Wael fit:** colour as state: lime = done and right, grey = past and missed. Segments are 12 px with 4 px gaps. The segment that fills plays its 500 ms width transition on the same frame as `success` / `error`.
- **Save the map for the end.** A path is great storytelling (gallery tip 11), but a map for 6 steps is ceremony. Spend it on the result screen, where a 3-node ladder with a locked 4th node points to "the rest" (section 6).
  - **Wael fit:** reuse `.v2-ladder` with `data-state` (`done` / `current` / `locked`). The locked node is dashed, ink/50, and shakes with `blocked`.
- **Name the phases, not the numbers.** "Step 4 of 9" invites them to count how much is left. Three short labels under the bar (« ⁧إنت⁩ » · « ⁧المادة⁩ » · « ⁧اللعبة⁩ ») say what is coming.
  - **Wael fit:** labels at 700 weight, `text-v2-ink/60`. The current phase goes to 800 and full ink. No chips: they would be a second lime candidate.

---

## 5. The mini-game

![Tactile quiz with coloured answer bars standing on lips](img/ui-13.png "Answers as chunky coloured bars standing on a darker lip, a check/✕ in the bar, a thick progress line and score on top — sleek.design, [Brainwave · Quiz App UI](https://dribbble.com/shots/27655784-Brainwave-Quiz-App-UI) (Dribbble)")
![Quiz with a countdown ring and a 2×2 grid of answers](img/ui-14.png "Countdown ring + 2×2 icon answers — the pattern we skip (timer), shown for contrast — Ronas IT, [Quiz App Mobile Design](https://dribbble.com/shots/14012432-Quiz-App-Mobile-Design) (Dribbble)")
![Two flash cards: success and oops](img/ui-15.png "Right/wrong as full flash cards with a character reacting and one button each (next / retry) — Rana Shazar Sarkhall, [Flash Messages for a Kids' Quiz App](https://dribbble.com/shots/26578558-Daily-UI-Challenge-011-Flash-Messages-for-a-Kids-Quiz-App) (Dribbble)")
![Quiz with a 'Not quite' card that explains why](img/ui-16.png "Wrong answer as 'Not quite' + why the answer missed + review/try again; the end card says '4 of 5 answers correct' — Xmethod, [Quiz Learning App UI Design](https://dribbble.com/shots/27637286-Quiz-Learning-App-UI-Design) (Dribbble)")
![A sheep character with a graduation cap reacting](img/ui-17.png "A character that reacts to right or wrong — the body does the feedback, the UI stays calm — Henrique Rossatto, [Right or wrong answer?](https://dribbble.com/shots/4310657-Right-or-wrong-answer) (Dribbble)")
![Trivia question with a row of past-answer marks on top](img/ui-18.png "A row of answer marks at the top (green/red/blank) — the score as a track; full-width answer bars below — Pat Johnson for Brightscout, via [Pinterest pin](https://www.pinterest.com/pin/689824867899775082/)")

- **Question card at the top, answers at the thumb.** The question sits in a flat card at the top: the counter « 1/3 », the subject chip, the question at 18–20 px/800. The 2–4 answers are stacked as full-width tiles in the bottom half. Use a 2×2 grid only for very short answers (numbers, one word).
  - **Wael fit:** the question card is a `.v2-panel` (flat, 2 px border). Answers are `tileClass` tiles, at least 56 px high, labelled ⁧أ · ب · ج · د⁩ in a 28 px plate at the start edge. Wael (focused pose, about 72 px) sits beside the counter, not in the answer area.
- **Tapping an answer commits it.** Duolingo's flow (select, then "Check") is good when answers take building. For single-choice MCQs it adds a tap and a moment of doubt. With 3 questions, commit on tap and give the student the pace afterwards (the next tip).
  - **Wael fit:** the press is the shared 80/180 ms lip collapse. Feedback lands on release, on the same frame as the cue.
- **Right answer: lime, tick pop, sound, all on one frame.** The tile turns lime with its 4 px lip, a 24 px tick plate pops (320 ms), `success` plays, and Wael switches to the fist-up pose.
  - **Wael fit:** lime here means "done and right", which is exactly its meaning in the skin. `sfx("success")` goes in the same handler that sets the state. No burst: the one burst is saved for the result.
- **Wrong answer: grey, shake, then reveal the right one.** The chosen tile shakes (±4 px, 320 ms) and settles grey with a ✕ plate, `error` plays, and **the right answer turns lime at the same moment** so nobody is left guessing (gallery tip 16 explains why; tip 15 makes "oops" a full card).
  - **Wael fit:** the skin keeps red for "live" (rule 7), so the wrong tile goes to **grey = past** (ink/50, no lip) rather than red. That is in-system and still readable thanks to the shake, the ✕ and the wording. A red "wrong" needs a skin amendment: a derived `--v2-wrong` built from `--v2-live-soft`. *Flagged as a conflict.*
- **Explain in one line, then hand over the pace.** A feedback bar slides up from the bottom with a one-line verdict (« ⁧برافو⁩! » or « ⁧قريب… الجواب الصحيح: ب⁩ ») and one lime « ⁧الجاي⁩ ». Never auto-advance after a wrong answer: the student needs a second to read the right one.
  - **Wael fit:** the feedback bar is a flat `.v2-panel` pinned above the safe area (`pb-safe`), with `.v2-cta` as the screen's single lime action. That CTA appears in the frame **after** the answer tile has settled, so two limes never compete at once. `forward` on tap. At most one exclamation mark per screen.
- **No timer, no streak, no combo.** A countdown turns a diagnostic into a test and punishes slow readers (gallery tip 14 shows the pattern for contrast). A streak in a 3-question game is noise.
  - **Wael fit:** both are banned in the skin (rule 21: no streaks, no timers beyond the real séance clock). To build momentum, use Wael's poses instead: an extra-proud pose on a second right answer in a row is a reaction, not a mechanic.
- **Move between questions with a 280 ms slide, in the reading direction.** The answered card leaves toward the end side, the next one enters from the start side (from the left in RTL), and its tiles `.rise` 40 ms apart.
  - **Wael fit:** an exit of 200 ms `cubic-bezier(.3,0,.8,.15)` and an entry of 280 ms `cubic-bezier(.05,.7,.1,1)` (M3 emphasized accelerate / decelerate). Under reduced motion, a 120 ms crossfade.
- **Keep formulas left-to-right inside the right-to-left card.** Math from the programme (« ⁧حل المعادلة⁩ x² − 5x + 6 = 0 ») must read left-to-right inside the RTL card.
  - **Wael fit:** wrap formulas in `<bdi dir="ltr">`. If KaTeX is needed, it is a capability library that CLAUDE.md allows. Western digits throughout.

<figure style="margin:16px 0;padding:18px;background:#f6faf3;border:2px solid rgb(23 46 91/.12);border-radius:16px">
<div style="display:flex;flex-wrap:wrap;gap:14px;justify-content:center;font-family:Cairo,system-ui,sans-serif;color:#172e5b" dir="rtl">
<div style="width:200px"><div style="font-size:11px;font-weight:800;letter-spacing:0;color:rgb(23 46 91/.6);margin-bottom:6px">عادي · idle</div><div style="background:#fff;border:2px solid rgb(23 46 91/.15);box-shadow:0 3px 0 rgb(23 46 91/.14);border-radius:16px;min-height:56px;padding:10px 12px;display:flex;align-items:center;gap:10px;font-weight:700;font-size:15px"><span style="width:28px;height:28px;border-radius:9px;border:2px solid rgb(23 46 91/.15);display:grid;place-items:center;font-weight:800;font-size:13px">ب</span><bdi dir="ltr">S = {2 ; 3}</bdi></div></div>
<div style="width:200px"><div style="font-size:11px;font-weight:800;color:rgb(23 46 91/.6);margin-bottom:6px">مضغوط · pressed (80 ms)</div><div style="background:#fff;border:2px solid rgb(23 46 91/.15);box-shadow:0 0 0 rgb(23 46 91/.14);transform:translateY(3px);border-radius:16px;min-height:56px;padding:10px 12px;display:flex;align-items:center;gap:10px;font-weight:700;font-size:15px"><span style="width:28px;height:28px;border-radius:9px;border:2px solid rgb(23 46 91/.15);display:grid;place-items:center;font-weight:800;font-size:13px">ب</span><bdi dir="ltr">S = {2 ; 3}</bdi></div></div>
<div style="width:200px"><div style="font-size:11px;font-weight:800;color:rgb(23 46 91/.6);margin-bottom:6px">صحيح · correct + success</div><div style="background:#8aff6b;border:2px solid #5bcd3f;box-shadow:0 4px 0 #5bcd3f;border-radius:16px;min-height:56px;padding:10px 12px;display:flex;align-items:center;gap:10px;font-weight:800;font-size:15px"><span style="width:28px;height:28px;border-radius:9px;background:#fff;border:2px solid #5bcd3f;display:grid;place-items:center;font-weight:900;font-size:14px">&#10003;</span><bdi dir="ltr">S = {2 ; 3}</bdi></div></div>
<div style="width:200px"><div style="font-size:11px;font-weight:800;color:rgb(23 46 91/.6);margin-bottom:6px">غالط · wrong, in-system (grey + shake + error)</div><div style="background:#fff;border:2px solid rgb(23 46 91/.10);border-radius:16px;min-height:56px;padding:10px 12px;display:flex;align-items:center;gap:10px;font-weight:700;font-size:15px;color:rgb(23 46 91/.5)"><span style="width:28px;height:28px;border-radius:9px;background:rgb(23 46 91/.08);display:grid;place-items:center;font-weight:900;font-size:13px">&#10005;</span><bdi dir="ltr">S = {−2 ; −3}</bdi></div></div>
<div style="width:200px"><div style="font-size:11px;font-weight:800;color:rgb(23 46 91/.6);margin-bottom:6px">غالط · wrong, needs an amendment (red)</div><div style="background:#ffe2e2;border:2px solid #ff3b3e;box-shadow:0 3px 0 #c92c2f;border-radius:16px;min-height:56px;padding:10px 12px;display:flex;align-items:center;gap:10px;font-weight:700;font-size:15px"><span style="width:28px;height:28px;border-radius:9px;background:#fff;border:2px solid #ff3b3e;color:#c8191c;display:grid;place-items:center;font-weight:900;font-size:13px">&#10005;</span><bdi dir="ltr">S = {−2 ; −3}</bdi></div></div>
</div>
<div style="max-width:420px;margin:16px auto 0;font-family:Cairo,system-ui,sans-serif;color:#172e5b;background:#fff;border:2px solid rgb(23 46 91/.15);border-radius:20px;padding:12px 14px;display:flex;align-items:center;gap:12px" dir="rtl"><div style="flex:1"><div style="font-weight:800;font-size:15px">قريب… الجواب الصحيح: ب</div><div style="font-size:12px;color:rgb(23 46 91/.6)"><bdi dir="ltr">Δ = 1</bdi> · <bdi dir="ltr">S = {2 ; 3}</bdi></div></div><span style="background:#8aff6b;border-radius:99px;box-shadow:0 4px 0 #5bcd3f;padding:10px 22px;font-weight:800;font-size:15px">الجاي</span></div>
<figcaption style="text-align:center">Mockup (drawn for this doc): the answer tile's states in the play skin, then the feedback bar. Grey is the in-system "wrong". Red uses the existing <code>--v2-live-soft</code> / <code>--v2-live</code> / <code>--v2-edge-live</code> values but breaks rule 7 ("red only when live"), so it needs a skin amendment.</figcaption>
</figure>

---

## 6. The result / reward screen

![Duolingo match-complete: mascot, title, two stat cards, one CTA](img/ui-19.png "Mascot bounces in, a title, small stat cards that count up, one full-width CTA — Duolingo's match-complete screen, via [Pinterest pin](https://www.pinterest.com/pin/1110770695647955183/)")
![Result card with a trophy and score stats](img/ui-20.png "Score and two stats under a trophy, a CTA to continue — Ajeet Gautam, [Quiz Result](https://dribbble.com/shots/9002324-Quiz-Result) (Dribbble)")

- **Reveal the score in a short sequence, about 1.2 s end to end.** Wael's proud pose lands (spring, 420 ms). The big « 2/3 » rolls up (300 ms). The three answer plates pop one by one, 120 ms apart. A single burst fires from the number. Then the CTA rises. Duolingo uses the same order: character, title, stats counting up, one button (gallery tip 19).
  - **Wael fit:** `Num` for the score (it rolls on change only, so set 0 first, then the real value), `v2-pop` for the plates, one `Burst` (16 particles, 620 ms, gone by 700) from the number with `achievement`, and `.rise` for the CTA. The next action never waits for the burst to finish.
- **Show the plain score, not stars or rings.** Three stars for three questions only restate the score with an invented rating. « ⁧جبت 2 من⁩ 3 » plus three plates (lime ✓ / grey ✕) is honest and reads at a glance.
  - **Wael fit:** XP, points and levels are banned. If a visual is wanted, a stroke-10 ring filling to 2/3 is in-system (`Ring`), but the plates already carry it. Stars: *skip (conflict)*.
- **One burst, from where the score was earned, never full-screen confetti.** Full-screen confetti is a party for everything and so for nothing. A small burst from the score says "this number".
  - **Wael fit:** rule 11 allows one celebration per screen visit, and only for a real completion. Finishing the 3 questions is real session data, so `Burst` + `achievement` fit (not `reward` or `level-up`, which are banned). Decide whether 0/3 also earns it: recommended yes, because the completion is real. Wael's pose and the wording change with the score; the burst does not.
- **Let Wael's reaction follow the score, warmly at every score.** 3/3 « ⁧هكّا! إنت جاهز للباك⁩ » · 2/3 « ⁧باهي برشا — قريب للكمال⁩ » · 1/3 « ⁧بداية مليحة، نخدمو عليها مع بعض⁩ » · 0/3 « ⁧عادي، هاذي بالضبط علاش موجودين⁩ ». Never mock, never "don't lose it".
  - **Wael fit:** the tone rules: second person, verbs first, at most one exclamation mark, no guilt framing.
- **Make sharing quiet and optional.** A small icon button (share) at the top end, which opens the native share sheet (`navigator.share`) with a generated card: Wael in the subject outfit plus the score. Teens share screenshots anyway, so give them a card worth sharing.
  - **Wael fit:** `iconBtnClass` (flat in both skins) plays `open`. The share card can reuse the existing `.v2-stamp` look (« ⁧جبت 2 من⁩ 3 », tilted −6°). Never a lime button: the lime belongs to the save CTA.
- **Make the CTA flow into sign-up: "save", not "register".** The lime CTA reads « ⁧سجّل باش تحفظ نتيجتك⁩ » (save your score), with a ghost « ⁧عاود العب⁩ » (play again) under it. Both lead to sign-up, because replay needs an account. Below the score, a 3-node ladder (✓ ✓ ✕ for the three questions) ends in a dashed, locked 4th node labelled « ⁧باقي البرنامج⁩ ». Tapping it shakes it and explains in one line.
  - **Wael fit:** `.v2-cta` + `.v2-cta-ghost`; `.v2-ladder` with `data-state` for the nodes; the locked node takes `data-locked="true"` + `useShake` + `blocked`. It explains in words and leads to sign-up, not to ⁧العروض⁩, which is the same rule 8 with a different destination.

---

## 7. The sign-up screen that converts

![Create account screen with a log in / sign up segmented tab](img/ui-21.png "Sign-up in a quiz app: a segmented Log in / Sign up switch, three fields, one strong button — Shamiul Alam Limon, [Quiz App UI Design](https://dribbble.com/shots/26402857-Quiz-App-UI-Design) (Dribbble)")
![OTP code shown with copy and expired states](img/ui-22.png "The code's own states: a copy affordance, and an explicit 'This code has expired, request a new one' — Dmitry Sergushkin, [One-Time Password (OTP) Verification UI](https://dribbble.com/shots/25742736-One-Time-Password-OTP-Verification-UI) (Dribbble)")
![Choosing OTP delivery: SMS, WhatsApp, call; phone field with prefix](img/ui-23.png "Delivery choice (email / SMS / WhatsApp / call) and a phone field with a country prefix — relevant where WhatsApp is the default messenger — Indev, [Secure OTP & Verification Step](https://dribbble.com/shots/24872323-Secure-OTP-Verification-Step) (Dribbble)")
![A phone tilted showing a 'Your number' screen](img/ui-24.png "Phone-first sign-up: one field, flag + prefix, the keypad does the rest — Anton Tkachuk, [Sign Up with Phone Number](https://dribbble.com/shots/4470200-Sign-Up-with-Phone-Number) (Dribbble)")
![Airbnb login: phone first, social buttons under 'or'](img/ui-25.png "Phone number first, then 'or' and stacked social buttons (email, Apple, Google, Facebook) — Airbnb onboarding, via [Mobbin](https://mobbin.com/explore/mobile/flows/onboarding)")

- **Start with what they keep.** Above the form, a compact "keep card" shows their level chip, Wael in the chosen subject's outfit and the « 2/3 » with its three plates. Below it, one line: « ⁧سجّل بنومروك وكل هذا يتحفظ⁩ ». This turns sign-up from a toll into the next step of something they already own (Duolingo's "save your progress", [First Round](https://review.firstround.com/the-tenets-of-a-b-testing-from-duolingos-master-growth-hacker/)).
  - **Wael fit:** a flat `.v2-panel` with the subject character at about 72 px (honest: the matière is in context), the score in `Num` (no roll, since it is the first value) and plates as on the result screen. Never write "don't lose…".
- **Phone first, with +216 fixed and live formatting.** One field, `type="tel"`, `inputMode="tel"`, `autocomplete="tel-national"`. The fixed +216 sits at the field's **left** (the number is an LTR string, even in an RTL form). Format as they type into « 29 340 118 » (2-3-3) and accept a pasted « +216 29340118 ». The prototype already normalises this in `auth.ts` (`normalizePhone`).
  - **Wael fit:** the field is `dir="ltr"` inside the RTL form, its label right-aligned above it. 2 px `--v2-line` border, 3 px brand focus ring at 3 px offset (rule 19). Digits are Western.
- **Validate inline, but only once the input is complete.** Show nothing while they type. At 8 digits, check the prefix: Tunisian mobiles start with 2, 4, 5 or 9. If valid, a small lime tick pops at the field's end. If not, one line under the field: « ⁧النومرو هذا ما يظهرش تونسي — ثبّت فيه⁩ ». Don't flash an error on the first keystroke.
  - **Wael fit:** the valid tick is the `.v2-tick` pop + `success`. The invalid line uses `text-v2-ink` with an icon, not red text (red means live). `error` plays only on submit.
- **OTP: one real input, drawn as 6 boxes.** Use a single `<input inputmode="numeric" autocomplete="one-time-code" maxlength="6">` behind 6 visual boxes. That gives SMS autofill on iOS and Android and paste of the whole code for free, and backspace behaves ([web.dev](https://web.dev/articles/sms-otp-form), [Twilio](https://www.twilio.com/en-us/blog/developers/best-practices/otp-input-forms-html)). Auto-submit at the 6th digit, with no "Verify" button needed.
  - **Wael fit:** the boxes are 48 × 56, 2 px border. The active box takes a 3 px teal border and a blinking caret (the caret is the system's, so it isn't a skin loop). Filled boxes go navy 2 px. **The boxes stay LTR**: the first digit is on the left even in RTL ([HIG](https://developer.apple.com/design/human-interface-guidelines/right-to-left): "don't reverse the order of numerals"). `paste` plays on paste and `connect` when the account is made (as the door already does).
- **Write the resend countdown out in words.** « ⁧ما وصلكش الكود؟ تنجم تطلبو مرّة أخرى بعد⁩ 0:42 », which turns into a link « ⁧ابعثهولي مرّة أخرى⁩ » at 0. Never a disabled button with no explanation ([Visa pattern](https://design.visa.com/patterns/one-time-passcode/)). Offer « ⁧بدّل النومرو⁩ » next to the masked number.
  - **Wael fit:** 60 s, which is `RESEND_AFTER_S`, the real API's value. The countdown is `<Num>` in `<bdi dir="ltr">` and plays `send` on resend. The existing « ⁧ما وصلنيش الكود⁩ » escape hatch (`expand`) stays.
- **Wrong code: shake, clear, refocus.** The boxes shake (±4 px, 320 ms), clear, and the first box takes focus. One line explains: « ⁧الكود هذا موش صحيح — جرّب مرّة أخرى⁩ ». An expired code gets its own wording, as in gallery tip 22.
  - **Wael fit:** `useShake` on the box row and `error` on the same frame.
- **Social buttons go second, under « ⁧ولّا⁩ ».** Google (most Tunisian teens have an Android phone and a Gmail), Facebook maybe, and Apple only on iOS. Stack them full-width under the phone CTA (gallery tip 25). Phone stays first because it is the Tunisian identifier and what the academy uses for contact.
  - **Wael fit:** use the providers' own button styles (white or black, their logo). **Don't put the lip on them**: their branding rules forbid restyling, and the lime stays on the phone CTA.
- **"Later" is a quiet text link.** « ⁧مش توّا⁩ » under the buttons. It keeps the session result in memory and moves on, and the save prompt comes back at the next meaningful moment (replaying, opening a lesson), never on a timer. Duolingo keeps soft walls early and a hard wall later ([First Round](https://review.firstround.com/the-tenets-of-a-b-testing-from-duolingos-master-growth-hacker/)).
  - **Wael fit:** a plain text button in `text-v2-ink/70` that plays `close`. Never guilt copy: the skill's "never nagging" applies.

<figure style="margin:16px 0;padding:18px;background:#f6faf3;border:2px solid rgb(23 46 91/.12);border-radius:16px">
<div style="max-width:360px;margin:0 auto;background:#fff;border:2px solid rgb(23 46 91/.15);border-radius:24px;padding:18px;font-family:Cairo,system-ui,sans-serif;color:#172e5b" dir="rtl">
<div style="font-weight:800;font-size:18px;margin-bottom:4px">دخّل الكود اللي وصلك</div>
<div style="font-size:13px;color:rgb(23 46 91/.65);margin-bottom:14px">بعثناه في SMS للنومرو <bdi dir="ltr" style="font-weight:700;color:#172e5b;white-space:nowrap">+216 29 340 118</bdi> · <span style="color:#036b7a;font-weight:700">بدّل</span></div>
<div dir="ltr" style="display:flex;gap:8px;justify-content:center">
<span style="width:46px;height:56px;border-radius:14px;border:2px solid #172e5b;display:grid;place-items:center;font-weight:900;font-size:24px">4</span>
<span style="width:46px;height:56px;border-radius:14px;border:2px solid #172e5b;display:grid;place-items:center;font-weight:900;font-size:24px">8</span>
<span style="width:46px;height:56px;border-radius:14px;border:2px solid #172e5b;display:grid;place-items:center;font-weight:900;font-size:24px">1</span>
<span style="width:46px;height:56px;border-radius:14px;border:3px solid #0491a5;box-shadow:0 0 0 3px rgb(4 145 165/.18);display:grid;place-items:center"><span style="width:2px;height:26px;background:#0491a5"></span></span>
<span style="width:46px;height:56px;border-radius:14px;border:2px solid rgb(23 46 91/.15)"></span>
<span style="width:46px;height:56px;border-radius:14px;border:2px solid rgb(23 46 91/.15)"></span>
</div>
<div style="font-size:13px;color:rgb(23 46 91/.65);margin-top:14px;text-align:center">ما وصلكش؟ تنجم تطلبو مرّة أخرى بعد <bdi dir="ltr" style="font-weight:900;color:#172e5b;font-variant-numeric:tabular-nums">0:42</bdi></div>
<div style="margin-top:16px;border-top:1px solid rgb(23 46 91/.10);padding-top:14px;font-size:12px;color:rgb(23 46 91/.6)">النومرو</div>
<div dir="ltr" style="margin-top:6px;display:flex;align-items:center;gap:8px;border:2px solid rgb(23 46 91/.15);border-radius:14px;padding:0 12px;height:52px"><span style="font-weight:800;color:rgb(23 46 91/.6)">+216</span><span style="width:1px;height:24px;background:rgb(23 46 91/.15)"></span><span style="font-weight:800;font-size:17px;letter-spacing:.02em;flex:1">29 340 118</span><span style="width:24px;height:24px;border-radius:8px;background:#8aff6b;box-shadow:0 2px 0 #5bcd3f;display:grid;place-items:center;font-weight:900;font-size:13px">&#10003;</span></div>
</div>
<figcaption style="text-align:center">Mockup (drawn for this doc): the OTP boxes stay LTR inside an RTL card (3 filled, 1 active with a caret, 2 empty), the resend countdown is written out in words, and below is the phone field with a fixed +216, live 2-3-3 grouping and a valid tick at the field's end.</figcaption>
</figure>

---

## 8. Motion

![Rive state machine overview page](img/ui-26.png "A state machine wires timelines to inputs (hover, pressed, a number, a trigger) — the right tool for a mascot with poses and reactions — [Rive docs, State Machine Overview](https://rive.app/docs/editor/state-machine/state-machine)")

**Durations and easing.** UI motion lives between 100 and 500 ms ([NN/g](https://www.nngroup.com/articles/animation-duration/)). Material 3's tokens run in 50 ms steps, from short1 at 50 ms to long2 at 500 ms ([M3 easing and duration](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs)). Use the skin's values first and M3's for anything the skin doesn't cover:

| Move | Duration | Easing | Source |
|---|---|---|---|
| Press / release (every lip) | 80 ms / 180 ms | linear / `cubic-bezier(.34,1.56,.64,1)` | `play.css` shared block |
| Selected beat before auto-advance | ~300 ms hold | — | this doc |
| Screen enters / leaves | 280 ms / 200 ms | `cubic-bezier(.05,.7,.1,1)` / `cubic-bezier(.3,0,.8,.15)` | M3 emphasized decelerate / accelerate |
| Wael lands (entrance, pose change) | 420 ms | spring, about 15 % overshoot | this doc; `linear()` spring |
| Bubble pop · tick pop · plates | 320 ms | `scale .6 → 1.15 → 1` | `v2-pop` |
| Wrong-answer / wrong-code shake | 320 ms | ±4 px | `.v2-shake` |
| Progress bar segment | 500 ms | width transition | `.v2-bar` |
| Score roll | 300 ms | `cubic-bezier(.22,1,.36,1)` | `Num` |
| Burst | 620 ms, removed at 700 | — | `Burst` |
| List stagger | 240 ms, 40 ms apart | — | `.rise` |

- **Use springs through CSS `linear()`, not a library.** Every current browser supports `linear()` easing, so a spring curve can be baked into one CSS timing function ([Josh W. Comeau](https://www.joshwcomeau.com/animation/linear-timing-function/), [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function/linear)). Material 3 Expressive also moved its motion to springs ([M3 motion](https://m3.material.io/styles/motion/overview/how-it-works)).
  - **Wael fit:** the skin already approximates a spring with `cubic-bezier(.34,1.56,.64,1)`. Add one `--spring-land: linear(...)` token for Wael's landing and nothing else. Motion (the library) was explicitly dropped in favour of CSS.
- **Choreograph the order: who moves first says what matters.** Each onboarding screen enters in the same order: Wael (0 ms), then the bubble (+120 ms), then the tiles (+200 ms, 40 ms apart), then the bar's segment. Everything is settled within about 700 ms. Exits are faster and all at once.
  - **Wael fit:** `.rise` with `--i` handles the tiles. Nothing else animates on mount (rule 13): Wael's entrance and the bubble pop are the onboarding amendment to put to the skin.
- **Animate only `transform` and `opacity`.** These are composited and stay at 60 fps on a mid-range Android ([web.dev](https://web.dev/articles/animations-guide)). The lip is a `box-shadow` but has no blur, so it is cheap. Don't animate `width` except on the progress bar, which the skin already does.
  - **Wael fit:** the lip collapse uses `translate` + `box-shadow` (zero blur), as in `play.css`.
- **Reduced motion: keep the meaning, drop the movement.** Under `prefers-reduced-motion: reduce`: screens crossfade in 120 ms, Wael appears without a bounce, there is no shake, pop, roll or burst, and the bubble text is there at once ([web.dev](https://web.dev/articles/prefers-reduced-motion)). The answer still turns lime and the sound still plays.
  - **Wael fit:** this is `play.css`'s job. Every new keyframe (Wael landing, the step slide) joins its reduced-motion block. Never re-enable motion inline.
- **Tools: CSS for the UI, SVG for Wael today, Rive if he gets a body.**
  - **CSS** for everything in the UI: lips, pops, shakes, bars, slides. It is already the skin's whole toolkit and costs nothing at runtime.
  - **SVG + CSS** for Wael's poses now: swap pose SVGs per step, squash with `.v2-squash`, and keep the eyes pipeline. Cheap, crisp and on-brand.
  - **Rive** if Wael becomes a real animated character (blend between poses, react to inputs such as `mood`, `lookAt`, `talking`). Its state machine is built for this ([Rive docs](https://rive.app/docs/editor/state-machine/state-machine)), and Duolingo uses it for its cast ([Rive × Duolingo](https://rive.app/blog/creative-technologists-duolingo-s-solution-to-the-designer-to-developer-handoff)). It needs a WASM runtime, so lazy-load it on the onboarding route only. The comparisons are mostly vendor-written, so benchmark on a mid-range Android before committing ([Callstack](https://callstack.com/blog/lottie-vs-rive-optimizing-mobile-app-animation), [LottieFiles](https://lottiefiles.com/blog/working-with-lottie-animations/lottiefiles-or-rive)).
  - **Lottie (dotLottie)** for a one-off linear piece made in After Effects, such as an animated logo. For this flow, CSS and SVG do the splash just as well with no extra runtime.
  - **Wael fit:** CLAUDE.md allows a capability library when a screen truly needs one, but Rive is a new dependency and would sit beside the eyes pipeline, which owns Wael's face. *Decide before commissioning.*

---

## 9. Sound and haptics

- **Sound on the frame of the visual, always.** The ear notices a lag of 50–100 ms. Call `sfx()` in the same handler that sets the state, never in an effect that runs after render.
  - **Wael fit:** rule 12 and `docs/sound-effects.md` §4. Every new clickable gets `data-uisfx`, then run `npm run check:sounds`.

| Moment | Visual | Cue (`uisfx`) |
|---|---|---|
| First tap anywhere (unlocks Web Audio) | — | none: audio can't autoplay before a gesture anyway |
| « ⁧يلّا نبداو⁩ » | lip collapses | `forward` |
| Level / section / subject tile | lip collapses, tile turns lime | `select` |
| Section grid opens · level chip reopens | grid rows move | `expand` · `collapse` |
| Bar segment fills | 500 ms width | `progress-step` (exists in uisfx; new to the space, so add it to §4) |
| Back | slide back | `back` |
| Right answer | lime + tick pop | `success` |
| Wrong answer | shake + grey, right one turns lime | `error` |
| « ⁧الجاي⁩ » | slide | `forward` |
| Result: score settles + burst | `Num` + `Burst` | `achievement` (once) |
| Locked 4th node | shake | `blocked` |
| Share | sheet opens | `open` |
| OTP paste · resend · account made | boxes fill · countdown resets · move on | `paste` · `send` · `connect` |
| Wrong code | shake + clear | `error` |
| « ⁧مش توّا⁩ » | sheet closes | `close` |
| **Never** | | `reward`, `level-up`, `streak`, `badge`, `bonus` (they promise mechanics that don't exist) |

- **Make haptics a progressive enhancement, not the signal.** `navigator.vibrate()` works in Chrome on Android, but **iOS Safari doesn't support it** ([caniuse](https://caniuse.com/mdn-api_navigator_vibrate)). Libraries such as WebHaptics fake it on iOS by toggling a hidden `<input type="checkbox" switch>`, a hack that could break with any iOS release ([browser support notes](https://www.mintlify.com/lochie/web-haptics/advanced/browser-support)). Once the app is wrapped (Capacitor or a native webview), use the native haptics bridge instead. Patterns: select 10 ms · right answer 20 ms · wrong answer `[30, 40, 30]` · burst `[15, 30, 15, 30, 40]`.
  - **Wael fit:** the skin has no haptics. If added, they go **in `sound.ts` only** (one `feel(cue)` next to `sfx(cue)`, keyed to the same cue names), they follow the same speaker toggle, and they are **never** used without the matching sound and visual.

---

## 10. RTL and Arabic

![Apple HIG: numerals keep their order; counting sequences reverse](img/ui-27.png "Digits inside a number never reverse; a counting row (1–5 stars) does reverse in RTL; Western vs Eastern numerals compared — [Apple HIG, Right to left](https://developer.apple.com/design/human-interface-guidelines/right-to-left)")
![Apple HIG: a slider flips in RTL](img/ui-28.png "Controls that show progress from one value to another flip in RTL, along with their end glyphs — [Apple HIG, Right to left](https://developer.apple.com/design/human-interface-guidelines/right-to-left)")
![Material: refresh and history icons are not mirrored](img/ui-29.png "Clockwise means forward in time in every script: the refresh and history icons are not mirrored — [Material Design, Bidirectionality](https://m2.material.io/design/usability/bidirectionality.html)")
![Arabic-learning app screens with a character in each step](img/ui-30.png "An Arabic-learning app mixing Arabic and Latin type with a character per step — note how Arabic needs more size and line height to match Latin — Mahima Mahajan, [Sahla: Arabic Learning App](https://dribbble.com/shots/27887284-Sahla-Arabic-Learning-App) (Dribbble)")

- **Mirror the layout, the back button and the progress.** Under `dir="rtl"`: start is on the right, the back arrow points right, progress fills from the right, and the next screen enters from the left. A sequence shown in order (the three answer plates, the ladder) runs right to left ([HIG](https://developer.apple.com/design/human-interface-guidelines/right-to-left)).
  - **Wael fit:** logical utilities only (`ps-`, `me-`, `start-`, `end-`), as CLAUDE.md requires. The step slide's direction comes from a CSS variable, `--dir: -1` under `[dir="rtl"]`, rather than from two keyframes.
- **Don't mirror these.** Checkmarks and ✕ (universal marks), the logo, clocks and the refresh icon (gallery tip 29), media play/pause, the digits inside any number, phone numbers, the OTP boxes, formulas, and Wael himself. Never flip artwork ([HIG](https://developer.apple.com/design/human-interface-guidelines/right-to-left): "avoid flipping images like photographs, illustrations").
  - **Wael fit:** the ✓ in `.v2-tick` stays as it is. The subject badges and Wael are illustrations, so don't flip them. If Wael must face the content, commission a facing-left pose instead of using `scale-x-[-1]`.
- **Use Western digits, isolated.** Tunisia uses Western digits (0–9). Wrap every number in `<bdi dir="ltr">` so « 2/3 », « 0:42 » and « 29 340 118 » never reorder inside Arabic text.
  - **Wael fit:** this is already the skin's tone rule, and `Num` renders `<bdi dir="ltr">`. Watch Tarif Arabic: it draws digits as Eastern Arabic numerals, which is why `fonts.css` sends digits to Cairo.
- **Arabic type needs more room.** Arabic has tall ascenders and deep descenders and no capitals. Body text at 1.6–1.8 line height, headings at about 1.3, and a size 1–2 px larger than the Latin equivalent. Apple suggests about +2 pt next to capitalised Latin. Never letter-space Arabic, because it breaks the joins.
  - **Wael fit:** Cairo throughout (variable 200–1000: 800 for titles, 900 for numbers, 700 for tiles, 400 for body), `font-synthesis: none`, no `tracking-*` on Arabic. Sizes follow the space's `calc(Npx*var(--ts))`.
- **Derja's gender-neutral « ⁧إنت⁩ » is a gift.** Tunisian dialect conjugates the second person singular the same for boys and girls (« ⁧تقرا⁩ », « ⁧تحب⁩ », « ⁧جبت⁩ »). Write every string that way and the flow never has to ask or guess gender.
  - **Wael fit:** the tone rules (second person singular, verbs first) already lead there. Avoid Standard Arabic forms that need « ⁧ـين⁩ » or « ⁧ـي⁩ ».
- **Mixed-script strings: isolate the Latin.** « Bac », « Maths », formulas and "x²" inside Arabic sentences go in `<bdi>` so their punctuation doesn't jump to the wrong end.
  - **Wael fit:** the same `<bdi>` rule. Prefer the Arabic names the seed already uses (« ⁧باك⁩ », « ⁧رياضيات⁩ ») over French in the labels.

---

## 11. Component checklist

| Component | States | Motion | Sound | Built on |
|---|---|---|---|---|
| **Splash mark** | first launch · later launch (skipped) · reduced motion | wordmark `.rise` 240 ms; total ≤ 900 ms; no loop | none | logo SVG on `--v2-surface` |
| **Wael stage** | per-step pose (wave, curious, nod, subject outfit, focus, right, wrong, proud) · gaze target | lands with a 420 ms spring; pose swap 180 ms crossfade; eyes follow the tapped tile | none of his own | pose SVGs + eyes pipeline; **neutral pose to commission** |
| **Speech bubble** | one line · two lines max · tail toward Wael (left of him in RTL) | `v2-pop` 320 ms, +120 ms after Wael | none | flat, 2 px border, 16 px radius |
| **Onboarding bar** | phase 1–3 · per-question segments (pending · right · missed) | width 500 ms on change | `progress-step` | `.v2-bar`, fills from the right |
| **Back button** | default · pressed · hidden on the welcome screen | press 80/180 | `back` | `iconBtnClass`, arrow pointing right in RTL |
| **Level tile** | idle · hover (`hover: hover` only) · pressed · selected (lime + tick) · folded into a summary chip | lip collapse; tick pop; 300 ms beat then slide | `select` | `tileClass`, `Num`-sized digit |
| **Section tile** | idle · pressed · selected · (odd last tile spans 2 columns) | `.rise` 40 ms stagger as the grid opens | `select`; grid `expand`/`collapse` | `tileClass` + 40 px glyph plate |
| **Subject badge tile** | idle · pressed (badge squash) · selected · filtered empty ("no subjects for this section yet", with a glyph) | `.v2-squash`; tick pop | `select` | existing subject card recipe, `--v2-lip = subjectTint().dot` |
| **Question card** | question n/3 · with a formula · long question (wraps, never truncates) | slides in 280 ms from the start side | none | `.v2-panel` |
| **Answer tile** | idle · pressed · right (lime + ✓) · wrong (grey + ✕ + shake) · revealed right · disabled-after-answer (no lip) | 80/180 press; 320 ms pop/shake | `success` / `error` | `tileClass`, ⁧أ ب ج د⁩ plate |
| **Feedback bar** | right · wrong with explanation · last question (CTA « ⁧شوف النتيجة⁩ ») | slides up 200 ms after the tile settles | CTA `forward` | flat panel + `.v2-cta`, `pb-safe` |
| **Score reveal** | 0–3 / 3 · reduced motion (static) | Wael lands → `Num` roll → plates 120 ms apart → one burst → CTA rises | `achievement` once | `Num`, `.v2-tick`, `Burst` |
| **Result ladder** | ✓ / ✕ nodes · locked 4th node | locked node shakes 320 ms | `blocked` | `.v2-ladder`, `data-state`, `useShake` |
| **Share button** | idle · sheet open · unsupported (falls back to copying the link + toast) | none | `open` | `iconBtnClass`, `navigator.share` |
| **Keep card** | level + section · subject with Wael · score | `.rise` | none | flat `.v2-panel` |
| **Phone field** | empty · typing (grouped 2-3-3) · valid (tick) · invalid (one line) · pasted +216 | tick pop | `success` on valid; `error` on submit | `dir="ltr"` input, +216 fixed prefix |
| **OTP field** | empty · active box (caret) · filled · pasted · verifying · wrong (shake + clear) · expired | shake 320 ms; boxes fill left to right | `paste`, `error`, `connect` | one input + 6 LTR boxes, `autocomplete="one-time-code"` |
| **Resend timer** | counting (« ⁧بعد⁩ 0:42 ») · ready (link) · changed number | `Num` per tick | `send` | `<bdi dir="ltr">`, 60 s |
| **Social buttons** | idle · pressed · iOS-only Apple | provider's own; no lip | `forward` | providers' brand rules |
| **Later link** | idle · pressed | none | `close` | plain text button |
| **Step transition** | forward · back · reduced motion (crossfade) | 280 ms in / 200 ms out, direction from `--dir` | `forward` / `back` | one CSS keyframe pair |

---

## 12. Where the tips conflict with the Wael skills

| Tip | Skill rule it hits | Recommendation |
|---|---|---|
| Wael "speaks" in speech bubbles | `wael-gamified` rule 17: the badge "never speaks or nags" | **Amend for onboarding only** (Wael may speak in one-line bubbles during first launch), or move the copy into a plain heading next to him |
| A neutral Wael for the splash, welcome, level and section screens | rule 17 + "Out of scope": "there is no neutral Wael" | **Commission a neutral pose set.** Until then use the logo and glyphs, and bring Wael in at the subject pick |
| Idle animation (blink, breathe) | rule 13: nothing loops except the live halo | Skip the loop; use the reactive gaze and `.v2-squash`. A single blink on events needs an amendment |
| Typewriter text, Wael's entrance on mount | rule 13: nothing animates on mount except `.rise` | Bubble pop with the text in place. Wael's landing is part of the same onboarding amendment |
| Lip-sync | "Out of scope": the eyes pipeline owns the face | Skip |
| Streak or combo feedback | rule 21: no streaks; `streak` cue banned | Skip; let Wael's poses carry the momentum |
| A timer on questions | rule 21: no timers beyond the séance clock | Skip |
| Stars, XP, points on the result | rule 21: no XP, points or levels | Plain score « 2/3 » + answer plates (or a `Ring`) |
| Red for a wrong answer | rule 7: red only when live | Grey + shake + reveal the right answer in lime; red needs a derived `--v2-wrong` token by amendment |
| Full-screen confetti | rule 11: one `Burst`, 700 ms, from the element that earned it | One `Burst` from the score |
| `reward` / `level-up` / `badge` cues on the result | sound grammar "Never" list | `achievement` once |
| A lip on Google / Apple buttons | providers' brand rules (and rule 6: one lime) | Use the providers' own buttons, flat |
| Haptics | not in the skin at all | Add only in `sound.ts`, tied to the cues and the speaker toggle |
| Rive for an animated Wael | skill: "Motion / canvas-confetti replaced by CSS"; the eyes pipeline owns the face | Allowed by CLAUDE.md as a capability library; decide together with the eyes pipeline, and lazy-load it |
| Cause / Rubik from the soft system | the élève space types in Cairo | Follow the élève space: Cairo |

---

## Sources

- Duolingo delayed sign-up and soft/hard walls — [First Round Review](https://review.firstround.com/the-tenets-of-a-b-testing-from-duolingos-master-growth-hacker/), [Taplytics](https://taplytics.com/blog/duolingo-ab-test-onboarding), [GoodUX / Appcues](https://goodux.appcues.com/blog/duolingo-user-onboarding)
- Duolingo characters and Rive — [Duolingo blog: world character visemes](https://blog.duolingo.com/world-character-visemes), [Rive blog: Duolingo's creative technologists](https://rive.app/blog/creative-technologists-duolingo-s-solution-to-the-designer-to-developer-handoff), [Rive: Lily video call](https://rive.app/blog/duolingo-s-ai-powered-video-call-brings-lily-to-life)
- Splash — [Android splash screens](https://developer.android.com/guide/topics/ui/splash-screen), [Apple HIG Launching](https://developer.apple.com/design/human-interface-guidelines/launching), [Apple HIG Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding)
- Motion — [NN/g animation duration](https://www.nngroup.com/articles/animation-duration/), [M3 easing and duration](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs), [M3 motion overview](https://m3.material.io/styles/motion/overview/how-it-works), [web.dev animations guide](https://web.dev/articles/animations-guide), [web.dev prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion), [Josh W. Comeau on linear()](https://www.joshwcomeau.com/animation/linear-timing-function/), [MDN linear()](https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function/linear)
- Tools — [Rive state machine docs](https://rive.app/docs/editor/state-machine/state-machine), [Callstack: Lottie vs Rive](https://callstack.com/blog/lottie-vs-rive-optimizing-mobile-app-animation), [LottieFiles: LottieFiles or Rive](https://lottiefiles.com/blog/working-with-lottie-animations/lottiefiles-or-rive)
- OTP and phone — [web.dev SMS OTP form](https://web.dev/articles/sms-otp-form), [Twilio OTP input best practices](https://www.twilio.com/en-us/blog/developers/best-practices/otp-input-forms-html), [Visa one-time passcode pattern](https://design.visa.com/patterns/one-time-passcode/)
- Haptics — [caniuse: navigator.vibrate](https://caniuse.com/mdn-api_navigator_vibrate), [WebHaptics browser support](https://www.mintlify.com/lochie/web-haptics/advanced/browser-support)
- RTL — [Apple HIG Right to left](https://developer.apple.com/design/human-interface-guidelines/right-to-left), [Material bidirectionality](https://m2.material.io/design/usability/bidirectionality.html)
- Tunisian Bac sections and 2026 candidate numbers — [AllAfrica](https://fr.allafrica.com/stories/202606010670.html), [Business News](https://businessnews.com.tn/2026/06/20/baccalaureat-2026-3567-de-reussite-a-la-session-principale-les-mathematiques-largement-en-tete/1406847/)
- Image galleries — Dribbble shots credited under each image; two pins via Pinterest (pin image only; the pin page itself sits behind a login wall); Airbnb flow via Mobbin. Behance blocked headless access (HTTP 400), so no Behance images.
