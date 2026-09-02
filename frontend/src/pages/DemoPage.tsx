import { Link } from 'react-router-dom'
import { routes } from '../app/routes'

import studentDashboardScreenshot from '../assets/demo/student-dashboard.webp'
import studentRequestScreenshot from '../assets/demo/student-request.webp'
import chairDashboardScreenshot from '../assets/demo/chair-dashboard.webp'
import chairReviewScreenshot from '../assets/demo/chair-review.webp'

type WalkthroughScreen = {
  title: string
  description: string
  image: string
  alt: string
  caption: string
  width: number
  height: number
}

const workflowSteps = [
  {
    title: 'Register and Submit',
    description:
      'A student creates a demonstration account, selects a course and activity category, and describes the proposed extra credit activity.',
  },
  {
    title: 'Enter the Chair Queue',
    description:
      'The request appears in the assigned program chair’s queue for an initial eligibility review.',
  },
  {
    title: 'Receive Pre-Approval or Feedback',
    description:
      'The chair either pre-approves the activity or rejects the request with feedback explaining the decision.',
  },
  {
    title: 'Upload Evidence',
    description:
      'After pre-approval, the student uploads supporting evidence for the completed activity.',
  },
  {
    title: 'Complete Final Review',
    description:
      'The chair reviews the submitted evidence and makes a final approval or rejection decision with feedback.',
  },
  {
    title: 'Track Awarded Points',
    description:
      'An approved request records the awarded points so the student can see them in the semester total.',
  },
]

const studentWalkthrough: WalkthroughScreen[] = [
  {
    title: 'Student Dashboard',
    description:
      'The student dashboard combines semester point totals with a request list showing status, requested points, and the next available action.',
    image: studentDashboardScreenshot,
    alt: 'Student dashboard with semester point totals and a request table showing approved, pending, and rejected requests.',
    caption:
      'The student view combines point tracking with the status and next action for each request.',
    width: 1440,
    height: 720,
  },
  {
    title: 'Pre-Approved Request',
    description:
      'A pre-approved request keeps the Chair Feedback section visible and makes the Upload Evidence action available when the request is ready for the next step.',
    image: studentRequestScreenshot,
    alt: 'Pre-approved student request showing request details, the Chair Feedback section, and the Upload Evidence action.',
    caption:
      'After pre-approval, the request detail guides the student to submit supporting evidence.',
    width: 1440,
    height: 1280,
  },
]

const chairWalkthrough: WalkthroughScreen[] = [
  {
    title: 'Chair Dashboard',
    description:
      'The chair dashboard separates requests awaiting initial review from requests whose evidence is ready for a final decision.',
    image: chairDashboardScreenshot,
    alt: 'Program chair dashboard with summary counts and the Evidence Submitted review queue.',
    caption:
      'The chair dashboard separates requests by status so initial and final reviews can be handled from one queue.',
    width: 1440,
    height: 1180,
  },
  {
    title: 'Evidence Review and Decision',
    description:
      'The review page brings the request details, submitted evidence, feedback, and approval or rejection actions together in one place.',
    image: chairReviewScreenshot,
    alt: 'Program chair review page with submitted image evidence, awarded-points input, feedback field, and Reject and Approve actions.',
    caption:
      'The final review brings evidence, feedback, point assignment, and approval or rejection controls together.',
    width: 1440,
    height: 1180,
  },
]

const architectureLayers = [
  {
    label: 'Interface layer',
    title: 'React and Vite Frontend',
    description:
      'React and TypeScript provide the pages and interactions used by students and program chairs. Vite supports local development and creates the production frontend build.',
  },
  {
    label: 'Application layer',
    title: 'Spring Boot Backend',
    description:
      'Spring Boot provides the API, session-based authentication, validation, request lifecycle rules, evidence handling, chair feedback, and point decisions.',
  },
  {
    label: 'Data layer',
    title: 'MySQL Database',
    description:
      'MySQL stores accounts, course and category data, requests, workflow statuses, feedback, awarded points, and references to uploaded evidence files.',
  },
]

const supportingSystems = [
  {
    title: 'Docker Compose',
    description:
      'Docker Compose runs the local frontend, backend, and MySQL database together with the networking, health checks, environment variables, and persistent volumes they need.',
  },
  {
    title: 'Flyway and Seed Data',
    description:
      'Flyway applies versioned database schema changes when the backend starts. After the database is ready, the seed system validates and synchronizes local reference data for courses, categories, and chair assignments.',
  },
]

export default function DemoPage() {
  return (
    <section className="space-y-8">
      <header className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 sm:p-10">
        <h1 className="mt-0 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Explore the CECAS Guided Demo
        </h1>

        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          CECAS is a team-built capstone presented as a portfolio demonstration. It shows a
          completed extra credit workflow, but it is not a live university service.
        </p>
      </header>

      <section
        aria-labelledby="demo-paths-heading"
        className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
      >
        <div className="max-w-3xl">
          <h2
            id="demo-paths-heading"
            className="text-2xl font-semibold tracking-tight text-slate-950"
          >
            Choose a Demo Path
          </h2>

          <p className="mt-3 leading-7 text-slate-600">
            Choose the student path to interact with the application, or follow the protected chair
            walkthrough to see the completed review workflow.
          </p>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <article
            aria-labelledby="student-path-heading"
            className="flex h-full flex-col rounded-2xl bg-sky-50 p-6 ring-1 ring-sky-200"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">
              Interactive path
            </p>

            <h3
              id="student-path-heading"
              className="mt-3 text-xl font-semibold tracking-tight text-slate-950"
            >
              Student: Try the Live Path
            </h3>

            <p className="mt-3 leading-7 text-slate-700">
              Create a demo-only student account to submit a request and explore status tracking,
              evidence upload, chair feedback, and point totals.
            </p>

            <div className="mt-6 rounded-xl bg-white p-5 ring-1 ring-sky-200">
              <h4 className="font-semibold text-slate-950">Before You Register</h4>

              <ul
                role="list"
                className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700"
              >
                <li>Create a password only for this demonstration.</li>
                <li>Do not enter real student records or upload private files.</li>
                <li>Demo accounts, requests, and evidence may be reset at any time.</li>
              </ul>
            </div>

            <div className="mt-auto pt-6">
              <Link
                to={routes.register}
                className="inline-flex w-full items-center justify-center rounded-md bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 sm:w-auto"
              >
                Register a Demo Student Account
              </Link>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Registration is optional. The walkthrough below explains the complete workflow
                without an account.
              </p>
            </div>
          </article>

          <article
            aria-labelledby="chair-path-heading"
            className="flex h-full flex-col rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-600">
              Guided path
            </p>

            <h3
              id="chair-path-heading"
              className="mt-3 text-xl font-semibold tracking-tight text-slate-950"
            >
              Program Chair: Follow the Guided Path
            </h3>

            <p className="mt-3 leading-7 text-slate-700">
              Follow the chair workflow through written explanations and screenshots without
              receiving access to the shared chair accounts.
            </p>

            <div className="mt-6 rounded-xl bg-white p-5 ring-1 ring-slate-200">
              <h4 className="font-semibold text-slate-950">Why Chair Access Is Guided</h4>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Chair passwords are not published or shared because unrestricted access could change
                the review queues, feedback, decisions, and points shown in the demo.
              </p>
            </div>

            <div className="mt-auto pt-6">
              <a
                href="#chair-walkthrough"
                className="inline-flex w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 sm:w-auto"
              >
                View Chair Walkthrough
              </a>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                No chair account is needed. The walkthrough covers initial review, evidence review,
                feedback, approval or rejection, and awarded points.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section
        aria-labelledby="workflow-heading"
        className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
      >
        <h2 id="workflow-heading" className="text-2xl font-semibold tracking-tight text-slate-950">
          Follow the Request Workflow
        </h2>

        <p className="mt-3 max-w-3xl leading-7 text-slate-600">
          Each request moves through the same lifecycle, with clear responsibilities for the
          student, program chair, and application.
        </p>

        <ol role="list" className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workflowSteps.map((step, index) => (
            <li key={step.title} className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
                Step {index + 1}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="student-walkthrough-heading"
        className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
      >
        <h2
          id="student-walkthrough-heading"
          className="text-2xl font-semibold tracking-tight text-slate-950"
        >
          Student Walkthrough
        </h2>

        <p className="mt-3 max-w-3xl leading-7 text-slate-600">
          Visitors may try this role using a demo-only student account. The screenshots and captions
          below also explain the experience without requiring registration.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {studentWalkthrough.map((screen) => (
            <article
              key={screen.title}
              className="h-full overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-950">{screen.title}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">{screen.description}</p>
              </div>

              <figure className="mt-auto border-t border-slate-200 bg-white">
                <img
                  src={screen.image}
                  alt={screen.alt}
                  width={screen.width}
                  height={screen.height}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full"
                />

                <figcaption className="border-t border-slate-200 px-6 py-4 text-sm leading-6 text-slate-600">
                  {screen.caption}
                </figcaption>
              </figure>
            </article>
          ))}
        </div>
      </section>

      <section
        id="chair-walkthrough"
        aria-labelledby="chair-walkthrough-heading"
        className="scroll-mt-6 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
      >
        <h2
          id="chair-walkthrough-heading"
          className="text-2xl font-semibold tracking-tight text-slate-950"
        >
          Program Chair Walkthrough
        </h2>

        <p className="mt-3 max-w-3xl leading-7 text-slate-600">
          The guided chair path demonstrates both review stages while protecting the shared demo
          state from anonymous changes.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {chairWalkthrough.map((screen) => (
            <article
              key={screen.title}
              className="h-full overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-950">{screen.title}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">{screen.description}</p>
              </div>

              <figure className="mt-auto border-t border-slate-200 bg-white">
                <img
                  src={screen.image}
                  alt={screen.alt}
                  width={screen.width}
                  height={screen.height}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full"
                />

                <figcaption className="border-t border-slate-200 px-6 py-4 text-sm leading-6 text-slate-600">
                  {screen.caption}
                </figcaption>
              </figure>
            </article>
          ))}
        </div>

        <p className="mt-6 max-w-3xl leading-7 text-slate-600">
          Together, these screenshots and captions demonstrate queue review, pre-approval, evidence
          review, approval or rejection, written feedback, and awarded-point tracking.
        </p>
      </section>

      <section
        aria-labelledby="architecture-heading"
        className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
      >
        <h2 id="architecture-heading" className="text-2xl font-semibold text-slate-950">
          How CECAS Is Built
        </h2>

        <p className="mt-3 max-w-3xl leading-7 text-slate-600">
          CECAS separates the user interface, application rules, and stored data so each part of the
          system has a clear responsibility.
        </p>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">
          Primary application flow
        </p>
        <ol
          aria-label="Primary application flow"
          role="list"
          className="mt-4 grid gap-4 md:grid-cols-3"
        >
          {architectureLayers.map((layer, index) => (
            <li key={layer.title}>
              <article className="h-full rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <p className="text-sm font-semibold text-sky-700">
                  {index + 1}. {layer.label}
                </p>

                <h3 className="mt-2 text-lg font-semibold text-slate-950">{layer.title}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">{layer.description}</p>
              </article>
            </li>
          ))}
        </ol>

        <div className="mt-8 border-t border-slate-200 pt-8">
          <h3 id="supporting-systems-heading" className="text-xl font-semibold text-slate-950">
            Supporting Development Systems
          </h3>

          <p className="mt-2 max-w-3xl leading-7 text-slate-600">
            These tools make the local environment and database setup repeatable, but they are not
            additional layers in the application request flow.
          </p>
        </div>

        <ul
          aria-labelledby="supporting-systems-heading"
          role="list"
          className="mt-5 grid gap-4 md:grid-cols-2"
        >
          {supportingSystems.map((system) => (
            <li key={system.title} className="rounded-2xl bg-sky-50 p-5 ring-1 ring-sky-200">
              <h4 className="font-semibold text-slate-950">{system.title}</h4>

              <p className="mt-2 text-sm leading-6 text-slate-700">{system.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </section>
  )
}
