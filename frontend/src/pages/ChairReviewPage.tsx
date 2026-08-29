import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { ChairRequestActionDTO, ChairReviewDTO } from '../types/chair.types'
import ChairReviewRequestService from '../services/ChairReviewRequestService'
import { formatDate } from '../util/format.util'

export default function ChairReviewPage() {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const [review, setReview] = useState<ChairReviewDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [points, setPoints] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  function applyAction(action: ChairRequestActionDTO) {
    setReview((current) =>
      current
        ? {
            ...current,
            status: action.status,
            awardedPoints: action.awardedPoints,
            chairFeedback: action.chairFeedback,
            updatedAt: action.updatedAt,
          }
        : current,
    )

    if (action.awardedPoints !== null) {
      setPoints(String(action.awardedPoints))
    }

    setFeedback(action.chairFeedback ?? '')
  }

  async function handlePreApprove() {
    if (!requestId || saving) return

    setSaving(true)
    setActionError(null)

    try {
      const action = await ChairReviewRequestService.preApprove(Number(requestId))
      // update local view from the action response (avoid calling pending-only GET)
      applyAction(action)
    } catch (err) {
      console.error('Pre-approve failed', err)

      setActionError(err instanceof Error ? err.message : 'Failed to pre-approve request.')
    } finally {
      setSaving(false)
    }
  }

  async function handleReject() {
    if (!requestId || saving) return

    const reason = window.prompt('Reason for rejection (required):', '')

    if (reason === null) return

    const normalizedReason = reason.trim()

    if (!normalizedReason) {
      setActionError('Feedback is required when rejecting a request.')
      return
    }

    setSaving(true)
    setActionError(null)

    try {
      const action = await ChairReviewRequestService.reject(Number(requestId), {
        feedback: normalizedReason,
      })

      applyAction(action)
    } catch (error) {
      console.error('Reject failed', error)
      setActionError(error instanceof Error ? error.message : 'Failed to reject request.')
    } finally {
      setSaving(false)
    }
  }

  async function handleApprove() {
    if (!requestId || saving) return

    const parsedPoints = Number(points)

    if (!Number.isInteger(parsedPoints) || parsedPoints <= 0) {
      setActionError('Enter a whole number of points greater than zero.')
      return
    }

    setSaving(true)
    setActionError(null)

    try {
      const action = await ChairReviewRequestService.approve(Number(requestId), {
        points: parsedPoints,
        feedback: feedback.trim() || null,
      })

      applyAction(action)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Approval failed.')
    } finally {
      setSaving(false)
    }
  }

  async function handleFinalReject() {
    if (!requestId || saving) return

    const normalizedFeedback = feedback.trim()

    if (!normalizedFeedback) {
      setActionError('Feedback is required when rejecting evidence.')
      return
    }

    setSaving(true)
    setActionError(null)

    try {
      const action = await ChairReviewRequestService.reject(Number(requestId), {
        feedback: normalizedFeedback,
      })

      applyAction(action)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Rejection failed.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!requestId) return

    let cancelled = false

    ChairReviewRequestService.getRequestForReview(Number(requestId))
      .then((data) => {
        if (cancelled) return

        setReview(data)

        setPoints(String(data.awardedPoints ?? data.defaultPoints))

        setFeedback(data.chairFeedback ?? '')
      })
      .catch((err) => {
        if (cancelled) return

        console.error('Failed to load chair review', err)

        setLoadError(err instanceof Error ? err.message : 'Failed to load request.')
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [requestId])

  if (!requestId) {
    return (
      <div className="mx-auto max-w-3xl py-10 text-center">
        <p className="text-red-600">Missing request ID.</p>
      </div>
    )
  }

  if (loading) {
    return <div className="flex justify-center py-10">Loading...</div>
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl py-10 text-center">
        <p className="text-red-600">{loadError}</p>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          &larr; Back to Review Queue
        </button>
      </div>
    )
  }

  if (review === null) {
    return <div className="flex justify-center py-10">Request not found.</div>
  }

  const numericRequestId = Number(requestId)
  const evidenceUrl = ChairReviewRequestService.evidenceUrl(numericRequestId)
  const evidenceDownloadUrl = ChairReviewRequestService.evidenceUrl(numericRequestId, true)
  const isImage = review.evidenceContentType?.startsWith('image/') ?? false
  const isPdf = review.evidenceContentType === 'application/pdf'

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}

      <button type="button" className="text-blue-600 text-sm" onClick={() => navigate(-1)}>
        &larr; Back to Review Queue
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{review.studentName}</h1>

          <p className="text-slate-500">
            {review.courseCode} • {review.section} • {review.term}
          </p>
        </div>

        {(() => {
          const map = (() => {
            switch (review.status) {
              case 'PENDING':
                return { text: 'Pending (Pre-Review)', bg: 'bg-amber-100', color: 'text-amber-800' }
              case 'PRE_APPROVED':
                return { text: 'Pre-Approved', bg: 'bg-blue-100', color: 'text-blue-800' }
              case 'EVIDENCE_SUBMITTED':
                return { text: 'Evidence Submitted', bg: 'bg-orange-100', color: 'text-orange-800' }
              case 'APPROVED':
                return { text: 'Approved', bg: 'bg-emerald-100', color: 'text-emerald-800' }
              case 'REJECTED':
                return { text: 'Rejected', bg: 'bg-red-100', color: 'text-red-800 ' }
              case 'CLOSED':
                return { text: 'Closed', bg: 'bg-slate-200', color: 'text-slate-700' }
            }
          })()

          return (
            <span className={`rounded-md px-4 py-2 text-sm font-medium ${map.bg} ${map.color}`}>
              {map.text}
            </span>
          )
        })()}
      </div>

      {/* For rejected requests show a simplified 2-step flow:
       Pending - Final Decision. Otherwise show the normal 4-step flow. 
       NOTE: we are not allowing resubmission of same request when pre-review is rejected. 
       A new request needs to be created.*/}
      {(() => {
        const isRejectedTwoStep = review.status === 'REJECTED' && !review.evidenceAvailable
        const steps = isRejectedTwoStep
          ? ['Pending', 'Final Decision']
          : ['Pending', 'Waiting for Evidence', 'Evidence Submitted', 'Final Decision']

        const activeIndex = (() => {
          if (isRejectedTwoStep) {
            return review.status === 'PENDING' ? 0 : steps.length
          }

          switch (review.status) {
            case 'PENDING':
              return 0
            case 'PRE_APPROVED':
              return 1
            case 'EVIDENCE_SUBMITTED':
              return 2
            case 'APPROVED':
            case 'REJECTED':
              return steps.length
            default:
              return 0
          }
        })()
        return (
          <div className="relative py-6">
            {/* baseline line */}
            <div className="absolute left-6 right-6 top-1/2 transform -translate-y-1/2">
              <div className="h-px bg-slate-200" />
            </div>

            <div className="flex items-center justify-between px-6">
              {steps.map((label, idx) => {
                const isDone = idx < activeIndex
                const isActive = idx === activeIndex

                return (
                  <div
                    key={label}
                    className="flex flex-col items-center z-10"
                    style={{ width: `${100 / steps.length}%` }}
                  >
                    <div
                      className={`flex items-center justify-center w-9 h-9 rounded-full border-2 ${
                        isDone
                          ? 'bg-green-600 border-green-600'
                          : isActive
                            ? 'bg-sky-700 border-sky-700'
                            : 'bg-white border-slate-300'
                      }`}
                      aria-current={isActive ? 'step' : undefined}
                    >
                      {isDone ? (
                        <svg
                          className="w-4 h-4 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            d="M20 6L9 17l-5-5"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <span
                          className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-600'}`}
                        >
                          {idx + 1}
                        </span>
                      )}
                    </div>

                    <div
                      className={`mt-3 text-xs text-center ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}
                    >
                      {label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}
      {/* Main Content */}

      <div className="grid grid-cols-2 gap-6">
        {/* LEFT */}

        <div className="rounded-xl border p-6 bg-white">
          <h2 className="font-semibold mb-5">Request Information</h2>

          <div className="grid grid-cols-[170px_1fr] gap-y-4 text-sm">
            <span>Activity</span>
            <span>{review.categoryName}</span>

            <span>Category Description</span>
            <span>{review.categoryDescription}</span>

            <span>Student Description</span>
            <span className="whitespace-pre-wrap">{review.description}</span>

            <span>Requested Points</span>
            <span>{review.defaultPoints}</span>

            <span>Default Points</span>
            <span>{review.defaultPoints}</span>

            {review.status === 'APPROVED' && (
              <>
                <span>Awarded Points</span>
                <span>{review.awardedPoints ?? '-'}</span>
              </>
            )}

            <span>Submitted on</span>
            <span>{formatDate(review.createdAt)}</span>

            <span>Student Email</span>
            <span>{review.studentEmail}</span>
          </div>
        </div>

        {/* RIGHT */}

        {(() => {
          switch (review.status) {
            case 'PENDING':
              return (
                <div className="space-y-6">
                  <div className="rounded-xl border p-10 text-center">
                    <p className="font-medium">No evidence submitted yet.</p>

                    <p className="text-slate-500 mt-2">
                      The student can upload evidence after pre-approval.
                    </p>
                  </div>
                </div>
              )

            case 'PRE_APPROVED':
              return (
                <div className="rounded-xl border bg-amber-50 p-6">
                  <h2 className="font-semibold mb-5">Status</h2>

                  <p className="mb-4">Request Pre-Approved</p>

                  <div className="grid grid-cols-[140px_1fr] gap-y-4">
                    {/* <span>Due Date</span>
                    <span>{review.dueDate}</span> */}

                    <span>Status</span>
                    <span>Waiting for Evidence</span>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button className="border rounded px-6 py-2">Change Due Date</button>
                  </div>
                </div>
              )

            case 'EVIDENCE_SUBMITTED':
            case 'APPROVED':
            case 'REJECTED':
              if (!review.evidenceAvailable) {
                return (
                  <div className="rounded-xl border bg-slate-50 p-10 text-center">
                    <p className="font-medium">No evidence file is available.</p>

                    <p className="mt-2 text-sm text-slate-500">
                      This request does not have an uploaded evidence file.
                    </p>
                  </div>
                )
              }

              return (
                <section className="rounded-xl border bg-white p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="font-semibold">Submitted Evidence</h2>

                      <p className="mt-1 break-all text-sm text-slate-500">
                        {review.evidenceFileName ?? 'Uploaded evidence'}
                      </p>
                    </div>

                    <a
                      href={evidenceDownloadUrl}
                      className="shrink-0 rounded border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Download
                    </a>
                  </div>

                  {isImage && (
                    <div className="mt-6">
                      <img
                        src={evidenceUrl}
                        alt="Evidence submitted by the student"
                        className="max-h-[600px] w-full rounded-lg border bg-slate-50 object-contain"
                      />
                    </div>
                  )}

                  {isPdf && (
                    <div className="mt-6 rounded-lg bg-slate-50 p-8 text-center">
                      <p className="text-sm text-slate-600">
                        The student submitted a PDF document.
                      </p>

                      <a
                        href={evidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-block rounded bg-sky-700 px-5 py-2 text-sm font-medium text-white hover:bg-sky-800"
                      >
                        Open PDF
                      </a>
                    </div>
                  )}

                  {!isImage && !isPdf && (
                    <div className="mt-6 rounded-lg bg-red-50 p-4">
                      <p className="text-sm text-red-700">
                        This evidence file type cannot be previewed.
                      </p>
                    </div>
                  )}
                </section>
              )

            default:
              return null
          }
        })()}
      </div>

      {actionError && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </p>
      )}

      {/* Bottom Action Buttons */}

      {(() => {
        switch (review.status) {
          case 'PENDING':
            return (
              <div className="flex justify-end gap-4">
                <button
                  className="border border-red-500 px-12 rounded text-red-600"
                  onClick={handleReject}
                  disabled={saving}
                >
                  {saving ? 'Working...' : 'Reject'}
                </button>

                <button
                  className="bg-sky-700 text-white px-12 py-2 rounded"
                  onClick={handlePreApprove}
                  disabled={saving}
                >
                  {saving ? 'Working...' : 'Pre-Approve'}
                </button>
              </div>
            )

          case 'EVIDENCE_SUBMITTED':
            return (
              <section className="rounded-xl border bg-white p-6">
                <h2 className="font-semibold">Final Decision</h2>

                <div className="mt-5 flex gap-4">
                  <div>
                    <label htmlFor="awarded-points" className="block text-sm font-medium">
                      Awarded points
                    </label>

                    <input
                      id="awarded-points"
                      type="number"
                      min="1"
                      step="1"
                      className="mt-1 w-24 rounded border px-3 py-2"
                      value={points}
                      onChange={(event) => setPoints(event.target.value)}
                    />
                  </div>

                  <div className="flex-1">
                    <label htmlFor="chair-feedback" className="block text-sm font-medium">
                      Chair feedback
                    </label>

                    <p className="text-xs text-slate-500">
                      Optional for approval and required for rejection.
                    </p>

                    <textarea
                      id="chair-feedback"
                      className="mt-1 min-h-28 w-full rounded border p-3"
                      value={feedback}
                      maxLength={1000}
                      onChange={(event) => setFeedback(event.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleFinalReject}
                    disabled={saving}
                    className="rounded border border-red-500 px-8 py-2 text-red-600 disabled:opacity-50"
                  >
                    {saving ? 'Working...' : 'Reject'}
                  </button>

                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={saving}
                    className="rounded bg-green-600 px-8 py-2 text-white disabled:opacity-50"
                  >
                    {saving ? 'Working...' : 'Approve'}
                  </button>
                </div>
              </section>
            )

          case 'APPROVED':
            return null

          case 'REJECTED':
            return null

          default:
            return null
        }
      })()}
    </div>
  )
}
