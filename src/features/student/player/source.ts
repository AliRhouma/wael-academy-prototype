import { useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { LESSON_KINDS } from "@/features/admin/curriculum/content"
import {
  durationLabel,
  semesterOf,
  shortGroupLabel,
  yearSlug,
} from "@/features/student/seances/replays"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"
import type { Lesson, VideoRefKind } from "@/data/types"
import { examVideoPath, lessonVideoPath, seanceVideoPath } from "./links"
import type { ChapterLink, GroupTab, PlayerSource, PlayerVideo } from "./types"

/** "4 oct. 2025" — a replay is often months old, so the year earns its place. */
function dayLabel(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("ar-TN-u-nu-latn", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

/**
 * Resolves the route (`/student/video/:kind/:id`) into the video, the contenus
 * beside it and the way back.
 *
 * The list is DERIVED, never passed through the URL: the contenus of the
 * chapitre for a cours, the corrections filmées of the matière for an examen,
 * the séances of the same groupe + semestre for an enregistrement. That's what
 * the élève was looking at when they pressed play, so it's what should still be
 * beside the player.
 */
export function usePlayerSource(kind: VideoRefKind, id: string): PlayerSource | null {
  const [params] = useSearchParams()
  const user = useAuth((s) => s.currentUser)
  const lessons = useData((s) => s.lessons)
  const chapters = useData((s) => s.chapters)
  const exams = useData((s) => s.exams)
  const sessions = useData((s) => s.sessions)
  const subjects = useData((s) => s.subjects)
  const teachers = useData((s) => s.teachers)
  const groups = useData((s) => s.groups)

  const askedSubject = params.get("matiere") ?? undefined
  const askedGroup = params.get("groupe") ?? undefined

  return useMemo(() => {
    const subjectName = (subjectId?: string) => subjects.find((s) => s.id === subjectId)?.name

    /* ---- A contenu of a chapitre ---- */
    if (kind === "lesson") {
      const lesson = lessons.find((l) => l.id === id)
      if (!lesson) return null
      const chapter = chapters.find((c) => c.id === lesson.chapterId)
      const subjectId =
        askedSubject && chapter?.subjectIds.includes(askedSubject)
          ? askedSubject
          : chapter?.subjectIds[0]

      const toVideo = (l: Lesson): PlayerVideo => {
        const meta = LESSON_KINDS[l.kind]
        return {
          id: l.id,
          title: l.title,
          videoUrl: l.videoUrl,
          kindLabel: meta.label,
          tone: meta.tone,
          lessonKind: l.kind,
          playable: meta.hasVideo,
          context: chapter?.name,
          pdfs: l.pdfs,
          to: lessonVideoPath(l.id, subjectId),
        }
      }

      // Every contenu of the chapitre — the four drawers, tabs and all.
      const contents = lessons
        .filter((l) => l.chapterId === lesson.chapterId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(toVideo)

      const rail = contents.filter((v) => v.playable)
      const active = contents.find((v) => v.id === lesson.id)
      if (!active || !active.playable) return null

      /** The matière's chapitres, each pointing at its first video. */
      const list: ChapterLink[] = chapters
        .filter((c) => subjectId && c.subjectIds.includes(subjectId))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((c) => {
          const videos = lessons
            .filter((l) => l.chapterId === c.id && LESSON_KINDS[l.kind].hasVideo)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          return {
            id: c.id,
            name: c.name,
            count: videos.length,
            to: videos[0] ? lessonVideoPath(videos[0].id, subjectId) : undefined,
          }
        })

      return {
        kind,
        active,
        rail,
        railLabel: chapter?.name ?? "المحتويات",
        contents,
        chapters: { activeId: lesson.chapterId, list },
        back: {
          to: `/student/matieres/${subjectId}?tab=chapitres`,
          label: subjectName(subjectId) ?? "المادّة",
        },
        crumbs: [
          { to: "/student", label: "الصفحة الرئيسية" },
          { to: "/student/matieres", label: "الموادّ" },
          {
            to: `/student/matieres/${subjectId}?tab=chapitres`,
            label: subjectName(subjectId) ?? "المادّة",
          },
          { label: chapter?.name ?? "الدرس" },
        ],
      }
    }

    /* ---- The correction filmée of an examen ---- */
    if (kind === "exam") {
      const exam = exams.find((e) => e.id === id)
      if (!exam) return null
      const subjectId =
        askedSubject && exam.subjectIds.includes(askedSubject) ? askedSubject : exam.subjectIds[0]

      const contents: PlayerVideo[] = exams
        .filter((e) => subjectId && e.subjectIds.includes(subjectId) && e.videoUrl)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((e) => ({
          id: e.id,
          title: e.title,
          videoUrl: e.videoUrl,
          kindLabel: "إصلاح مصوّر",
          tone: "info" as const,
          playable: true,
          context: subjectName(subjectId),
          pdfs: e.pdfs,
          to: examVideoPath(e.id, subjectId),
        }))

      const active = contents.find((v) => v.id === exam.id)
      if (!active) return null

      return {
        kind,
        active,
        rail: contents,
        railLabel: `Corrections — ${subjectName(subjectId) ?? ""}`.trim(),
        contents,
        back: {
          to: `/student/matieres/${subjectId}?tab=examens`,
          label: subjectName(subjectId) ?? "المادّة",
        },
        crumbs: [
          { to: "/student", label: "الصفحة الرئيسية" },
          { to: "/student/matieres", label: "الموادّ" },
          {
            to: `/student/matieres/${subjectId}?tab=examens`,
            label: subjectName(subjectId) ?? "المادّة",
          },
          { label: "امتحانات" },
        ],
      }
    }

    /* ---- The enregistrement of a séance ---- */
    const session = sessions.find((s) => s.id === id)
    if (!session) return null
    const subjectId =
      askedSubject && session.subjectIds.includes(askedSubject)
        ? askedSubject
        : session.subjectIds[0]
    const groupId =
      askedGroup && session.groupIds.includes(askedGroup) ? askedGroup : session.groupIds[0]
    const semester = semesterOf(session)
    const group = groups.find((g) => g.id === groupId)

    const contents: PlayerVideo[] = sessions
      .filter(
        (s) =>
          s.recordingUrl &&
          s.academicYear === session.academicYear &&
          semesterOf(s) === semester &&
          (subjectId ? s.subjectIds.includes(subjectId) : true) &&
          (groupId ? s.groupIds.includes(groupId) : true),
      )
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((s) => {
        const teacher = teachers.find((t) => t.id === s.teacherId)?.name
        return {
          id: s.id,
          title: s.title,
          videoUrl: s.recordingUrl,
          kindLabel: "حصّة مسجّلة",
          tone: "brand" as const,
          playable: true,
          context: dayLabel(s.date),
          meta: [durationLabel(s.startTime, s.endTime), teacher, s.room].filter(Boolean).join(" · "),
          to: seanceVideoPath(s.id, { subjectId, groupId }),
        }
      })

    const active = contents.find((v) => v.id === session.id)
    if (!active) return null

    /**
     * The groupes that ran this matière that année — the tabs above the list.
     * The same chapitre is taught to several groupes at different paces, so an
     * élève who missed a séance often wants ANOTHER groupe's recording of it.
     * Switching keeps the same séance when it was shared with that groupe;
     * otherwise it lands on that groupe's séance of the same semestre.
     *
     * A séance shared with another filière also carries THAT filière's groupe;
     * those stay out, they aren't the élève's to browse.
     */
    const scope = sessions.filter(
      (s) =>
        s.recordingUrl &&
        s.academicYear === session.academicYear &&
        (subjectId ? s.subjectIds.includes(subjectId) : true),
    )
    const scopeGroupIds = new Set(scope.flatMap((s) => s.groupIds))
    const myYearIds = user?.yearIds ?? []
    const groupTabs: GroupTab[] = groups
      .filter((g) => scopeGroupIds.has(g.id) && (!g.yearId || myYearIds.includes(g.yearId)))
      .map((g) => {
        const mine = scope
          .filter((s) => s.groupIds.includes(g.id))
          .sort((a, b) => a.date.localeCompare(b.date))
        const sameSemester = mine.filter((s) => semesterOf(s) === semester)
        const target = mine.find((s) => s.id === session.id) ?? sameSemester[0] ?? mine[0]
        return {
          id: g.id,
          label: shortGroupLabel(g.title),
          title: g.title,
          mine: Boolean(user && g.studentIds.includes(user.id)),
          // What the élève lands on, so the badge never reads 0.
          count: (sameSemester.length || mine.length),
          to: seanceVideoPath(target.id, { subjectId, groupId: g.id }),
        }
      })
      // My own groupe first — it's the one the élève actually attended.
      .sort((a, b) => Number(b.mine) - Number(a.mine))

    const backTo = `/student/seances/${subjectId}?annee=${yearSlug(session.academicYear)}${
      groupId ? `&groupe=${groupId}` : ""
    }`

    return {
      kind,
      active,
      rail: contents,
      railLabel: `الثلاثي ${semester}`,
      contents,
      groups: groupId ? { activeId: groupId, list: groupTabs } : undefined,
      back: { to: backTo, label: group?.title ?? "الحصص" },
      crumbs: [
        { to: "/student", label: "الصفحة الرئيسية" },
        { to: "/student/seances", label: "الحصص المسجّلة" },
        { to: backTo, label: subjectName(subjectId) ?? "المادّة" },
        { label: `الثلاثي ${semester}` },
      ],
    }
  }, [kind, id, askedSubject, askedGroup, lessons, chapters, exams, sessions, subjects, teachers, groups])
}
