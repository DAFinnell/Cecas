package edu.franklin.cecas.dto;

import edu.franklin.cecas.domain.Category;

public record CategoryOptionDTO(
        Integer categoryId,
        String categoryName,
        String description,
        Integer defaultPoints) {
    public CategoryOptionDTO(Category category) {
        this(category.getCategoryId(), category.getCategoryName(), category.getDescription(), category.getDefaultPoints());
    }
}
