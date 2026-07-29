package edu.franklin.cecas.web;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import static org.hamcrest.Matchers.nullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import edu.franklin.cecas.config.SecurityConfig;
import edu.franklin.cecas.domain.Category;
import edu.franklin.cecas.domain.Course;
import edu.franklin.cecas.domain.ExtraCreditRequest;
import edu.franklin.cecas.domain.ExtraCreditRequestStatus;
import edu.franklin.cecas.domain.User;
import edu.franklin.cecas.domain.UserRole;
import edu.franklin.cecas.dto.ExtraCreditRequestCreateDTO;
import edu.franklin.cecas.dto.StudentRequestDetailDTO;
import edu.franklin.cecas.dto.StudentRequestSummaryDTO;
import edu.franklin.cecas.exception.EvidenceUploadException;
import edu.franklin.cecas.service.CecasUserDetailsService;
import edu.franklin.cecas.service.EvidenceSubmissionService;
import edu.franklin.cecas.service.ExtraCreditRequestService;

@WebMvcTest(controllers = ExtraCreditRequestController.class)
@Import({ SecurityConfig.class, GlobalExceptionHandler.class })
public class ExtraCreditRequestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CecasUserDetailsService cecasUserDetailsService;

    @MockitoBean
    private ExtraCreditRequestService extraCreditRequestService;

    @MockitoBean
    private EvidenceSubmissionService evidenceSubmissionService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private ExtraCreditRequest createExtraCreditRequest() {
        User student = new User();
        student.setFullName("Derek Test");
        student.setEmail("derek@derek.com");
        student.setPassword("password");
        student.setStudentId(1001);
        student.setProgram("Computer Science");
        student.setIsActive(true);
        student.setMustChangePassword(false);
        student.setRole(UserRole.STUDENT);

        Course course = new Course();
        course.setCourseCode("COMP-110");
        course.setTerm("26/FA");
        course.setSection("H1WW");

        Category category = new Category();
        category.setCategoryName("Seminar Attendance");
        category.setDescription("Approved attendance at an academic or professional seminar");
        category.setDefaultPoints(5);

        ExtraCreditRequest request = new ExtraCreditRequest();
        ReflectionTestUtils.setField(request, "id", 42);
        request.setStudent(student);
        request.setCourse(course);
        request.setCategory(category);
        request.setDescription("I attended an approved academic seminar");
        request.setStatus(ExtraCreditRequestStatus.PENDING);
        ReflectionTestUtils.setField(request, "createdAt", LocalDateTime.of(2026, 7, 5, 12, 0));
        ReflectionTestUtils.setField(request, "updatedAt", LocalDateTime.of(2026, 7, 5, 12, 0));

        return request;
    }

    /**
     * Tests that an extra credit request create response is flattened for students.
     */
    @Test
    @WithMockUser(username = "derek@derek.com", roles = { "STUDENT" })
    void testCreateRequestReturnsFlattenedStudentRequestDetail() throws Exception {
        StudentRequestDetailDTO response = new StudentRequestDetailDTO(createExtraCreditRequest());
        Map<String, Object> request = Map.of(
                "courseId", 1,
                "categoryId", 1,
                "description", "I attended an approved academic seminar");

        when(extraCreditRequestService.createRequest(eq("derek@derek.com"), any(ExtraCreditRequestCreateDTO.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/extra-credit-requests")
                .with(csrf())
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.courseCode").value("COMP-110"))
                .andExpect(jsonPath("$.term").value("26/FA"))
                .andExpect(jsonPath("$.section").value("H1WW"))
                .andExpect(jsonPath("$.categoryName").value("Seminar Attendance"))
                .andExpect(jsonPath("$.categoryDescription").value("Approved attendance at an academic or professional seminar"))
                .andExpect(jsonPath("$.description").value("I attended an approved academic seminar"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.defaultPoints").value(5))
                .andExpect(jsonPath("$.awardedPoints").value(nullValue()))
                .andExpect(jsonPath("$.createdAt").exists())
                .andExpect(jsonPath("$.updatedAt").exists())
                .andExpect(jsonPath("$.chairFeedback").value(nullValue()))
                .andExpect(jsonPath("$.dueDate").value(nullValue()))
                .andExpect(jsonPath("$.evidenceFileUploaded").value(false))
                .andExpect(jsonPath("$.evidenceUploadAvailable").value(false))
                .andExpect(jsonPath("$.evidenceFileName").value(nullValue()))
                .andExpect(jsonPath("$.evidenceFilePath").doesNotExist())
                .andExpect(jsonPath("$.studentId").doesNotExist())
                .andExpect(jsonPath("$.course").doesNotExist())
                .andExpect(jsonPath("$.category").doesNotExist())
                .andExpect(jsonPath("$.student").doesNotExist());

        verify(extraCreditRequestService).createRequest(eq("derek@derek.com"), any(ExtraCreditRequestCreateDTO.class));
    }

    /**
     * Tests that a student's request list response is flattened for students.
     */
    @Test
    @WithMockUser(username = "derek@derek.com", roles = { "STUDENT" })
    void testGetRequestsReturnsFlattenedStudentRequestSummaryList() throws Exception {
        StudentRequestSummaryDTO response = new StudentRequestSummaryDTO(createExtraCreditRequest());

        when(extraCreditRequestService.getRequestsForStudent("derek@derek.com"))
                .thenReturn(List.of(response));

        mockMvc.perform(get("/api/extra-credit-requests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(42))
                .andExpect(jsonPath("$[0].courseCode").value("COMP-110"))
                .andExpect(jsonPath("$[0].term").value("26/FA"))
                .andExpect(jsonPath("$[0].section").value("H1WW"))
                .andExpect(jsonPath("$[0].categoryName").value("Seminar Attendance"))
                .andExpect(jsonPath("$[0].status").value("PENDING"))
                .andExpect(jsonPath("$[0].defaultPoints").value(5))
                .andExpect(jsonPath("$[0].awardedPoints").value(nullValue()))
                .andExpect(jsonPath("$[0].updatedAt").exists())
                .andExpect(jsonPath("$[0].dueDate").value(nullValue()))
                .andExpect(jsonPath("$[0].evidenceFileUploaded").value(false))
                .andExpect(jsonPath("$[0].evidenceUploadAvailable").value(false))
                .andExpect(jsonPath("$[0].evidenceFileName").doesNotExist())
                .andExpect(jsonPath("$[0].evidenceFilePath").doesNotExist())
                .andExpect(jsonPath("$[0].description").doesNotExist())
                .andExpect(jsonPath("$[0].categoryDescription").doesNotExist())
                .andExpect(jsonPath("$[0].createdAt").doesNotExist())
                .andExpect(jsonPath("$[0].chairFeedback").doesNotExist())
                .andExpect(jsonPath("$[0].studentId").doesNotExist())
                .andExpect(jsonPath("$[0].course").doesNotExist())
                .andExpect(jsonPath("$[0].category").doesNotExist())
                .andExpect(jsonPath("$[0].student").doesNotExist());

        verify(extraCreditRequestService).getRequestsForStudent("derek@derek.com");
    }

    /**
     * Tests that a student can upload evidence and receive the updated request payload.
     */
    @Test
    @WithMockUser(username = "derek@derek.com", roles = { "STUDENT" })
    void testUploadEvidenceReturnsUpdatedRequest() throws Exception {
        ExtraCreditRequest request = createExtraCreditRequest();
        request.setStatus(ExtraCreditRequestStatus.EVIDENCE_SUBMITTED);
        request.setEvidenceFilePath("evidence/request-42/proof.pdf");
        StudentRequestDetailDTO response = new StudentRequestDetailDTO(request);

        MockMultipartFile evidence = new MockMultipartFile(
                "evidence",
                "proof.pdf",
                "application/pdf",
                "%PDF-1.7 test".getBytes(StandardCharsets.UTF_8));

        when(evidenceSubmissionService.submitEvidence(eq("derek@derek.com"), eq(42), any()))
                .thenReturn(response);

        mockMvc.perform(multipart("/api/extra-credit-requests/{requestId}/evidence", 42)
                .file(evidence)
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.status").value("EVIDENCE_SUBMITTED"))
                .andExpect(jsonPath("$.evidenceFileUploaded").value(true))
                .andExpect(jsonPath("$.evidenceUploadAvailable").value(false))
                .andExpect(jsonPath("$.evidenceFileName").value("proof.pdf"))
                .andExpect(jsonPath("$.evidenceFilePath").doesNotExist());

        verify(evidenceSubmissionService).submitEvidence(eq("derek@derek.com"), eq(42), any());
    }

    /**
     * Tests that an evidence upload without a file returns a clear validation error.
     */
    @Test
    @WithMockUser(username = "derek@derek.com", roles = { "STUDENT" })
    void testUploadEvidenceWithoutFileReturnsBadRequest() throws Exception {
        when(evidenceSubmissionService.submitEvidence(eq("derek@derek.com"), eq(42), isNull()))
                .thenThrow(new EvidenceUploadException("Evidence file is required."));

        mockMvc.perform(multipart("/api/extra-credit-requests/{requestId}/evidence", 42)
                .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Invalid Evidence Upload"))
                .andExpect(jsonPath("$.detail").value("Evidence file is required."))
                .andExpect(jsonPath("$.errorCode").value("EVIDENCE_UPLOAD_INVALID"));

        verify(evidenceSubmissionService).submitEvidence(eq("derek@derek.com"), eq(42), isNull());
    }

    /**
     * Tests that an extra credit request without a courseId returns bad request.
     */
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

        verify(extraCreditRequestService, never()).createRequest(anyString(), any());
    }

    /**
     * Verifies that creating a request with a blank description returns a 400 Bad Request
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
                .andExpect(jsonPath("$.errors.description").exists());

        verify(extraCreditRequestService, never()).createRequest(anyString(), any());
    }

    /**
     * Verifies that creating a request with a description over 1000 characters returns a 400 Bad Request
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
                        .value("description must be between 15 and 1000 characters"));

        verify(extraCreditRequestService, never()).createRequest(anyString(), any());
    }
    /**
     * Verifies that a 14-character description is rejected.
     */
    @Test
    @WithMockUser(username = "student@test.com", roles = { "STUDENT" })
    void testCreateRequestWithDescriptionUnder15CharactersReturnsBadRequest() throws Exception {
        Map<String, Object> request = Map.of(
                "courseId", 1,
                "categoryId", 1,
                "description", "a".repeat(14));

        mockMvc.perform(post("/api/extra-credit-requests")
                .with(csrf())
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validation failed"))
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.errors.description")
                        .value("description must be between 15 and 1000 characters"));

        verify(extraCreditRequestService, never()).createRequest(anyString(), any());
    }

    /**
     * Verifies that a description exactly 15 characters long is accepted.
     */
    @Test
    @WithMockUser(username = "student@test.com", roles = { "STUDENT" })
    void testCreateRequestWithDescriptionExactly15CharactersIsAccepted() throws Exception {
        Map<String, Object> request = Map.of(
                "courseId", 1,
                "categoryId", 1,
                "description", "a".repeat(15));

        when(extraCreditRequestService.createRequest(
                eq("student@test.com"),
                any(ExtraCreditRequestCreateDTO.class)))
                .thenReturn(new StudentRequestDetailDTO(createExtraCreditRequest()));

        mockMvc.perform(post("/api/extra-credit-requests")
                .with(csrf())
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        verify(extraCreditRequestService).createRequest(
                eq("student@test.com"),
                any(ExtraCreditRequestCreateDTO.class));
    }

    /**
     * Verifies that a description exactly 1000 characters long is accepted.
     */
    @Test
    @WithMockUser(username = "student@test.com", roles = { "STUDENT" })
    void testCreateRequestWithDescriptionExactly1000CharactersIsAccepted() throws Exception {
        Map<String, Object> request = Map.of(
                "courseId", 1,
                "categoryId", 1,
                "description", "a".repeat(1000));

        when(extraCreditRequestService.createRequest(
                eq("student@test.com"),
                any(ExtraCreditRequestCreateDTO.class)))
                .thenReturn(new StudentRequestDetailDTO(createExtraCreditRequest()));

        mockMvc.perform(post("/api/extra-credit-requests")
                .with(csrf())
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        verify(extraCreditRequestService).createRequest(
                eq("student@test.com"),
                any(ExtraCreditRequestCreateDTO.class));
    }

}
