// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import {
  cleanup,
  render,
  screen,
  within,
} from '@testing-library/react'
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom'
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import AppLayout from './AppLayout'

vi.mock('../components/Navbar', () => ({
  default: () => (
    <nav aria-label='Test navigation'>
      Navigation
    </nav>
  ),
}))

vi.mock('../components/Footer', () => ({
  default: () => <footer>Footer</footer>
}))

afterEach(() => {
  cleanup()
})

describe('AppLayout', () => {
  it('connects the skip link to the main content', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<button>Page action</button>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const skipLink = screen.getByRole('link', {
      name: 'Skip to main content',
    })

    expect(skipLink).toHaveAttribute('href', '#main-content')

    const mainContent = screen.getByRole('main')

    expect(mainContent).toHaveAttribute('id', 'main-content')
    expect(mainContent).toHaveAttribute('tabindex', '-1')

    expect(
      within(mainContent).getByRole('button', {
        name: 'Page action',
      }),
    ).toBeInTheDocument()
  })
})
