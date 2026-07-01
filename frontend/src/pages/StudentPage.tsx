import { Link } from 'react-router-dom'

export default function StudentPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">
          Student workflow
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Student Page
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          This page will become the student dashboard. For now, students can create a new extra credit request from here.
        </p>

        <div className="mt-6">
          <Link
            to="/student/requests/new"
            className="inline-flex rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800"
          >
            Create New Extra Credit Request
          </Link>
        </div>
      </div>
    </section>
  )
}
