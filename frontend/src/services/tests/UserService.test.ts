import { beforeEach, describe, expect, it, vi } from 'vitest'
import userService from '../UserService'

describe('UserService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches the current user profile', async () => {
    const payload = {
      email: 'derek@derek.com',
      fullName: 'Derek Test',
      role: 'STUDENT',
    }

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await userService.getUserProfile()

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/users/me',
      expect.objectContaining({
        credentials: 'include',
        headers: expect.any(Headers),
      }),
    )
    expect(result).toEqual(payload)
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
      }),
    )

    const result = await userService.getMyPoints('26/FA')

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/users/me/points?term=26%2FFA',
      expect.objectContaining({
        credentials: 'include',
        headers: expect.any(Headers),
      }),
    )
    expect(result).toEqual(payload)
  })
})
