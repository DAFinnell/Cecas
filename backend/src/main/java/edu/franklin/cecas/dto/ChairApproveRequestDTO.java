package edu.franklin.cecas.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class ChairApproveRequestDTO {

    @NotNull(message = "Points are required.")
    @Positive(message = "Points must be greater than zero.")
    private Integer points;

    @Size(max = 1000, message = "Feedback must be 1000 characters or fewer")
    private String feedback;

    public ChairApproveRequestDTO() {}

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}
