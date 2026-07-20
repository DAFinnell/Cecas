import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { routes } from '../app/routes'
import extraCreditRequestService from '../services/ExtraCreditRequestService'
import userService from '../services/UserService'
import type {
  ExtraCreditRequestStatus,
  StudentPointsSummary,
  StudentRequestSummary,
} from '../types/extraCredit.types'
import type { UserProfileResponse } from '../types/user.types'
import { formatCourse, formatDate, formatTerm, formatPoints} from '../util/format.util'

type LoadState = {
  profile: UserProfileResponse | null
  points: StudentPointsSummary | null
  requests: StudentRequestSummary[]
}

const TOTAL_ALLOWED_POINTS = 50

const emptyState: LoadState = {
  profile: null,
  points: null,
  requests: [],
}

function formatStatus(status: ExtraCreditRequestStatus): string {
  return status
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function getStatusBadgeClass(status: ExtraCreditRequestStatus): string {
  switch (status) {
    case 'APPROVED':
      return 'bg-emerald-100 text-emerald-800 ring-emerald-200'

    case 'PRE_APPROVED':
      return 'bg-blue-100 text-blue-800 ring-blue-200'

    case 'PENDING':
    case 'EVIDENCE_SUBMITTED':
      return 'bg-amber-100 text-amber-800 ring-amber-200'

    case 'REJECTED':
      return 'bg-red-100 text-red-800 ring-red-200'

    case 'CLOSED':
      return 'bg-slate-200 text-slate-700 ring-slate-300'
  }
}

function getPoints(request: StudentRequestSummary): number {
  return request.awardedPoints ?? request.defaultPoints
}

function getSortDate(request: StudentRequestSummary): number {
  if (!request.updatedAt) {
    return 0
  }

  const time = new Date(request.updatedAt).getTime()

  return Number.isNaN(time) ? 0 : time
}

function StatCard({
  label,
  value,
  helpText,
}: {
  label: string
  value: number
  helpText: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>

      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-600">{helpText}</p>
    </div>
  )
}

function Alert({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p className="font-semibold">{title}</p>
      <div className="mt-1">{children}</div>
    </div>
  )
}

export default function StudentApplicationsPage() {
  const [data, setData] = useState<LoadState>(emptyState)
  const [selectedTerm, setSelectedTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadPageData() {
      setLoading(true)
      setError('')

      try {
        const [profile, requests] = await Promise.all([
          userService.getUserProfile(),
          extraCreditRequestService.getStudentRequests(),
        ])

        if (active) {
          setData({
            profile,
            points: null,
            requests,
          })
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load applications.',
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadPageData()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadPointsForSelectedTerm() {
      if (!selectedTerm) {
        setData((current) => ({
          ...current,
          points: null,
        }))
        return
      }

      try {
        const points = await userService.getMyPoints(selectedTerm)

        if (active) {
          setData((current) => ({
            ...current,
            points,
          }))
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load point summary.',
          )
        }
      }
    }

    void loadPointsForSelectedTerm()

    return () => {
      active = false
    }
  }, [selectedTerm])

  const terms = useMemo(
    () =>
      Array.from(
        new Set(data.requests.map((request) => request.term).filter(Boolean)),
      ).sort(),
    [data.requests],
  )

  const sortedRequests = useMemo(
    () =>
      [...data.requests]
        .filter((request) => !selectedTerm || request.term === selectedTerm)
        .sort(
          (left, right) => getSortDate(right) - getSortDate(left),
        ),
    [data.requests, selectedTerm],
  )

  const profileName =
    data.profile?.fullName ||
    data.profile?.email ||
    'Student'

  const earned = data.points?.issued ?? 0
  const pending = data.points?.pending ?? 0
  const available =
    data.points?.available ??
    Math.max(0, TOTAL_ALLOWED_POINTS - earned - pending)

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              My Applications
            </h1>

            <p className="mt-3 max-w-2xl text-slate-600">
              Review your extra credit request history, check point totals, and
              start a new application when you are ready.
            </p>
          </div>

          <Link
            to={routes.student.newRequest}
            className="inline-flex items-center justify-center rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800"
          >
            New Application
          </Link>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-500">Student</p>

          <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xl font-semibold text-slate-950">
                Hello, {profileName}
              </p>

              {data.profile?.email && (
                <p className="text-sm text-slate-600">
                  {data.profile.email}
                </p>
              )}
            </div>

            {data.profile?.role && (
              <span className="mt-3 inline-flex w-fit rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 sm:mt-0">
                {data.profile.role}
              </span>
            )}
          </div>
        </div>
      </div>

      {error && (
        <Alert title="Unable to load student application data">
          <p>{error}</p>
        </Alert>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block text-sm font-medium text-slate-600" htmlFor="term-filter">
          Term
        </label>

        <select
          id="term-filter"
          className="mt-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
          value={selectedTerm}
          onChange={(event) => setSelectedTerm(event.target.value)}
        >
          <option value="">All terms</option>
          {terms.map((term) => (
            <option key={term} value={term}>
              {formatTerm(term)}
            </option>
          ))}
        </select>
      </div>

      {selectedTerm ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Earned"
            value={earned}
            helpText="Points already awarded"
          />

          <StatCard
            label="Pending"
            value={pending}
            helpText="Points under review"
          />

          <StatCard
            label="Available"
            value={available}
            helpText="Points still available"
          />

          <StatCard
            label="Total Allowed"
            value={TOTAL_ALLOWED_POINTS}
            helpText="Semester maximum"
          />
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
          Select a term to view your semester point summary.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              Application History
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Most recently updated applications appear first.
            </p>
          </div>

          <Link
            to={routes.student.newRequest}
            className="text-sm font-semibold text-sky-700 hover:text-sky-900 hover:underline"
          >
            Start another request
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-600">
            Loading applications...
          </div>
        ) : sortedRequests.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-base font-medium text-slate-900">
              No applications yet
            </p>

            <p className="mt-2 text-sm text-slate-600">
              Create a new request to begin tracking your extra credit activity.
            </p>

            <Link
              to={routes.student.newRequest}
              className="mt-5 inline-flex items-center justify-center rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800"
            >
              New Application
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Course</th>
                  <th className="px-5 py-3">
                    Activity / Category
                  </th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Points</th>
                  <th className="px-5 py-3">Last Updated</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {sortedRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">
                      {formatCourse(request)}
                    </td>

                    <td className="max-w-xs px-5 py-4 text-slate-700">
                      <span className="line-clamp-2">
                        {request.categoryName}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusBadgeClass(request.status)}`}
                      >
                        {formatStatus(request.status)}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                      {formatPoints(getPoints(request))}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                      {formatDate(request.updatedAt)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <Link
                        to={routes.student.requestDetail(request.id)}
                        className="font-semibold text-sky-700 hover:text-sky-900 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
