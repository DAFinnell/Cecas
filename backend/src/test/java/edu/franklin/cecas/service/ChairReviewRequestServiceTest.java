package edu.franklin.cecas.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;

import edu.franklin.cecas.domain.Category;
import edu.franklin.cecas.domain.Course;
import edu.franklin.cecas.domain.ExtraCreditRequest;
import edu.franklin.cecas.domain.ExtraCreditRequestStatus;
import edu.franklin.cecas.domain.User;
import edu.franklin.cecas.domain.UserRole;
import edu.franklin.cecas.dto.ChairRequestActionDTO;
import edu.franklin.cecas.dto.ChairReviewDTO;
import edu.franklin.cecas.dto.StudentPointsDTO;
import edu.franklin.cecas.exception.ChairNotAssignedException;
import edu.franklin.cecas.exception.ResourceNotFoundException;
import edu.franklin.cecas.repository.ChairCourseAssignmentRepository;
import edu.franklin.cecas.repository.ExtraCreditRequestRepository;
import edu.franklin.cecas.repository.UserRepository;
import edu.franklin.cecas.service.EvidenceStorageService.StoredEvidence;

@ExtendWith(MockitoExtension.class)
class ChairReviewRequestServiceTest {

    private UserRepository userRepository;
    private ExtraCreditRequestRepository requestRepository;
    private ChairCourseAssignmentRepository assignmentRepository;
    private PointAllocationService pointAllocationService;
    private StateMachineService stateMachineService;
    private EvidenceStorageService evidenceStorageService;
    private ChairReviewRequestService chairReviewRequestService;

    private User chairUser;
    private User studentUser;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        requestRepository = mock(ExtraCreditRequestRepository.class);
        assignmentRepository = mock(ChairCourseAssignmentRepository.class);
        pointAllocationService = mock(PointAllocationService.class);
        stateMachineService = mock(StateMachineService.class);
        evidenceStorageService = mock(EvidenceStorageService.class);

        chairReviewRequestService = new ChairReviewRequestService(
                userRepository,
                requestRepository,
                assignmentRepository,
                pointAllocationService,
                stateMachineService,
                evidenceStorageService);

        chairUser = new User();
        ReflectionTestUtils.setField(chairUser, "id", 7);
        chairUser.setFullName("Derek Chair");
        chairUser.setEmail("derek-chair@derek.com");
        chairUser.setPassword("password");
        chairUser.setProgram("Computer Science");
        chairUser.setRole(UserRole.CHAIR);

        studentUser = new User();
        ReflectionTestUtils.setField(studentUser, "id", 11);
        studentUser.setFullName("Derek Test");
        studentUser.setEmail("derek@derek.com");
        studentUser.setPassword("password");
        studentUser.setStudentId(1001);
        studentUser.setProgram("Computer Science");
        studentUser.setRole(UserRole.STUDENT);
    }

    private ExtraCreditRequest createRequest(
            ExtraCreditRequestStatus status,
            String evidenceFilePath) {

        Course course = new Course();
        ReflectionTestUtils.setField(course, "courseId", 3);
        course.setCourseCode("COMP-110");
        course.setTerm("26/FA");
        course.setSection("H1WW");

        Category category = new Category();
        ReflectionTestUtils.setField(category, "categoryId", 9);
        category.setCategoryName("Seminar Attendance");
        category.setDescription("Approved attendance at an academic or professional seminar");
        category.setDefaultPoints(5);

        ExtraCreditRequest request = new ExtraCreditRequest();
        request.setId(42);
        request.setStudent(studentUser);
        request.setCourse(course);
        request.setCategory(category);
        request.setDescription("I attended an approved academic seminar");
        request.setStatus(status);
        request.setEvidenceFilePath(evidenceFilePath);
        ReflectionTestUtils.setField(request, "createdAt", LocalDateTime.of(2026, 7, 1, 10, 30));
        request.setUpdatedAt(LocalDateTime.of(2026, 7, 2, 11, 45));
        return request;
    }

    private void setUpAssignedRequest(ExtraCreditRequest request) {
        when(userRepository.findByEmailIgnoreCase("derek-chair@derek.com"))
                .thenReturn(Optional.of(chairUser));
        when(requestRepository.findById(42)).thenReturn(Optional.of(request));
        when(assignmentRepository.existsByChair_IdAndCourse_CourseId(7, 3))
                .thenReturn(true);
    }

    /**
     * Verifies that chair review returns the original application details and
     * uploaded evidence details.
     */
    @Test
    void testGetRequestForReviewReturnsApplicationAndEvidenceDetails() {
        String evidencePath = "evidence/request-42/test.pdf";
        ExtraCreditRequest request = createRequest(
                ExtraCreditRequestStatus.EVIDENCE_SUBMITTED,
                evidencePath);
        StudentPointsDTO pointsSummary = new StudentPointsDTO(10, 5, 35);

        setUpAssignedRequest(request);
        when(pointAllocationService.getStudentPoints(11, "26/FA")).thenReturn(pointsSummary);
        when(evidenceStorageService.evidenceFileName(42, evidencePath))
                .thenReturn("evidence-request-42.pdf");
        when(evidenceStorageService.contentTypeFor(evidencePath))
                .thenReturn(MediaType.APPLICATION_PDF);

        ChairReviewDTO response = chairReviewRequestService.getRequestForReview(
                "derek-chair@derek.com",
                42);

        assertEquals(42, response.getRequestId());
        assertEquals("EVIDENCE_SUBMITTED", response.getStatus());
        assertEquals("I attended an approved academic seminar", response.getDescription());
        assertEquals("Derek Test", response.getStudentName());
        assertEquals("derek@derek.com", response.getStudentEmail());
        assertEquals(1001, response.getStudentId());
        assertEquals("Computer Science", response.getProgram());
        assertEquals(3, response.getCourseId());
        assertEquals("COMP-110", response.getCourseCode());
        assertEquals("26/FA", response.getTerm());
        assertEquals("H1WW", response.getSection());
        assertEquals(9, response.getCategoryId());
        assertEquals("Seminar Attendance", response.getCategoryName());
        assertEquals("Approved attendance at an academic or professional seminar",
                response.getCategoryDescription());
        assertEquals(5, response.getDefaultPoints());
        assertSame(pointsSummary, response.getPointsSummary());
        assertEquals(LocalDateTime.of(2026, 7, 1, 10, 30), response.getCreatedAt());
        assertEquals(LocalDateTime.of(2026, 7, 2, 11, 45), response.getUpdatedAt());
        assertTrue(response.getEvidenceAvailable());
        assertEquals("evidence-request-42.pdf", response.getEvidenceFileName());
        assertEquals("application/pdf", response.getEvidenceContentType());
    }

    /**
     * Verifies that chair review does not return evidence details when no file
     * was uploaded.
     */
    @Test
    void testGetRequestForReviewReturnsNoEvidenceDetailsWhenFileIsMissing() {
        ExtraCreditRequest request = createRequest(ExtraCreditRequestStatus.PENDING, null);

        setUpAssignedRequest(request);
        when(pointAllocationService.getStudentPoints(11, "26/FA"))
                .thenReturn(new StudentPointsDTO(0, 5, 45));

        ChairReviewDTO response = chairReviewRequestService.getRequestForReview(
                "derek-chair@derek.com",
                42);

        assertFalse(response.getEvidenceAvailable());
        assertNull(response.getEvidenceFileName());
        assertNull(response.getEvidenceContentType());
        verifyNoInteractions(evidenceStorageService);
    }

    /**
     * Verifies that awarded points and chair feedback remain available in the
     * review response after approval.
     */
    @Test
    void testGetRequestForReviewReturnsFinalDecisionDetails() {
        ExtraCreditRequest request = createRequest(
                ExtraCreditRequestStatus.APPROVED,
                "evidence/request-42/test.pdf");
        request.setAwardedPoints(5);
        request.setChairFeedback("Evidence verified.");

        setUpAssignedRequest(request);
        when(pointAllocationService.getStudentPoints(11, "26/FA"))
                .thenReturn(new StudentPointsDTO(15, 0, 35));
        when(evidenceStorageService.evidenceFileName(42, request.getEvidenceFilePath()))
                .thenReturn("evidence-request-42.pdf");
        when(evidenceStorageService.contentTypeFor(request.getEvidenceFilePath()))
                .thenReturn(MediaType.APPLICATION_PDF);

        ChairReviewDTO response = chairReviewRequestService.getRequestForReview(
                "derek-chair@derek.com",
                42);

        assertEquals("APPROVED", response.getStatus());
        assertEquals(5, response.getAwardedPoints());
        assertEquals("Evidence verified.", response.getChairFeedback());
        assertTrue(response.getEvidenceAvailable());
    }

    /**
     * Verifies that uploaded evidence remains available after either final
     * decision.
     */
    @Test
    void testGetEvidenceRemainsAvailableAfterFinalDecision() {
        String evidencePath = "evidence/request-42/test.pdf";
        ExtraCreditRequest request = createRequest(ExtraCreditRequestStatus.APPROVED, evidencePath);
        Resource resource = mock(Resource.class);
        StoredEvidence storedEvidence = new StoredEvidence(
                resource,
                MediaType.APPLICATION_PDF,
                "evidence-request-42.pdf",
                100L);

        setUpAssignedRequest(request);
        when(evidenceStorageService.loadEvidence(42, evidencePath)).thenReturn(storedEvidence);

        StoredEvidence approvedEvidence = chairReviewRequestService.getEvidence(
                "derek-chair@derek.com",
                42);

        request.setStatus(ExtraCreditRequestStatus.REJECTED);

        StoredEvidence rejectedEvidence = chairReviewRequestService.getEvidence(
                "derek-chair@derek.com",
                42);

        assertSame(storedEvidence, approvedEvidence);
        assertSame(storedEvidence, rejectedEvidence);
        verify(evidenceStorageService, times(2)).loadEvidence(42, evidencePath);
    }

    /**
     * Verifies that a chair cannot review a request for an unassigned course.
     */
    @Test
    void testGetRequestForReviewThrowsWhenChairIsNotAssigned() {
        ExtraCreditRequest request = createRequest(
                ExtraCreditRequestStatus.EVIDENCE_SUBMITTED,
                "evidence/request-42/test.pdf");

        when(userRepository.findByEmailIgnoreCase("derek-chair@derek.com"))
                .thenReturn(Optional.of(chairUser));
        when(requestRepository.findById(42)).thenReturn(Optional.of(request));
        when(assignmentRepository.existsByChair_IdAndCourse_CourseId(7, 3))
                .thenReturn(false);

        assertThrows(
                ChairNotAssignedException.class,
                () -> chairReviewRequestService.getRequestForReview("derek-chair@derek.com", 42));

        verifyNoInteractions(pointAllocationService);
        verifyNoInteractions(evidenceStorageService);
    }

    /**
     * Verifies that a chair cannot access evidence for an unassigned course.
     */
    @Test
    void testGetEvidenceThrowsWhenChairIsNotAssigned() {
        ExtraCreditRequest request = createRequest(
                ExtraCreditRequestStatus.EVIDENCE_SUBMITTED,
                "evidence/request-42/test.pdf");

        when(userRepository.findByEmailIgnoreCase("derek-chair@derek.com"))
                .thenReturn(Optional.of(chairUser));
        when(requestRepository.findById(42)).thenReturn(Optional.of(request));
        when(assignmentRepository.existsByChair_IdAndCourse_CourseId(7, 3))
                .thenReturn(false);

        assertThrows(
                ChairNotAssignedException.class,
                () -> chairReviewRequestService.getEvidence("derek-chair@derek.com", 42));

        verifyNoInteractions(evidenceStorageService);
    }

    /**
     * Verifies that chair review fails when the requested application does not
     * exist.
     */
    @Test
    void testGetRequestForReviewThrowsWhenRequestIsMissing() {
        when(userRepository.findByEmailIgnoreCase("derek-chair@derek.com"))
                .thenReturn(Optional.of(chairUser));
        when(requestRepository.findById(42)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> chairReviewRequestService.getRequestForReview("derek-chair@derek.com", 42));

        verifyNoInteractions(assignmentRepository);
        verifyNoInteractions(pointAllocationService);
        verifyNoInteractions(evidenceStorageService);
    }

    /**
     * Verifies that approval returns the updated status, points, feedback, and
     * update time.
     */
    @Test
    void testApproveReturnsUpdatedRequestDetails() {
        ExtraCreditRequest request = createRequest(
                ExtraCreditRequestStatus.EVIDENCE_SUBMITTED,
                "evidence/request-42/test.pdf");
        ExtraCreditRequest updatedRequest = createRequest(
                ExtraCreditRequestStatus.APPROVED,
                "evidence/request-42/test.pdf");
        updatedRequest.setAwardedPoints(5);
        updatedRequest.setChairFeedback("Evidence verified.");

        setUpAssignedRequest(request);
        when(stateMachineService.approveWithPointsRequest(
                42,
                5,
                "Evidence verified.",
                chairUser))
            .thenReturn(updatedRequest);

        ChairRequestActionDTO response = chairReviewRequestService.approve(
                "derek-chair@derek.com",
                42,
                5,
                "Evidence verified.");

        assertEquals(42, response.getRequestId());
        assertEquals("APPROVED", response.getStatus());
        assertEquals(5, response.getAwardedPoints());
        assertEquals("Evidence verified.", response.getChairFeedback());
        assertEquals(LocalDateTime.of(2026, 7, 2, 11, 45), response.getUpdatedAt());
        verify(stateMachineService).approveWithPointsRequest(
                42,
                5,
                "Evidence verified.",
                chairUser);
    }

    /**
     * Verifies that rejection returns the updated status, feedback, and update
     * time.
     */
    @Test
    void testRejectReturnsUpdatedRequestDetails() {
        ExtraCreditRequest request = createRequest(
                ExtraCreditRequestStatus.EVIDENCE_SUBMITTED,
                "evidence/request-42/test.pdf");
        ExtraCreditRequest updatedRequest = createRequest(
                ExtraCreditRequestStatus.REJECTED,
                "evidence/request-42/test.pdf");
        updatedRequest.setChairFeedback("Insufficient evidence");

        setUpAssignedRequest(request);
        when(stateMachineService.rejectRequest(42, "Insufficient evidence", chairUser))
                .thenReturn(updatedRequest);

        ChairRequestActionDTO response = chairReviewRequestService.reject(
                "derek-chair@derek.com",
                42,
                "Insufficient evidence");

        assertEquals(42, response.getRequestId());
        assertEquals("REJECTED", response.getStatus());
        assertNull(response.getAwardedPoints());
        assertEquals("Insufficient evidence", response.getChairFeedback());
        assertEquals(LocalDateTime.of(2026, 7, 2, 11, 45), response.getUpdatedAt());
        verify(stateMachineService).rejectRequest(42, "Insufficient evidence", chairUser);
    }
}
