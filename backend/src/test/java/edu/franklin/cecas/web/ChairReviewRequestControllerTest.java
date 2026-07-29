package edu.franklin.cecas.web;

import static org.hamcrest.Matchers.nullValue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.http.MediaType.APPLICATION_PDF;
import static org.springframework.http.MediaType.IMAGE_JPEG;
import static org.springframework.http.MediaType.IMAGE_PNG;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

import edu.franklin.cecas.config.SecurityConfig;
import edu.franklin.cecas.dto.ChairRequestActionDTO;
import edu.franklin.cecas.dto.ChairReviewDTO;
import edu.franklin.cecas.dto.StudentPointsDTO;
import edu.franklin.cecas.service.CecasUserDetailsService;
import edu.franklin.cecas.service.ChairReviewRequestService;
import edu.franklin.cecas.service.EvidenceStorageService.StoredEvidence;

@WebMvcTest(controllers = ChairReviewRequestController.class)
@Import({ SecurityConfig.class, GlobalExceptionHandler.class })
public class ChairReviewRequestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CecasUserDetailsService cecasUserDetailsService;

    @MockitoBean
    private ChairReviewRequestService chairReviewRequestService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private ChairReviewDTO createReviewResponse() {
        ChairReviewDTO response = new ChairReviewDTO();
        response.setRequestId(42);
        response.setStatus("EVIDENCE_SUBMITTED");
        response.setDescription("I attended an approved academic seminar");
        response.setStudentName("Derek Test");
        response.setStudentEmail("derek@derek.com");
        response.setStudentId(1001);
        response.setProgram("Computer Science");
        response.setCourseId(3);
        response.setCourseCode("COMP-110");
        response.setTerm("26/FA");
        response.setSection("H1WW");
        response.setCategoryId(9);
        response.setCategoryName("Seminar Attendance");
        response.setCategoryDescription("Approved attendance at an academic or professional seminar");
        response.setDefaultPoints(5);
        response.setPointsSummary(new StudentPointsDTO(10, 5, 35));
        response.setCreatedAt(LocalDateTime.of(2026, 7, 1, 10, 30));
        response.setUpdatedAt(LocalDateTime.of(2026, 7, 2, 11, 45));
        response.setEvidenceAvailable(true);
        response.setEvidenceFileName("evidence-request-42.pdf");
        response.setEvidenceContentType("application/pdf");
        return response;
    }

    private ChairRequestActionDTO createActionResponse(
            String requestStatus,
            Integer awardedPoints,
            String chairFeedback) {

        ChairRequestActionDTO response = new ChairRequestActionDTO();
        response.setRequestId(42);
        response.setStatus(requestStatus);
        response.setAwardedPoints(awardedPoints);
        response.setChairFeedback(chairFeedback);
        response.setUpdatedAt(LocalDateTime.of(2026, 7, 2, 11, 45));
        return response;
    }

    private StoredEvidence createStoredEvidence(
            byte[] content,
            MediaType contentType,
            String fileName) {

        return new StoredEvidence(
                new ByteArrayResource(content),
                contentType,
                fileName,
                content.length);
    }

    /**
     * Verifies that chair review returns the original application and evidence
     * details.
     */
    @Test
    @WithMockUser(username = "derek-chair@derek.com", roles = { "CHAIR" })
    void testGetRequestForReviewReturnsApplicationAndEvidenceDetails() throws Exception {
        when(chairReviewRequestService.getRequestForReview("derek-chair@derek.com", 42))
                .thenReturn(createReviewResponse());

        mockMvc.perform(get("/api/chair/requests/{requestId}/review", 42))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requestId").value(42))
                .andExpect(jsonPath("$.status").value("EVIDENCE_SUBMITTED"))
                .andExpect(jsonPath("$.description").value("I attended an approved academic seminar"))
                .andExpect(jsonPath("$.studentName").value("Derek Test"))
                .andExpect(jsonPath("$.studentEmail").value("derek@derek.com"))
                .andExpect(jsonPath("$.studentId").value(1001))
                .andExpect(jsonPath("$.program").value("Computer Science"))
                .andExpect(jsonPath("$.courseId").value(3))
                .andExpect(jsonPath("$.courseCode").value("COMP-110"))
                .andExpect(jsonPath("$.term").value("26/FA"))
                .andExpect(jsonPath("$.section").value("H1WW"))
                .andExpect(jsonPath("$.categoryId").value(9))
                .andExpect(jsonPath("$.categoryName").value("Seminar Attendance"))
                .andExpect(jsonPath("$.categoryDescription")
                        .value("Approved attendance at an academic or professional seminar"))
                .andExpect(jsonPath("$.defaultPoints").value(5))
                .andExpect(jsonPath("$.pointsSummary.issued").value(10))
                .andExpect(jsonPath("$.pointsSummary.pending").value(5))
                .andExpect(jsonPath("$.pointsSummary.available").value(35))
                .andExpect(jsonPath("$.evidenceAvailable").value(true))
                .andExpect(jsonPath("$.evidenceFileName").value("evidence-request-42.pdf"))
                .andExpect(jsonPath("$.evidenceContentType").value("application/pdf"));

        verify(chairReviewRequestService).getRequestForReview("derek-chair@derek.com", 42);
    }

    /**
     * Verifies that evidence is returned inline by default with the expected
     * PDF headers and contents.
     */
    @Test
    @WithMockUser(username = "derek-chair@derek.com", roles = { "CHAIR" })
    void testGetEvidenceReturnsInlinePdf() throws Exception {
        byte[] fileContent = "%PDF-1.7 test".getBytes(StandardCharsets.UTF_8);
        StoredEvidence evidence = createStoredEvidence(
                fileContent,
                APPLICATION_PDF,
                "evidence-request-42.pdf");

        when(chairReviewRequestService.getEvidence("derek-chair@derek.com", 42))
                .thenReturn(evidence);

        mockMvc.perform(get("/api/chair/requests/{requestId}/evidence", 42))
                .andExpect(status().isOk())
                .andExpect(content().contentType(APPLICATION_PDF))
                .andExpect(content().bytes(fileContent))
                .andExpect(header().longValue(HttpHeaders.CONTENT_LENGTH, fileContent.length))
                .andExpect(header().string(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline().filename("evidence-request-42.pdf").build().toString()));

        verify(chairReviewRequestService).getEvidence("derek-chair@derek.com", 42);
    }

    /**
     * Verifies that the download option returns an attachment with the
     * expected PNG headers and contents.
     */
    @Test
    @WithMockUser(username = "derek-chair@derek.com", roles = { "CHAIR" })
    void testGetEvidenceReturnsPngAsDownload() throws Exception {
        byte[] fileContent = new byte[] {(byte) 0x89, 0x50, 0x4E, 0x47};
        StoredEvidence evidence = createStoredEvidence(
                fileContent,
                IMAGE_PNG,
                "evidence-request-42.png");

        when(chairReviewRequestService.getEvidence("derek-chair@derek.com", 42))
                .thenReturn(evidence);

        mockMvc.perform(get("/api/chair/requests/{requestId}/evidence", 42)
                .param("download", "true"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(IMAGE_PNG))
                .andExpect(content().bytes(fileContent))
                .andExpect(header().longValue(HttpHeaders.CONTENT_LENGTH, fileContent.length))
                .andExpect(header().string(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename("evidence-request-42.png").build().toString()));

        verify(chairReviewRequestService).getEvidence("derek-chair@derek.com", 42);
    }

    /**
     * Verifies that JPG evidence is returned with the image/jpeg content type.
     */
    @Test
    @WithMockUser(username = "derek-chair@derek.com", roles = { "CHAIR" })
    void testGetEvidenceReturnsJpgContentType() throws Exception {
        byte[] fileContent = new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
        StoredEvidence evidence = createStoredEvidence(
                fileContent,
                IMAGE_JPEG,
                "evidence-request-42.jpg");

        when(chairReviewRequestService.getEvidence("derek-chair@derek.com", 42))
                .thenReturn(evidence);

        mockMvc.perform(get("/api/chair/requests/{requestId}/evidence", 42))
                .andExpect(status().isOk())
                .andExpect(content().contentType(IMAGE_JPEG))
                .andExpect(content().bytes(fileContent));
    }

    /**
     * Verifies that a chair can approve evidence with points and feedback and
     * receive the updated request details.
     */
    @Test
    @WithMockUser(username = "derek-chair@derek.com", roles = { "CHAIR" })
    void testApproveReturnsUpdatedRequestDetails() throws Exception {
        Map<String, Object> request = Map.of(
                "points", 5,
                "feedback", "Evidence verified.");

        when(chairReviewRequestService.approve(
                "derek-chair@derek.com",
                42,
                5,
                "Evidence verified."))
            .thenReturn(createActionResponse("APPROVED", 5, "Evidence verified."));

        mockMvc.perform(post("/api/chair/requests/{requestId}/approve", 42)
                .with(csrf())
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requestId").value(42))
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.awardedPoints").value(5))
                .andExpect(jsonPath("$.chairFeedback").value("Evidence verified."))
                .andExpect(jsonPath("$.updatedAt").exists());

        verify(chairReviewRequestService).approve(
                "derek-chair@derek.com",
                42,
                5,
                "Evidence verified.");
    }

    /**
     * Verifies that approval feedback is optional when points are provided.
     */
    @Test
    @WithMockUser(username = "derek-chair@derek.com", roles = { "CHAIR" })
    void testApproveWithoutFeedbackIsAccepted() throws Exception {
        Map<String, Object> request = Map.of("points", 5);

        when(chairReviewRequestService.approve(
                eq("derek-chair@derek.com"),
                eq(42),
                eq(5),
                isNull()))
            .thenReturn(createActionResponse("APPROVED", 5, null));

        mockMvc.perform(post("/api/chair/requests/{requestId}/approve", 42)
                .with(csrf())
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.awardedPoints").value(5))
                .andExpect(jsonPath("$.chairFeedback").value(nullValue()));

        verify(chairReviewRequestService).approve(
                eq("derek-chair@derek.com"),
                eq(42),
                eq(5),
                isNull());
    }

    /**
     * Verifies that a chair can reject evidence with feedback and receive the
     * updated request details.
     */
    @Test
    @WithMockUser(username = "derek-chair@derek.com", roles = { "CHAIR" })
    void testRejectReturnsUpdatedRequestDetails() throws Exception {
        Map<String, Object> request = Map.of("feedback", "Insufficient evidence");

        when(chairReviewRequestService.reject(
                "derek-chair@derek.com",
                42,
                "Insufficient evidence"))
            .thenReturn(createActionResponse("REJECTED", null, "Insufficient evidence"));

        mockMvc.perform(post("/api/chair/requests/{requestId}/reject", 42)
                .with(csrf())
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requestId").value(42))
                .andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.awardedPoints").value(nullValue()))
                .andExpect(jsonPath("$.chairFeedback").value("Insufficient evidence"))
                .andExpect(jsonPath("$.updatedAt").exists());

        verify(chairReviewRequestService).reject(
                "derek-chair@derek.com",
                42,
                "Insufficient evidence");
    }

    /**
     * Verifies that approval without points returns a 400 Bad Request.
     */
    @Test
    @WithMockUser(username = "derek-chair@derek.com", roles = { "CHAIR" })
    void testApproveWithoutPointsReturnsBadRequest() throws Exception {
        Map<String, Object> request = Map.of("feedback", "Evidence verified.");

        mockMvc.perform(post("/api/chair/requests/{requestId}/approve", 42)
                .with(csrf())
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validation failed"))
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.errors.points").value("Points are required."));

        verifyNoInteractions(chairReviewRequestService);
    }

    /**
     * Verifies that zero and negative approval points return a 400 Bad Request.
     */
    @Test
    @WithMockUser(username = "derek-chair@derek.com", roles = { "CHAIR" })
    void testApproveWithNonPositivePointsReturnsBadRequest() throws Exception {
        for (int points : new int[] {0, -1}) {
            Map<String, Object> request = Map.of("points", points);

            mockMvc.perform(post("/api/chair/requests/{requestId}/approve", 42)
                    .with(csrf())
                    .contentType(APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.title").value("Validation failed"))
                    .andExpect(jsonPath("$.errors.points").value("Points must be greater than zero."));
        }

        verifyNoInteractions(chairReviewRequestService);
    }

    /**
     * Verifies that approval feedback over 1000 characters returns a 400 Bad
     * Request.
     */
    @Test
    @WithMockUser(username = "derek-chair@derek.com", roles = { "CHAIR" })
    void testApproveWithFeedbackOver1000CharactersReturnsBadRequest() throws Exception {
        Map<String, Object> request = Map.of(
                "points", 5,
                "feedback", "a".repeat(1001));

        mockMvc.perform(post("/api/chair/requests/{requestId}/approve", 42)
                .with(csrf())
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validation failed"))
                .andExpect(jsonPath("$.errors.feedback")
                        .value("Feedback must be 1000 characters or fewer"));

        verifyNoInteractions(chairReviewRequestService);
    }

    /**
     * Verifies that blank or missing rejection feedback returns a 400 Bad
     * Request.
     */
    @Test
    @WithMockUser(username = "derek-chair@derek.com", roles = { "CHAIR" })
    void testRejectWithoutFeedbackReturnsBadRequest() throws Exception {
        List<Map<String, Object>> requests = List.of(
                Map.of(),
                Map.of("feedback", "   "));

        for (Map<String, Object> request : requests) {

            mockMvc.perform(post("/api/chair/requests/{requestId}/reject", 42)
                    .with(csrf())
                    .contentType(APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.title").value("Validation failed"))
                    .andExpect(jsonPath("$.errors.feedback").value("Feedback is required."));
        }

        verifyNoInteractions(chairReviewRequestService);
    }

    /**
     * Verifies that anonymous users cannot access chair review endpoints.
     */
    @Test
    void testAnonymousAccessReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/chair/requests/{requestId}/review", 42))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/chair/requests/{requestId}/evidence", 42))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/chair/requests/{requestId}/pre-approve", 42)
                .with(csrf()))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/chair/requests/{requestId}/approve", 42)
                .with(csrf())
                .contentType(APPLICATION_JSON)
                .content("{\"points\":5}"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/chair/requests/{requestId}/reject", 42)
                .with(csrf())
                .contentType(APPLICATION_JSON)
                .content("{\"feedback\":\"Insufficient evidence\"}"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(chairReviewRequestService);
    }

    /**
     * Verifies that students cannot access chair review endpoints.
     */
    @Test
    @WithMockUser(username = "derek@derek.com", roles = { "STUDENT" })
    void testStudentAccessReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/chair/requests/{requestId}/review", 42))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/chair/requests/{requestId}/evidence", 42))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/chair/requests/{requestId}/pre-approve", 42)
                .with(csrf()))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/chair/requests/{requestId}/approve", 42)
                .with(csrf())
                .contentType(APPLICATION_JSON)
                .content("{\"points\":5}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/chair/requests/{requestId}/reject", 42)
                .with(csrf())
                .contentType(APPLICATION_JSON)
                .content("{\"feedback\":\"Insufficient evidence\"}"))
                .andExpect(status().isForbidden());

        verifyNoInteractions(chairReviewRequestService);
    }
}
