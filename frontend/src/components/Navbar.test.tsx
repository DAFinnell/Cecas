// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
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
import { useCurrentUser } from '../hooks/useCurrentUser'
import type { CurrentUserResponse } from '../types/auth.types'

vi.mock('../hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}))

const anonymousUser: CurrentUserResponse = {
  authenticated: false,
  email: null,
  role: null,
  mustChangePassword: false,
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

beforeEach(() => {
  vi.clearAllMocks()
  installMatchMediaStub()

  vi.mocked(useCurrentUser).mockReturnValue({
    user: anonymousUser,
    loading: false,
  })
})

afterEach(() => {
  cleanup()
})

describe('Navbar', () => {
  it('opens mobile navigation for an anonymous user', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>,
    )

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
