package edu.franklin.cecas.dto;

import java.time.LocalDateTime;

import edu.franklin.cecas.domain.ExtraCreditRequest;
import edu.franklin.cecas.domain.ExtraCreditRequestStatus;

public class StudentRequestSummaryDTO {
    private Integer id;
    private String courseCode;
    private String term;
    private String section;
    private String categoryName;
    private ExtraCreditRequestStatus status;
    private Integer defaultPoints;
    private Integer awardedPoints;
    private LocalDateTime updatedAt;

    public StudentRequestSummaryDTO(ExtraCreditRequest request) {
        this.id = request.getId();
        this.courseCode = request.getCourse().getCourseCode();
        this.term = request.getCourse().getTerm();
        this.section = request.getCourse().getSection();
        this.categoryName = request.getCategory().getCategoryName();
        this.status = request.getStatus();
        this.defaultPoints = request.getCategory().getDefaultPoints();
        this.awardedPoints = request.getAwardedPoints();
        this.updatedAt = request.getUpdatedAt();
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

    public ExtraCreditRequestStatus getStatus() {
        return status;
    }

    public Integer getDefaultPoints() {
        return defaultPoints;
    }

    public Integer getAwardedPoints() {
        return awardedPoints;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
