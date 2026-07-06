import { NavLink, useNavigate } from 'react-router-dom'
import { useCurrentUser } from '../hooks/useCurrentUser'
import CreateNewRequestIcon from '../assets/CreateNewRequest.svg'
import HomeIcon from '../assets/Home.svg'
import DashboardIcon from '../assets/Dashboard.svg'
import ListIcon from '../assets/List.svg'
import LoginIcon from '../assets/Login.svg'
import RegisterIcon from '../assets/Register.svg'
import HowItWorksIcon from '../assets/HowItWorks.svg'
import LogoutIcon from '../assets/Logout.svg'
import authService from '../services/AuthService'
import { useState } from 'react'

const navItems = [
  { to: '/', label: 'Home', end: true, icon : HomeIcon },
  { to: '/how-it-works', label: 'How It Works', roles: ['ANONYMOUS'], icon: HowItWorksIcon },
  { to: '/login', label: 'Login', roles: ['ANONYMOUS'], icon: LoginIcon },
  { to: '/register', label: 'Register', roles: ['ANONYMOUS'], icon: RegisterIcon },
  { to: '/student-dashboard', label: 'Dashboard', roles: ['STUDENT'], icon: DashboardIcon },
  { to: '/chair-dashboard', label: 'Dashboard', roles: ['CHAIR'], icon: DashboardIcon },
  { to: '/my-requests', label: 'My Requests', roles: ['STUDENT'], icon: ListIcon },
  { to: '/create-request', label: 'Create New Request', roles: ['STUDENT'], icon: CreateNewRequestIcon },
  { to: '/logout', label:'Logout', roles: ['STUDENT','CHAIR'], icon: LogoutIcon}
]

export default function Navbar() {
  const { user } = useCurrentUser()
  const isAuthenticated = !!user?.authenticated
  const role = user?.role
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const visibleItems = navItems.filter((item) => {
    if (!item.roles) {
      return true
    }
    if (item.roles.includes('ANONYMOUS')) {
      return !isAuthenticated
    }
    return isAuthenticated && role && item.roles.includes(role)
  })


  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">
            CECAS
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Canvas Extra Credit Automation System
          </h1>
        </div>
        <nav aria-label="Main navigation" className="flex flex-wrap gap-2">
        {visibleItems.map((item) => {
            if (item.to === '/logout') {
              return (
                <button
                  key="logout"
                  onClick={async () => {
                    if (loggingOut) return
                    try {
                      setLoggingOut(true)
                      await authService.logout()
                      navigate('/')
                    } catch (e) {
                      // optionally show error
                    } finally {
                      setLoggingOut(false)
                    }
                  }}
                  disabled={loggingOut}
                  className="rounded-md px-3 py-2 text-sm font-medium transition text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                >
                  {item.icon ? <img src={item.icon} alt="" className="inline-block h-4 w-4 mr-2 align-text-bottom" /> : null}
                  {loggingOut ? 'Logging out…' : item.label}
                </button>
              )
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-sky-100 text-sky-800'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  }`
                }
              >
                {item.icon ? <img src={item.icon} alt="" className="inline-block h-4 w-4 mr-2 align-text-bottom" /> : null}
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

