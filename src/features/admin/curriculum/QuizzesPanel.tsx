import { useMemo, useState, type KeyboardEvent } from "react"
import { Check, Clock, FolderPlus, Layers, Pencil, Plus, Tag, Trash2, X } from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { OverflowMenu } from "@/components/kit/OverflowMenu"
import { FormSheet } from "@/components/kit/FormSheet"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { useToast } from "@/components/kit/Toast"
import { useData } from "@/stores/useData"
import type { Chapter, Quiz, QuizExam, QuizQuestion } from "@/data/types"
import { QUIZ_ICON } from "./content"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

function newQuestion(): QuizQuestion {
  return { id: crypto.randomUUID(), prompt: "", choices: ["", ""], correctIndex: 0 }
}

/** The "Quiz" tab of a chapter — MCQ quizzes with tags, grouped into examens. */
export function QuizzesPanel({ chapter }: { chapter: Chapter }) {
  const allQuizzes = useData((s) => s.quizzes)
  const allQuizExams = useData((s) => s.quizExams)
  const addQuiz = useData((s) => s.addQuiz)
  const updateQuiz = useData((s) => s.updateQuiz)
  const removeQuiz = useData((s) => s.removeQuiz)
  const addQuizExam = useData((s) => s.addQuizExam)
  const updateQuizExam = useData((s) => s.updateQuizExam)
  const removeQuizExam = useData((s) => s.removeQuizExam)
  const { show, toast } = useToast()

  const quizzes = useMemo(
    () =>
      allQuizzes
        .filter((q) => q.chapterId === chapter.id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [allQuizzes, chapter.id],
  )

  const exams = useMemo(
    () =>
      allQuizExams
        .filter((e) => e.chapterId === chapter.id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [allQuizExams, chapter.id],
  )

  /** Quizzes grouped by their exam id; a trailing bucket holds the ungrouped. */
  const grouped = useMemo(() => {
    const groups: { exam: QuizExam | null; items: Quiz[] }[] = exams.map((e) => ({
      exam: e,
      items: quizzes.filter((q) => q.quizExamId === e.id),
    }))
    const loose = quizzes.filter((q) => !q.quizExamId || !exams.some((e) => e.id === q.quizExamId))
    if (loose.length > 0 || groups.length === 0) groups.push({ exam: null, items: loose })
    return groups
  }, [quizzes, exams])

  // --- Quiz form state ---
  const [quizOpen, setQuizOpen] = useState(false)
  const [editing, setEditing] = useState<Quiz | null>(null)
  const [title, setTitle] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagDraft, setTagDraft] = useState("")
  const [duration, setDuration] = useState("")
  const [examId, setExamId] = useState<string>("")
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [deleteQuiz, setDeleteQuiz] = useState<Quiz | null>(null)

  // --- Exam (group) form state ---
  const [examOpen, setExamOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<QuizExam | null>(null)
  const [examTitle, setExamTitle] = useState("")
  const [deleteExam, setDeleteExam] = useState<QuizExam | null>(null)

  function openAddQuiz(preselectExam?: string) {
    setEditing(null)
    setTitle("")
    setTags([])
    setTagDraft("")
    setDuration("")
    setExamId(preselectExam ?? "")
    setQuestions([newQuestion()])
    setQuizOpen(true)
  }

  function openEditQuiz(quiz: Quiz) {
    setEditing(quiz)
    setTitle(quiz.title)
    setTags(quiz.tags)
    setTagDraft("")
    setDuration(quiz.durationMin ? String(quiz.durationMin) : "")
    setExamId(quiz.quizExamId ?? "")
    setQuestions(quiz.questions.length > 0 ? quiz.questions.map((q) => ({ ...q, choices: [...q.choices] })) : [newQuestion()])
    setQuizOpen(true)
  }

  function commitTag() {
    const t = tagDraft.trim()
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t])
    setTagDraft("")
  }

  function onTagKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      commitTag()
    } else if (e.key === "Backspace" && !tagDraft && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1))
    }
  }

  function submitQuiz() {
    const trimmed = title.trim()
    if (!trimmed) return
    const cleanQuestions = questions
      .map((q) => ({
        ...q,
        prompt: q.prompt.trim(),
        choices: q.choices.map((c) => c.trim()).filter((c) => c !== ""),
      }))
      .filter((q) => q.prompt !== "" && q.choices.length >= 2)
      .map((q) => ({ ...q, correctIndex: Math.min(q.correctIndex, q.choices.length - 1) }))
    const patch = {
      title: trimmed,
      tags,
      durationMin: duration.trim() ? Number(duration) : undefined,
      quizExamId: examId || undefined,
      questions: cleanQuestions,
      chapterId: chapter.id,
    }
    if (editing) {
      updateQuiz(editing.id, patch)
      show("Quiz modifié")
    } else {
      addQuiz({ ...patch, order: quizzes.length })
      show("Quiz ajouté")
    }
    setQuizOpen(false)
  }

  function openAddExam() {
    setEditingExam(null)
    setExamTitle("")
    setExamOpen(true)
  }

  function openEditExam(exam: QuizExam) {
    setEditingExam(exam)
    setExamTitle(exam.title)
    setExamOpen(true)
  }

  function submitExam() {
    const trimmed = examTitle.trim()
    if (!trimmed) return
    if (editingExam) {
      updateQuizExam(editingExam.id, { title: trimmed })
      show("Examen de quiz modifié")
    } else {
      addQuizExam({ title: trimmed, chapterId: chapter.id, order: exams.length })
      show("Examen de quiz créé")
    }
    setExamOpen(false)
  }

  const addQuizButton = (
    <button
      type="button"
      onClick={() => openAddQuiz()}
      className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
    >
      <Plus className="size-4" /> Ajouter un quiz
    </button>
  )

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          {quizzes.length > 0
            ? `${quizzes.length} quiz${exams.length > 0 ? ` · ${exams.length} examen${exams.length > 1 ? "s" : ""}` : ""}`
            : "Aucun quiz pour le moment"}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openAddExam}
            className="inline-flex h-11 items-center gap-2 rounded-md border border-border-strong bg-surface px-3.5 text-sm font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600 md:h-10"
          >
            <FolderPlus className="size-4" /> Examen de quiz
          </button>
          {quizzes.length > 0 && addQuizButton}
        </div>
      </div>

      {quizzes.length === 0 && exams.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={QUIZ_ICON}
            title="Aucun quiz"
            description="Créez des quiz (QCM) avec des tags, et regroupez-les en « examens de quiz »."
            action={addQuizButton}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map((g) => (
            <section key={g.exam?.id ?? "loose"} className="flex flex-col gap-3">
              {g.exam ? (
                <div className="flex items-center gap-2.5 rounded-lg border border-border bg-surface-muted px-3.5 py-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-md bg-info-50 text-info-600">
                    <Layers className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p dir="auto" className="truncate font-display text-[14px] font-bold text-ink">
                      {g.exam.title}
                    </p>
                    <p className="text-[12px] text-ink-muted">
                      {g.items.length} quiz{g.items.length > 1 ? "s" : ""} regroupé
                      {g.items.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openAddQuiz(g.exam!.id)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-brand-600 transition hover:bg-brand-50"
                  >
                    <Plus className="size-4" /> <span className="hidden sm:inline">Quiz</span>
                  </button>
                  <OverflowMenu
                    actions={[
                      { label: "Modifier le groupe", icon: Pencil, onClick: () => openEditExam(g.exam!) },
                      {
                        label: "Supprimer le groupe",
                        icon: Trash2,
                        tone: "danger",
                        onClick: () => setDeleteExam(g.exam!),
                      },
                    ]}
                  />
                </div>
              ) : (
                grouped.length > 1 && (
                  <p className="text-[11px] font-medium uppercase tracking-[.12em] text-ink-muted">
                    Quiz individuels
                  </p>
                )
              )}

              {g.items.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-4 text-sm text-ink-muted">
                  Aucun quiz dans ce groupe — ajoutez-en un.
                </p>
              ) : (
                <ul className="grid gap-3">
                  {g.items.map((quiz) => {
                    const Icon = QUIZ_ICON
                    return (
                      <li
                        key={quiz.id}
                        className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm"
                      >
                        <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-md bg-info-50 text-info-600">
                          <Icon className="size-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p dir="auto" className="font-display text-[15px] font-bold text-ink">
                            {quiz.title}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-muted">
                            <span className="inline-flex items-center gap-1">
                              <Check className="size-3.5" /> {quiz.questions.length} question
                              {quiz.questions.length > 1 ? "s" : ""}
                            </span>
                            {quiz.durationMin != null && (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="size-3.5" /> {quiz.durationMin} min
                              </span>
                            )}
                          </div>
                          {quiz.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {quiz.tags.map((t) => (
                                <span
                                  key={t}
                                  className="inline-flex items-center gap-1 rounded-md bg-accent2-50 px-2 py-0.5 text-[12px] font-medium text-accent2-700"
                                >
                                  <Tag className="size-3" />
                                  <span dir="auto">{t}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <OverflowMenu
                          actions={[
                            { label: "Modifier", icon: Pencil, onClick: () => openEditQuiz(quiz) },
                            {
                              label: "Supprimer",
                              icon: Trash2,
                              tone: "danger",
                              onClick: () => setDeleteQuiz(quiz),
                            },
                          ]}
                        />
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}

      {/* --- Quiz form --- */}
      <FormSheet
        open={quizOpen}
        onOpenChange={setQuizOpen}
        title={editing ? "Modifier le quiz" : "Nouveau quiz"}
        description={editing ? undefined : "Un QCM catégorisé par tags, éventuellement rattaché à un examen de quiz."}
        submitLabel={editing ? "Enregistrer" : "Ajouter"}
        onSubmit={submitQuiz}
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Titre</span>
          <input
            className={INPUT + " text-start"}
            dir="auto"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex. QCM — Module et conjugué"
            autoFocus
          />
        </label>

        <div className="grid grid-cols-[1fr_auto] gap-3">
          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Examen de quiz</span>
            <select
              className={INPUT + " appearance-none"}
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
            >
              <option value="">— Aucun (individuel) —</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Durée</span>
            <div className="flex items-center gap-1.5">
              <input
                className={INPUT + " w-20 text-center"}
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="15"
              />
              <span className="text-sm text-ink-muted">min</span>
            </div>
          </label>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
            Tags <span className="font-normal text-ink-muted">(catégorisation — Entrée pour ajouter)</span>
          </span>
          <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-input-bg px-2 py-2 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-ring/20">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-md bg-accent2-50 px-2 py-1 text-[13px] font-medium text-accent2-700"
              >
                <span dir="auto">{t}</span>
                <button
                  type="button"
                  aria-label={`Retirer ${t}`}
                  onClick={() => setTags((prev) => prev.filter((x) => x !== t))}
                  className="text-accent2-600 transition hover:text-danger-600"
                >
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
            <input
              className="h-8 min-w-[8rem] flex-1 bg-transparent px-1 text-ink placeholder:text-ink-muted focus:outline-none"
              dir="auto"
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={onTagKey}
              onBlur={commitTag}
              placeholder={tags.length === 0 ? "révision, facile, chapitre 3…" : "ajouter…"}
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-sm font-medium text-ink-subtle">
              Questions <span className="font-normal text-ink-muted">({questions.length})</span>
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {questions.map((q, qi) => (
              <div key={q.id} className="rounded-lg border border-border bg-surface-muted p-3">
                <div className="flex items-start gap-2">
                  <span className="mt-2 grid size-6 shrink-0 place-items-center rounded-full bg-brand-100 text-[12px] font-bold text-brand-700">
                    {qi + 1}
                  </span>
                  <input
                    className={INPUT + " text-start"}
                    dir="auto"
                    value={q.prompt}
                    onChange={(e) =>
                      setQuestions((prev) => prev.map((x, j) => (j === qi ? { ...x, prompt: e.target.value } : x)))
                    }
                    placeholder="Énoncé de la question"
                  />
                  <button
                    type="button"
                    aria-label="Retirer la question"
                    onClick={() => setQuestions((prev) => prev.filter((_, j) => j !== qi))}
                    className="mt-1 grid size-9 shrink-0 place-items-center rounded-md text-ink-muted transition hover:bg-danger-50 hover:text-danger-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="mt-2 flex flex-col gap-1.5 ps-8">
                  {q.choices.map((choice, ci) => {
                    const correct = q.correctIndex === ci
                    return (
                      <div key={ci} className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={correct ? "Bonne réponse" : "Marquer comme bonne réponse"}
                          onClick={() =>
                            setQuestions((prev) => prev.map((x, j) => (j === qi ? { ...x, correctIndex: ci } : x)))
                          }
                          className={
                            "grid size-6 shrink-0 place-items-center rounded-full border transition " +
                            (correct
                              ? "border-transparent bg-success-500 text-white"
                              : "border-border-strong bg-surface text-transparent hover:border-success-500")
                          }
                        >
                          <Check className="size-3.5" />
                        </button>
                        <input
                          className="h-9 w-full rounded-md border border-input bg-surface px-2.5 text-[13px] text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20 text-start"
                          dir="auto"
                          value={choice}
                          onChange={(e) =>
                            setQuestions((prev) =>
                              prev.map((x, j) =>
                                j === qi
                                  ? { ...x, choices: x.choices.map((c, k) => (k === ci ? e.target.value : c)) }
                                  : x,
                              ),
                            )
                          }
                          placeholder={`Réponse ${ci + 1}`}
                        />
                        {q.choices.length > 2 && (
                          <button
                            type="button"
                            aria-label="Retirer la réponse"
                            onClick={() =>
                              setQuestions((prev) =>
                                prev.map((x, j) =>
                                  j === qi
                                    ? {
                                        ...x,
                                        choices: x.choices.filter((_, k) => k !== ci),
                                        correctIndex:
                                          x.correctIndex > ci
                                            ? x.correctIndex - 1
                                            : Math.min(x.correctIndex, x.choices.length - 2),
                                      }
                                    : x,
                                ),
                              )
                            }
                            className="grid size-8 shrink-0 place-items-center rounded-md text-ink-muted transition hover:bg-danger-50 hover:text-danger-600"
                          >
                            <X className="size-3.5" />
                          </button>
                        )}
                      </div>
                    )
                  })}
                  {q.choices.length < 4 && (
                    <button
                      type="button"
                      onClick={() =>
                        setQuestions((prev) =>
                          prev.map((x, j) => (j === qi ? { ...x, choices: [...x.choices, ""] } : x)),
                        )
                      }
                      className="inline-flex h-8 items-center gap-1.5 self-start rounded-md px-2 text-[13px] font-medium text-brand-600 transition hover:bg-brand-50"
                    >
                      <Plus className="size-3.5" /> Réponse
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setQuestions((prev) => [...prev, newQuestion()])}
              className="inline-flex h-10 items-center gap-1.5 self-start rounded-md border border-dashed border-border-strong px-3 text-sm font-medium text-ink-subtle transition hover:border-brand-300 hover:text-brand-600"
            >
              <Plus className="size-4" /> Ajouter une question
            </button>
          </div>
        </div>
      </FormSheet>

      {/* --- Exam (group) form --- */}
      <FormSheet
        open={examOpen}
        onOpenChange={setExamOpen}
        title={editingExam ? "Modifier l'examen de quiz" : "Nouvel examen de quiz"}
        description={editingExam ? undefined : "Un groupe qui rassemble plusieurs quiz de ce chapitre pour les afficher ensemble."}
        submitLabel={editingExam ? "Enregistrer" : "Créer"}
        onSubmit={submitExam}
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Titre du groupe</span>
          <input
            className={INPUT + " text-start"}
            dir="auto"
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
            placeholder="Ex. Examen de quiz — Révision générale"
            autoFocus
          />
        </label>
      </FormSheet>

      <ConfirmDialog
        open={deleteQuiz !== null}
        onOpenChange={(o) => !o && setDeleteQuiz(null)}
        title="Supprimer ce quiz ?"
        description={
          deleteQuiz
            ? `« ${deleteQuiz.title} » sera définitivement supprimé et retiré des parcours qui l'utilisent.`
            : undefined
        }
        onConfirm={() => {
          if (deleteQuiz) {
            removeQuiz(deleteQuiz.id)
            show("Quiz supprimé")
            setDeleteQuiz(null)
          }
        }}
      />

      <ConfirmDialog
        open={deleteExam !== null}
        onOpenChange={(o) => !o && setDeleteExam(null)}
        title="Supprimer cet examen de quiz ?"
        description={
          deleteExam
            ? `« ${deleteExam.title} » sera supprimé. Ses quiz ne seront pas supprimés — ils redeviennent individuels.`
            : undefined
        }
        onConfirm={() => {
          if (deleteExam) {
            removeQuizExam(deleteExam.id)
            show("Examen de quiz supprimé")
            setDeleteExam(null)
          }
        }}
      />

      {toast}
    </div>
  )
}
