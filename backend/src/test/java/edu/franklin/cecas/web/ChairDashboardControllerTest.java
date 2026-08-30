package edu.franklin.cecas.web;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import edu.franklin.cecas.config.SecurityConfig;
import edu.franklin.cecas.domain.Category;
import edu.franklin.cecas.domain.Course;
import edu.franklin.cecas.domain.ExtraCreditRequest;
import edu.franklin.cecas.domain.ExtraCreditRequestStatus;
import edu.franklin.cecas.domain.User;
import edu.franklin.cecas.dto.ChairDashboardQueueResponse;
import edu.franklin.cecas.dto.ChairDashboardSummaryResponse;
import edu.franklin.cecas.service.CecasUserDetailsService;
import edu.franklin.cecas.service.ChairDashboardService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = ChairDashboardController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class ChairDashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CecasUserDetailsService cecasUserDetailsService;

    @MockitoBean
    private ChairDashboardService chairDashboardService;

    @Test
    @WithMockUser(roles = "CHAIR")
    void testChairSummaryAndQueueAccessWithDefaultStatus() throws Exception {
        User student = new User();
        student.setEmail("student@test.com");
        student.setFullName("Nica Kelley");

        Course course = new Course();
        course.setCourseCode("COMP-495");
        course.setTerm("26/FA");
        course.setSection("R2WW");
        ReflectionTestUtils.setField(course, "courseId", 1);

        Category category = new Category();
        category.setCategoryName("Community Service");
        category.setDescription("Community service category");
        category.setDefaultPoints(10);
        ReflectionTestUtils.setField(category, "categoryId", 1);

        ExtraCreditRequest request = new ExtraCreditRequest();
        request.setId(10);
        request.setStudent(student);
        request.setCourse(course);
        request.setCategory(category);
        request.setDescription("older request");
        request.setStatus(ExtraCreditRequestStatus.PENDING);
        request.setAwardedPoints(5);

        when(chairDashboardService.getRequestCountSummary(any()))
                .thenReturn(new ChairDashboardSummaryResponse(1L, 1L, 2L, 3L, 4L));

        ChairDashboardQueueResponse response = new ChairDashboardQueueResponse(request);

        when(chairDashboardService.getChairReviewQueue(any(), any())).thenReturn(List.of(response));

        mockMvc.perform(get("/api/chair/dashboard/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pendingCount").value(1))
                .andExpect(jsonPath("$.evidenceSubmittedCount").value(2))
                .andExpect(jsonPath("$.approvedCount").value(3))
                .andExpect(jsonPath("$.rejectedCount").value(4));

        mockMvc.perform(get("/api/chair/dashboard/queue"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].requestId").value(10))
                .andExpect(jsonPath("$[0].studentName").value("Nica Kelley"))
                .andExpect(jsonPath("$[0].studentEmail").value("student@test.com"))
                .andExpect(jsonPath("$[0].courseId").value(1))
                .andExpect(jsonPath("$[0].courseCode").value("COMP-495"))
                .andExpect(jsonPath("$[0].term").value("26/FA"))
                .andExpect(jsonPath("$[0].section").value("R2WW"))
                .andExpect(jsonPath("$[0].categoryId").value(1))
                .andExpect(jsonPath("$[0].categoryName").value("Community Service"))
                .andExpect(jsonPath("$[0].description").value("older request"))
                .andExpect(jsonPath("$[0].status").value("PENDING"))
                .andExpect(jsonPath("$[0].defaultPoints").value(10))
                .andExpect(jsonPath("$[0].awardedPoints").value(5));

        ArgumentCaptor<ExtraCreditRequestStatus> statusCaptor = ArgumentCaptor.forClass(ExtraCreditRequestStatus.class);

        verify(chairDashboardService).getChairReviewQueue(any(), statusCaptor.capture());
        assertEquals(ExtraCreditRequestStatus.PENDING, statusCaptor.getValue());
    }

    @Test
    @WithMockUser(
            username = "student@test.com",
            roles = {"STUDENT"})
    void testStudentAccess() throws Exception {
        mockMvc.perform(get("/api/chair/dashboard/summary")).andExpect(status().isForbidden());

        mockMvc.perform(get("/api/chair/dashboard/queue")).andExpect(status().isForbidden());
    }

    @Test
    void testAnonymousAccess() throws Exception {
        mockMvc.perform(get("/api/chair/dashboard/summary")).andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/chair/dashboard/queue")).andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "CHAIR")
    void testQueueRespectsExplicitStatusParam() throws Exception {
        when(chairDashboardService.getChairReviewQueue(any(), eq(ExtraCreditRequestStatus.EVIDENCE_SUBMITTED)))
                .thenReturn(List.of(Mockito.mock(ChairDashboardQueueResponse.class)));

        mockMvc.perform(get("/api/chair/dashboard/queue").param("status", "EVIDENCE_SUBMITTED"))
                .andExpect(status().isOk());

        verify(chairDashboardService).getChairReviewQueue(any(), eq(ExtraCreditRequestStatus.EVIDENCE_SUBMITTED));
    }
}
