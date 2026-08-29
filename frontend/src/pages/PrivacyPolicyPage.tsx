const sections = [
  {
    title: 'Information Collected',
    body: 'CECAS collects information needed to manage extra credit requests, including student account details, course and section selections, request descriptions, selected activity categories, request statuses, and point-related information. The system may also store timestamps and review activity connected to submitted requests.',
  },
  {
    title: 'Use of Information',
    body: 'Information entered into CECAS is used to submit, review, track, and manage extra credit requests. Student information helps connect requests to the correct course, section, term, and program chair workflow. Request information is used only for academic review and administrative processing within the system.',
  },
  {
    title: 'Data Storage',
    body: 'Request records and related user information are stored in the application database so that students and program chairs can access request history, current statuses, and point totals. Data should be retained only as needed for course administration, review history, and academic recordkeeping requirements.',
  },
  {
    title: 'User Responsibilities',
    body: 'Users are responsible for entering accurate information, submitting only valid extra credit requests, protecting their account credentials, and avoiding the submission of sensitive personal information that is not required for request review. Students should ensure that request descriptions are clear, truthful, and relevant to the selected activity category.',
  },
  {
    title: 'Security Considerations',
    body: 'CECAS uses authenticated access to separate student and program chair workflows. Users should log out after using shared devices and report suspicious account activity or incorrect access immediately. While the system is designed to support secure handling of request data, users should avoid including unnecessary private information in free-text fields.',
  },
  {
    title: 'Contact Information',
    body: 'Questions about extra credit request data, account access, or privacy-related concerns should be directed to the appropriate course instructor, program chair, or system administrator responsible for the CECAS application.',
  },
]

export default function PrivacyPolicyPage() {
  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">
          CECAS policies
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-4 max-w-3xl text-slate-600">
          This page explains how the Canvas Extra Credit Automation System handles student request
          information, course-related data, and user responsibilities within the application.
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
