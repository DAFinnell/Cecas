import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { UserProfileResponse, } from "../types/user.types";
import userService from '../services/UserService'
import extraCreditRequestService from '../services/ExtraCreditRequestService'
import type { StudentPointsSummary, StudentRequestSummary } from '../types/extraCredit.types'
import { routes } from "../app/routes";
import { formatCourse, formatDate, formatPoints } from "../util/format.util";

export default function StudentPage() {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [points, setPoints] = useState<StudentPointsSummary | null>(null);
  const [requests, setRequests] = useState<StudentRequestSummary[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    (async () => {
      try {
        // these are async
        const [profile, requests] = await Promise.all([
          userService.getUserProfile().catch(() => null),
          extraCreditRequestService.getStudentRequests().catch(() => []),
        ]);

        if (!active) return;

        if (profile) setProfile(profile);
        if (requests) setRequests(requests);
      } catch (e: any) {
        if (!active) return;
        setError(e?.message ?? String(e));
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true

    async function loadPointsForSelectedTerm() {
      if (!selectedTerm) {
        setPoints(null)
        return
      }

      try {
        const termPoints = await userService.getMyPoints(selectedTerm)

        if (active) {
          setPoints(termPoints)
        }
      } catch (e: any) {
        if (active) {
          setError(e?.message ?? String(e))
        }
      }
    }

    void loadPointsForSelectedTerm()

    return () => {
      active = false
    }
  }, [selectedTerm])

  const fullName = profile?.fullName ?? profile?.email ?? "Student";
  const maxPoints = 50;
  const earned = points?.issued ?? 0;
  const pending = points?.pending ?? 0;
  const available = points?.available ?? Math.max(0, maxPoints - earned - pending);
  const filteredRequests = selectedTerm
    ? requests.filter((req) => (req.term === selectedTerm))
    : requests;

  const terms = Array.from(
    new Set(requests.map((req) => req.term).filter(Boolean))
  ).sort()
  return (
    <main className="mx-auto max-w-6xl p-6">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg text-slate-600">Welcome back,</h2>
          <h1 className="text-2xl font-semibold">{fullName}</h1>
          <p className="text-sm text-slate-500">Here's what's happening with your extra credit.</p>
        </div>
        {error && (
          <div className="w-full sm:w-auto mt-4 sm:mt-0 sm:ml-6">
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <select
              className="rounded-md border px-3 py-2 text-sm"
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
            >
              <option value="">All terms</option>
              {terms.map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {selectedTerm ? (
        <section className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="rounded-lg bg-green-50 p-4">
            <div className="text-sm text-slate-600">Earned Points</div>
            <div className="text-2xl font-bold">{earned} pts</div>
          </div>
          <div className="rounded-lg bg-yellow-50 p-4">
            <div className="text-sm text-slate-600">Pending Points</div>
            <div className="text-2xl font-bold">{pending} pts</div>
          </div>
          <div className="rounded-lg bg-indigo-50 p-4">
            <div className="text-sm text-slate-600">Available Points</div>
            <div className="text-2xl font-bold">{available} pts</div>
          </div>
          <div className="rounded-lg bg-white border p-4">
            <div className="text-sm text-slate-600">Total Allowed</div>
            <div className="text-2xl font-bold">{maxPoints} pts</div>
          </div>
        </section>
      ) : (
        <section className="mb-6 rounded-lg border bg-white p-4 text-sm text-slate-600">
          Select a term to view your semester point summary.
        </section>
      )}
      <section className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">My Applications</h3>
          <Link to={routes.student.newRequest} className="inline-flex items-center gap-2 rounded-md bg-sky-700 text-white px-4 py-2">
            + New Application
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-600">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="py-8 text-center text-slate-600">No requests found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-sm text-slate-500">
                <tr>
                  <th className="py-2">Course</th>
                  <th>Activity</th>
                  <th>Status</th>
                  <th>Points</th>
                  <th>Last Updated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="border-t">
                    <td className="py-3 text-sm">{formatCourse(req)}</td>
                    <td className="text-sm">{req.categoryName ?? '—'}</td>
                    <td className="text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        req.status === 'PRE_APPROVED' ? 'bg-yellow-100 text-yellow-700' :
                          req.status === 'PENDING' ? 'bg-indigo-100 text-indigo-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="text-sm">{formatPoints(req.defaultPoints)}</td>
                    <td className="text-sm">{formatDate(req.updatedAt)}</td>
                    <td className="text-sm text-sky-700"><Link to={routes.student.requestDetail(req.id)}>View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
