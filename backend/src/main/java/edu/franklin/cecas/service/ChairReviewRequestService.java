package edu.franklin.cecas.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.franklin.cecas.domain.ExtraCreditRequest;
import edu.franklin.cecas.domain.User;
import edu.franklin.cecas.dto.ChairReviewDTO;
import edu.franklin.cecas.dto.ChairRequestActionDTO;
import edu.franklin.cecas.dto.StudentPointsDTO;
import edu.franklin.cecas.exception.ChairNotAssignedException;
import edu.franklin.cecas.exception.ResourceNotFoundException;
import edu.franklin.cecas.repository.ChairCourseAssignmentRepository;
import edu.franklin.cecas.repository.ExtraCreditRequestRepository;
import edu.franklin.cecas.repository.UserRepository;

@Service
@Transactional
public class ChairReviewRequestService {

    private final UserRepository userRepository;
    private final ExtraCreditRequestRepository requestRepository;
    private final ChairCourseAssignmentRepository assignmentRepository;
    private final PointAllocationService pointAllocationService;
    private final StateMachineService stateMachineService;

    public ChairReviewRequestService(
            UserRepository userRepository,
            ExtraCreditRequestRepository requestRepository,
            ChairCourseAssignmentRepository assignmentRepository,
            PointAllocationService pointAllocationService,
            StateMachineService stateMachineService) {

        this.userRepository = userRepository;
        this.requestRepository = requestRepository;
        this.assignmentRepository = assignmentRepository;
        this.pointAllocationService = pointAllocationService;
        this.stateMachineService = stateMachineService;
    }

    public ChairReviewDTO getRequestForReview(String username, Integer requestId) {

        User chair = userRepository.findByEmailIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("Chair not found."));

        ExtraCreditRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Extra credit request not found."));

        boolean assigned = assignmentRepository.existsByChair_IdAndCourse_CourseId(
                chair.getId(),
                request.getCourse().getCourseId());

        if (!assigned) {
            throw new ChairNotAssignedException(
                    "Chair is not assigned to this course.");
        }

        StudentPointsDTO pointsSummary = pointAllocationService.getStudentPoints(
                request.getStudent().getId(),
                request.getCourse().getTerm());

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

        return dto;
    }

    public ChairRequestActionDTO preApprove(String username, Integer requestId) {

        User chair = userRepository.findByEmailIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("Chair not found."));

        ExtraCreditRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Extra credit request not found."));

        boolean assigned = assignmentRepository.existsByChair_IdAndCourse_CourseId(
                chair.getId(),
                request.getCourse().getCourseId());

        if (!assigned) {
            throw new ChairNotAssignedException(
                    "Chair is not assigned to this course.");
        }

        ExtraCreditRequest updatedRequest = stateMachineService.preApproveRequest(requestId, chair);

        ChairRequestActionDTO dto = new ChairRequestActionDTO();

        dto.setRequestId(updatedRequest.getId());
        dto.setStatus(updatedRequest.getStatus().name());
        dto.setChairFeedback(updatedRequest.getChairFeedback());
        dto.setUpdatedAt(updatedRequest.getUpdatedAt());

        return dto;
    }

    public ChairRequestActionDTO reject(
            String username,
            Integer requestId,
            String feedback) {

        User chair = userRepository.findByEmailIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("Chair not found."));

        ExtraCreditRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Extra credit request not found."));

        boolean assigned = assignmentRepository.existsByChair_IdAndCourse_CourseId(
                chair.getId(),
                request.getCourse().getCourseId());

        if (!assigned) {
            throw new ChairNotAssignedException(
                    "Chair is not assigned to this course.");
        }

        ExtraCreditRequest updatedRequest = stateMachineService.rejectRequest(
                requestId,
                feedback,
                chair);

        ChairRequestActionDTO dto = new ChairRequestActionDTO();

        dto.setRequestId(updatedRequest.getId());
        dto.setStatus(updatedRequest.getStatus().name());
        dto.setChairFeedback(updatedRequest.getChairFeedback());
        dto.setUpdatedAt(updatedRequest.getUpdatedAt());

        return dto;
    }

}
