import type { StudentRequestSummary } from '../types/extraCredit.types'
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
  return [
    request.courseCode,
    formatTerm(request.term),
    request.section,
  ]
    .filter(Boolean)
    .join(' · ')
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