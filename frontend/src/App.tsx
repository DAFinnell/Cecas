import { Route, Routes } from 'react-router-dom'
import AppLayout from './app/AppLayout'
import RequireRole from './app/RequireRole'
import ChairPage from './pages/ChairPage'
import DebugPage from './pages/DebugPage'
import HomePage from './pages/HomePage'
import HowItWorksPage from './pages/HowItWorksPage'
import LoginPage from './pages/LoginPage'
import NewExtraCreditRequestPage from './pages/NewExtraCreditRequestPage'
import NotFoundPage from './pages/NotFoundPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import RegisterPage from './pages/RegisterPage'
import StudentPage from './pages/StudentPage'
import CsrfInitializer from './components/CsrfInitializer'

export default function App() {
  return (
    <>
      <CsrfInitializer />
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="how-it-works" element={<HowItWorksPage />} />

          <Route element={<RequireRole allowedRoles={['STUDENT']} />}>
            <Route path="student-dashboard" element={<StudentPage />} />
            <Route path="create-request" element={<NewExtraCreditRequestPage />} />
          </Route>

          <Route element={<RequireRole allowedRoles={['CHAIR']} />}>
            <Route path="chair-dashboard" element={<ChairPage />} />
          </Route>
          <Route path="logout" element={<HomePage />} /> // needs changed
          <Route path="debug" element={<DebugPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  )
}
