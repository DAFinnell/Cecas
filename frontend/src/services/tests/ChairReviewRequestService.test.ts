import { beforeEach, describe, expect, it, vi } from 'vitest'
import chairReviewRequestService from '../ChairReviewRequestService'
import csrfService from '../CsrfService'

vi.mock('../CsrfService', () => ({
  default: {
    init: vi.fn(),
    fetch: vi.fn(),
  },
}))

describe('ChairReviewRequestService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(csrfService.init).mockResolvedValue(undefined)
  })

  it('fetches a request for chair review', async () => {
    const payload = {
      requestId: 42,
      description: 'I attended an approved academic seminar',
      studentName: 'Derek Test',
      studentEmail: 'derek@derek.com',
      studentId: 1001,
      program: 'Computer Science',
      courseId: 3,
      courseCode: 'COMP-110',
      term: '26/FA',
      section: 'H1WW',
      categoryId: 9,
      categoryName: 'Seminar Attendance',
      categoryDescription: 'Approved attendance at an academic or professional seminar',
      status: 'EVIDENCE_SUBMITTED',
      pointsSummary: { issued: 10, pending: 5, available: 35 },
      defaultPoints: 5,
      awardedPoints: null,
      chairFeedback: null,
      evidenceAvailable: true,
      evidenceFileName: 'evidence-request-42.pdf',
      evidenceContentType: 'application/pdf',
      createdAt: '2026-07-01T10:30:00',
      updatedAt: '2026-07-02T11:45:00',
    }

    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await chairReviewRequestService.getRequestForReview(42)

    expect(csrfService.fetch).toHaveBeenCalledWith('/api/chair/requests/42/review')
    expect(result).toEqual(payload)
  })

  it('pre-approves a pending request', async () => {
    const payload = {
      requestId: 42,
      status: 'PRE_APPROVED',
      awardedPoints: null,
      chairFeedback: null,
      updatedAt: '2026-07-02T11:45:00',
    }

    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await chairReviewRequestService.preApprove(42)

    expect(csrfService.init).toHaveBeenCalled()
    expect(csrfService.fetch).toHaveBeenCalledWith(
      '/api/chair/requests/42/pre-approve',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      }),
    )
    expect(result).toEqual(payload)
  })

  it('approves evidence with points and optional feedback', async () => {
    const request = {
      points: 5,
      feedback: null,
    }
    const payload = {
      requestId: 42,
      status: 'APPROVED',
      awardedPoints: 5,
      chairFeedback: null,
      updatedAt: '2026-07-02T11:45:00',
    }

    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await chairReviewRequestService.approve(42, request)

    expect(csrfService.init).toHaveBeenCalled()
    expect(csrfService.fetch).toHaveBeenCalledWith(
      '/api/chair/requests/42/approve',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      }),
    )
    expect(result).toEqual(payload)
  })

  it('rejects evidence with required feedback', async () => {
    const request = { feedback: 'Insufficient evidence' }
    const payload = {
      requestId: 42,
      status: 'REJECTED',
      awardedPoints: null,
      chairFeedback: 'Insufficient evidence',
      updatedAt: '2026-07-02T11:45:00',
    }

    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await chairReviewRequestService.reject(42, request)

    expect(csrfService.init).toHaveBeenCalled()
    expect(csrfService.fetch).toHaveBeenCalledWith(
      '/api/chair/requests/42/reject',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      }),
    )
    expect(result).toEqual(payload)
  })

  it('builds inline and download evidence URLs', () => {
    expect(chairReviewRequestService.evidenceUrl(42))
      .toBe('/api/chair/requests/42/evidence')
    expect(chairReviewRequestService.evidenceUrl(42, true))
      .toBe('/api/chair/requests/42/evidence?download=true')
  })

  it('surfaces backend error details when an action fails', async () => {
    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response(JSON.stringify({
        detail: 'Approval requires EVIDENCE_SUBMITTED state.',
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(
      chairReviewRequestService.approve(42, { points: 5 }),
    ).rejects.toThrow('Approval requires EVIDENCE_SUBMITTED state.')
  })

  it('surfaces backend errors when chair review cannot be loaded', async () => {
    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response(JSON.stringify({ title: 'Not Found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(
      chairReviewRequestService.getRequestForReview(42),
    ).rejects.toThrow('Not Found')
  })
})
