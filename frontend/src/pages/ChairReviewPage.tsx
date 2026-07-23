import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ChairReviewDTO } from "../types/chair.types";
import ChairReviewRequestService from "../services/ChairReviewRequestService";
import { formatDate } from "../util/format.util";
import type { ExtraCreditRequestStatus } from "../types/extraCredit.types";


export default function ChairReviewPage() {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const [review, setReview] = useState<ChairReviewDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function handlePreApprove() {
    if (!requestId) return;
    setSaving(true);
    try {
      const action = await ChairReviewRequestService.preApprove(Number(requestId));
      // update local view from the action response (avoid calling pending-only GET)
      setReview((r) =>
        r
          ? {
              ...r,
              status: action.status as ExtraCreditRequestStatus,
              updatedAt: action.updatedAt ?? r.updatedAt,
            }
          : r 
        );
    } catch (err) {
      console.error("Pre-approve failed", err);
      alert("Failed to pre-approve request.")
    } finally {
      setSaving(false);
    }
 }

 async function handleReject() {
    if (!requestId) return;
    const reason = window.prompt("Reason for rejection (optional):", "");
    setSaving(true);
    try {
      const action = await ChairReviewRequestService.reject(
        Number(requestId),
        reason ? { feedback: reason } : undefined
      );

      // update local view from the action response and persist chair feedback if returned
      setReview((r) =>
        r
          ? {
              ...r,
              status: action.status as ExtraCreditRequestStatus,
              updatedAt: action.updatedAt ?? r.updatedAt,
          }
          : r
      );
    } catch (err) {
      console.error("Reject failed", err);
      alert("Failed to reject request.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!requestId) return;

    ChairReviewRequestService.getRequestForReview(Number(requestId))
      .then(setReview)
      .finally(() => setLoading(false));
  }, [requestId]);
    if (loading) {
      return (
        <div className="flex justify-center py-10">
          Loading...
        </div>
      );
    }

    if (review === null) {
      return (
        <div className="flex justify-center py-10">
          Request not found.
        </div>
      );
    }
  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* Header */}

        <button
        type="button"
        className="text-blue-600 text-sm"
        onClick={() => navigate(-1)}
      >
        &larr; Back to Review Queue
      </button>

      <div className="flex items-start justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            {review.studentName}
          </h1>

          <p className="text-slate-500">
            {review.courseCode} • {review.section} • {review.term} 
          </p>
        </div>

        {(() => {
          const map = (() => {
            switch (review.status) {
              case "PENDING":
                return { text: "Pending (Pre-Review)", bg: "bg-amber-100", color: "text-amber-800" };
              case "PRE_APPROVED":
                return { text: "Pre-Approved", bg: "bg-blue-100", color: "text-blue-800" };
              case "EVIDENCE_SUBMITTED":
                return { text: "Evidence Submitted", bg: "bg-orange-100", color: "text-orange-800" };
              case "APPROVED":
                return { text: "Approved", bg: "bg-emerald-100", color: "text-emerald-800" };
              case "REJECTED":
                return { text: "Rejected", bg: "bg-red-100", color: "text-red-800 " };
              case "CLOSED":
                return { text: "Closed", bg: "bg-slate-200", color: "text-slate-700" };
            }
          })();

          return (
            <span className={`rounded-md px-4 py-2 text-sm font-medium ${map.bg} ${map.color}`}>
              {map.text}
            </span>
          );
        })()}

      </div>

      {/* For rejected requests show a simplified 2-step flow:
       Pending - Final Decision. Otherwise show the normal 4-step flow. 
       NOTE: we are not allowing resubmission of same request when pre-review is rejected. 
       A new request needs to be created.*/}
      {(() => {
      const isRejectedTwoStep = review.status === "REJECTED"
      const steps = isRejectedTwoStep
        ? ["Pending", "Final Decision"]
        : ["Pending", "Waiting for Evidence", "Evidence Submitted", "Final Decision"]

      const activeIndex = (() => {
        if (isRejectedTwoStep) {
          return review.status === "PENDING" ? 0 : steps.length
        }

        switch (review.status) {
          case "PENDING":
            return 0;
          case "PRE_APPROVED":
            return 1;
          case "EVIDENCE_SUBMITTED":
            return 2;
          case "APPROVED":
          case "REJECTED":
            return 3;
          default:
            return 0;
        }
      })();
return (
                <div className="relative py-6">
                  {/* baseline line */}
                  <div className="absolute left-6 right-6 top-1/2 transform -translate-y-1/2">
                    <div className="h-px bg-slate-200" />
                  </div>

                  <div className="flex items-center justify-between px-6">
                    {steps.map((label, idx) => {
                      const isDone = idx < activeIndex;
                      const isActive = idx === activeIndex;

                      return (
                        <div key={label} className="flex flex-col items-center z-10" style={{ width: `${100 / steps.length}%` }}>
                          <div
                            className={`flex items-center justify-center w-9 h-9 rounded-full border-2 ${
                              isDone
                                ? "bg-green-600 border-green-600"
                                : isActive
                                ? "bg-sky-700 border-sky-700"
                                : "bg-white border-slate-300"
                            }`}
                            aria-current={isActive ? "step" : undefined}
                          >
                            {isDone ? (
                              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : (
                              <span className={`text-sm font-medium ${isActive ? "text-white" : "text-slate-600"}`}>
                                {idx + 1}
                              </span>
                            )}
                          </div>

                          <div className={`mt-3 text-xs text-center ${isActive ? "text-slate-900 font-semibold" : "text-slate-500"}`}>
                            {label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
             })()}
      {/* Main Content */}

      <div className="grid grid-cols-2 gap-6">

        {/* LEFT */}

        <div className="rounded-xl border p-6 bg-white">

          <h2 className="font-semibold mb-5">
            Request Information
          </h2>

          <div className="grid grid-cols-[170px_1fr] gap-y-4 text-sm">

            <span>Activity</span>
            <span>{review.categoryName}</span>

            <span>Description</span>
            <span>{review.categoryDescription}</span>

            <span>Requested Points</span>
            <span>{review.defaultPoints}</span>

            <span>Default Points</span>
            <span>{review.defaultPoints}</span>

            <span>Submitted on</span>
            <span>{formatDate(review.createdAt)}</span>

            <span>Student Email</span>
            <span>{review.studentEmail}</span>

          </div>

        </div>

        {/* RIGHT */}

        {(() => {

          switch (review.status) {

            case "PENDING":

              return (

                <div className="space-y-6">

                  <div className="rounded-xl border p-10 text-center">

                    <p className="font-medium">
                      No evidence submitted yet.
                    </p>

                    <p className="text-slate-500 mt-2">
                      The student can upload evidence after pre-approval.
                    </p>

                  </div>

                </div>

              );

            case "PRE_APPROVED":

              return (

                <div className="rounded-xl border bg-amber-50 p-6">

                  <h2 className="font-semibold mb-5">
                    Status
                  </h2>

                  <p className="mb-4">
                    Request Pre-Approved
                  </p>

                  <div className="grid grid-cols-[140px_1fr] gap-y-4">

                    {/* <span>Due Date</span>
                    <span>{review.dueDate}</span> */}

                    <span>Status</span>
                    <span>Waiting for Evidence</span>

                  </div>

                  <div className="mt-8 flex gap-3">

                    <button className="border rounded px-6 py-2">
                      Change Due Date
                    </button>

                  </div>

                </div>

              );

            case "EVIDENCE_SUBMITTED":
            case "APPROVED":
            case "REJECTED":

            default:
              return null;

          }

        })()}

      </div>

      {/* Bottom Action Buttons */}

      {(() => {

        switch (review.status) {

          case "PENDING":

            return (

              <div className="flex justify-end gap-4">

                <button
                  className="border border-red-500 px-12 rounded text-red-600"
                  onClick={handleReject}
                  disabled={saving}
                >
                  {saving ? "Working..." : "Reject"}
                </button>

                <button
                  className="bg-sky-700 text-white px-12 py-2 rounded"
                  onClick={handlePreApprove}
                  disabled={saving}
                >
                  {saving ? "Working..." : "Pre-Approve"}
                </button>

              </div>

            );

          case "EVIDENCE_SUBMITTED":

            return (

              <div className="flex justify-between">

                <div className="flex gap-4">

                  <input
                    type="number"
                    className="border rounded px-3 py-2 w-24"
                    defaultValue={review.defaultPoints}
                  />

                  <textarea
                    className="border rounded p-3 w-96"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Chair feedback..."
                  />

                </div>

                <div className="space-y-2">

                  <button className="border border-red-500 text-red-600 rounded px-8 py-2 w-full">
                    Reject
                  </button>

                  <button className="bg-green-600 text-white rounded px-8 py-2 w-full">
                    Approve
                  </button>

                </div>

              </div>

            );

          case "APPROVED":

          case "REJECTED":

          default:
            return null;

        }

      })()}

    </div>
  );
}

