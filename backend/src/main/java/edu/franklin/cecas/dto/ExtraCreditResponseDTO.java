package edu.franklin.cecas.dto;

import edu.franklin.cecas.domain.ExtraCreditRequest;
import edu.franklin.cecas.domain.ExtraCreditRequestStatus;
import java.time.LocalDateTime;

public class ExtraCreditResponseDTO {
    private Integer id;
    // course
    private String courseCode;
    private String term;
    private String section;
    // category
    private Integer defaultPoints;
    private String categoryName;

    private Integer studentId;
    // status & points
    private ExtraCreditRequestStatus status;
    private Integer requestedPoints;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // for UI purposes
    private boolean actionRequired;
    private boolean canUploadEvidence;

    public ExtraCreditResponseDTO() {}

    public ExtraCreditResponseDTO(ExtraCreditRequest extraCreditRequest) {
        this.id = extraCreditRequest.getId();
        this.studentId = extraCreditRequest.getStudent().getId();
        this.courseCode = extraCreditRequest.getCourse().getCourseCode();
        this.term = extraCreditRequest.getCourse().getTerm();
        this.section = extraCreditRequest.getCourse().getSection();
        this.defaultPoints = extraCreditRequest.getCategory().getDefaultPoints();
        this.categoryName = extraCreditRequest.getCategory().getCategoryName();
        this.status = extraCreditRequest.getStatus();
        this.createdAt = extraCreditRequest.getCreatedAt();
        this.updatedAt = extraCreditRequest.getUpdatedAt();
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getTerm() {
        return term;
    }

    public void setTerm(String term) {
        this.term = term;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public Integer getDefaultPoints() {
        return defaultPoints;
    }

    public void setDefaultPoints(Integer defaultPoints) {
        this.defaultPoints = defaultPoints;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Integer getStudentId() {
        return studentId;
    }

    public void setStudentId(Integer studentId) {
        this.studentId = studentId;
    }

    public ExtraCreditRequestStatus getStatus() {
        return status;
    }

    public void setStatus(ExtraCreditRequestStatus status) {
        this.status = status;
    }

    public Integer getRequestedPoints() {
        return requestedPoints;
    }

    public void setRequestedPoints(Integer requestedPoints) {
        this.requestedPoints = requestedPoints;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isActionRequired() {
        return actionRequired;
    }

    public void setActionRequired(boolean actionRequired) {
        this.actionRequired = actionRequired;
    }

    public boolean isCanUploadEvidence() {
        return canUploadEvidence;
    }

    public void setCanUploadEvidence(boolean canUploadEvidence) {
        this.canUploadEvidence = canUploadEvidence;
    }
} 
       