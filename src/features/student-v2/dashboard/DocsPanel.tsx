import { ArrowLeft, Check, CheckCircle2, Files, FolderOpen } from "lucide-react"
import { dateKey } from "@/features/student/calendar/schedule"
import { cn } from "@/lib/utils"
import { useAllTaken, useDownloads } from "../downloads"
import { BASE, relativeDay, useLookups, type SessionDoc } from "../lib"
import { Burst, Num, Panel, PanelEmpty, SeeAll, ctaClass, ctaGhostClass, tileClass } from "../ui"

/**
 * « تمارين والكور متع الحصص الجاية » — a packing list: the files to have on
 * you for the séances coming up.
 *
 * States:
 *   list      two cards side by side as in the frame; more scroll sideways
 *             inside the panel, so a busy week never pushes the page down.
 *   progress  once something is taken the header counts « هزّيت 2 من 5 », and
 *             a taken card keeps its tick (see `downloads.tsx`).
 *   done      everything taken — the header says so and a calm line hands the
 *             élève their readiness; the cards stay, ticked, in case one is
 *             needed again.
 *   today     a file for a séance TODAY wears a red « اليوم » tag: it's the
 *             only one that can still be late.
 *   empty     nothing to take.
 *
 * Under the play skin each file is a COLLECTIBLE: a tile with a lip until it
 * is taken, then a lime tick that pops in; the count rolls; the bar grows
 * to 12 px; and the last file earns the panel's one celebration — a burst
 * with the existing `achievement` cue (`useAllTaken`).
 *
 * `allTaken` forces the done state for the demo without touching downloads.
 *
 * `layout`: « rail » is the dashboard's — two across, the rest sideways. The
 * calendar page puts the panel in a narrow side column, where the frame STACKS
 * the cards one under the other instead.
 */
export function DocsPanel({
  docs,
  now,
  allTaken = false,
  layout = "rail",
}: {
  docs: SessionDoc[]
  now: Date
  allTaken?: boolean
  layout?: "rail" | "stack"
}) {
  const { has } = useDownloads()
  const taken = allTaken ? docs.length : docs.filter((d) => has(d.id)).length
  const done = docs.length > 0 && taken === docs.length

  // The whole packing list taken by the élève's own hand (not on load, not
  // the demo's forced « done ») — the week's small victory gets its fanfare.
  const burstAt = useAllTaken(done, !allTaken)

  const meta =
    docs.length === 0
      ? undefined
      : done
        ? "كل الملفّات عندك"
        : taken > 0
          ? (
              <>
                هزّيت <Num value={taken} /> من {docs.length}
              </>
            )
          : `${docs.length} ${docs.length >= 2 && docs.length <= 10 ? "ملفّات" : "ملف"} للسبعة أيام الجايين`

  return (
    <Panel
      icon={Files}
      chip="bg-v2-chip-docs"
      title="تمارين والكور متع الحصص الجاية"
      meta={meta}
      action={docs.length > 2 ? <SeeAll to={`${BASE}/devoirs`} /> : undefined}
      className="h-full"
    >
      {docs.length === 0 ? (
        <PanelEmpty
          icon={FolderOpen}
          title="ما فمّا حتّى تمرين للحصص الجاية"
          body="كي يبعثلك أستاذ تمرين ولّا كور لحصّة جاية، تلقاه هوني جاهز للتحميل."
        />
      ) : (
        <>
          {done && (
            <p className="relative mb-3 flex items-center gap-2 rounded-2xl bg-v2-brand/[0.08] px-3 py-2 text-[calc(8.5px*var(--ts))] text-v2-ink">
              <CheckCircle2 className="size-5 shrink-0 text-v2-brand" strokeWidth={1.75} />
              الكل عندك. جاهز للحصّة
              {/* The burst flies from the line that announces the win. */}
              <Burst at={burstAt} />
            </p>
          )}
          {/* Progress along the top edge once anything is taken. */}
          {taken > 0 && !done && (
            <div className="v2-bar mb-3 h-1.5 overflow-hidden rounded-full bg-v2-ink/[0.07]" aria-hidden>
              <div className="v2-bar-fill h-full rounded-full bg-v2-grad transition-[width] duration-500" style={{ width: `${(taken / docs.length) * 100}%` }} />
            </div>
          )}
          <ul
            className={cn(
              layout === "rail"
                ? "v2-rail -mx-1 flex flex-1 snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]"
                : "flex flex-col gap-4",
            )}
          >
            {docs.map((doc) => (
              <DocCard key={doc.id} doc={doc} now={now} forced={allTaken} stacked={layout === "stack"} compact={layout === "stack" && docs.length > 2} />
            ))}
          </ul>
        </>
      )}
    </Panel>
  )
}

/** The collected mark: a small tick on the plate's corner, a lime plate that pops under play. */
function Tick({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "v2-tick absolute -bottom-0.5 -end-0.5 grid size-5 place-items-center rounded-full bg-v2-brand text-white ring-2 ring-v2-surface",
        className,
      )}
    >
      <Check className="size-3" strokeWidth={3} />
    </span>
  )
}

function DocCard({
  doc,
  now,
  forced,
  stacked,
  compact,
}: {
  doc: SessionDoc
  now: Date
  forced: boolean
  stacked: boolean
  /** A narrow column holding more than two: one row each instead of a tall card. */
  compact: boolean
}) {
  const { has, download } = useDownloads()
  const { subjectOf } = useLookups()
  const taken = forced || has(doc.id)
  const today = doc.session.date === dateKey(now)

  if (compact) {
    return (
      <li className={cn(tileClass, "rounded-2xl border border-v2-ink/20 p-2")} data-taken={taken}>
        <div
          className={cn(
            "v2-doc-inner flex items-center gap-3 rounded-xl border border-dashed px-3 py-2.5 transition",
            taken ? "border-v2-ink/25 bg-v2-ink/[0.03]" : "border-v2-brand bg-v2-brand/15",
          )}
        >
          <span className="v2-doc-plate relative grid size-11 shrink-0 place-items-center rounded-full bg-v2-surface/75" data-kind={doc.kind}>
            <FolderOpen className="size-6 stroke-v2-grad" strokeWidth={1.6} />
            {taken && <Tick className="size-4 [&>svg]:size-2.5" />}
          </span>
          <div className="min-w-0 flex-1">
            <p dir="auto" className="line-clamp-2 text-right text-[calc(8.5px*var(--ts))] font-medium leading-snug text-v2-ink">
              {doc.pdf.name}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[calc(7px*var(--ts))] text-v2-ink-2">
              {today && !taken && (
                <span className="rounded-full bg-v2-live px-2 font-bold leading-4 text-white">اليوم</span>
              )}
              {subjectOf(doc.session)?.name} · {relativeDay(doc.session.date, now)} {doc.session.startTime}
            </p>
          </div>
          <button
            type="button"
            onClick={() => download(doc.id, doc.pdf.name)}
            aria-label={taken ? `تحمّل ${doc.pdf.name}` : `حمّل ${doc.pdf.name}`}
            className={cn(ctaClass, "min-h-11 shrink-0 px-3", taken && ctaGhostClass)}
          >
            {taken ? <Check className="size-4" /> : <ArrowLeft className="size-4" />}
            <span className="hidden sm:inline">{taken ? "تحمّل" : "حمّل"}</span>
          </button>
        </div>
      </li>
    )
  }

  return (
    <li
      className={cn(
        tileClass,
        "relative rounded-2xl border border-v2-ink/20 p-3 md:p-4",
        !stacked && "w-[84%] shrink-0 snap-start sm:w-[calc(50%-0.5rem)]",
      )}
      data-taken={taken}
    >
      {today && !taken && (
        <span className="absolute end-5 top-5 z-10 rounded-full bg-v2-live px-2.5 text-[calc(7px*var(--ts))] font-bold leading-5 text-white md:end-6 md:top-6">
          اليوم
        </span>
      )}
      <div
        className={cn(
          "v2-doc-inner flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-3 py-5 text-center transition",
          taken ? "border-v2-ink/25 bg-v2-ink/[0.03]" : "border-v2-brand bg-v2-brand/15",
        )}
      >
        <span className="v2-doc-plate relative grid size-14 place-items-center rounded-full bg-v2-surface/75" data-kind={doc.kind}>
          <FolderOpen className="size-7 stroke-v2-grad" strokeWidth={1.6} />
          {taken && <Tick />}
        </span>
        <p dir="auto" className="line-clamp-2 text-[calc(9.5px*var(--ts))] font-medium leading-snug text-v2-ink">
          {doc.pdf.name}
        </p>
        <p className="text-[calc(7.5px*var(--ts))] text-v2-ink-2">
          {subjectOf(doc.session)?.name} · {relativeDay(doc.session.date, now)} {doc.session.startTime}
        </p>
        <button
          type="button"
          onClick={() => download(doc.id, doc.pdf.name)}
          className={cn(ctaClass, "mt-1 min-h-11 px-4", taken && ctaGhostClass)}
        >
          {taken ? (
            <>
              تحمّل <Check className="size-4" />
            </>
          ) : (
            <>
              اضغط للتحميل <ArrowLeft className="size-4" />
            </>
          )}
        </button>
      </div>
    </li>
  )
}
