import { useEffect } from 'react'
import Button from '../components/Button'
import useForceChangePassword from '../hooks/useForceChangePassword'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useNavigate } from 'react-router-dom'

export default function ForceChangePasswordPage() {
  const { user, loading: currentUserLoading } = useCurrentUser()
  const navigate = useNavigate()

  const {
    currentPassword,
    newPassword,
    confirmPassword,
    loading,
    error,
    success,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    handleSubmit,
  } = useForceChangePassword()

  // redirect chairs who no longer require a forced password change
  useEffect(() => {
    if (!currentUserLoading &&
      user.role === 'CHAIR' &&
      !user.mustChangePassword
    ) {
      navigate('/chair', { replace: true })
    }
  }, [currentUserLoading, user, navigate])



  return (
    <div className="mx-auto max-w-md">
      <div
        className={`rounded-lg bg-white p-8 shadow-sm border-2 transition-colors ${success
          ? 'border-green-500'
          : error
            ? 'border-red-500'
            : 'border-slate-200'
          }`}
      >
        <h1 className="mb-2 text-center text-3xl font-semibold">
          Change Temporary Password
        </h1>

        <p className="mb-6 text-center text-slate-600">
          Your account is using a temporary password. You must create a new
          password before continuing.
        </p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="currentPassword"
              className="mb-2 block text-sm font-medium"
            >
              Current Password
            </label>

            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Enter your current password"
              required
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="mb-2 block text-sm font-medium"
            >
              New Password
            </label>

            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Enter a new password"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium"
            >
              Confirm New Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Confirm your new password"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Changing Password..' : 'Change Password'}
          </Button>
        </form>
      </div>
    </div>
  )
}