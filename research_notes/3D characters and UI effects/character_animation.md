# Bringing pre-rendered 3D characters to life in a React web/mobile app (idle, blink, talk, gestures, reactions)

Context for the report writer: the target is a 3D-looking teacher caricature, full body, ~1024x1536 master render (AI-generated or Blender), shown in a React app that is also wrapped as a mobile app (webview/PWA). The product UI is French with Arabic speech likely (Tunisian academy). Research done 16 Nov 2026; 15 tool calls. Sources are mostly 2024-2026; older ones are flagged.

## Q1. Which animation approach, and when is each worth it? (layered sprites, AI image-to-video frame sequences, Rive 2.5D puppet, Live2D, real-time 3D)

### Takeaway
For a single pre-rendered teacher, the best cost/quality split is a hybrid: a Rive (or code-driven layered-sprite) puppet for the always-on states (idle breathing, blink, mouth/visemes, small reactions) and short pre-rendered clips (AI image-to-video or Blender) for the few "big" gestures (wave, cheer, walk), shipped as stacked-alpha video or small frame sequences. Live2D is capable but adds a proprietary runtime and release licence; real-time glTF 3D is only worth it if the character must turn, be viewed from many angles, or be re-posed dynamically.

### Cited Findings

**(1) Layered sprites (base + eye/mouth patches swapped by code)**
- Rhubarb Lip Sync defines the classic minimal mouth set: six basic shapes A-F (A closed for P/B/M; B slightly open, clenched teeth, most consonants and "EE"; C open, "EH"/"AE"; D wide open "AA"; E slightly rounded "AO"/"ER"; F puckered "UW"/"OW"/"W") plus optional G (F/V, upper teeth on lower lip), H (long L, tongue behind teeth), X (rest). It can export Preston Blair names via `--datUsePrestonBlair` ("MBP", "etc", "rest"...). — [Rhubarb Lip Sync (GitHub)](https://github.com/DanielSWolf/rhubarb-lip-sync)
- Azure TTS also explicitly supports the "2D swap" model: for 2D characters you design one image/SVG per viseme ID and switch on timed viseme events (SVG output itself only for `en-US`). — [Azure: Get facial position with viseme](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-speech-synthesis-viseme)

**(2) Frame sequences from image-to-video (Kling, etc.)**
- Kling supports explicit start-frame and optional end-frame images (Kling O1; Kling 3.0 Pro listed with start/end control up to 4K). — [Scenario: Kling O1 i2v](https://www.scenario.com/models/kling-o1-i2v); [fal.ai Kling O1 i2v](https://fal.ai/models/fal-ai/kling-video/o1/image-to-video); [Eachlabs Kling v3 Pro i2v](https://www.eachlabs.ai/ai-models/kling-v3-pro-image-to-video); [ComfyUI KlingStartEndFrame node](https://docs.comfy.org/built-in-nodes/partner-node/video/kwai_vgi/kling-start-end-frame-to-video.md)
- Seamless-loop trick: use the same image as start and end frame and prompt continuous motion, not an arc with an ending; the loop point is frame-identical but motion in between is not guaranteed to be even, so check the restart on repeat. — [Higgsfield: Kling Start/End Frames](https://higgsfield.ai/blog/Kling-Start-End-Frames); [Higgsfield: Start & End Frames](https://higgsfield.ai/blog/FepbaEyNStzJLJivRIOFg)
- Keep start/end frames similar in colour, style and lighting; avoid stacking camera directions; keep prompts subtle (e.g. "keep eye line steady; minimal camera sway"). — [Higgsfield](https://higgsfield.ai/blog/FepbaEyNStzJLJivRIOFg)
- No source found describing a character-specific consistency workflow (face/pose drift across a generated loop) — see Gaps.

**(3) Rive 2.5D puppet (bones + meshes on a raster render, state machine)**
- Rive builds a triangulated mesh over a raster image from a contour; vertices can be keyed on the timeline or bound to bones with per-vertex weights (higher falloff = softer deformation). Skeletal tooling includes bones, meshes, IK/constraints, Auto Weights, Timeline, State Machine. — [Rive docs: Meshes](https://rive.app/docs/editor/manipulating-shapes/meshes); [Rive docs: Bones](https://rive.app/docs/editor/manipulating-shapes/bones); [Rive blog: Intro to meshes](https://rive.app/blog/intro-to-meshes); [Rive: character animation](https://rive.app/use-cases/character-animation)
- Duolingo case study (Nov 2022, older but the canonical example): 10 World Characters, 40+ languages / 100+ courses; 20+ visemes per character; chose Rive over a game engine for compact files on Android/iOS/Web; body-pose states run alongside separate mouth-only states in one State Machine exported as a single runtime file; idle behaviours (head nods, blinking, eyebrows) and right/wrong reactions; driving a state machine with audio + timing "transfers far less data than a video would". No file sizes published. — [Duolingo blog: World character visemes](https://blog.duolingo.com/world-character-visemes)
- Practitioner pattern: a single number input (e.g. `mouthOpen` 0-1) for amplitude-driven lip sync; another uses ten viseme states, one state machine, one number input. — [Freelancer listing: interactive Rive mascot rig](https://www.freelancer.com/projects/2d-animation/interactive-rive-mascot-rig); [Michał Stencel: Lip Sync Animation](https://contra.com/p/AAQksb6B-lip-sync-animation) (anecdotal)
- Known pitfall: a 100% smile expression stopped lip sync because expression and viseme layers fought; fix with layered state machines so idle, expression and mouth layers play simultaneously. — [Rive forum: blending between inputs](https://rive.app/community/forums/support/fsnLLkXUaA62/blending-between-inputs/ftNEp8TkjtJb); [DEV: Engineering interactive mascots with Rive](https://dev.to/uianimation/engineering-interactive-mascots-with-rives-state-machine-and-runtime-architecture-4e2h)
- Keep bone counts controlled, mesh deformation minimal, and test on low-end devices (practitioner advice). — [DEV: Engineering interactive mascots with Rive](https://dev.to/uianimation/engineering-interactive-mascots-with-rives-state-machine-and-runtime-architecture-4e2h)
- Mouth rigs need enough bones for extreme shapes (lip pursing); fewer bones can be used in constrained environments like browsers. — [80.lv: facial rigging guidelines](https://80.lv/articles/animating-speech-mastering-facial-rigging-guidelines-for-game-developers)

**(4) Live2D-style puppets**
- `pixi-live2d-display` (PixiJS plugin) is MIT, but Cubism Core is proprietary (Live2D Proprietary Software License); the Web Framework is under the Live2D Open Software License. The plugin's last push was Aug 2024 per one listing. — [pixi-live2d-display (GitHub)](https://github.com/guansss/pixi-live2d-display); [awesome.ecosyste.ms listing](https://awesome.ecosyste.ms/projects/github.com%2Fguansss%2Fpixi-live2d-display)
- Live2D SDK is free to start but shipping content requires an SDK Release License Agreement and payment; games (including mobile) fall under a usage-based plan. — [Live2D SDK license](https://www.live2d.com/en/sdk/license/); [Cubism SDK for Web manual](https://docs.live2d.com/en/cubism-sdk-manual/cubism-sdk-for-web)
- Cubism Core is not bundled; the README warns the CDN link is unreliable for production — self-host it. — [pixi-live2d-display README](https://github.com/RaSan147/pixi-live2d-display/blob/master/README.md)

**(5) Real-time 3D (glTF + three.js/R3F)**
- Azure TTS can output 3D blend-shape frames at 60 FPS, 55 ARKit-style facial positions per frame (eyeBlinkLeft ... jawOpen, mouthFunnel, mouthPucker ... tongueOut, headRoll), suited to a rigged 3D head. — [Azure viseme docs](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-speech-synthesis-viseme)
- For WebGL/WebGPU textures, GPU-compressed formats (KTX2/Basis Universal) stay compressed in GPU memory; one source reports 4-8x memory reduction. — [Don McCurdy: Choosing texture formats for WebGL and WebGPU (2024)](https://www.donmccurdy.com/2024/02/11/web-texture-formats/); [imagecompressor.com: How browsers handle images](https://imagecompressor.com/blog/how-browsers-handle-images)

### Inferences
- Decision matrix (synthesis of the above):
  - **Layered sprites in React/CSS** — cheapest to build, zero runtime dependency, perfect for blink + 6-9 mouth shapes on a fixed front-facing pose. Limit: no body motion beyond CSS transforms (breathing scale on torso, slight head bob). Worth it for the MVP/prototype.
  - **AI image-to-video clips** — best for expressive one-off gestures (wave, cheer, "bravo!") that would be hard to rig; worst for anything that must react in real time or loop indefinitely (drift, flicker, no alpha, heavy files). Use for 1-3 s "moments", not for the idle.
  - **Rive 2.5D puppet** — best overall for an always-on mascot: one file holds idle/blink/visemes/reactions, layered state machines, tiny transfer vs video (Duolingo precedent). Cost: a rigging pass by someone who knows Rive, and the master render must be split into layers (head, eyes, brows, mouth set, arms, torso) first.
  - **Live2D** — comparable puppet quality and very strong face rigs, but adds proprietary core + release licensing and an ageing web plugin; only worth it if a Live2D artist is already on hand.
  - **Real-time 3D** — only if the teacher must turn around, walk through a 3D scene, or be reused in many poses; then rig once, use Mixamo/retargeted clips + Azure blend shapes. Requires a real 3D model, not just a 2D render, and is the heaviest on mid-range phones.
- Hybrid recommendation: Rive (or layered sprites in the prototype) for idle/blink/talk; pre-rendered clips for 3-5 hero gestures, crossfaded from/to the puppet's neutral pose (start and end the clip on the exact neutral frame).

### Gaps
- No published benchmarks for Rive vs Live2D vs three.js CPU/GPU cost on a mid-range Android phone.
- No source on keeping a specific AI character's face consistent across Kling/PixVerse/Veo/Runway generations; PixVerse, Veo, Runway and Scenario-video docs were not fetched in this session.
- Mixamo specifics (clip formats, licensing) not researched this session.

## Q2. Formats & budgets: animated WebP, APNG, AVIF, video with alpha, Lottie/dotLottie, Rive; sizes, decode/memory cost, fps

### Takeaway
For pre-rendered clips with transparency, the 2024 state of the art is "stacked alpha" video (colour on top, alpha as greyscale below, recombined in WebGL) in AV1 with an HEVC fallback — about 460 kB vs 1.1 MB (VP9 alpha) vs 3.4 MB (native HEVC alpha) for the same clip in Jake Archibald's test. Avoid animated AVIF. Memory is governed by decoded pixels (w x h x 4 bytes), not file size, so keep characters at display size (512-768 px wide) and frame counts low.

### Cited Findings
- Same test clip, Jake Archibald (2024): animated AVIF 504 kB; native VP9 alpha WebM 1.1 MB (Chrome/Firefox); native HEVC alpha MOV 3.4 MB (Safari); **stacked AV1 MP4 460 kB** (Chrome, Firefox, Safari on iPhone 15 Pro / M3), alpha half adds only ~8 kB; stacked HEVC MP4 1.14 MB as Apple fallback without AV1 hardware decode; ffmpeg VideoToolbox HEVC roughly double Apple Compressor's size. — [Jake Archibald: Video with alpha transparency on the web](https://jakearchibald.com/2024/video-with-transparency/)
- Bugs listed there: animated AVIF transparency broken and very slow in Safari (WebKit 275906); animated AVIF struggles to hit 60 fps on high-end laptops and runs at a few fps on Android; Safari does not support VP9 alpha (WebKit 275908) so HEVC source must be listed first; Chrome Android alpha wrong in stable at time of writing; Firefox Android stalls (Mozilla 1905878). Component: `<stacked-alpha-video>` on npm (`stacked-alpha-video`), internals exported for use without the web component. — [Jake Archibald](https://jakearchibald.com/2024/video-with-transparency/)
- Safari still lacked VP9/WebM transparency in a 2026 guide (an Aug update says it is "coming"); browsers that ignore alpha show black backgrounds; HEVC (`hvc1`) source first, WebM second. — [Rotato: transparent videos on the web in 2026](https://rotato.app/blog/transparent-videos-for-the-web); [hontran.dev: HEVC alpha with ffmpeg](https://www.hontran.dev/blog/transparent-video-web-hevc-alpha-ffmpeg)
- Safari HEVC-with-alpha arrived with iOS 13 / macOS Catalina (WWDC 2019). — [CSS-Tricks](https://css-tricks.com/?p=328311); [Ben Frain](https://benfrain.com/?p=4422)
- Animated WebP: broader decoder/tool support than animated AVIF and faster decode on low-end phones; AVIF ~15-25% smaller at equal quality but slower to decode/encode (general comparisons; vendor/low-rigor sources, directional only). — [imageupload.app (Mar 2026)](https://imageupload.app/blog/2026-03-13-webp-vs-avif-browser-support-and-encoding-trade-offs); [smallpics.io](https://www.smallpics.io/blog/avif-vs-webp)
- Decoded images cost ~width x height x 4 bytes regardless of compression (e.g. 2000x1500 ≈ 11.4 MB); mipmaps add ~1.33x; an image shown small via CSS is still decoded at full resolution; mobile browsers evict GPU textures under pressure, large off-screen images first. — [imagecompressor.com: How browsers handle images](https://imagecompressor.com/blog/how-browsers-handle-images)
- Rive web packages: `@rive-app/webgl2` (Rive Renderer, recommended), `@rive-app/canvas` (Canvas2D), `@rive-app/canvas-lite` (drops text/layout/audio/scripting/feathering, smallest), `@rive-app/canvas-single` (wasm inlined, one request), `@rive-app/webgl` deprecated after v2.37.0. Non-Normal blend modes are expensive on mobile with webgl2; browsers cap WebGL contexts per page — use `useOffscreenRenderer: true` for multiple instances; canvas has no practical instance limit. — [Rive docs: Canvas vs WebGL](https://rive.app/docs/runtimes/web/canvas-vs-webgl.md)
- Rive: unused assets do not increase .riv size; export embedded rasters as WebP for smallest size/best performance. — [Rive: designer's guide to optimizing files](https://rive.app/blog/a-designer-s-guide-to-optimizing-files-and-workflows); [Rive best practices](https://rive.app/docs/getting-started/best-practices)
- dotLottie is a ZIP container that stores raster images as compressed files (folder `i/` in v2) instead of Base64 in JSON, shares images/fonts across animations and embeds state machines; LottieFiles claims 2-10x smaller than Lottie JSON (vendor claim). — [LottieFiles: .lottie format](https://docs.lottiefiles.com/en/format/dotlottie); [Why dotLottie](https://docs.lottiefiles.com/en/format/dotlottie/why-dotlottie.md); [dotlottie.io](https://dotlottie.io/intro/)

### Inferences
- Memory arithmetic (from the w x h x 4 rule): one 768x1152 RGBA frame ≈ 3.5 MB decoded; one 512x768 frame ≈ 1.6 MB. A 2 s gesture at 12 fps (24 frames) at 768x1152 held as separate decoded images ≈ 85 MB — too much for a webview on a mid-range phone; at 512x768 ≈ 38 MB. A single 4096x4096 sprite atlas ≈ 64 MB decoded. Video avoids this (only a few frames decoded at a time), which is a strong argument for stacked-alpha video over big frame sets for anything longer than ~1 s.
- Lottie is a poor fit for a raster 3D render: it is vector-first and would just wrap PNG frames; Rive's raster meshes deform a single image instead, which is why Rive wins for this character.
- Suggested budgets for the teacher (inferred, to validate on device): display width 384-512 CSS px → render 768 px wide at 2x DPR max; idle/blink/talk in Rive with 6-10 embedded WebP layers, target < 300-500 kB .riv; each hero gesture 1-3 s stacked AV1 + stacked HEVC, target ~150-300 kB per second at 512-768 px (Jake's clip gives the order of magnitude, not a guarantee); frame-sequence fallback only for very short loops (<= 12 frames) as animated WebP.
- fps guidance (common animation practice, not verified by a source this session): walk cycles and character loops read well "on twos" at 12 fps (8-12 frames per step cycle); gestures/reactions at 24 fps; blink is 3-5 frames total (~100-150 ms) triggered at random 2-6 s intervals; AI video output at 24/30 fps can be decimated to 12 fps to halve size if motion stays readable.

### Gaps
- No 2025-2026 benchmark of animated WebP vs APNG vs video decode/memory on mid-range Android found.
- Rive web runtime package sizes (KB) not retrieved ("Runtime sizes" page not fetched).
- Whether Safari shipped WebM alpha by Nov 2026 is unconfirmed — check before relying on it.
- No source for the exact fps/frame-count conventions above; treat as practice.

## Q3. Lip-sync / talking: viseme sets, Arabic speech, TTS with viseme timing, amplitude-driven mouth

### Takeaway
Azure TTS is the only researched option that returns viseme IDs directly for Arabic, including `ar-TN` (Tunisian) and `fr-FR` (French also gets 3D blend shapes); events carry a viseme ID 0-21 and an audio offset in 100 ns ticks. ElevenLabs returns only character-level timestamps, so visemes must be derived. For pre-recorded Arabic audio, Rhubarb's language-independent "phonetic" recognizer or a simple amplitude-driven mouth are the fallbacks.

### Cited Findings
- Azure: 22 viseme IDs (0 = silence ... 21 = p/b/m), many-to-one phoneme mapping; each event has viseme ID + audio offset in ticks (1 tick = 100 ns; divide by 10,000 for ms). Outputs: viseme ID, 2D SVG (en-US only), or 3D blend shapes (60 FPS, 55 positions per frame) requested via SSML `mstts:viseme`. JS: `synthesizer.visemeReceived = (s, e) => { e.audioOffset / 10000; e.visemeId; e.animation }`. — [Azure: Get facial position with viseme](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-speech-synthesis-viseme)
- Azure viseme locale table: all listed Arabic locales (ar-AE, ar-BH, ar-DZ, ar-EG, ar-IQ, ar-JO, ar-KW, ar-LB, ar-LY, ar-MA, ar-OM, ar-QA, ar-SA, ar-SY, **ar-TN**, ar-YE) support **Viseme ID** only (no blend shapes); `fr-FR` supports Viseme ID + Blend shapes. `ar-TN` voices: `ar-TN-ReemNeural` (F), `ar-TN-HediNeural` (M). Some voices (footnote 3) do not support visemes. — [Azure Speech language support (TTS / Visemes)](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts)
- ElevenLabs `POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps` returns `audio_base64` plus `alignment` and `normalized_alignment`, each with `characters`, `character_start_times_seconds`, `character_end_times_seconds`; default output `mp3_44100_128`; no visemes documented. — [ElevenLabs API: convert with timestamps](https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps)
- Rhubarb Lip Sync: `rhubarb -o output.txt my-recording.wav` (`-r` recognizer, `-f` tsv/xml/json, `-d` dialog text, `--extendedShapes GHX`); `pocketSphinx` recognizer for English, `phonetic` recognizer for non-English (language-independent, less precise). JSON cues have `start`, `end`, `value`. Repo shows 2026 activity. — [Rhubarb Lip Sync](https://github.com/DanielSWolf/rhubarb-lip-sync)
- Duolingo derived timing by running TTS output through in-house speech recognition/pronunciation models to get word/phoneme timings, then mapped phonemes to their viseme set, with audit/correction tools. — [Duolingo blog](https://blog.duolingo.com/world-character-visemes)
- Amplitude-driven mouth: a `mouthOpen` 0-1 Rive number input fed by real-time audio level is an established pattern. — [Freelancer: interactive Rive mascot rig](https://www.freelancer.com/projects/2d-animation/interactive-rive-mascot-rig)

### Inferences
- Recommended mapping for a 2D teacher: collapse Azure's 22 IDs onto ~8 drawn mouths (Rhubarb A-H + X): 0→X; 21 (p/b/m)→A; 15,16,19,20,6 (s/z, sh/ch, d/t/n, k/g, ee)→B; 1,4 (æ ə ʌ, ɛ)→C; 2,9,11 (ɑ, aʊ, aɪ)→D; 3,5,10 (ɔ, ɝ, ɔɪ)→E; 7,8 (w/u, o)→F; 18 (f/v)→G; 14,13,17 (l, r, ð)→H; 12 (h)→C. Schedule changes with `audio.currentTime` against offsets, hold each shape >= ~60-80 ms to avoid chatter.
- Arabic specifics: pharyngeals/emphatics (ع ح ق ص ض ط ظ) are mostly invisible on the lips; the visible distinctions are bilabials (ب م), labiodental (ف), rounded vowels (ُ / و), open (َ / ا) and spread (ِ / ي) — so an 8-shape set is sufficient. Tunisian Darija is not a separate viseme problem as long as ar-TN TTS (or Rhubarb phonetic on recorded audio) provides timing.
- For ElevenLabs: map characters → phonemes via a simple Arabic letter/diacritic table (or a G2P) and distribute within each character's start/end window; or skip phonemes and use amplitude.
- Amplitude fallback (no text needed, works for any recorded audio): Web Audio `AnalyserNode` → RMS per frame → smooth (attack fast, release slow) → threshold into 3-4 mouth sizes (closed / small / medium / wide) plus random blink; add a closed-mouth "A" whenever RMS drops below a floor for > 80 ms. Cheapest and good enough for a caricature.

### Gaps
- No source compared viseme accuracy of Azure ar-TN vs other providers, nor a published Arabic phoneme-to-viseme table (Azure's IPA mapping lives in the SSML phonetic-sets doc, not fetched).
- Whether ElevenLabs offers viseme output elsewhere (e.g. its conversational/agents products) was not verified.

## Q4. Consistency tricks: same canvas/anchor, flip tests, avoiding flicker between layers, matching lighting

### Takeaway
Consistency is mostly a production discipline: every frame and every layer is exported on the identical canvas with a fixed foot/hip anchor, mouths/eyes are painted from the same render under the same light, and clips start/end on the same neutral frame the puppet rests on.

### Cited Findings
- AI loops: identical start and end frame for loops; keep start/end frames close in colour, style and lighting; minimise camera instructions. — [Higgsfield: Kling Start/End Frames](https://higgsfield.ai/blog/Kling-Start-End-Frames); [Higgsfield](https://higgsfield.ai/blog/FepbaEyNStzJLJivRIOFg)
- Rive layered state machines keep idle, expression and mouth timelines from overriding each other (the "smile kills lip-sync" bug). — [Rive forum](https://rive.app/community/forums/support/fsnLLkXUaA62/blending-between-inputs/ftNEp8TkjtJb); [DEV](https://dev.to/uianimation/engineering-interactive-mascots-with-rives-state-machine-and-runtime-architecture-4e2h)
- Duolingo designed a per-character viseme chart and judged it by whether shapes look believable in motion, not as stills. — [Duolingo blog](https://blog.duolingo.com/world-character-visemes)
- Background-removal mattes on video need temporal models: BRIA RMBG-2.0 (BiRefNet-based, grayscale alpha, CC BY-NC 4.0, commercial licence needed) is a still-image model; BRIA VRMBG-3.0 conditions on the previous frame's RGB x alpha for temporal consistency (commercial agreement required). — [RMBG-2.0 (GitHub)](https://github.com/Bria-AI/RMBG-2.0); [BRIA commercial](https://bria.ai/rmbg-for-commercial-use); [VRMBG-3.0 card (mirror)](https://cloudfare-proxy.pages.dev/briaai/VRMBG-3.0)

### Inferences
- Checklist (production practice, not individually sourced):
  - One master canvas (e.g. 1024x1536) for every export; anchor = feet midpoint (or hip for half-body crops); never trim per-frame transparent margins unless the packer stores the offsets.
  - "Flip test" (onion-skin): toggle frame N and N+1 (or neutral pose vs clip first/last frame) in a viewer; any jump in head position, outline or colour shows as a pop.
  - Paint/derive eye and mouth patches from the same render pass (same lighting, same AO/shadow) and feather their edges 2-4 px onto a slightly larger patch area so swaps never reveal seams; keep patches on the same pixel grid (integer positions) to avoid subpixel shimmer.
  - Preload and decode all swap layers before first use (`img.decode()`), and swap by toggling opacity/visibility of pre-mounted layers rather than changing `src`, to avoid a blank frame (flicker).
  - Run per-frame background removal through a temporal model or key a solid background instead; per-frame still-image matting tends to boil at hair/fingers.
  - Colour-grade AI clips back to the master (match exposure/white balance) and crossfade 2-4 frames between puppet and clip.

### Gaps
- No authoritative source located for the flip-test/anchor/flicker practices above; they are standard animation/game-dev practice stated as inference.

## Q5. Tools for extraction/cleanup: ffmpeg, chroma key (green vs magenta), packers, background-removal models

### Takeaway
Generate (or render) on a flat key colour that does not appear in the character, extract at target fps, key with `colorkey` (RGB, for perfectly flat CG backgrounds) or `chromakey` (YUV, for noisier video), despill, then either re-encode to stacked-alpha AV1/HEVC (preferred) or pack PNG/WebP frames. Use a temporal matting model when the AI video background is not a clean flat colour.

### Cited Findings
- `colorkey` works in RGB; similarity 0.0 = binary transparency, higher = semi-transparent edges; blend controls edge softness; `colorkey` suits digitally generated content with perfectly uniform background, `chromakey` (YUV) is usually better for filmed footage; starting similarity 0.1-0.2. Example: `colorkey=0x00FF00:0.3:0.1` → `frame_%04d.png`. — [FFmpeg-devel colorkey patch (2015)](https://lists.ffmpeg.org/pipermail/ffmpeg-devel/2015-June/174085.html); [DEV: FFmpeg chromakey filter](https://dev.to/javidjamae/ffmpeg-chromakey-filter-remove-green-screen-backgrounds-pjk); [FFmpeg cookbook: chromakey](https://ffmpeg-cookbook.pages.dev/en/articles/chromakey-filter/); [Transloadit: removing a green screen (2023)](https://transloadit.com/blog/2023/06/removing-a-green-screen/)
- Spill suppression: `despill=green` after keying (check options with `ffmpeg -h filter=despill`). — [Transloadit](https://transloadit.com/blog/2023/06/removing-a-green-screen/); [FFmpeg despill source](https://roundup.ffmpeg.org/doxygen/7.1/vf__despill_8c_source.html)
- Alpha survives only in RGBA-capable outputs (PNG, WebM alpha, ProRes 4444). — [skills page: ffmpeg color grading/chromakey](https://agent-skills.md/skills/josiahsiegel/claude-plugin-marketplace/ffmpeg-color-grading-chromakey)
- Stacked-alpha encode (AV1, from an RGBA source; `alphaextract` + `vstack`):
  ```bash
  ffmpeg -y -i in.mov -filter_complex "[0:v]format=pix_fmts=yuva444p[main]; [main]split[main][alpha]; [alpha]alphaextract[alpha]; [main][alpha]vstack" -pix_fmt yuv420p -an -c:v libaom-av1 -cpu-used 3 -crf 45 -pass 1 -f null /dev/null
  ffmpeg -y -i in.mov -filter_complex "...same..." -pix_fmt yuv420p -an -c:v libaom-av1 -cpu-used 3 -crf 45 -pass 2 -movflags +faststart av1.mp4
  # Apple fallback:
  ffmpeg -y -i in.mov -filter_complex "...same..." -pix_fmt yuv420p -an -c:v libx265 -preset veryslow -crf 30 -tag:v hvc1 -movflags +faststart hevc.mp4
  # Native VP9 alpha (no-JS fallback):
  ffmpeg -y -i in.mov -pix_fmt yuva420p -an -c:v libvpx-vp9 -crf 45 -b:v 0 -deadline good -row-mt 1 out.webm
  # Native HEVC alpha (macOS VideoToolbox only):
  ffmpeg -i in.mov -c:v hevc_videotoolbox -require_sw 1 -alpha_quality 0.1 -tag:v hvc1 -q:v 35 -vf "premultiply=inplace=1" out.mov
  ```
  — [Jake Archibald (2024)](https://jakearchibald.com/2024/video-with-transparency/)
- Background-removal models: BRIA RMBG-2.0 (BiRefNet architecture, non-binary alpha, non-commercial licence) and VRMBG (video, temporal). — [RMBG-2.0](https://github.com/Bria-AI/RMBG-2.0); [Runware: RMBG 2.0](https://runware.ai/models/bria-rmbg-2-0-open)

### Inferences
- Full pipeline for an AI image-to-video gesture (commands use standard ffmpeg options; filter names per [FFmpeg filters docs](https://ffmpeg.org/ffmpeg-filters.html), not re-verified flag-by-flag this session):
  1. Prepare start frame = neutral pose on flat key background at the master canvas size; end frame = same image (loop) or the neutral pose (gesture returns home).
  2. Generate 3-5 s; pick the take with least face drift.
  3. Extract at target fps and size: `ffmpeg -i clip.mp4 -vf "fps=12,scale=768:-1:flags=lanczos" raw/%04d.png`
  4. Key + despill to RGBA PNG: `ffmpeg -i clip.mp4 -vf "fps=12,colorkey=0xFF00FF:0.15:0.05,despill=type=green" -pix_fmt rgba keyed/%04d.png` (for magenta there is no magenta despill mode — reduce edge fringe with a 1 px alpha erode or a hue/saturation pull on the edge instead; or, if the generator's background is not perfectly flat, run a temporal matting model instead of keying).
  5. Re-encode the RGBA sequence (`-framerate 12 -i keyed/%04d.png` as input) to stacked AV1 + stacked HEVC with the commands above; or for tiny loops, animated WebP: `ffmpeg -framerate 12 -i keyed/%04d.png -c:v libwebp_anim -lossless 0 -q:v 75 -loop 0 out.webp` (or `img2webp`).
- Green vs magenta: AI video models and lossy codecs blur the key colour into edges; pick the key that is furthest from anything on the character. Wael's brand palette is green/teal, and skin tones are warm, so **magenta #FF00FF is the safer key** for this teacher if he wears green/teal; use green #00FF00 only if the costume has reds/pinks/purples. Lower similarity + small blend, then judge on a checkerboard and on the real app background colours.
- Packing: for Rive, import the separated PNG layers directly (no atlas needed). For a canvas/CSS sprite fallback, free packers (e.g. free-tex-packer, or ImageMagick `montage -tile 6x -geometry +0+0 -background none keyed/*.png sheet.png`) work; keep sheets <= 2048 px on a side for mobile GPU limits; TexturePacker is the paid standard with trimming + offset data. (Tool names from common practice; not fetched this session.)

### Gaps
- TexturePacker / free-tex-packer docs not fetched; GPU max-texture-size figures for 2026 mid-range phones not sourced.
- No independent comparison of BiRefNet vs RMBG-2.0 vs VRMBG temporal stability; commercial licence costs unknown.
- No verification of whether Kling/PixVerse/Veo/Runway/Scenario can output alpha or a guaranteed flat background colour directly (in most public docs they output MP4 without alpha — not confirmed in this session).
