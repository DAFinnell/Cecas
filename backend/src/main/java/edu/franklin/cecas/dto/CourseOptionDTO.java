package edu.franklin.cecas.dto;

import edu.franklin.cecas.domain.Course;

public record CourseOptionDTO(
        Integer courseId,
        String courseCode,
        String term,
        String section) {
    public CourseOptionDTO(Course course) {
        this(course.getCourseId(), course.getCourseCode(), course.getTerm(), course.getSection());
    }
}
