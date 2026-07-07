package edu.franklin.cecas.web;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import edu.franklin.cecas.config.SecurityConfig;
import edu.franklin.cecas.domain.ExtraCreditRequestStatus;
import edu.franklin.cecas.dto.ExtraCreditResponseDTO;
import edu.franklin.cecas.service.CecasUserDetailsService;
import edu.franklin.cecas.service.ExtraCreditRequestService;

import java.util.List;
import java.util.Map;

@WebMvcTest(controllers = ExtraCreditRequestController.class)
@Import({ SecurityConfig.class, GlobalExceptionHandler.class })
public class ExtraCreditRequestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CecasUserDetailsService cecasUserDetailsService;

    @MockitoBean
    private ExtraCreditRequestService extraCreditRequestService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @WithMockUser(username = "student@test.com", roles = { "STUDENT" })
    void testCreateRequestWithoutCourseIdReturnsBadRequest() throws Exception {
        Map<String, Object> request = Map.of(
                "categoryId", 1,
                "description", "Completed an approved extra credit activity");

        mockMvc.perform(post("/api/extra-credit-requests")
                .with(csrf())
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validation failed"))
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.errors.courseId").value("courseId is required"));

        verify(extraCreditRequestService, never()).createRequest(
                anyString(), any());
    }

    /**
     * Verifies that GET /api/extra-credit-requests returns the fields used by the
     * student page.
     * 
     * @throws Exception
     */
    @Test
    @WithMockUser(username = "student@test.com", roles = { "STUDENT" })
    public void testGetRequestsReturnsFieldsUsedByStudentPage() throws Exception {
        ExtraCreditResponseDTO dto = new ExtraCreditResponseDTO();
        dto.setId(1);
        dto.setCourseCode("COMP-495");
        dto.setTerm("26/SU");
        dto.setSection("F1WW");
        dto.setCategoryName("Tutoring Sessions");
        dto.setDefaultPoints(10);
        dto.setStatus(ExtraCreditRequestStatus.PENDING);
        dto.setUpdatedAt(java.time.LocalDateTime.of(2026, 7, 4, 12, 59));

        when(extraCreditRequestService.getRequestsForStudent("student@test.com"))
                .thenReturn(List.of(dto));

        mockMvc.perform(get("/api/extra-credit-requests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].courseCode").value("COMP-495"))
                .andExpect(jsonPath("$[0].term").value("26/SU"))
                .andExpect(jsonPath("$[0].section").value("F1WW"))
                .andExpect(jsonPath("$[0].categoryName").value("Tutoring Sessions"))
                .andExpect(jsonPath("$[0].defaultPoints").value(10))
                .andExpect(jsonPath("$[0].status").value("PENDING"))
                .andExpect(jsonPath("$[0].updatedAt").exists());

        verify(extraCreditRequestService).getRequestsForStudent("student@test.com");
    }

    /**
     * Verifies that creating a request with a blank description returns a 400 Bad
     * Request
     * with the appropriate validation error message.
     */
    @Test
    @WithMockUser(username = "student@test.com", roles = { "STUDENT" })
    void testCreateRequestWithBlankDescriptionReturnsBadRequest() throws Exception {
        Map<String, Object> request = Map.of(
                "courseId", 1,
                "categoryId", 1,
                "description", "   ");

        mockMvc.perform(post("/api/extra-credit-requests")
                .with(csrf())
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validation failed"))
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.errors.description").value("description is required"));

        verify(extraCreditRequestService, never()).createRequest(anyString(), any());
    }

    /**
     * Verifies that creating a request with a description over 1000 characters
     * returns a 400 Bad Request
     * with the appropriate validation error message.
     */
    @Test
    @WithMockUser(username = "student@test.com", roles = { "STUDENT" })
    void testCreateRequestWithDescriptionOver1000CharactersReturnsBadRequest() throws Exception {
        String longDescription = "a".repeat(1001);

        Map<String, Object> request = Map.of(
                "courseId", 1,
                "categoryId", 1,
                "description", longDescription);

        mockMvc.perform(post("/api/extra-credit-requests")
                .with(csrf())
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validation failed"))
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.errors.description")
                        .value("description must be 1000 characters or fewer"));

        verify(extraCreditRequestService, never()).createRequest(anyString(), any());
    }

    /**
     * Verifies that creating a request with valid data returns a 201 Created response
     * with the expected fields in the response body.
     */
    @Test
    @WithMockUser(username = "student@test.com", roles = { "STUDENT" })
    void testCreateRequestReturnsCreatedResponseWithPendingStatus() throws Exception {
        Map<String, Object> request = Map.of(
                "courseId", 1,
                "categoryId", 2,
                "description", "Completed an extra assignment for the course.");

        ExtraCreditResponseDTO response = new ExtraCreditResponseDTO();
        response.setId(99);
        response.setCourseCode("COMP-201");
        response.setTerm("26/SU");
        response.setSection("H1WW");
        response.setCategoryName("Homework");
        response.setDefaultPoints(10);
        response.setStatus(ExtraCreditRequestStatus.PENDING);
        response.setUpdatedAt(java.time.LocalDateTime.of(2026, 7, 5, 10, 30));

        when(extraCreditRequestService.createRequest(eq("student@test.com"), any()))
                .thenReturn(response);

        mockMvc.perform(post("/api/extra-credit-requests")
                .with(csrf())
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(99))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.courseCode").value("COMP-201"))
                .andExpect(jsonPath("$.categoryName").value("Homework"));

        verify(extraCreditRequestService).createRequest(eq("student@test.com"), any());
    }
}
