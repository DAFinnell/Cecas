package edu.franklin.cecas.service;

import edu.franklin.cecas.domain.ExtraCreditRequest;
import edu.franklin.cecas.domain.User;
import edu.franklin.cecas.dto.ChairRequestActionDTO;
import edu.franklin.cecas.dto.ChairReviewDTO;
import edu.franklin.cecas.dto.StudentPointsDTO;
import edu.franklin.cecas.exception.ChairNotAssignedException;
import edu.franklin.cecas.exception.ResourceNotFoundException;
import edu.franklin.cecas.repository.ChairCourseAssignmentRepository;
import edu.franklin.cecas.repository.ExtraCreditRequestRepository;
import edu.franklin.cecas.repository.UserRepository;
import edu.franklin.cecas.service.EvidenceStorageService.StoredEvidence;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ChairReviewRequestService {

    private final UserRepository userRepository;
    private final ExtraCreditRequestRepository requestRepository;
    private final ChairCourseAssignmentRepository assignmentRepository;
    private final PointAllocationService pointAllocationService;
    private final StateMachineService stateMachineService;
    private final EvidenceStorageService evidenceStorageService;

    public ChairReviewRequestService(
            UserRepository userRepository,
            ExtraCreditRequestRepository requestRepository,
            ChairCourseAssignmentRepository assignmentRepository,
            PointAllocationService pointAllocationService,
            StateMachineService stateMachineService,
            EvidenceStorageService evidenceStorageService) {

        this.userRepository = userRepository;
        this.requestRepository = requestRepository;
        this.assignmentRepository = assignmentRepository;
        this.pointAllocationService = pointAllocationService;
        this.stateMachineService = stateMachineService;
        this.evidenceStorageService = evidenceStorageService;
    }

    public ChairReviewDTO getRequestForReview(String username, Integer requestId) {

        User chair = resolveChair(username);
        ExtraCreditRequest request = requireAssignedRequest(chair, requestId);

        boolean assigned = assignmentRepository.existsByChair_IdAndCourse_CourseId(
                chair.getId(), request.getCourse().getCourseId());

        if (!assigned) {
            throw new ChairNotAssignedException("Chair is not assigned to this course.");
        }

        StudentPointsDTO pointsSummary = pointAllocationService.getStudentPoints(
                request.getStudent().getId(), request.getCourse().getTerm());

        ChairReviewDTO dto = new ChairReviewDTO();

        dto.setRequestId(request.getId());
        dto.setStatus(request.getStatus().name());
        dto.setDescription(request.getDescription());
        dto.setStudentName(request.getStudent().getFullName());
        dto.setStudentEmail(request.getStudent().getEmail());
        dto.setStudentId(request.getStudent().getStudentId());
        dto.setProgram(request.getStudent().getProgram());
        dto.setCourseId(request.getCourse().getCourseId());
        dto.setCourseCode(request.getCourse().getCourseCode());
        dto.setTerm(request.getCourse().getTerm());
        dto.setSection(request.getCourse().getSection());
        dto.setCategoryId(request.getCategory().getCategoryId());
        dto.setCategoryName(request.getCategory().getCategoryName());
        dto.setCategoryDescription(request.getCategory().getDescription());
        dto.setDefaultPoints(request.getCategory().getDefaultPoints());
        dto.setPointsSummary(pointsSummary);
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());
        dto.setAwardedPoints(request.getAwardedPoints());
        dto.setChairFeedback(request.getChairFeedback());

        String evidencePath = request.getEvidenceFilePath();
        boolean evidenceAvailable = evidencePath != null && !evidencePath.isBlank();

        dto.setEvidenceAvailable(evidenceAvailable);

        if (evidenceAvailable) {
            dto.setEvidenceFileName(evidenceStorageService.evidenceFileName(request.getId(), evidencePath));
            dto.setEvidenceContentType(
                    evidenceStorageService.contentTypeFor(evidencePath).toString());
        }

        return dto;
    }

    public ChairRequestActionDTO preApprove(String username, Integer requestId) {

        User chair = resolveChair(username);
        ExtraCreditRequest request = requireAssignedRequest(chair, requestId);

        boolean assigned = assignmentRepository.existsByChair_IdAndCourse_CourseId(
                chair.getId(), request.getCourse().getCourseId());

        if (!assigned) {
            throw new ChairNotAssignedException("Chair is not assigned to this course.");
        }

        ExtraCreditRequest updatedRequest = stateMachineService.preApproveRequest(requestId, chair);

        return toActionDTO(updatedRequest);
    }

    public ChairRequestActionDTO reject(String username, Integer requestId, String feedback) {

        User chair = resolveChair(username);
        ExtraCreditRequest request = requireAssignedRequest(chair, requestId);

        boolean assigned = assignmentRepository.existsByChair_IdAndCourse_CourseId(
                chair.getId(), request.getCourse().getCourseId());

        if (!assigned) {
            throw new ChairNotAssignedException("Chair is not assigned to this course.");
        }

        ExtraCreditRequest updatedRequest = stateMachineService.rejectRequest(requestId, feedback, chair);

        return toActionDTO(updatedRequest);
    }

    public ChairRequestActionDTO approve(String username, Integer requestId, Integer points, String feedback) {
        User chair = resolveChair(username);
        requireAssignedRequest(chair, requestId);

        ExtraCreditRequest updated = stateMachineService.approveWithPointsRequest(requestId, points, feedback, chair);

        return toActionDTO(updated);
    }

    public StoredEvidence getEvidence(String username, Integer requestId) {
        User chair = resolveChair(username);
        ExtraCreditRequest request = requireAssignedRequest(chair, requestId);

        return evidenceStorageService.loadEvidence(request.getId(), request.getEvidenceFilePath());
    }

    private User resolveChair(String username) {
        return userRepository
                .findByEmailIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("Chair not found."));
    }

    private ExtraCreditRequest requireAssignedRequest(User chair, Integer requestId) {

        ExtraCreditRequest request = requestRepository
                .findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Extra credit request not found."));

        boolean assigned = assignmentRepository.existsByChair_IdAndCourse_CourseId(
                chair.getId(), request.getCourse().getCourseId());

        if (!assigned) {
            throw new ChairNotAssignedException("Chair is not assigned to this course.");
        }

        return request;
    }

    private ChairRequestActionDTO toActionDTO(ExtraCreditRequest request) {
        ChairRequestActionDTO dto = new ChairRequestActionDTO();

        dto.setRequestId(request.getId());
        dto.setStatus(request.getStatus().name());
        dto.setAwardedPoints(request.getAwardedPoints());
        dto.setChairFeedback(request.getChairFeedback());
        dto.setUpdatedAt(request.getUpdatedAt());

        return dto;
    }
}
