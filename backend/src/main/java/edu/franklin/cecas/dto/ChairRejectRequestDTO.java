package edu.franklin.cecas.dto;

import jakarta.validation.constraints.NotBlank;

public class ChairRejectRequestDTO {

    @NotBlank(message = "Feedback is required.")
    private String feedback;

    public ChairRejectRequestDTO() {}

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}
