import { useEffect, useState } from "react"
import { routes } from "../app/routes"
import { useNavigate } from "react-router-dom"
import ChairDashboardService from "../services/ChairDashboardService"
import type { ChairDashboardQueueResponse, ChairDashboardSummaryResponse } from "../types/chair.types"
import type { ExtraCreditRequestStatus } from "../types/extraCredit.types"

import PendingIcon from "../assets/Pending.svg"
import UploadIcon from "../assets/Upload.svg"
import ApprovedIcon from "../assets/Approved.svg"
import RejectedIcon from "../assets/Rejected.svg"
import { formatCourse, formatDate, formatPoints } from "../util/format.util"

export default function ChairDashboardPage() {
  const [summary, setSummary] = useState<ChairDashboardSummaryResponse | null>(null)
  const [queue, setQueue] = useState<ChairDashboardQueueResponse[]>([])
  const [queueStatus, setQueueStatus] = useState<ExtraCreditRequestStatus>('PENDING')
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [queueLoading, setQueueLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  function selectQueueStatus(status: ExtraCreditRequestStatus) {
    if (status === queueStatus) return

    setQueueLoading(true)
    setError(null)
    setQueueStatus(status)
  }

  // Summary counts don't depend on the selected tab so only need to load once
  useEffect(() => {
    ChairDashboardService.getRequestCountSummary()
      .then(setSummary)
      .catch((err) => {
        console.error("Failed to load chair summary", err)
        setError("Failed to load the dashboard summary.")
      })
      .finally(() => setSummaryLoading(false))
  }, [])

  // Queue depends on selected tab. Runs initially(PENDING) then whenever queueStatus changes
  useEffect(() => {
    let cancelled = false

    ChairDashboardService.getChairReviewQueue(queueStatus)
      .then((queueData) => {
        if (!cancelled) {
          setQueue(queueData)
        }
      })
      .catch((err) => {
        console.error("Failed to load chair review queue", err)

        if (!cancelled) {
          setError("Failed to load the review queue.")
        }
      })
      .finally(() => {
        if (!cancelled) {
          setQueueLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [queueStatus])

  const loading = summaryLoading || queueLoading

  if (loading) {
    return <p className="p-6">Loading dashboard...</p>
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  const cards = [
    {
      title: "Pending (Pre-Review)",
      count: summary?.pendingCount ?? 0,
      icon: PendingIcon,
      style: "bg-yellow-50 border-yellow-100 text-yellow-700",
    },
    {
      title: "Waiting for Evidence",
      count: summary?.preApprovedCount ?? 0,
      icon: PendingIcon,
      style: "bg-blue-50 border-blue-100 text-blue-700",
    },
    {
      title: "Evidence Submitted",
      count: summary?.evidenceSubmittedCount ?? 0,
      icon: UploadIcon,
      style: "bg-orange-50 border-orange-100 text-orange-700",
    },
    {
      title: "Approved",
      count: summary?.approvedCount ?? 0,
      icon: ApprovedIcon,
      style: "bg-green-50 border-green-100 text-green-700",
    },
    {
      title: "Rejected",
      count: summary?.rejectedCount ?? 0,
      icon: RejectedIcon,
      style: "bg-red-50 border-red-100 text-red-700",
    },
  ]

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold text-slate-900">
        Chair Dashboard
      </h1>

      <p className="mt-1 text-sm text-slate-600">
        Review and manage extra credit applications.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`rounded-lg border p-5 shadow-sm ${card.style}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="h-14 text-sm font-semibold leading-tight">
                  {card.title}
                </p>

                <p className="mt-4 text-3xl font-semibold text-slate-900">
                  {card.count}
                </p>
              </div>

              <img
                src={card.icon}
                alt=""
                className="h-8 w-8"
              />
            </div>

            <button
              className="mt-5 text-sm font-medium text-sky-800 hover:underline"
            >
              View All
            </button>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-lg border border-slate-200 bg-white shadow-sm">

        <div className="border-b px-5 py-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Review Queue
          </h2>

          <div className="mt-5 flex gap-8 text-sm">
            <button
              type="button"
              onClick={() => selectQueueStatus("PENDING")}
              className={
                queueStatus === "PENDING"
                  ? "border-b-2 border-sky-600 pb-2 font-medium text-sky-700"
                  : "pb-2 text-slate-500"
              }
            >
              Pre-Review (Pending)

              <span
                className={
                  queueStatus === "PENDING"
                    ? "ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-xs"
                    : "ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs"
                }
              >
                {summary?.pendingCount ?? 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => selectQueueStatus("EVIDENCE_SUBMITTED")}
              className={
                queueStatus === "EVIDENCE_SUBMITTED"
                  ? "border-b-2 border-sky-600 pb-2 font-medium text-sky-700"
                  : "pb-2 text-slate-500"
              }
            >
              Evidence Submitted

              <span
                className={
                  queueStatus === "EVIDENCE_SUBMITTED"
                    ? "ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-xs"
                    : "ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs"
                }
              >
                {summary?.evidenceSubmittedCount ?? 0}
              </span>
            </button>

            <button
              type="button"
              disabled
              className="cursor-not-allowed pb-2 text-slate-400"
              title="Overdue filtering is not implemented yet."
            >
              Overdue
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="whitespace-nowrap px-5 py-3 text-center">Student</th>
                <th className="whitespace-nowrap px-5 py-3 text-center">Course / Section</th>
                <th className="whitespace-nowrap px-5 py-3 text-center">Activity</th>
                <th className="whitespace-nowrap px-5 py-3 text-center">Submitted</th>
                <th className="whitespace-nowrap px-5 py-3 text-center">Points</th>
                <th className="whitespace-nowrap px-5 py-3 text-center">Action</th>
              </tr>
            </thead>


            <tbody>
              {queue.map((request) => (
                <tr
                  key={request.requestId}
                  className="border-t"
                >

                  <td className="whitespace-nowrap py-4 text-center">
                    <p className="font-medium text-slate-900">
                      {request.studentName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {request.studentEmail}
                    </p>
                  </td>

                  <td className="whitespace-nowrap py-4 text-center">
                    {formatCourse(request)}
                  </td>


                  <td className="whitespace-nowrap py-4 text-center">
                    {request.categoryName}
                  </td>


                  <td className="whitespace-nowrap py-4 text-center">
                    {formatDate(request.createdAt)}
                  </td>

                  <td className="whitespace-nowrap py-4 text-center">
                    {formatPoints(request.defaultPoints)}
                  </td>


                  <td className="whitespace-nowrap py-4 text-center">
                    <button
                      onClick={() => navigate(routes.chair.reviewPage(request.requestId))}
                      className="rounded bg-sky-700 px-2 py-2 text-xs font-light text-white hover:bg-sky-800"
                    >
                      Review &rarr;
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>


        <div className="border-t px-5 py-3 text-right">
          <button className="text-sm font-medium text-sky-700 hover:underline">
            View all pending &rarr;
          </button>
        </div>
      </div>
    </div>
  )
}
