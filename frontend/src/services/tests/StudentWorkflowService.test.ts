import { beforeEach, describe, expect, it, vi } from 'vitest'
import studentWorkflowService from '../StudentWorkflowService'

describe('StudentWorkflowService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches point summary for the student dashboard', async () => {
    const payload = {
      issued: 10,
      pending: 15,
      available: 25,
    }

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    const result = await studentWorkflowService.getMyPoints()

    expect(fetchSpy).toHaveBeenCalledWith('/api/users/me/points', {
      credentials: 'same-origin',
    })
    expect(result).toEqual(payload)
  })

  it('fetches request listings with the dashboard fields the UI uses', async () => {
    const payload = [
      {
        id: 1,
        courseCode: 'COMP-201',
        term: '26/SU',
        section: 'H1WW',
        categoryName: 'Homework',
        defaultPoints: 10,
        status: 'PENDING',
        updatedAt: '2026-06-21T10:30:00',
      },
    ]

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    const result = await studentWorkflowService.getRequests()

    expect(fetchSpy).toHaveBeenCalledWith('/api/extra-credit-requests', {
      credentials: 'same-origin',
    })
    expect(result).toEqual(payload)
  })
})