import { describe, it, expect, beforeEach, vi } from 'vitest'
import authService from '../AuthService'
import csrfService from '../CsrfService'

vi.mock('../CsrfService', () => ({
  default: {
    init: vi.fn(),
    fetch: vi.fn(),
  },
}))

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.stubGlobal('window', {
      dispatchEvent: vi.fn(),
    })
  })

  it('registers user successfully', async () => {
    const user = {
      authenticated: true,
      email: 'newstudent@test.edu',
      role: 'STUDENT',
      mustChangePassword: false,
    }

    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response(JSON.stringify(user), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await authService.register({
      fullName: 'New Student',
      email: 'newstudent@test.edu',
      password: 'password123',
      program: 'Computer Science',
      studentId: 123456,
    })

    expect(result).toEqual(user)
  })

  it('logs in successfully', async () => {
    const user = {
      authenticated: true,
      email: 'student@test.edu',
      role: 'STUDENT',
      mustChangePassword: false,
    }

    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response(JSON.stringify(user), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const spyEvent = vi.fn()
    vi.stubGlobal('window', { dispatchEvent: spyEvent })

    const result = await authService.login({
      email: 'student@test.edu',
      password: 'password123',
    })

    expect(result).toEqual(user)
    expect(spyEvent).toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('throws on login failure', async () => {
    const mockResponse = new Response(null, { status: 401 })
    vi.mocked(csrfService.fetch).mockResolvedValue(mockResponse)

    await expect(
      authService.login({
        email: 'bad@test.edu',
        password: 'wrong',
      }),
    ).rejects.toBe(mockResponse)
  })

  it('logs out successfully', async () => {
    vi.mocked(csrfService.fetch).mockResolvedValue(new Response(null, { status: 200 }))

    await authService.logout()

    expect(csrfService.fetch).toHaveBeenCalledWith(
      '/api/auth/logout',
      expect.objectContaining({
        method: 'POST',
      }),
    )
  })

  it('throws on logout failure', async () => {
    const mockResponse = new Response(null, { status: 500 })
    vi.mocked(csrfService.fetch).mockResolvedValue(mockResponse)

    await expect(authService.logout()).rejects.toBe(mockResponse)
  })

  it('fetches current user', async () => {
    const user = {
      authenticated: true,
      email: 'student@test.edu',
      role: 'STUDENT',
      mustChangePassword: false,
    }

    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response(JSON.stringify(user), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await authService.fetchCurrentUser()

    expect(result.email).toBe('student@test.edu')
  })

  it('changes password successfully', async () => {
    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response('Password updated', {
        status: 200,
      }),
    )

    const result = await authService.changePassword({
      currentPassword: 'oldpassword',
      newPassword: 'newpassword',
      confirmPassword: 'newpassword',
    })

    expect(result).toBe('Password updated')
  })

  it('throws on change password failure', async () => {
    const mockResponse = new Response('Invalid password', { status: 400 })
    vi.mocked(csrfService.fetch).mockResolvedValue(mockResponse)

    await expect(
      authService.changePassword({
        currentPassword: 'oldpassword',
        newPassword: 'bad',
        confirmPassword: 'bad',
      }),
    ).rejects.toBe(mockResponse)
  })

  it('force changes password successfully', async () => {
    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response('Password force updated', {
        status: 200,
      }),
    )

    const result = await authService.forceChangePassword({
      currentPassword: 'oldpassword',
      newPassword: 'newpassword',
      confirmPassword: 'newpassword',
    })

    expect(result).toBe('Password force updated')
  })

  it('throws on force change password failure', async () => {
    const mockResponse = new Response('Forbidden', { status: 403 })
    vi.mocked(csrfService.fetch).mockResolvedValue(mockResponse)

    await expect(
      authService.forceChangePassword({
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
        confirmPassword: 'newpassword',
      }),
    ).rejects.toBe(mockResponse)
  })

  it('preserves mustChangePassword when current user requires a password change', async () => {
    const user = {
      authenticated: true,
      email: 'chair@test.edu',
      role: 'CHAIR',
      mustChangePassword: true,
    }

    vi.mocked(csrfService.fetch).mockResolvedValue(
      new Response(JSON.stringify(user), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await authService.fetchCurrentUser()

    expect(result).toEqual(user)
    expect(result.mustChangePassword).toBe(true)
  })
})
