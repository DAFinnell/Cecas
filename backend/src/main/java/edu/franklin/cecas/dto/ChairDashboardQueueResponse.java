package edu.franklin.cecas.dto;

import java.time.LocalDateTime;

import edu.franklin.cecas.domain.ExtraCreditRequest;
import edu.franklin.cecas.domain.ExtraCreditRequestStatus;

public class ChairDashboardQueueResponse {
    private int requestId;
    private String studentName;
    private String studentEmail;
    private int courseId;
    private String courseCode;
    private String term;
    private String section;
    private int categoryId;
    private String categoryName;
    private String description;
    private ExtraCreditRequestStatus status;
    private int defaultPoints;
    private Integer awardedPoints;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ChairDashboardQueueResponse() {}
    
    public ChairDashboardQueueResponse(ExtraCreditRequest request) {
        this.requestId = request.getId();
        this.studentName = request.getStudent().getFullName();
        this.studentEmail = request.getStudent().getEmail();
        this.courseId = request.getCourse().getCourseId();
        this.courseCode = request.getCourse().getCourseCode();
        this.term = request.getCourse().getTerm();
        this.section = request.getCourse().getSection();
        this.categoryId = request.getCategory().getCategoryId();
        this.categoryName = request.getCategory().getCategoryName();
        this.description = request.getDescription();
        this.status = request.getStatus();
        this.defaultPoints = request.getCategory().getDefaultPoints();
        this.awardedPoints = request.getAwardedPoints();
        this.dueDate = request.getDueDate();
        this.createdAt = request.getCreatedAt();
        this.updatedAt = request.getUpdatedAt();
    }

    public int getRequestId() {
        return requestId;
    }

    public String getStudentName() {
        return studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public int getCourseId() {
        return courseId;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public String getTerm() {
        return term;
    }

    public String getSection() {
        return section;
    }

    public int getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public String getDescription() {
        return description;
    }

    public ExtraCreditRequestStatus getStatus() {
        return status;
    }

    public int getDefaultPoints() {
        return defaultPoints;
    }

    public Integer getAwardedPoints() {
        return awardedPoints;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
