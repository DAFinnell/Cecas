import type { ExtraCreditRequestStatus, StudentRequestSummary } from '../types/extraCredit.types'
import type { ChairDashboardQueueResponse } from '../types/chair.types'

export function formatTerm(term: string): string {
  const normalized = term.trim().toUpperCase()
  const match = /^(\d{2}|\d{4})[/-](SP|SU|FA|WI)$/.exec(normalized)

  if (!match) {
    return term
  }

  const [, rawYear, code] = match
  const year = rawYear.length === 2 ? `20${rawYear}` : rawYear

  const termNames: Record<string, string> = {
    SP: 'Spring',
    SU: 'Summer',
    FA: 'Fall',
    WI: 'Winter',
  }

  return `${termNames[code]} ${year}`
}

export function formatCourse(request: StudentRequestSummary | ChairDashboardQueueResponse): string {
  return [request.courseCode, formatTerm(request.term), request.section].filter(Boolean).join(' · ')
}

export function formatDate(value: string | null): string {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function formatPoints(points: number): string {
  return `${points} pts`
}

export function formatStatus(status: ExtraCreditRequestStatus): string {
  return status
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function getStatusBadgeClass(status: ExtraCreditRequestStatus): string {
  switch (status) {
    case 'APPROVED':
      return 'bg-emerald-100 text-emerald-800 ring-emerald-200'

    case 'PRE_APPROVED':
      return 'bg-blue-100 text-blue-800 ring-blue-200'

    case 'PENDING':
      return 'bg-amber-100 text-amber-800 ring-amber-200'

    case 'EVIDENCE_SUBMITTED':
      return 'bg-orange-100 text-orange-800 ring-orange-200'

    case 'REJECTED':
      return 'bg-red-100 text-red-800 ring-red-200'

    case 'CLOSED':
      return 'bg-slate-200 text-slate-700 ring-slate-300'
  }
}
