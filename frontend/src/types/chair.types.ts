import type { ExtraCreditRequestStatus, StudentPointsSummary } from "./extraCredit.types";

export interface ChairDashboardSummaryResponse {
  pendingCount: number;
  preApprovedCount: number;
  evidenceSubmittedCount: number;
  approvedCount: number;
  rejectedCount: number;
}

export interface ChairDashboardQueueResponse {
    requestId: number;
    studentName: string;
    studentEmail: string;
    courseId: number;
    courseCode: string;
    term: string;
    section: string;
    categoryId: number;
    categoryName: string;
    status: ExtraCreditRequestStatus;
    defaultPoints: number;
    createdAt: string;
}

export interface ChairReviewDTO {
    requestId: number;
    description: string;
    studentName: string;
    studentEmail: string;
    studentId: number;
    program: string;
    courseId: number;
    courseCode: string;
    term: string;
    section: string;
    categoryId: number;
    categoryName: string;
    categoryDescription: string;
    status: ExtraCreditRequestStatus;
    pointsSummary: StudentPointsSummary;
    defaultPoints: number;
    awardedPoints: number | null;
    chairFeedback: string | null;
    evidenceAvailable: boolean;
    evidenceFileName: string | null;
    evidenceContentType: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ChairRequestActionDTO {
  requestId: number
  status: ExtraCreditRequestStatus
  awardedPoints: number | null
  chairFeedback: string | null
  updatedAt: string
}

export interface ChairRejectRequestDTO {
  feedback: string
}

export interface ChairApproveRequestDTO {
  points: number
  feedback?: string | null
}
