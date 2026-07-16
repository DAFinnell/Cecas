package edu.franklin.cecas.dto;

import java.nio.file.Path;
import java.time.LocalDateTime;

import edu.franklin.cecas.domain.ExtraCreditRequest;
import edu.franklin.cecas.domain.ExtraCreditRequestStatus;

public class StudentRequestDetailDTO {
    private Integer id;
    private String courseCode;
    private String term;
    private String section;
    private String categoryName;
    private String categoryDescription;
    private String description;
    private ExtraCreditRequestStatus status;
    private Integer defaultPoints;
    private Integer awardedPoints;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String chairFeedback;
    private LocalDateTime dueDate;
    private boolean evidenceFileUploaded;
    private boolean evidenceUploadAvailable;
    private String evidenceFileName;

    public StudentRequestDetailDTO(ExtraCreditRequest request) {
        this.id = request.getId();
        this.courseCode = request.getCourse().getCourseCode();
        this.term = request.getCourse().getTerm();
        this.section = request.getCourse().getSection();
        this.categoryName = request.getCategory().getCategoryName();
        this.categoryDescription = request.getCategory().getDescription();
        this.description = request.getDescription();
        this.status = request.getStatus();
        this.defaultPoints = request.getCategory().getDefaultPoints();
        this.awardedPoints = request.getAwardedPoints();
        this.createdAt = request.getCreatedAt();
        this.updatedAt = request.getUpdatedAt();
        this.chairFeedback = request.getChairFeedback();
        this.dueDate = request.getDueDate();
        this.evidenceFileUploaded = request.getEvidenceFilePath() != null && !request.getEvidenceFilePath().isBlank();
        this.evidenceUploadAvailable = request.getStatus() == ExtraCreditRequestStatus.PRE_APPROVED
                && !this.evidenceFileUploaded;
        this.evidenceFileName = this.evidenceFileUploaded
                ? Path.of(request.getEvidenceFilePath()).getFileName().toString()
                : null;
    }

    public Integer getId() {
        return id;
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

    public String getCategoryName() {
        return categoryName;
    }

    public String getCategoryDescription() {
        return categoryDescription;
    }

    public String getDescription() {
        return description;
    }

    public ExtraCreditRequestStatus getStatus() {
        return status;
    }

    public Integer getDefaultPoints() {
        return defaultPoints;
    }

    public Integer getAwardedPoints() {
        return awardedPoints;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public String getChairFeedback() {
        return chairFeedback;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public boolean isEvidenceFileUploaded() {
        return evidenceFileUploaded;
    }

    public boolean isEvidenceUploadAvailable() {
        return evidenceUploadAvailable;
    }

    public String getEvidenceFileName() {
        return evidenceFileName;
    }
}
