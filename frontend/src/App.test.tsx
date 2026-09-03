// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App, { RootPage } from './App'
import { useCurrentUser } from './hooks/useCurrentUser'
import type { CurrentUserResponse } from './types/auth.types'

vi.mock('./hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}))

vi.mock('./components/CsrfInitializer', () => ({
  default: () => null,
}))

vi.mock('./components/Navbar', () => ({
  default: () => <nav aria-label="Test navigation">Navigation</nav>,
}))

vi.mock('./components/Footer', () => ({
  default: () => <footer>Footer</footer>,
}))

vi.mock('./pages/DebugPage', () => ({
  default: () => <h1>Development Debug Page</h1>,
}))

const anonymousUser: CurrentUserResponse = {
  authenticated: false,
  email: null,
  role: null,
  mustChangePassword: false,
}

beforeEach(() => {
  vi.clearAllMocks()

  vi.mocked(useCurrentUser).mockReturnValue({
    user: anonymousUser,
    loading: false,
  })
})

afterEach(() => {
  cleanup()
})

function renderApp(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App', () => {
  it('announces the root authentication-loading state', () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      user: anonymousUser,
      loading: true,
    })

    render(<RootPage />)

    const status = screen.getByRole('status')

    expect(status).toHaveTextContent('Loading CECAS...')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveAttribute('aria-atomic', 'true')
    expect(status.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('makes the debug route available during development', () => {
    renderApp('/debug')

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Development Debug Page',
      }),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('heading', {
        level: 1,
        name: '404 Not Found',
      }),
    ).not.toBeInTheDocument()
  })

  it('makes the guided demo publicly available', () => {
    renderApp('/demo')

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Explore the CECAS Guided Demo',
      }),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('heading', {
        level: 1,
        name: '404 Not Found',
      }),
    ).not.toBeInTheDocument()
  })
})
