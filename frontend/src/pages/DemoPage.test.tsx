// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import DemoPage from './DemoPage'

afterEach(() => {
  cleanup()
})

function renderDemoPage() {
  return render(
    <MemoryRouter>
      <DemoPage />
    </MemoryRouter>,
  )
}

const walkthroughScreens = [
  {
    alt: 'Student dashboard with semester point totals and a request table showing approved, pending, and rejected requests.',
    caption: 'Each request shows its status, point value, last update, and next available action.',
  },
  {
    alt: 'Pre-approved student request showing request details, the Chair Feedback section, and the Upload Evidence action.',
    caption: 'The Upload Evidence button makes the next step clear.',
  },
  {
    alt: 'Program chair dashboard with summary counts and a list of requests that have submitted evidence.',
    caption: 'Status tabs help the chair find requests that need attention.',
  },
  {
    alt: 'Program chair review page showing submitted image evidence, a field for awarded points, a feedback field, and Reject and Approve buttons.',
    caption: 'The final decision records the outcome, feedback, and awarded points.',
  },
]

describe('DemoPage', () => {
  it('presents page as a clean demo', () => {
    renderDemoPage()

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

    expect(screen.getByText(/presented here as a portfolio project/i)).toBeInTheDocument()
    expect(screen.getByText(/not a live university service/i)).toBeInTheDocument()
  })

  it('offers a live student path with clear demo-data guidance', () => {
    renderDemoPage()

    const studentPath = screen.getByRole('article', {
      name: 'Student: Try the Demo',
    })

    expect(
      within(studentPath).getByRole('link', {
        name: 'Register a Demo Student Account',
      }),
    ).toHaveAttribute('href', '/register')

    expect(within(studentPath).getByText('Try it yourself')).toBeInTheDocument()
    expect(
      within(studentPath).getByText(/password you do not use anywhere else/i),
    ).toBeInTheDocument()
    expect(within(studentPath).getByText(/sample information only/i)).toBeInTheDocument()
    expect(within(studentPath).getByText(/may be deleted during a reset/i)).toBeInTheDocument()
  })

  it('provides a screenshot based chair walkthrough', () => {
    renderDemoPage()

    const chairPath = screen.getByRole('article', {
      name: 'Program Chair: View the Walkthrough',
    })

    expect(within(chairPath).getByText('Screenshot walkthrough')).toBeInTheDocument()

    expect(
      within(chairPath).getByRole('heading', {
        level: 4,
        name: 'Why the Chair Demo Uses Screenshots',
      }),
    ).toBeInTheDocument()

    expect(within(chairPath).getByText(/one person to change the requests/i)).toBeInTheDocument()
    expect(within(chairPath).getByText(/no chair password is published/i)).toBeInTheDocument()

    expect(
      within(chairPath).getByRole('link', {
        name: 'View Chair Walkthrough',
      }),
    ).toHaveAttribute('href', '#chair-walkthrough')

    expect(
      within(chairPath).queryByRole('link', {
        name: /chair login/i,
      }),
    ).not.toBeInTheDocument()

    expect(chairPath.querySelector('a[href="/login"]')).toBeNull()

    expect(chairPath.querySelector('input')).toBeNull()
    expect(chairPath.querySelector('form')).toBeNull()
    expect(chairPath.querySelector('a[href^="mailto:"]')).toBeNull()
  })

  it('explains the complete request workflow in order', () => {
    renderDemoPage()

    const workflow = screen.getByRole('region', {
      name: 'Follow a Request from Start to Finish',
    })

    const steps = within(workflow).getAllByRole('listitem')

    expect(steps).toHaveLength(6)

    const stepTitles = steps.map(
      (step) => within(step).getByRole('heading', { level: 3 }).textContent,
    )

    expect(stepTitles).toEqual([
      'Register and Submit',
      'Chair Reviews the Request',
      'Receive Pre-Approval or Feedback',
      'Upload Evidence',
      'Chair Reviews the Evidence',
      'See Awarded Points',
    ])
  })

  it('describes the student and chair walkthrough screens', () => {
    renderDemoPage()

    const studentWalkthrough = screen.getByRole('region', {
      name: 'Student Walkthrough',
    })

    expect(within(studentWalkthrough).getAllByRole('article')).toHaveLength(2)

    expect(
      within(studentWalkthrough).getByRole('heading', {
        level: 3,
        name: 'Student Dashboard',
      }),
    ).toBeInTheDocument()

    expect(
      within(studentWalkthrough).getByRole('heading', {
        level: 3,
        name: 'Pre-Approved Request',
      }),
    ).toBeInTheDocument()

    const chairWalkthrough = screen.getByRole('region', {
      name: 'Program Chair Walkthrough',
    })

    expect(chairWalkthrough).toHaveAttribute('id', 'chair-walkthrough')

    expect(within(chairWalkthrough).getAllByRole('article')).toHaveLength(2)

    expect(
      within(chairWalkthrough).getByRole('heading', {
        level: 3,
        name: 'Chair Dashboard',
      }),
    ).toBeInTheDocument()

    expect(
      within(chairWalkthrough).getByRole('heading', {
        level: 3,
        name: 'Evidence Review and Decision',
      }),
    ).toBeInTheDocument()

    expect(within(studentWalkthrough).getAllByRole('figure')).toHaveLength(2)
    expect(within(chairWalkthrough).getAllByRole('figure')).toHaveLength(2)
  })

  it('describes the architecture and supporting system cards', () => {
    renderDemoPage()

    const architecture = screen.getByRole('region', {
      name: 'How CECAS Is Built',
    })

    expect(
      within(architecture).getByRole('heading', {
        name: 'React and Vite Frontend',
      }),
    ).toBeInTheDocument()

    expect(
      within(architecture).getByRole('heading', {
        name: 'Spring Boot Backend',
      }),
    ).toBeInTheDocument()

    expect(
      within(architecture).getByRole('heading', {
        name: 'MySQL Database',
      }),
    ).toBeInTheDocument()

    const primaryFlow = within(architecture).getByRole('list', {
      name: 'How the parts work together',
    })

    expect(within(primaryFlow).getAllByRole('listitem')).toHaveLength(3)

    const supportingSystemsList = within(architecture).getByRole('list', {
      name: 'Local Development Tools',
    })

    expect(within(supportingSystemsList).getAllByRole('listitem')).toHaveLength(2)

    expect(
      within(architecture).getByRole('heading', { name: 'Docker Compose' }),
    ).toBeInTheDocument()

    expect(
      within(architecture).getByRole('heading', {
        name: 'Flyway and Seed Data',
      }),
    ).toBeInTheDocument()
  })

  it('shows four accessible portfolio screenshots with visible captions', () => {
    renderDemoPage()

    expect(screen.getAllByRole('figure')).toHaveLength(4)

    for (const screenshot of walkthroughScreens) {
      const image = screen.getByRole('img', {
        name: screenshot.alt,
      })

      expect(image).toHaveAttribute('src', expect.stringMatching(/\.webp$/))
      expect(image).toHaveAttribute('loading', 'lazy')
      expect(image).toHaveAttribute('decoding', 'async')
      expect(Number(image.getAttribute('width'))).toBeGreaterThan(0)
      expect(Number(image.getAttribute('height'))).toBeGreaterThan(0)

      const screenshotLink = image.parentElement

      expect(screenshotLink).toHaveAttribute('href', image.getAttribute('src'))
      expect(screenshotLink).toHaveAttribute('target', '_blank')
      expect(screenshotLink).toHaveAttribute('rel', 'noreferrer')
      expect(screenshotLink).toHaveAccessibleName(/open full-size .+ screenshot in a new tab/i)

      expect(screen.getByText(screenshot.caption)).toBeInTheDocument()
    }
  })
})
