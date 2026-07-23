import { useEffect, useState, useRef } from "react"
import {  useNavigate, useParams } from "react-router-dom"
import type { StudentRequestDetail } from "../types/extraCredit.types"
import extraCreditRequestService from "../services/ExtraCreditRequestService"
import { formatCourse, formatStatus } from "../util/format.util"
import  CameraIcon  from "../assets/Camera.svg"

const EVIDENCE_TYPE = ['pdf','jpg','png']
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

export default function EvidenceUploadPage() {
  const { requestId } = useParams<{ requestId: string }>()
  const navigate = useNavigate()
  const [request, setRequest] = useState<StudentRequestDetail | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!requestId) return
    setLoading(true)
    extraCreditRequestService
      .getStudentRequestDetail(Number(requestId))
      .then((r) => setRequest(r))
      .catch(() => setRequest(null))
      .finally(() => setLoading(false))
  }, [requestId])

  const validate = (file: File) => {
    setError(null)
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!EVIDENCE_TYPE.includes(ext)) {
      return `Unsupported file type. Allowed: ${EVIDENCE_TYPE.join(', ')}`
    }
    if (file.size > MAX_BYTES) {
      return `File exceeds the ${Math.round(MAX_BYTES / 1024 / 1024)} MB limit.`
    }
    return null
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!request) return
    if (request.status !== 'PRE_APPROVED') {
      setError('This request is not accepting evidence.')
      return
    }
    if (!file) {
      setError('Please select a file to upload.')
      return
    }

    const v = validate(file)
    if (v) {
      setError(v)
      return
    }

    const form = new FormData()
    form.append('evidence', file)
    try {
        setSubmitting(true)
   await extraCreditRequestService.uploadEvidence(request.id, file)
      // refresh request to get updated status/feedback from server
      const refreshed = await extraCreditRequestService.getStudentRequestDetail(request.id)
      setRequest(refreshed)
    } catch (err: any) {
      setError(err?.message ?? 'Upload failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div>Loading…</div>
  if (!request) return <div>Request not found</div>

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
    <div className="mb-8">
        <button
            onClick={() => navigate(-1)}
            className="mb-4 text-medium text-sky-700 hover:underline"
        >
            &larr; Back to My Requests
        </button>

        <h1 className="text-3xl font-bold text-slate-900">
            Upload Evidence
        </h1>

        <p className="mt-2 text-slate-600">
            Submit supporting documentation for your pre-approved request.
        </p>
    </div>
      <section className="rounded-xl border p-4 border-slate-200 bg-white shadow-sm">
        <div className="mb-4 border-b pb-2">
            <h2 className="text-lg   font-semibold">
                Request Summary
            </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
                Course
            </p>

            <p className="font-medium">
                {formatCourse(request)}
            </p>
        </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
                Activity / Category
            </p>

            <p className="font-medium">
                {request.categoryName}
            </p>
        </div>
        <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
                Submitted Description
            </p>

            <p className="font-medium">
                {request.description ?? '—'}
            </p>
        </div>

        <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
                Current Status
            </p>

            <p className="font-medium">
                <span
                  className={`inline-flex text-medium font-semibold ${
                    request.status === 'PRE_APPROVED'
                      ? 'bg-blue-100 text-blue-800'
                      : request.status === 'EVIDENCE_SUBMITTED'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {formatStatus(request.status)}
                </span>
            </p>
        </div>

        <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
                Due Date
            </p>

            <p className="font-medium">
                {request.dueDate ?? 'No due date'}
            </p>
        </div>

        {request.chairFeedback && (
            <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                    Chair Feedback
                </p>

                <p className="font-medium">
                    {request.chairFeedback}
                </p>
            </div>
        )}
    </div>
    </section>

    {request.status === 'EVIDENCE_SUBMITTED' ? (
    <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-6">
        <h2 className="text-lg font-semibold text-green-900">
        &#10003; Evidence Uploaded
        </h2>

        <p className="mt-2 text-sm text-green-800">
        Your supporting documentation has been uploaded successfully and is now
        awaiting chair review.
        </p>

        <button
        type="button"
        onClick={() => navigate(`/student/requests/${request.id}`)}
        className="mt-4 rounded bg-sky-700 px-4 py-2 text-white hover:bg-sky-800"
        >
        Return to Request Details
        </button>
    </div>
        ) : (

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="text-sm text-slate-700">
            {request.dueDate && <div>Due date applies: {request.dueDate}</div>}
          </div>

        <div>
            {/* hidden native input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={EVIDENCE_TYPE.map((type) => `.${type}`).join(',')}
              className="hidden"
              onChange={(event) => {
                const fileAdded = event.target.files?.[0] ?? null
                setFile(fileAdded)
                setError(fileAdded ? validate(fileAdded) : null)
              }}
            />

            {/* click / drag-drop box */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const fileAdded = e.dataTransfer?.files?.[0] ?? null
                if (fileAdded) {
                  setFile(fileAdded)
                  setError(validate(fileAdded))
                }
              }}
              className="mt-2 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600 hover:border-sky-400 hover:bg-sky-50 cursor-pointer"
            >
              <div>
                <img src={CameraIcon} alt="Camera Icon" />
              </div>

              <div className="font-medium text-slate-800">Drag & drop a file here, or click to choose</div>
              <div className="text-xs text-slate-500">Allowed: {EVIDENCE_TYPE.join(', ')} · Max {Math.round(MAX_BYTES / 1024 / 1024)} MB</div>

              {file && (
                <div className="mt-2 w-full text-left">
                  <div className="flex items-center gap-3">
                    {file.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="h-12 w-12 rounded object-cover border"
                        onLoad={(ev) => URL.revokeObjectURL((ev.target as HTMLImageElement).src)}
                      />
                    ) : (
                      <div className="h-12 w-12 flex items-center justify-center rounded bg-slate-100 text-xs text-slate-600 border">File</div>
                    )}
                    <div className="text-sm text-slate-700">
                      <div className="font-medium">{file.name}</div>
                      <div className="text-xs text-slate-500">{Math.round(file.size / 1024)} KB</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded bg-sky-700 text-white disabled:opacity-50"
            >
              {submitting ? 'Uploading…' : 'Upload evidence'}
            </button>
          </div>
        </form>
      )}
    </main>
  )
}
