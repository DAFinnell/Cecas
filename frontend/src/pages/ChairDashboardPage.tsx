import { useEffect, useState } from "react"
import { routes } from "../app/routes"
import { useNavigate } from "react-router-dom"
import ChairDashboardService from "../services/ChairDashboardService"
import type { ChairDashboardQueueResponse, ChairDashboardSummaryResponse } from "../types/chair.types"

import PendingIcon from "../assets/Pending.svg"
import UploadIcon from "../assets/Upload.svg"
import ApprovedIcon from "../assets/Approved.svg"
import RejectedIcon from "../assets/Rejected.svg"
import { formatCourse, formatDate, formatPoints } from "../util/format.util"

export default function ChairDashboardPage() {
  const [summary, setSummary] = useState<ChairDashboardSummaryResponse | null>(null)
  const [queue, setQueue] = useState<ChairDashboardQueueResponse[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  useEffect(() => {
    Promise.all([ChairDashboardService.getRequestCountSummary(),ChairDashboardService.getChairReviewQueue()])
    .then(([summaryData,queueData]) => {
        setSummary(summaryData)
        setQueue(queueData)
    })
    .finally(()=> setLoading(false))},[])

  if (loading) {
    return <p className="p-6">Loading dashboard...</p>
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
            <h2 className="text-sm font-semibold text-slate-900">
            Review Queue
            </h2>

            <div className="mt-4 flex gap-8 text-sm">
            <button className="border-b-2 border-sky-600 pb-2 font-medium text-sky-700">
                Pre-Review (Pending)
                <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-xs">
                {summary?.pendingCount ?? 0}
                </span>
            </button>

            <button className="text-slate-500">
                Evidence Submitted
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                {summary?.evidenceSubmittedCount ?? 0}
                </span>
            </button>

            <button className="text-slate-500">
                Overdue
            </button>
            </div>
        </div>


        <div className="overflow-x-auto">
            <table className="w-full text-sm">

            <thead className="bg-slate-50 text-left text-xs text-slate-600">
                <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Course / Section</th>
                <th className="px-5 py-3">Activity</th>
                <th className="px-5 py-3">Submitted</th>
                <th className="px-5 py-3">Points</th>
                <th className="px-5 py-3">Action</th>
                </tr>
            </thead>


            <tbody>
                {queue.map((request) => (
                <tr
                    key={request.requestId}
                    className="border-t"
                >

                    <td className="px-5 py-3">
                    <p className="font-medium text-slate-900">
                        {request.studentName}
                    </p>
                    <p className="text-xs text-slate-500">
                        {request.studentEmail}
                    </p>
                    </td>

                    <td className="px-5 py-3">
                    {formatCourse(request)}
                    </td>


                    <td className="px-5 py-3">
                    {request.categoryName}
                    </td>


                    <td className="px-5 py-3">
                    {formatDate(request.createdAt)}
                    </td>

                    <td className="px-5 py-3">
                    {formatPoints(request.defaultPoints)}
                    </td>


                    <td className="pl-1 pr-5 py-3 text-right">
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