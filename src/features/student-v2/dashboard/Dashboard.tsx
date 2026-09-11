import { useState } from "react"
import type { Session } from "@/data/types"
import { useMySessions } from "@/features/student/dashboard/dashboard"
import { useNow } from "@/features/student/calendar/schedule"
import { useIsMobile } from "@/lib/hooks"
import { useDemoStates } from "../demoStates"
import { DocsSheet } from "../DocsSheet"
import { useDocsPool, useLiveState, useV2Recent } from "../lib"
import { CalendarPanel } from "./CalendarPanel"
import { DocsPanel } from "./DocsPanel"
import { LivePanel } from "./LivePanel"
import { RecentSection } from "./RecentSection"

const NONE: Session[] = []

/**
 * الرئيسية — the frame « Main Pgae - Calendar months », built.
 *
 * Top: what's NEW (the replays board, four portraits). Below, two equal
 * columns: the calendar holds the start edge and the full height; the live
 * panel and the documents stack beside it. That's the frame at xl.
 *
 * On a phone the order is the order of urgency instead: live first when a
 * séance is on air (it's the only thing on the page with a deadline), then the
 * board, the live panel when it's only a countdown, the calendar, the files.
 */
export default function V2Dashboard() {
  const now = useNow()
  const demo = useDemoStates()
  const mobile = useIsMobile()

  const mine = useMySessions()
  const sessions = demo.calendar === "empty" ? NONE : mine
  const recentPool = useV2Recent(now)
  const recent = demo.recent === "empty" ? NONE : recentPool.slice(0, 8)
  const docs = useDocsPool(now, demo.docs)
  const { pick, stateFor } = useLiveState(now)

  const [docsFor, setDocsFor] = useState<{ session: Session; started: boolean } | null>(null)
  const openDocs = (session: Session, started: boolean) => setDocsFor({ session, started })

  const hoist = mobile && pick.kind === "live"
  const live = <LivePanel pick={pick} now={now} onOpenDocs={openDocs} />

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      {hoist && (
        <div className="rise" style={{ ["--i" as string]: 0 }}>
          {live}
        </div>
      )}

      <RecentSection sessions={recent} now={now} />

      <div className="grid gap-6 xl:grid-cols-2 xl:grid-rows-[auto_1fr] 2xl:gap-8">
        {!hoist && (
          <div className="rise min-w-0 xl:col-start-2 xl:row-start-1" style={{ ["--i" as string]: 5 }}>
            {live}
          </div>
        )}
        <div className="rise min-w-0 xl:col-start-1 xl:row-span-2 xl:row-start-1" style={{ ["--i" as string]: 6 }}>
          <CalendarPanel
            sessions={sessions}
            now={now}
            stateFor={stateFor}
            onOpenDocs={openDocs}
          />
        </div>
        <div className="rise min-w-0 xl:col-start-2 xl:row-start-2" style={{ ["--i" as string]: 7 }}>
          <DocsPanel docs={docs} now={now} allTaken={demo.docs === "done"} />
        </div>
      </div>

      <DocsSheet
        session={docsFor?.session ?? null}
        started={docsFor?.started ?? false}
        onOpenChange={(open) => !open && setDocsFor(null)}
      />
    </div>
  )
}
