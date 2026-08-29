import { Navigate, Outlet } from 'react-router-dom'
import { useCurrentUser } from '../hooks/useCurrentUser'

export default function RequireChairPasswordChange() {
  const { user, loading } = useCurrentUser()

  if (loading) {
    return <p className="text-sm text-slate-600">Loading... </p>
  }

  if (user.role === 'CHAIR' && user.mustChangePassword) {
    return <Navigate to="/chair/force-change-password" replace />
  }

  return <Outlet />
}
