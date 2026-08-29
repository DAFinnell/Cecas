import type {
  ChairDashboardQueueResponse,
  ChairDashboardSummaryResponse,
} from '../types/chair.types'
import csrfService from './CsrfService'

class ChairDashboardService {
  private readonly CHAIR_BASE = '/api/chair/dashboard'

  async getRequestCountSummary(): Promise<ChairDashboardSummaryResponse> {
    const res = await csrfService.fetch(`${this.CHAIR_BASE}/summary`, {
      credentials: 'same-origin',
    })

    if (!res.ok) {
      throw new Error(`Failed to load summary (${res.status})`)
    }

    return res.json()
  }

  async getChairReviewQueue(status: string = 'PENDING'): Promise<ChairDashboardQueueResponse[]> {
    const res = await csrfService.fetch(`${this.CHAIR_BASE}/queue?status=${status}`, {
      credentials: 'same-origin',
    })

    if (!res.ok) {
      throw new Error(`Failed to load review queue (${res.status})`)
    }

    return res.json()
  }
}

export default new ChairDashboardService()
