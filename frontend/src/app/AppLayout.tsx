import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function AppLayout() {
  return (
    <div className="min-h-dvh bg-slate-100 text-slate-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-sky-800 focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-950 focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <Navbar />

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl px-6 py-10">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
