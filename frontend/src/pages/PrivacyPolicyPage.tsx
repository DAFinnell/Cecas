const sections = [
  {
    title: 'Demonstration Use Only',
    body: 'CECAS is a portfolio demonstration. Information entered here is for showing the project workflow and should not be treated as an official course or university record.',
  },
  {
    title: 'Do Not Use Real Credentials',
    body: 'Do not use a real password or reuse a password from another account. Do not enter sensitive personal information, real student records, or private files into the demonstration.',
  },
  {
    title: 'Data May Be Reset',
    body: 'Accounts, requests, uploaded evidence, and other demonstration data may be reset or removed as the project is maintained. Do not rely on CECAS as permanent storage.',
  },
  {
    title: 'Not an Institutional Privacy Policy',
    body: 'This page describes expectations for using the CECAS demonstration. It is not a university privacy policy, and CECAS is not presented as an official university service.',
  },
]

export default function PrivacyPolicyPage() {
  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">
          Demo data guidance
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Privacy and Demo Data
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          This page explains what visitors should know before using the CECAS portfolio
          demonstration. Use demo information only, and do not enter real credentials or sensitive
          data.
        </p>
      </div>

      <div className="space-y-5 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        {sections.map((section) => (
          <section
            key={section.title}
            className="border-b border-slate-200 pb-5 last:border-b-0 last:pb-0"
          >
            <h2 className="text-xl font-semibold text-slate-950">{section.title}</h2>
            <p className="mt-2 leading-7 text-slate-600">{section.body}</p>
          </section>
        ))}
      </div>
    </section>
  )
}
