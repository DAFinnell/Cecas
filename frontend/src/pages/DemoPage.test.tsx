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

    expect(screen.getByText(/presented as a portfolio demonstration/i)).toBeInTheDocument()
    expect(screen.getByText(/not a live university service/i)).toBeInTheDocument()
  })

  it('offers a live student path with clear demo-data guidance', () => {
    renderDemoPage()

    const studentPath = screen.getByRole('article', {
      name: 'Student: Try the Live Path',
    })

    expect(within(studentPath).getByText('Interactive path')).toBeInTheDocument()

    expect(
      within(studentPath).getByRole('link', {
        name: 'Register a Demo Student Account',
      }),
    ).toHaveAttribute('href', '/register')

    expect(
      within(studentPath).getByText(/password only for this demonstration/i),
    ).toBeInTheDocument()

    expect(within(studentPath).getByText(/do not enter real student records/i)).toBeInTheDocument()

    expect(within(studentPath).getByText(/may be reset/i)).toBeInTheDocument()

    expect(within(studentPath).getByText(/registration is optional/i)).toBeInTheDocument()
  })

  it('provides a protected chair walkthrough', () => {
    renderDemoPage()

    const chairPath = screen.getByRole('article', {
      name: 'Program Chair: Follow the Guided Path',
    })

    expect(within(chairPath).getByText('Guided path')).toBeInTheDocument()

    expect(
      within(chairPath).getByText(/without receiving access to the shared chair account/i),
    ).toBeInTheDocument()

    expect(
      within(chairPath).getByRole('heading', {
        level: 4,
        name: 'Why Chair Access Is Guided',
      }),
    ).toBeInTheDocument()

    expect(
      within(chairPath).getByText(/chair passwords are not published or shared/i),
    ).toBeInTheDocument()

    expect(within(chairPath).getByText(/could change the review queues/i)).toBeInTheDocument()

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
      name: 'Follow the Request Workflow',
    })

    const steps = within(workflow).getAllByRole('listitem')

    expect(steps).toHaveLength(6)

    expect(
      within(workflow).getByRole('heading', {
        level: 3,
        name: 'Register and Submit',
      }),
    ).toBeInTheDocument()

    expect(
      within(workflow).getByRole('heading', {
        level: 3,
        name: 'Enter the Chair Queue',
      }),
    ).toBeInTheDocument()

    expect(
      within(workflow).getByRole('heading', {
        level: 3,
        name: 'Receive Pre-Approval or Feedback',
      }),
    ).toBeInTheDocument()

    expect(
      within(workflow).getByRole('heading', {
        level: 3,
        name: 'Upload Evidence',
      }),
    ).toBeInTheDocument()

    expect(
      within(workflow).getByRole('heading', {
        level: 3,
        name: 'Complete Final Review',
      }),
    ).toBeInTheDocument()

    expect(
      within(workflow).getByRole('heading', {
        level: 3,
        name: 'Track Awarded Points',
      }),
    ).toBeInTheDocument()

    const stepTitles = steps.map(
      (step) => within(step).getByRole('heading', { level: 3 }).textContent,
    )

    expect(stepTitles).toEqual([
      'Register and Submit',
      'Enter the Chair Queue',
      'Receive Pre-Approval or Feedback',
      'Upload Evidence',
      'Complete Final Review',
      'Track Awarded Points',
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

    expect(
      within(chairWalkthrough).getByText(/queue review, pre-approval, evidence review/i),
    ).toBeInTheDocument()
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
      name: 'Primary application flow',
    })

    expect(within(primaryFlow).getAllByRole('listitem')).toHaveLength(3)

    const supportingSystemsList = within(architecture).getByRole('list', {
      name: 'Supporting Development Systems',
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
})
