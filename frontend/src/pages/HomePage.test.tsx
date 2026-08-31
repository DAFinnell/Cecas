// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import HomePage from './HomePage'

afterEach(() => {
  cleanup()
})

function renderHomePage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )
}

describe('HomePage', () => {
  it('presents CECAS as a completed team-capstone portfolio demonstration', () => {
    renderHomePage()

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'A complete extra credit request workflow.',
      }),
    ).toBeInTheDocument()

    expect(screen.getByText(/team-built capstone and portfolio demonstration/i)).toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Completed request workflow',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Student Submission',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Chair Pre-Approval',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Evidence Submission',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Final Decision and Points',
      }),
    ).toBeInTheDocument()
  })

  it('uses the approved public calls to action', () => {
    renderHomePage()

    expect(
      screen.getByRole('link', {
        name: 'How It Works',
      }),
    ).toHaveAttribute('href', '/how-it-works')

    expect(
      screen.getByRole('link', {
        name: 'View Project Source',
      }),
    ).toHaveAttribute('href', 'https://github.com/DAFinnell/Cecas')
  })

  it('does not present authentication or a guided demo as its main calls to action', () => {
    renderHomePage()

    expect(
      screen.queryByRole('link', {
        name: 'Register as Student',
      }),
    ).not.toBeInTheDocument()

    expect(
      screen.queryByRole('link', {
        name: 'Student Login',
      }),
    ).not.toBeInTheDocument()

    expect(
      screen.queryByRole('link', {
        name: 'Program Chair Login',
      }),
    ).not.toBeInTheDocument()

    expect(
      screen.queryByRole('link', {
        name: 'View Demo',
      }),
    ).not.toBeInTheDocument()
  })

  it('does not describe the chair workflow as unfinished', () => {
    renderHomePage()

    expect(screen.queryByText(/once the chair workflow is connected/i)).not.toBeInTheDocument()
  })

  it('has one page heading and accurate logo alternative text', () => {
    renderHomePage()

    expect(
      screen.getAllByRole('heading', {
        level: 1,
      }),
    ).toHaveLength(1)

    expect(
      screen.getByRole('img', {
        name: 'CECAS graduation cap and books logo',
      }),
    ).toBeInTheDocument()
  })
})
