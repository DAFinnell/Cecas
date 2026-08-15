import { NavLink, useNavigate } from 'react-router-dom'
import { useCurrentUser } from '../hooks/useCurrentUser'
import CreateNewRequestIcon from '../assets/CreateNewRequest.svg'
import HomeIcon from '../assets/Home.svg'
import DashboardIcon from '../assets/Dashboard.svg'
import ListIcon from '../assets/List.svg'
import LoginIcon from '../assets/Login.svg'
import RegisterIcon from '../assets/Register.svg'
import HowItWorksIcon from '../assets/HowItWorks.svg'
import authService from '../services/AuthService'
import capLogo from '../assets/cap.svg'
import { routes } from '../app/routes'
import { useEffect, useState } from 'react'
import type { UserProfileResponse } from '../types/user.types'
import UserService from '../services/UserService'

const navItems = [
  { to: routes.home, label: 'Home', end: true, roles: ['ANONYMOUS'], icon: HomeIcon },
  { to: routes.howItWorks, label: 'How It Works', end: true, roles: ['ANONYMOUS'], icon: HowItWorksIcon },
  { to: routes.login, label: 'Login', end: true, roles: ['ANONYMOUS'], icon: LoginIcon },
  { to: routes.register, label: 'Register', end: true, roles: ['ANONYMOUS'], icon: RegisterIcon },

  { to: routes.student.dashboard, label: 'Dashboard', end: true, roles: ['STUDENT'], icon: DashboardIcon },
  { to: routes.chair.dashboard, label: 'Dashboard', end: true, roles: ['CHAIR'], icon: DashboardIcon },
  { to: routes.student.applications, label: 'My Requests', end: true, roles: ['STUDENT'], icon: ListIcon },
  { to: routes.student.newRequest, label: 'Create New Request', end: true, roles: ['STUDENT'], icon: CreateNewRequestIcon }
]

export default function Navbar() {
  const { user } = useCurrentUser()
  const isAuthenticated = !!user?.authenticated
  const role = user?.role
  const isChairPasswordChangeRequired =
    role === 'CHAIR' && user?.mustChangePassword === true
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const [profile, setProfile] = useState<UserProfileResponse | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const visibleItems = navItems.filter((item) => {
    if (!item.roles) {
      return true
    }

    if (item.roles.includes('ANONYMOUS')) {
      return !isAuthenticated
    }

    if (isChairPasswordChangeRequired) {
      return false
    }
    return isAuthenticated && role && item.roles.includes(role)
  })

  useEffect(() => {
    if (role === "CHAIR" || role === "STUDENT") {
      UserService.getUserProfile()
        .then((data) => setProfile(data))
        .catch(() => setProfile(null))
    }
  }, [role])

  useEffect(() => {
    const onAuthChanged = () => {
      setProfile(null)
      setProfileOpen(false)
      UserService.getUserProfile()
        .then((data) => setProfile(data))
        .catch(() => setProfile(null))
    }

    const onSessionExpired = () => {
      // clear UI and do a hard redirect to fully reset app state (this clears any cached state in memory, including auth state)
      setProfile(null)
      setProfileOpen(false)
      window.location.href = routes.login
    }

    window.addEventListener('auth-changed', onAuthChanged)
    window.addEventListener('session-expired', onSessionExpired)
    return () => {
      window.removeEventListener('auth-changed', onAuthChanged)
      window.removeEventListener('session-expired', onSessionExpired)
    }
  }, [isAuthenticated, navigate])

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex h-24 max-w-7xl items-center lg:px-20">
        {/* Brand */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <img
            src={capLogo}
            alt="CECAS logo"
            className="h-14 w-auto"
          />

          <div className="leading-tight">
            <p className=" text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
              CECAS
            </p>
            <h1 className="text-2xl font-semibold tracking-tight leading-tight">
              Canvas Extra Credit
              <br />
              Automation System
            </h1>
          </div>
        </div>

        <div
          className={`flex flex-1 items-center min-w-0 ${isAuthenticated
            ? "justify-end gap-6"
            : "justify-end"
            }`}
        >
          <nav aria-label="Main navigation" className="flex items-center gap-2 whitespace-nowrap shrink-0">
            {visibleItems.map((item) => {

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-sm font-medium transition
                      ${isActive
                      ? "bg-sky-100 text-sky-800"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                    }`
                  }
                >
                  {item.icon && (
                    <img
                      src={item.icon}
                      alt=""
                      className="mr-2 inline-block h-4 w-4 align-text-bottom"
                    />
                  )}
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          {isAuthenticated &&
            user?.mustChangePassword === false &&
            profile?.fullName && (
              <div className="relative flex items-center gap-3 ml-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">
                    {profile.fullName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {role === "CHAIR" ? "Program Chair" : "Student"}
                  </p>
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    aria-expanded={profileOpen}
                    onClick={() => setProfileOpen((prev) => !prev)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-300"
                  >
                    {profile.fullName
                      .split(" ")
                      .map((name) => name[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-40 rounded-md border border-slate-200 bg-white shadow-lg">
                      <button
                        onClick={async () => {
                          if (loggingOut) return

                          try {
                            setLoggingOut(true)
                            await authService.logout()
                            navigate(routes.home)
                          } finally {
                            setLoggingOut(false)
                          }
                        }}
                        disabled={loggingOut}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                      >
                        {loggingOut ? "Logging out..." : "Logout"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </header>
  )
}
