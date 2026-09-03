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
      'A student creates a demo account, chooses a course and activity, and explains what they plan to do.',
  },
  {
    title: 'Chair Reviews the Request',
    description:
      'The request is sent to the program chair, who checks whether the activity qualifies.',
  },
  {
    title: 'Receive Pre-Approval or Feedback',
    description: 'The chair either pre-approves the request or rejects it with an explanation.',
  },
  {
    title: 'Upload Evidence',
    description:
      'If the request is pre-approved, the student uploads a file showing that they completed the activity.',
  },
  {
    title: 'Chair Reviews the Evidence',
    description:
      'The chair reviews the uploaded evidence, leaves feedback, and approves or rejects the request.',
  },
  {
    title: 'See Awarded Points',
    description:
      'When a request is approved, the awarded points are added to the student’s semester total.',
  },
]

const studentWalkthrough: WalkthroughScreen[] = [
  {
    title: 'Student Dashboard',
    description:
      'The dashboard shows the student’s semester point total and all requests in one place.',
    image: studentDashboardScreenshot,
    alt: 'Student dashboard with semester point totals and a request table showing approved, pending, and rejected requests.',
    caption: 'Each request shows its status, point value, last update, and next available action.',
    width: 1440,
    height: 720,
  },
  {
    title: 'Pre-Approved Request',
    description:
      'Once a request is pre-approved, the student can review any chair feedback and upload evidence.',
    image: studentRequestScreenshot,
    alt: 'Pre-approved student request showing request details, the Chair Feedback section, and the Upload Evidence action.',
    caption: 'The Upload Evidence button makes the next step clear.',
    width: 1440,
    height: 1280,
  },
]

const chairWalkthrough: WalkthroughScreen[] = [
  {
    title: 'Chair Dashboard',
    description:
      'The dashboard shows which requests need a first review and which have evidence ready for a final decision.',
    image: chairDashboardScreenshot,
    alt: 'Program chair dashboard with summary counts and a list of requests that have submitted evidence.',
    caption: 'Status tabs help the chair find requests that need attention.',
    width: 1440,
    height: 695,
  },
  {
    title: 'Evidence Review and Decision',
    description:
      'The chair sees the request details and uploaded evidence, then assigns points, writes feedback, and approves or rejects the request.',
    image: chairReviewScreenshot,
    alt: 'Program chair review page showing submitted image evidence, a field for awarded points, a feedback field, and Reject and Approve buttons.',
    caption: 'The final decision records the outcome, feedback, and awarded points.',
    width: 1440,
    height: 1180,
  },
]

const architectureLayers = [
  {
    label: 'What visitors use',
    title: 'React and Vite Frontend',
    description:
      'React and TypeScript power the pages used by students and program chairs. Vite helps run the project locally and prepares the frontend for deployment.',
  },
  {
    label: 'What runs the process',
    title: 'Spring Boot Backend',
    description:
      'Spring Boot provides the API behind the site. It handles sign-in, checks submitted information, moves requests through each review step, and records decisions.',
  },
  {
    label: 'Where information is saved',
    title: 'MySQL Database',
    description: 'MySQL stores account, course, request, feedback, and awarded-point information.',
  },
]

const supportingSystems = [
  {
    title: 'Docker Compose',
    description:
      'Docker Compose starts the frontend, backend, and database together so the project is easy to run locally.',
  },
  {
    title: 'Flyway and Seed Data',
    description:
      'Flyway keeps the database structure up to date. Seed data provides sample courses, categories, and chair assignments for local demonstrations.',
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
          CECAS was built as a team capstone and is presented here as a portfolio project. It
          demonstrates a complete extra credit process, but it is not a live university service.
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
            Choose How to Explore
          </h2>

          <p className="mt-3 leading-7 text-slate-600">
            Try the student experience with a demo account, or view the program chair experience
            through screenshots.
          </p>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <article
            aria-labelledby="student-path-heading"
            className="flex h-full flex-col rounded-2xl bg-sky-50 p-6 ring-1 ring-sky-200"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">
              Try it yourself
            </p>

            <h3
              id="student-path-heading"
              className="mt-3 text-xl font-semibold tracking-tight text-slate-950"
            >
              Student: Try the Demo
            </h3>

            <p className="mt-3 leading-7 text-slate-700">
              Create a demo student account to submit a request and explore the student dashboard.
              The walkthrough below shows what happens after a chair reviews the request.
            </p>

            <div className="mt-6 rounded-xl bg-white p-5 ring-1 ring-sky-200">
              <h4 className="font-semibold text-slate-950">Before You Register</h4>

              <ul
                role="list"
                className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700"
              >
                <li>Use a password you do not use anywhere else.</li>
                <li>Use sample information only, and do not upload private files.</li>
                <li>Demo accounts and requests may be deleted during a reset.</li>
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
                You can also view the full student workflow below without creating an account.
              </p>
            </div>
          </article>

          <article
            aria-labelledby="chair-path-heading"
            className="flex h-full flex-col rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-600">
              Screenshot walkthrough
            </p>

            <h3
              id="chair-path-heading"
              className="mt-3 text-xl font-semibold tracking-tight text-slate-950"
            >
              Program Chair: View the Walkthrough
            </h3>

            <p className="mt-3 leading-7 text-slate-700">
              See how a program chair reviews requests and makes decisions without signing in to a
              chair account.
            </p>

            <div className="mt-6 rounded-xl bg-white p-5 ring-1 ring-slate-200">
              <h4 className="font-semibold text-slate-950">Why the Chair Demo Uses Screenshots</h4>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Giving every visitor the same chair account would allow one person to change the
                requests, feedback, and points that others see. Screenshots keep the example
                consistent, and no chair password is published.
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
                You’ll see the first review, evidence review, feedback, final decisions, and awarded
                points.
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
          Follow a Request from Start to Finish
        </h2>

        <p className="mt-3 max-w-3xl leading-7 text-slate-600">
          A request moves between the student and program chair until a final decision is made and
          points are awarded.
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
          You can try the student role with a demo account or use these screenshots to see the full
          experience without registering.
        </p>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
          {studentWalkthrough.map((screen) => (
            <article
              key={screen.title}
              className="overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-950">{screen.title}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">{screen.description}</p>
              </div>

              <figure className="mt-auto border-t border-slate-200 bg-white">
                <a
                  href={screen.image}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open full-size ${screen.title} screenshot in a new tab`}
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-600"
                >
                  <img
                    src={screen.image}
                    alt={screen.alt}
                    width={screen.width}
                    height={screen.height}
                    loading="lazy"
                    decoding="async"
                    className="block h-auto w-full cursor-zoom-in"
                  />
                </a>

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
          These screenshots show both parts of the chair’s work: reviewing a new request and
          reviewing the student’s evidence.
        </p>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
          {chairWalkthrough.map((screen) => (
            <article
              key={screen.title}
              className="overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-950">{screen.title}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">{screen.description}</p>
              </div>

              <figure className="mt-auto border-t border-slate-200 bg-white">
                <a
                  href={screen.image}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open full-size ${screen.title} screenshot in a new tab`}
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-600"
                >
                  <img
                    src={screen.image}
                    alt={screen.alt}
                    width={screen.width}
                    height={screen.height}
                    loading="lazy"
                    decoding="async"
                    className="block h-auto w-full cursor-zoom-in"
                  />
                </a>

                <figcaption className="border-t border-slate-200 px-6 py-4 text-sm leading-6 text-slate-600">
                  {screen.caption}
                </figcaption>
              </figure>
            </article>
          ))}
        </div>

        <p className="mt-6 max-w-3xl leading-7 text-slate-600">
          Together, the screenshots show the complete chair workflow: reviewing requests,
          pre-approving activities, reviewing evidence, leaving feedback, making final decisions,
          and awarding points.
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
          The frontend, backend, and database each have a clear job.
        </p>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">
          How the parts work together
        </p>
        <ol
          aria-label="How the parts work together"
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
            Local Development Tools
          </h3>

          <p className="mt-2 max-w-3xl leading-7 text-slate-600">
            These tools make the project easier to run and fill it with useful sample data.
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
