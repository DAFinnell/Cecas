export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Page Title & Overview */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            About CECAS
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            The Canvas Extra Credit Automation System (CECAS) is designed to simplify, centralize, and streamline how extra credit requests are handled across academic departments.
          </p>
        </div>

        {/* Core Mission Panel */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            🎯 Our Mission
          </h2>
          <p className="text-slate-600 leading-relaxed text-sm">
            Our mission is to eliminate manual tracking inefficiencies. By providing a transparent, centralized system, CECAS ensures that students receive accurate recognition for their auxiliary work while reducing the administrative overhead placed on program chairs and faculty.
          </p>
        </div>

        {/* Feature Grid & Intended Users Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Key Features Column */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              ✨ Key Features
            </h2>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-900">✔</span>
                <span><strong>Streamlined Submissions:</strong> Easy-to-use interfaces for students to submit activity proofs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-900">✔</span>
                <span><strong>Centralized Tracking:</strong> A singular source of truth for all processing metrics and statuses.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-900">✔</span>
                <span><strong>Automated Workflows:</strong> Smart role routing that moves requests through approval cycles natively.</span>
              </li>
            </ul>
          </div>

          {/* Intended Users Column */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              👥 Intended Users
            </h2>
            <div className="space-y-4 text-sm text-slate-600">
              <div>
                <h3 className="font-semibold text-slate-900">Students</h3>
                <p className="text-xs text-slate-500">Submit requests, check validation statuses, and monitor credit adjustments in real time.</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Program Chairs</h3>
                <p className="text-xs text-slate-500">Review departmental metrics, manage structured queues, and coordinate approvals seamlessly.</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
    )
}