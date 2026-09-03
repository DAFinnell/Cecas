// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import Footer from './Footer'

afterEach(() => {
  cleanup()
})

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  )
}

describe('Footer', () => {
  it('identifies CECAS as a team-capstone portfolio demonstration', () => {
    renderFooter()

    expect(
      screen.getByText(/CECAS is a team capstone and portfolio demonstration/i),
    ).toBeInTheDocument()

    expect(screen.getByText('© 2026 CECAS')).toBeInTheDocument()
  })

  it('uses the correct public navigation links', () => {
    renderFooter()

    expect(
      screen.getByRole('link', {
        name: 'Guided Demo',
      }),
    ).toHaveAttribute('href', '/demo')

    expect(
      screen.getByRole('link', {
        name: 'About',
      }),
    ).toHaveAttribute('href', '/about')

    expect(
      screen.getByRole('link', {
        name: 'Contact',
      }),
    ).toHaveAttribute('href', '/contact')

    expect(
      screen.getByRole('link', {
        name: 'Privacy and Demo Data',
      }),
    ).toHaveAttribute('href', '/privacy-policy')

    expect(
      screen.getByRole('link', {
        name: 'Project Source',
      }),
    ).toHaveAttribute('href', 'https://github.com/DAFinnell/Cecas')
  })
})
