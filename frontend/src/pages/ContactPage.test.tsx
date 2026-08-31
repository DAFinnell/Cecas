// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import ContactPage from './ContactPage'

afterEach(() => {
  cleanup()
})

describe('ContactPage', () => {
  it('presents Contact as a portfolio-project page', () => {
    render(<ContactPage />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Contact and Project Links',
      }),
    ).toBeInTheDocument()

    expect(screen.getByText(/there is no support department or service desk/i)).toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Project Links',
      }),
    ).toBeInTheDocument()
  })

  it('uses the approved external links', () => {
    render(<ContactPage />)

    expect(
      screen.getByRole('link', {
        name: /dafinnell\.com/i,
      }),
    ).toHaveAttribute('href', 'https://dafinnell.com')

    expect(
      screen.getByRole('link', {
        name: /DAFinnell on GitHub/i,
      }),
    ).toHaveAttribute('href', 'https://github.com/DAFinnell')

    expect(
      screen.getByRole('link', {
        name: /CECAS project source on GitHub/i,
      }),
    ).toHaveAttribute('href', 'https://github.com/DAFinnell/Cecas')
  })

  it('does not contain a contact form or submit button', () => {
    const { container } = render(<ContactPage />)

    expect(container.querySelector('form')).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
