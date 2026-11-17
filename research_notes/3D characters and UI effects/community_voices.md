# Community voices: 3D characters and 3D effects in app UI, and consistent 3D characters made with AI

Research date: 16 Nov 2026. Researcher: sub-agent (deep-research).

**Read this first: how much of this is "community" material.**
- **Reddit:** reddit.com could not be read. The search tool refuses the domain ("not accessible to our user agent"), and general searches that named subreddits (r/UI_Design, r/userexperience, r/gamedev, etc.) returned no Reddit threads. **None of the points below come from a Reddit thread.** The closest community substitutes are an itch.io dev-forum thread, Steam/itch.io comments, the Framer and Webflow forums, and practitioner blogs and Substacks.
- **X/Twitter:** X article pages returned HTTP 402 when fetched. X material comes from search-result titles only.
- **LinkedIn:** searches returned no posts.
- **YouTube:** a fetched video page held only navigation chrome, with no description and no transcript. YouTube items are cited by title and URL from search results, plus written digests or companion docs where they exist.
- **Labels:** every point marked "(via search snippet)" was not opened directly. Points without that label were fetched and read.

---

## 1. Community opinion on 3D mascots and 3D UI in apps: premium or gimmicky, performance, "AI slop", teen audiences

### Takeaway
Practitioners treat 3D characters and clay/soft-3D UI as polarising.
- **When it reads as premium:** soft 3D feels premium when it is restrained, playful-brand-appropriate, and tied to a job in the product.
- **When it reads as fatigue:** 3D characters "on nearly every website", generic and heavy, have produced visible designer fatigue. Heavy 3D runtimes (Spline especially) draw repeated performance complaints on mobile and low-end devices.
- **AI risk:** separately, gamers and Gen Z react negatively to visible or suspected AI art. In a teen-facing product, an obviously AI-generated mascot carries real brand-trust risk.

### Cited Findings
**Fatigue / gimmick perception**
- A UI/UX blog post titled "2024 design trends i am sick of" (Dec 2023, no author named) lists 3D characters first. Its complaints:
  - overexposure, "popping up on nearly every website"
  - recycled, clichéd character designs
  - resource-heavy rendering that slows sites, especially on mobile
  - overly detailed characters that distract
  - characters that don't support the story, becoming "mere eye candy"

  — [Pixeldarts](https://www.pixeldarts.com/post/2024-design-trends-i-am-sick-of)
- A 2026 icon-trend roundup:
  - The current form of 3D is "soft"/clay-style: rounded shapes, gentle lighting, not heavy realism.
  - It advises avoiding 3D unless the brand is explicitly playful, and says 3D suits playful brands rather than SaaS or productivity apps.

  — [ManyPixels, icon trends 2026](https://www.manypixels.co/blog/illustrations/icon-trends) (via search snippet)
- A trend guide says chrome/liquid-metal 3D has trended so hard in 2025–26 that "you've seen it in a hundred app icons" — [techyheaven, UI design trends 2026](https://techyheaven.com/ui-design-trends-2026/) (via search snippet)
- Other trend writers argue the opposite: 3D's dominance "will be only growing", and it "makes products feel expensive" but costs more dev effort — [softwaretestinghelp](https://www.softwaretestinghelp.com/ui-ux-design-trends/); [techyheaven](https://techyheaven.com/ui-design-trends-2026/) (both via search snippet)

**Restraint and craft tips for soft 3D**
- Keep a 3D icon set coherent: same light direction, viewing angle, depth, material and shadow softness across all icons. Too much "puffiness" looks childish and hurts readability — [Megabant](https://www.megabant.com/3d-social-media-icons-design-trends-and-best-practices/) (via search snippet)
- Clay/tactile UI tips — [DiCristina Creative](https://dicristinaphoto.com/soft-and-tactile-the-designers-guide-to-claymorphism/) (via search snippet):
  - Use depth to highlight key actions, not every element.
  - Show a press by flipping inner and outer shadows.
  - Sharp corners undercut the look.
  - Clay can be done with CSS box-shadows and gradients rather than heavy 3D renders.
- Mascot-design guides add — [svgapp.ai](https://svgapp.ai/blog/app-mascot-design-product-moments/); [characteranimationai](https://www.characteranimationai.com/blog/app-mascot-design-guide) (via search snippet):
  - Most modern app mascots are flat or semi-flat because those scale cleanly and animate cheaply. This is a stated trade-off against 3D.
  - Use 2–4 core states.
  - Give the mascot a "job".
  - Test that the silhouette reads at small sizes.

**Performance complaints (forums)**
- Framer community: a Spline model made a site "extremely laggy" on a laptop without a dedicated GPU, taking about 6 s to appear. Staff advised simplifying models and textures and testing on Windows and mobile — [Framer community](https://www.framer.community/c/support/spline-3d-models-slows-website-on-some-pcs) (via search snippet)
- Webflow forum, "Spline has a bad effect on pagespeed":
  - The embed seems to always load about 1.5 MB.
  - Safari is slower than Chromium or Firefox.
  - Suggested fixes are custom-code and advanced lazy-loading, plus a preloader to mask the delay.

  — [Webflow forum](https://discourse.webflow.com/t/spline-has-a-bad-effect-on-pagespeed-issue/259849) (via search snippet)
- A Spline-focused newsletter admits "everyone complained" about Spline load speed. It reports Spline's newer runtime loads only the features a scene uses — [splinetime3d Substack](https://splinetime3d.substack.com/p/spline-womp-and-unicorn-studio-updates) (via search snippet)
- Review sites call Spline scenes GPU-expensive and "brutal on mobile", with degraded or broken experiences on slow devices — [fabric.so Spline review](https://fabric.so/comparison/spline-review); [designtools.fyi](https://designtools.fyi/tools/spline) (via search snippet)
- A Spline guide warns embeds hurt Core Web Vitals (LCP, TBT) — [Hedrick, Spline 3D guide 2026](https://hedrick.io/post/spline-3d-guide) (via search snippet)

**Rive vs Lottie for character animation (blogs, vendor-adjacent)**
- **Callstack benchmark:** Rive ran at about 60 FPS against Lottie's 17 FPS, but used more RAM (276 MB vs 246 MB) — [Callstack](https://www.callstack.com/blog/lottie-vs-rive-optimizing-mobile-app-animation) (via search snippet)
- **Runtime size:** Rive's runtime is about 200 KB gzipped (it includes WASM), against about 60 KB for lottie-web. One mascot-focused estimate puts the total budget at 160–240 KB (runtime plus a mascot .riv) — [aidxn](https://aidxn.com/engineering/lottie-animations-vs-css-vs-rive-2026/); [yokaify](https://yokaify.com/blog/rive-vs-lottie) (via search snippet)
- **Rule of thumb:** use Rive for behaviour-driven mascots and Lottie for timeline animations. LottieFiles counters that dotLottie is about 80% smaller than JSON, which narrows the gap — [unicornicons](https://unicornicons.com/learn/rive-vs-lottie); [LottieFiles blog](https://lottiefiles.com/blog/lottie-animations/lottiefiles-or-rive) (via search snippet)

**"AI slop" perception: gamers and devs**
- itch.io dev forum thread "Do you struggle with AI art consistency in your games?" (Jun 2026):
  - The OP says AI assets look "like they're from 3 different games", with broken hands and inconsistent lighting.
  - A moderator replies that consistency is impossible with gen-AI and advises hiring an artist.
  - Other devs say AI output always needs manual cleanup.

  — [itch.io thread](https://itch.io/t/6518855/do-you-struggle-with-ai-art-consistency-in-your-games)
- Project Zomboid (2025): fans suspected AI-made menu and loading-screen art. The devs said the debate overshadowed a launch two years in the making. Mere suspicion was enough to cause damage — [strayspark blog](https://www.strayspark.studio/blog/ai-slop-game-development-using-ai-responsibly) (via search snippet; the author is an AI-tool studio, so possible bias)
- An itch.io dev replaced their AI cover and banner art with handmade art "very fast" after criticism. Another itch.io user reports "vitriolic hate" even toward devs who openly disclose AI use — [itch.io post](https://itch.io/post/12983810); [itch.io post](https://itch.io/post/9880911) (via search snippet; exact post-to-quote mapping unverified)
- A Steam forum thread cites a Bloomberg column (May 2025): "Players kind of hate generative AI". Even background art carries "a tinge of ickiness" — [Steam forum](https://steamcommunity.com/discussions/forum/12/601905718689404150/?ctp=2) (via search snippet)

**Teen / Gen Z audience**
- **Klaviyo 2026 consumer report:** Gen Z is about 28% more likely than average to lose trust in brands using AI content. 41% trust brands less when AI content is clearly visible. They notice "AI slop" 63% more often than average — [Klaviyo](https://klaviyo.com/blog/how-gen-z-use-ai) (via search snippet)
- **Common Sense Media (Jan 2025, US teens):** 73% want AI images labelled or watermarked. About a third say gen-AI makes online info harder to trust — [TechCrunch](https://techcrunch.com/2025/01/29/report-majority-of-u-s-teens-have-lost-trust-in-big-tech/) (via search snippet)
- **Gallup/GSV/Walton (2026, US ages 14–29):** excitement about AI fell 14 points and anger rose 9 points in a year — [Fast Company](https://fastcompany.com/91577499/gen-z-ai-every-day-less-trust) (via search snippet)
- **Counterpoint on mascots and teens:** Duolingo's social lead Zaria Parvez says Gen Z "wants to be entertained, not sold to". The team chases ideas, not trends. The owl's persona grew from an existing user meme about pushy notifications — [business.com interview](https://www.business.com/b-newsletter/content/duolingo-tiktok/); [HubSpot](https://blog.hubspot.com/marketing/duolingo-unhinged-content) (via search snippet)

### Inferences
- Across sources, the line between premium and gimmicky is purpose plus restraint: one character with a job, a coherent material and light language, and depth reserved for key actions. Gimmicky reads as generic 3D blobs everywhere, heavy load, and characters as decoration.
- For a teen audience, the bigger risk is not 3D itself but 3D that reads as AI-generated: plastic Pixar sheen, drifting details between screens. Gen Z appears more sensitive to visible AI than average, and gamers punish even suspected AI art.
- Heavy real-time 3D (Spline/three.js) on mobile is the most-complained-about technical choice. Pre-rendered 3D (PNG/WebP, sprite sheets) or Rive-style 2.5D avoids most of these complaints.

### Gaps
- No direct Reddit opinions could be collected, because reddit.com is blocked for this tool. The requested subreddit sentiment (r/UI_Design, r/userexperience, r/mobiledev, r/reactjs, r/webdev, r/3Dmodeling) is therefore missing. A human should search these manually: "3D mascot", "Spline performance", "AI mascot".
- No teen-specific qualitative reactions to 3D mascots in study apps were found. The data above covers AI content in general, not 3D characters.

---

## 2. X/Twitter and LinkedIn: designers and studios posting 3D character UI work, with notable tips

### Takeaway
Little first-hand X/LinkedIn content was reachable: X articles are paywalled to fetchers (HTTP 402), and LinkedIn posts didn't surface. The richest primary practitioner material on mascot UI is Duolingo's own engineering/design blog on its Rive character system. X posts that did surface are mostly prompt-shares for 3D icon renders and AI sprite workflows.

### Cited Findings
**Duolingo character system (primary, 2022, still the canonical reference)** — [Duolingo blog, Vahidsafa & Lenzo, "World character visemes", 10 Nov 2022](https://blog.duolingo.com/world-character-visemes)
- **Why Rive:** small files that run on Android, iOS and web, and a clean animator-to-engineer handoff.
- **Scale:** hand-animating lips for ten characters across 40+ languages and 100+ courses was "completely out of the question".
- **Structure:** a Rive state machine runs body-pose states and mouth states at the same time. Each character has its own set of 20+ personality-matched mouth shapes (visemes).
- **Data, not video:** the app sends audio plus phoneme timings, which drive the state machine. This keeps payloads small and lets the character react in real time, e.g. stop speaking if the user finishes early.
- **Tooling:** the team built a "factory" to generate viseme timings and tools to audit and correct them at scale.

**X posts and articles (titles only; bodies not fetched)**
- **3D icon prompt share:** an X prompt-share for a "premium cinematic product-style render" of 3D app-icon buttons built around a provided character — [@edizkan_ on X](https://x.com/edizkan_/status/2047188097327042992) (via search snippet)
- **Mascot apps with AI:** X article "How I Design, Animate, and Ship Mascot Apps Using ChatGPT Image 2.0" — [@askwhykartik on X](https://x.com/askwhykartik/article/2069041508121186685) (fetch returned 402; title only)
- **Sprite sheets:** X article "How to create a game-ready 2D sprite sheet for ANY animation" — [@LayrKits on X](https://x.com/LayrKits/article/2050277473116619240). The same content is on the LayrKits site; see section 3.

**Spline team (TikTok; social, not X)** — [Spline TikTok 1](https://www.tiktok.com/@splinedesign/video/7332624652331666694); [Spline TikTok 2](https://www.tiktok.com/@splinedesign/video/7254258107600096517) (via search snippet)
- The "Follow" event makes objects follow the cursor with no states needed.
- They suggest using it as a website easter egg.

**Mascot UI craft (AI-assisted, indie iOS dev)** — YouTube channel @adamlyttleapps, "How I Used AI to Design and Animate My App Mascot", summarised by a WisdomAI digest dated 31 Oct 2025 — [WisdomAI digest](https://www.wisdomai.com/insights/adamlyttleapps/app-mascot-ai-design-swiftui-character-animation-54218ce5)
- **Design for function first:** in a piano app, the cat's stripes echo the keys and it wakes on wrong notes.
- **Keep it minimal:** quicker to draw, more consistent across poses, cheaper to animate.
- **2–4 states:** idle, success, error, celebration.
- **Build:** use layered transparent PNGs animated independently in SwiftUI rather than skeletal rigs.
- **Motion:** subtle, staggered motion — a delayed tail wag, slight head overshoot, small gravity bounces. "The secret is never a huge animation."
- **Warnings:**
  - Don't let AI invent the concept; use it to refine your sketches.
  - A mascot that only decorates feels "bolted on".

### Inferences
- The most transferable studio lesson, from Duolingo: build the character as a runtime-driven state machine (poses × expressions/mouths) fed by app events. Rendering animations to video doesn't scale and can't react.
- Practitioners converge on "few states, subtle motion, a functional link to the product" over elaborate 3D showpieces.

### Gaps
- No LinkedIn posts were retrieved, and no X threads were readable in full. Posts by Rive, Spline or Duolingo designers on X, and "3D icon / clay UI" threads by Dribbble/Behance designers, could not be verified. A manual pass on x.com (logged in) and LinkedIn is recommended.
- No Rive-team statements on 3D (Rive's 3D is described by third parties as "experimental/beta") were found from a primary source — [unicornicons](https://unicornicons.com/learn/rive-vs-lottie) (via search snippet)

---

## 3. YouTube tutorials and talks: practical steps and pitfalls

### Takeaway
Video tutorials cover three areas:
- **(a)** minimal, functional mascot design with AI refinement
- **(b)** Spline cursor-reactive 3D heroes
- **(c)** AI pipelines that lock identity first, then re-pose: Scenario character/style training, Nano Banana character sheets, Midjourney --oref, then image-to-video with start/end frames, then frame extraction into sprite sheets

The recurring pitfalls are drift, edge clipping, background-removal damage, and loops that look stuck. Most video bodies could not be read, so the steps below come from the same creators' or vendors' written companions where those exist.

### Cited Findings
**(a) Designing 3D/AI mascots for apps**
- @adamlyttleapps workflow — [WisdomAI digest of the video](https://www.wisdomai.com/insights/adamlyttleapps/app-mascot-ai-design-swiftui-character-animation-54218ce5):
  1. Sketch the concept and core poses.
  2. Refine proportions and expressions with ChatGPT or Nano Banana.
  3. Export transparent layers.
  4. Animate the parts independently in SwiftUI.
  5. Map states to app events.
  6. Use AI video only for short marketing clips.

**(b) Spline / 3D for web UI**
- YouTube tutorials (descriptions only):
  - "How to Design a Modern Cursor Interactive 3D Animated Website/Prototype with Figma & Spline" — [YouTube](https://www.youtube.com/watch?v=wK7ZfZLWhJ4)
  - "Interactive 3D Robot with Spline & Next.js" — [YouTube](https://www.youtube.com/watch?v=7_seu9xcXo8)

  (both via search snippet; contents not verified)
- Companion written guidance — [Hedrick](https://hedrick.io/post/spline-3d-guide); [splinetime3d, "31 Things I Wish I Knew…"](https://splinetime3d.substack.com/p/31-things-i-wish-i-knew-when-i-started) (via search snippet):
  - Use Follow for position or Look At for facing.
  - Set events to Global for full-window cursor tracking.
  - Strip unnecessary objects and textures.
  - Expect LCP/TBT costs.

**(c) AI pipelines for consistent characters**

*Scenario (official videos + docs)*
- **Videos:**
  - "Create Style-Consistent Game Assets with Custom-Trained AI Models" (talk by Scenario CEO Emmanuel de Maistre) — [YouTube](https://www.youtube.com/watch?v=Ag2Ta-N7OEU)
  - "Train A Character Model" — [YouTube](https://www.youtube.com/watch?v=aQZpeeLUXWs)
  - "Use Character Reference in Scenario to Create Consistent Character Designs" — [YouTube](https://www.youtube.com/watch?v=rdGe376gR40)
  - "Building AI Workflow Templates for Consistent Character Turnarounds and 2.5D Game Assets" — [YouTube](https://www.youtube.com/watch?v=7u2FBSB3vck)

  (all via search snippet)
- **Turnarounds** — [Scenario blog, 9 Oct 2025, updated 3 Mar 2026](https://www.scenario.com/blog/generate-character-turnarounds-scenario)
  - Three routes:
    - **Edit with Prompt:** Gemini 2.5 / Flux Kontext / GPT / Seedream Edit / Runway Gen4.
    - **Pixverse v5 "360° Microwave" effect:** capture front, side and back frames from a 5 s clip.
    - **Custom-trained models:** a sketch reference in img2img, or a front/side/back grid with ControlNet Pose.
  - Use a character model, not a style model, when identity must hold. A style model keeps the look but identity can vary between poses.
  - Prompt order: style, then character description, then a technical clause ("orthographic views, consistent lighting").
  - Pitfalls:
    - features shift between views (raise ControlNet pose influence)
    - small face and outfit mismatches (fix in Retouch, focusing on face and hands)
    - Pose mode struggles with stylised or exaggerated designs
    - an influence slider set too high makes output rigid; too low lets the model reinterpret
- **Character model vs style model** — [Scenario help: character variations](https://help.scenario.com/articles/4310019350-generate-character-variations-with-image-to-image); [Scenario help: multi-character scenes](https://help.scenario.com/articles/8459982289-generate-multi-character-scenes) (via search snippet)
  - A character model holds faces and outfits.
  - A style model "does not guarantee" defining features stay the same in every pose.
  - Newer pages say Nano Banana Pro or Seedream 4.5 often match or beat older multi-step workflows.
- **Hyper-casual characters** — [Scenario blog, hyper-casual characters](https://www.scenario.com/blog/creating-hyper-casual-mobile-characters) (via search snippet)
  - Reuse the trigger prompts that match your training captions.
  - Embed "solo" and "no background" to avoid extra characters and artifacts.
- **Spritesheets** — [Scenario help, "Create Spritesheets with Scenario"](https://help.scenario.com/articles/9088582240-create-spritesheets-with-scenario)
  - Steps:
    1. Generate a base pose and run "Convert to Video" with Seedance (first frame plus an optional last frame).
    2. Preview the clip and identify key poses (contact, lift-off, mid-stride).
    3. Extract about 8 frames for a run cycle at the same format and resolution.
    4. Align the frames evenly on a sheet.
    5. Test the loop in an engine.
  - Attack moves: render neutral to attack, then swap the first and last frames to render attack back to neutral, and merge the two (16 frames).
  - Caveats:
    - motion can be slow or imperfect, so pick only the essential frames
    - several models (Seedance 1 Lite/Pro, Pixverse v4.5) are now deprecated
- **Nano Banana use cases** — [Scenario blog, Nano Banana use cases](https://www.scenario.com/blog/nano-banana-use-cases-ai-content-creation); [Scenario changelog](https://www.scenario.com/changelog) (via search snippet)
  - Scenario claims Nano Banana "effectively solves" feature stability across edits.
  - A changelog entry says Nano Banana 2.1 accepts up to 14 reference images.

*Nano Banana / Gemini (YouTube)*
- Videos:
  - "How to Make Perfect Consistent Character Sheets with Nano Banana Pro" — [YouTube](https://www.youtube.com/watch?v=aoynusO5PUc). The snippet shows its prompt: a front, back and profile full-body turnaround plus facial close-ups, neutral background, neutral A-pose.
  - "Nano Banana in Action: Proportions, Stitching, and Re-Posing Characters" — [YouTube](https://www.youtube.com/watch?v=Nn8G9zJlW8o)
  - "How to Create Consistent Characters with Nano Banana 2 (Easy Workflow)" — [YouTube](https://www.youtube.com/watch?v=q2HrtCCmzdc)
  - "How to Create consistent character edits across Scenes with Nano Banana" — [YouTube](https://www.youtube.com/watch?v=YafeGI4ZGt0)

  (all via search snippet; the fetched page contained no description)
- Channel names, dates and transcripts were not retrievable. Some videos predate Nano Banana Pro/2, so behaviour may differ.

*Midjourney --cref / Omni-Reference (V7)* — [prompt-architects](https://prompt-architects.com/blog/92-midjourney-character-consistency-cref-oref); [aicreative.tools](https://aicreative.tools/guides/midjourney-character-consistency); [tegutegu (picture-book production)](https://note.com/tegutegu_cat/n/naa3d9e546b68?hl=en) (via search snippet; numerical "x% better" claims in some blogs are uncited and discarded)
- **One reference:** --oref accepts one image. A multi-pose collage can serve as that single reference.
- **Weights:**
  - --ow of about 100–400 for illustration.
  - Go below 100 when changing outfit or hair, ideally with a face-only reference.
  - 300+ tends to clone the reference, and very high weights get unpredictable.
- **Style:** pair it with --sref for style. If you want a different style from the reference, name the style at the start and end of the prompt.
- **Editing limits:** --oref outputs can't be inpainted, outpainted, varied by region, panned or zoomed. Strip --oref/--ow in the Editor first.
- **Cost:** it costs 2× GPU time.
- **Quality check:** judge consistency on a grid, not one hero image.

*Image-to-video for character animation (Kling, PixVerse, Seedance) → sprite sheets*
- **LayrKits guide** (no date or author; partly AI-written) — [LayrKits sprite-sheet guide](https://www.layrkits.com/guides/sprite-sheet); [GitHub repo](https://github.com/LayrKits/Sprite-Pipeline)
  - Steps:
    1. Generate one full-body, centred character on flat #00FF00 with generous margins. Make it about 40–50% of canvas height for idle; use a small transition pose for other animations rather than an extreme one.
    2. Use it as the Kling first frame, with the camera locked and the motion described step by step.
    3. Extract frames with system FFmpeg.
    4. Build a contact sheet and pick the start, end and key beats first, then add in-betweens. Make 12-frame sheets for the game and 24-frame sheets as smoother references.
    5. Chroma-key with despill.
    6. Use a preserve-canvas layout in 256×256 cells, with no per-frame recentering.
    7. QA for clipping, duplicates and motion pops.
  - Pitfalls:
    - image models can't draw walk cycles or legs reliably
    - video models animate wider than the first frame, so props and feet leave the canvas
    - long direction-lock prompts cause rotation or travel drift
    - the same image as first and last frame gives a near-still video
    - jumps and landings drift vertically, so add dust and FX as overlays
    - chroma-key eats green or cyan details
    - per-frame recentering fakes motion
    - edge contact can't be recovered later
    - last frames too similar to the first make loops look stuck
    - don't let a coding agent delete files
- **Kling official guidance** — [kling.ai blog](https://kling.ai/blog/how-can-i-make-animation-video); [Luma Kling 4.0 guide](https://lumalabs.ai/learning-center/articles/kling-4-complete-guide) (via search snippet)
  - First/last-frame mode works best when both images share subject and setting.
  - Keyframes support first, last, first+last and intermediate frames.
- **Community Claude Code skill** — [GitHub, TamerinTECH](https://github.com/TamerinTECH/claude-skill-klingai-animation) (via search snippet)
  - Pipeline: Kling clip, then ffmpeg frames, then chroma-key, then a CSS sprite sheet.
  - Rules: character centred, no camera movement.
- **Course lesson** "Define Start and End Frames in Kling" — [Futurepedia](https://www.futurepedia.io/courses/creating-movies-with-ai-complete-course/lessons/start-and-end-frames-in-kling) (via search snippet)

### Inferences
Practitioners converge on one pipeline:
1. Lock identity once: a character sheet or turnaround on a neutral background, with fixed lighting language.
2. Re-pose by editing from that master: Nano Banana / Kontext / --oref, or a trained character model for long runs.
3. Animate with image-to-video from a pose image: locked camera, centred subject, flat chroma background, margins.
4. Extract and curate frames by hand.
5. QA loops and edges.

Two further points from these sources:
- Always reference the master, not the latest output, to avoid cumulative drift.
- For UI mascots, short subtle loops (idle, success, error, celebrate) are both the most achievable with AI video and the most recommended by app designers.

### Gaps
- No YouTube transcripts were accessible. Video-specific steps for the Nano Banana, Midjourney and Kling tutorials could not be verified beyond titles and snippets.
- No PixVerse-specific practitioner video was verified beyond Scenario's documentation of its effects.
- No Blender-to-web (glTF/three.js) practitioner video was retrieved for this question.

---

## 4. Common pitfalls named by practitioners

### Takeaway
The pitfalls practitioners name most often:
- style and identity drift between poses
- lighting mismatches between separately generated images
- hands and fingers
- over-smooth, uncanny faces
- heavy 3D files and runtimes
- legal exposure, for two reasons: purely AI-generated art is not copyrightable in the US, and caricaturing a real person engages publicity and likeness rights

### Cited Findings
**Style/identity drift**
- If every new pose references the newest frame, the character slowly drifts; compare against the master reference. Change one variable at a time (camera, outfit, action) — [Spritefy](https://spritefy.com/blog/consistent-ai-pixel-art-characters) (via search snippet)
- Review all poses side by side in one grid. Log recurring drift and fix the reference sheet instead of tweaking single prompts — [neolemon guide](https://www.neolemon.com/blog/ultimate-guide-to-creating-consistent-characters/) (via search snippet)
- "Pixar style" alone is a weak anchor. Use a specific descriptor plus a short style bible (palette, shading, line weight) — [neolemon Pixar guide](https://www.neolemon.com/blog/ai-pixar-generator-copyright-safe-guide/); [selfielabstudio](https://selfielabstudio.com/blog/3d-stylized-characters-minimal-pixar-prompts-20260219) (via search snippet)
- Several sources (by AI-tool vendors) recommend building a 3D reference pack: front, side, back and 2–3 poses under the same lighting — [neolemon](https://www.neolemon.com/blog/ultimate-guide-to-creating-consistent-characters/) (via search snippet)
- A practitioner writes that "Veo 3 does not solve the character consistency problem" — [winterspeak Substack](https://winterspeak.substack.com/p/veo-3-does-not-solve-the-character) (via search snippet; body not read)
- itch.io devs:
  - Train a LoRA or checkpoint per style.
  - Some switch to 3D rendering precisely to keep style consistent.

  — [itch.io thread](https://itch.io/t/6518855/do-you-struggle-with-ai-art-consistency-in-your-games)

**Inconsistent lighting**
- One artist found even the best pair of generations had different lighting and "would not look right in the same frame". Another source says small lighting or angle changes worsen identity consistency — [evartology Substack comments](https://evartology.substack.com/p/image-and-video-ai-character-consistency-step-by-step-beginner-guide/comments); [imagine.art](https://www.imagine.art/blogs/character-design-essentials-maintaining-consistency-in-visual-storytelling) (via search snippet; attribution between the two sources not fully verified)
- Scenario's only lighting control is a "consistent lighting" clause in the prompt — [Scenario turnaround blog](https://www.scenario.com/blog/generate-character-turnarounds-scenario)

**Hands/fingers**
- itch.io fixes — [itch.io thread](https://itch.io/t/6518855/do-you-struggle-with-ai-art-consistency-in-your-games):
  - Cut out the bad hand and regenerate it at about 40–50% strength in Krita AI Diffusion.
  - Use low-strength passes or FaceFusion for faces.
  - Hand-edit regardless.
- Compose so hands sit at the sides, are out of frame, or hold an object. In video, finger count and shape change from frame to frame — [glbgpt](https://www.glbgpt.com/hub/why-ai-video-gets-hands-and-faces-wrong); [emazzanti](https://www.emazzanti.net/blogs/articles/ai-extra-fingers-digital-art) (via search snippet)
- Scenario advises focusing Retouch on face and hands — [Scenario blog](https://www.scenario.com/blog/generate-character-turnarounds-scenario)

**Uncanny faces**
- Flawless skin, perfect symmetry and uniform lighting read as synthetic. Small faces (about 30×30 px in a 1024² image) lack the detail to render well — [kyndrify](https://kyndrify.com/articles/why-ai-faces-look-distorted); [ryla.ai](https://ryla.ai/en/blog/how-to-make-ai-generated-people-look-more-realistic/) (via search snippet)

**Heavy files / performance**
- See section 1: Spline loads about 1.5 MB with roughly 6 s lag on weak laptops; the Rive runtime is about 200 KB; Callstack benchmarked FPS and RAM — [Webflow forum](https://discourse.webflow.com/t/spline-has-a-bad-effect-on-pagespeed-issue/259849); [Framer community](https://www.framer.community/c/support/spline-3d-models-slows-website-on-some-pcs); [Callstack](https://www.callstack.com/blog/lottie-vs-rive-optimizing-mobile-app-animation) (via search snippet)
- Duolingo avoids video by shipping audio plus timing data that drives a Rive state machine — [Duolingo blog](https://blog.duolingo.com/world-character-visemes)

**Caricaturing a real person (legal/ethical)**
- **Copyright Office digital replicas report (Jul 2024):** it recommends a federal right covering all people and finds state publicity and privacy laws too narrow in places. Its proposed liability standard requires actual knowledge that a replica is unauthorized — [Jenner & Block](https://www.jenner.com/en/news-insights/client-alerts/us-copyright-office-issues-digital-replica-report-finding-urgent-need-for-new-federal-legislation); [Authors Alliance](https://authorsalliance.substack.com/p/some-initial-thoughts-on-the-us-copyright) (via search snippet)
- **Likeness and copyright:** a person's voice and likeness are not copyrightable. Protection comes from state privacy and publicity rights. The NO FAKES bill (federal) is still described as pending — [rightofpublicityroadmap](https://rightofpublicityroadmap.com/news_commentary/copyright-office-calls-for-congressional-action-on-digital-replicas/) (via search snippet)
- The project is Tunisian, and no Tunisian or EU-specific practitioner guidance was found. See Gaps.

**Licence / ownership of AI outputs**
- **Thaler v. Perlmutter (D.C. Cir.):** AI can't be an author. It left open how much human contribution suffices. A cert petition was filed Oct 2025 — [Carlton Fields](https://www.carltonfields.com/insights/publications/2025/no-copyright-protection-for-ai-assisted-creations-thaler-v-perlmutter); [Mondaq](https://www.mondaq.com/unitedstates/new-technology/1704524/dr-thaler-is-right-in-part) (via search snippet)
- **Allen v. Perlmutter (Midjourney image):** 600+ prompts were not enough. Only human post-generation edits are registrable, with the AI portions disclaimed. The case was stayed in Oct 2025 — [Mondaq](https://www.mondaq.com/unitedstates/copyright/1735886/when-600-prompts-still-arent-enough-what-allen-vs-perlmutter-means-for-ownership-copyright-and-creative-contracts) (via search snippet)
- **Copyright Office Part 2 (29 Jan 2025):** prompting alone doesn't make someone an author — [Troutman](https://www.troutman.com/insights/copyright-office-advises-on-copyrightability-of-generative-ai-works/) (via search snippet)
- **Practical advice:** ownership certainty now lives in contracts — tool ToS, designer agreements, warranties and indemnities for AI use — [Mondaq](https://www.mondaq.com/unitedstates/copyright/1735886/when-600-prompts-still-arent-enough-what-allen-vs-perlmutter-means-for-ownership-copyright-and-creative-contracts) (via search snippet)
- **Trademark:** these sources don't address trademark. General understanding is that mascot trademark rights come from use and distinctiveness, not authorship. This is unverified here and should be confirmed by counsel.
- **Ethics:** itch.io devs say much backlash stems from how easily models copy known styles and people — [itch.io thread](https://itch.io/t/6518855/do-you-struggle-with-ai-art-consistency-in-your-games)

### Inferences
- A mascot that is AI-generated and lightly edited may not be copyrightable (at least in the US). A product relying on it as a brand asset should add substantial human authorship (redraw, model, or edit) and document it.
- Caricaturing a real, identifiable person, e.g. a founder or teacher, as a mascot needs that person's written consent, whatever the tool.
- The drift, lighting and hand problems all point to the same mitigation: generate from one locked master, keep lighting words fixed, avoid hand-heavy poses, and plan a human cleanup pass.

### Gaps
- No Tunisian, EU or French-language legal commentary on AI likeness or AI-output ownership was found. Tunisian law should be checked separately.
- No practitioner data quantifies file-size budgets for pre-rendered 3D mascot sprite sheets (e.g. WebP/AVIF sizes) in mobile apps.
- Reddit voices on all four pitfall areas are missing, for the access reason stated at the top.
