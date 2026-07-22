import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarClock,
  CalendarDays,
  Camera,
  Check,
  ClipboardCheck,
  Clock,
  CreditCard,
  Download,
  FileText,
  Gift,
  GraduationCap,
  Heart,
  Languages,
  LifeBuoy,
  Lock,
  MessageCircle,
  Play,
  Radio,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Video,
} from "lucide-react"
import "./landing.css"

/* ------------------------------------------------------------------ */
/* Motion: scroll-reveal wrapper (IntersectionObserver → .is-in)       */
/* ------------------------------------------------------------------ */

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`lp-reveal ${inView ? "is-in" : ""} ${className}`}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Small shared pieces                                                 */
/* ------------------------------------------------------------------ */

function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="font-display text-[11px] font-bold uppercase tracking-[.16em] text-accent2-600">
      {children}
    </p>
  )
}

function BrandMark({ size = "size-9" }: { size?: string }) {
  return (
    <span className={`grid ${size} place-items-center rounded-[11px] bg-grad text-ink-inverted shadow-brand`}>
      <GraduationCap className="size-5" />
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Navbar                                                              */
/* ------------------------------------------------------------------ */

function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 pt-safe backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1220px] items-center gap-3 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandMark />
          <span className="leading-tight">
            <span className="block font-display text-[15px] font-bold text-ink">Wael Academy</span>
            <span className="block text-[10px] font-medium uppercase tracking-[.14em] text-accent2-600">
              Académie
            </span>
          </span>
        </Link>

        <nav className="ms-auto hidden items-center gap-1 md:flex">
          {[
            ["#fonctionnalites", "Fonctionnalités"],
            ["#ia", "IA pédagogique"],
            ["#offres", "Offres"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="rounded-md px-3.5 py-2 text-[13.5px] font-medium text-ink-subtle transition hover:bg-brand-50 hover:text-brand-600"
            >
              {label}
            </a>
          ))}
        </nav>

        <Link
          to="/roles"
          className="ms-auto inline-flex h-10 items-center gap-2 rounded-md bg-grad px-4 text-[13.5px] font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:ms-3"
        >
          Essayer la démo <ArrowRight className="size-4" />
        </Link>
      </div>
    </header>
  )
}

/* ------------------------------------------------------------------ */
/* Hero + its interface mockup                                         */
/* ------------------------------------------------------------------ */

/** Miniature student dashboard — pure divs, decoration only. */
function HeroMock() {
  return (
    <div aria-hidden className="pointer-events-none relative select-none">
      {/* Floating window */}
      <div className="lp-rise overflow-hidden rounded-xl border border-border bg-surface shadow-xl" style={{ "--d": ".25s" } as CSSProperties}>
        <div className="grid grid-cols-[52px_1fr]">
          {/* mini rail */}
          <aside className="flex flex-col items-center gap-3 border-e border-border bg-surface-muted py-4">
            <span className="grid size-8 place-items-center rounded-[9px] bg-grad text-ink-inverted shadow-brand">
              <GraduationCap className="size-4" />
            </span>
            <span className="mt-2 grid size-8 place-items-center rounded-[9px] bg-grad text-ink-inverted">
              <BookOpen className="size-4" />
            </span>
            <span className="grid size-8 place-items-center rounded-[9px] text-ink-muted">
              <CalendarDays className="size-4" />
            </span>
            <span className="grid size-8 place-items-center rounded-[9px] text-ink-muted">
              <ClipboardCheck className="size-4" />
            </span>
            <span className="grid size-8 place-items-center rounded-[9px] text-ink-muted">
              <MessageCircle className="size-4" />
            </span>
          </aside>

          {/* stage */}
          <div className="flex flex-col gap-3.5 p-4">
            <div className="flex items-center gap-3">
              <div>
                <p className="font-display text-[14.5px] font-bold text-ink">Bonjour, Yasmine</p>
                <p className="text-[10.5px] text-ink-muted">Terminale · Sciences expérimentales</p>
              </div>
              <div className="ms-auto grid size-8 place-items-center rounded-full bg-grad font-display text-[12px] font-bold text-ink-inverted shadow-[0_0_0_2px_var(--surface),0_0_0_3.5px_var(--brand-100)]">
                Y
              </div>
            </div>

            {/* resume-course card */}
            <div className="rounded-md border border-border bg-surface p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-navy-50 text-navy-500">
                  <Play className="size-4" />
                </span>
                <span className="min-w-0">
                  <b className="block truncate font-display text-[11.5px] font-bold text-ink">
                    Maths — Limites et continuité
                  </b>
                  <span className="text-[9.5px] text-ink-muted">Reprendre à 12:34 · Chapitre 3</span>
                </span>
                <span className="ms-auto font-display text-[11px] font-bold text-brand-600">62%</span>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                <div className="lp-bar h-full rounded-full bg-grad" style={{ "--w": "62%" } as CSSProperties} />
              </div>
            </div>

            {/* next live chip */}
            <div className="rounded-sm border-l-4 border-l-danger-500 bg-danger-50 p-[9px_10px_8px] shadow-sm">
              <span className="font-display text-[10.5px] font-bold text-danger-700">
                Séance live · Physique — Ondes
              </span>
              <span className="mt-1 flex items-center gap-1.5 text-[9.5px] text-ink-muted">
                <Clock className="size-2.5 opacity-75" /> Aujourd’hui · 18:00 — rappel activé
              </span>
            </div>

            {/* two stat tiles */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-md bg-surface-muted p-2.5">
                <p className="text-[9px] text-ink-muted">Temps d’étude · semaine</p>
                <b className="font-display text-[13px] font-bold text-ink">6 h 40</b>
              </div>
              <div className="rounded-md bg-grad p-2.5 text-ink-inverted shadow-brand">
                <p className="text-[9px] text-white/80">Vidéos terminées</p>
                <b className="font-display text-[13px] font-bold">24 / 31</b>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* floating badges */}
      <div
        className="lp-rise lp-float absolute -top-4 -end-3 flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 shadow-lg sm:-end-6"
        style={{ "--d": ".55s" } as CSSProperties}
      >
        <span className="grid size-7 place-items-center rounded-[9px] bg-success-50 text-success-600">
          <ClipboardCheck className="size-3.5" />
        </span>
        <span className="text-[11px] font-medium text-ink">
          Quiz corrigé · <b className="font-display font-bold text-success-600">18/20</b>
        </span>
      </div>

      <div
        className="lp-rise lp-float absolute -bottom-5 -start-3 flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 shadow-lg sm:-start-6"
        style={{ "--d": ".7s" } as CSSProperties}
      >
        <span className="grid size-7 place-items-center rounded-[9px] bg-accent2-50 text-accent2-500">
          <Sparkles className="size-3.5" />
        </span>
        <span className="text-[11px] font-medium text-ink">IA · 3 notions à revoir jeudi</span>
      </div>

      <div
        className="lp-rise lp-float absolute -end-2 bottom-16 flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 shadow-lg sm:-end-8"
        style={{ "--d": ".85s" } as CSSProperties}
      >
        <span className="lp-pulse size-2 rounded-full bg-danger-500" />
        <span className="text-[11px] font-medium text-ink">Live dans 15 min</span>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid w-full max-w-[1220px] items-center gap-12 px-4 pb-20 pt-14 sm:px-6 md:pb-24 md:pt-20 lg:grid-cols-2 lg:gap-10">
        <div>
          <div className="lp-rise" style={{ "--d": "0s" } as CSSProperties}>
            <Kicker>Plateforme éducative · Tunisie</Kicker>
          </div>
          <h1
            className="lp-rise mt-3 font-display text-[32px] font-bold leading-[1.14] text-ink sm:text-[40px] lg:text-[44px]"
            style={{ "--d": ".08s" } as CSSProperties}
          >
            Apprends, révise et progresse —{" "}
            {/* inline clip: the .bg-grad shorthand resets background-clip, so set both here */}
            <span
              className="text-transparent"
              style={{ backgroundImage: "var(--grad)", WebkitBackgroundClip: "text", backgroundClip: "text" }}
            >
              au même endroit.
            </span>
          </h1>
          <p
            className="lp-rise mt-4 max-w-[520px] text-[15.5px] leading-relaxed text-ink-subtle"
            style={{ "--d": ".16s" } as CSSProperties}
          >
            Cours en vidéo, séances live avec tes enseignants, quiz auto-corrigés et une IA qui
            connaît tes points forts et tes points faibles. Tout ton bac, dans ta poche.
          </p>

          <div className="lp-rise mt-7 flex flex-wrap items-center gap-3" style={{ "--d": ".24s" } as CSSProperties}>
            <Link
              to="/student"
              className="inline-flex h-12 items-center gap-2 rounded-md bg-grad px-6 font-medium text-ink-inverted shadow-brand transition hover:-translate-y-0.5 hover:brightness-105"
            >
              Découvrir l’espace élève <ArrowRight className="size-4" />
            </Link>
            <a
              href="#offres"
              className="inline-flex h-12 items-center gap-2 rounded-md border border-border-strong bg-surface px-5 font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"
            >
              Voir les offres
            </a>
          </div>

          <div className="lp-rise mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-ink-muted" style={{ "--d": ".32s" } as CSSProperties}>
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-success-600" /> Français &amp; العربية
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-success-600" /> Paiement en dinar (ClicToPay)
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-success-600" /> Web, mobile &amp; tablette
            </span>
          </div>
        </div>

        <HeroMock />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Stats strip                                                         */
/* ------------------------------------------------------------------ */

function StatsStrip() {
  const stats = [
    { value: "8+", label: "matières couvertes" },
    { value: "500+", label: "leçons en vidéo" },
    { value: "3×/sem.", label: "séances live par matière" },
    { value: "24/7", label: "assistant IA disponible" },
  ]
  return (
    <section className="mx-auto w-full max-w-[1220px] px-4 sm:px-6">
      <Reveal>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border shadow-sm md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-surface px-5 py-6 text-center">
              <b className="block font-display text-[24px] font-bold text-brand-600">{s.value}</b>
              <span className="mt-1 block text-[12.5px] text-ink-muted">{s.label}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Feature showcases (ordered per cahier des charges §4)               */
/* ------------------------------------------------------------------ */

/** Mock 1 — secure video player + attached resources. */
function VideoMock() {
  return (
    <div aria-hidden className="pointer-events-none select-none rounded-lg border border-border bg-surface p-4 shadow-md">
      <p className="mb-3 flex items-center gap-1 text-[10px] text-ink-muted">
        Mathématiques <span className="text-neutral-300">/</span> Terminale{" "}
        <span className="text-neutral-300">/</span> Chapitre 3 <span className="text-neutral-300">/</span>{" "}
        <span className="font-medium text-brand-600">Leçon 2</span>
      </p>
      {/* player */}
      <div className="relative overflow-hidden rounded-md bg-neutral-800">
        <div className="grid aspect-[16/8.5] place-items-center">
          <span className="grid size-12 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm">
            <Play className="size-5 translate-x-px" />
          </span>
        </div>
        <span className="absolute end-2.5 top-2.5 rounded-full bg-black/40 px-2 py-0.5 text-[9px] font-medium text-white/85">
          Lecteur sécurisé
        </span>
        <div className="absolute inset-x-3 bottom-2.5">
          <div className="h-1 overflow-hidden rounded-full bg-white/25">
            <div className="lp-bar h-full rounded-full bg-grad" style={{ "--w": "38%" } as CSSProperties} />
          </div>
          <p className="mt-1.5 text-[9px] text-white/70">Reprendre à 12:34 · Limites et continuité</p>
        </div>
      </div>
      {/* resources */}
      <div className="mt-3 flex flex-col">
        {[
          { name: "Énoncé — Série d’exercices n°3", meta: "PDF · 1,2 Mo", canDownload: true },
          { name: "Corrigé détaillé de la série", meta: "PDF · 2,8 Mo", canDownload: false },
        ].map((r) => (
          <div key={r.name} className="flex items-center gap-3 border-t border-border py-2.5 first:border-t-0">
            <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-navy-50 text-navy-500">
              <FileText className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <p className="truncate text-[11.5px] font-medium text-ink">{r.name}</p>
              <span className="text-[9.5px] text-ink-muted">{r.meta}</span>
            </span>
            {r.canDownload ? (
              <span className="grid size-7 place-items-center rounded-[9px] bg-brand-50 text-brand-600">
                <Download className="size-3.5" />
              </span>
            ) : (
              <span className="grid size-7 place-items-center rounded-[9px] bg-neutral-100 text-ink-muted">
                <Lock className="size-3.5" />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Mock 2 — live calendar + join + replays. */
function LiveMock() {
  const days = ["L", "M", "M", "J", "V", "S", "D"]
  return (
    <div aria-hidden className="pointer-events-none select-none rounded-lg border border-border bg-surface p-4 shadow-md">
      {/* mini calendar */}
      <div className="grid grid-cols-7 gap-y-0.5 text-center">
        {days.map((d, i) => (
          <div key={i} className={`pb-2 font-display text-[10.5px] font-bold ${i > 4 ? "text-accent2-500" : "text-brand-500"}`}>
            {d}
          </div>
        ))}
        {[14, 15, 16, 17, 18, 19, 20].map((n) => (
          <span
            key={n}
            className={`relative mx-auto grid h-[29px] w-full max-w-[38px] place-items-center rounded-[9px] text-[11.5px] font-medium ${
              n === 17
                ? "bg-danger-500 font-bold text-white shadow-[0_5px_12px_-4px_rgb(222_0_0/.55)]"
                : n === 19
                  ? "bg-grad font-bold text-ink-inverted shadow-brand"
                  : "text-ink-subtle"
            }`}
          >
            {n}
            {(n === 15 || n === 18) && (
              <i className="absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-brand-500" />
            )}
          </span>
        ))}
      </div>

      {/* live now */}
      <div className="mt-4 rounded-md border border-border bg-surface p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-danger-50 text-danger-600">
            <Radio className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <b className="block truncate font-display text-[11.5px] font-bold text-ink">
              Physique — Ondes mécaniques
            </b>
            <span className="flex items-center gap-1.5 text-[9.5px] text-ink-muted">
              <span className="lp-pulse size-1.5 rounded-full bg-danger-500" /> En direct · Mme Trabelsi · présence suivie
            </span>
          </span>
          <span className="rounded-md bg-grad px-3 py-1.5 text-[10.5px] font-medium text-ink-inverted shadow-brand">
            Rejoindre
          </span>
        </div>
      </div>

      {/* replays */}
      <div className="mt-3 flex flex-col">
        {[
          { title: "Replay · Chimie organique", meta: "Année en cours · 1 h 42" },
          { title: "Replay · Révision bac blanc", meta: "Année 2025 · 2 h 10" },
        ].map((r) => (
          <div key={r.title} className="flex items-center gap-3 border-t border-border py-2.5 first:border-t-0">
            <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-brand-50 text-brand-600">
              <Video className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <p className="truncate text-[11.5px] font-medium text-ink">{r.title}</p>
              <span className="text-[9.5px] text-ink-muted">{r.meta}</span>
            </span>
            <Play className="size-3.5 text-ink-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Mock 3 — auto-corrected quiz. */
function QuizMock() {
  return (
    <div aria-hidden className="pointer-events-none select-none rounded-lg border border-border bg-surface p-4 shadow-md">
      <div className="flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-[9px] bg-brand-50 text-brand-600">
          <ClipboardCheck className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <b className="block font-display text-[12px] font-bold text-ink">Quiz — Limites et continuité</b>
          <span className="text-[9.5px] text-ink-muted">Question 3 / 10 · rattaché à la leçon 2</span>
        </span>
        <span className="rounded-full bg-success-50 px-2.5 py-0.5 font-display text-[11px] font-bold text-success-700">
          18/20
        </span>
      </div>

      <p className="mt-4 text-[12px] font-medium text-ink">
        La limite de (sin x)/x quand x tend vers 0 vaut :
      </p>
      <div className="mt-2.5 flex flex-col gap-2">
        {[
          { label: "0", state: "idle" },
          { label: "1", state: "correct" },
          { label: "+∞", state: "wrong" },
        ].map((o) => (
          <div
            key={o.label}
            className={`flex items-center gap-2.5 rounded-md border px-3 py-2 text-[11.5px] font-medium ${
              o.state === "correct"
                ? "border-success-500/40 bg-success-50 text-success-700"
                : o.state === "wrong"
                  ? "border-danger-500/30 bg-danger-50 text-danger-700 line-through"
                  : "border-border bg-surface-muted text-ink-subtle"
            }`}
          >
            <span
              className={`grid size-5 place-items-center rounded-full border text-[9px] ${
                o.state === "correct"
                  ? "border-success-500 bg-success-500 text-white"
                  : o.state === "wrong"
                    ? "border-danger-500 text-danger-500"
                    : "border-border-strong text-ink-muted"
              }`}
            >
              {o.state === "correct" ? <Check className="size-3" /> : ""}
            </span>
            {o.label}
          </div>
        ))}
      </div>

      <div className="mt-3.5 flex items-center gap-2 rounded-md bg-surface-cream px-3 py-2.5 text-[10.5px] text-accent2-700">
        <Sparkles className="size-3.5 shrink-0" />
        Correction automatique — ta réponse alimente ton profil IA et tes révisions.
      </div>
    </div>
  )
}

interface Showcase {
  id: string
  kicker: string
  title: string
  desc: string
  bullets: string[]
  mock: ReactNode
}

const SHOWCASES: Showcase[] = [
  {
    id: "cours",
    kicker: "01 · Cours en vidéo",
    title: "Tout le programme, en vidéo sécurisée",
    desc: "Chaque leçon est organisée par matière, niveau et chapitre, avec ses ressources rattachées : énoncés, corrigés et fiches en PDF.",
    bullets: [
      "Lecteur sécurisé avec reprise là où tu t’es arrêté",
      "Ressources PDF rattachées à chaque vidéo",
      "Téléchargement quand il est autorisé",
    ],
    mock: <VideoMock />,
  },
  {
    id: "live",
    kicker: "02 · Séances live",
    title: "Des séances live avec tes enseignants",
    desc: "Rejoins tes séances Zoom à l’heure prévue, reçois un rappel avant chaque cours, et retrouve tous les replays — même ceux des années précédentes.",
    bullets: [
      "Calendrier des séances + notifications de rappel",
      "Replays automatiques, classés par année",
      "Présence et temps de participation suivis",
    ],
    mock: <LiveMock />,
  },
  {
    id: "quiz",
    kicker: "03 · Quiz & évaluations",
    title: "Des quiz corrigés à l’instant",
    desc: "Après chaque vidéo, teste-toi : score immédiat, correction détaillée, historique de tes tentatives — et chaque question est reliée à sa vidéo.",
    bullets: [
      "QCM, vrai/faux et réponses courtes",
      "Score et correction automatiques",
      "Chaque question renvoie vers la vidéo à revoir",
    ],
    mock: <QuizMock />,
  },
]

function FeatureShowcases() {
  return (
    <section id="fonctionnalites" className="mx-auto w-full max-w-[1220px] scroll-mt-20 px-4 pt-24 sm:px-6">
      <Reveal className="mx-auto max-w-[620px] text-center">
        <Kicker>L’espace élève</Kicker>
        <h2 className="mt-2 font-display text-[26px] font-bold text-ink sm:text-[32px]">
          Tout ce qu’il te faut pour réussir
        </h2>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-subtle">
          Les fonctionnalités principales de la plateforme, dans l’ordre où tu les vivras : apprendre,
          participer, se tester — et laisser l’IA guider tes révisions.
        </p>
      </Reveal>

      <div className="mt-14 flex flex-col gap-20">
        {SHOWCASES.map((f, i) => (
          <div key={f.id} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
            <Reveal className={i % 2 === 1 ? "lg:order-2" : ""}>
              <Kicker>{f.kicker}</Kicker>
              <h3 className="mt-2 font-display text-[22px] font-bold text-ink sm:text-[26px]">{f.title}</h3>
              <p className="mt-3 max-w-[460px] text-[14.5px] leading-relaxed text-ink-subtle">{f.desc}</p>
              <ul className="mt-5 flex flex-col gap-2.5">
                {f.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-[13.5px] text-ink">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success-50 text-success-600">
                      <Check className="size-3" />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={120} className={i % 2 === 1 ? "lg:order-1" : ""}>
              {f.mock}
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* AI section                                                          */
/* ------------------------------------------------------------------ */

/** Mock — the conversational AI assistant. */
function ChatMock() {
  return (
    <div aria-hidden className="pointer-events-none select-none rounded-lg border border-border bg-surface p-4 shadow-md">
      <div className="flex items-center gap-2.5 border-b border-border pb-3">
        <span className="grid size-8 place-items-center rounded-[9px] bg-grad text-ink-inverted shadow-brand">
          <Sparkles className="size-4" />
        </span>
        <span>
          <b className="block font-display text-[12px] font-bold text-ink">Assistant Wael</b>
          <span className="flex items-center gap-1 text-[9.5px] text-ink-muted">
            <span className="size-1.5 rounded-full bg-success-500" /> connaît ton profil de compétences
          </span>
        </span>
      </div>

      <div className="mt-3.5 flex flex-col gap-2.5">
        <div className="ms-auto max-w-[80%] rounded-md rounded-ee-xs bg-grad px-3.5 py-2.5 text-[11.5px] text-ink-inverted">
          Quels sont mes points faibles en maths ?
        </div>
        <div className="me-auto max-w-[88%] rounded-md rounded-es-xs bg-surface-muted px-3.5 py-2.5 text-[11.5px] leading-relaxed text-ink">
          Tu maîtrises bien les <b className="text-success-600">limites</b> et la{" "}
          <b className="text-success-600">continuité</b> 💪. À renforcer : les{" "}
          <b className="text-danger-600">intégrales par parties</b> — 3 erreurs sur tes 2 derniers quiz.
          J’ai ajouté 2 vidéos à ton calendrier de révision de jeudi.
        </div>
        <div className="me-auto flex max-w-[88%] flex-wrap gap-1.5">
          {["Revoir la leçon 4", "Refaire la série n°6", "Plan de révision"].map((c) => (
            <span key={c} className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[10px] font-medium text-brand-700">
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-surface-muted p-[5px_5px_5px_14px]">
        <span className="flex-1 text-[11px] text-ink-muted">Pose ta question…</span>
        <span className="grid size-7 place-items-center rounded-[8px] bg-grad text-ink-inverted">
          <ArrowRight className="size-3.5" />
        </span>
      </div>
    </div>
  )
}

function AiSection() {
  const cards = [
    {
      icon: Camera,
      title: "Correcteur d’exercices par photo",
      desc: "Prends ton exercice résolu en photo : l’IA repère tes erreurs, les explique, et te recommande les passages vidéo à revoir.",
    },
    {
      icon: Brain,
      title: "Profil de compétences",
      desc: "Chaque quiz et chaque exercice nourrit ton profil : tes points forts et tes points faibles, suivis dans le temps.",
    },
    {
      icon: CalendarClock,
      title: "Calendrier intelligent de révision",
      desc: "Chaque jour, la plateforme te suggère quoi réviser en priorité — directement dans ton calendrier.",
    },
  ]
  return (
    <section id="ia" className="mx-auto w-full max-w-[1220px] scroll-mt-20 px-4 pt-24 sm:px-6">
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div>
          <Reveal>
            <Kicker>04 · Intelligence artificielle</Kicker>
            <h2 className="mt-2 font-display text-[26px] font-bold text-ink sm:text-[32px]">
              Une IA qui révise avec toi
            </h2>
            <p className="mt-3 max-w-[520px] text-[14.5px] leading-relaxed text-ink-subtle">
              Pas un gadget : un vrai coach. L’IA suit tes réponses, construit ton profil, corrige tes
              exercices en photo et organise tes révisions.
            </p>
          </Reveal>
          <div className="mt-7 flex flex-col gap-3.5">
            {cards.map((c, i) => (
              <Reveal key={c.title} delay={i * 90}>
                <div className="group flex items-start gap-4 rounded-lg border border-border bg-surface p-[18px] shadow-sm transition hover:border-brand-200 hover:shadow-md motion-safe:hover:-translate-y-0.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-md bg-accent2-50 text-accent2-500 transition group-hover:bg-grad group-hover:text-ink-inverted">
                    <c.icon className="size-5" />
                  </span>
                  <span>
                    <b className="block font-display text-[14.5px] font-bold text-ink">{c.title}</b>
                    <span className="mt-1 block text-[13px] leading-relaxed text-ink-subtle">{c.desc}</span>
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={150}>
          <ChatMock />
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* "Et aussi" grid                                                     */
/* ------------------------------------------------------------------ */

function MoreGrid() {
  const items = [
    { icon: TrendingUp, title: "Suivi de progression", desc: "Vidéos vues, quiz réalisés, temps d’étude et présence aux séances." },
    { icon: Users, title: "Forum & espaces enseignants", desc: "Échange avec tes enseignants et tes camarades, explore leurs contenus." },
    { icon: Search, title: "Recherche & filtres", desc: "Trouve un contenu par matière, niveau, chapitre ou enseignant." },
    { icon: Heart, title: "Favoris « à revoir »", desc: "Garde sous la main les vidéos et exercices à retravailler." },
    { icon: Languages, title: "Français & العربية", desc: "Interface complète dans les deux langues, avec bascule RTL." },
    { icon: LifeBuoy, title: "Assistance en direct", desc: "Un bouton de chat d’aide, toujours en bas à droite de l’écran." },
  ]
  return (
    <section className="mx-auto w-full max-w-[1220px] px-4 pt-24 sm:px-6">
      <Reveal className="mx-auto max-w-[560px] text-center">
        <Kicker>Et aussi</Kicker>
        <h2 className="mt-2 font-display text-[24px] font-bold text-ink sm:text-[28px]">
          Les petits plus qui changent tout
        </h2>
      </Reveal>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <Reveal key={it.title} delay={(i % 3) * 90}>
            <div className="h-full rounded-lg border border-border bg-surface p-[18px] shadow-sm transition hover:border-brand-200 hover:shadow-md motion-safe:hover:-translate-y-0.5">
              <span className="grid size-9 place-items-center rounded-[9px] bg-brand-50 text-brand-600">
                <it.icon className="size-4.5" />
              </span>
              <b className="mt-3.5 block font-display text-[14px] font-bold text-ink">{it.title}</b>
              <span className="mt-1 block text-[12.5px] leading-relaxed text-ink-subtle">{it.desc}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Offers + referral                                                   */
/* ------------------------------------------------------------------ */

function Pricing() {
  const plans = [
    {
      name: "Bronze",
      price: "39",
      desc: "Pour découvrir la plateforme.",
      features: ["Vidéos d’une matière au choix", "Quiz auto-corrigés", "Forum élèves"],
      featured: false,
    },
    {
      name: "Silver",
      price: "59",
      desc: "Le choix de la plupart des élèves.",
      features: [
        "Toutes les matières en vidéo",
        "Séances live + replays de l’année",
        "IA : quiz, profil & assistant",
        "Ressources PDF rattachées",
      ],
      featured: true,
    },
    {
      name: "Gold",
      price: "89",
      desc: "L’expérience complète, sans limite.",
      features: [
        "Tout Silver, plus :",
        "Replays des années précédentes",
        "Correcteur photo illimité",
        "Calendrier intelligent de révision",
      ],
      featured: false,
    },
  ]
  return (
    <section id="offres" className="mx-auto w-full max-w-[1220px] scroll-mt-20 px-4 pt-24 sm:px-6">
      <Reveal className="mx-auto max-w-[560px] text-center">
        <Kicker>Offres</Kicker>
        <h2 className="mt-2 font-display text-[26px] font-bold text-ink sm:text-[32px]">
          Une offre pour chaque ambition
        </h2>
        <p className="mt-3 text-[14.5px] text-ink-subtle">
          Paiement sécurisé en ligne via <b className="text-ink">ClicToPay</b>, en dinar tunisien.
          Factures et historique d’achats inclus.
        </p>
      </Reveal>

      <div className="mt-10 grid items-stretch gap-4 md:grid-cols-3">
        {plans.map((p, i) => (
          <Reveal key={p.name} delay={i * 100} className="h-full">
            <div
              className={`relative flex h-full flex-col rounded-lg border bg-surface p-6 transition motion-safe:hover:-translate-y-0.5 ${
                p.featured
                  ? "border-brand-300 shadow-lg ring-4 ring-brand-500/10"
                  : "border-border shadow-sm hover:shadow-md"
              }`}
            >
              {p.featured && (
                <span className="absolute -top-3 start-6 rounded-full bg-grad px-3 py-1 font-display text-[10px] font-bold uppercase tracking-[.1em] text-ink-inverted shadow-brand">
                  Populaire
                </span>
              )}
              <b className="font-display text-[16px] font-bold text-ink">{p.name}</b>
              <p className="mt-0.5 text-[12px] text-ink-muted">{p.desc}</p>
              <p className="mt-4">
                <span className="font-display text-[34px] font-bold text-ink">{p.price}</span>
                <span className="ms-1 text-[13px] text-ink-muted">DT / mois</span>
              </p>
              <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-ink-subtle">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-success-600" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/roles"
                className={`mt-6 inline-flex h-11 items-center justify-center rounded-md font-medium transition ${
                  p.featured
                    ? "bg-grad text-ink-inverted shadow-brand hover:brightness-105"
                    : "border border-border-strong bg-surface text-ink-subtle hover:border-brand-200 hover:text-brand-600"
                }`}
              >
                Choisir {p.name}
              </Link>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120}>
        <div className="mt-6 flex flex-col items-start gap-4 rounded-lg border border-accent2-100 bg-surface-cream p-6 sm:flex-row sm:items-center">
          <span className="grid size-11 shrink-0 place-items-center rounded-md bg-accent2-100 text-accent2-600">
            <Gift className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <b className="font-display text-[15px] font-bold text-ink">Parraine tes amis, gagne des points</b>
            <p className="mt-0.5 text-[13px] text-accent2-700">
              Ton code de parrainage offre une remise à tes amis — et te rapporte des points à convertir
              en avantages.
            </p>
          </div>
          <span className="flex items-center gap-2 rounded-md border border-dashed border-accent2-500/50 bg-surface px-3.5 py-2 font-display text-[13px] font-bold tracking-wide text-accent2-600">
            YASMINE-2026
          </span>
        </div>
      </Reveal>

      <Reveal delay={180}>
        <p className="mt-4 flex items-center justify-center gap-2 text-center text-[12px] text-ink-muted">
          <CreditCard className="size-3.5" /> Codes promo acceptés au moment de l’achat · gestion des
          remboursements par l’académie
        </p>
      </Reveal>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Final CTA + footer                                                  */
/* ------------------------------------------------------------------ */

function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-[1220px] px-4 pt-24 sm:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-10 text-center shadow-xl sm:p-14">
          {/* faint dotted texture, masked to the corner */}
          <span className="pointer-events-none absolute inset-y-0 end-0 w-[220px] opacity-60 [background:radial-gradient(var(--brand-100)_1.2px,transparent_1.2px)] [background-size:12px_12px] [mask-image:linear-gradient(270deg,#000,transparent_80%)]" />
          <span className="pointer-events-none absolute inset-y-0 start-0 w-[220px] opacity-60 [background:radial-gradient(var(--accent-100)_1.2px,transparent_1.2px)] [background-size:12px_12px] [mask-image:linear-gradient(90deg,#000,transparent_80%)]" />
          <Kicker>Prêt à commencer ?</Kicker>
          <h2 className="mx-auto mt-2 max-w-[540px] font-display text-[26px] font-bold text-ink sm:text-[32px]">
            Rejoins Wael Academy et prépare ton année sereinement
          </h2>
          <p className="mx-auto mt-3 max-w-[460px] text-[14.5px] text-ink-subtle">
            Explore la démo : l’espace élève, les séances live, les quiz et l’assistant IA t’attendent.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/student"
              className="inline-flex h-12 items-center gap-2 rounded-md bg-grad px-6 font-medium text-ink-inverted shadow-brand transition hover:-translate-y-0.5 hover:brightness-105"
            >
              Essayer l’espace élève <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/roles"
              className="inline-flex h-12 items-center rounded-md border border-border-strong bg-surface px-5 font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"
            >
              Choisir un autre espace
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface/60">
      <div className="mx-auto flex w-full max-w-[1220px] flex-col items-center gap-4 px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] text-center sm:flex-row sm:justify-between sm:text-start">
        <div className="flex items-center gap-2.5">
          <BrandMark size="size-8" />
          <span className="text-[13px] font-medium text-ink">
            Wael Academy <span className="text-ink-muted">· أكاديمية وائل</span>
          </span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12.5px] text-ink-muted">
          <a href="#fonctionnalites" className="transition hover:text-brand-600">Fonctionnalités</a>
          <a href="#ia" className="transition hover:text-brand-600">IA</a>
          <a href="#offres" className="transition hover:text-brand-600">Offres</a>
          <Link to="/roles" className="transition hover:text-brand-600">Espaces</Link>
          <Link to="/design-system" className="transition hover:text-brand-600">Design system</Link>
        </nav>
        <p className="text-[12px] text-ink-muted">© 2026 Wael Academy · Tunis</p>
      </div>
    </footer>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

/** Public landing ("/") — the student-facing pitch for the platform. */
export default function LandingPage() {
  return (
    <div className="lp-root min-h-dvh bg-canvas">
      <Navbar />
      <main>
        <Hero />
        <StatsStrip />
        <FeatureShowcases />
        <AiSection />
        <MoreGrid />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
