package edu.franklin.cecas.dto;

public class ChairDashboardSummaryResponse {
    private long pendingCount;
    private long preApprovedCount;
    private long evidenceSubmittedCount;
    private long approvedCount;
    private long rejectedCount;

    public ChairDashboardSummaryResponse() {}

    public ChairDashboardSummaryResponse(
            long pendingCount,
            long preApprovedCount,
            long evidenceSubmittedCount,
            long approvedCount,
            long rejectedCount) {
        this.pendingCount = pendingCount;
        this.preApprovedCount = preApprovedCount;
        this.evidenceSubmittedCount = evidenceSubmittedCount;
        this.approvedCount = approvedCount;
        this.rejectedCount = rejectedCount;
    }

    public long getPendingCount() {
        return pendingCount;
    }

    public void setPendingCount(long pendingCount) {
        this.pendingCount = pendingCount;
    }

    public long getPreApprovedCount() {
        return preApprovedCount;
    }

    public void setPreApprovedCount(long preApprovedCount) {
        this.preApprovedCount = preApprovedCount;
    }

    public long getEvidenceSubmittedCount() {
        return evidenceSubmittedCount;
    }

    public void setEvidenceSubmittedCount(long evidenceSubmittedCount) {
        this.evidenceSubmittedCount = evidenceSubmittedCount;
    }

    public long getApprovedCount() {
        return approvedCount;
    }

    public void setApprovedCount(long approvedCount) {
        this.approvedCount = approvedCount;
    }

    public long getRejectedCount() {
        return rejectedCount;
    }

    public void setRejectedCount(long rejectedCount) {
        this.rejectedCount = rejectedCount;
    }
}
