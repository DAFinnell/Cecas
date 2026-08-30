package edu.franklin.cecas.dto;

import java.time.LocalDateTime;

public class ChairReviewDTO {

    private Integer requestId;
    private String status;
    private String description;
    private String studentName;
    private String studentEmail;
    private Integer studentId;
    private String program;
    private Integer courseId;
    private String courseCode;
    private String term;
    private String section;
    private Integer categoryId;
    private String categoryName;
    private String categoryDescription;
    private Integer defaultPoints;
    private StudentPointsDTO pointsSummary;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer awardedPoints;
    private String chairFeedback;
    private boolean evidenceAvailable;
    private String evidenceFileName;
    private String evidenceContentType;

    public ChairReviewDTO() {}

    public Integer getRequestId() {
        return requestId;
    }

    public void setRequestId(Integer requestId) {
        this.requestId = requestId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public Integer getStudentId() {
        return studentId;
    }

    public void setStudentId(Integer studentId) {
        this.studentId = studentId;
    }

    public String getProgram() {
        return program;
    }

    public void setProgram(String program) {
        this.program = program;
    }

    public Integer getCourseId() {
        return courseId;
    }

    public void setCourseId(Integer courseId) {
        this.courseId = courseId;
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

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getCategoryDescription() {
        return categoryDescription;
    }

    public void setCategoryDescription(String categoryDescription) {
        this.categoryDescription = categoryDescription;
    }

    public Integer getDefaultPoints() {
        return defaultPoints;
    }

    public void setDefaultPoints(Integer defaultPoints) {
        this.defaultPoints = defaultPoints;
    }

    public StudentPointsDTO getPointsSummary() {
        return pointsSummary;
    }

    public void setPointsSummary(StudentPointsDTO pointsSummary) {
        this.pointsSummary = pointsSummary;
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

    public Integer getAwardedPoints() {
        return awardedPoints;
    }

    public void setAwardedPoints(Integer awardedPoints) {
        this.awardedPoints = awardedPoints;
    }

    public String getChairFeedback() {
        return chairFeedback;
    }

    public void setChairFeedback(String chairFeedback) {
        this.chairFeedback = chairFeedback;
    }

    public boolean getEvidenceAvailable() {
        return evidenceAvailable;
    }

    public void setEvidenceAvailable(boolean evidenceAvailable) {
        this.evidenceAvailable = evidenceAvailable;
    }

    public String getEvidenceFileName() {
        return evidenceFileName;
    }

    public void setEvidenceFileName(String evidenceFileName) {
        this.evidenceFileName = evidenceFileName;
    }

    public String getEvidenceContentType() {
        return evidenceContentType;
    }

    public void setEvidenceContentType(String evidenceContentType) {
        this.evidenceContentType = evidenceContentType;
    }
}
