import type { ReactElement } from "react"
import { createBrowserRouter, Link } from "react-router-dom"
import { ChevronLeft, GraduationCap, Palette } from "lucide-react"
import type { Role } from "@/data/types"
import type { NavItem } from "@/app/nav/types"
import WorkspaceLayout from "@/features/workspace/WorkspaceLayout"
import LandingPage from "@/features/landing/LandingPage"
import DesignSystemPage from "@/features/styleguide/DesignSystemPage"
import { RoleSwitcher } from "@/features/switcher/RoleSwitcher"
import { RoleLayout } from "@/app/RoleLayout"
import { ComingSoon } from "@/features/shared/ComingSoon"
import ProfileScreen from "@/features/shared/ProfileScreen"
import { adminNav } from "@/app/nav/admin"
import { teacherNav } from "@/app/nav/teacher"
import { parentNav } from "@/app/nav/parent"
import { studentNav } from "@/app/nav/student"
import AdminDashboard from "@/features/admin/Dashboard"
import AdminYearsScreen from "@/features/admin/curriculum/YearsScreen"
import AdminSubjectsScreen from "@/features/admin/curriculum/SubjectsScreen"
import AdminSubjectDetailScreen from "@/features/admin/curriculum/SubjectDetailScreen"
import AdminChapterDetailScreen from "@/features/admin/curriculum/ChapterDetailScreen"
import AdminUsersScreen from "@/features/admin/users/UsersScreen"
import AdminOffersScreen from "@/features/admin/offers/OffersScreen"
import AdminAccessesScreen from "@/features/admin/offers/AccessesScreen"
import AdminAccessContentScreen from "@/features/admin/offers/AccessContentScreen"
import AdminPromoCodesScreen from "@/features/admin/offers/PromoCodesScreen"
import AdminPaymentsScreen from "@/features/admin/payments/PaymentsScreen"
import AdminMessagesScreen from "@/features/admin/messages/MessagesScreen"
import AdminSubscriptionDetailScreen from "@/features/admin/payments/SubscriptionDetailScreen"
import AdminGroupsScreen from "@/features/admin/groups/GroupsScreen"
import AdminSessionsScreen from "@/features/admin/sessions/SessionsScreen"
import AdminLiveSessionsScreen from "@/features/admin/live/LiveSessionsScreen"
import AdminCalendarScreen from "@/features/admin/planning/CalendarScreen"
import AdminTeacherPayScreen from "@/features/admin/teacher-pay/TeacherPayScreen"
import AdminTeacherPayDetailScreen from "@/features/admin/teacher-pay/TeacherPayDetailScreen"
import TeacherDashboard from "@/features/teacher/Dashboard"
import TeacherSessionsScreen from "@/features/teacher/SessionsScreen"
import TeacherMoneyScreen from "@/features/teacher/money/MoneyScreen"
import TeacherPromoScreen from "@/features/teacher/PromoScreen"
import StudentPromoScreen from "@/features/student/PromoScreen"
import ParentPromoScreen from "@/features/parent/PromoScreen"
import ParentDashboard from "@/features/parent/Dashboard"
import StudentDashboard from "@/features/student/Dashboard"
import StudentOffersScreen from "@/features/student/offres/OffersScreen"
import StudentSubjectsScreen from "@/features/student/SubjectsScreen"
import StudentCalendarScreen from "@/features/student/calendar/CalendarScreen"
import StudentSubjectDetailScreen from "@/features/student/SubjectDetailScreen"
import StudentHomeworksScreen from "@/features/student/homeworks/HomeworksScreen"
import StudentSeancesScreen from "@/features/student/seances/SeancesScreen"
import StudentSeanceSubjectScreen from "@/features/student/seances/SeanceSubjectScreen"
import StudentVideoPlayerScreen from "@/features/student/player/VideoPlayerScreen"
import StudentFinanceScreen from "@/features/student/finance/FinanceScreen"
import StudentSubscriptionScreen from "@/features/student/finance/SubscriptionScreen"
import { useData } from "@/stores/useData"
import V2Layout from "@/features/student-v2/V2Layout"
import V2Dashboard from "@/features/student-v2/dashboard/Dashboard"
import V2SeanceScreen from "@/features/student-v2/SeanceScreen"
import { V2Placeholder } from "@/features/student-v2/V2Placeholder"
import V2RecordingsScreen from "@/features/student-v2/recordings/RecordingsScreen"
import V2CalendarScreen from "@/features/student-v2/calendar/CalendarScreen"
import V2VideoScreen from "@/features/student-v2/video/VideoScreen"
import V2OffersScreen from "@/features/student-v2/offers/OffersScreen"
import SiteLayout from "@/features/site/SiteLayout"
import SiteHome from "@/features/site/HomePage"
import SiteAbout from "@/features/site/AboutPage"
import LoginPage from "@/features/auth/LoginPage"
import RegisterPage from "@/features/auth/RegisterPage"
import ForgotPasswordPage from "@/features/auth/ForgotPasswordPage"
import V2SubjectRecordingsScreen from "@/features/student-v2/recordings/SubjectRecordingsScreen"

/** Standalone list of the shared courses; links into the /courses/:id workspace. */
function CoursesList() {
  const courses = useData((s) => s.courses)
  return (
    <div className="min-h-dvh bg-canvas">
      <div className="mx-auto w-full max-w-[880px] px-4 py-10 sm:px-6">
        <header className="mb-6 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-[11px] bg-grad text-ink-inverted shadow-brand">
            <GraduationCap className="size-6" />
          </span>
          <div>
            <p className="text-[calc(11px*var(--ts))] font-medium uppercase tracking-[.12em] text-accent2-600">Wael Academy</p>
            <h1 className="font-display text-[calc(26px*var(--ts))] font-bold text-ink">الدروس</h1>
          </div>
          <Link
            to="/design-system"
            aria-label="نظام التصميم"
            className="ms-auto inline-flex h-11 items-center gap-2 rounded-md border border-border-strong bg-surface px-3 text-[calc(13px*var(--ts))] font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600 sm:h-9 sm:px-3.5"
          >
            <Palette className="size-4" /> <span className="hidden sm:inline">نظام التصميم</span>
          </Link>
        </header>

        <ul className="grid gap-3">
          {courses.map((c) => (
            <li key={c.id}>
              <Link
                to={`/courses/${c.id}`}
                className="group flex items-center gap-4 rounded-lg border border-border bg-surface p-[18px] shadow-sm transition hover:border-brand-200 hover:shadow-md motion-safe:hover:-translate-y-0.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[calc(15px*var(--ts))] font-bold text-ink">{c.name}</p>
                  <p className="text-[calc(12px*var(--ts))] text-ink-muted">{c.level}</p>
                </div>
                <ChevronLeft className="size-5 shrink-0 text-ink-muted transition group-hover:text-brand-600" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** Placeholder shown inside each workspace tab. */
function SectionPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-brand-50 text-brand-600">
        <GraduationCap className="size-5" />
      </span>
      <h2 className="mt-4 font-display text-lg font-bold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-ink-muted">الشاشة مازالت باش تتبنى — الإطار والتنقّل حاضرين.</p>
    </div>
  )
}

function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-4 text-center">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">الصفحة ما تلقاتش</h1>
        <p className="mt-2 text-sm text-ink-muted">الصفحة هاذي مازالت ما موجودةش.</p>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline">
          ارجع للرئيسية
        </Link>
      </div>
    </div>
  )
}

interface RouteChild {
  path: string
  element: ReactElement
}

/**
 * Build a role's route: RoleLayout + dashboard index + children. Nav items get a
 * "coming soon" placeholder unless a real screen is supplied in `built` (matched
 * by the nav item's relative path); `extra` adds nested routes with no nav entry
 * (e.g. detail pages). Every role also gets "profil" — the account menu in the
 * shell header links to it from any screen.
 */
function roleRoute(
  base: string,
  role: Role,
  nav: NavItem[],
  dashboard: ReactElement,
  built: Record<string, ReactElement> = {},
  extra: RouteChild[] = [],
) {
  return {
    path: base,
    element: <RoleLayout role={role} nav={nav} />,
    children: [
      { index: true, element: dashboard },
      { path: "profil", element: <ProfileScreen /> },
      ...nav.slice(1).map((item) => {
        const rel = item.path.slice(base.length + 1)
        return { path: rel, element: built[rel] ?? <ComingSoon title={item.label} /> }
      }),
      ...extra,
    ],
  }
}

export const router = createBrowserRouter([
  /* The public site — the Figma landing (« Page D'acceuil ») and « About us ».
     The previous landing stays reachable at /landing-ancien. */
  {
    path: "/",
    element: <SiteLayout />,
    children: [
      { index: true, element: <SiteHome /> },
      { path: "a-propos", element: <SiteAbout /> },
    ],
  },
  /* The front door — « Log In », and the register / reset screens the real
     élève space reaches from it. Outside every shell: no rail, no top bar. */
  { path: "/connexion", element: <LoginPage /> },
  { path: "/inscription", element: <RegisterPage /> },
  { path: "/mot-de-passe-oublie", element: <ForgotPasswordPage /> },
  { path: "/landing-ancien", element: <LandingPage /> },
  { path: "/roles", element: <RoleSwitcher /> },
  roleRoute(
    "/admin",
    "admin",
    adminNav,
    <AdminDashboard />,
    {
      curriculum: <AdminYearsScreen />,
      users: <AdminUsersScreen />,
      groups: <AdminGroupsScreen />,
      sessions: <AdminSessionsScreen />,
      live: <AdminLiveSessionsScreen />,
      calendar: <AdminCalendarScreen />,
      offers: <AdminOffersScreen />,
      payments: <AdminPaymentsScreen />,
      "teacher-pay": <AdminTeacherPayScreen />,
      messages: <AdminMessagesScreen />,
    },
    [
      { path: "curriculum/:yearId", element: <AdminSubjectsScreen /> },
      { path: "curriculum/:yearId/:subjectId", element: <AdminSubjectDetailScreen /> },
      { path: "curriculum/:yearId/:subjectId/:chapterId", element: <AdminChapterDetailScreen /> },
      { path: "offers/access", element: <AdminAccessesScreen /> },
      { path: "offers/access/:accessId", element: <AdminAccessContentScreen /> },
      { path: "offers/promos", element: <AdminPromoCodesScreen /> },
      { path: "payments/:subscriptionId", element: <AdminSubscriptionDetailScreen /> },
      { path: "teacher-pay/:teacherId", element: <AdminTeacherPayDetailScreen /> },
    ],
  ),
  roleRoute("/teacher", "teacher", teacherNav, <TeacherDashboard />, {
    sessions: <TeacherSessionsScreen />,
    money: <TeacherMoneyScreen />,
    codes: <TeacherPromoScreen />,
  }),
  roleRoute("/parent", "parent", parentNav, <ParentDashboard />, {
    codes: <ParentPromoScreen />,
  }),
  roleRoute(
    "/student",
    "student",
    studentNav,
    <StudentDashboard />,
    {
      offres: <StudentOffersScreen />,
      matieres: <StudentSubjectsScreen />,
      calendrier: <StudentCalendarScreen />,
      seances: <StudentSeancesScreen />,
      "porte-monnaie": <StudentFinanceScreen />,
      codes: <StudentPromoScreen />,
    },
    [
      { path: "devoirs", element: <StudentHomeworksScreen /> },
      { path: "matieres/:subjectId", element: <StudentSubjectDetailScreen /> },
      { path: "seances/:subjectId", element: <StudentSeanceSubjectScreen /> },
      { path: "porte-monnaie/:subscriptionId", element: <StudentSubscriptionScreen /> },
      { path: "video/:kind/:id", element: <StudentVideoPlayerScreen /> },
    ],
  ),
  /* The NEW élève space — the Figma redesign, built screen by screen over the
     same store. Anything not designed yet hands over to the old screen. */
  {
    path: "/student-v2",
    element: <V2Layout />,
    children: [
      { index: true, element: <V2Dashboard /> },
      { path: "seance/:id", element: <V2SeanceScreen /> },
      { path: "video/:kind/:id", element: <V2VideoScreen /> },
      { path: "offres", element: <V2OffersScreen /> },
      { path: "calendrier", element: <V2CalendarScreen /> },
      { path: "seances", element: <V2RecordingsScreen /> },
      { path: "seances/:subjectId", element: <V2SubjectRecordingsScreen /> },
      {
        path: "groupes",
        element: <V2Placeholder title="مجموعاتي" note="صفحة جديدة، ما كانتش في الفضاء القديم — تستنّى التصميم متاعها." />,
      },
      { path: "matieres", element: <V2Placeholder title="موادك" legacy="/student/matieres" /> },
      { path: "devoirs", element: <V2Placeholder title="التمارين" legacy="/student/devoirs" /> },
      { path: "profil", element: <V2Placeholder title="بروفيلي" legacy="/student/profil" /> },
      { path: "parametres", element: <V2Placeholder title="الإعدادات" legacy="/student/profil" /> },
      { path: "porte-monnaie", element: <V2Placeholder title="المحفظة" legacy="/student/porte-monnaie" /> },
      { path: "favoris", element: <V2Placeholder title="مفضّلاتي" legacy="/student/favoris" /> },
      { path: "codes", element: <V2Placeholder title="كوداتي" legacy="/student/codes" /> },
      { path: "*", element: <V2Placeholder title="الصفحة ما تلقاتش" /> },
    ],
  },
  { path: "/courses", element: <CoursesList /> },
  {
    path: "/courses/:id",
    element: <WorkspaceLayout />,
    children: [
      { index: true, element: <SectionPlaceholder title="نظرة على الدرس" /> },
      { path: "planning", element: <SectionPlaceholder title="روزنامة الحصص" /> },
      { path: "students", element: <SectionPlaceholder title="التلامذة المسجّلين" /> },
      { path: "grades", element: <SectionPlaceholder title="الأعداد والتقييمات" /> },
    ],
  },
  { path: "/design-system", element: <DesignSystemPage /> },
  { path: "*", element: <NotFound /> },
])
