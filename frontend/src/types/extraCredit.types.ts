export type CourseOption = {
  courseId: number
  courseCode: string
  term: string
  section: string
}

export type CategoryOption = {
  categoryId: number
  categoryName: string
  description: string
  defaultPoints: number
}

export type StudentPointsSummary = {
  issued: number
  pending: number
  available: number
}

export type ExtraCreditRequestStatus =
  | 'PENDING'
  | 'PRE_APPROVED'
  | 'REJECTED'
  | 'EVIDENCE_SUBMITTED'
  | 'CLOSED'
  | 'APPROVED'

export type ExtraCreditRequestResponse = {
  id: number
  description: string
  course: CourseOption
  category: CategoryOption
  status: ExtraCreditRequestStatus
  awardedPoints: number | null
  createdAt: string | null
  updatedAt: string | null
}

export type CreateExtraCreditRequestPayload = {
  courseId: number
  categoryId: number
  description: string
}
