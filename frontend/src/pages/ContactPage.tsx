const contactLinks = [
  {
    label: 'dafinnell.com',
    href: 'https://dafinnell.com',
    description: 'Visit Derek Finnell’s portfolio and contact information.',
  },
  {
    label: 'DAFinnell on GitHub',
    href: 'https://github.com/DAFinnell',
    description: 'View Derek’s GitHub profile and other development work.',
  },
  {
    label: 'CECAS project source on GitHub',
    href: 'https://github.com/DAFinnell/Cecas',
    description: 'Review the source code and project documentation for CECAS.',
  },
]

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-5xl space-y-8">
      {/* Page Title & Intro text */}
      <header className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
          Project contact
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Contact and Project Links
        </h1>

        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          CECAS is a portfolio project, so there is no support department or service desk. Use the
          links below to learn more about the project or get in touch.
        </p>
      </header>

      {/* Project Links */}
      <section
        aria-labelledby="project-links-heading"
        className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
      >
        <h2 id="project-links-heading" className="text-xl font-semibold text-slate-950">
          Project Links
        </h2>

        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {contactLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="block h-full rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200 transition hover:bg-sky-50 hover:ring-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
              >
                <span className="block font-semibold text-sky-800">{link.label}</span>
                <span className="mt-2 block text-sm leading-6 text-slate-600">
                  {link.description}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </section>
  )
}
