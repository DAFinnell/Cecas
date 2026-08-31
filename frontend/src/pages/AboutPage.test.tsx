// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import AboutPage from './AboutPage'

afterEach(() => {
  cleanup()
})

describe('AboutPage', () => {
  it('explains the problem and completed workflow', () => {
    render(<AboutPage />)

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'The Problem',
      }),
    ).toBeInTheDocument()

    expect(screen.getByText(/details, evidence, feedback, and decisions/i)).toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'The Completed Workflow',
      }),
    ).toBeInTheDocument()

    expect(screen.getByText(/upload evidence after chair pre-approval/i)).toBeInTheDocument()

    expect(screen.getByText(/final approval or rejection decision/i)).toBeInTheDocument()

    expect(screen.getByText(/approved points are tracked in CECAS/i)).toBeInTheDocument()
  })

  it('describes the frontend, backend, and database architecture', () => {
    render(<AboutPage />)

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'How It Is Built',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Frontend',
      }),
    ).toBeInTheDocument()

    expect(screen.getByText(/React and TypeScript provide/i)).toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Backend',
      }),
    ).toBeInTheDocument()

    expect(screen.getByText(/Spring Boot provides the API/i)).toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Database',
      }),
    ).toBeInTheDocument()

    expect(screen.getByText(/MySQL stores the application's records/i)).toBeInTheDocument()

    expect(screen.getByText(/Flyway keeps database changes organized/i)).toBeInTheDocument()
  })

  it('credits the team and explains the portfolio context', () => {
    render(<AboutPage />)

    expect(screen.getByText(/created by a six-student team/i)).toBeInTheDocument()

    expect(screen.getByText(/shared in Derek Finnell's portfolio/i)).toBeInTheDocument()

    expect(screen.getByText(/not a university service/i)).toBeInTheDocument()

    expect(
      screen.getByRole('link', {
        name: 'View Project Source',
      }),
    ).toHaveAttribute('href', 'https://github.com/DAFinnell/Cecas')
  })

  it('uses a logical heading structure', () => {
    render(<AboutPage />)

    expect(
      screen.getAllByRole('heading', {
        level: 1,
      }),
    ).toHaveLength(1)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'About CECAS',
      }),
    ).toBeInTheDocument()

    expect(
      screen
        .getAllByRole('heading', {
          level: 2,
        })
        .map((heading) => heading.textContent),
    ).toEqual([
      'The Problem',
      'The Completed Workflow',
      'How It Is Built',
      'A Team Capstone and Portfolio Project',
    ])
  })

  it('does not contain the previous institutional language', () => {
    render(<AboutPage />)

    expect(
      screen.queryByRole('heading', {
        name: 'Our Mission',
      }),
    ).not.toBeInTheDocument()

    expect(screen.queryByText(/across academic departments/i)).not.toBeInTheDocument()

    expect(screen.queryByText(/departmental metrics/i)).not.toBeInTheDocument()

    expect(screen.queryByText(/in real time/i)).not.toBeInTheDocument()
  })
})
