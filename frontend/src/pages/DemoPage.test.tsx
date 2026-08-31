// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import DemoPage from './DemoPage'

afterEach(() => {
  cleanup()
})

describe('DemoPage', () => {
  it('presents page as a clean demo', () => {
    render(<DemoPage />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Explore the CECAS Guided Demo',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getAllByRole('heading', {
        level: 1,
      }),
    ).toHaveLength(1)

    expect(screen.getByText('Team capstone · Portfolio demonstration')).toBeInTheDocument()

    expect(screen.getByText(/not a live university service/i)).toBeInTheDocument()
  })
})
