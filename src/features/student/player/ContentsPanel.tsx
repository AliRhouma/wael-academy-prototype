import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Check, ChevronDown, FileText, Layers3, Play } from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { LESSON_KINDS, LESSON_KIND_ORDER } from "@/features/admin/curriculum/content"
import { videoSrc, youtubeId } from "@/data/media"
import { cn } from "@/lib/utils"
import type { LessonKind } from "@/data/types"
import type { ChapterLink, GroupTab, PlayerVideo } from "./types"

/**
 * The "contenus" column — everything that sits beside the video.
 *
 * Three levels, top to bottom: WHICH chapitre (a picker, so an élève can move
 * through the programme without going back to the matière), WHICH kind of
 * contenu (the four drawers of the chapitre as tabs — cours, exercice, résumé,
 * série), then the items themselves. A résumé or une série has no video: it
 * stays in the list and opens the document viewer instead of navigating, so the
 * column shows the WHOLE chapitre and not only the half that plays.
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
}: {
  contents: PlayerVideo[]
  activeId: string
  label: string
  /** lesson only — the chapitre switcher on top. */
  chapters?: { activeId: string; list: ChapterLink[] }
  /** seance only — the groupe tabs on top. */
  groups?: { activeId: string; list: GroupTab[] }
  onOpenPdf: (item: PlayerVideo) => void
}) {
  const listRef = useRef<HTMLUListElement | null>(null)
  const active = contents.find((c) => c.id === activeId)

  /** Which drawers actually exist here — a séance list has none at all. */
  const kinds = useMemo(() => {
    const present = new Set(contents.map((c) => c.lessonKind).filter(Boolean) as LessonKind[])
    return LESSON_KIND_ORDER.filter((k) => present.has(k))
  }, [contents])

  const [kind, setKind] = useState<LessonKind | null>(active?.lessonKind ?? null)

  // Following a link inside the column changes the active item — land on ITS
  // drawer, otherwise the élève sees a list that doesn't contain what's playing.
  useEffect(() => {
    if (active?.lessonKind) setKind(active.lessonKind)
  }, [active?.lessonKind])

  const shown = kind ? contents.filter((c) => c.lessonKind === kind) : contents

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
  }, [activeId, kind])

  return (
    <section className="rounded-xl border border-border bg-surface p-3 shadow-sm">
      {/* ---- Chapitre ---- */}
      {chapters && chapters.list.length > 0 && <ChapterPicker chapters={chapters} />}

      {/* ---- Groupe (séances) ---- */}
      {groups && groups.list.length > 1 && (
        <div
          role="tablist"
          aria-label="فوج"
          className="flex gap-1 overflow-x-auto scroll-touch rounded-lg border border-border bg-surface-muted p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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

      {/* ---- Drawers ---- */}
      {kinds.length > 0 ? (
        <div
          role="tablist"
          aria-label="نوع المحتوى"
          className="mt-2.5 flex gap-1 overflow-x-auto scroll-touch rounded-lg border border-border bg-surface-muted p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {kinds.map((k) => {
            const meta = LESSON_KINDS[k]
            const count = contents.filter((c) => c.lessonKind === k).length
            const on = kind === k
            return (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setKind(k)}
                className={cn(
                  "inline-flex h-9 flex-1 shrink-0 items-center justify-center gap-1.5 rounded-md px-2 text-[calc(12px*var(--ts))] font-medium transition",
                  on ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink-subtle",
                )}
              >
                <span className="truncate">{meta.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[calc(11px*var(--ts))] tabular-nums",
                    on ? "bg-brand-50 text-brand-700" : "bg-neutral-100 text-ink-muted",
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="flex items-baseline justify-between gap-2 px-1 pb-2 pt-2.5">
          <p className="text-[calc(11px*var(--ts))] font-medium uppercase tracking-[.12em] text-accent2-600">
            {label}
          </p>
          <span className="text-[calc(11px*var(--ts))] tabular-nums text-ink-muted">{contents.length}</span>
        </div>
      )}

      {/* ---- Items ---- */}
      {shown.length === 0 ? (
        <p className="px-1 py-6 text-center text-[calc(13px*var(--ts))] text-ink-muted">
          ما فماش شيء من النوع هذا في الفصل هذا.
        </p>
      ) : (
        <ul
          ref={listRef}
          className="mt-2 flex max-h-[58vh] flex-col gap-1.5 overflow-y-auto scroll-touch pe-0.5 lg:max-h-[52vh]"
        >
          {shown.map((item, i) => (
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
    <div className="flex items-center gap-1">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="inline-flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border border-border-strong bg-surface px-2.5 text-start transition hover:border-brand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Layers3 className="size-4 shrink-0 text-brand-600" />
            <span className="min-w-0 flex-1">
              <span className="block text-[calc(10px*var(--ts))] font-medium uppercase tracking-[.1em] text-ink-muted">
                الفصل {index >= 0 ? index + 1 : ""}
              </span>
              <span dir="auto" className="block truncate text-[calc(13px*var(--ts))] font-semibold text-ink">
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
        aria-label="الفصل اللي قبل"
        className="grid size-10 shrink-0 place-items-center rounded-md border border-border-strong bg-surface text-ink-subtle transition hover:border-brand-200 hover:text-brand-600 disabled:opacity-40 disabled:hover:border-border-strong disabled:hover:text-ink-subtle"
      >
        <ChevronDown className="size-4 -rotate-90" />
      </button>
      <button
        type="button"
        onClick={goNext}
        disabled={!goNext}
        aria-label="الفصل اللي بعد"
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
  const thumbId = item.playable ? youtubeId(videoSrc(item.videoUrl)) : undefined

  const inner = (
    <>
      <span className="relative block aspect-video w-28 shrink-0 overflow-hidden rounded-md bg-neutral-200">
        {thumbId ? (
          <img
            src={`https://i.ytimg.com/vi/${thumbId}/mqdefault.jpg`}
            alt=""
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <span className="grid size-full place-items-center bg-danger-50 text-danger-600">
            <FileText className="size-5" />
          </span>
        )}
        {item.playable && (
          <>
            <span
              className={cn(
                "absolute inset-0 grid place-items-center transition",
                active ? "bg-neutral-900/45" : "bg-neutral-900/0 group-hover/row:bg-neutral-900/25",
              )}
            >
              {active ? (
                <span className="rounded-full bg-white/95 px-2 py-0.5 text-[calc(10px*var(--ts))] font-semibold uppercase tracking-wide text-brand-700">
                  En lecture
                </span>
              ) : (
                <span className="grid size-8 place-items-center rounded-full bg-neutral-900/55 text-white opacity-0 transition group-hover/row:opacity-100">
                  <Play className="size-3.5 translate-x-px fill-current" />
                </span>
              )}
            </span>
            <span className="absolute bottom-1 end-1 rounded-sm bg-neutral-900/75 px-1.5 py-px text-[calc(10px*var(--ts))] font-medium tabular-nums text-white">
              {index + 1}
            </span>
          </>
        )}
      </span>

      <span className="flex min-w-0 flex-col gap-0.5 py-0.5 pe-1">
        {item.kindLabel && (
          <span className="text-[calc(10px*var(--ts))] font-medium uppercase tracking-[.1em] text-ink-muted">
            {item.kindLabel}
          </span>
        )}
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
    "group/row flex w-full items-start gap-2.5 overflow-hidden rounded-lg border p-1.5 text-start transition",
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
