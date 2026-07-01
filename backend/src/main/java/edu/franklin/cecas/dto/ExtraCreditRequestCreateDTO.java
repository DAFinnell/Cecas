package edu.franklin.cecas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ExtraCreditRequestCreateDTO {

    @NotNull(message = "courseId is required")
    private Integer courseId;

    @NotNull(message = "categoryId is required")
    private Integer categoryId;

    @NotBlank(message = "description is required")
    @Size(max = 1000, message = "description must be 1000 characters or fewer")
    private String description;

    public ExtraCreditRequestCreateDTO() {}

        public Integer getCourseId() {
            return courseId;
        }

        public void setCourseId(Integer courseId) {
            this.courseId = courseId;
        }

        public Integer getCategoryId() {
            return categoryId;
        }

        public void setCategoryId(Integer categoryId) {
            this.categoryId = categoryId;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
}
