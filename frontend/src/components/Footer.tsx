import { Link } from 'react-router-dom'
import { routes } from '../app/routes'

export default function Footer() {
  return (
    <footer className="mt-8 border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-600">
      <p className="font-medium text-slate-700">
        CECAS is a team capstone and portfolio demonstration.
      </p>

      <p className="mt-1">© 2026 CECAS</p>

      <nav
        aria-label="Footer navigation"
        className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2"
      >
        <Link
          to={routes.demo}
          className="rounded-sm transition hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
        >
          Guided Demo
        </Link>

        <Link
          to="/about"
          className="rounded-sm transition hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
        >
          About
        </Link>

        <Link
          to="/contact"
          className="rounded-sm transition hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
        >
          Contact
        </Link>

        <Link
          to="/privacy-policy"
          className="rounded-sm transition hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
        >
          Privacy and Demo Data
        </Link>

        <a
          href="https://github.com/DAFinnell/Cecas"
          className="rounded-sm transition hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
        >
          Project Source
        </a>
      </nav>
    </footer>
  )
}
