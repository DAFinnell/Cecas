package edu.franklin.cecas.web;

import java.util.Comparator;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.franklin.cecas.domain.Category;
import edu.franklin.cecas.domain.Course;
import edu.franklin.cecas.dto.CategoryOptionDTO;
import edu.franklin.cecas.dto.CourseOptionDTO;
import edu.franklin.cecas.repository.CategoryRepository;
import edu.franklin.cecas.repository.CourseRepository;

@RestController
@RequestMapping("/api/lookup")
public class LookupController {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;

    public LookupController(CourseRepository courseRepository, CategoryRepository categoryRepository) {
        this.courseRepository = courseRepository;
        this.categoryRepository = categoryRepository;
    }

    @PreAuthorize("hasRole('STUDENT') or hasRole('CHAIR')")
    @GetMapping("/courses")
    public List<CourseOptionDTO> getActiveCourses() {
        return courseRepository.findAllByIsActiveTrue().stream()
                .sorted(Comparator
                        .comparing(Course::getCourseCode)
                        .thenComparing(Course::getTerm)
                        .thenComparing(Course::getSection))
                .map(CourseOptionDTO::new)
                .toList();
    }

    @PreAuthorize("hasRole('STUDENT') or hasRole('CHAIR')")
    @GetMapping("/categories")
    public List<CategoryOptionDTO> getActiveCategories() {
        return categoryRepository.findAllByIsActiveTrue().stream()
                .sorted(Comparator.comparing(Category::getCategoryName))
                .map(CategoryOptionDTO::new)
                .toList();
    }
}
