import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './app/AppLayout'
import RequireChairPasswordChange from './app/RequireChairPasswordChange'
import RequireRole from './app/RequireRole'
import { routePath, routes } from './app/routes'
import CsrfInitializer from './components/CsrfInitializer'
import { useCurrentUser } from './hooks/useCurrentUser'
import AboutPage from './pages/AboutPage'
import ChairPage from './pages/ChairPage'
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

function RootPage() {
  const { user, loading } = useCurrentUser()

  if (loading) {
    return <p className="text-sm text-slate-600">Loading...</p>
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

          <Route element={<RequireRole allowedRoles={['STUDENT']} />}>
            <Route path={routePath(routes.student.dashboard)} element={<StudentPage />} />
            <Route
              path={routePath(routes.student.newRequest)}
              element={<NewExtraCreditRequestPage />}
            />
          </Route>

          <Route element={<RequireRole allowedRoles={['CHAIR']} />}>
            <Route element={<RequireChairPasswordChange />}>
              <Route path={routePath(routes.chair.dashboard)} element={<ChairPage />} />
            </Route>

            <Route
              path={routePath(routes.chair.forceChangePassword)}
              element={<ForceChangePasswordPage />}
            />
          </Route>

          <Route path="debug" element={<DebugPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  )
}
