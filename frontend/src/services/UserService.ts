import type { StudentPointsSummary } from '../types/extraCredit.types'
import type { UserProfileResponse } from "../types/user.types";

class UserService {
  private readonly USER_BASE = '/api/users'

  async getUserProfile(): Promise<UserProfileResponse> {
    const res = await fetch(`${this.USER_BASE}/me`, { credentials: 'same-origin' })
    if (!res.ok) throw new Error(`Failed to load profile (${res.status})`)
    return res.json()
  }

  async getMyPoints(): Promise<StudentPointsSummary> {
    const res = await fetch(`${this.USER_BASE}/me/points`, { credentials: 'same-origin' })
    if (!res.ok) throw new Error(`Failed to load points (${res.status})`)
    return res.json()
  }
}

export default new UserService();