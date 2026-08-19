import { useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Check, ChevronDown, FileText, Layers3, Play } from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { cn } from "@/lib/utils"
import type { ChapterLink, GroupTab, PlayerVideo } from "./types"

/**
 * The "contenus" column — everything that sits beside the video.
 *
 * Two levels, top to bottom: WHICH درس (a picker, so an élève can move through
 * the programme without going back to the matière), then the items themselves.
 * A résumé or une série has no video: it stays in the list and opens the
 * document viewer instead of navigating, so the column shows the WHOLE درس and
 * not only the half that plays.
 *
 * There used to be a third level between them — a row of drawers reading
 * « Cours | Exercice | Série | Résumé » — and it is gone. It filtered a list
 * that is a dozen rows long on its worst day, in French, on the one Arabic
 * screen an élève spends real time on; and every row under it repeated its own
 * kind a second time as a kicker. The list is shown WHOLE now, in programme
 * order, which is the order the élève works through it anyway. The square on
 * each row still says what cannot be read from the title — a number for what
 * plays, a document glyph for what only opens.
 *
 * Referenced for spacing & density: ChapitresTab (drawer chips + row idiom),
 * SubjectPicker (the dropdown), the former playlist rail (cards).
 */
export function ContentsPanel({
  contents,
  activeId,
  label,
  chapters,
  groups,
  onOpenPdf,
  height,
}: {
  contents: PlayerVideo[]
  activeId: string
  label: string
  /** lesson only — the chapitre switcher on top. */
  chapters?: { activeId: string; list: ChapterLink[] }
  /** seance only — the groupe tabs on top. */
  groups?: { activeId: string; list: GroupTab[] }
  onOpenPdf: (item: PlayerVideo) => void
  /**
   * Cut the whole panel to this height, in px — the player's, measured by the
   * page. The header rows keep their size and the list takes what is left, so
   * the column bottoms out flush with the video however many contenus it holds.
   * Omitted (mobile), the panel sizes to its content as before.
   */
  height?: number
}) {
  const listRef = useRef<HTMLUListElement | null>(null)

  // Keep the playing row in view — by scrolling THIS list and nothing else.
  // `scrollIntoView` walks up every scroll ancestor, and on mobile this column
  // sits far down the page, so it dragged the whole page (header, back arrow
  // and all) up with it on mount.
  useEffect(() => {
    const list = listRef.current
    const row = list?.querySelector('[data-active="true"]') as HTMLElement | null
    if (!list || !row) return
    const offset = row.getBoundingClientRect().top - list.getBoundingClientRect().top
    if (offset < 0 || offset + row.offsetHeight > list.clientHeight) {
      list.scrollTop += offset - 8
    }
  }, [activeId])

  return (
    <section
      className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface p-3 shadow-sm"
      style={height ? { height } : undefined}
    >
      {/* ---- Chapitre ---- */}
      {chapters && chapters.list.length > 0 && <ChapterPicker chapters={chapters} />}

      {/* ---- Groupe (séances) ---- */}
      {groups && groups.list.length > 1 && (
        <div
          role="tablist"
          aria-label="المجموعة"
          className="flex shrink-0 gap-1 overflow-x-auto scroll-touch rounded-lg border border-border bg-surface-muted p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {groups.list.map((group) => {
            const on = group.id === groups.activeId
            return (
              <Link
                key={group.id}
                to={group.to}
                replace
                role="tab"
                aria-selected={on}
                title={group.title}
                className={cn(
                  "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[calc(12px*var(--ts))] font-medium transition",
                  on ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink-subtle",
                )}
              >
                {/* My own groupe keeps a marker, even in a narrow column. */}
                {group.mine && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      on ? "bg-accent2-500" : "bg-neutral-300",
                    )}
                  />
                )}
                <span dir="auto" className="max-w-[9rem] truncate">
                  {group.label}
                </span>
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[calc(11px*var(--ts))] tabular-nums",
                    on ? "bg-brand-50 text-brand-700" : "bg-neutral-100 text-ink-muted",
                  )}
                >
                  {group.count}
                </span>
              </Link>
            )
          })}
        </div>
      )}

      {/* ---- What this column is, and how much of it there is ---- */}
      <div className="flex shrink-0 items-baseline justify-between gap-2 px-1 pb-2 pt-2.5">
        <p className="text-[calc(11px*var(--ts))] font-medium uppercase tracking-[.12em] text-accent2-600">
          {/* A lesson's `label` IS the درس's name, and the picker one line up
              is already showing it — so this line says what the list is
              instead of saying the same six words again. A séance column has no
              picker and keeps its own label. */}
          {chapters ? "المحتويات" : label}
        </p>
        <span className="text-[calc(11px*var(--ts))] tabular-nums text-ink-muted">
          {contents.length}
        </span>
      </div>

      {/* ---- Items ---- */}
      {contents.length === 0 ? (
        <p
          className={cn(
            "px-1 text-center text-[calc(13px*var(--ts))] text-ink-muted",
            // Centred in whatever is left of the panel rather than tucked under
            // the tabs: the column keeps the player's height when it is empty,
            // and a line of text pinned to the top of all that room reads as a
            // list that failed to load.
            height ? "grid min-h-0 flex-1 place-content-center" : "py-6",
          )}
        >
          ما فماش شيء في الدرس هذا.
        </p>
      ) : (
        <ul
          ref={listRef}
          // `min-h-0` or the flex item refuses to shrink below its content and
          // the panel grows past the height it was given instead of scrolling.
          className={cn(
            "mt-2 flex flex-col gap-1.5 overflow-y-auto scroll-touch pe-0.5",
            height ? "min-h-0 flex-1" : "max-h-[58vh]",
          )}
        >
          {contents.map((item, i) => (
            <li key={item.id} data-active={item.id === activeId}>
              <ContentRow
                item={item}
                index={i}
                active={item.id === activeId}
                onOpenPdf={() => onOpenPdf(item)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/* ------------------------------------------------------------------------- */

/** The chapitre switcher — a dropdown, because a matière has a dozen of them. */
function ChapterPicker({ chapters }: { chapters: { activeId: string; list: ChapterLink[] } }) {
  const navigate = useNavigate()
  const current = chapters.list.find((c) => c.id === chapters.activeId)
  const index = chapters.list.findIndex((c) => c.id === chapters.activeId)

  const step = (delta: number) => {
    // Skip over chapitres that have nothing to play.
    for (let i = index + delta; i >= 0 && i < chapters.list.length; i += delta) {
      const target = chapters.list[i]
      if (target.to) return () => navigate(target.to!)
    }
    return undefined
  }
  const goPrev = step(-1)
  const goNext = step(1)

  return (
    <div className="flex shrink-0 items-center gap-1">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            // `min-h-10` + `py-1.5`, NOT `h-10`: the trigger stacks a kicker
            // over a title, and two lines of text do not fit 40px once `--ts`
            // scales them up — they overflowed the button and were shaved off
            // by the header above. It sizes to its content now and keeps 40px
            // as a floor for the touch target.
            className="inline-flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded-md border border-border-strong bg-surface px-2.5 py-1.5 text-start transition hover:border-brand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Layers3 className="size-4 shrink-0 text-brand-600" />
            <span className="min-w-0 flex-1">
              <span className="block text-[calc(10px*var(--ts))] font-medium uppercase leading-tight tracking-[.1em] text-ink-muted">
                الدرس {index >= 0 ? index + 1 : ""}
              </span>
              <span
                dir="auto"
                className="block truncate text-[calc(13px*var(--ts))] font-semibold leading-tight text-ink"
              >
                {current?.name ?? "اختار"}
              </span>
            </span>
            <ChevronDown className="size-4 shrink-0 text-ink-muted" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="start"
            sideOffset={6}
            className="z-[60] max-h-[60dvh] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto scroll-touch rounded-lg border border-border bg-surface-raised p-1.5 shadow-lg"
          >
            {chapters.list.map((chapter, i) => {
              const isActive = chapter.id === chapters.activeId
              const row = (
                <span className="flex w-full min-w-0 items-center gap-2.5">
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-md font-display text-[calc(12px*var(--ts))] font-bold tabular-nums",
                      isActive ? "bg-grad text-ink-inverted" : "bg-brand-50 text-brand-600",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span dir="auto" className="min-w-0 flex-1 truncate text-sm">
                    {chapter.name}
                  </span>
                  {isActive ? (
                    <Check className="size-4 shrink-0 text-brand-600" />
                  ) : (
                    <span className="shrink-0 text-[calc(11px*var(--ts))] tabular-nums text-ink-muted">
                      {chapter.count > 0 ? `${chapter.count} فيديو` : "—"}
                    </span>
                  )}
                </span>
              )
              return (
                <DropdownMenu.Item
                  key={chapter.id}
                  asChild={Boolean(chapter.to)}
                  disabled={!chapter.to}
                  className={cn(
                    "flex min-h-[44px] items-center rounded-md px-2 outline-none transition",
                    chapter.to
                      ? cn(
                          "cursor-pointer",
                          isActive
                            ? "bg-brand-50 font-semibold text-brand-700"
                            : "text-ink-subtle hover:bg-surface-muted data-[highlighted]:bg-surface-muted",
                        )
                      : "text-ink-muted opacity-60",
                  )}
                >
                  {chapter.to ? <Link to={chapter.to}>{row}</Link> : row}
                </DropdownMenu.Item>
              )
            })}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <button
        type="button"
        onClick={goPrev}
        disabled={!goPrev}
        aria-label="الدرس اللي قبل"
        className="grid size-10 shrink-0 place-items-center rounded-md border border-border-strong bg-surface text-ink-subtle transition hover:border-brand-200 hover:text-brand-600 disabled:opacity-40 disabled:hover:border-border-strong disabled:hover:text-ink-subtle"
      >
        <ChevronDown className="size-4 -rotate-90" />
      </button>
      <button
        type="button"
        onClick={goNext}
        disabled={!goNext}
        aria-label="الدرس اللي بعد"
        className="grid size-10 shrink-0 place-items-center rounded-md border border-border-strong bg-surface text-ink-subtle transition hover:border-brand-200 hover:text-brand-600 disabled:opacity-40 disabled:hover:border-border-strong disabled:hover:text-ink-subtle"
      >
        <ChevronDown className="size-4 rotate-90" />
      </button>
    </div>
  )
}

/** One row of the column — a link when it plays, a button when it's a document. */
function ContentRow({
  item,
  index,
  active,
  onOpenPdf,
}: {
  item: PlayerVideo
  index: number
  active: boolean
  onOpenPdf: () => void
}) {
  const inner = (
    <>
      {/* NO THUMBNAIL. A 112px still of a whiteboard tells an élève nothing a
          list of chapitre titles doesn't, and it cost every row three lines of
          height — which is the whole budget of a column cut to the player's
          size. What the image really carried was the row's NUMBER and whether
          it was the one playing; both move into this square, which is a third
          of the width and states them outright. */}
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-md text-[calc(12px*var(--ts))] font-semibold tabular-nums transition",
          !item.playable
            ? "bg-danger-50 text-danger-600"
            : active
              ? "bg-grad text-ink-inverted shadow-brand"
              : "bg-brand-50 text-brand-600 group-hover/row:bg-brand-100",
        )}
      >
        {!item.playable ? (
          <FileText className="size-4" />
        ) : active ? (
          <Play className="size-3.5 translate-x-px fill-current" />
        ) : (
          <>
            {/* The number is the row's place in the programme; it steps aside
                for a play head on hover, which is the thing you are about to
                do to it. */}
            <span className="group-hover/row:hidden">{index + 1}</span>
            <Play className="hidden size-3.5 translate-x-px fill-current group-hover/row:block" />
          </>
        )}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5 py-0.5 pe-1">
        {/* No kicker at all on a row — neither the kind nor « En lecture ».
            The row that is playing already says so twice over: its square holds
            a play head instead of a number, and the row itself is the only one
            wearing the brand fill. A third statement of it, in French, on top
            of the title, was the row's second line for nothing. */}
        <span
          dir="auto"
          className={cn(
            "line-clamp-2 text-[calc(13px*var(--ts))] font-medium leading-snug",
            active ? "text-brand-700" : "text-ink",
          )}
        >
          {item.title}
        </span>
        {!item.playable && (
          <span className="text-[calc(11px*var(--ts))] text-ink-muted">
            {item.pdfs && item.pdfs.length > 0
              ? `${item.pdfs.length} وثيقة`
              : "وثيقة جايّة"}
          </span>
        )}
      </span>
    </>
  )

  const className = cn(
    "group/row flex w-full items-center gap-2.5 overflow-hidden rounded-lg border p-1.5 text-start transition",
    active
      ? "border-brand-200 bg-brand-50/60"
      : "border-transparent hover:border-border hover:bg-surface-muted",
  )

  if (!item.playable) {
    return (
      <button type="button" onClick={onOpenPdf} className={className}>
        {inner}
      </button>
    )
  }

  return (
    <Link to={item.to} replace aria-current={active ? "true" : undefined} className={className}>
      {inner}
    </Link>
  )
}
