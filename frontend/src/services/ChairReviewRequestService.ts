import csrfService from './CsrfService'
import type {
  ChairReviewDTO,
  ChairRejectRequestDTO,
  ChairRequestActionDTO,
} from "../types/chair.types"

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = await response.json()
    if (typeof payload?.detail === 'string') return payload.detail
    if (typeof payload?.message === 'string') return payload.message
    if (typeof payload?.title === 'string') return payload.title
  } catch {
    try {
      const text = await response.text()
      if (text.trim().length > 0) return text
    } catch {
      // fallthrough
    }
  }
  return `Request failed with status ${response.status}`
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await csrfService.fetch(url)
  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }
  return (await response.json()) as T
}

async function postJson<T>(url: string, payload?: unknown): Promise<T> {
  await csrfService.init()

  const opts: RequestInit = {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
  }

  if (payload !== undefined) {
    opts.headers = { ...(opts.headers as Record<string, string>), 'Content-Type': 'application/json' }
    opts.body = JSON.stringify(payload)
  }

  const response = await csrfService.fetch(url, opts)
  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }
  return (await response.json()) as T
}

class ChairReviewRequestService {
  private readonly BASE = "/api/chair/requests"

  getRequestForReview(requestId: number): Promise<ChairReviewDTO> {
    return fetchJson<ChairReviewDTO>(`${this.BASE}/${requestId}/review`)
  }

  preApprove(requestId: number): Promise<ChairRequestActionDTO> {
    return postJson<ChairRequestActionDTO>(`${this.BASE}/${requestId}/pre-approve`, {})
  }

  reject(requestId: number, payload?: ChairRejectRequestDTO): Promise<ChairRequestActionDTO> {
    return postJson<ChairRequestActionDTO>(`${this.BASE}/${requestId}/reject`, payload ?? {})
  }
}

const chairReviewRequestService = new ChairReviewRequestService()
export default chairReviewRequestService