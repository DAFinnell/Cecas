// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Navbar from './Navbar'

import UserService from '../services/UserService'
import authService from '../services/AuthService'
import { useCurrentUser } from '../hooks/useCurrentUser'

import type { UserProfileResponse } from '../types/user.types'
import type { CurrentUserResponse } from '../types/auth.types'

vi.mock('../hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}))

vi.mock('../services/UserService', () => ({
  default: {
    getUserProfile: vi.fn(),
  },
}))

vi.mock('../services/AuthService', () => ({
  default: {
    logout: vi.fn(),
  },
}))

const anonymousUser: CurrentUserResponse = {
  authenticated: false,
  email: null,
  role: null,
  mustChangePassword: false,
}

const studentUser: CurrentUserResponse = {
  authenticated: true,
  email: 'derek@derek.com',
  role: 'STUDENT',
  mustChangePassword: false,
}

const chairUser: CurrentUserResponse = {
  authenticated: true,
  email: 'alan.turing@email.franklin.edu',
  role: 'CHAIR',
  mustChangePassword: false,
}

const forcedChairUser: CurrentUserResponse = {
  ...chairUser,
  mustChangePassword: true,
}

const studentProfile: UserProfileResponse = {
  email: 'derek@derek.com',
  fullName: 'Derek Student',
  role: 'STUDENT',
}

const chairProfile: UserProfileResponse = {
  email: 'alan.turing@email.franklin.edu',
  fullName: 'Alan Turing',
  role: 'CHAIR',
}

const longNameProfile: UserProfileResponse = {
  email: 'derek@derek.com',
  fullName: 'Derek Bartholomew Simpson-Studentprofile',
  role: 'STUDENT',
}

type MatchMediaController = {
  dispatchChange: (matches: boolean) => void
}

function installMatchMediaStub() {
  let changeListener: ((event: MediaQueryListEvent) => void) | undefined

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(
        (eventType: string, listener: (event: MediaQueryListEvent) => void) => {
          if (eventType === 'change') {
            changeListener = listener
          }
        },
      ),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  return {
    dispatchChange(matches: boolean) {
      changeListener?.({
        matches,
        media: '(min-width: 64rem)',
      } as MediaQueryListEvent)
    },
  }
}

function mockCurrentUser(currentUser: CurrentUserResponse) {
  vi.mocked(useCurrentUser).mockReturnValue({
    user: currentUser,
    loading: false,
  })
}

function LocationProbe() {
  const location = useLocation()

  return <output aria-label="Current path">{location.pathname}</output>
}

function renderNavbar(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navbar />
      <LocationProbe />
    </MemoryRouter>,
  )
}

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void

  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return {
    promise,
    resolve,
    reject,
  }
}

let matchMediaController: MatchMediaController

beforeEach(() => {
  vi.clearAllMocks()
  matchMediaController = installMatchMediaStub()

  mockCurrentUser(anonymousUser)

  vi.mocked(UserService.getUserProfile).mockResolvedValue(studentProfile)
  vi.mocked(authService.logout).mockResolvedValue(undefined)
})

afterEach(() => {
  cleanup()
})

describe('Navbar', () => {
  it('opens correct mobile navigation for an anonymous user', async () => {
    const actor = userEvent.setup()

    renderNavbar()

    const menuButton = screen.getByRole('button', {
      name: 'Open navigation',
    })

    expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    expect(
      screen.queryByRole('navigation', {
        name: 'Mobile navigation',
      }),
    ).not.toBeInTheDocument()

    expect(
      screen.queryByRole('link', {
        name: 'Guided Demo',
      }),
    ).not.toBeInTheDocument()

    await actor.click(menuButton)

    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    const mobileNavigation = screen.getByRole('navigation', {
      name: 'Mobile navigation',
    })

    const mobile = within(mobileNavigation)

    expect(mobile.getByRole('link', { name: 'Home' })).toBeInTheDocument()

    expect(mobile.getByRole('link', { name: 'How It Works' })).toBeInTheDocument()

    expect(mobile.getByRole('link', { name: 'Login' })).toBeInTheDocument()

    expect(mobile.getByRole('link', { name: 'Register' })).toBeInTheDocument()

    expect(mobile.queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument()

    expect(mobile.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Close navigation',
      }),
    ).toBe(menuButton)
  })

  it('opens correct mobile navigation for a Student user', async () => {
    const actor = userEvent.setup()

    mockCurrentUser(studentUser)
    vi.mocked(UserService.getUserProfile).mockResolvedValue(studentProfile)

    renderNavbar()

    await screen.findByRole('button', {
      name: /open account options for Derek Student/i,
    })

    const menuButton = screen.getByRole('button', {
      name: 'Open navigation',
    })

    await actor.click(menuButton)

    const mobileNavigation = screen.getByRole('navigation', {
      name: 'Mobile navigation',
    })

    const mobile = within(mobileNavigation)

    expect(mobile.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(mobile.getByRole('link', { name: 'My Requests' })).toBeInTheDocument()
    expect(mobile.getByRole('link', { name: 'Create New Request' })).toBeInTheDocument()
    expect(mobile.getByRole('button', { name: 'Logout' })).toBeInTheDocument()

    expect(mobile.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument()
  })

  it('opens correct mobile navigation for a normal Chair user', async () => {
    const actor = userEvent.setup()

    mockCurrentUser(chairUser)
    vi.mocked(UserService.getUserProfile).mockResolvedValue(chairProfile)

    renderNavbar()

    await screen.findByRole('button', {
      name: /open account options for Alan Turing/i,
    })

    const menuButton = screen.getByRole('button', {
      name: 'Open navigation',
    })

    await actor.click(menuButton)

    const mobileNavigation = screen.getByRole('navigation', {
      name: 'Mobile navigation',
    })

    const mobile = within(mobileNavigation)

    expect(mobile.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(mobile.getByRole('button', { name: 'Logout' })).toBeInTheDocument()

    expect(mobile.queryByRole('link', { name: 'My Requests' })).not.toBeInTheDocument()
    expect(mobile.queryByRole('link', { name: 'Create New Request' })).not.toBeInTheDocument()
    expect(mobile.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument()
  })

  it('opens correct mobile navigation for a chair that needs to force change password', async () => {
    const actor = userEvent.setup()

    mockCurrentUser(forcedChairUser)
    vi.mocked(UserService.getUserProfile).mockResolvedValue(chairProfile)

    renderNavbar()

    await screen.findByRole('button', {
      name: /open account options for Alan Turing/i,
    })

    const menuButton = screen.getByRole('button', {
      name: 'Open navigation',
    })

    await actor.click(menuButton)

    const mobileNavigation = screen.getByRole('navigation', {
      name: 'Mobile navigation',
    })

    const mobile = within(mobileNavigation)

    expect(mobile.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument()
    expect(mobile.queryByRole('link', { name: 'My Requests' })).not.toBeInTheDocument()
    expect(mobile.queryByRole('link', { name: 'Create New Request' })).not.toBeInTheDocument()

    expect(mobile.queryByRole('link', { name: /change password/i })).not.toBeInTheDocument()

    expect(mobile.getByRole('button', { name: 'Logout' })).toBeInTheDocument()
  })

  it('link selection closes the mobile menu', async () => {
    const actor = userEvent.setup()

    renderNavbar()

    const menuButton = screen.getByRole('button', {
      name: 'Open navigation',
    })

    await actor.click(menuButton)

    const mobileNavigation = screen.getByRole('navigation', {
      name: 'Mobile navigation',
    })

    const howItWorksLink = within(mobileNavigation).getByRole('link', {
      name: 'How It Works',
    })

    await actor.click(howItWorksLink)

    expect(screen.getByLabelText('Current path')).toHaveTextContent('/how-it-works')

    expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).not.toBeInTheDocument()

    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    expect(menuButton).toHaveAccessibleName('Open navigation')
  })

  it('escape closes the mobile menu and restores focus', async () => {
    const actor = userEvent.setup()

    renderNavbar()

    const menuButton = screen.getByRole('button', {
      name: 'Open navigation',
    })

    await actor.click(menuButton)

    const mobileNavigation = screen.getByRole('navigation', {
      name: 'Mobile navigation',
    })

    const firstLink = within(mobileNavigation).getByRole('link', {
      name: 'Home',
    })

    firstLink.focus()
    expect(firstLink).toHaveFocus()

    await actor.keyboard('{Escape}')

    expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).not.toBeInTheDocument()

    expect(menuButton).toHaveFocus()
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('escape closes the desktop account menu', async () => {
    const actor = userEvent.setup()

    mockCurrentUser(studentUser)
    vi.mocked(UserService.getUserProfile).mockResolvedValue(studentProfile)

    renderNavbar()

    const accountButton = await screen.findByRole('button', {
      name: /open account options for Derek Student/i,
    })

    expect(accountButton).toHaveAttribute('aria-expanded', 'false')

    await actor.click(accountButton)

    expect(accountButton).toHaveAttribute('aria-expanded', 'true')
    expect(accountButton).toHaveAccessibleName('Close account options for Derek Student')

    const logoutButton = screen.getByRole('button', {
      name: 'Logout',
    })

    expect(logoutButton).toBeInTheDocument()

    logoutButton.focus()
    expect(logoutButton).toHaveFocus()

    await actor.keyboard('{Escape}')

    expect(
      screen.queryByRole('button', {
        name: 'Logout',
      }),
    ).not.toBeInTheDocument()

    expect(accountButton).toHaveAttribute('aria-expanded', 'false')
    expect(accountButton).toHaveAccessibleName('Open account options for Derek Student')
    expect(accountButton).toHaveFocus()
  })

  it('uses the authenticated email when the profile request fails', async () => {
    const actor = userEvent.setup()

    mockCurrentUser(studentUser)

    vi.mocked(UserService.getUserProfile).mockRejectedValue(new Error('Profile unavailable'))

    renderNavbar()

    await waitFor(() => {
      expect(UserService.getUserProfile).toHaveBeenCalledTimes(1)
    })

    const accountButton = screen.getByRole('button', {
      name: 'Open account options for derek@derek.com',
    })

    expect(accountButton).toBeInTheDocument()
    expect(accountButton).toHaveTextContent('D')

    await actor.click(accountButton)

    expect(accountButton).toHaveAttribute('aria-expanded', 'true')

    const logoutButton = screen.getByRole('button', {
      name: 'Logout',
    })

    expect(logoutButton).toBeInTheDocument()
    expect(logoutButton).toBeEnabled()
  })

  it('displays initials for a user with a long full name', async () => {
    mockCurrentUser(studentUser)

    vi.mocked(UserService.getUserProfile).mockResolvedValue(longNameProfile)

    renderNavbar()

    const accountButton = await screen.findByRole('button', {
      name: `Open account options for ${longNameProfile.fullName}`,
    })

    expect(accountButton).toHaveTextContent(/^DB$/)

    expect(accountButton).toHaveAccessibleName(
      `Open account options for ${longNameProfile.fullName}`,
    )
  })

  it('disables logout while pending and closes the menu after success', async () => {
    const actor = userEvent.setup()

    mockCurrentUser(studentUser)

    vi.mocked(UserService.getUserProfile).mockResolvedValue(studentProfile)

    const logoutRequest = createDeferred<void>()

    vi.mocked(authService.logout).mockReturnValue(logoutRequest.promise)

    renderNavbar()

    await screen.findByRole('button', {
      name: /open account options for Derek Student/i,
    })

    const menuButton = screen.getByRole('button', {
      name: 'Open navigation',
    })
    await actor.click(menuButton)

    const mobileNavigation = screen.getByRole('navigation', {
      name: 'Mobile navigation',
    })

    const logoutButton = within(mobileNavigation).getByRole('button', {
      name: 'Logout',
    })

    await actor.click(logoutButton)

    expect(authService.logout).toHaveBeenCalledTimes(1)

    const pendingLogoutButton = within(mobileNavigation).getByRole('button', {
      name: 'Logging out...',
    })

    expect(pendingLogoutButton).toBe(logoutButton)
    expect(pendingLogoutButton).toBeDisabled()

    expect(mobileNavigation).toBeInTheDocument()
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    await act(async () => {
      logoutRequest.resolve()
      await logoutRequest.promise
    })

    await waitFor(() => {
      expect(
        screen.queryByRole('navigation', { name: 'Mobile navigation' }),
      ).not.toBeInTheDocument()
    })
  })

  it('failed logout does not log the user out', async () => {
    const actor = userEvent.setup()

    mockCurrentUser(studentUser)

    vi.mocked(UserService.getUserProfile).mockResolvedValue(studentProfile)

    vi.mocked(authService.logout).mockRejectedValue(new Error('Network unavailable'))

    renderNavbar()

    await screen.findByRole('button', {
      name: /open account options for Derek Student/i,
    })

    const menuButton = screen.getByRole('button', {
      name: 'Open navigation',
    })
    await actor.click(menuButton)

    const mobileNavigation = screen.getByRole('navigation', {
      name: 'Mobile navigation',
    })

    const logoutButton = within(mobileNavigation).getByRole('button', {
      name: 'Logout',
    })

    await actor.click(logoutButton)

    const alert = await within(mobileNavigation).findByRole('alert')

    expect(authService.logout).toHaveBeenCalledTimes(1)
    expect(alert).toHaveTextContent(/unable to log out/i)
    expect(mobileNavigation).toBeInTheDocument()
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    expect(logoutButton).toBeInTheDocument()
    expect(logoutButton).toBeEnabled()
    expect(logoutButton).toHaveAccessibleName('Logout')
    expect(
      within(mobileNavigation).queryByRole('button', {
        name: 'Logging out...',
      }),
    ).not.toBeInTheDocument()
  })

  it('closes the mobile menu when the viewport enters the desktop breakpoint', async () => {
    const actor = userEvent.setup()

    renderNavbar()

    const menuButton = screen.getByRole('button', {
      name: 'Open navigation',
    })
    await actor.click(menuButton)

    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    expect(
      screen.getByRole('navigation', {
        name: 'Mobile navigation',
      }),
    ).toBeInTheDocument()

    act(() => {
      matchMediaController.dispatchChange(true)
    })

    expect(
      screen.queryByRole('navigation', {
        name: 'Mobile navigation',
      }),
    ).not.toBeInTheDocument()

    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    expect(menuButton).toHaveAccessibleName('Open navigation')
  })
})
