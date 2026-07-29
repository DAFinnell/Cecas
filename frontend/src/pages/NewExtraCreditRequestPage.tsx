import { type FormEvent, useEffect, useMemo, useState } from 'react'
import extraCreditRequestService from '../services/ExtraCreditRequestService'
import type { CategoryOption, CourseOption, StudentPointsSummary } from '../types/extraCredit.types'
import { useNavigate } from 'react-router-dom'
import { routes } from '../app/routes'

const POINT_CAP = 50
const MIN_DESCRIPTION_LENGTH = 15
const MAX_DESCRIPTION_LENGTH = 1000

export default function NewExtraCreditRequestPage() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [selectedTerm, setSelectedTerm] = useState('')
  const [selectedCourseCode, setSelectedCourseCode] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [pointsSummary, setPointsSummary] = useState<StudentPointsSummary>({
    issued: 0,
    pending: 0,
    available: POINT_CAP,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const selectedCourse = useMemo(
    () =>
      courses.find(
        (course) =>
          course.term === selectedTerm &&
          course.courseCode === selectedCourseCode &&
          course.section === selectedSection,
      ),
    [courses, selectedTerm, selectedCourseCode, selectedSection],
  )

  const uniqueTerms = useMemo(() => {
    return Array.from(new Set(courses.map((c) => c.term)))
  }, [courses])

  const uniqueCourseCodes = useMemo(() => {
    if (!selectedTerm) return []
    const filtered = courses.filter((c) => c.term === selectedTerm)
    return Array.from(new Set(filtered.map((c) => c.courseCode)))
  }, [courses, selectedTerm])

  const uniqueSections = useMemo(() => {
    if (!selectedTerm || !selectedCourseCode) return []
    const filtered = courses.filter(
      (c) => c.term === selectedTerm && c.courseCode === selectedCourseCode,
    )
    return Array.from(new Set(filtered.map((c) => c.section)))
  }, [courses, selectedTerm, selectedCourseCode])

  const selectedCategory = useMemo(
    () => categories.find((category) => category.categoryId === Number(categoryId)),
    [categories, categoryId],
  )

  const trimmedDescription = description.trim()
  const issued = Number(pointsSummary?.issued ?? 0)
  const pendingPts = Number(pointsSummary?.pending ?? 0)
  const newRequestPoints = Number(selectedCategory?.defaultPoints ?? 0)
  const projectedTotal = issued + pendingPts + newRequestPoints
  const availablePts = Number(pointsSummary?.available ?? Math.max(0, POINT_CAP - issued - pendingPts))
  const exceedsPointCap = projectedTotal > POINT_CAP
  const descriptionTooShort =
    trimmedDescription.length > 0 && trimmedDescription.length < MIN_DESCRIPTION_LENGTH
  const descriptionTooLong = trimmedDescription.length > MAX_DESCRIPTION_LENGTH
  const descriptionInvalid = descriptionTooShort || descriptionTooLong
  const canSubmit =
    !isSubmitting &&
    Boolean(selectedCourse) &&
    Boolean(selectedCategory) &&
    trimmedDescription.length >= MIN_DESCRIPTION_LENGTH &&
    trimmedDescription.length <= MAX_DESCRIPTION_LENGTH &&
    !exceedsPointCap

  useEffect(() => {
    let isActive = true

    async function loadFormData() {
      try {
        setIsLoading(true)
        setLoadError(null)

        const [courseOptions, categoryOptions] = await Promise.all([
          extraCreditRequestService.getCourses(),
          extraCreditRequestService.getCategories(),
        ])

        if (!isActive) return

        setCourses(courseOptions)
        setCategories(categoryOptions)
      } catch (error) {
        if (isActive) {
          setLoadError(error instanceof Error ? error.message : 'Unable to load request form data.')
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadFormData()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    let isActive = true

    async function loadPointSummaryForSelectedCourse() {
      if (!selectedTerm || !selectedCourseCode || !selectedSection || !selectedCourse) {
        setPointsSummary({
          issued: 0,
          pending: 0,
          available: POINT_CAP,
        })
        return
      }

      try {
        const pointSummary = await extraCreditRequestService.getPointSummary(selectedCourse.term)

        if (isActive) {
          setPointsSummary(pointSummary)
        }
      } catch (error) {
        if (isActive) {
          setSubmitError(error instanceof Error ? error.message : 'Unable to load point summary.')
        }
      }
    }

    void loadPointSummaryForSelectedCourse()

    return () => {
      isActive = false
    }
  }, [selectedCourse, selectedTerm, selectedCourseCode, selectedSection])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(null)
    setSuccessMessage(null)

    if (!selectedCourse || !selectedCategory) {
      setSubmitError('Select both a course and an extra credit category before submitting.')
      return
    }

    if (
      trimmedDescription.length < MIN_DESCRIPTION_LENGTH ||
      trimmedDescription.length > MAX_DESCRIPTION_LENGTH
    ) {
      setSubmitError(
        `Description must be between ${MIN_DESCRIPTION_LENGTH} and ${MAX_DESCRIPTION_LENGTH} characters.`,
      )
      return
    }

    if (exceedsPointCap) {
      setSubmitError('This request would exceed the 50 point cap and cannot be submitted.')
      return
    }

    try {
      setIsSubmitting(true)

      const createdRequest = await extraCreditRequestService.createRequest({
        courseId: selectedCourse.courseId,
        categoryId: selectedCategory.categoryId,
        description: trimmedDescription,
      })

      setSuccessMessage(`Request #${createdRequest.id} was submitted with Pending status.`)
      setCategoryId('')
      setDescription('')
      setSelectedTerm('')
      setSelectedCourseCode('')
      setSelectedSection('')
      navigate(routes.student.dashboard, { replace: true })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to submit request.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          New Extra Credit Request
        </h1>
        <p className="mt-4 max-w-3xl text-slate-600">
          Select your course, choose the extra credit category, and describe the activity.
          The form checks the 50 point cap before submitting the request with Pending status.
        </p>
      </div>

      {loadError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {loadError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 block">
              <span className="text-sm font-medium text-slate-700">Term</span>
              <select
                value={selectedTerm}
                onChange={(event) => {
                  setSelectedTerm(event.target.value)
                  setSelectedCourseCode('')
                  setSelectedSection('')
                  setSubmitError(null)
                  setSuccessMessage(null)
                }}
                disabled={isLoading}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100"
              >
                <option value="">Select term</option>
                {uniqueTerms.map((term) => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2 block">
              <span className="text-sm font-medium text-slate-700">Course Code</span>
              <select
                value={selectedCourseCode}
                onChange={(event) => {
                  setSelectedCourseCode(event.target.value)
                  setSelectedSection('')
                  setSubmitError(null)
                  setSuccessMessage(null)
                }}
                disabled={isLoading || !selectedTerm}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100"
              >
                <option value="">Select course code</option>
                {uniqueCourseCodes.map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2 block">
              <span className="text-sm font-medium text-slate-700">Section</span>
              <select
                value={selectedSection}
                onChange={(event) => {
                  setSelectedSection(event.target.value)
                  setSubmitError(null)
                  setSuccessMessage(null)
                }}
                disabled={isLoading || !selectedCourseCode} // Dependent disable rule
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100"
              >
                <option value="">Select section</option>
                {uniqueSections.map((section) => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2 block">
              <span className="text-sm font-medium text-slate-700">Category</span>
              <select
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(event.target.value)
                  setSubmitError(null)
                  setSuccessMessage(null)
                }}
                disabled={isLoading}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.categoryName} ({category.defaultPoints} pts)
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedCategory ? (
            <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
              <p className="text-sm font-semibold text-sky-950">
                {selectedCategory.categoryName}
              </p>
              <p className="mt-1 text-sm leading-6 text-sky-800">
                {selectedCategory.description}
              </p>
              <p className="mt-2 text-sm font-medium text-sky-950">
                Category value: {selectedCategory.defaultPoints} points
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              Select a category to view its description and point value.
            </div>
          )}

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Request Description
            </span>
            <textarea
              value={description}
              onChange={(event) => {
                setDescription(event.target.value)
                setSubmitError(null)
                setSuccessMessage(null)
              }}
              rows={7}
              maxLength={MAX_DESCRIPTION_LENGTH}
              aria-describedby="request-description-help"
              aria-invalid={descriptionInvalid}
              placeholder="Describe the activity, when it occurred, and why it should qualify for extra credit."
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
            <span
              id="request-description-help"
              className={`text-xs ${descriptionInvalid ? 'text-rose-700' : 'text-slate-500'}`}
            >
              {trimmedDescription.length}/{MAX_DESCRIPTION_LENGTH} characters. Description must be
              between {MIN_DESCRIPTION_LENGTH} and {MAX_DESCRIPTION_LENGTH} characters.
            </span>
          </label>

          {submitError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              {submitError}
            </div>
          )}

          {successMessage && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              {successMessage}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>

            <button
              type="button"
              onClick={() => {
                setCategoryId('')
                setDescription('')
                setSubmitError(null)
                setSuccessMessage(null)
                setSelectedTerm('')
                setSelectedCourseCode('')
                setSelectedSection('')
              }}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Clear Form
            </button>
          </div>
        </form>

        <aside className="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">
              Point cap check
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              50 point cap
            </h2>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">Earned</dt>
              <dd className="font-semibold text-slate-950">{issued}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">Pending</dt>
              <dd className="font-semibold text-slate-950">{pendingPts}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">Available</dt>
              <dd className="font-semibold text-slate-950">{availablePts}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">This request</dt>
              <dd className="font-semibold text-slate-950">{newRequestPoints}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-slate-200 pt-3">
              <dt className="text-slate-600">Projected total</dt>
              <dd className="font-semibold text-slate-950">{projectedTotal}</dd>
            </div>
          </dl>

          <div
            className={`rounded-2xl p-4 text-sm ${exceedsPointCap
              ? 'bg-rose-50 text-rose-800 ring-1 ring-rose-200'
              : 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
              }`}
          >
            {isLoading
              ? 'Loading point totals...'
              : exceedsPointCap
                ? 'Blocked: this request would exceed the 50 point cap.'
                : 'Ready: this request is within the 50 point cap.'}
          </div>
        </aside>
      </div>
    </section>
  )
}
