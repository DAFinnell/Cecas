
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type {  UserProfileResponse, } from "../types/user.types";
import StudentWorkflowService from "../services/StudentWorkflowService";
import type { StudentPointsSummary, ExtraCreditRequestResponse } from "../types/extraCredit.types";

export default function StudentPage() {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [points, setPoints] = useState<StudentPointsSummary | null>(null);
  const [requests, setRequests] = useState<ExtraCreditRequestResponse[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let active = true;
    setLoading(true);

    (async () => {
      try {
        // these are async
        const [profile, points, requests] = await Promise.all([
          StudentWorkflowService.getUserProfile().catch(() => null),
          StudentWorkflowService.getMyPoints().catch(() => null),
          StudentWorkflowService.getRequests().catch(() => []),
        ]);

        if (!active) return;

        if (profile) setProfile(profile);
        if (points) setPoints(points);
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

  const fullName = profile?.fullName ?? profile?.email ?? "Student";
  const maxPoints = 50;
  const earned = points?.issued ?? 0;
  const pending = points?.pending ?? 0;
  const available = points?.available ?? Math.max(0, maxPoints - earned - pending);
  const filteredRequests = selectedTerm
    ? requests.filter((req) => (req.term === selectedTerm))
    : requests;

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
              <option value="27/SP">Spring 2027</option>
              <option value="26/FA">Fall 2026</option>
            </select>
          </div>
          <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-700">
            {fullName.split(" ").map(s => s[0]).slice(0,2).join("")}
          </div>
        </div>
      </header>

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
      <section className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">My Applications</h3>
          <Link to="/create-request" className="inline-flex items-center gap-2 rounded-md bg-sky-700 text-white px-4 py-2">
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
                    <td className="py-3 text-sm">{([req.courseCode, req.term, req.section].filter(Boolean).join('-') || '—')}</td>
                    <td className="text-sm">{ req.categoryName ?? '—'}</td>
                    <td className="text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        req.status === 'PRE_APPROVED' ? 'bg-yellow-100 text-yellow-700' :
                        req.status === 'PENDING' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="text-sm">{req.defaultPoints}</td>
                    <td className="text-sm">{req.updatedAt ? new Date(req.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    : '—' }</td>
                    <td className="text-sm text-sky-700"><Link to={`/requests/${req.id}`}>View</Link></td>
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

