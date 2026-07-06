import csrfService from './CsrfService'
import type {
  CategoryOption,
  CourseOption,
  CreateExtraCreditRequestPayload,
  ExtraCreditRequestResponse,
  StudentPointsSummary,
} from '../types/extraCredit.types'

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = await response.json()

    if (typeof payload?.detail === 'string') {
      return payload.detail
    }

    if (typeof payload?.message === 'string') {
      return payload.message
    }

    if (typeof payload?.title === 'string') {
      return payload.title
    }
  } catch {
    try {
      const text = await response.text()
      if (text.trim().length > 0) {
        return text
      }
    } catch {
      // Keep generic status message below.
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

async function postJson<T>(url: string, payload: unknown): Promise<T> {
  await csrfService.init()

  const response = await csrfService.fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return (await response.json()) as T
}

class ExtraCreditRequestService {
  getCourses(): Promise<CourseOption[]> {
    return fetchJson<CourseOption[]>('/api/lookup/courses')
  }

  getCategories(): Promise<CategoryOption[]> {
    return fetchJson<CategoryOption[]>('/api/lookup/categories')
  }

  getPointSummary(): Promise<StudentPointsSummary> {
    return fetchJson<StudentPointsSummary>('/api/users/me/points')
  }

  createRequest(payload: CreateExtraCreditRequestPayload): Promise<ExtraCreditRequestResponse> {
    return postJson<ExtraCreditRequestResponse>('/api/extra-credit-requests', payload)
  }
}

const extraCreditRequestService = new ExtraCreditRequestService()

export default extraCreditRequestService
