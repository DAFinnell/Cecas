import { beforeEach, describe, expect, it, vi } from 'vitest'
import chairDashboardService from '../ChairDashboardService'
import csrfService from '../CsrfService'

vi.mock('../CsrfService', () => ({
  default: {
    fetch: vi.fn(),
  },
}))

describe('ChairDashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches the chair dashboard summary', async () => {
    const payload = {
      pendingCount: 2,
      preApprovedCount: 1,
      evidenceSubmittedCount: 3,
      approvedCount: 4,
      rejectedCount: 1,
    }

    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await chairDashboardService.getRequestCountSummary()

    expect(csrfService.fetch).toHaveBeenCalledWith(
      '/api/chair/dashboard/summary',
      { credentials: 'same-origin' },
    )
    expect(result).toEqual(payload)
  })

  it('fetches the pending review queue by default', async () => {
    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await chairDashboardService.getChairReviewQueue()

    expect(csrfService.fetch).toHaveBeenCalledWith(
      '/api/chair/dashboard/queue?status=PENDING',
      { credentials: 'same-origin' },
    )
    expect(result).toEqual([])
  })

  it('fetches the evidence submitted review queue', async () => {
    const payload = [
      {
        requestId: 42,
        studentName: 'Derek Test',
        studentEmail: 'derek@derek.com',
        courseId: 3,
        courseCode: 'COMP-110',
        term: '26/FA',
        section: 'H1WW',
        categoryId: 9,
        categoryName: 'Seminar Attendance',
        status: 'EVIDENCE_SUBMITTED',
        defaultPoints: 5,
        createdAt: '2026-07-01T10:30:00',
      },
    ]

    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await chairDashboardService.getChairReviewQueue('EVIDENCE_SUBMITTED')

    expect(csrfService.fetch).toHaveBeenCalledWith(
      '/api/chair/dashboard/queue?status=EVIDENCE_SUBMITTED',
      { credentials: 'same-origin' },
    )
    expect(result).toEqual(payload)
  })

  it('throws when the dashboard summary cannot be loaded', async () => {
    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response(null, { status: 500 }),
    )

    await expect(
      chairDashboardService.getRequestCountSummary(),
    ).rejects.toThrow('Failed to load summary (500)')
  })

  it('throws when the review queue cannot be loaded', async () => {
    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response(null, { status: 403 }),
    )

    await expect(
      chairDashboardService.getChairReviewQueue('EVIDENCE_SUBMITTED'),
    ).rejects.toThrow('Failed to load review queue (403)')
  })
})
