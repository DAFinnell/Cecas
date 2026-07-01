import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-8 border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-600">
      <p>© 2026 CECAS</p>

      <nav aria-label="Footer navigation" className="mt-3 flex flex-wrap justify-center gap-4">
        <span className="text-slate-400">About</span>
        <span className="text-slate-400">Contact</span>
        <Link to="/privacy-policy" className="transition hover:text-sky-700">
          Privacy Policy
        </Link>
      </nav>
    </footer>
  )
}