import { Link } from "react-router-dom"
import { ArrowLeft, Sparkles } from "lucide-react"
import { BASE } from "./lib"
import { CtaLink, Panel } from "./ui"

/**
 * A screen the new space hasn't been designed for yet. Never a dead end: it
 * says so plainly and hands over to the same screen in the old space, so the
 * demo stays clickable end to end while the frames arrive one by one.
 */
export function V2Placeholder({ title, legacy, note }: { title: string; legacy?: string; note?: string }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[calc(15px*var(--ts))] font-bold text-v2-ink md:text-[calc(18px*var(--ts))]">{title}</h1>
      <Panel title="هذي الصفحة مازالت في التصميم" className="items-center text-center">
        <div className="flex flex-col items-center gap-3 py-8">
          <span className="grid size-16 place-items-center rounded-full bg-v2-brand/[0.08]">
            <Sparkles className="size-8 stroke-v2-grad" strokeWidth={1.5} />
          </span>
          <p className="max-w-md text-[calc(9.5px*var(--ts))] leading-relaxed text-v2-ink/65">
            {note ?? "الفضاء الجديد يتبنى صفحة بصفحة، على حسب ما توصل التصاميم من Figma."}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            {legacy && (
              <CtaLink data-uisfx="forward" to={legacy}>
                شوفها في الفضاء القديم
                <ArrowLeft className="size-4" />
              </CtaLink>
            )}
            <Link data-uisfx="back"
              to={BASE}
              className="inline-flex min-h-11 items-center rounded-full border border-v2-ink/20 px-5 text-[calc(9.5px*var(--ts))] font-semibold text-v2-ink transition hover:border-v2-brand/50"
            >
              رجوع للرئيسية
            </Link>
          </div>
        </div>
      </Panel>
    </div>
  )
}
