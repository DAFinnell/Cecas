// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
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
function installMatchMediaStub() {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

function mockCurrentUser(currentUser: CurrentUserResponse) {
  vi.mocked(useCurrentUser).mockReturnValue({
    user: currentUser,
    loading: false,
  })
}

function renderNavbar(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navbar />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  installMatchMediaStub()

  mockCurrentUser(anonymousUser)

  vi.mocked(UserService.getUserProfile).mockResolvedValue(studentProfile)
  vi.mocked(authService.logout).mockResolvedValue(undefined)
})

afterEach(() => {
  cleanup()
})

describe('Navbar', () => {
  it('opens mobile navigation for an anonymous user', async () => {
    const user = userEvent.setup()

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

    await user.click(menuButton)

    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    const mobileNavigation = screen.getByRole('navigation', {
      name: 'Mobile navigation',
    })

    expect(mobileNavigation).toBeInTheDocument()

    expect(
      within(mobileNavigation).getByRole('link', {
        name: 'Home',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Close navigation',
      }),
    ).toBe(menuButton)
  })
})
