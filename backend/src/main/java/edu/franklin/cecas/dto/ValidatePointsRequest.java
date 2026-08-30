package edu.franklin.cecas.dto;

public class ValidatePointsRequest {
    private Integer studentId;
    private String term;
    private int requestedPoints;

    public ValidatePointsRequest() {}

    public ValidatePointsRequest(Integer studentId, String term, int requestedPoints) {
        this.studentId = studentId;
        this.term = term;
        this.requestedPoints = requestedPoints;
    }

    public Integer getStudentId() {
        return studentId;
    }

    public void setStudentId(Integer studentId) {
        this.studentId = studentId;
    }

    public String getTerm() {
        return term;
    }

    public void setTerm(String term) {
        this.term = term;
    }

    public int getRequestedPoints() {
        return requestedPoints;
    }

    public void setRequestedPoints(int requestedPoints) {
        this.requestedPoints = requestedPoints;
    }
}
