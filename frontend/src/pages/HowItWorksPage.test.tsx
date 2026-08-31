// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import HowItWorksPage from './HowItWorksPage'

afterEach(() => {
  cleanup()
})

describe('HowItWorksPage', () => {
  it('has one page heading and four ordered workflow stages', () => {
    render(<HowItWorksPage />)

    expect(
      screen.getAllByRole('heading', {
        level: 1,
      }),
    ).toHaveLength(1)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'How It Works',
      }),
    ).toBeInTheDocument()

    const stageHeadings = screen.getAllByRole('heading', {
      level: 2,
    })

    expect(stageHeadings.map((heading) => heading.textContent?.trim())).toEqual([
      '1. Submit a Request',
      '2. Chair Pre-Approval',
      '3. Submit Evidence',
      '4. Final Decision and Points',
    ])
  })

  it('explains the two chair decisions and conditional point award', () => {
    render(<HowItWorksPage />)

    expect(
      screen.getByText(/either pre-approves the request or rejects it with feedback/i),
    ).toBeInTheDocument()

    expect(screen.getByText(/the chair approves or rejects the evidence/i)).toBeInTheDocument()

    expect(
      screen.getByText(/approved requests add points to the student's CECAS total/i),
    ).toBeInTheDocument()
  })

  it('does not describe the final stage as an automatic point award', () => {
    render(<HowItWorksPage />)

    expect(
      screen.queryByRole('heading', {
        name: 'Receive Points',
      }),
    ).not.toBeInTheDocument()
  })
})
