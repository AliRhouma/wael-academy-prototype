# Feature research — what study apps do, what the evidence says, what Tunisia's exams require

**Wael Academy · product research · 26 October 2026**

Companion to `docs/features-catalog.html` — the filterable catalogue of 104 cards (97 features
+ 7 anti-features) across exam preparation, exercises, live & replays, shared study, habits,
organisation, per-subject programme design, teacher/admin tooling and a roadmap. This file holds
the benchmark, the learning-science evidence and the Tunisian exam logistics behind every card,
with sources (§6).

---

## 0. Method and how to read this

- **52 distinct web searches and page fetches** on 2026-10-26. "Extended" search mode for niche or
  recent items (Tunisian players, 2025–2026 calendars, the Duolingo Energy change); primary pages
  fetched where a number matters (bac coefficients per section, TakiAcademy's bac offers).
- Anything dated after 2024 is checked against at least one **dated** source. Where sources
  disagree, both figures are given and the card in the catalogue uses the more conservative one.
- Vendor numbers ("94 % improved grades", "2× the marks") are labelled **self-reported**.
- §5 lists what could **not** be verified in this pass, so nobody mistakes a plausible claim for
  a checked one.
- The product context: Wael Academy sells **live online séances + replays + documents +
  séries/exercices + quizzes + evaluation exams** by subscription (offers), to Tunisian collège
  (9ème, concours des lycées pilotes) and lycée students (1ère → bac, seven sections), with four
  roles (student, parent, teacher, admin) over one dataset. The prototype already holds: years,
  subjects, chapters, lessons (cours · exercice · série · résumé · quiz), sessions (recordings),
  live-sessions, exams (devoirs de contrôle / synthèse + bac with نص / الإصلاح PDFs and video),
  homeworks, quizzes & quiz-exams, groups, users, resources, offers / subscriptions / accesses,
  video-comments, chat-messages, paths.

### 0.1 TL;DR — the twelve features with the highest expected impact

| # | Feature (catalogue id) | Why it is first |
|---|---|---|
| 1 | **Bac past-paper bank by chapter** (EP01) + past-paper → chapter heat map (EP08) | Authentic retrieval practice, mapped to the programme; the one thing every bac app sells and Tunisian banks (devoir.tn, reviserbac.tn) only offer by year. |
| 2 | **Timed mock exam with the real barème** (EP02) | Exam-condition practice transfers best and lowers anxiety (Agarwal 2014); self-marking with the barème teaches what examiners pay for. |
| 3 | **Exam countdown + automatic revision plan** (EP03) over the **official exam calendar** (OR03) | Distributed practice is "high utility"; the Tunisian year is literally scheduled around DC/DS windows and the bac dates. |
| 4 | **Error notebook** (EP04) + **mistakes replay** (PR10) | Learning from errors with feedback (Metcalfe 2017) and retrieval on one's own misses. Cheap, reuses existing quizzes. |
| 5 | **Mastery per chapter** (EP06) | Makes progress legible per chapter (Khan Academy levels); drives weak-chapter review (EP12) and group analytics (TA05). |
| 6 | **Devoir de contrôle / synthèse simulators** (EP11) | Format-matched practice two weeks before each official window — the most natural trigger in the Tunisian calendar. |
| 7 | **Progressive hints** (PR01) + **worked-solution video synced to steps** (PR02) | Faded guidance keeps students generating; worked examples cut cognitive load (Sweller & Cooper 1985). |
| 8 | **Daily practice problem** (PR05) + **interleaved mixed set** (PR11) | Spaced daily retrieval; interleaving roughly doubled test scores in Rohrer's classroom trials (72 % vs 38 %; 61 % vs 38 %). |
| 9 | **Photo upload of handwritten work → teacher correction queue** (PR06, PR07, TA04) | The feedback loop live-class ecosystems (Physics Wallah's 24-hour doubt engine) are built on; marks method, not just answers. |
| 10 | **Shared task list** (SO02) + **group challenge of the week** (SO03) | Social accountability and cooperative goals (Todoist assign-and-notify, Duolingo Friends Quests, Habitica party damage). |
| 11 | **Duo study** (SO04) + **streak with the "Fire pass" shield** (SO07) + **daily goal** (MH01) | Duolingo: Friend Streak +22 % daily completion; one-lesson-keeps-the-streak +3.3 % D14 retention; the freeze removes the loss-aversion cliff. |
| 12 | **Chaptered replay** (LV01) + **attendance & catch-up mode** (LV06) | Turns the academy's core asset — 90-minute recordings — into revision material and stops the drop-out spiral after one absence. |

---

## 1. Benchmarks

Format per app: the 3–6 features that matter for Wael Academy · what makes them good · evidence
or numbers (with their status) · the take for us.

### 1.1 Flashcards & spaced repetition — Quizlet, Anki, RemNote

**Quizlet**
- Features: *Learn* mode (adaptive — asks how well you know a term and brings missed terms back
  until they stick), *Test*, *Match*; *Magic Notes* (notes → flashcards, Plus); *Q-Chat* AI tutor
  that explains, quizzes and hints (Plus); classes for sharing sets; offline access (Plus).
- Good because: the friction from "I have a vocabulary list" to "I am being tested" is one tap;
  sharing sets makes classes a content network.
- Numbers (third-party, 2026 reviews; conflicting): free tier limited on Learn/Test rounds; Plus
  ~US$35.99/yr, Plus Unlimited ~US$44.99/yr. No official 2025 change note found.
- Take: a chapter-level deck + "Learn"-style adaptive loop is table stakes for SVT terms,
  formulas, dates and language vocabulary (EP05, SO11).

**Anki (and FSRS)**
- Features: open spaced-repetition with the **FSRS** scheduler (opt-in since 23.10, reported as
  default in 25.07, July 2025); cloze deletions; shared decks; leech tags for cards repeatedly
  failed; heatmap add-ons.
- Good because: the scheduler is the product — review only what is about to be forgotten.
- Numbers (secondary/vendor): FSRS reaches the same retention with ~15–30 % fewer reviews than
  SM-2; benchmark on ~700 M Anki reviews (Expertium) reports lower log-loss and retention RMSE
  (SM-2 16.2 % → FSRS-5 5.3 %). Treat exact figures as unverified against the primary benchmark.
- Take: use an FSRS-style schedule for decks (EP05) and the "leech" idea for the error notebook
  (EP04) and bookmarks (PR09).

**RemNote**
- Features: notes ↔ flashcards from the same outline; PDF annotation → flashcards; **Exam
  Scheduler** ("set your exam date and it tells you what to study each day"); handwriting;
  AI flashcards/quizzes (newer).
- Take: the Exam Scheduler is the pattern for EP03 (countdown → daily plan).

### 1.2 Community notes & homework help — Brainly, Knowunity, Vaia, Photomath, Gauth

**Brainly**
- Features: community Q&A with **expert-verified** answers and a moderator network; *Scan to
  Solve*; AI tutor "Ginny" with *Simplify / Expand* on answers; points and leaderboards for
  answering; paid Tutor plan with live experts.
- Good because: the question is attached to a real homework item; answers are moderated.
- Status: AI tools announced Sept 2023; no 2025-specific change found.
- Take: a question thread per exercise (PR15) with teacher-pinned answers; moderation (TA09) is
  not optional.

**Knowunity** (Berlin; €27 M Series B, June 2025)
- Features: library of **1 M+ student-made notes, summaries and past-paper solutions** by subject
  and grade; a **Creator Program**; an AI study companion that builds personalised plans and
  quizzes from that library.
- Good because: content supply comes from students; the AI sits on top of curated material.
- Pricing: listings conflict (free vs. a Pro tier).
- Take: peer explanations (SO09) and shared decks (SO11) with light curation.

**Vaia (ex-StudySmarter)**
- Features: PDF → flashcard deck; spaced repetition; **automatic study plan per subject**; planner
  with exam dates and to-dos; mock exams; textbook solutions.
- Numbers: 22–40 M users and "94 % improved grades" — self-reported, inconsistent across listings.
- Take: planner + exam dates + plan (OR01, EP03).

**Photomath** (Google-owned since 2022) and **Gauth**
- Photomath: camera recognition from arithmetic to calculus; **free step-by-step** for equations;
  *Plus* adds animated tutorials, hints and "third-level steps"; multiple solution methods.
- Gauth: multi-subject photo solving; free tier capped (~11 questions/day, third-party, Feb 2026);
  human tutors.
- Take: the *paid* value in Photomath is exactly **graded hints and step-level explanation** —
  PR01 (three hint levels) and PR02 (solution video synced to steps). Do **not** build an
  answer-giver (anti-feature AN03).

### 1.3 Retrieval-practice courseware — Seneca Learning, Khan Academy

**Seneca Learning**
- Features: short summaries followed by varied retrieval formats; spacing and interleaving built
  into the sequence; teacher assignments and class analytics; "smart review" of weak topics.
- Evidence (company RCT, n ≈ 1,120, published in the Chartered College of Teaching's *Impact*):
  students using Seneca scored ~**2×** a revision-guide control and ~65 % more than a spaced-PDF
  control. Self-reported by the vendor; no independent replication found.
- Take: "Révision express" = résumé + 5 retrieval questions (EP07), never the résumé alone.

**Khan Academy**
- Mastery levels (help center): *Attempted* < 70 %, *Familiar* 70–99 %, *Proficient* 100 %,
  *Mastered* after answering the skill correctly in a **mixed-skill** review; 50/80/100 mastery
  points per skill; a Proficient/Mastered skill can drop when questions are missed. Course
  challenge = interleaved re-test.
- Khanmigo: Socratic guidance rather than answers; teacher planning tools; BTS-2025 release
  notes add a Writing Coach, assignment previews, a Blooket integration and a **Parent
  Dashboard**.
- Take: EP06 (four levels, decay, mixed-review to reach the top level), EP12 (weak-chapter
  review), MH06 (parent view).

### 1.4 Game quizzes — Kahoot!, Wayground (formerly Quizizz)

**Kahoot!**
- Features: live games; **student-paced challenges**; four study modes — flashcards, practice,
  *test yourself* (timed, against AI players), *challenge friends*; study groups/leagues; *Test
  mode* and offline mode in recent app releases (third-party release notes).
- Take: LV04 (live polls), SO14 (quiz duel), EP02 (test mode).

**Wayground** (Quizizz renamed on 24 June 2025)
- Features: AI Hub that turns files into quizzes and flashcards; lesson bundles; **interactive
  video** with embedded questions; reading passages; *VoyageMath* adaptive practice;
  accessibility options.
- Take: LV05 (replay checkpoints), PR16/TA02 (question bank), TA01 (authoring speed).

### 1.5 Live-class ecosystems — Physics Wallah, Unacademy, Vedantu, BYJU'S

These are the closest structural analogues to an academy: cohorts ("batches"), daily practice,
doubt resolution, test series and mentorship — on top of live classes and recordings.

**Physics Wallah**
- Features (batch pages, 2026): batches by exam/class/language; **DPP — daily practice problems
  after every lecture**, each with a video solution; a **doubt engine** promising resolution
  **within 24 hours** (AI + faculty + peer discussion); **test series** (bi-weekly tests, a
  "Monthly Mega Test", All-India tests, previous-year questions, mock tests); tiers (Infinity adds
  1-to-1 mentorship and a 7,000-video "Khazana" library). Example prices ₹1,499 / ₹2,699.
- Take: PR05 (DPP), PR15 + PR07 (doubts and turnaround), EP02/EP11 (test series rhythm), offer
  tiers mapped to inclusions (OR08).

**Unacademy**
- Features: live classes with live chat; **"Raise a hand"** to speak with the educator (2022
  listing); test series; batch courses. No 2025 pricing/mentorship details found.
- Take: LV10.

**Vedantu**
- Features (2025–26 course pages): master-teacher live classes, **live in-class doubt solving**,
  quizzes, a **leaderboard**, discussion of past exam questions, 70+ mock tests, one-on-one
  mentors (marketing), **recordings for any missed class** ("never fall behind"). Pro Classic
  ₹73,700 (discounted ₹60,300).
- Take: LV06 (catch-up mode), SO06 (leaderboard — but effort-based and opt-in).

**BYJU'S**
- Features (listings/release notes, dates unclear): adaptive *Warm-up / Sprint / Race* per
  chapter; *Ask a Doubt* by photo; 50,000+ videos in 6+ languages; real-time progress reports;
  live classes. The company's 2025 status was not covered by the results.
- Take: the three-speed chapter practice is a neat framing for the difficulty ladder (PR04).

### 1.6 French bac-culture apps — SchoolMouv, Kartable, Les Bons Profs, Nomad Education, Studeo, digiSchool, Lumni

- **SchoolMouv**: ~500 video lessons, 550+ fiches, 500+ quizzes with corrections aligned to the
  programme; a bac/brevet "exam kit"; tutor chat; ~10 €/month after a 7-day trial (2026
  comparison page).
- **Kartable**: 1,000+ fiches, thousands of quizzes and corrected exercises; freemium — corrected
  exercises, detailed fiches and tracking are premium (~7–10 €/month).
- **Les Bons Profs**: 2,000+ video lessons, many free on YouTube; **offline download**; exercises
  and corrections in the paid tier (~17.99 €/month, reported).
- **Nomad Education**: Nomad+ bundles mini-courses, printable illustrated fiches, corrected
  quizzes, **flashcards**, interactive exercises, **corrected past exams**, bac/brevet revision
  programmes ("parcours"), Parcoursup coaching and parent resources; NOMAD'IA generates
  personalised revision content; content by "400 teachers" and 4.6/5 from 150k reviews (both
  self-reported).
- **Studeo**: short videos, QCM, flashcards, live Q&A forums, **correction videos**; lycée + prépa
  (2022); *StudAI* science assistant. No 2025 reviews found.
- **digiSchool**: annales by subject and year (2022–2026) with Premium corrections; its own advice
  — *do the paper under exam conditions, then compare with the correction to find weak points,
  omissions and reasoning errors* — is EP02 + EP04 in one sentence.
- **Lumni** (France Télévisions/INA, free, ad-free): 800+ revision contents for terminale,
  première and troisième (2026); "Bac Français : révise les œuvres en **10 min chrono**";
  *TakTik* (methods); "Les petits tutos du Grand oral"; annales corrigées.
- Take: the French market converges on **fiche + quiz + annales corrigées + parcours**. Our edge
  is the live teacher and the Tunisian calendar; the catalogue therefore puts most weight on
  EP01/EP02/EP11 (exam-format fidelity) and the live/replay loop.

### 1.7 Tunisia and MENA — TakiAcademy, past-paper banks, Najja7ni, Abwaab, Noon, Baims, Nafham, newcomers

**TakiAcademy** (Tunis; since 2013; "280+ teachers"; 4ème primaire → bac, all sections)
- Features (official pages, Oct 2026): recorded explanation videos, **interactive live sessions**,
  exercises with corrections and QCM quizzes, lesson-summary "magazines", recordings of live
  sessions, a **forum** with teachers and subscribers, **evaluation exams** in the top tier.
- Bac offers (fetched 2026-10-26, prices in DT): BACUP per trimester 499 (from 649); BAC REO
  annual 899 (repeaters); "عرض ملول للخر Lite" 949; "سيلفر" 69/month; "عرض ملول للخر" 2,300 (from
  2,900, all sections, live + forum); "عرض ملول للخر +" 2,900 (adds evaluation exams).
- Weak spots visible in reviews (Play Store): lessons not well ordered, missing lessons, missing
  PDFs — i.e. **programme structure and completeness** are an opening (section 7 of the
  catalogue, TA08 content-gaps dashboard).
- Take: match the inclusions model (OR08), beat it on structure (per-chapter programme, mastery,
  past-paper tagging) and on the practice loop (hints, DPP, correction queue).

**Past-paper and devoir banks**
- **devoir.tn**: devoirs de contrôle and de synthèse by level, subject and trimester (collège and
  lycée), some with corrections, many old (2014–2015 examples).
- **devoinet.tn**: "1,000+ corrected devoirs 2022–2025" from real lycées, corrections by a
  Tunisian secondary teacher. **devoirat.net**: maths devoirs by level/section/trimester.
  **mathinfo.tn**: maths cours, séries and devoirs corrigés (5 downloads/day).
- **reviserbac.tn**: bac sujets & corrigés plus "Mo3adli" average calculators per section with the
  coefficient tables (citing the Arrêté of 24 April 2008 as amended).
- Take: the raw material for EP01/EP11 exists in PDF form all over the Tunisian web; the value is
  **tagging by chapter and points, timing, and the barème** (TA03).

**Najja7ni** (historic): Tunisiana + Edupartage mobile services — "Najja7ni Révisions" (2010,
USSD QCM for primary, collège and bac), "M-English" (2011), "Najja7ni Emploi" (2013). No current
student app found. **Edulib**: no Tunisian presence found (the name belongs to a French digital
textbook platform). **Yenja7**: a Play Store app exists; details not verifiable.

**Abwaab** (Jordan/MENA/Pakistan): short interactive videos, review summaries, **model answers**,
practice questions, discussion forum; a human advisor ("Morshed") who helps with scheduling and
tracks progress on a dashboard; mock tests with instant feedback; an AI essay-grading beta.
"1 M+ students" is a profile-site figure.

**Noon Academy** (Saudi): **social learning** — live classes by "star teachers", **student study
groups**, gamified peer quizzes, practice questions; "16 M learners in eight countries"
(company). Take: SO01, SO03, SO12.

**Baims** (Kuwait): recorded courses + notes + live sessions + quizzes for university and high
school; ~70 % below tutor rates; revenue-share with instructors (2020–2022 coverage).

**Nafham** (Egypt): free **5–15-minute crowd-sourced videos** aligned to the public curriculum by
grade/term/subject, with alternative videos per lesson; mobile and smart-TV apps; 23,000+
videos. Take: SO09 (peer explanations), LV09 (short highlights).

**2025–2026 Tunisian signals**: **EdTrust** (school management + parent access; expanding to East
Africa after a first raise, Oct 2025); a free platform for bac *Sciences informatiques* students
launched by a 2026 bachelière, Tasnim Chendoul (Aug 2026); the **Talents Tunisie 2025** AI-for-
education hackathon; a 2024 report counting 114 Tunisian edtech startups (14 % of all
startups). No new consumer bac app with a verifiable feature set was found.

### 1.8 Focus & social study — Forest, Flora, FLIP, Focusmate, Study Together

- **Forest**: a focus timer that grows a tree; *Deep Focus* app blocker; **Plant Together** rooms
  (create a room, share a code; **if one person leaves the app, everyone's tree dies**).
- **Flora**: the multiplayer alternative — friends who stay off their phones together each earn a
  bonus tree; chat; real trees planted via Trees for the Future.
- **FLIP – Focus Timer for Study** (Rinasoft): **flip the phone to start** the timer; weekly and
  monthly study-time stats, daily report, timeline; **ranking by school**; a global study group
  ("FLIP ZONE") and a board ("FLIP TALK"). (Not to be confused with *Flipd*, which has global
  leaderboards and live study rooms.)
- **Focusmate**: 1:1 video co-working sessions. Evidence is thin: CHADD notes there has not been
  significant research validating body doubling; Focusmate's own survey says 85 % felt less
  lonely (self-report); a 2025 Drake University EEG study reportedly found no significant effect
  on performance or focus (secondhand).
- **Study Together** (Discord, ~1 M members): camera/screenshare/chat study rooms for 2–25
  people, Pomodoro bots, ambient audio, a public leaderboard and ranks.
- Take: shared study rooms with a timer (SO05) and the focus timer (MH02) are cheap and liked;
  keep the "shared flame" commitment device, but do not oversell outcomes.

### 1.9 Habits & shared tasks — Habitica, Finch, Todoist

- **Habitica**: habits/dailies/to-dos as an RPG; **parties** (≤ 30 members) and **quests** where
  the party fights a boss and **takes damage when a member skips a daily**; a rotating quest shop.
- **Finch**: a self-care pet; custom goals; rewards ("rainbow stones") spent on the bird's clothes
  and furniture; streaks that can be **paused**; Plus ~US$9.99/month.
- **Todoist**: shared projects where collaborators add, **assign (one person per task)**, complete
  and comment on tasks with notifications; sub-tasks as the workaround for shared tasks.
- Take: SO02 (shared task list with assignee and "done by"), SO03 (party-style group challenge),
  SO07 (pause/shield), MH09 (one currency spent on cosmetics and shields, never on answers).

### 1.10 Duolingo's mechanics — streak, freeze, Friend Streak, Friends Quests, leagues, and the 2025 Energy change

- **Streak + streak freeze**: freezes protect one missed day; obtained through chests, Daily
  Quests and league promotions; Super members get one equipped automatically.
- **Daily goal decoupled from the streak** (Duolingo blog): one lesson keeps the streak alive
  regardless of the goal → **+3.3 % day-14 retention** and **+10.5 %** share of daily learners on a
  streak within 20 days; learners on the "intense" goal were the least likely to be on a streak.
- **Friend Streak** (2024): share a streak with up to five friends; both must complete a lesson
  each day; nudges; learners with at least one Friend Streak were **22 % more likely to complete
  their daily lesson** (Duolingo product blog).
- **Friends Quests**: weekly paired challenges toward a shared goal, with rewards.
- **Leagues**: weekly promotion/demotion tiers.
- **Energy (2025)**: tested from mid-2025 as the successor to hearts — 25 units for free users,
  wrong answers cost more than right ones, refills via ads, gems, practice or time; Super/Max
  unlimited. Reception was largely negative ("even perfect lessons drain energy"); rollout was
  staggered (iOS first; web kept hearts). The lesson is clear: **do not gate practice**.
- Take: SO07 (Fire pass = earned shield, max two), MH01 (one exercise keeps the streak), SO04
  (Duo), SO03/SO08 (weekly quests), SO06 (effort-based opt-in leaderboard), AN02 (no energy).

### 1.11 Assignments & calendars — Google Classroom, Notion, ICS sync

- **Google Classroom**: assignments with due dates that **appear in Google Calendar**; rubrics
  and a comment bank for grading; **guardian email summaries** (daily or weekly) listing missing
  and upcoming work and class activity — guardians never see grades, submissions or class
  communication; since July 2024 guardians can **preview the Classwork page** from the email;
  guardian invitations expire after 120 days.
- **Notion**: student planners and class templates (general knowledge; not researched in depth).
- **ICS subscription**: Google Calendar web — "Other calendars → From URL" (the mobile apps cannot
  subscribe; refresh can take up to ~24 h); Apple Calendar — "File → New Calendar Subscription"
  on Mac, "Settings → Calendar → Accounts → Add Subscribed Calendar" on iPhone; `webcal://` links
  open the subscription dialog pre-filled.
- Take: OR02 (homework statuses), TA07 (assign), MH06/TA10 (parent summaries with the same
  privacy rules), OR04 (ICS feed — needs a backend endpoint, hence a big bet).

### 1.12 Parent reporting — ClassDojo, Seesaw (+ Google Classroom, Khan Academy)

- **ClassDojo**: *Class Story* feed with photos and recaps; behaviour **points** with parent
  notifications; individual portfolios; parent-to-parent messaging with automatic translation into
  35+ languages.
- **Seesaw**: **student-work portfolios** parents can like and comment on; messaging; accounts and
  portfolios persist year to year; feeds show only the child's and the teacher's posts.
- **Google Classroom** guardian summaries (see 1.11); **Khan Academy** Parent Dashboard (2025)
  to track progress and assign practice.
- Take: the parent sees **outcomes** — attendance, homework status, mock marks, time on task,
  teacher shout-outs — never the chat (MH06, SO10, TA10). A weekly cadence, not a live feed.

---

## 2. Learning-science evidence (what each card's "Why it works" rests on)

| Technique | Key evidence | What it says | Design implication (cards) |
|---|---|---|---|
| **Practice testing (retrieval)** | Dunlosky, Rawson, Marsh, Nathan & Willingham (2013), *PSPI* 14(1) | Rated **high utility** (with distributed practice); summarisation, highlighting and rereading rated **low**. | Default action on a chapter is "test me", not "read" — EP01, EP07, PR16, EP16's recall mode. |
| | Roediger & Karpicke (2006), *Psychological Science* 17(3) | Restudy wins at 5 min; **testing wins at 2 days and 1 week** (≈ 61 % vs 40 % recall after a week in Exp. 2, as commonly reported — check Fig. 2 before quoting). | Space the quiz away from the lesson; replay checkpoints (LV05) + next-day DPP (PR05). |
| | Adesope, Trevisan & Sundararajan (2017), *RER* 87(3) | Meta-analysis, 272 effect sizes: pooled **g ≈ 0.61**; **multiple-choice** formats show the largest effects; feedback and **format matching** moderate the effect. | MCQ bank (PR16/TA02); match the exam format (EP02, EP11). |
| **Distributed practice (spacing)** | Cepeda, Pashler, Vul, Wixted & Rohrer (2006), *Psych. Bulletin* 132(3) | 317 experiments; spaced > massed; the **optimal gap grows with the retention interval**. | Expanding schedules for flashcards (EP05), bookmarks resurfacing at 3 and 10 days (PR09), the revision plan (EP03). |
| **Interleaving** | Rohrer & Taylor (2007); Rohrer, Dedrick & Stershic (2015): **72 % vs 38 %**, d = 1.05 (grade 7, n = 140); Rohrer et al. (2020): **61 % vs 38 %**, d ≈ 0.83 across 54 classes; Brunmair & Richter (2019) meta-analysis: small positive, heterogeneous | Mixing problem types forces **choosing the method**, which is what exams test. | Interleaved mixed sets (PR11), mistakes replay across chapters (PR10), mixed-chapter quizzes (PR16). |
| **Worked examples** | Sweller & Cooper (1985) and replications across maths/science; Renkl on fading (not re-verified here) | Studying worked examples beats unguided problem solving for novices; **example–problem pairs** and fading work best. | Solution video synced to steps (PR02) → variant (PR03); hints that fade (PR01); barème trainer (EP09). |
| **Learning from errors** | Metcalfe (2017), *Annual Review of Psychology* 68 | Errors followed by **corrective feedback** enhance learning, especially **high-confidence errors**; error-avoidant practice is too easy. | Error notebook (EP04), mistakes replay (PR10), correction queue returning method feedback (PR07). |
| **Desirable difficulties** | Bjork (framework: spacing, interleaving, generation, testing) | Conditions that make learning *feel* harder and slower often produce more durable learning. | Hidden formula sheet (PR14), hints cost a tap (PR01), timer per exercise (PR12). |
| **Exam-condition practice & anxiety** | Agarwal, D'Antonio, Roediger, McDermott & McDaniel (2014) | Survey of **1,408** middle/high-school students after classroom retrieval practice: **92 %** said it helped them learn, **72 %** said it made them **less nervous** for tests (self-report, not an RCT). | Timed mocks (EP02), DC/DS simulators (EP11), wellbeing check-in (MH10). |
| **Interpolated testing in video** | Szpunar, Khan & Schacter (2013), *PNAS* (background knowledge; not re-fetched) | Short tests inserted in a lecture reduce mind-wandering and improve learning. | Replay checkpoints (LV05). |
| **Segmenting / multimedia** | Mayer's multimedia principles (background knowledge) | Segmented, learner-paced video and synchronised text + narration help. | Chaptered replays (LV01), step-synced corrigé (PR02). |
| **Goals, streaks, habits** | Duolingo product data (A/B tests, company-published): +3.3 % D14 retention from decoupling goal and streak; Friend Streak +22 % daily completion | Small daily goals and forgiving streaks sustain the habit; social pairing adds accountability. | MH01, SO07, SO04, MH07. These are **product experiments, not peer-reviewed studies**. |
| **Deadlines & commitment** | Ariely & Wertenbroch (2002), *Psychological Science*; Hyndman & Bisin replication (2024/25, SSRN) | Original: self-imposed deadlines help, evenly spaced external deadlines help more. Replication: **negligible effects** of deadline structure. | Offer a spaced plan (EP03) but keep it editable; don't promise that deadlines alone fix procrastination. |
| **Body doubling / co-presence** | CHADD (no significant research); Focusmate surveys (self-report); a 2025 EEG study reportedly null | Popular and liked; effects on performance unproven. | Build study rooms (SO05) as a *motivation* feature, not as a learning claim. |

---

## 3. Tunisian exam logistics (what the calendar, countdown, simulator and coefficient features must encode)

### 3.1 The school year 2025–2026 — devoirs de contrôle (DC) and devoirs de synthèse (DS)

Ministry calendar as reported by La Presse, WMC, Tekiano, ecoles.com.tn (dates differ slightly
between outlets; the ministry circular is authoritative):

| Trimester | Devoirs de contrôle | Devoirs de synthèse | Notes / conseils |
|---|---|---|---|
| T1 | done and corrected by **22 Nov 2025** | **1–13 Dec 2025** (1–6 with classes; 8–13 "semaine bloquée") | notes by 20 Dec; conseils de classe 5–10 Jan 2026 |
| T2 | by **14 Feb 2026** | **23 Feb – 7 Mar 2026** (23–28 Feb with classes; 2–7 Mar blocked — some outlets end on 28 Feb) | conseils 30 Mar – 1 Apr (ecoles.com.tn: to 4 Apr) |
| T3 | by **9 May 2026** (4ème année / bac classes: **2 May**) | from **13 May 2026** (4ème année: 6, 7, 8, 11, 12, 13 May); blocked week 20–26 May (Tunisie Numérique: 18–21 May) | notes: 16 May (4ème), 30 May (9ème), 24 June (others) |

Holidays (demarches.tn, unofficial): mid-T2 13 Feb – 2 Mar 2026; spring 17 Apr – 4 May 2026.

Design: the **exam-calendar collection** (OR03) stores windows per year/section; EP11 triggers a
simulator two weeks before each DS window; EP03 counts down to the next window; TA05 shows
whether the group has covered the chapters a DS will test.

### 3.2 Baccalauréat 2026

- **Written, session principale**: 3, 4, 5, 8, 9, 10 June 2026 · results **23 June 2026**.
- **Session de contrôle**: 29, 30 June, 1, 2 July 2026 · results **12 July 2026**.
- **Bac sport**: 13–25 April 2026. **Practical and oral tests**: 14–23 May 2026 — Technologie TP
  14–23 May (21,677 candidates, 289 centres); Informatique practical 16, 19, 20, 21, 23 May
  (162,435 candidates — i.e. all sections); Sport practical/oral 19, 20, 22, 23 May (2,064
  candidates, 87 centres).
- **Contrôle continu consultation**: 4–9 June 2026 on edunet.tn — annual average, conduct mark,
  final EPS mark, final TP Technologie mark; claims until 9 June.
- **Bac 2025 for reference**: written 2, 3, 4, 9, 11 June; results 24 June; contrôle 30 June –
  3 July; results 13 July; 151,000+ candidates; session-principale pass rate **37.08 %**
  (53,721 of 144,863); the Mathématiques section had the best rate (**74.93 %**) and 25.49 % of
  its admitted students got "Très bien"; top average 19.95/20.
- Rules used by the catalogue's coach (EP14): pass at a final average ≥ 10; candidates between 7
  and 10 sit the contrôle session in subjects of their choice (Arrêté of 24 April 2008, art. 15,
  as cited by reviserbac.tn). The often-quoted "25 % of the annual average counts if it helps"
  rule was **not** confirmed by any source in this pass — verify before encoding.

### 3.3 Coefficients per section (as tabulated by reviserbac.tn from the Arrêté of 24 April 2008 as amended; verify with the ministry)

| Section | Coefficients | Total |
|---|---|---|
| **Mathématiques** | Maths 4 · Sciences physiques 4 · SVT 1 · Français 1 · Anglais 1 · Philosophie 1 · Arabe 1 · Informatique 1 · Sport 1 | 15 |
| **Sciences expérimentales** | SVT 4 · Sciences physiques 4 · Maths 3 · Français 1 · Anglais 1 · Philosophie 1 · Arabe 1 · Informatique 1 · Sport 1 | 17 |
| **Technique (Sciences techniques)** | Technologie 3 · Maths 3 · Sciences physiques 3 · TP Technologie 1 · Français 1 · Anglais 1 · Philosophie 1 · Arabe 1 · Informatique 1 (écrit 0.5 + pratique 0.5) · Sport 1 | 16 |
| **Informatique** | Maths 3 · Algorithmique & programmation 3 (écrit 2 + pratique 1) · STI 3 · Sciences physiques 2 · Français 1 · Anglais 1 · Philosophie 1 · Arabe 1 · Sport 1 | 16 |
| **Économie & Gestion** | Gestion 4 · Économie 3 · Histoire-Géo 2 · Maths 2 · others 1 | 17 |
| **Lettres** | Arabe 4 · Philosophie 3 · Histoire-Géo 2 · Français 2 · Anglais 1 · Maths 1 · Informatique 1 · Sport 1 | 15 |
| **Sport** | Sciences biologiques 3 · Sport pratique 2.5 · other subjects 0.5–1.5 | 14.5 |

Durations commonly cited (verify per section): Maths 4 h (Math) / 3 h (Sciences exp.); Sciences
physiques 3 h; SVT 3 h (Sciences exp.) / 2 h (Math); Philosophie 4 h (Lettres) / 3 h; Français
and Anglais 2 h; Technologie 4 h (Technique). التفكير الإسلامي (Lettres) is not in the
reviserbac Lettres table — confirm in the Arrêté.

Design: the coefficient table powers the weighted average widget (EP14), the plan's subject
weighting (EP03), the weak-chapter priority (EP12) and the per-subject programme cards (PG01–PG12).

### 3.4 Collège — the 9ème exam and the concours des lycées pilotes

- **2026**: written exams **18, 19, 20 June 2026**; results scheduled 6 July (reported out on
  3 July). **32,035** registered, **25,301** sat, **16,182** admitted (**63.96 %**); **6,063**
  placed in lycées pilotes. The 6ème concours (collèges pilotes) ran 22–24 June with results on
  10 July; ~3,750 places for 2026–27.
- Subjects/coefficients (a blog's tabulation, **unverified**): Maths 4, Sciences 3, Français 3,
  Arabe 2 (+2); English also listed; final score 350 = 200 (exam) + 150 (annual average).
- Design: a dedicated concours track (EP15) on the same components, with its own calendar entry.

---

## 4. Design principles the catalogue follows

1. **Tagging is the foundation.** Exercise ↔ chapter ↔ exam-year ↔ points. Without TA01/TA03 the
   bank (EP01), the heat map (EP08), mastery (EP06), interleaving (PR11) and the simulators (EP11)
   cannot exist. Quick wins are ordered "tags first".
2. **Retrieval first.** The default verb on a chapter is *test me*, not *read*. Summaries exist
   to be followed by five questions (EP07).
3. **Space and interleave by default.** DPP (PR05), mixed sets (PR11), mistakes replay (PR10),
   expanding bookmarks (PR09), FSRS decks (EP05).
4. **Exam-format fidelity.** Real durations, real barèmes, DC vs DS formats, section coefficients
   (EP02, EP09, EP11, EP14).
5. **The calendar is the spine.** One exam-calendar collection (OR03) drives countdowns, plans,
   simulators and the planner.
6. **Close the loop with the teacher.** Photo → queue → annotated return within 24 h (PR06, PR07,
   TA04); questions attached to the exact exercise (PR15).
7. **Social = small, cooperative, opt-in.** Pairs (SO04), group challenges (SO03), shared task
   lists (SO02), effort-based opt-in rankings (SO06). Never public mark-based leaderboards (AN01).
8. **Habits with forgiveness.** One exercise keeps the streak (MH01); the Fire pass is earned, max
   two, never bought (SO07); comeback mode instead of guilt (MH07).
9. **Parents see outcomes, not conversations.** Weekly digest (MH06), explicit permissions (TA10).
10. **Don't gate practice, don't hand out answers, don't badge everything.** AN02, AN03, AN07 —
    and keep the prototype free of real engines (AN06).

---

## 5. What could not be verified in this pass (flagged in the cards)

- Exact Quizlet free-tier caps and 2025 plan changes (third-party sources disagree).
- FSRS as Anki's default in 25.07 and the precise review-savings percentages (secondary sources).
- Roediger & Karpicke (2006) one-week percentages (quoted from summaries; check Fig. 2).
- Renkl's fading results (not fetched); Szpunar et al. (2013) and Mayer's principles cited from
  background knowledge.
- The Tunisian "25 % annual average" bac rule; the exact durations per section; the coefficient
  of التفكير الإسلامي in Lettres; concours 9ème coefficients (blog only).
- BYJU'S 2025 corporate status; Unacademy's 2025 mentorship/pricing; Finch "streak protection"
  naming; Flora's current group features; Focusmate's 2025 EEG study (secondhand).
- Whether Brainly's "Test Prep" quizzes launched after the 2023 announcement.

---

## 6. Sources (title — URL — accessed 2026-10-26)

### Learning science
- Which Study Strategies Make the Grade? (APS summary of Dunlosky et al. 2013) — https://www.psychologicalscience.org/news/releases/which-study-strategies-make-the-grade.html — 2026-10-26
- Dunlosky et al. (2013), *Psychological Science in the Public Interest* 14(1), DOI 10.1177/1529100612453266 — https://www.citedrive.com/en/discovery/improving-students-learning-with-effective-learning-techniques — 2026-10-26
- Roediger & Karpicke (2006), Test-enhanced learning (PDF) — https://psychology.ecu.edu/wp-content/pv-uploads/sites/216/2019/03/Roediger-Karpicke-2006.pdf — 2026-10-26
- Test-enhanced learning: Using retrieval practice to help students learn (Vanderbilt CFT) — https://cft.vanderbilt.edu/?p=22452 — 2026-10-26
- Adesope, Trevisan & Sundararajan (2017), Rethinking the Use of Tests, *RER* 87(3) — https://journals.sagepub.com/doi/10.3102/0034654316689306 — 2026-10-26
- Cepeda et al. (2006), Distributed practice in verbal recall tasks (PubMed) — https://pubmed.ncbi.nlm.nih.gov/16719566/ — 2026-10-26
- Cepeda et al. (2006) PDF — https://www.evullab.org/pdf/CepedaPashlerVulWixtedRohrer-PB-2006.pdf — 2026-10-26
- Brunmair & Richter (2019), Similarity matters: a meta-analysis of interleaved learning, *Frontiers in Psychology* — https://www.frontiersin.org/articles/10.3389/fpsyg.2019.02296/full — 2026-10-26
- Rohrer et al. (2019/2020), interleaved mathematics practice RCT (PDF) — https://www.gwern.net/doc/psychology/spaced-repetition/2019-rohrer.pdf — 2026-10-26
- Rohrer, Dedrick & Stershic (2015) (PDF via gwern) — https://www.gwern.net/doc/psychology/spaced-repetition/2014-rohrer.pdf — 2026-10-26
- IES: Systematic replication study of interleaved mathematics practice — https://ies.ed.gov/use-work/awards/systematic-replication-study-interleaved-mathematics-practice — 2026-10-26
- Metcalfe (2017), Learning from errors — research bite — https://tipsforteachers.substack.com/p/research-bite-31-learning-from-errors — 2026-10-26
- Worked-example effect (overview; Sweller & Cooper 1985) — https://en.wikipedia.org/wiki/Worked-example_effect — 2026-10-26
- Worked examples, 2025 review (*Educational Psychology Review*) — https://link.springer.com/article/10.1007/s10648-025-10071-x — 2026-10-26
- Agarwal et al. (2014), Classroom-based programs of retrieval practice reduce test anxiety — https://profiles.wustl.edu/en/publications/classroom-based-programs-of-retrieval-practice-reduce-middle-scho/ — 2026-10-26
- Retrieval practice and student wellbeing (Evidence Based Education, Jan 2026) — https://evidencebased.education/resource/retrieval-practice-and-student-wellbeing/ — 2026-10-26
- Ariely & Wertenbroch (2002), Procrastination, deadlines, and performance — https://scholars.duke.edu/publication/810365 — 2026-10-26
- Hyndman & Bisin, Ariely replication (SSRN 5053636, 2025) — https://bpb-us-e1.wpmucdn.com/wp.nyu.edu/dist/c/16384/files/2025/04/ssrn-5053636.pdf — 2026-10-26
- CHADD: Could a body double help you increase your productivity? — https://chadd.org/adhd-weekly/could-a-body-double-help-you-increase-your-productivity/ — 2026-10-26

### Benchmarked apps
- Quizlet review 2026 (Atomi) — https://atomisystems.com/elearning/quizlet-review-2026-pros-cons-and-comparison — 2026-10-26
- Is Quizlet worth it? Free vs paid (Nibble) — https://nibble-app.com/blog/is-quizlet-worth-it — 2026-10-26
- FSRS vs SM-2 (diane.app, vendor) — https://www.diane.app/en/guides/fsrs-vs-sm2 — 2026-10-26
- Why FSRS is better than SM-2 (DEV) — https://dev.to/palachdigital_20fd679f5fe/why-fsrs-is-better-than-sm-2-2m17 — 2026-10-26
- RemNote — https://remnote.com — 2026-10-26
- RemNote — Notes & Flashcards (App Store) — https://apps.apple.com/tr/app/id1545429784 — 2026-10-26
- Brainly: AI Homework Helper (App Store) — https://apps.apple.com/app/745089947 — 2026-10-26
- Brainly adds AI-powered tools (THE Journal, 2023) — https://thejournal.com/articles/2023/09/14/brainly-adds-ai-powered-tools-to-its-platform.aspx — 2026-10-26
- Knowunity raises €27M (Tech.eu, June 2025) — https://tech.eu/2025/06/13/knowunity-raises-eur27m-to-bring-ai-tutor-to-1-billion-students/ — 2026-10-26
- Knowunity: AI Study & Homework (App Store) — https://apps.apple.com/us/app/knowunity-ai-study-homework/id1484296272 — 2026-10-26
- Vaia: AI Flashcards. Study App (App Store) — https://apps.apple.com/app/id1439949520 — 2026-10-26
- The actual impact of Seneca on student grades (Seneca blog) — https://senecalearning.com/en-GB/blog/the-actual-impact-of-seneca-on-student-grades/ — 2026-10-26
- Is Seneca more effective than revision guides? (Seneca help) — https://help.senecalearning.com/en/articles/2483299-is-seneca-more-effective-than-revision-guides — 2026-10-26
- Seneca review (InnerDrive) — https://www.innerdrive.co.uk/reviews/seneca/ — 2026-10-26
- Quizizz becomes Wayground (press release, 24 June 2025) — https://finance.yahoo.com/news/quizizz-becomes-wayground-announces-ai-130000405.html — 2026-10-26
- Wayground (formerly Quizizz): a teacher's guide — https://www.allinsightz.com/post/wayground-formerly-quizizz — 2026-10-26
- Kahoot! study modes (Kahoot! blog) — https://kahoot.com/?p=14737 — 2026-10-26
- Kahoot! Play & Create Quizzes release notes (APKMirror) — https://www.apkmirror.com/apk/kahoot/kahoot-play-create-quizzes — 2026-10-26
- What is Photomath? (Google support) — https://support.google.com/photomath/answer/14328660?hl=en — 2026-10-26
- Google's new app uses AI to solve math problems (Android Central) — https://www.androidcentral.com/apps-software/google-unveils-photomath-app — 2026-10-26
- Gauthmath (Tools for Humans review) — https://toolsforhumans.ai/ai-tools/gauthmath — 2026-10-26
- How do Khan Academy's Mastery levels work? — https://support.khanacademy.org/hc/en-us/articles/115002552631 — 2026-10-26
- Khan Academy, Need-to-Know BTS 2025 — https://blog.khanacademy.org/need-to-know-bts-2025/ — 2026-10-26
- Khanmigo (School Data Leadership) — https://schooldataleadership.org/systems/ai-tools/khanmigo.html — 2026-10-26
- BYJU'S – The Learning App release notes (APKMirror) — https://www.apkmirror.com/apk/byjus/byjus-the-learning-app/byjus-the-learning-app-10-15-1-15439-release/ — 2026-10-26
- BYJU'S (Techjockey profile) — https://techjockey.com/detail/byjus — 2026-10-26
- Physics Wallah — Arjuna JEE 2026 batch — https://www.pw.live/iit-jee/class-11/batches/batch-prime-arjuna-11th-jee-2026-563246 — 2026-10-26
- Physics Wallah — Lakshya JEE Gujarati 2026 — https://www.pw.live/iit-jee/class-12/batches/lakshya-jee-gujarati-2026-448337 — 2026-10-26
- Physics Wallah — Udaan 2.0 MP Class 10 — https://www.pw.live/mpbse/exams/pw-udaan-2-0-mp-2027-english-medium-class-10th — 2026-10-26
- Vedantu JEE repeater course — https://vedantu.com/online-course/jee-repeater-course — 2026-10-26
- Vedantu JEE foundation courses — https://vedantu.com/online-course/jee-foundation-courses — 2026-10-26
- Vedantu JEE Main 2025 results (blog) — https://www.vedantu.com/blog/vedantus-extraordinary-results-for-jee-main-2025-session-1 — 2026-10-26
- Unacademy Learner App (Apptopia) — https://apptopia.com/ios/app/1342565069/about — 2026-10-26

### French bac-culture apps
- Top 5 applications de révision 2026 (Circle Education) — https://www.circle-education.com/top-5-des-applications-de-revision-etudiantes-en-2026-nomad-education-vs-schoolmouv-vs-wilgo-vs-kartable-vs-digischool/ — 2026-10-26
- Réviser le bac : plateformes d'autoformation (Bpi) — https://www.bpi.fr/selection-numerique-autoformation-bac/ — 2026-10-26
- Top 10 sites de révision gratuits en 2026 (Revizly) — https://revizly.fr/blog/top-10-sites-revision-gratuits — 2026-10-26
- Nomad Education — Objectif Bac/Brevet 2026 (Nomad+) — https://nomadeducation.fr/premium — 2026-10-26
- Nomad Education — fiches de révision en ligne (blog, 2025) — https://www.nomadeducation.fr/blog/articles/2025-04-27/fiches-de-revision-en-ligne-nw95b337 — 2026-10-26
- Bac : 5 applications pour réviser (L'Étudiant) — https://www.letudiant.fr/bac/bac-2025-5-applications-pour-reviser.html — 2026-10-26
- Studeo gives students access to elite tutoring (Business Wire, 2021) — https://www.businesswire.com/news/home/20210907005216/en/Studeo-Gives-Students-From-All-Backgrounds-Access-to-Elite-Tutoring — 2026-10-26
- Studeo plateforme web lycée et prépa (Business Wire, 2022) — https://www.businesswire.com/news/home/20220914005364/fr — 2026-10-26
- digiSchool — annales terminale générale — https://www.digischool.fr/lycee/annales/terminale-generale — 2026-10-26
- Pourquoi réviser avec des annales (NRJ, 2018) — https://www.nrj.fr/actus/bac-2018-pourquoi-reviser-avec-des-annales-71293748 — 2026-10-26
- Lumni — communiqué de presse du 04/05/2026 (France TV Pro) — https://www.francetvpro.fr/contenu-de-presse/76977586 — 2026-10-26
- Lumni — communiqué de presse du 21/04/2026 — https://www.francetvpro.fr/contenu-de-presse/76642030 — 2026-10-26

### Tunisia and MENA
- TakiAcademy — عروض البكالوريا — https://takiacademy.com/ar/offers/baccalaureate — 2026-10-26
- TakiAcademy — محتوانا — https://takiacademy.com/ar/content — 2026-10-26
- TakiAcademy (Google Play) — https://play.google.com/store/apps/details?id=com.softylines.takiacademy&hl=en_US — 2026-10-26
- Devoir.TN — Devoirs Mathématiques 1ère année secondaire — https://www.devoir.tn/secondaire/1-%C3%A8re-ann%C3%A9e/Math%C3%A9matiques/Devoirs/Devoirs-de-contr%C3%B4le-n%C2%B01.html — 2026-10-26
- Devoinet — Devoirs corrigés Tunisie 2025 — https://www.devoinet.tn/ — 2026-10-26
- Devoirat.net — Devoirs Maths — https://www.devoirat.net/maths/devoirs-maths/ — 2026-10-26
- Mathinfo.tn — Maths 1ère année lycée — https://www.mathinfo.tn/math/m1ere.php — 2026-10-26
- Réviser Bac Tunisie — calculatrice (Mo3adli) — https://www.reviserbac.tn/en/calculatrice — 2026-10-26
- Réviser Bac — section Mathématiques — https://www.reviserbac.tn/calculatrice/mathematiques — 2026-10-26
- Réviser Bac — section Sciences expérimentales — https://www.reviserbac.tn/calculatrice/sciences-experimentales — 2026-10-26
- Réviser Bac — section Technique — https://www.reviserbac.tn/calculatrice/technique — 2026-10-26
- Réviser Bac — section Informatique — https://www.reviserbac.tn/calculatrice/informatique — 2026-10-26
- Réviser Bac — section Économie-Gestion — https://www.reviserbac.tn/en/calculatrice/economie-gestion — 2026-10-26
- Réviser Bac — section Lettres — https://www.reviserbac.tn/en/calculatrice/lettres — 2026-10-26
- Réviser Bac — section Sport — https://www.reviserbac.tn/calculatrice/sport — 2026-10-26
- Calculer moyenne et score bac Tunisie (kedma.tn) — https://www.kedma.tn/2024/06/calculer-moyenne-et-score-bac-tunisie.html — 2026-10-26
- Tunisiana lance Najja7ni Emploi (Tekiano, 2013) — https://www.tekiano.com/2013/04/11/tunisiana-lance-le-service-qnajja7ni-emploiq/ — 2026-10-26
- Najja7ni Emploi (WMC, 2013) — https://www.webmanagercenter.com/2013/04/11/133492/tunisiana-lance-le-nouveau-service-mobile-najja7ni-emploi/ — 2026-10-26
- Najah — نجاح, open-source PWA for Tunisian pupils (GitHub) — https://github.com/houmem1/najah-app — 2026-10-26
- Yenja7 (Google Play) — https://play.google.com/store/apps/details?id=com.yenja7.app&hl=en_US — 2026-10-26
- Abwaab AI for digital content (T4 Education) — https://t4.education/edtech-finalists-winners/abwaab-ai-for-digital-content/ — 2026-10-26
- Abwaab: democratizing learning in MENA — https://www.realisticoptimist.io/abwaab-democratizing-learning-in-mena/ — 2026-10-26
- Abwaab raises $20M Series A (TechCrunch, 2021) — https://techcrunch.com/2021/11/15/abwaab-raises-20m-series-a-led-by-beco-capital-to-expand-across-mena-and-pakistan — 2026-10-26
- Noon Academy: from Saudi roots to global social learning (Arab Founders) — https://arabfounders.net/en/noon-academy-saudi-edtech-rise/ — 2026-10-26
- Noon (CB Insights) — https://www.cbinsights.com/company/noon-academy — 2026-10-26
- Baims raises $2M pre-Series A (Wamda, 2022) — https://www.wamda.com/en/2022/03/kuwaiti-edtech-baims-raises-2-million-pre-series-a-round — 2026-10-26
- Baims (Entrepreneur Middle East) — https://mena.entrepreneur.com/?p=14449 — 2026-10-26
- Nafham (EgyptInnovate) — https://egyptinnovate.com/entities/profile/nafham — 2026-10-26
- Nafham, a learning platform for Egypt (Wamda, 2012) — https://www.wamda.com/2012/04/nafham-a-learning-management-platform-to-enhance-education-in-egypt — 2026-10-26
- EdTrust rapproche l'école des familles (WMC, Oct 2025) — https://www.webmanagercenter.com/2025/10/03/550649/la-tunisie-qui-gagne-firas-dhaouedi-edtrust-rapproche-lecole-des-familles-et-libere-du-temps-pour-les-enseignants/ — 2026-10-26
- Une jeune bachelière lance une plateforme gratuite (Directinfo, Aug 2026) — https://directinfo.webmanagercenter.com/2026/08/13/tunisie-une-jeune-bacheliere-lance-une-plateforme-gratuite-pour-les-eleves/ — 2026-10-26
- Talents Tunisie 2025 opens applications (The Next Africa) — https://magazine.thenextafrica.com/talents-tunisie-2025-opens-applications-for-edtech-and-healthtech-innovators/ — 2026-10-26
- EdTech en Tunisie : les startups qui réinventent l'apprentissage (L'Instant M) — https://linstant-m.tn/single-article/ar10371_edtech-en-tunisie-ces-startups-qui-reinventent-lapprentissage — 2026-10-26

### Tunisian exam logistics
- Calendrier, chiffres et nouvelles mesures — examens nationaux et bac 2026 (La Presse, 1 June 2026) — https://www.lapresse.tn/2026/06/01/calendrier-chiffres-et-nouvelles-mesures-tout-ce-quil-faut-savoir-sur-les-examens-nationaux-et-le-baccalaureat-2026/ — 2026-10-26
- Le ministère publie le calendrier des examens nationaux (La Presse, 4 Apr 2026) — https://www.lapresse.tn/2026/04/04/le-ministere-de-leducation-publie-le-calendrier-des-examens-nationaux/ — 2026-10-26
- Bac 2026 : calendrier des épreuves écrites (Tekiano, Dec 2025) — https://www.tekiano.com/2025/12/29/tunisie-concours-bac-2026-calendrier-des-epreuves-ecrites-de-la-session-principale-et-de-controle/ — 2026-10-26
- Calendrier officiel des examens nationaux 2025-2026 (ecoles.com.tn) — https://www.ecoles.com.tn/actualites/tunisie-calendrier-officiel-des-examens-nationaux-pour-lannee-scolaire-2025-2026 — 2026-10-26
- Bac 2026 : démarrage des épreuves pratiques et orales (Tunisie Numérique) — https://www.tunisienumerique.com/bac-2026-demarrage-des-epreuves-pratiques-et-orales/ — 2026-10-26
- Bac 2026 : consultation des notes du contrôle continu (Tunisie Numérique) — https://www.tunisienumerique.com/bac-2026-ce-quil-faut-savoir-sur-la-consultation-des-notes-du-controle-continu/ — 2026-10-26
- Calendrier scolaire 2025-2026 : devoirs de synthèse et contrôles (La Presse, 1 Dec 2025) — https://www.lapresse.tn/2025/12/01/calendrier-scolaire-2025-2026-dates-des-devoirs-de-synthese-et-controles-dans-les-colleges-et-lycees/ — 2026-10-26
- Calendrier des devoirs de contrôle et de synthèse 2025-2026 (WMC, Oct 2025) — https://www.webmanagercenter.com/2025/10/14/553653/annee-scolaire-2025-2026-voici-le-calendrier-des-devoirs-de-controle-et-de-synthese-en-tunisie/ — 2026-10-26
- Calendrier du contrôle continu, troisième trimestre (Tunisie Numérique) — https://www.tunisienumerique.com/le-ministere-de-leducation-publie-le-calendrier-du-controle-continu-pour-le-troisieme-trimestre-2025-2026/ — 2026-10-26
- Calendrier scolaire Tunisie 2025-2026 : vacances (demarches.tn) — https://www.demarches.tn/calendrier-dates-vacances-scolaires-2025-2026/ — 2026-10-26
- Concours 9ème 2026 : 32 004 élèves (Tekiano, June 2026) — https://www.tekiano.com/2026/06/17/concours-9eme-2026-32-004-eleves-passeront-les-epreuves-les-18-19-et-20-juin/ — 2026-10-26
- Résultats concours 9ème 2026 : 63,96 % (ecoles.com.tn) — https://www.ecoles.com.tn/actualites/tunisie-resultats-concours-9eme-2026-un-taux-de-reussite-de-6396 — 2026-10-26
- Concours brevet 9ème 2026 : dates, programme (web6.tn, blog) — https://web6.tn/blog/concours-brevet-9eme-annee-tunisie-2026-resultats/ — 2026-10-26
- 3850 élèves accèderont aux collèges pilotes (Mosaïque FM) — https://www.mosaiquefm.net/fr/national-tunisie/1517215/3850-eleves-accederont-aux-colleges-pilotes — 2026-10-26
- Bac 2025 : coup d'envoi pour plus de 151 000 candidats (Tunisie Numérique) — https://www.tunisienumerique.com/tunisie-bac-2025-coup-denvoi-des-epreuves-pour-plus-de-151-000-candidats/ — 2026-10-26
- Bac 2025 : mentions très bien, la suprématie des mathématiques (Webdo) — https://www.webdo.tn/fr/actualite/national/tunisie-bac-2025-mentions-tres-bien-la-suprematie-des-mathematiques/379480/ — 2026-10-26

### Focus, habits, Duolingo, calendars, parents
- Forest — official site text — https://forestapp.cc/llms-full.txt — 2026-10-26
- Flora focus app review (Business of Business) — https://www.businessofbusiness.com/articles/flora-focus-productivity-app-review/ — 2026-10-26
- FLIP – Focus Timer for Study (App Store) — https://apps.apple.com/us/app/-/id1435127190 — 2026-10-26
- Focusmate media kit — https://www.focusmate.com/?p=3865 — 2026-10-26
- Focusmate review 2026 (Saner.ai) — https://blog.saner.ai/focusmate-review/ — 2026-10-26
- Study Together (Discord server) — https://discord.com/servers/study-together-595999872222756885 — 2026-10-26
- Habitica Wiki — Party progress info — https://habitica.fandom.com/wiki/Party_Progress_Info — 2026-10-26
- Finch (Internet Matters guide) — https://www.internetmatters.org/advice/apps-and-platforms/wellbeing/finch/ — 2026-10-26
- Finch app review after 30 days (Headway) — https://makeheadway.com/blog/finch-app-review/ — 2026-10-26
- Collaborate with friends or family in Todoist (help center) — https://todoist.com/help/articles/use-shared-projects-in-todoist-tzkGUy — 2026-10-26
- Duolingo — Improving the streak (blog) — https://blog.duolingo.com/improving-the-streak — 2026-10-26
- Duolingo — Friend Streak (blog) — https://blog.duolingo.com/friend-streak/ — 2026-10-26
- Duolingo — Product lessons from Friend Streak (blog) — https://blog.duolingo.com/product-lessons-friend-streak/ — 2026-10-26
- Duolingo — Friends & social features (blog) — https://blog.duolingo.com/friends-social-features/ — 2026-10-26
- Duolingo — Tips for maintaining your streak (blog) — https://blog.duolingo.com/tips-for-maintaining-streak — 2026-10-26
- Duolingo breaks hearts for Energy (Class Central) — https://www.classcentral.com/report/duolingo-breaks-hearts-for-energy/ — 2026-10-26
- Duolingo Energy system — complete guide (duoplanet) — https://duoplanet.com/duolingo-energy-system/ — 2026-10-26
- Energy (Duolingo fan wiki) — https://duolingo.fandom.com/wiki/Energy — 2026-10-26
- Duolingo streaks: 2× daily retention (Deconstructor of Fun) — https://duolingo.deconstructoroffun.com/mechanics/streaks — 2026-10-26
- Google Classroom — enable guardians to preview assigned classwork (Workspace Updates, July 2024) — https://workspaceupdates.googleblog.com/2024/07/enable-guardians-to-preview-assigned-classwork-google-calendar.html — 2026-10-26
- Google Classroom — guardian guide (Schoolytics PDF) — https://www.petridesschool.com/cms/lib/NY01922748/Centricity/Domain/159/Schoolytics%20Guardian%20Guide%20to%20Google%20Classroom.pdf — 2026-10-26
- Google Classroom user guide for teachers (PDF) — https://services.google.com/fh/files/misc/gfe_classroom_userguide_teachers.pdf — 2026-10-26
- Subscribe to calendars — Apple Calendar user guide — https://support.apple.com/en-au/guide/calendar/icl1022/16.0/mac/26 — 2026-10-26
- How to subscribe to a web (ICS) calendar in Google Calendar (OneCal) — https://www.onecal.io/blog/how-to-subscribe-to-a-web-ics-calendar-in-google-calendar — 2026-10-26
- Providing a "subscribe in Google Calendar" link (Simon Willison) — https://til.simonwillison.net/ics/google-calendar-ics-subscribe-link — 2026-10-26
- ClassDojo at Southside (school page) — https://southside.ecsdnv.net/page/classdojo — 2026-10-26
- Seesaw for parents (Morningside school page) — https://morningside.hackney.sch.uk/parents/parent-information/seesaw/ — 2026-10-26
- Top 5 apps for teacher communication (Matt Lynch) — https://www.drmattlynch.com/?p=12504 — 2026-10-26
