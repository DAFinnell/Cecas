package edu.franklin.cecas.web;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import edu.franklin.cecas.config.SecurityConfig;
import edu.franklin.cecas.domain.Category;
import edu.franklin.cecas.domain.Course;
import edu.franklin.cecas.repository.CategoryRepository;
import edu.franklin.cecas.repository.CourseRepository;
import edu.franklin.cecas.service.CecasUserDetailsService;

@WebMvcTest(controllers = LookupController.class)
@Import({ SecurityConfig.class, GlobalExceptionHandler.class })
class LookupControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CecasUserDetailsService cecasUserDetailsService;

    @MockitoBean
    private CourseRepository courseRepository;

    @MockitoBean
    private CategoryRepository categoryRepository;

    @Test
    @WithMockUser(username = "student@test.com", roles = { "STUDENT" })
    void getCoursesReturnsActiveCourseOptions() throws Exception {
        Course course = new Course("COMP-110", "26/FA", "H1WW");
        when(courseRepository.findAllByIsActiveTrue()).thenReturn(List.of(course));

        mockMvc.perform(get("/api/lookup/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].courseCode").value("COMP-110"))
                .andExpect(jsonPath("$[0].term").value("26/FA"))
                .andExpect(jsonPath("$[0].section").value("H1WW"));
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = { "STUDENT" })
    void getCategoriesReturnsActiveCategoryOptions() throws Exception {
        Category category = new Category();
        category.setCategoryName("Seminar Attendance");
        category.setDescription("Approved attendance at an academic or professional seminar");
        category.setDefaultPoints(5);

        when(categoryRepository.findAllByIsActiveTrue()).thenReturn(List.of(category));

        mockMvc.perform(get("/api/lookup/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].categoryName").value("Seminar Attendance"))
                .andExpect(jsonPath("$[0].description").value("Approved attendance at an academic or professional seminar"))
                .andExpect(jsonPath("$[0].defaultPoints").value(5));
    }

    @Test
    void lookupEndpointsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/lookup/courses"))
                .andExpect(status().isForbidden());
    }
}
