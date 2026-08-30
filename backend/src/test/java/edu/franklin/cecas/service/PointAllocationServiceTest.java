package edu.franklin.cecas.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import edu.franklin.cecas.config.ExtraCreditProperties;
import edu.franklin.cecas.domain.Category;
import edu.franklin.cecas.domain.ExtraCreditRequest;
import edu.franklin.cecas.domain.ExtraCreditRequestStatus;
import edu.franklin.cecas.dto.StudentPointsDTO;
import edu.franklin.cecas.repository.ExtraCreditRequestRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PointAllocationServiceTest {

    private ExtraCreditRequestRepository requestRepository;
    private PointAllocationService pointAllocationService;

    @BeforeEach
    void setUp() {
        requestRepository = mock(ExtraCreditRequestRepository.class);
        pointAllocationService = new PointAllocationService(requestRepository, new ExtraCreditProperties(50));
    }

    private ExtraCreditRequest createRequest(
            ExtraCreditRequestStatus status, Integer defaultPoints, Integer awardedPoints) {

        Category category = new Category();
        category.setCategoryName("Seminar Attendance");
        category.setDescription("Approved attendance at an academic or professional seminar");
        category.setDefaultPoints(defaultPoints);

        ExtraCreditRequest request = new ExtraCreditRequest();
        request.setStatus(status);
        request.setCategory(category);
        request.setAwardedPoints(awardedPoints);
        return request;
    }

    /**
     * Verifies that pending point calculations include requests with submitted
     * evidence.
     */
    @Test
    void testGetPendingPointsIncludesEvidenceSubmittedRequests() {
        ExtraCreditRequest evidenceSubmitted = createRequest(ExtraCreditRequestStatus.EVIDENCE_SUBMITTED, 5, null);

        when(requestRepository.findByStudent_IdAndCourse_TermAndStatusIn(
                        11,
                        "26/FA",
                        List.of(
                                ExtraCreditRequestStatus.PENDING,
                                ExtraCreditRequestStatus.PRE_APPROVED,
                                ExtraCreditRequestStatus.EVIDENCE_SUBMITTED)))
                .thenReturn(List.of(evidenceSubmitted));

        int pendingPoints = pointAllocationService.getPendingPoints(11, "26/FA");

        assertEquals(5, pendingPoints);
        verify(requestRepository)
                .findByStudent_IdAndCourse_TermAndStatusIn(
                        11,
                        "26/FA",
                        List.of(
                                ExtraCreditRequestStatus.PENDING,
                                ExtraCreditRequestStatus.PRE_APPROVED,
                                ExtraCreditRequestStatus.EVIDENCE_SUBMITTED));
    }

    /**
     * Verifies that approving submitted evidence moves points from pending to
     * issued.
     */
    @Test
    void testGetStudentPointsUpdatesAfterEvidenceIsApproved() {
        ExtraCreditRequest evidenceSubmitted = createRequest(ExtraCreditRequestStatus.EVIDENCE_SUBMITTED, 5, null);
        ExtraCreditRequest approved = createRequest(ExtraCreditRequestStatus.APPROVED, 5, 3);

        when(requestRepository.findByStudent_IdAndCourse_TermAndStatus(11, "26/FA", ExtraCreditRequestStatus.APPROVED))
                .thenReturn(List.of())
                .thenReturn(List.of(approved));
        when(requestRepository.findByStudent_IdAndCourse_TermAndStatusIn(
                        11,
                        "26/FA",
                        List.of(
                                ExtraCreditRequestStatus.PENDING,
                                ExtraCreditRequestStatus.PRE_APPROVED,
                                ExtraCreditRequestStatus.EVIDENCE_SUBMITTED)))
                .thenReturn(List.of(evidenceSubmitted))
                .thenReturn(List.of());

        StudentPointsDTO beforeApproval = pointAllocationService.getStudentPoints(11, "26/FA");
        StudentPointsDTO afterApproval = pointAllocationService.getStudentPoints(11, "26/FA");

        assertEquals(0, beforeApproval.getIssued());
        assertEquals(5, beforeApproval.getPending());
        assertEquals(45, beforeApproval.getAvailable());
        assertEquals(3, afterApproval.getIssued());
        assertEquals(0, afterApproval.getPending());
        assertEquals(47, afterApproval.getAvailable());
    }

    /**
     * Verifies that rejecting submitted evidence removes its points from
     * pending without adding issued points.
     */
    @Test
    void testGetStudentPointsUpdatesAfterEvidenceIsRejected() {
        ExtraCreditRequest evidenceSubmitted = createRequest(ExtraCreditRequestStatus.EVIDENCE_SUBMITTED, 5, null);

        when(requestRepository.findByStudent_IdAndCourse_TermAndStatus(11, "26/FA", ExtraCreditRequestStatus.APPROVED))
                .thenReturn(List.of());
        when(requestRepository.findByStudent_IdAndCourse_TermAndStatusIn(
                        11,
                        "26/FA",
                        List.of(
                                ExtraCreditRequestStatus.PENDING,
                                ExtraCreditRequestStatus.PRE_APPROVED,
                                ExtraCreditRequestStatus.EVIDENCE_SUBMITTED)))
                .thenReturn(List.of(evidenceSubmitted))
                .thenReturn(List.of());

        StudentPointsDTO beforeRejection = pointAllocationService.getStudentPoints(11, "26/FA");
        StudentPointsDTO afterRejection = pointAllocationService.getStudentPoints(11, "26/FA");

        assertEquals(0, beforeRejection.getIssued());
        assertEquals(5, beforeRejection.getPending());
        assertEquals(45, beforeRejection.getAvailable());
        assertEquals(0, afterRejection.getIssued());
        assertEquals(0, afterRejection.getPending());
        assertEquals(50, afterRejection.getAvailable());
    }
}
