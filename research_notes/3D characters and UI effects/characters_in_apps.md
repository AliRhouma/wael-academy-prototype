# Characters, mascots and presenters in app UI (education and gamified learning focus)

Research date: November 2026. Scope: how successful apps and mobile games use (3D or 3D-styled) characters in UI, what their teams published, what the research says, and what changes for a landscape, Arabic RTL app for Tunisian students aged 15–19. Material from before 2023 is flagged **[older]**. Unverified third-party figures are flagged **[3rd-party]**.

## 1. How leading apps and games use characters, and what their teams published

### Takeaway
The best-documented case is Duolingo. Its characters are not decoration. They are a runtime-driven system built in Rive state machines (idle, speaking, correct/incorrect end states, 20+ shared mouth shapes, combinable head and body loops) and reused across lessons, the home-screen widget, video calls and marketing. Elsewhere, characters show up as a guide/cheerleader (Khan Academy Kids' Kodi), as the user's own dependent (Finch), as a social emote vocabulary (Clash Royale's King) or as a thin marketing hook (Royal Match's King Robert). Primary design writing outside Duolingo and Rive is scarce.

### Cited Findings
**Duolingo: Duo and the World Characters**
- In Nov 2022, Duolingo described lip-sync for its **ten World Characters**. It built a shared set of "20+ mouths", and each character gets its own version of each mouth "styled to match its personality". Phonemes are mapped to visemes by linguistic features. Mouth states run in parallel with body-animation states in one Rive State Machine, exported as a single runtime file. **[older, 2022]** — [Duolingo blog: World character visemes](https://blog.duolingo.com/world-character-visemes)
- Behaviour in a lesson: idle loops (head nods, blinking, eyebrow movement). Tapping a word makes the character say and animate it, and speech stops if the learner finishes first. At the end, the character moves to a final state that reflects whether the answer was right or wrong. Assets have to stay small enough for Android, iOS and the web, and the animation is driven by timing data rather than pre-rendered video. **[older, 2022]** — [Duolingo blog: World character visemes](https://blog.duolingo.com/world-character-visemes)
- Rive's July 2024 post says Duolingo first used Rive for **reward animations** (a chest shaking, gems popping out) before moving to character animation and lip-sync. Duolingo created a "creative technologist" role that owns state-machine logic and input specs between animators and engineers. Clint Fanelli: "It's at a saturation point where we need people fully dedicated to Rive." No engagement numbers were given. — [Rive blog: Creative technologists, Duolingo](https://rive.app/blog/creative-technologists-duolingo-s-solution-to-the-designer-to-developer-handoff)
- The Lily AI video call (Rive, March 2025): Lily picks up, tilts her head and greets the learner. While listening she leans in or furrows her brows. During processing delays she "tilts her head or ponders" so the wait feels intentional. She squints or shakes her head when confused, raises an eyebrow and nods to approve, and signs off sarcastically. Eight head animations and eight body animations combine into "over 64 variations of neutral movements", which avoids repetitive idles. The file is under 1 MB. When her eyes opened too wide, testers found her "too happy" and off-character, so the team dialled the expressions back. — [Rive blog: Lily video call](https://rive.app/blog/duolingo-s-ai-powered-video-call-brings-lily-to-life)
- Duolingo widget (iOS July 2022, Android March 2023, post dated Aug 2023): Duo's mood illustrations change with time of day and whether today's lesson is done. He grows "more and more desperate" as midnight nears and looks relaxed and happy once the streak is safe. A second batch of 25 new illustrations was planned for fall 2023. Duolingo reports that "half of learners with the widget installed have a streak of at least six months" and that widget users retained much better even after controlling for self-selection. The team worried the widget would feel like "just another notification" and used Duo's personality to make it distinct. — [Duolingo blog: widget feature](https://blog.duolingo.com/widget-feature/)
- Duo's 2013 reshaping: species and colour were fixed, and **silhouette came first**: "if the overall silhouette isn't appealing, the details can't complement it." The team picked a slight quarter-turn pose. **[older, 2013]** — [Duolingo blog: Reshaping Duo](https://blog.duolingo.com/reshaping-duo/)
- The 2019 redesign gave Duo more "personality" and a wider range of expressions and movement, and moved to a flatter, more scalable style because two clashing art styles were in use. Tyler Murphy called an earlier, iOS-7-era fully 3D textured Duo "creepier". One report links animating Duo (including his feet) to about a 5% rise in total sessions. That figure comes from a secondary report I could not re-open (InVision's page now redirects), so treat it as unverified. **[older, 2019]** — [Design Week](https://www.designweek.co.uk/issues/2-6-january-2019/duolingo-owl-receives-makeover-as-app-becomes-more-gamified); [Creative Bloq](https://creativebloq.com/news/duolingos-redesigned-mascot-is-a-hoot)
- The Feb 2025 "Duo is dead" campaign: a record 1.7B impressions in two weeks — [Fast Company](https://www.fastcompany.com/91313082/duolingo-dead-duo-owl-social-media-campaign). Daily brand mentions rose from about 11k to about 59.9k — [Meltwater](https://www.meltwater.com/en/blog/duolingo-dead-mascot-campaign). Android downloads rose 38% the day after and web searches 58% (Similarweb) — [TechCrunch](https://techcrunch.com/2025/02/18/duolingo-killed-its-mascot-with-a-cybertruck-and-its-going-weirdly-well). Users were asked to earn 50B XP collectively to revive Duo — [PR Daily](https://www.prdaily.com/duolingo-shares-pr-secrets-of-viral-death-of-duo-campaign/). The campaign also drew criticism — [MediaPost](https://www.mediapost.com/publications/article/403787/duolingos-mascot-killing-stunt-generated-engageme.html)
- Duolingo has also used a "sick"-looking Duo app icon to signal neglect, which caused user concern. — [Creative Bloq](https://creativebloq.com/design/logos-icons/is-duolingo-okay); [Outlook India](https://outlookindia.com/international/us/duolingos-new-sick-app-icon-why-users-are-concerned-and-how-to-change-it-explained)
- I found no official Duolingo character style guide. Personas such as deadpan Lily and energetic Zari are described only on fan and aggregator sites, which disagree on minor characters like Bea. **[3rd-party]** — [duoplanet](https://duoplanet.com/duolingo-character-names/); [Duolingo fandom: Lily](https://duolingo.fandom.com/wiki/Lily)

**Khan Academy Kids**
- The app has five animal characters: Kodi (bear, lead guide), Reya (red panda), Peck (bird), Sandy (dingo) and Ollo (elephant). Kodi "helps students with instructions, helpful tips, encouragement" and reinforces concepts. — [Khan Kids help center](https://khankids.zendesk.com/hc/en-us/articles/360049358751-Learn-more-about-the-characters-inside-Khan-Academy-Kids)
- Kodi celebrates with gestures (jumping, raising her hands, smiling), a body-language-first approach that supports English-language learners. — [Khan Academy blog: English language acquisition](https://blog.khanacademy.org/supporting-english-language-acquisition-with-khan-academy-kids/)

**Finch (self-care pet)**
- In onboarding, the user hatches, names and gives a personality trait to a bird, which creates ownership from minute one. — [screensdesign: Finch onboarding](https://screensdesign.com/articles/finch-app-onboarding-design/)
- Deconstructor of Fun credits the home-screen widget, where the pet keeps "living", as a retention lever. It cites estimated D1/D7 of 54%/37% for Finch against 51%/35% for Duolingo (Sensor Tower estimates). **[3rd-party]** — [Deconstructor of Fun](https://www.deconstructoroffun.com/blog/x0hd2ssr80y5n7gv0w967pg7hwd7tl)
- An analysis of 40,294 App Store reviews found that reviewers who mention their bird tend to keep using the app, and explicitly does not claim causation. — [Appbot](https://appbot.co/blog/finch-app-reviews-emotional-attachment-user-retention-product-loyalty/)

**Habitica**
- Completing or failing real tasks directly changes the user's RPG avatar. The party (social) system is described as its strongest retention mechanic. **[3rd-party]** — [Trophy: Habitica case study](https://trophy.so/blog/habitica-gamification-case-study)

**Royal Match (Dream Games)**
- The official cast is King Robert plus Winston, his butler, who keeps "the king out of trouble during his spontaneous adventures". — [Dream Games: Royal Match](https://dreamgames.com/games/royal-match)
- Reviewers describe King Robert as "barely a character in the traditional sense", a marketing and "save the king" hook rather than a narrative anchor. **[3rd-party]** — [orcz review](https://orcz.com/royal-match-review-the-puzzle-king-that-refuses-to-be-dethroned/)

**Clash Royale (Supercell)**
- King emotes (Laughing, Angry, Crying and so on) are cosmetic social communication with no gameplay effect. The Laughing King became a mainstream meme. Players can mute an opponent's emotes by tapping their king tower, so reactions stay player-controlled and mutable. I found no primary Supercell design write-up. **[3rd-party]** — [itechguides](https://www.itechguides.com/are-clash-royale-emotes-cosmetic-only-what-they-actually-do/); [AFK Gaming](https://afkgaming.com/gaming/general/clash-royale-king-laughing-meme-explained)

### Inferences
- Across the documented cases, one pattern stands out: a character earns its cost when it **reacts to the user's state** (answer right or wrong, streak at risk, waiting for AI) and does not just stand in the frame. Duolingo's investment goes into state machines, not into more static art.
- Rewards were Duolingo's entry point into interactive animation. Character reactions came second. Reward and celebration surfaces are the cheapest place to start a character system.
- Many combinable idle micro-loops (8 × 8) beat one long idle loop, because repetition is what makes a character feel robotic over hundreds of sessions.

### Gaps
- No primary design material found for Brilliant, Headspace, Prodigy, Toca Boca, Pokémon GO (Professor Willow), Mimo or Photomath. Searches returned nothing usable, so they are not characterised here.
- No Supercell or Dream Games GDC talk summaries on character UI were found.
- No public data isolates the mascot's causal effect on Duolingo retention. The widget and campaign figures mix several factors together.

## 2. Presenter vs mascot: when a real person turned into a 3D caricature works, and the risks

### Takeaway
Evidence on realistic synthetic presenters is mixed. AI or avatar instructors produce **equal test scores** to humans in most studies, but **lower engagement** and reports of discomfort or "something off". Stylised (2D or cartoon) agents outperform more realistic 3D ones in meta-analysis. The main documented risk is intrusiveness (Clippy), not appearance. For a real teacher or founder, a clearly **stylised caricature** that stays recognisable is safer than a near-photoreal double.

### Cited Findings
- An IRRODL study (2024) found the AI instructor drew "low video engagement" but performance was the same as with human instructors. Students reported distraction, discomfort and disconnectedness. — [IRRODL](https://www.irrodl.org/index.php/irrodl/article/view/7815/6135)
- A 447-participant management-course experiment found test performance equivalent across conditions, but participants slightly preferred the human-instructor videos. — [arXiv 2412.10384](https://arxiv.org/pdf/2412.10384)
- ICERI 2023 (abstract only): students preferred the human teacher and a human-based avatar (no difference between those two) but "strongly refrain from the synthetic avatar". — [IATED library](https://library.iated.org/view/GAL2023AVA)
- A meta-analysis of multimedia pedagogical agents (32 effect sizes, N = 2104) found a small overall benefit (g ≈ 0.20). **2D agents (g+ ≈ 0.38) outperformed 3D agents (g+ ≈ 0.11)**. **[older, 2021]** — [Castro-Alonso et al., Educ. Psychol. Review](https://doi.org/10.1007/s10648-020-09587-1)
- Duolingo's own team called its early fully 3D textured Duo "creepier" and moved to a flatter style. **[older, 2019]** — [Design Week](https://www.designweek.co.uk/issues/2-6-january-2019/duolingo-owl-receives-makeover-as-app-becomes-more-gamified)
- Over-expression breaks character even in a stylised presenter: Lily's wide-open eyes read as "too happy". — [Rive blog: Lily](https://rive.app/blog/duolingo-s-ai-powered-video-call-brings-lily-to-life)
- The Clippy lesson: the concept (a guide for new users) was sound, but invasiveness drove people away. Microsoft later shipped it off by default. The lesson drawn is "optimize for repeated use, not just first time use". Microsoft's Copilot team: "We're super careful around the nudges." — [Command AI: What Clippy taught us](https://www.commandbar.com/blog/what-clippy-taught-us-all); [Medium/TwentyBN: 5 lessons from Clippy](https://medium.com/twentybn/5-lessons-from-clippys-failure-efc69297eac1); [Nextgov](https://www.nextgov.com/artificial-intelligence/2018/08/microsoft-wants-nudge-us-be-more-productive-do-we-want-its-help/150830/)
- Guilt and "desperate mascot" mechanics work for Duolingo's widget, but they spill into public discomfort: the sick icon caused concern, and the "dead Duo" stunt drew criticism alongside its reach. Users of pet apps also report that caring for the pet can feel like "another task". — [Creative Bloq](https://creativebloq.com/design/logos-icons/is-duolingo-okay); [MediaPost](https://www.mediapost.com/publications/article/403787/duolingos-mascot-killing-stunt-generated-engageme.html); [habi.app: Finch alternatives](https://habi.app/insights/finch-alternatives/)
- Agent effects on learning are larger for K-12 than for post-secondary learners, so effects fade with age. **[older, 2013]** — [Schroeder, Adesope & Gilbert 2013, J. Educ. Computing Research](https://doi.org/10.2190/EC.49.1.a)

### Inferences
- A caricature of a real teacher works best as a **presenter with a clear job** (introducing a chapter, the live-session host, the voice of feedback) with expressions tuned to that person's real temperament, as Duolingo did with Lily's deadpan. It does not work as an always-on mascot.
- For teens aged 15–19, "childish" risk comes mainly from tone (baby-talk, constant cheering, guilt-trips), not from the 3D style. Duolingo's teen-coded cast (sarcastic Lily) shows that a cartoon can be "cool" through attitude. Keep the voice dry and respectful, and let the student mute or skip the character.
- Avoid photoreal 3D for a real person. Use stylised proportions (bigger head, simplified features) so the face stays recognisable without uncanny-valley skin and eye detail.

### Gaps
- I found no case study of an edtech app that turned its founder or teacher into a 3D caricature, with outcome data.
- I found no research on mascot appeal specifically for ages 15–19 or for MENA audiences.

## 3. Psychology and evidence: persona effect, embodiment, emotional design, gaze

### Takeaway
Pedagogical agents give a **small, reliable learning benefit** (g ≈ 0.2) and a larger **motivation/persona** benefit. Gestures and facial expression matter more than voice or agent type. Faces added to learning graphics ("anthropomorphism") help learning and enjoyment. **Where a character looks steers attention**: averted gaze toward content increases looking at and remembering that content, while a character staring at the user pulls attention onto itself.

### Cited Findings
- A gesture meta-analysis (20 experiments, N = 3841) found a persona effect of g ≈ 0.44 for gesturing agents, with smaller gains for retention and transfer. **[older, 2018]** — [Davis 2018, Educ. Research Review (index)](https://data.zhenzhi.com/details/1/913707970)
- A systematic narrative review of agent persona found that higher persona ratings had little effect on learning outcomes. **Facial expressions and gestures** moderated persona more than voice or agent type. **[older, 2021]** — [Davis, Park & Vincent 2021, JRTE](https://informahealthcare.com/doi/full/10.1080/15391523.2020.1830894)
- Agents overall: g ≈ 0.20, and 2D agents beat 3D agents (see section 2). **[older, 2021]** — [Castro-Alonso et al. 2021](https://doi.org/10.1007/s10648-020-09587-1)
- An emotional-design meta-analysis (33 samples, N = 2924) found that facial anthropomorphisms and pleasant colours are useful design principles. The authors note it is unclear whether the mechanism is truly *emotional*. **[older, 2018]** — [Brom, Stárková & D'Mello 2018 (manuscript PDF)](https://artemis.ms.mff.cuni.cz/main/papers/emodesign_manuscript_1rev_180928_FINAL_norev.pdf)
- A 2024 systematic review and meta-analysis found that facial anthropomorphism generally improves multimedia learning outcomes. — [Smart Learning Environments 2024](https://slejournal.springeropen.com/articles/10.1186/s40561-024-00332-7)
- Gaze cueing: in banner ads, the odds of looking at the product rose when a face gazed toward it, animated or not. — [Palcu et al. 2017, Frontiers in Psychology](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5454066/). Averted gaze increased attention to banner text and product and improved brand and message memory, while mutual gaze pulled attention onto the face. — [Sajjacholapunt & Ball 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC3941030). A model looking at the product increased time on the product and logo. — [Hutton & Nolte 2011](https://zendy.io/title/10.1002/acp.1763). Counterpoint: one thesis found no support for the attention account. — [Univie thesis](https://utheses-gateway.univie.ac.at/api/document/get/file/26825) **[older, 2011–2017]**
- Duolingo reports learner feedback that AI conversations with an expressive character feel "less intimidating" than real speaking practice (qualitative only). — [Rive blog: Lily](https://rive.app/blog/duolingo-s-ai-powered-video-call-brings-lily-to-life)
- Attachment and parasocial care drive return visits in pet-style apps (Finch hatching and naming, the widget pet "living"), but the evidence is correlational. — [Appbot](https://appbot.co/blog/finch-app-reviews-emotional-attachment-user-retention-product-loyalty/); [Deconstructor of Fun](https://www.deconstructoroffun.com/blog/x0hd2ssr80y5n7gv0w967pg7hwd7tl)

### Inferences
- Invest the animation budget in **face and gesture reactions** (the documented moderators), not in lavish 3D rendering or voice.
- In content screens the character should **look at the question or CTA, not at the student**. Use direct eye contact only for greetings and celebrations, where the character itself is the message.
- Expect a motivation and "liking" gain more than a test-score gain. Pitch the character as an engagement and emotional-safety tool, not a learning-outcome guarantee.

### Gaps
- Most core agent research predates 2023. I found no 2023–2026 meta-analysis on emotion-reactive characters in gamified apps.
- I found no peer-reviewed data on how mascot reactions (happy or sad) affect long-term retention.

## 4. Character systems: expression sheets, poses, consistency, reuse

### Takeaway
Production systems are **modular**: a shared rig per character, a shared viseme set (20+), combinable head and body idle clips (8 + 8 → 64+), a small set of terminal reaction states (correct, incorrect, approve, confused) and themed static illustration sets for surfaces like widgets (~25 per batch). One character file is reused across lessons, rewards, widgets, AI calls and marketing. Consistency comes from silhouette-first design, per-character personality limits (how far expressions may go) and one owner of state-machine logic.

### Cited Findings
- Shared "20+ mouths" across ten characters, each styled per personality. Mouth layer and body layer run in parallel. **[older, 2022]** — [Duolingo: visemes](https://blog.duolingo.com/world-character-visemes)
- 8 head + 8 body animations become 64+ neutral variations. A state machine drives mouth, expression and camera. Nested artboards let the head and body move independently. The file is under 1 MB. Personality sets an expression ceiling (no wide eyes for deadpan Lily). — [Rive: Lily](https://rive.app/blog/duolingo-s-ai-powered-video-call-brings-lily-to-life)
- Widget: mood illustrations keyed to time-to-midnight and streak status, plus 25 more planned for fall 2023, and a small silhouette version for the lock screen. — [Duolingo: widget](https://blog.duolingo.com/widget-feature/)
- Silhouette-first, fixed colour and species, one hero angle (quarter-turn). **[older, 2013]** — [Duolingo: Reshaping Duo](https://blog.duolingo.com/reshaping-duo/)
- Moving from two clashing art styles to one scalable style was the main driver of the 2019 redesign. **[older, 2019]** — [Design Week](https://www.designweek.co.uk/issues/2-6-january-2019/duolingo-owl-receives-makeover-as-app-becomes-more-gamified)
- Team structure: animators build timelines, creative technologists own state-machine inputs and specs, and engineers integrate. Rewards came first. — [Rive: creative technologists](https://rive.app/blog/creative-technologists-duolingo-s-solution-to-the-designer-to-developer-handoff)
- Khan Academy Kids builds Kodi from simple geometric shapes (taught in a drawing lesson), which helps reproduce her consistently. Her celebration gestures are jump, raised hands and smile. — [Khan Kids drawing lesson](https://classx.org/how-to-draw-kodi-the-bear-character-drawing-for-kids-circle-time-with-khan-academy-kids/); [Khan Academy blog](https://blog.khanacademy.org/supporting-english-language-acquisition-with-khan-academy-kids/)
- Royal Kingdom reused the Royal Match formula with a sibling character (King Richard, King Robert's younger brother), which extends the cast without redesigning the system. **[3rd-party]** — [Deconstructor of Fun: Royal Kingdom](https://www.deconstructoroffun.com/blog/2023/05/09/royal-kingdom-will-it-usurp-the-throne)

### Inferences
- A minimal shippable pose and expression set for a 3D-rendered education character, inferred from the documented systems (counts like 20+ visemes, 16 idle clips and ~25 widget art are the only published anchors):
  - **Idle loops**: blink, breathe, glance toward content, small head tilt (several short combinable clips).
  - **Present/point**: open-hand gesture toward the content side (needs a left version and a right version, see section 5).
  - **Reactions**: correct (nod, small cheer), incorrect (gentle "hmm", never mocking), thinking or waiting, confused.
  - **Celebration**: one big pose for level-up or reward, used sparingly.
  - **Empty state**: a calm "nothing here yet" pose.
  - **Concern**: streak at risk, worried but not desperate, tuned down for teens.
  - **Greeting** for splash and onboarding (direct eye contact).
  - That is roughly 10–15 pre-rendered stills plus a few loops. It is enough to cover onboarding, splash, rewards, errors and empty states.
- For 3D-rendered stills (no real-time 3D), pre-render every pose with the same camera, lens, lighting and rim light, and export transparent PNG or WebP at fixed scales so the character looks like one object across screens.
- Define an "expression ceiling" per character in the style sheet (how far brows, eyes and mouth may go), as the Lily case shows.

### Gaps
- No published total pose or expression counts for Duo, Kodi or game mascots. The numbers above are the only primary anchors.
- No public Duolingo character style guide (design.duolingo.com character pages now redirect to the blog hub).

## 5. Landscape game-style layout, Arabic RTL and Tunisian cultural notes

### Takeaway
In RTL, text and CTAs start on the right. Platform guidance says **directional elements mirror, but illustrations should not be blindly flipped** (flipping can change meaning, and some elements need a version for each direction). Combined with the gaze-cueing evidence, a character in an RTL layout should normally sit on the **outer edge, opposite the reading flow**, and **face and gesture inward toward the content and CTA**, using purpose-made poses, not CSS `scaleX(-1)`. Use the open hand, not index-finger pointing, for Arab audiences.

### Cited Findings
- Material Design: icons tied to direction mirror (back and forward reverse). Objects that look the same everywhere, and hand-held objects for right-handed majorities, do not. Check each symbol for directionality before flipping. — [Material Design: bidirectionality](https://m2.material.io/go/design-bidirectionality); [Material v1](https://m1.material.io/usability/bidirectionality.html)
- Wikimedia Codex: keep the original orientation of images and illustrations, because flipping may change their meaning. — [Codex: bidirectionality](https://doc.wikimedia.org/codex/main/style-guide/bidirectionality.html)
- Cloudscape: some elements, such as illustrations, "may require a version for each direction". — [Cloudscape: bidirectionality](https://cloudscape.design/foundation/core-principles/bidirectionality/)
- Guidelines conflict on media controls and checkmarks (Wikimedia mirrors them, Material and Adobe do not). Do not mirror time and clock icons. — [Adobe Spectrum: bi-directionality](https://spectrum.adobe.com/page/bi-directionality)
- Gaze toward content raises attention to it and memory for it, while gaze at the viewer competes with it. — [Palcu et al. 2017](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5454066/); [Sajjacholapunt & Ball 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC3941030)
- Gestures in the Arab world:
  - Pointing with the index finger is widely considered rude in Arab countries; use the whole open hand. — [Irish Times](https://www.irishtimes.com/news/how-to-lose-friends-and-alienate-people-1.1275324); [Wikivoyage: Gestures](https://en.wikivoyage.org/wiki/Gestures)
  - Thumbs-up: sources conflict. Some say it is offensive in parts of the region (historically Iran and Iraq), while others say it means "OK/agreed" in most of the modern Arab world. — [Wikipedia: Obscene gesture](https://www.wikipedia.org/wiki/Obscene_gesture); [englishtoarabic guide](https://englishtoarabic-org.pages.dev/culture/gestures/)
  - The OK sign can read as "zero" or mildly insulting in parts of the Mediterranean Arab world. — [englishtoarabic guide](https://englishtoarabic-org.pages.dev/culture/gestures/)
- Kodi's gesture-led celebrations (jump, raised hands, smile) are cited as language-independent, which helps learners in a second language. — [Khan Academy blog](https://blog.khanacademy.org/supporting-english-language-acquisition-with-khan-academy-kids/)

### Inferences
- **RTL placement rule**:
  - In an Arabic screen, the CTA usually sits at the inline-end (left) or bottom-left.
  - Put the character at inline-start (right) or in a lower corner, turned and gesturing toward the content and CTA. In an LTR (French) screen, reverse this.
  - Ship each "present" pose as a **left-facing and a right-facing render** and pick by `dir`.
  - Do not mirror with CSS: asymmetric props, a watch, writing hand, a logo on clothing or Arabic text on a prop would all come out reversed.
- **Landscape game layout**: wide screens leave room for a persistent side-stage character (a quarter to a third of the width) beside the content, as in Duolingo's lesson characters and visual-novel layouts. Keep it out of the thumb zones where CTAs live, and shrink or hide it during focused problem-solving so it does not compete with the task. Use full-stage presence only for splash, onboarding, level-up and empty states.
- **Gestures to standardise**:
  - Use the open palm to present, both hands raised to celebrate, and hand-on-chin to think.
  - Avoid index-finger pointing at the user, the OK sign and a sole-of-shoe show.
  - Use thumbs-up only after local testing with Tunisian teens.
- **Tone for Tunisian teens aged 15–19**:
  - Use a dry, encouraging, peer-like voice (closer to Lily than to Kodi).
  - Do not show desperation or guilt about streaks. Duolingo's widget mood shift is fine; a "dying" mascot is not, for an exam-prep (baccalauréat) audience under stress.
  - Make the character mutable and skippable, following the Clippy and Clash Royale "mute" lessons.

### Gaps
- I found no research or published case study on character placement or gaze direction specifically in RTL interfaces. The placement rule above is inferred from bidi guidelines plus gaze-cueing research.
- I found no Tunisia-specific gesture or emoji sources. Thumbs-up and similar gestures should be tested with local users.
- I found no data on how MENA teens perceive cartoon mascots in learning apps.
