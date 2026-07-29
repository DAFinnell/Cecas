import type {
  ChangePasswordRequest,
  CurrentUserResponse,
  LoginRequest,
  RegisterRequest,
} from '../types/auth.types'
import csrfService from './CsrfService'

class AuthService {
  private readonly AUTH_BASE = '/api/auth'
  private readonly USER_BASE = '/api/users'

  async register(payload: RegisterRequest): Promise<CurrentUserResponse> {
    await csrfService.init()

    const res = await csrfService.fetch(`${this.AUTH_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      throw res
    }

    return (await res.json()) as CurrentUserResponse
  }

  async login(payload: LoginRequest): Promise<CurrentUserResponse> {
    await csrfService.init()

    const res = await csrfService.fetch(`${this.AUTH_BASE}/login`, {
      method: 'POST', 
      credentials: 'include', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      throw res
    }

    const body = (await res.json()) as CurrentUserResponse
    window.dispatchEvent(new Event('auth-changed'));
    return body
  }

  async fetchCurrentUser(): Promise<CurrentUserResponse> {
    const res = await csrfService.fetch(`${this.AUTH_BASE}/me`)

    if (!res.ok) {
      throw res
    }

    return (await res.json()) as CurrentUserResponse
  }

  async logout(): Promise<void> {
    await csrfService.init()

    const res = await csrfService.fetch(`${this.AUTH_BASE}/logout`, {
      method: 'POST',
    })

    if (!res.ok) {
      throw res
    }
    window.dispatchEvent(new Event('auth-changed'))
  }

  async changePassword(payload: ChangePasswordRequest): Promise<string> {
    await csrfService.init()

    const res = await csrfService.fetch(`${this.USER_BASE}/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      throw res
    }

    return await res.text()
  }

  async forceChangePassword(payload: ChangePasswordRequest): Promise<string> {
    await csrfService.init()

    const res = await csrfService.fetch(`${this.USER_BASE}/force-change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      throw res
    }

  
    window.dispatchEvent(new Event('auth-changed'))
    return await res.text()
  }
}

const authService = new AuthService()
export default authService