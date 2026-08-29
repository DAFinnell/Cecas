import { Link, NavLink, useNavigate } from 'react-router-dom'
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
import { useEffect, useRef, useState } from 'react'
import type { UserProfileResponse } from '../types/user.types'
import UserService from '../services/UserService'

const navItems = [
  { to: routes.home, label: 'Home', end: true, roles: ['ANONYMOUS'], icon: HomeIcon },
  {
    to: routes.howItWorks,
    label: 'How It Works',
    end: true,
    roles: ['ANONYMOUS'],
    icon: HowItWorksIcon,
  },
  { to: routes.login, label: 'Login', end: true, roles: ['ANONYMOUS'], icon: LoginIcon },
  { to: routes.register, label: 'Register', end: true, roles: ['ANONYMOUS'], icon: RegisterIcon },

  {
    to: routes.student.dashboard,
    label: 'Dashboard',
    end: true,
    roles: ['STUDENT'],
    icon: DashboardIcon,
  },
  {
    to: routes.chair.dashboard,
    label: 'Dashboard',
    end: true,
    roles: ['CHAIR'],
    icon: DashboardIcon,
  },
  {
    to: routes.student.applications,
    label: 'My Requests',
    end: true,
    roles: ['STUDENT'],
    icon: ListIcon,
  },
  {
    to: routes.student.newRequest,
    label: 'Create New Request',
    end: true,
    roles: ['STUDENT'],
    icon: CreateNewRequestIcon,
  },
]

function getInitials(value: string) {
  const initials = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()

  return initials || 'U'
}

export default function Navbar() {
  const { user } = useCurrentUser()
  const isAuthenticated = !!user?.authenticated
  const role = user?.role
  const isChairPasswordChangeRequired = role === 'CHAIR' && user?.mustChangePassword === true
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfileResponse | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
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
  const roleLabel = role === 'CHAIR' ? 'Program Chair' : role === 'STUDENT' ? 'Student' : 'Account'
  const accountName = profile?.fullName?.trim() || user?.email?.trim() || roleLabel
  const accountInitials = getInitials(accountName)
  const closeDisclosures = () => {
    setMobileOpen(false)
    setProfileOpen(false)
  }

  const mobileButtonRef = useRef<HTMLButtonElement>(null)
  const accountButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (role === 'CHAIR' || role === 'STUDENT') {
      UserService.getUserProfile()
        .then((data) => setProfile(data))
        .catch(() => setProfile(null))
    }
  }, [role])

  useEffect(() => {
    const onAuthChanged = () => {
      setProfile(null)
      setProfileOpen(false)
      setMobileOpen(false)
      UserService.getUserProfile()
        .then((data) => setProfile(data))
        .catch(() => setProfile(null))
    }

    const onSessionExpired = () => {
      // clear UI and do a hard redirect to fully reset app state (this clears any cached state in memory, including auth state)
      setProfile(null)
      setProfileOpen(false)
      setMobileOpen(false)
      window.location.href = routes.login
    }

    window.addEventListener('auth-changed', onAuthChanged)
    window.addEventListener('session-expired', onSessionExpired)
    return () => {
      window.removeEventListener('auth-changed', onAuthChanged)
      window.removeEventListener('session-expired', onSessionExpired)
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (!mobileOpen && !profileOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      event.preventDefault()

      if (mobileOpen) {
        setMobileOpen(false)
        mobileButtonRef.current?.focus()
        return
      }

      if (profileOpen) {
        setProfileOpen(false)
        accountButtonRef.current?.focus()
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileOpen, profileOpen])

  useEffect(() => {
    const desktopBreakpoint = window.matchMedia('(min-width: 64rem)')

    const handleBreakpointChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setMobileOpen(false)
      } else {
        setProfileOpen(false)
      }
    }

    desktopBreakpoint.addEventListener('change', handleBreakpointChange)

    return () => {
      desktopBreakpoint.removeEventListener('change', handleBreakpointChange)
    }
  }, [])

  const handleLogout = async () => {
    if (loggingOut) {
      return
    }

    setLogoutError(null)
    setLoggingOut(true)

    try {
      await authService.logout()
      closeDisclosures()
      navigate(routes.home, { replace: true })
    } catch {
      setLogoutError('Unable to log out. Please try again.')
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 lg:h-24 max-w-7xl items-center px-4 lg:px-20">
        {/* Brand */}
        <Link
          to={routes.home}
          onClick={closeDisclosures}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
        >
          <img src={capLogo} alt="" className="h-10 w-auto shrink-0 lg:h-14" />

          <div className="min-w-0 leading-tight">
            <p className=" text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">CECAS</p>
            <p className="hidden lg:block text-2xl font-semibold tracking-tight leading-tight">
              Canvas Extra Credit
              <br />
              Automation System
            </p>
          </div>
        </Link>

        <button
          ref={mobileButtonRef}
          type="button"
          onClick={() => {
            setProfileOpen(false)
            setMobileOpen((previous) => !previous)
          }}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          className="ml-3 inline-flex h-11 min-w-11 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 lg:hidden"
        >
          {mobileOpen ? 'Close' : 'Menu'}
        </button>

        <div
          className={`hidden lg:flex flex-1 items-center min-w-0 ${
            isAuthenticated ? 'justify-end gap-6' : 'justify-end'
          }`}
        >
          <nav
            aria-label="Main navigation"
            className="flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            {visibleItems.map((item) => {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={closeDisclosures}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-sm font-medium transition
                      ${
                        isActive
                          ? 'bg-sky-100 text-sky-800'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
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

          {isAuthenticated && (
            <div className="relative flex items-center gap-3 ml-4">
              <div className="hidden min-w-0 max-w-48 text-right xl:block">
                <p className="truncate text-sm font-medium text-slate-900">{accountName}</p>
                <p className="text-xs text-slate-500">{roleLabel}</p>
              </div>

              {/* Account Dropdown */}
              <div className="relative">
                <button
                  ref={accountButtonRef}
                  type="button"
                  aria-controls="desktop-account-panel"
                  aria-label={
                    profileOpen
                      ? `Close account options for ${accountName}`
                      : `Open account options for ${accountName}`
                  }
                  aria-expanded={profileOpen}
                  onClick={() => {
                    setMobileOpen(false)
                    setProfileOpen((prev) => !prev)
                  }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
                >
                  {accountInitials}
                </button>

                {profileOpen && (
                  <div
                    id="desktop-account-panel"
                    className="absolute right-0 z-20 mt-2 w-56 rounded-md border border-slate-200 bg-white shadow-lg xl:w-48"
                  >
                    <div className="border-b border-slate-200 px-4 py-3 xl:hidden">
                      <p className="break-words text-sm font-medium text-slate-900">
                        {accountName}
                      </p>

                      <p className="text-xs text-slate-500">{roleLabel}</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-inset"
                    >
                      {loggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                    {logoutError && (
                      <p role="alert" className="px-4 pb-3 text-sm text-red-700">
                        {logoutError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {mobileOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-slate-200 bg-white lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {visibleItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={closeDisclosures}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 ${
                    isActive
                      ? 'bg-sky-100 text-sky-800'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  }`
                }
              >
                {item.icon && <img src={item.icon} alt="" className="h-5 w-5 shrink-0" />}

                <span>{item.label}</span>
              </NavLink>
            ))}
            {isAuthenticated && (
              <div className="mt-3 border-t border-slate-200 pt-3">
                <div className="px-3 py-2">
                  <p className="break-words text-sm font-medium text-slate-900">{accountName}</p>

                  <p className="text-xs text-slate-500">{roleLabel}</p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full rounded-md px-3 py-3 text-left text-base font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
                >
                  {loggingOut ? 'Logging out...' : 'Logout'}
                </button>

                {logoutError && (
                  <p role="alert" className="px-3 pt-2 text-sm text-red-700">
                    {logoutError}
                  </p>
                )}
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
