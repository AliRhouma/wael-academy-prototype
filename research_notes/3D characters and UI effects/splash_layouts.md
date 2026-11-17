# Splash / title / first-launch screens with a hero 3D character + 3D scene (landscape, RTL)

Scope: what the OS launch screen may and may not contain, what the game/app title screen after it should do, how to compose a landscape title screen around one 3D character + one 3D world + one primary CTA, how to mirror it for Arabic, and what is measured about first-launch drop-off. Research date: 16 Nov 2026. Sources fetched directly where possible (Apple HIG JSON, Android developer docs, Material 1 bidirectionality, Chrome autoplay). Many game-specific claims online come from vendor/marketing blogs; they are flagged as such.

## 1. Platform rules: OS launch screen vs splash vs title screen

### Takeaway
Both platforms treat the OS launch moment as a near-invisible placeholder: Apple says the launch screen "isn't a branding opportunity" and should match the first screen with no text, while Android 12+ forces a system splash (icon on one flat color, animation recommended under 1,000 ms, branding image discouraged). Any branded splash or title screen with a character belongs **after** launch completes, ideally as the first beat of onboarding, shown only long enough to absorb at a glance, and the player should reach gameplay fast.

### Cited Findings
**Apple (HIG — Launching, Onboarding, Designing for games, Layout)**
- Launching starts when someone opens the app/game and ends when the first screen is ready; onboarding can follow. — [Apple HIG: Launching](https://developer.apple.com/design/human-interface-guidelines/launching)
- "Launch instantly": people "sometimes they don't want to wait more than a couple of seconds." — [Apple HIG: Launching](https://developer.apple.com/design/human-interface-guidelines/launching)
- iOS, iPadOS and tvOS require a launch screen; macOS, visionOS, watchOS don't. — [Apple HIG: Launching](https://developer.apple.com/design/human-interface-guidelines/launching)
- "Downplay the launch experience." The launch screen is not onboarding, not a splash screen, not "an opportunity for artistic expression"; its "sole function is to enhance the perception of your experience as quick to launch and immediately ready to use." — [Apple HIG: Launching](https://developer.apple.com/design/human-interface-guidelines/launching)
- "Design a launch screen that's nearly identical to the first screen" to avoid "an unpleasant flash"; if the app first shows a solid color, the launch screen should be only that color. — [Apple HIG: Launching](https://developer.apple.com/design/human-interface-guidelines/launching)
- "Avoid including text on your launch screen" (it is static and not localized). — [Apple HIG: Launching](https://developer.apple.com/design/human-interface-guidelines/launching)
- "Don't advertise." "The launch screen isn't a branding opportunity." No logos unless they are "a fixed part of your app's first screen." — [Apple HIG: Launching](https://developer.apple.com/design/human-interface-guidelines/launching)
- Splash screen (section added June 10, 2024): a "beautiful graphic that succinctly communicates branding"; "If you need a splash screen, consider displaying it at the beginning of your onboarding flow"; without onboarding, show it "as soon as launching completes." — [Apple HIG: Launching](https://developer.apple.com/design/human-interface-guidelines/launching)
- Show a splash "just long enough for people to absorb the information at a glance without feeling that it's delaying their experience." — [Apple HIG: Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding)
- Onboarding should be "fast, fun, and optional" and "occurs after launching is complete — it isn't part of the launch experience." — [Apple HIG: Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding)
- Postpone nonessential setup; ask for permissions when the related feature is first used; "Prefer letting people experience your app or game before prompting them for ratings or purchases." Skipped tutorials should not reappear on later launches. — [Apple HIG: Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding)
- iOS: "Launch in the appropriate orientation"; a landscape-only interface must work whether the device is rotated left or right. — [Apple HIG: Launching](https://developer.apple.com/design/human-interface-guidelines/launching)
- Restore previous state so people continue where they left off. — [Apple HIG: Launching](https://developer.apple.com/design/human-interface-guidelines/launching)
- Games: "Let people play as soon as installation completes"; initial download ≤30 minutes; "Teach through play"; ask permissions "between an initial cutscene and the first time they can use their hands." — [Apple HIG: Designing for games](https://developer.apple.com/design/human-interface-guidelines/designing-for-games)
- Games must look right at 16:10, 19.5:9 and 4:3; "Avoid fixed layouts"; accommodate rounded corners and camera housing via safe areas. Touch buttons default 44×44 pt (minimum 28×28 pt). Text: default 17 pt, minimum 11 pt on iOS. — [Apple HIG: Designing for games](https://developer.apple.com/design/human-interface-guidelines/designing-for-games)
- Loading: "the best content-loading experience finishes before people become aware of it." — [Apple HIG: Launching (links Loading)](https://developer.apple.com/design/human-interface-guidelines/launching)
- Full-screen background art should extend under bars to fill the screen; don't change aspect ratio, scale to fill; art "may often need to extend beyond what is typically visible." Respecting the safe area keeps the Dynamic Island from obstructing content and controls. — [Apple HIG: Layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- Apple HIG Launching has **no** game-specific title-screen guidance. — [Apple HIG: Launching](https://developer.apple.com/design/human-interface-guidelines/launching)

**Android 12+ SplashScreen API**
- Since Android 12 every app launches with a system splash (into-app motion, app icon, transition); it is a Window covering the Activity; shown on cold and warm starts, never on hot starts. Custom splash activities from Android 11 and lower should migrate to the SplashScreen compat library. — [Android Developers: Splash screens](https://developer.android.com/develop/ui/views/launch/splash-screen)
- Customizable elements: app icon (vector, static or animated), optional icon background, single opaque window background color (light/dark variants). — [Android Developers: Splash screens](https://developer.android.com/develop/ui/views/launch/splash-screen)
- Sizes: branded image 200×80 dp; icon with background 240×240 dp inside a 160 dp circle; icon without background 288×288 dp inside a 192 dp circle; AVD icon area 432 dp (inner 288 dp visible). — [Android Developers: Splash screens](https://developer.android.com/develop/ui/views/launch/splash-screen)
- Animated icon: AnimatedVectorDrawable; "we recommend not exceeding 1,000 ms on phones"; delayed start ≤166 ms; loop if startup >1,000 ms; must be "comfortably skipped". — [Android Developers: Splash screens](https://developer.android.com/develop/ui/views/launch/splash-screen)
- "User research shows that perceived startup time is less when viewing an animation." — [Android Developers: Splash screens](https://developer.android.com/develop/ui/views/launch/splash-screen)
- Branding image at bottom is possible but "the design guidelines recommend against using a branding image." — [Android Developers: Splash screens](https://developer.android.com/develop/ui/views/launch/splash-screen)
- Splash dismisses on first frame; `setKeepOnScreenCondition` keeps it for small data loads; custom exit animation via `setOnExitAnimationListener` (example: 200 ms slide-up). Dismiss only when the app is visually stable so "no additional spinners are needed"; an incomplete interface "can be jarring". — [Android Developers: Splash screens](https://developer.android.com/develop/ui/views/launch/splash-screen)

### Inferences
- Sequence for Wael Academy: OS launch (iOS: flat color matching title-screen sky/background, no text, no logo; Android: icon on flat brand color, AVD ≤1 s) → in-app title screen (3D character + world + logo + one CTA) → play. The Android exit animation (e.g. icon scaling into the logo position) is the natural bridge into the title scene.
- Because Apple wants the launch screen to match the first screen, the title screen's background color/gradient should be reproducible as a single flat color so the hand-off doesn't flash.
- No fake loading bar is needed if the title scene renders immediately and assets stream behind it (Apple: loading should finish "before people become aware of it"; Android: no extra spinners).
- For a web/PWA prototype there is no OS launch screen; the browser equivalent is a flat-color first paint matching the scene.

### Gaps
- No App Store Review Guideline or Google Play policy specifically about splash or title screens was found; the constraints are HIG/design guidance, not review rules. Apple's Layout page does not address the home indicator or Dynamic Island specifically in landscape.

## 2. Composition patterns for landscape title screens (character, CTA, logo, layers, safe areas, thumbs)

### Takeaway
Authoritative, sourced teardowns of specific title screens (Clash Royale, Brawl Stars, Royal Match, etc.) were not found; what is citable is general: split layout (character on one half, menu/CTA on the other), a dominant logo with a minimal option list, the start control as the most prominent element, edge-to-edge art with UI inside the safe area, and controls in the lower corners for landscape thumbs. Genshin Impact's login screen is the best-documented "live scene" title screen (four time-of-day states with matched music).

### Cited Findings
- Godot's official title-screen tutorial uses a split layout: menu in a column on one side, character illustration centered in the other half. — [Godot docs: Design a title screen](https://docs.godotengine.org/en/3.2/getting_started/step_by_step/ui_main_menu.html)
- Some title-screen builders treat landscape and portrait as separate images with a movable Start button and a logo that layouts reposition per screen shape. — [Guroo Academy help](https://help.guroo.academy/editing-screen-settings-title-screen)
- Opinion: effective menus keep options simple and let a large logo dominate. — [Medium: Video game UI design process](https://medium.com/@a_kill_/video-game-ui-the-design-process-explained-14c23fa70d37)
- Opinion: make the start control the most prominent, easily hit element; test whether new players find it unaided. — [Bitesize Byte (blog, 2026)](https://bitesizebyte.blogspot.com/2026/03/the-art-of-creating-compelling-title.html)
- Let players press Play and start right away rather than pass through extra menus. — [Game Developer: immersive game intros](https://www.gamedeveloper.com/design/how-to-create-immersive-game-intros)
- Community critique: a basic play-button shape and side art that doesn't match the scene weaken a title composition. — [r/Unity3D thread mirror](https://lr.in.psf.lt/r/Unity3D/comments/1gghlsa/is_this_a_good_title_screen)
- A devlog revision made the character art fill a large share of the screen so the composition immediately conveys the premise. — [itch.io devlog](https://projectlevel.itch.io/bubblegum-zombie-hunter/devlog/335493/designing-a-title-screen)
- Genshin Impact login screen cycles day, dusk, night, dawn, and the music changes to match (fan-compiled wiki). Extra Credits (2023) made an episode on the design of this login screen. — [Genshin Impact Fandom wiki](https://genshin-impact.fandom.com/wiki/File:Login_Menu_Dusk.png); [TheTVDB: Extra Credits episode](https://thetvdb.com/series/extra-credits/episodes/10407945)
- Safe area: canvas/art can go edge to edge while buttons, scores and menus stay in the safe area; on web use CSS `env(safe-area-inset-*)`; insets differ between portrait and landscape, so recompute on rotation. — [Cursa: safe areas](https://cursa.app/en/page/mobile-screen-resolution-aspect-ratios-and-safe-areas); [Sizzy: safe area insets](https://sizzy.co/blog/safe-area-insets)
- Front-camera notches cause mobile game HUD issues (overlap). — [Game Developer: notch issues](https://www.gamedeveloper.com/game-platforms/mobile-games-issues-with-frontal-camera-notch)
- Landscape thumb zone: comfortable zone shifts when turned sideways; place controls lower-left/lower-right; left-handed reach is a mirror image. — [Packt: The thumb zone (Mastering UI Development with Unity)](https://packtpub.com/en-dk/product/mastering-ui-development-with-unity-9781787125520/chapter/mobile-specific-ui-10/section/the-thumb-zone-ch10lvl1sec73); [Game Developer: designing for thumbs](https://gamedeveloper.com/design/how-to-design-for-thumbs-in-the-era-of-huge-screens)
- A 2024 academic paper finds thumb-reach models disagree; age and thumb size change the zone — treat fixed maps as approximate. — [CMS Conferences paper (2024)](https://openaccess-api.cms-conferences.org/articles/download/978-1-964867-13-7_13)
- Apple: 44×44 pt touch targets; art scales to fill without aspect distortion; respect safe areas for camera housing. — [Apple HIG: Designing for games](https://developer.apple.com/design/human-interface-guidelines/designing-for-games); [Apple HIG: Layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- Duolingo's welcome screen: owl mascot, tagline, primary "Get Started", secondary "I already have an account". — [ScreensDesign: Duolingo onboarding](https://screensdesign.com/explore/apps/duolingo/onboarding/)

### Inferences (design rules synthesized for a 3D character + 3D world + one CTA, landscape)
- **Grid:** treat the safe-area rectangle as a 3×3 rule-of-thirds grid. LTR: character body on the left-third vertical line (or between left and centre thirds), logo top-centre or top-right third, primary CTA bottom-right third (right-thumb zone), secondary ("I have an account" / settings / language) small, top corner or under the CTA. RTL mirrors this (see §4).
- **Gaze/gesture leads to the CTA:** character's head turned / pointing / leaning toward the CTA side so the eye travels logo → character → CTA. Leave negative space ("look room") in front of the character's face.
- **Layers:** background (sky/far world, slow parallax, can bleed under notch and home indicator), midground (the world/academy building the character stands in), foreground character (largest, crisp, may be cropped at knees/waist by the bottom edge), UI layer (logo + CTA, always inside safe area). Optional foreground framing elements (foliage, props) at the outer edge add depth.
- **Notch on the long edge:** in landscape the notch/Dynamic Island is on the left or right short side of the safe rectangle depending on rotation; Apple says landscape-only UIs must work both ways, so never pin the CTA or logo so close to either side that the cutout can cover it — use `env(safe-area-inset-left/right)` and keep the character (not UI) near the cutout side.
- **Home indicator:** sits at the bottom centre in landscape; keep the CTA above the bottom inset and preferably off-centre (bottom-right/left third) to avoid accidental home swipes.
- **One primary CTA:** one large, high-contrast pressable button ("العب"/"Jouer"/"Play"); everything else visually quieter.

### Gaps
- No verified, sourced teardown found of the title/loading screens of Clash Royale, Brawl Stars, Royal Match, Subway Surfers, Monument Valley, Brilliant, Prodigy, Roblox titles or Candy Crush. Observations from memory (e.g. Supercell games showing a full-bleed key-art loading screen with logo and bar then dropping straight into the home hub without a "Play" gate; Genshin requiring "Click to start" over a live scene) are unverified and should not be cited without checking a fresh install or gameuidatabase.com (which could not be fetched in this pass).
- Interface In Game, Mobbin, Pocket Gamer.biz and Deconstructor of Fun were not reached with title-screen specifics; a Deconstructor of Fun Royal Kingdom piece covers re-onboarding, not title screen layout. — [Deconstructor of Fun: Royal Kingdom](https://www.deconstructoroffun.com/blog/2024/07/01/royal-kingdom-will-it-outgrow-its-big-brothers-influence)

## 3. Building anticipation without fake loading; new vs returning users

### Takeaway
Use a live scene (idle character, ambient motion, time-of-day variation like Genshin) instead of a progress bar; Android research says animation lowers perceived wait. Sound cannot start before the first tap on web (autoplay policy), so the first tap on the CTA (or a "tap to start") is also the moment audio begins. New users get one primary "Play/Get started" with a quiet secondary "I already have an account"; sign-up is deferred until after first value (Duolingo pattern), and returning users should land where they left off.

### Cited Findings
- Perceived startup time is lower when viewing an animation. — [Android Developers: Splash screens](https://developer.android.com/develop/ui/views/launch/splash-screen)
- Genshin's title scene has four time-of-day versions with matched music. — [Genshin Impact Fandom wiki](https://genshin-impact.fandom.com/wiki/File:Login_Menu_Dusk.png)
- Chrome: muted autoplay always allowed; sound requires user interaction with the domain (or MEI threshold on desktop, or installed PWA/home screen); since Chrome 71 an `AudioContext` created before a gesture starts "suspended" and needs `resume()` after a gesture; recommend the `click` event; on rejected `play()` show a play button. — [Chrome for Developers: Autoplay policy](https://developer.chrome.com/blog/autoplay)
- Apple: no fake waiting; "the best content-loading experience finishes before people become aware of it." — [Apple HIG: Launching](https://developer.apple.com/design/human-interface-guidelines/launching)
- Duolingo starts with the product and ends with optional account creation; a reviewer reached course selection with no sign-up; "Create a Profile" prompt came later to save progress; a sign-up modal appeared after several lesson questions. — [Appcues GoodUX: Duolingo](https://goodux.appcues.com/blog/duolingo-user-onboarding); [UX Collective: Duolingo diaries](https://uxdesign.cc/the-duolingo-diaries-an-honest-ux-review-part-1-onboarding-ed0165d44c58); [Medium: Duolingo onboarding](https://medium.com/learning-ux/how-duolingo-converted-me-into-a-user-with-their-awesome-on-boarding-process-f8de2d109c17)
- Rosetta Stone, by contrast, required sign-up before learning. — [UX Planet: Rosetta Stone vs Duolingo](https://uxplanet.org/the-ux-of-mobile-app-onboarding-rosetta-stone-vs-duolingo-fc662f50d0e4)
- Early permission/sign-in prompts push players out; delaying them reportedly improves opt-in and reduces first-session bounce (vendor blog). — [Segwise](https://segwise.ai/blog/mobile-gaming-app-user-retention-strategies)
- Apple: restore previous state; don't re-show skipped tutorials. — [Apple HIG: Launching](https://developer.apple.com/design/human-interface-guidelines/launching); [Apple HIG: Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding)

### Inferences
- Anticipation toolkit: idle breathing/blink loop on the character, a periodic "glance at the CTA" micro-gesture, slow camera drift/parallax, ambient particles (dust, leaves, birds), soft CTA pulse after a few idle seconds — all calm, looping, no counters.
- Treat the CTA tap as the audio unlock: play the button sound + start music on the same click handler (`AudioContext.resume()`), then the character reacts (wave/jump) as the camera pushes into the world — sound and motion on the same frame.
- Returning user: same scene, CTA becomes "Continue" (with name/avatar or current chapter as a small sub-label) and lands on last state; new user: "Play/Get started" + quiet "I already have an account".

### Gaps
- No public A/B data found on live-scene title screens vs static key art, or on "tap to start" gates vs auto-advance.

## 4. RTL (Arabic) mirroring for a game title screen

### Takeaway
Mirror layout and flow (CTA side, reading order, back/next arrows, progress direction, depictions of forward motion), but do not mirror logos, clocks/circular time, media playback controls, numbers' internal digit order, right-hand objects, or general artwork/photos (re-author art if direction matters). Material says depictions of forward motion (a walking person) should face left in RTL, which supports turning the 3D character to face/point toward the mirrored CTA — trivial with a 3D model (rotate/re-pose, don't flip the texture). Sources conflict on media icons (Wikimedia mirrors them).

### Cited Findings
**Mirror**
- RTL layout is "the mirror image of an LTR layout"; navigation, overflow menus and tabs switch sides; back/forward reverse; directional arrows flip; "next page" on the left; progress bars start at the right and fill leftward; sliders run right-to-left; checkboxes to the right of labels. — [Material Design (M1): Bidirectionality](https://m1.material.io/usability/bidirectionality.html)
- Depictions of forward motion flip: a walking person or bicycle faces left in RTL. — [Material Design (M1): Bidirectionality](https://m1.material.io/usability/bidirectionality.html)
- Apple: flip progress controls (and their start/end glyphs); flip controls that navigate a fixed order (back points right); flip icons showing forward/backward motion and reading direction; reverse numeral order that shows progress/counting but never flip the glyphs; reverse image order when the order is meaningful. — [Apple HIG: Right to left](https://developer.apple.com/design/human-interface-guidelines/right-to-left)

**Do not mirror**
- Apple: "Don't flip logos or universal signs and marks" (even with text); checkmark keeps its appearance; real-world objects such as clocks "need to look the same"; right-handed tools needn't flip; "Preserve the direction of a control that refers to an actual direction or points to an onscreen area"; "Don't reverse the order of numerals in a specific number." — [Apple HIG: Right to left](https://developer.apple.com/design/human-interface-guidelines/right-to-left)
- Apple: "Avoid flipping images like photographs, illustrations, and general artwork" (meaning can change; copyright); create a new version if content is tied to reading direction. Apple does not address characters facing a direction. — [Apple HIG: Right to left](https://developer.apple.com/design/human-interface-guidelines/right-to-left)
- Material: clocks, refresh and history icons keep their direction; media playback buttons and media progress stay LTR (they show the media's direction, not time's); physical objects, phone numbers, clock times and charts keep LTR order; untranslated LTR text (URLs) stays LTR; right-hand icons like search are not mirrored because most RTL users are right-handed. — [Material Design (M1): Bidirectionality](https://m1.material.io/usability/bidirectionality.html)
- Corroboration: Mozilla lists audio/video controls among elements that look the same in RTL; Microsoft keeps fast-forward/rewind orientation in both directions; Adobe Spectrum: time icons (clock) not mirrored. — [Mozilla RTL guidelines](https://firefox-source-docs.mozilla.org/code-quality/coding-style/rtl_guidelines.html); [Microsoft Learn: Mirroring](https://learn.microsoft.com/en-us/globalization/input/mirroring); [Adobe Spectrum: Bi-directionality](https://spectrum.adobe.com/page/bi-directionality)
- Conflict: Wikimedia Codex says to mirror media icons (play, pause, rewind). — [Wikimedia Codex: Bidirectionality](https://doc.wikimedia.org/codex/v1.18.0/style-guide/bidirectionality.html)

**Typography / numerals**
- Arabic can look small next to all-caps Latin; increasing RTL font size by about 2 pt often balances; Arabic may use Western or Eastern Arabic numerals, so number-centric apps should choose per locale. — [Apple HIG: Right to left](https://developer.apple.com/design/human-interface-guidelines/right-to-left)
- Graphics containing text usually need localization. — [Material Design (M1): Bidirectionality](https://m1.material.io/usability/bidirectionality.html)

**Arabic-market examples / evidence**
- Google (2017): after Pocket Gems localized War Dragons into Arabic, installs by Arabic-speaking users tripled and Arabic revenue share rose from ~0% to ~1.5%; Skyscanner handled RTL using start/end margins and Lint checks. (Dated source.) — [Android Developers Blog (2017)](https://android-developers.googleblog.com/2017/05/why-you-should-localize-your-app-or.html?hl=id)
- Vendor claim: Arabic is official in 22 territories; local app stores reportedly have ~1% Arabic content; Arabic poses layout/UI challenges needing custom engineering. (Marketing sources.) — [FoxData](https://foxdata.com/en/blogs/how-to-localize-your-game-for-arab-markets-a-comprehensive-guide/); [Tarjama](https://tarjama.com/why-you-should-invest-in-mena-mobile-games/)
- Lamsa: bilingual Arabic/English kids' app created to fill a gap in culturally relevant Arabic content; characters extended into books/figurines linked via AR; 1,200+ activities. — [The National](https://www.thenationalnews.com/lifestyle/family/arabic-language-app-lamsa-leads-the-way-in-digital-learning-for-kids-1.221923); [Lamsa listing](https://mwm.ai/apps/lamsa-kids-learning-app/517583488)
- Abjadiyat (Alef Education): K–4 Arabic literacy, gamification with cartoon characters, ages 3–8, scaffolded levels. — [Alef Education: Abjadiyat](https://www.alefeducation.com/products/abjadiyat); [App Store: Abjadiyat](https://apps.apple.com/us/app/id1235509585)

### Inferences (RTL rules for the Wael title screen)
- **Flip:** whole composition. LTR "character left / CTA bottom-right" becomes RTL "character right / CTA bottom-left"; logo stays top-centre (or moves to the top-left third if it sat top-right); secondary links swap corners; any arrow inside the CTA ("Play →") points left; any progress/streak bar fills right-to-left.
- **Re-pose, don't flip, the character:** rotate the 3D model / swap the idle pose so it faces and points toward the CTA's new side; never mirror the mesh/texture (text on clothing, a logo patch, or handedness — e.g. a pen in the right hand — would invert). Apple advises against flipping artwork; Material says forward-motion figures should face left in RTL.
- **Background world:** usually leave unmirrored (it's "general artwork"); if there's a path/road leading into the scene, consider a re-authored camera angle so it leads toward the CTA side.
- **Don't flip:** the Wael logo, clock/time-of-day icons, any audio/music toggle play glyph, numbers.
- **Type over art:** Arabic display text needs a slightly larger size than Latin equivalents, generous line height, and a scrim/soft shadow or a solid button surface behind it over busy 3D art; keep the CTA label inside a solid pressable surface rather than floating text.
- **Thumb/handedness:** the CTA moving to bottom-left in RTL slightly disfavors right-handed thumbs; acceptable given reading-order convention, but keep it large (≥44 pt) and well above the home indicator. (No source tests this trade-off.)

### Gaps
- No source found on how MENA studios or the Arabic Duolingo course specifically handle title-screen/character mirroring; the Duolingo Arabic UI and Lamsa/Abjadiyat RTL design details were not documented publicly. Material 3's bidirectionality page could not be fetched (JS-rendered); M1 rules used instead.

## 5. Measured outcomes: first-screen drop-off, character vs no character, first-launch length

### Takeaway
Hard numbers on title-screen drop-off or character-vs-no-character A/B tests were not found. Available benchmarks are coarse (day-1 retention ~22–28%, i.e. ~70%+ of players gone after day 1) and come mostly from vendor blogs; tutorial is cited as a top drop-off point, with targets of a first "win" within ~3 minutes and tutorial completion ≥75%.

### Cited Findings
- Roughly 70–73% of players lost after day 1 (vendor blogs). — [Adrian Crook](https://adriancrook.com/?p=8145); [MAF](https://maf.ad/en/blog/analyze-and-decrease-churn-rate/)
- D1 for top-quartile games ~26–28% (GameAnalytics-based, cited by Playio); targets: tutorial completion ≥75%, first win within 3 min, core loop within 5 min. — [Playio](https://blog.playio.co/mobile-game-kpi-performance-goals-retention-strategy)
- 2026 benchmarks: good games ~27% D1, 8–14% D7, 3–7% D30; market medians ~22% / 4% / <1% (vendor). — [Segwise](https://segwise.ai/blog/mobile-gaming-app-user-retention-strategies)
- Tutorial is among the largest drop-off points; keep under five minutes with a skip. — [MAF: Day 1 to Day 7 retention](https://maf.ad/en/blog/game-retention/)
- Wordy/excessive tutorials drive immediate churn since downloads are impulsive. — [Juego Studio](https://www.juegostudio.com/blog/how-to-increase-user-retention-and-increase-your-games-lifetime)
- Technical issues in the first session lead players not to return. — [AppFollow](https://appfollow.io/blog/mobile-game-retention)
- Android: perceived startup time is lower with animation (Google user research, no numbers given). — [Android Developers: Splash screens](https://developer.android.com/develop/ui/views/launch/splash-screen)
- Apple: some people don't want to wait "more than a couple of seconds". — [Apple HIG: Launching](https://developer.apple.com/design/human-interface-guidelines/launching)

### Inferences
- Budget: OS launch <1 s → title screen interactive immediately (no gate longer than one tap) → first meaningful action within ~3 minutes. Measure funnel: app open → title shown → CTA tapped → first lesson/level started → first win.
- A character's value is more defensible as guide/feedback (Duolingo-style mascot) than as decoration; it should not add time before the CTA becomes tappable.

### Gaps
- No public A/B results comparing character vs no-character title or welcome screens; no measured title-screen (pre-CTA) drop-off rate; no loading-time-to-churn figure specific to games. These require first-party analytics.
