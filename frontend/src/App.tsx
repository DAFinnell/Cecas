import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './app/AppLayout'
import RequireChairPasswordChange from './app/RequireChairPasswordChange'
import RequireRole from './app/RequireRole'
import { routePath, routes } from './app/routes'
import CsrfInitializer from './components/CsrfInitializer'
import { useCurrentUser } from './hooks/useCurrentUser'
import AboutPage from './pages/AboutPage'
import ChairPage from './pages/ChairDashboardPage'
import ContactPage from './pages/ContactPage'
import DebugPage from './pages/DebugPage'
import ForceChangePasswordPage from './pages/ForceChangePasswordPage'
import HomePage from './pages/HomePage'
import HowItWorksPage from './pages/HowItWorksPage'
import LoginPage from './pages/LoginPage'
import NewExtraCreditRequestPage from './pages/NewExtraCreditRequestPage'
import NotFoundPage from './pages/NotFoundPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import RegisterPage from './pages/RegisterPage'
import StudentPage from './pages/StudentPage'
import StudentApplicationDetailPage from './pages/StudentApplicationDetailPage'
import StudentApplicationsPage from './pages/StudentApplicationsPage'
import ChairReviewPage from './pages/ChairReviewPage'
import EvidenceUploadPage from './pages/EvidenceUploadPage'
import DemoPage from './pages/DemoPage'

export function RootPage() {
  const { user, loading } = useCurrentUser()

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="flex items-center gap-3 rounded-2xl bg-white px-6 py-5 text-slate-700 shadow-sm ring-1 ring-slate-200"
        >
          <span
            aria-hidden="true"
            className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-sky-700 motion-reduce:animate-none"
          />

          <span className="font-medium">Loading CECAS...</span>
        </div>
      </div>
    )
  }

  if (user.authenticated && user.role === 'STUDENT') {
    return <Navigate to={routes.student.dashboard} replace />
  }

  if (user.authenticated && user.role === 'CHAIR') {
    return (
      <Navigate
        to={user.mustChangePassword ? routes.chair.forceChangePassword : routes.chair.dashboard}
        replace
      />
    )
  }

  return <HomePage />
}

export default function App() {
  return (
    <>
      <CsrfInitializer />

      <Routes>
        <Route path={routes.home} element={<AppLayout />}>
          <Route index element={<RootPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path={routePath(routes.login)} element={<LoginPage />} />
          <Route path={routePath(routes.register)} element={<RegisterPage />} />
          <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path={routePath(routes.howItWorks)} element={<HowItWorksPage />} />
          <Route path={routePath(routes.demo)} element={<DemoPage />} />

          <Route element={<RequireRole allowedRoles={['STUDENT']} />}>
            <Route path={routePath(routes.student.dashboard)} element={<StudentPage />} />

            <Route
              path={routePath(routes.student.applications)}
              element={<StudentApplicationsPage />}
            />
            <Route
              path={routePath(routes.student.newRequest)}
              element={<NewExtraCreditRequestPage />}
            />
            <Route
              path={routePath('/student/requests/:requestId')}
              element={<StudentApplicationDetailPage />}
            />
            <Route
              path={routePath('/student/requests/:requestId/evidence')}
              element={<EvidenceUploadPage />}
            />
          </Route>

          <Route element={<RequireRole allowedRoles={['CHAIR']} />}>
            <Route element={<RequireChairPasswordChange />}>
              <Route path={routePath(routes.chair.dashboard)} element={<ChairPage />} />
              <Route path={routePath('/chair/review/:requestId')} element={<ChairReviewPage />} />
            </Route>

            <Route
              path={routePath(routes.chair.forceChangePassword)}
              element={<ForceChangePasswordPage />}
            />
          </Route>

          {import.meta.env.DEV && <Route path="debug" element={<DebugPage />} />}

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  )
}
