package edu.franklin.cecas.dto;

public class ValidatePointsRequest {
    private Integer studentId;
    private int requestedPoints;

    public ValidatePointsRequest() {}

    public ValidatePointsRequest(Integer studentId, int requestedPoints) {
        this.studentId = studentId;
        this.requestedPoints = requestedPoints;
    }

    public Integer getStudentId() {
        return studentId;
    }

    public void setStudentId(Integer studentId) {
        this.studentId = studentId;
    }

    public int getRequestedPoints() {
        return requestedPoints;
    }

    public void setRequestedPoints(int requestedPoints) {
        this.requestedPoints = requestedPoints;
    }
}
