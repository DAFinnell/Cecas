// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import PrivacyPolicyPage from './PrivacyPolicyPage'

afterEach(() => {
  cleanup()
})

describe('PrivacyPolicyPage', () => {
  it('presents privacy guidance for a portfolio demonstration', () => {
    render(<PrivacyPolicyPage />)

    expect(
      screen.getAllByRole('heading', {
        level: 1,
      }),
    ).toHaveLength(1)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Privacy and Demo Data',
      }),
    ).toBeInTheDocument()

    expect(
      screen
        .getAllByRole('heading', {
          level: 2,
        })
        .map((heading) => heading.textContent),
    ).toEqual([
      'Demonstration Use Only',
      'Do Not Use Real Credentials',
      'Data May Be Reset',
      'Not an Institutional Privacy Policy',
    ])
  })

  it('warns visitors not to enter real credentials or sensitive data', () => {
    render(<PrivacyPolicyPage />)

    expect(screen.getByText(/do not use a real password/i)).toBeInTheDocument()

    expect(screen.getByText(/do not enter sensitive personal information/i)).toBeInTheDocument()

    expect(screen.getByText(/do not rely on CECAS as permanent storage/i)).toBeInTheDocument()
  })

  it('explains that demo data may be reset or removed', () => {
    render(<PrivacyPolicyPage />)

    expect(screen.getByText(/demonstration data may be reset or removed/i)).toBeInTheDocument()
  })

  it('does not claim to be an institutional privacy policy', () => {
    render(<PrivacyPolicyPage />)

    expect(screen.getByText(/it is not a university privacy policy/i)).toBeInTheDocument()

    expect(screen.getByText(/not presented as an official university service/i)).toBeInTheDocument()

    expect(
      screen.queryByRole('heading', {
        level: 1,
        name: 'Privacy Policy',
      }),
    ).not.toBeInTheDocument()

    expect(screen.queryByText(/appropriate course instructor/i)).not.toBeInTheDocument()

    expect(screen.queryByText(/system administrator/i)).not.toBeInTheDocument()
  })
})
