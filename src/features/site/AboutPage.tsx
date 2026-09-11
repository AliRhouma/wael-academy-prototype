import { useState } from "react"
import { BookOpen, Check, FlaskConical, Globe, Lightbulb, Quote } from "lucide-react"
import { SubjectIcon } from "@/components/icons/subjects"
import { cn } from "@/lib/utils"
import heroPoster from "@/assets/site/hero-poster.webp"
import character from "../../../svg icons/Caracter.png"
import { MEDIA_TABS, MISSION, STORY, VALUES } from "./content"
import { PlayOrb, SectionTitle, StatsSection, container, useVideo } from "./parts"

type Rich = readonly (string | { readonly b: string })[]

/** A paragraph from `content.ts` with its bold runs. */
function RichText({ parts }: { parts: Rich }) {
  return (
    <>
      {parts.map((p, i) => (typeof p === "string" ? <span key={i}>{p}</span> : <strong key={i} className="font-bold text-v2-ink">{p.b}</strong>))}
    </>
  )
}

/**
 * شكون نحنا — « About us Page »: our story (from paper to the digital), our
 * mission / vision / values, Wael Academy in the press and the community, the
 * numbers — then the site's footer.
 */
export default function AboutPage() {
  const video = useVideo()
  return (
    <>
      <Story onPlay={video.play} />
      <MissionValues />
      <Community onPlay={video.play} />
      <StatsSection />
      {video.dialog}
    </>
  )
}

function Story({ onPlay }: { onPlay: () => void }) {
  return (
    <section className={cn(container, "pt-28 md:pt-40")}>
      <div className="relative overflow-hidden rounded-3xl bg-v2-mint-grid px-5 pb-8 pt-12 md:px-16 md:pb-16 md:pt-20">
        <Lightbulb aria-hidden className="pointer-events-none absolute start-[6%] top-[8%] hidden size-12 text-v2-ink/15 md:block" strokeWidth={1.1} />
        <Globe aria-hidden className="pointer-events-none absolute end-[5%] top-[30%] hidden size-14 -rotate-12 text-v2-ink/15 md:block" strokeWidth={1.1} />
        <h1 className="text-center font-bold leading-[1.15] text-v2-ink">
          <span className="block text-[calc(22px*var(--ts))] md:text-[calc(32px*var(--ts))]">قصتنا: من الورق إلى</span>
          <span className="relative inline-block">
            <svg aria-hidden viewBox="0 0 40 40" className="absolute -start-8 top-2 size-8 text-v2-ink md:-start-11 md:size-10" fill="none">
              <path d="M28 6l2 10M8 18l10 4M12 32l10-4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
            <span className="text-v2-grad block pb-2 text-[calc(28px*var(--ts))] md:text-[calc(40px*var(--ts))]">العالم الرقمي</span>
          </span>
        </h1>

        <div className="mx-auto mt-8 grid max-w-4xl gap-6 text-[calc(10px*var(--ts))] leading-loose text-v2-ink/85 md:mt-12 md:grid-cols-2 md:gap-12 md:text-[calc(11.5px*var(--ts))]">
          <p>
            <RichText parts={STORY.a} />
          </p>
          <p>
            <RichText parts={STORY.b} />
          </p>
        </div>

        <button
          type="button"
          onClick={onPlay}
          aria-label="شغّل فيديو قصتنا"
          className="group relative mx-auto mt-10 block aspect-video w-full max-w-4xl overflow-hidden rounded-3xl shadow-2xl shadow-v2-ink/15 md:mt-16"
        >
          <img src={heroPoster} alt="" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.03]" />
          <span className="absolute inset-0 bg-v2-ink/30" />
          <PlayOrb size="lg" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </button>
      </div>
    </section>
  )
}

const MV_TABS = [
  { id: "mission", label: "مهمتنا" },
  { id: "vision", label: "رؤيتنا" },
  { id: "values", label: "قيمنا" },
] as const

function MissionValues() {
  const [tab, setTab] = useState<(typeof MV_TABS)[number]["id"]>("values")
  return (
    <section className={cn(container, "py-16 md:py-24")}>
      <SectionTitle title="مهمتنا، رؤيتنا، وقيمنا" />
      <div role="tablist" className="mt-8 flex justify-center gap-8 md:gap-10">
        {MV_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "border-b-2 pb-1 text-[calc(13px*var(--ts))] font-bold transition md:text-[calc(16px*var(--ts))]",
              tab === t.id ? "border-v2-brand text-v2-brand" : "border-transparent text-v2-ink/50 hover:text-v2-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div key={tab} className="mt-10 grid items-center gap-10 animate-in fade-in-0 duration-500 md:mt-14 lg:grid-cols-2 lg:gap-14">
        {tab === "values" ? (
          <ul className="flex flex-col gap-7">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <p className="flex items-center gap-4">
                  <span className="grid size-14 shrink-0 place-items-center rounded-full bg-v2-grad text-white md:size-16">
                    <Icon className="size-7 md:size-8" strokeWidth={1.7} />
                  </span>
                  <span className="text-[calc(15px*var(--ts))] font-bold text-v2-ink md:text-[calc(19px*var(--ts))]">{title}</span>
                </p>
                <p className="mt-3 text-[calc(10px*var(--ts))] leading-relaxed text-v2-ink/80 md:text-[calc(12px*var(--ts))]">{text}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div>
            {(() => {
              const m = MISSION[tab]
              const Icon = m.icon
              return (
                <>
                  <span className="grid size-16 place-items-center rounded-full bg-v2-grad text-white">
                    <Icon className="size-8" strokeWidth={1.7} />
                  </span>
                  <p className="mt-6 text-[calc(15px*var(--ts))] font-bold leading-snug text-v2-ink md:text-[calc(20px*var(--ts))]">{m.lead}</p>
                  <ul className="mt-6 flex flex-col gap-3">
                    {m.points.map((p) => (
                      <li key={p} className="flex items-start gap-3 text-[calc(10px*var(--ts))] text-v2-ink/85 md:text-[calc(12px*var(--ts))]">
                        <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-v2-cta text-v2-on-cta">
                          <Check className="size-4" strokeWidth={3} />
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </>
              )
            })()}
          </div>
        )}
        {/* The frame's grey panel — Wael, among the matières he teaches in. */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-v2-mint-grid lg:order-first">
          <SubjectIcon name="علوم الحياة والأرض" className="absolute start-[6%] top-[7%] aspect-square w-[32%] -rotate-6" />
          <SubjectIcon name="عربية" className="absolute end-[6%] top-[12%] aspect-square w-[30%] rotate-6" />
          <SubjectIcon name="إعلامية" className="absolute end-[10%] top-[44%] aspect-square w-[24%] rotate-3" />
          <img src={character} alt="" className="absolute bottom-0 left-1/2 h-[64%] -translate-x-1/2 drop-shadow-2xl" />
        </div>
      </div>
    </section>
  )
}

function Community({ onPlay }: { onPlay: () => void }) {
  const [tab, setTab] = useState(0)
  const current = MEDIA_TABS[tab]
  return (
    <section className="relative overflow-hidden bg-v2-aqua-grid py-16 md:py-24">
      <Globe aria-hidden className="pointer-events-none absolute start-[4%] top-[18%] hidden size-16 text-white/70 md:block" strokeWidth={1} />
      <FlaskConical aria-hidden className="pointer-events-none absolute end-[3%] top-[34%] hidden size-14 text-white/70 md:block" strokeWidth={1} />
      <BookOpen aria-hidden className="pointer-events-none absolute bottom-[14%] start-[3%] hidden size-16 -rotate-12 text-white/70 md:block" strokeWidth={1} />
      <div className={container}>
        <SectionTitle
          title="وائل أكاديمي في الإعلام والمجتمع التعليمي"
          sub={
            <span className="mx-auto block max-w-3xl">
              لم يكن نجاح منصتنا وكتبنا بمعزل عن إشادة المجتمع التعليمي في تونس. لقد أصبحت "وائل أكاديمي" و"وائل دوكيمون"
              حديث المنتديات التعليمية، ومحط ثقة كبار الأساتذة والمربين الذين ينصحون بها كمرجع أساسي للتحضير للامتحانات الوطنية.
            </span>
          }
        />
        <div role="tablist" className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-3 md:gap-6">
          {MEDIA_TABS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === i}
              onClick={() => setTab(i)}
              className={cn(
                "min-h-14 rounded-2xl px-2 text-[calc(8.5px*var(--ts))] font-medium transition md:min-h-16 md:text-[calc(11px*var(--ts))]",
                tab === i ? "bg-v2-grad font-bold text-white shadow-lg shadow-v2-brand/25" : "bg-white/90 text-v2-ink hover:bg-white",
              )}
            >
              {t.tab}
            </button>
          ))}
        </div>

        <ul key={current.id} className="mt-12 grid items-center gap-5 animate-in fade-in-0 duration-500 md:grid-cols-3">
          {current.items.map((item) =>
            "video" in item && item.video ? (
              <li key={item.name} className="md:-my-6">
                <button
                  type="button"
                  onClick={onPlay}
                  className="group relative flex aspect-[4/5] w-full flex-col items-center justify-end overflow-hidden rounded-3xl bg-v2-grad-deep p-6 text-white shadow-2xl shadow-v2-deep/30"
                >
                  <img src={heroPoster} alt="" className="absolute inset-0 size-full object-cover opacity-45 mix-blend-luminosity transition duration-700 group-hover:scale-105" />
                  <PlayOrb className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2" />
                  <span className="relative text-[calc(12px*var(--ts))] font-bold">{item.name}</span>
                  <span className="relative text-[calc(8.5px*var(--ts))] text-white/85">{item.meta}</span>
                </button>
              </li>
            ) : (
              <li key={item.name}>
                <figure className="flex aspect-[4/5] flex-col justify-between rounded-3xl bg-white p-6 shadow-lg shadow-v2-ink/10 md:aspect-[5/6] md:p-8">
                  <Quote className="size-10 text-v2-cta" />
                  <blockquote className="text-[calc(11px*var(--ts))] leading-relaxed text-v2-ink md:text-[calc(12px*var(--ts))]">{item.quote}</blockquote>
                  <figcaption>
                    <span className="block text-[calc(11px*var(--ts))] font-bold text-v2-ink" dir="auto">{item.name}</span>
                    <span className="block text-[calc(8.5px*var(--ts))] text-v2-ink/60">{item.meta}</span>
                  </figcaption>
                </figure>
              </li>
            ),
          )}
        </ul>
      </div>
    </section>
  )
}
