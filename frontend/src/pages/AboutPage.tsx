export default function AboutPage() {
  return (
    <section className="space-y-8">
      <header className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
          Team capstone · Portfolio demonstration
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          About CECAS
        </h1>

        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          CECAS is a team-built capstone project that demonstrates a complete way for students and
          program chairs to manage extra credit requests.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <section
          aria-labelledby="problem-heading"
          className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
        >
          <h2 id="problem-heading" className="text-xl font-semibold text-slate-950">
            The Problem
          </h2>

          <p className="mt-3 leading-7 text-slate-600">
            Extra credit requests can be difficult to follow when activity details, evidence,
            feedback, and decisions are spread across email and separate records. CECAS was built to
            explore how one application could keep the whole request in one place.
          </p>
        </section>

        <section
          aria-labelledby="workflow-heading"
          className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
        >
          <h2 id="workflow-heading" className="text-xl font-semibold text-slate-950">
            The Completed Workflow
          </h2>

          <p className="mt-3 leading-7 text-slate-600">
            Students can submit a request, follow its status, and upload evidence after chair
            pre-approval. Program chairs can review the initial request, leave feedback, and make
            the final approval or rejection decision. Approved points are tracked in CECAS.
          </p>
        </section>
      </div>

      <section
        aria-labelledby="architecture-heading"
        className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
      >
        <h2 id="architecture-heading" className="text-xl font-semibold text-slate-950">
          How It Is Built
        </h2>

        <p className="mt-3 max-w-3xl leading-7 text-slate-600">
          CECAS is organized into a frontend, a backend, and a database. Each part has a different
          job in the application.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <h3 className="font-semibold text-slate-950">Frontend</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              React and TypeScript provide the pages and interactions used by students and program
              chairs.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <h3 className="font-semibold text-slate-950">Backend</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Spring Boot provides the API, authentication, and rules that move requests through the
              workflow.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <h3 className="font-semibold text-slate-950">Database</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              MySQL stores the application's records, while Flyway keeps database changes organized.
            </p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="project-context-heading"
        className="rounded-3xl bg-sky-50 p-8 ring-1 ring-sky-200"
      >
        <h2 id="project-context-heading" className="text-xl font-semibold text-slate-950">
          A Team Capstone and Portfolio Project
        </h2>

        <p className="mt-3 max-w-3xl leading-7 text-slate-700">
          CECAS was created by a six-student team for a college capstone. This version is shared in
          Derek Finnell's portfolio to show the work and experience that came from that team
          project. It is a demonstration, not a university service.
        </p>

        <a
          href="https://github.com/DAFinnell/Cecas"
          className="mt-5 inline-flex rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
        >
          View Project Source
        </a>
      </section>
    </section>
  )
}
