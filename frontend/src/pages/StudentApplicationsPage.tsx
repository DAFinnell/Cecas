import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { routes } from '../app/routes'
import extraCreditRequestService from '../services/ExtraCreditRequestService'
import userService from '../services/UserService'
import type {
  StudentPointsSummary,
  StudentRequestSummary,
} from '../types/extraCredit.types'
import { formatCourse, formatDate, formatTerm, formatPoints, formatStatus, getStatusBadgeClass} from '../util/format.util'

type LoadState = {
  points: StudentPointsSummary | null
  requests: StudentRequestSummary[]
}

const TOTAL_ALLOWED_POINTS = 50

const emptyState: LoadState = {
  points: null,
  requests: [],
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
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  // This wrapper should guarantee pages reset to 1 when a filter is changed
  const updateControl = (stateSetter: () => void) => {
    stateSetter()
    setCurrentPage(1)
  }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadPageData() {
      setLoading(true)
      setError('')

      try {
        const requests = await extraCreditRequestService.getStudentRequests()

        if (active) {
          setData({
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

  const sortedRequests = useMemo(() => {
    const items = data.requests.filter((req) => {
      const matchesTerm = !selectedTerm || req.term ===selectedTerm
      const matchesStatus = !statusFilter || req.status === statusFilter

      const query = searchTerm.toLowerCase()
      const matchesSearch =
        !query ||
        req.courseCode.toLowerCase().includes(query) ||
        req.categoryName.toLowerCase().includes(query)

      return matchesTerm && matchesStatus && matchesSearch
    })

    items.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return getSortDate(b) - getSortDate(a)
        case 'oldest':
          return getSortDate(a) - getSortDate(b)
        case 'course-asc':
          return a.courseCode.localeCompare(b.courseCode)
        case 'course-desc':
          return b.courseCode.localeCompare(a.courseCode)
        case 'status-asc':
          return a.status.localeCompare(b.status)
        case 'status-desc':
          return b.status.localeCompare(a.status)
        case 'points-asc':
          return getPoints(a) - getPoints(b)
        case 'points-desc':
          return getPoints(b) - getPoints(a)
        default:
          return 0
      }
    })

    return items
  }, [data.requests, selectedTerm, statusFilter, searchTerm, sortBy])

  const earned = data.points?.issued ?? 0
  const pending = data.points?.pending ?? 0
  const available =
    data.points?.available ??
    Math.max(0, TOTAL_ALLOWED_POINTS - earned - pending)
  const ITEMS_PER_PAGE = 10
  const totalPages = Math.max(1, Math.ceil(sortedRequests.length / ITEMS_PER_PAGE))
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [sortedRequests, currentPage])

  const sortDescriptions: Record<string, string> = {
    newest: 'Most recently updated applications appear first.',
    oldest: 'Oldest updated applications appear first.',
    'course-asc': 'Applications sorted by course code (A to Z).',
    'course-desc': 'Applications sorted by course code (Z to A).',
    'status-asc': 'Applications sorted by status alphabetically (A to Z).',
    'status-desc': 'Applications sorted by status alphabetically (Z to A).',
    'points-asc': 'Applications sorted by point totals in ascending order.',
    'points-desc': 'Applications sorted by point totals in descending order.',
  }

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
      </div>

      {error && (
        <Alert title="Unable to load student application data">
          <p>{error}</p>
        </Alert>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-600" htmlFor="term-filter">
              Term
            </label>
            <select
              id="term-filter"
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
              value={selectedTerm}
              onChange={(event) => updateControl(() => setSelectedTerm(event.target.value))}
            >
              <option value="">All terms</option>
              {terms.map((term) => (
                <option key={term} value={term}>
                  {formatTerm(term)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600" htmlFor="status-filter">
              Status
            </label>
            <select
              id="status-filter"
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
              value={statusFilter}
              onChange={(event) => updateControl(() => setStatusFilter(event.target.value))}
            >
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PRE_APPROVED">Pre-Approved</option>
              <option value="EVIDENCE_SUBMITTED">Evidence Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 border-t border-slate-100 pt-4">
          <div>
            <label className="block text-sm font-medium text-slate-600" htmlFor="search-filter">
              Search Requests
            </label>
            <input
              id="search-filter"
              type="text"
              placeholder="Search by course code or category..."
              value={searchTerm}
              onChange={(event) => updateControl(() => setSearchTerm(event.target.value))}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600" htmlFor="sort-filter">
              Sort By
            </label>
            <select
              id="sort-filter"
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
              value={sortBy}
              onChange={(event) => updateControl(() => setSortBy(event.target.value))}
            >
              <option value="newest">Newest Updated</option>
              <option value="oldest">Oldest Updated</option>
              <option value="course-asc">Course Code (A-Z)</option>
              <option value="course-desc">Course Code (Z-A)</option>
              <option value="status-asc">Status (A-Z)</option>
              <option value="status-desc">Status (Z-A)</option>
              <option value="points-asc">Points (Lowest)</option>
              <option value="points-desc">Points (Highest)</option>
            </select>
          </div>
        </div>
      </div>

      {selectedTerm ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Earned"
            value={earned}
            helpText="Points already awarded"
          />

          <StatCard
            label="Pending/Pre-Approved"
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
              {sortDescriptions[sortBy] || 'Custom application order.'}
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
        ) : sortedRequests.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-600">
            <p className="text-base font-medium text-slate-900">No matching requests found</p>
            <p className="mt-2">Try adjusting your active status filters, terms, or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="whitespace-nowrap px-5 py-3 text-center">Course</th>
                  <th className="whitespace-nowrap px-5 py-3 text-center">
                    Activity / Category
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-center">Status</th>
                  <th className="whitespace-nowrap px-5 py-3 text-center">Points</th>
                  <th className="whitespace-nowrap px-5 py-3 text-center">Last Updated</th>
                  <th className="whitespace-nowrap px-5 py-3 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {paginatedRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="whitespace-nowrap font-medium py-4 text-center">
                      {formatCourse(request)}
                    </td>

                    <td className="whitespace-nowrap py-4 text-center">
                      <span className="line-clamp-2">
                        {request.categoryName}
                      </span>
                    </td>

                    <td className="whitespace-nowrap py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusBadgeClass(request.status)}`}
                      >
                        {formatStatus(request.status)}
                      </span>
                    </td>

                    <td className="whitespace-nowrap py-4 text-center">
                      {formatPoints(getPoints(request))}
                    </td>

                    <td className="whitespace-nowrap py-4 text-center">
                      {formatDate(request.updatedAt)}
                    </td>

                    <td className="whitespace-nowrap px-8 py-4 text-center">
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

            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-4">
              <p className="text-sm text-slate-700">
                Showing page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span> (Total: {sortedRequests.length})
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="rounded border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="rounded border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
