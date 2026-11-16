# Mobile UI/UX trends 2025–2026 — evidence and what they mean for Wael Academy

Research date: 2026-10-26. Scope: trends that affect a phone-first, Arabic-RTL education app that will ship as a PWA and later as a webview wrapper (Capacitor) on an iPhone 13 Pro Max-class iOS device and a Galaxy A55-class One UI device. Evidence quality is marked: **[P]** primary (Apple/Google/Samsung/FIDO/standards), **[R]** research publication (NN/g, Google Design research, peer-reviewed), **[I]** industry press/data (Counterpoint, Sensor Tower, Figma reports), **[B]** practitioner blogs (directional only).

## 1. Trend radar

| # | Trend | Direction | Evidence grade | Relevance to Wael |
|---|---|---|---|---|
| 1 | Liquid Glass (iOS 26) and its web imitations | peaked, being tempered | P, R | Medium — chrome only |
| 2 | Material 3 Expressive | rising on Pixel; Samsung stays One UI | P, R | Medium |
| 3 | Android edge-to-edge mandate | mandatory (API 36) | P | High |
| 4 | Bottom-first / thumb-zone ergonomics | consolidated default | R, P | High |
| 5 | Bento layouts | mainstream, cooling | B | Low–Medium |
| 6 | Expressive type, variable fonts | rising | P, B | Medium |
| 7 | AI "ask" entry points | rising fast | R, I | High |
| 8 | Soft-3D / claymorphism vs neo-brutalism | niche | B | Low |
| 9 | Dark mode defaults, OLED black | stable expectation | P | Medium |
| 10 | Micro-interactions, spring motion | default | P, R | High |
| 11 | Haptics as design | rising | P | Medium |
| 12 | Lock-screen widgets / Live Activities / Live Updates | rising | P | Medium |
| 13 | Foldables & large screens | slow (≈2 % of phones) but OS-enforced adaptivity | I, P | Medium |
| 14 | Accessibility & EAA | legal baseline since 28 Jun 2025 | P | High |
| 15 | Passkeys | mainstream (5 B passkeys) | P | Medium |
| 16 | Privacy UX | stable | P | Medium (minors) |
| 17 | Gamified learning | maturing; backlash to coercive mechanics | R, I | High |
| 18 | RTL / Arabic-first momentum | rising (MENA revenue +41 %) | I, P | High |
| 19 | PWA / webview wrapping | easier on iOS 26; Capacitor 8 | P | High |
| 20 | Fading: hamburger-first nav, glass overuse, skeuo redux | declining | R | High |

## 2. Evidence by trend

**1. Liquid Glass.** Apple announced it 9 June 2025 as "a new material… translucent and behaves like glass in the real world", with controls that "act as a distinct functional layer that sits above apps", tab bars that shrink while scrolling (only when they carry an accessory, per the HIG), and Lock Screen numerals that scale in weight, width and height to fit the photo [P]. Legibility backlash followed: NN/g, "Liquid Glass Is Cracked, and Usability Suffers in iOS 26" (Sept 2025) — text on imagery with too little contrast [R]; Apple toned it down in beta 3 (July 2025), restored it in beta 4, then added a **Clear / Tinted** switch in iOS 26.1 (Settings › Display & Brightness) [P/I]. Web imitation = `backdrop-filter: blur() saturate()` + rim highlight + SVG `feTurbulence → feDisplacementMap`; the refraction part of `backdrop-filter: url()` is **Chromium-only**, Safari/Firefox fall back to blur, and animating blur/displacement re-renders the whole filter chain every frame (LogRocket Dec 2025; html-in-canvas.dev) [B]. Lesson: glass is a *chrome* treatment over calm content, never a text container.

**2. Material 3 Expressive.** Announced 13 May 2025; Google Design's research page reports **46 studies, 18,000+ participants**, key UI elements spotted **up to 4× faster**, preferred by up to **87 % of 18–24-year-olds**, and a "dramatic erasure of age effects" for 45+ — with the caveat that removing text labels or over-expressive layouts *lowered* usability [R]. Shipped on Pixel 6+ with Android 16 QPR1 on 3 Sept 2025; motion moved from duration/easing to **physics springs** ("one spring can apply to many situations") [P]. Samsung's One UI (7/8, now 9 on the A55) does **not** adopt M3E wholesale — One UI keeps its own components (expandable centred app bar, floating tab bar, 24 dp side margins in an older guidelines PDF) [P]. Our Android skin reconciles the two: **M3E components + One UI layout** (reachability, the collapsing title); 16 dp margins and the docked M3E bar are recorded choices (`wael-mobile-android`).

**3. Edge-to-edge.** Android 15 made it default for targetSdk 35; for **API 36 the opt-out `windowOptOutEdgeToEdgeEnforcement` is deprecated and disabled** [P]. Google Play: new apps and updates **must target API 36 from 31 Aug 2026** (extension to 1 Nov 2026) [P]. Migration reports: toolbars under the status bar, content under the gesture bar, `fitsSystemWindows` double-padding [B]. For a web app this means transparent system bars and `env(safe-area-inset-*)` handling by default.

**4. Bottom-first ergonomics.** Hoober's touch research (Smashing's *Touch Design for Mobile Interfaces*) remains the primary basis: most phone use is one-handed or cradled, and the comfortable zone is the lower-centre of the screen [R]. Platform vendors converged: Safari's bottom address bar (iOS 15), iOS 26 tab bars that minimise on scroll when they carry an accessory, Samsung's "expandable app bar" that pulls the title into the reachable half [P]. Beware viral numbers ("96 % tap accuracy", "55 % less effort") — unsourced [B].

**5. Bento layouts.** Modular tile grids from Apple keynotes became the default feature-section layout in 2025–26 and now add "active" tiles that expand on hover; mobile reflows to tall cards [B]. Vendor stats (e.g., "47 % higher dwell time") are marketing claims.

**6. Expressive type and variable fonts.** Apple's Lock Screen time now adapts weight/width/height (variable SF) [P]; trend reports call variable fonts "the headline story of 2026… from novelty to default" and pair expressive display faces with quiet UI faces [B]. For Arabic UI the practical list is Rubik (Wael's interface face already covers Arabic), Noto Sans Arabic, IBM Plex Sans Arabic, Cairo, Tajawal, Readex Pro; avoid letter-spacing on Arabic and give it more line-height [B].

**7. AI entry points.** NN/g distinguishes **broad-scope** chat (ChatGPT) from **narrow-scope** features constrained to one job (Spotify's playlist prompt) and recommends the latter inside products; its Dec 2025 piece on explainable chat UIs asks for prominent, visually distinct source citations and expectation-setting that users verify [R]. Figma's *State of the Designer 2026*: 72 % of designers use generative AI; its 2026 AI report (8,403 responses) says AI is changing collaboration for 41 % (vs 7 % two years earlier) [I]. Mobbin's MCP data: onboarding, dashboards and paywalls ≈ 30 % of queries; AI chat patterns (thinking indicators, streaming, tool-use display) are a new benchmark category [I].

**8. Claymorphism vs neo-brutalism.** Both are niches in 2026: clay survives in onboarding, kids' and friendly fintech surfaces but "breaks on dense interfaces"; neo-brutalism is used as a bold accent, not a page style [B]. Wael's soft system (rounded, cream, green-tinted shadows) sits in the acceptable "soft UI" middle — the risk is low contrast, not style.

**9. Dark mode and OLED.** One UI's guideline recommends dark mode for every app and notes that a black background "merges" with the black bezel so "the screen appears more visually expanded" [P]; Material's dark theme uses dark grey (#121212-class) surfaces with elevation overlays, iOS uses pure black system backgrounds [P]. Both target phones are OLED; true black saves power mainly at high brightness [B]. Battery claims online are inconsistent — design for legibility first.

**10. Motion.** M3E's spring system [P], Liquid Glass's "fluid motion" [P], Mobbin now capturing motion as video (Nov 2025) [I]. Web implementation: CSS `linear()` easing for springs, View Transitions API for screen changes, `prefers-reduced-motion` honoured.

**11. Haptics.** Apple HIG (Playing haptics) and Android's haptics design guidelines agree: haptics carry meaning (success/error/attention), never decoration; pair them with visual/audio cues; test on hardware [P]. Research notes "dark haptics" (manipulative buzzes) as an emerging anti-pattern [R]. Web: `navigator.vibrate()` works on Android Chrome only; iOS needs a native wrapper (`@capacitor/haptics`).

**12. Live surfaces.** iOS Live Activities (since 16.1) gain Liquid Glass styling in iOS 26; Android 16 introduced **Live Updates** (progress-centric notifications) with full system treatment in QPR1 late 2025; Samsung's **Now Bar** (One UI 7, on the A55 since May 2025) is the Galaxy equivalent [P/I]. None are reachable from a PWA — wrapper-only.

**13. Foldables / large screens.** Counterpoint: foldables ≈ **2 %** of smartphones, +20–21 % growth forecast for 2026, 100 M cumulative by end-2026, Apple entering with a 25 % share forecast [I]. Android 16: for API 36, **orientation, resizability and aspect-ratio restrictions are ignored on sw ≥ 600 dp** (temporary opt-out; Android 17 reportedly removes it) [P]. Apple now publishes "iPhone Duo" bezels and drawings (2026) [P].

**14. Accessibility / EAA.** The European Accessibility Act applies since **28 June 2025**; conformity is presumed via EN 301 549 (WCAG 2.1 AA for web, apps and non-web software plus native-app clauses); a 2026 republication pointing to WCAG 2.2 is reported but should be checked against ETSI [P/I]. Smashing: "Preparing for the European Accessibility Act" (17 Feb 2025), WCAG 3.0 scoring (May 2025), "accessibility as an operational capability" (June 2026) [B/R]. Typical app failures cited: small touch targets, unlabeled custom controls, keyboard traps in checkout, untagged PDFs.

**15. Passkeys.** FIDO *State of Passkeys 2026* (7 May 2026): **5 billion passkeys**, 90 % awareness, **75 % of consumers have enabled one**, 49 % use them regularly, 48 % of the top-100 sites support them, 200+ Passkey Pledge organisations [P]. An Oct 2026 "Passkey Index" (36 % of sign-ins, 93 % success) is reported second-hand — verify.

**16. Privacy UX.** Android's permission best practices: ask in context, explain before and after denial, never bundle at launch [P]; consent UIs should give accept/decline equal visual weight [B]. Student users are minors — data minimisation and parent visibility are design requirements, not legal footnotes.

**17. Gamified learning.** Meta-analyses keep finding positive but heterogeneous effects: higher-ed d = 1.12 (median 0.56, I² 98.8 %, Gyedu et al. 2026); gamified flipped classrooms g = 0.92 (2025); 41-study g = 0.82 (2023); earlier g = 0.50 (2019) — gains depend on mechanics tied to real competence; motivation shifts extrinsic when rewards don't [R]. Industry: Duolingo replaced Hearts with **Energy** (25 units, drains on every exercise, refills on correct streaks) in 2025 to broadly negative reviews and a deceptive.design listing (pushy reminders, ads disguised as completion screens, monetisation pressure); Friend Streaks (Jan 2025) reportedly raised daily completion 22 % [I]. Lesson: progress and mastery signals good, loss-aversion economies bad.

**18. RTL / Arabic-first.** Sensor Tower × Bidease (Q1 2024 → Q1 2026): GCC downloads **+9 %**, IAP revenue **+41 %** (UAE +46 %, KSA +43 %); record Ramadan installs while time-spent diverges [I]. Guidance: mirror navigation, flow and directional icons; do **not** mirror clocks, numbers, media controls, logos; isolate embedded LTR strings (phone numbers, codes) with bidi isolates; use logical CSS properties (Material bidirectionality; Apple HIG Right-to-left; WWDC22 "Get it right (to left)") [P]. Western digits are the norm in Tunisia and the UAE even in Arabic text [B].

**19. PWA / wrapping.** Safari 26 / iOS 26 (15 Sept 2025): **"zero requirements for installability"** — any site added to the Home Screen opens as a web app by default ("Open as Web App" toggle), manifests still used for icons/name/scope [P]. Still true: web push only for Home-Screen apps, user gesture required, every push must show a notification, no install-prompt API; iOS 27 adds nothing for Home-Screen web apps [P/B]. Capacitor 8 (8 Dec 2025: Xcode 26, SPM default) and 8.5 (UIScene lifecycle for iOS 27/Xcode 27); watch the stale-SDK App Review rejections (ITMS-90111) reported for 8.4.1 [P/I]. Android: Play's API-36 deadline applies to wrappers too.

**20. Fading.** Hidden primary navigation: NN/g's 179-user, 6-site study found hidden nav roughly halves discoverability and lengthens tasks; its June 2025 follow-up says the hamburger is better recognised now but the same rules apply — use visible or combination navigation when there are few top-level items [R]. Glass over content (Liquid Glass backlash, 26.1 Tinted switch) [R/P]. Neo-skeuomorphic shine copied onto the web without the GPU budget. Coercive gamification economies (Duolingo Energy) [I]. Agency-blog hype numbers in general.

## 3. What this means for Wael Academy's mobile app

1. **Design base at 384 px, verify at 384 / 428 / 440 and 600–840 dp.** The Galaxy A55 reports 384 × 832 CSS px (see device-specs.md); the iPhone 13 Pro Max 428 × 926; iPhone 16/17 Pro Max 440 × 956; Android 16 will render us full-window on tablets/foldables.
2. **Bottom tab bar (3–5 items) + one floating primary action in the thumb zone**; search and the AI "ask" entry live at the bottom, never only in a top bar; top headers collapse on scroll (One UI expandable bar / iOS large title).
3. **Safe areas everywhere:** pad fixed bars with `max(env(safe-area-inset-*), var(--sim-*))`, draw nothing interactive under the gesture bar or notch, keep `viewport-fit=cover`.
4. **Skins only on system chrome.** iOS vs Android differ in status bar, back affordance (edge-swipe / back gesture → History-based back), sheet grabbers and switch styles; the Wael content layer stays identical.
5. **Glass sparingly:** translucent tab bar / sheets over calm cream surfaces, always a solid fallback, respect `prefers-reduced-transparency` and `prefers-contrast`; never place body text on a glass panel.
6. **Motion = springs, 150–350 ms, purposeful:** `linear()` spring curves, View Transitions between routes, `prefers-reduced-motion` turns them into fades.
7. **Pair every sound cue with a haptic cue** (the `/student-v2` cue catalogue in docs/sound-effects.md becomes "cue = sound + haptic + visual"); silent/no-vibration fallback on the web.
8. **Dark mode with warm dark tokens** (not grey #121212, not raw black) plus an optional OLED "lights-off" true-black theme for night study; test contrast on both OLED phones.
9. **Type:** Cairo (the skins' only family) for Arabic + Latin, body ≥ 16 px, Arabic leading ≥ 1.35–1.4 per skill, no tracking on Arabic, Western digits (`ar-TN`), expressive display type (Cause) only for headlines and badges.
10. **RTL correctness as a gate:** logical properties only; mirror navigation, progress and chevrons; don't mirror clocks, media controls, numbers, check marks or the subject badges; wrap phone numbers/codes in `<bdi>`; test with forced RTL and real Arabic strings.
11. **Gamification that signals competence:** mastery bars per chapter, XP per completed exercise, streaks with free "freeze" days, badges tied to skills; **no hearts/energy, no paywalled retries, no guilt notifications**; a parent/teacher-visible progress view.
12. **AI "ask" as a narrow-scope helper:** "اسألني على هذا التمرين" bottom sheet scoped to the current lesson, citing course material, teacher-reviewable, clearly labelled as AI, never the home screen.
13. **Accessibility baseline WCAG 2.2 AA:** 44 pt / 48 dp targets, 4.5:1 text contrast, visible focus, Arabic VoiceOver/TalkBack labels on every control and badge, text scaling to 200 %, captions on lesson videos, untagged PDFs avoided.
14. **Login: phone OTP today, passkey upgrade on first successful login;** parent and student roles; biometric unlock through the wrapper.
15. **Privacy for minors:** just-in-time permissions with Derja explanations, equal-weight buttons, data minimisation, no third-party trackers in the student space.
16. **Live surfaces designed now, shipped with the wrapper:** session-starting-soon and quiz-countdown cards for iOS Live Activities, Android Live Updates and Samsung's Now Bar.
17. **PWA packaging first:** manifest (maskable icons, `display: standalone`, per-skin `theme-color`), offline shell, an iOS "add to Home Screen" guidance sheet (no prompt API); then Capacitor 8.x pinned, Play target API 36.
18. **Responsive to 600–840 dp, no orientation lock;** two-pane lesson + video on wide screens. Landscape-first game screens (`/mobilegame`): compact-height rules (see the skills' "Landscape (compact height)" sections).
19. **Don't:** hamburger-only navigation, autoplay carousels, splash-screen gating, parallax onboarding, stock illustrations (use the Wael subject badges), hype metrics in design reviews.
20. **Measure on the two real phones monthly:** viewport, insets, keyboard height, status-bar mirroring in Arabic, 100svh/lvh — the device gallery is a stand-in, not the truth.

## 4. Checklist
- [ ] App holds at 384 px wide (A55) and 428 px (13 Pro Max) with no horizontal scroll
- [ ] Bottom tab bar + FAB in the thumb zone; collapsing top header
- [ ] `env()`/simulated safe-area padding on all fixed bars; nothing under notch/gesture bar
- [ ] iOS and Android chrome skins differ only in system UI
- [ ] Glass surfaces have solid fallbacks; `prefers-reduced-transparency`/`-contrast` respected
- [ ] Spring motion + View Transitions; `prefers-reduced-motion` handled
- [ ] Sound + haptic + visual cue for every student action
- [ ] Warm dark theme tokens + OLED black option; contrast verified
- [ ] Cairo (the skins' only family) for Arabic/Latin; leading ≥ 1.35–1.4 per skill; ≥ 16 px body; Western digits for `ar-TN`
- [ ] Forced-RTL test pass; `<bdi>` around LTR fragments; clocks/media/numbers unmirrored
- [ ] Mastery-based progress; streak freeze; no energy/hearts; parent view
- [ ] Scoped AI helper with citations and teacher review; labelled as AI
- [ ] WCAG 2.2 AA audit (targets, contrast, focus, screen-reader labels, 200 % text, captions)
- [ ] OTP + passkey flows; biometric unlock in wrapper
- [ ] Minor-safe privacy copy and permission timing
- [ ] Live Activity / Live Update / Now Bar card specs documented
- [ ] Manifest, maskable icons, offline shell, iOS install sheet; Capacitor 8.x pinned; targetSdk 36
- [ ] Layouts verified at 600–840 dp; no orientation lock; landscape-first game screens follow the compact-height rules (see skills)
- [ ] No hamburger-only nav, carousels, splash gating, parallax onboarding
- [ ] Monthly real-device measurement log kept

## 5. Sources (title — URL — accessed 2026-10-26)
- Apple Newsroom — Apple introduces a delightful and elegant new software design (Liquid Glass) — https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/
- NN/g — Liquid Glass Is Cracked, and Usability Suffers in iOS 26 — https://www.nngroup.com/articles/liquid-glass/
- MacRumors — iOS 26's Liquid Glass Design Draws Criticism — https://www.macrumors.com/2025/09/17/ios-26-liquid-glass-critiques/
- GSMArena — iOS 26.1 beta lets you tone down Liquid Glass — https://m.gsmarena.com/the_latest_ios_261_beta_lets_you_tone_down_the_liquid_glass-news-69987.php
- LogRocket — How to create Liquid Glass effects with CSS and SVG — https://blog.logrocket.com/how-create-liquid-glass-effects-css-and-svg/ ; Liquid Glass is here — how should designers respond? — https://blog.logrocket.com/ux-design/apple-liquid-glass-ui/
- html-in-canvas.dev — Liquid Glass Effect in CSS and WebGL — https://html-in-canvas.dev/liquid-glass-effect/
- UX Collective — Liquid glass, fragile UX — https://uxdesign.cc/liquid-glass-fragile-ux-and-why-i-wanted-2-weeks-before-writing-about-it-5dccafb5c28f ; Material 3 Expressive: building on the failures of flat design — https://uxdesign.cc/material-3-expressive-building-on-the-failures-of-flat-design-d7a9bb627298
- Google Design — Expressive Design: Google's UX Research — https://design.google/library/expressive-material-design-google-research
- Material 3 — Motion: how it works (physics system) — https://m3.material.io/styles/motion/overview/how-it-works ; Adding Motion Physics with Jetpack Compose — https://m3.material.io/blog/m3-expressive-motion-theming
- Android Authority — Material 3 Expressive deep dive (rollout) — https://www.androidauthority.com/google-material-3-expressive-features-changes-availability-supported-devices-3556392/
- Android Developers — Behavior changes: apps targeting Android 16 (edge-to-edge, large screens) — https://developer.android.com/about/versions/16/behavior-changes-16
- Android Developers — Target API level requirements for Google Play — https://developer.android.com/google/play/requirements/target-sdk
- Smashing Magazine — Touch Design for Mobile Interfaces (Hoober) — https://www.smashingmagazine.com/printed-books/ ; Preparing For The European Accessibility Act (Feb 2025) — https://www.smashingmagazine.com/category/accessibility
- Samsung — One UI Design Guidelines (PDF) — https://design.samsung.com/global/contents/one-ui/download/oneui_design_guide_eng.pdf
- NN/g — Hamburger Menus and Hidden Navigation Hurt UX Metrics — https://www.nngroup.com/articles/hamburger-menus/ ; Beyond the Hamburger (June 2025) — https://www.nngroup.com/articles/find-navigation-mobile-even-hamburger/
- NN/g — Scope in Generative AI Features — https://www.nngroup.com/articles/scope-ai-features/ ; Explainable AI in Chat Interfaces (Dec 2025) — https://www.nngroup.com/articles/explainable-ai/ ; The 6 Types of Conversations with Generative AI — https://www.nngroup.com/articles/AI-conversation-types/
- Figma — State of the Designer 2026 — https://www.figma.com/blog/state-of-the-designer-2026/ ; Figma's 2026 AI Report — https://www.figma.com/blog/2026-ai-report/ ; Top Web Design Trends for 2026 — https://www.figma.com/resource-library/web-design-trends/
- Mobbin — How to use Mobbin MCP (query data) — https://mobbin.com/blog/how-to-use-mobbin-mcp ; Changelog (motion capture) — https://mobbin.com/changelog
- SaaSFrame — Designing Bento Grids That Actually Work (2026) — https://www.saasframe.io/blog/designing-bento-grids-that-actually-work-a-2026-practical-guide
- The Type Founders — Typography Trends in 2026 — https://thetypefounders.com/world-of-type/typography-trends-in-2026/ ; Wix — Typography trends 2026 — https://www.wix.com/wixel/resources/typography-trends
- Setproduct — Claymorphism UI design guide — https://www.setproduct.com/blog/claymorphism-design-guide ; Pixso — Neo-Brutalism design trends in 2026 — https://pixso.net/articles/neo-brutalism-design/
- Material Design — Dark theme — https://m2.material.io/design/color/dark-theme.html
- Apple HIG — Playing haptics — https://developer.apple.com/design/human-interface-guidelines/playing-haptics ; Android — Haptics design — https://source.android.com/docs/core/interaction/haptics
- arXiv — Dark Haptics: Exploring Manipulative Haptic Design — https://arxiv.org/pdf/2504.08471
- Android Authority — How Live Updates change notifications in Android 16 — https://www.androidauthority.com/android-16-live-notifications-3518375/ ; Pushwoosh — iOS Live Activities — https://www.pushwoosh.com/blog/ios-live-activities/
- Counterpoint — Foldable market set for 20 % growth in 2026 — https://counterpointresearch.com/en/insights/Foldable-Smartphone-Market-Set-for-20-percent-Growth-in-2026 ; 100-million cumulative milestone — https://counterpointresearch.com/en/insights/global-foldable-shipments-to-hit-100-million-cumulative-milestone-by-end-of-2026
- Wikipedia — European Accessibility Act — https://en.wikipedia.org/wiki/European_Accessibility_Act ; Acquia — EAA and EN 301 549 guide — https://www.acquia.com/blog/european-accessibility-act-and-en-301-549-your-complete-compliance-guide
- FIDO Alliance — State of Passkeys 2026 — https://fidoalliance.org/the-state-of-passkeys-2026-global-consumer-and-workforce-report/ ; World Passkey Day 2026 release — https://fidoalliance.org/fido-alliance-reports-accelerating-global-passkey-adoption-on-world-passkey-day-2026/
- Android Developers — App permissions best practices — https://developer.android.com/training/permissions/usage-notes
- Gyedu et al. 2026 — Gamification Effect in Higher Education: Meta-Analysis — https://journals.sagepub.com/doi/10.1177/21582440261421375 ; Gamified flipped classroom meta-analysis — https://doi.org/10.1108/JARHE-11-2025-0926 ; PMC — Effectiveness of gamification meta-analysis (2023) — https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10591086/
- Duolingo Blog — Energy — https://blog.duolingo.com/duolingo-energy/ ; Class Central — Duolingo Breaks Hearts for Energy — https://www.classcentral.com/report/duolingo-breaks-hearts-for-energy/ ; Android Authority — Quitting Duolingo after the energy change — https://www.androidauthority.com/quitting-duolingo-energy-system-3599842/
- Sensor Tower — 2026 Middle East App Growth Report — https://sensortower.com/blog/sensor-tower-bidease-2026-middle-east-app-growth-report ; 2025 report — https://sensortower.com/blog/middle-east-app-growth-report
- Apple HIG — Right to left — https://developer.apple.com/design/human-interface-guidelines/right-to-left ; WWDC22 — Get it right (to left) — https://developer.apple.com/videos/play/wwdc2022/10107/ ; Material — Bidirectionality — https://m2.material.io/design/usability/bidirectionality.html
- WebKit — WebKit Features in Safari 26.0 — https://webkit.org/blog/17333/webkit-features-in-safari-26-0/ ; News from WWDC25 — https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/
- progressivewebapps.com — Web Push on iOS & Safari — https://progressivewebapps.com/background/ios-web-push/ ; MobiLoud — Do PWAs work on iOS (2026) — https://www.mobiloud.com/blog/progressive-web-apps-ios/
- Ionic — Capacitor 8.5 Released — https://ionic.io/blog/capacitor-8-5-released ; Capacitor support policy — https://capacitorjs.com/docs/main/reference/support-policy ; Capacitor issue #8537 (stale SDK) — https://github.com/ionic-team/capacitor/issues/8537
- deceptive.design — Duolingo entries (via Class Central) — https://www.deceptive.design/
