type Step = {
  number: string
  title: string
  description: string
  icon: JSX.Element
  colorClasses: string
}

function SubmitActivityIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M15 7h15l7 7v25a4 4 0 0 1-4 4H15a4 4 0 0 1-4-4V11a4 4 0 0 1 4-4Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M30 7v8h7" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M18 22h10M18 29h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="34.5" cy="34.5" r="6.5" fill="white" stroke="currentColor" strokeWidth="2.5" />
      <path d="M34.5 31v7M31 34.5h7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function PreApprovedIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="22" cy="15" r="6" stroke="currentColor" strokeWidth="2.5" />
      <path d="M10 37c0-7 5.4-12 12-12 3.2 0 6 1.1 8 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="34" cy="33" r="7" fill="white" stroke="currentColor" strokeWidth="2.5" />
      <path d="m30.5 33 2.5 2.5 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UploadEvidenceIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M16 36h20a8 8 0 0 0 1.5-15.9A13 13 0 0 0 12.6 23 6.7 6.7 0 0 0 16 36Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M24 34V21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="m18.5 26.5 5.5-5.5 5.5 5.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ReceivePointsIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M16 8h16v6c0 6-3.6 11-8 11s-8-5-8-11V8Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M16 12h-5c0 6 2.7 10 7 10M32 12h5c0 6-2.7 10-7 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 25v9M18 40h12M20 34h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function ArrowDivider() {
  return (
    <div className="hidden h-20 items-center justify-center px-2 text-slate-400 md:flex" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 12h13" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
        <path d="m13 7 5 5-5 5" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

const steps: Step[] = [
  {
    number: '1.',
    title: 'Submit Activity',
    description: 'Choose an activity category and describe your activity.',
    icon: <SubmitActivityIcon />,
    colorClasses: 'bg-blue-100 text-blue-600',
  },
  {
    number: '2.',
    title: 'Get Pre-Approved',
    description: 'Program Chair reviews eligibility of your request.',
    icon: <PreApprovedIcon />,
    colorClasses: 'bg-emerald-100 text-emerald-600',
  },
  {
    number: '3.',
    title: 'Upload Evidence',
    description: 'Upload supporting evidence after pre-approval.',
    icon: <UploadEvidenceIcon />,
    colorClasses: 'bg-violet-100 text-violet-600',
  },
  {
    number: '4.',
    title: 'Receive Points',
    description: 'If approved, points are awarded and added to your total.',
    icon: <ReceivePointsIcon />,
    colorClasses: 'bg-amber-100 text-amber-600',
  },
]

export default function HowItWorksPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-8">
        <h1 className="text-center text-2xl font-bold tracking-tight text-slate-950">
          How It Works
        </h1>

        <div className="mt-7 rounded-2xl border border-slate-200 bg-white px-6 py-8 sm:px-8">
          <div className="grid gap-y-8 md:grid-cols-[1fr_40px_1fr_40px_1fr_40px_1fr] md:items-start">
            {steps.map((step, index) => (
              <div key={step.title} className="contents">
                <article className="mx-auto flex max-w-[190px] flex-col items-center text-center">
                  <div className={`flex h-20 w-20 items-center justify-center rounded-full ${step.colorClasses}`}>
                    {step.icon}
                  </div>

                  <h2 className="mt-5 whitespace-nowrap text-base font-bold text-slate-950">
                    {step.number} {step.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {step.description}
                  </p>
                </article>

                {index < steps.length - 1 && <ArrowDivider />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}