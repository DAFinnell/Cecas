import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { routes } from '../app/routes';
import extraCreditRequestService from '../services/ExtraCreditRequestService';
import type { StudentRequestDetail } from '../types/extraCredit.types';

export default function StudentApplicationDetailPage() {
  const navigate = useNavigate();
  const { requestId } = useParams();

  const [request, setRequest] = useState<StudentRequestDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) {
      setError('missing request id');
      return;
    }

    setLoading(true);

    extraCreditRequestService
      .getStudentRequestDetail(Number(requestId))
      .then(setRequest)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [requestId]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <p>Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="text-center mx-auto max-w-6xl px-6 py-10">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate(routes.student.dashboard)}
          className="cursor-pointer text-sm font-medium text-blue-600 hover:underline"
        >
          {'< '}Back to Applications
        </button>
      </main>
    );
  }

  if (!request) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <p>Request not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">

      <button
        onClick={() => navigate(routes.student.dashboard)}
        className="mb-6 cursor-pointer text-sm font-medium text-blue-600 hover:underline"
      >
        {'< '}Back to Dashboard
      </button>

      <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">
          Student workflow
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Extra Credit Request Details
        </h1>

        <p className="mt-4 max-w-3xl text-slate-600">
          These are the details of your extra credit request below.
        </p>
      </div>

      <section className="mt-8 rounded-3xl bg-white p-10 shadow-sm">

        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            Request Details
          </h2>

          <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-800">
            {request.status}
          </span>
        </div>

        <div className="grid gap-y-8 gap-x-12 sm:grid-cols-2">

          <div>
            <p className="text-sm text-slate-500">Course</p>
            <p className="text-xl font-medium">
              {request.courseCode}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Term</p>
            <p className="text-xl font-medium">
              {request.term}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Section</p>
            <p className="text-xl font-medium">
              {request.section}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Points</p>
            <p className="text-xl font-medium">
              {request.defaultPoints}
            </p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-sm text-slate-500">
              Category
            </p>
            <p className="text-xl font-medium">
              {request.categoryName}
            </p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-sm text-slate-500">
              Category Description
            </p>
            <p className="leading-7">
              {request.categoryDescription}
            </p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-sm text-slate-500">
              Student Description
            </p>
            <p className="leading-7">
              {request.description}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Submitted
            </p>
            <p>{request.createdAt}</p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Last Updated
            </p>
            <p>{request.updatedAt}</p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-sm text-slate-500">
              Chair Feedback
            </p>

            <p className="leading-7">
              {request.chairFeedback ??
                'No feedback has been provided.'}
            </p>
          </div>

          {request.evidenceUploadAvailable && (
            <div className="sm:col-span-2">
              <Link
                to={routes.student.evidenceUpload(request.id)}
                className="inline-flex w-full items-center justify-center rounded-md bg-sky-700 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-sky-800"
              >
                Upload Evidence
              </Link>
            </div>
          )}
        </div>

      </section>

    </main>
  );
}