import { beforeEach, describe, expect, it, vi } from 'vitest'
import extraCreditRequestService from '../ExtraCreditRequestService'
import csrfService from '../CsrfService'

vi.mock('../CsrfService', () => ({
  default: {
    init: vi.fn(),
    fetch: vi.fn(),
  },
}))

describe('ExtraCreditRequestService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches course options for the new request form', async () => {
    const payload = [
      { courseId: 1, courseCode: 'COMP-110', term: '26/FA', section: 'H1WW' },
    ]

    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await extraCreditRequestService.getCourses()

    expect(csrfService.fetch).toHaveBeenCalledWith('/api/lookup/courses')
    expect(result).toEqual(payload)
  })

  it('fetches category options for the new request form', async () => {
    const payload = [
      {
        categoryId: 1,
        categoryName: 'Seminar Attendance',
        description: 'Approved attendance at an academic or professional seminar',
        defaultPoints: 5,
      },
    ]

    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await extraCreditRequestService.getCategories()

    expect(csrfService.fetch).toHaveBeenCalledWith('/api/lookup/categories')
    expect(result).toEqual(payload)
  })

  it('fetches the current student point summary for the form', async () => {
    const payload = {
      issued: 10,
      pending: 15,
      available: 25,
    }

    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await extraCreditRequestService.getPointSummary('26/FA')

    expect(csrfService.fetch).toHaveBeenCalledWith('/api/users/me/points?term=26%2FFA')
    expect(result).toEqual(payload)
  })

  it('fetches student requests as flattened summaries', async () => {
    const requests = [
      {
        id: 42,
        courseCode: 'COMP-110',
        term: '26/FA',
        section: 'H1WW',
        categoryName: 'Seminar Attendance',
        status: 'PENDING',
        defaultPoints: 5,
        awardedPoints: null,
        updatedAt: '2026-07-05T12:00:00',
      },
    ]

    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response(JSON.stringify(requests), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await extraCreditRequestService.getStudentRequests()

    expect(csrfService.fetch).toHaveBeenCalledWith('/api/extra-credit-requests')
    expect(result).toEqual(requests)
    expect(result[0]).not.toHaveProperty('course')
    expect(result[0]).not.toHaveProperty('category')
    expect(result[0]).not.toHaveProperty('studentId')
  })

  it('preserves each tracked student request status', async () => {
    const requests = [
      { id: 1, status: 'PENDING' },
      { id: 2, status: 'PRE_APPROVED' },
      { id: 3, status: 'EVIDENCE_SUBMITTED' },
      { id: 4, status: 'REJECTED' },
    ]

    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response(JSON.stringify(requests), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await extraCreditRequestService.getStudentRequests()

    expect(result.map((request) => request.status)).toEqual([
      'PENDING',
      'PRE_APPROVED',
      'EVIDENCE_SUBMITTED',
      'REJECTED',
    ])
  })

  it('creates student requests as flattened details', async () => {
    const payload = {
      courseId: 1,
      categoryId: 1,
      description: 'I attended an approved academic seminar',
    }

    const createdRequest = {
      id: 42,
      courseCode: 'COMP-110',
      term: '26/FA',
      section: 'H1WW',
      categoryName: 'Seminar Attendance',
      status: 'PENDING',
      defaultPoints: 5,
      awardedPoints: null,
      updatedAt: '2026-07-05T12:00:00',
      categoryDescription: 'Approved attendance at an academic or professional seminar',
      description: 'I attended an approved academic seminar',
      createdAt: '2026-07-05T12:00:00',
      chairFeedback: null,
    }

    vi.mocked(csrfService.init).mockResolvedValue(undefined)
    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response(JSON.stringify(createdRequest), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await extraCreditRequestService.createRequest(payload)

    expect(csrfService.init).toHaveBeenCalled()
    expect(csrfService.fetch).toHaveBeenCalledWith(
      '/api/extra-credit-requests',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    )
    expect(result).toEqual(createdRequest)
    expect(result).not.toHaveProperty('course')
    expect(result).not.toHaveProperty('category')
    expect(result).not.toHaveProperty('studentId')
  })

  it('surfaces backend validation messages for invalid request descriptions', async () => {
    vi.mocked(csrfService.init).mockResolvedValue(undefined)
    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response(JSON.stringify({
        title: 'Validation failed',
        errors: {
          description: 'description must be between 15 and 1000 characters',
        },
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(
      extraCreditRequestService.createRequest({
        courseId: 1,
        categoryId: 1,
        description: 'a'.repeat(1001),
      }),
    ).rejects.toThrow('Validation failed')
  })

  it('surfaces backend error messages when request submission fails', async () => {
    vi.mocked(csrfService.init).mockResolvedValue(undefined)
    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response(JSON.stringify({ detail: 'Failed to create request' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(
      extraCreditRequestService.createRequest({
        courseId: 1,
        categoryId: 1,
        description: 'I attended an approved academic seminar',
      }),
    ).rejects.toThrow('Failed to create request')
  })

  it('uploads student evidence as multipart form data', async () => {
    const file = new File(['%PDF-1.7 test'], 'derek-proof.pdf', {
      type: 'application/pdf',
    })

    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response(null, { status: 200 }),
    )

    await extraCreditRequestService.uploadEvidence(42, file)

    expect(csrfService.fetch).toHaveBeenCalledWith(
      '/api/extra-credit-requests/42/evidence',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }),
    )

    const [, options] = vi.mocked(csrfService.fetch).mock.calls[0]
    const body = options?.body as FormData
    expect(body.get('evidence')).toBe(file)
  })

  it('surfaces backend validation messages when evidence upload fails', async () => {
    const file = new File(['not really a pdf'], 'derek-proof.pdf', {
      type: 'application/pdf',
    })

    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response(JSON.stringify({
        detail: 'Evidence file must be a PDF, JPG, or PNG.',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(
      extraCreditRequestService.uploadEvidence(42, file),
    ).rejects.toThrow('Evidence file must be a PDF, JPG, or PNG.')
  })
})
