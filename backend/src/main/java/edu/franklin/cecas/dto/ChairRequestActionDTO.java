package edu.franklin.cecas.dto;

import java.time.LocalDateTime;

public class ChairRequestActionDTO {

    private Integer requestId;
    private String status;
    private String chairFeedback;
    private LocalDateTime updatedAt;

    public ChairRequestActionDTO() {}

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

    public String getChairFeedback() {
        return chairFeedback;
    }

    public void setChairFeedback(String chairFeedback) {
        this.chairFeedback = chairFeedback;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
