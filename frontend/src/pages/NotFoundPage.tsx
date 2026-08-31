import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold tracking-tight">404 Not Found</h1>
      <p className="text-slate-600">
        The page you are looking for does not exist. Please check the URL and try again.
      </p>
      <p>
        Go back to the{' '}
        <Link
          to="/"
          className="rounded-sm text-sky-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
        >
          home page
        </Link>
        .
      </p>
    </section>
  )
}
