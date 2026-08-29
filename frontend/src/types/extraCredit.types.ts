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
  'PENDING' | 'PRE_APPROVED' | 'REJECTED' | 'EVIDENCE_SUBMITTED' | 'CLOSED' | 'APPROVED'

export type StudentRequestSummary = {
  id: number
  courseCode: string
  term: string
  section: string
  categoryName: string
  status: ExtraCreditRequestStatus
  defaultPoints: number
  awardedPoints: number | null
  evidenceUploadAvailable: boolean
  updatedAt: string | null
  dueDate: string | null
}

export type StudentRequestDetail = StudentRequestSummary & {
  categoryDescription: string
  description: string
  createdAt: string | null
  chairFeedback: string | null
}

export type CreateExtraCreditRequestPayload = {
  courseId: number
  categoryId: number
  description: string
}
