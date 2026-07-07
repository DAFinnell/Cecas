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
            { courseId: 1, courseCode: 'COMP-201', term: '26/SU', section: 'H1WW' },
        ]

        vi.mocked(csrfService.fetch).mockResolvedValue(
            new Response(JSON.stringify(payload), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            })
        )

        const result = await extraCreditRequestService.getCourses()

        expect(csrfService.fetch).toHaveBeenCalledWith('/api/lookup/courses')
        expect(result).toEqual(payload)
    })

    it('fetches category options for the new request form', async () => {
        const payload = [
            {
                categoryId: 2,
                categoryName: 'Homework',
                description: 'Standard homework assignment category',
                defaultPoints: 10,
            },
        ]

        vi.mocked(csrfService.fetch).mockResolvedValue(
            new Response(JSON.stringify(payload), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            })
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
            })
        )

        const result = await extraCreditRequestService.getPointSummary()

        expect(csrfService.fetch).toHaveBeenCalledWith('/api/users/me/points')
        expect(result).toEqual(payload)
    })

    it('submits a new extra credit request', async () => {
        const payload = {
            courseId: 1,
            categoryId: 2,
            description: 'Completed an extra assignment for the course.',
        }

        const responseBody = {
            id: 99,
            courseCode: 'COMP-201',
            term: '26/SU',
            section: 'H1WW',
            categoryName: 'Homework',
            defaultPoints: 10,
            status: 'PENDING',
            updatedAt: '2026-07-04T12:59:00',
        }

        vi.mocked(csrfService.init).mockResolvedValue(undefined)
        vi.mocked(csrfService.fetch).mockResolvedValue(
            new Response(JSON.stringify(responseBody), {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
            })
        )

        const result = await extraCreditRequestService.createRequest(payload)

        expect(csrfService.init).toHaveBeenCalled()
        expect(csrfService.fetch).toHaveBeenCalledWith(
            '/api/extra-credit-requests',
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
        )
        expect(result).toEqual(responseBody)
    })

    it('surfaces backend validation messages for invalid request descriptions', async () => {
        vi.mocked(csrfService.init).mockResolvedValue(undefined)
        vi.mocked(csrfService.fetch).mockResolvedValue(
            new Response(JSON.stringify({
                title: 'Validation failed',
                errors: {
                    description: 'description must be 1000 characters or fewer',
                },
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            })
        )

        await expect(
            extraCreditRequestService.createRequest({
                courseId: 1,
                categoryId: 2,
                description: 'a'.repeat(1001),
            })
        ).rejects.toThrow('Validation failed')
    })

    it('surfaces backend error messages when request submission fails', async () => {
        vi.mocked(csrfService.init).mockResolvedValue(undefined)
        vi.mocked(csrfService.fetch).mockResolvedValue(
            new Response(JSON.stringify({ detail: 'Failed to create request' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            })
        )

        await expect(
            extraCreditRequestService.createRequest({
                courseId: 1,
                categoryId: 2,
                description: 'Completed an extra assignment for the course.',
            })
        ).rejects.toThrow('Failed to create request')
    })
})
