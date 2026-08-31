import { Link } from 'react-router-dom'
import { routes } from '../app/routes'
import capLogo from '../assets/cap.svg'

const workflowStages = [
  {
    title: 'Student Submission',
    description:
      'A student chooses a course and activity category, then submits details about the proposed extra credit activity.',
  },
  {
    title: 'Chair Pre-Approval',
    description:
      'The assigned program chair reviews eligibility and either pre-approves the request or rejects it with feedback.',
  },
  {
    title: 'Evidence Submission',
    description: 'After pre-approval, the student uploads supporting evidence for final review.',
  },
  {
    title: 'Final Decision and Points',
    description:
      "The chair approves or rejects the evidence. Approved requests add points to the student's CECAS total.",
  },
]

export default function HomePage() {
  return (
    <section className="space-y-10">
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-8 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-10">
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
                Team capstone · Portfolio demonstration
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                A complete extra credit request workflow.
              </h1>

              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                CECAS is a team-built capstone and portfolio demonstration. It shows how students
                submit extra credit requests and evidence while program chairs make pre-approval and
                final decisions, with approved points tracked in one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={routes.demo}
                className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
              >
                Explore the Guided Demo
              </Link>

              <Link
                to={routes.howItWorks}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
              >
                How It Works
              </Link>

              <a
                href="https://github.com/DAFinnell/Cecas"
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
              >
                View Project Source
              </a>
            </div>
          </div>

          <div className="flex justify-center rounded-2xl bg-slate-100 p-8 ring-1 ring-slate-200">
            <img
              src={capLogo}
              alt="CECAS graduation cap and books logo"
              className="max-h-72 w-full max-w-sm object-contain"
            />
          </div>
        </div>
      </div>

      <section
        aria-labelledby="completed-workflow-heading"
        className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
      >
        <div className="max-w-3xl">
          <h2
            id="completed-workflow-heading"
            className="text-2xl font-semibold tracking-tight text-slate-950"
          >
            Completed request workflow
          </h2>

          <p className="mt-3 leading-7 text-slate-600">
            CECAS carries a request from the student's initial submission through the chair's final
            review.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {workflowStages.map((stage) => (
            <article
              key={stage.title}
              className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200"
            >
              <h3 className="text-lg font-semibold text-slate-950">{stage.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{stage.description}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}
