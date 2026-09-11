import { Link } from "react-router-dom"
import { MonitorPlay, Play } from "lucide-react"
import type { Session } from "@/data/types"
import { addedLabel } from "@/features/student/dashboard/dashboard"
import { dateKey } from "@/features/student/calendar/schedule"
import { cn } from "@/lib/utils"
import { BASE, frenchName, hourOf, useLookups, v2VideoPath } from "../lib"
import { PortraitStage } from "../PortraitStage"
import { CtaLink, LatinLine, PanelEmpty, SeeAll } from "../ui"

/**
 * « آخر الحصص المضافة » — replays put online these last days, as the frame
 * draws them: a portrait of Wael dressed for the matière (the delivered SVG
 * badges, eyes following the cursor) among the designer's own doodles (see
 * `PortraitStage`), and an inset label — séance kicker, matière in French,
 * when it landed, a play mark.
 *
 * Four across on a desktop, two by two on a tablet, a swipeable rail on a
 * phone — the rail keeps the portraits big instead of shrinking four onto
 * 390px.
 */
export function RecentSection({ sessions, now }: { sessions: Session[]; now: Date }) {
  return (
    <section aria-labelledby="v2-recent">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="v2-recent" className="text-[calc(15px*var(--ts))] font-bold text-v2-ink md:text-[calc(18px*var(--ts))]">
          آخر الحصص المضافة
        </h2>
        {sessions.length > 0 && <SeeAll to={`${BASE}/seances`} />}
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-3xl border border-v2-ink/15 bg-v2-surface p-4 md:p-6">
          <PanelEmpty
            icon={MonitorPlay}
            title="ما تزادت حتّى حصّة جديدة"
            body="كي يتنشر تسجيل حصّة جديدة، يظهرلك هوني قبل كلّ شيء."
            action={<CtaLink data-uisfx="forward" to={`${BASE}/seances`}>شوف التسجيلات الكل</CtaLink>}
          />
        </div>
      ) : (
        <ul
          className={cn(
            // Phone: a snap rail that bleeds to the screen edge.
            "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6",
            // Tablet up: a grid, four at xl.
            "md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-4 2xl:gap-8",
          )}
        >
          {sessions.map((s, i) => (
            <li
              key={s.id}
              className={cn(
                "rise w-[78%] shrink-0 snap-start sm:w-[46%] md:w-auto",
                // The grid shows the four newest; the rail on a phone keeps more.
                i >= 4 && "md:hidden",
              )}
              style={{ ["--i" as string]: i + 1 }}
            >
              <SeanceCard session={s} now={now} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function SeanceCard({ session, now }: { session: Session; now: Date }) {
  const { subjectOf } = useLookups()
  const subject = subjectOf(session)
  const fresh = !!session.publishedAt && session.publishedAt.slice(0, 10) === dateKey(now)

  return (
    <Link data-uisfx="play"
      to={v2VideoPath(session.id, { subjectId: session.subjectIds[0] })}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-v2-ink/15 bg-v2-surface transition duration-300 hover:-translate-y-1 hover:border-v2-brand/40 hover:shadow-xl hover:shadow-v2-ink/[0.07] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v2-brand"
    >
      {fresh && (
        <span className="absolute end-0 top-0 z-10 rounded-es-2xl bg-v2-grad px-4 py-1.5 text-[calc(8px*var(--ts))] font-bold tracking-wide text-white">
          NEW
        </span>
      )}

      {/* The stage runs the card's full width, as in the frame: the doodles
          reach its edges and the label box is inset under it. */}
      <PortraitStage name={subject?.name ?? ""} />

      <div className="relative mx-[7%] mb-[7%] rounded-2xl border border-v2-ink/20 bg-v2-surface px-4 py-3 text-start">
        <LatinLine className="text-[calc(7.5px*var(--ts))] font-medium uppercase tracking-wide text-v2-ink/55">
          {session.title}
        </LatinLine>
        {/* Wraps rather than clips: « Sciences de la vie et de la terre » is
            the longest name and it should read whole on a laptop too. */}
        <p className="mt-0.5 line-clamp-2 text-[calc(11px*var(--ts))] font-bold leading-snug text-v2-ink md:text-[calc(12.5px*var(--ts))]">
          {frenchName(subject?.name)}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-[calc(8.5px*var(--ts))] text-v2-ink/75">
            {session.publishedAt ? `${addedLabel(session.publishedAt, now)} . ${hourOf(session.publishedAt)}` : ""}
          </p>
          <span className="grid size-7 shrink-0 place-items-center rounded-full border-[1.5px] border-v2-brand text-v2-brand transition group-hover:border-transparent group-hover:bg-v2-grad group-hover:text-white">
            <Play className="size-3 translate-x-[-1px] fill-current" />
          </span>
        </div>
      </div>
    </Link>
  )
}
