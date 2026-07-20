package edu.franklin.cecas.service;

import java.util.Objects;

import org.springframework.stereotype.Service;

import edu.franklin.cecas.domain.ExtraCreditRequest;
import edu.franklin.cecas.domain.ExtraCreditRequestStatus;
import edu.franklin.cecas.domain.User;
import edu.franklin.cecas.domain.UserRole;
import edu.franklin.cecas.exception.EvidenceUploadException;
import edu.franklin.cecas.exception.InvalidStateTransitionException;
import edu.franklin.cecas.exception.ResourceNotFoundException;
import edu.franklin.cecas.exception.UnauthorizedRoleException;
import edu.franklin.cecas.exception.UserNotFoundException;
import edu.franklin.cecas.repository.ExtraCreditRequestRepository;
import edu.franklin.cecas.repository.UserRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class StateMachineServiceImpl implements StateMachineService {

    private final ExtraCreditRequestRepository requestRepository;
    private final PointAllocationService pointAllocationService;
    private final UserRepository userRepository;

    public StateMachineServiceImpl(
            ExtraCreditRequestRepository requestRepository,
            PointAllocationService pointAllocationService,
            UserRepository userRepository) {
        this.requestRepository = requestRepository;
        this.pointAllocationService = pointAllocationService;
        this.userRepository = userRepository;
    }

    private boolean isFinal(ExtraCreditRequest request) {
        ExtraCreditRequestStatus status = request.getStatus();
        return status == ExtraCreditRequestStatus.REJECTED
                || status == ExtraCreditRequestStatus.APPROVED
                || status == ExtraCreditRequestStatus.CLOSED;
    }

    private void requireRole(User user, UserRole role) {
        if (user == null || user.getRole() != role) {
            throw new UnauthorizedRoleException("User does not have the required role: " + role);
        }
    }

    @Override
    public ExtraCreditRequest preApproveRequest(Integer requestId, User user) {
        ExtraCreditRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with ID: " + requestId));

        if (isFinal(request)) {
            throw new InvalidStateTransitionException("Cannot transition from final state: " + request.getStatus());
        }

        if (request.getStatus() != ExtraCreditRequestStatus.PENDING) {
            throw new InvalidStateTransitionException("Invalid transition: pre-approve allowed only from PENDING.");
        }

        requireRole(user, UserRole.CHAIR);
        request.setChair(user);
        request.setStatus(ExtraCreditRequestStatus.PRE_APPROVED);
        return requestRepository.save(request);
    }

    @Override
    public ExtraCreditRequest rejectRequest(Integer requestId, String feedback, User user) {
        ExtraCreditRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with ID: " + requestId));

        if (isFinal(request)) {
            throw new InvalidStateTransitionException(
                    "Invalid transition: request is in final state " + request.getStatus());
        }

        if (request.getStatus() != ExtraCreditRequestStatus.PENDING
                && request.getStatus() != ExtraCreditRequestStatus.EVIDENCE_SUBMITTED) {
            throw new InvalidStateTransitionException(
                    "Invalid transition: reject allowed only from PENDING or EVIDENCE_SUBMITTED state.");
        }
        
        requireRole(user, UserRole.CHAIR);

        if (feedback == null || feedback.trim().isEmpty()) {
            throw new InvalidStateTransitionException("Rejection requires non-empty feedback.");
        }

        request.setChairFeedback(feedback);
        request.setStatus(ExtraCreditRequestStatus.REJECTED);
        request.setChair(user);
        return requestRepository.save(request);
    }

    @Override
    public ExtraCreditRequest submitEvidenceRequest(Integer requestId, User user, String evidenceFilePath) {
        ExtraCreditRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with ID: " + requestId));

        if (isFinal(request)) {
            throw new InvalidStateTransitionException(
                    "Invalid transition: request is in terminal state " + request.getStatus());
        }

        if (request.getStatus() != ExtraCreditRequestStatus.PRE_APPROVED) {
            throw new InvalidStateTransitionException(
                    "Invalid transition: evidence can only be submitted when request is PRE_APPROVED.");
        }

        requireRole(user, UserRole.STUDENT);

        if (!Objects.equals(request.getStudent().getId(), user.getId())) {
            throw new UnauthorizedRoleException("Only the owning student may submit evidence for this request.");
        }

        if (request.getEvidenceFilePath() != null && !request.getEvidenceFilePath().isBlank()) {
            throw new EvidenceUploadException("Evidence has already been uploaded for this request.");
        }

        request.setEvidenceFilePath(evidenceFilePath);
        request.setStatus(ExtraCreditRequestStatus.EVIDENCE_SUBMITTED);
        return requestRepository.saveAndFlush(request);
    }

    @Override
    public ExtraCreditRequest passDeadlineRequest(Integer requestId) {
        ExtraCreditRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with ID: " + requestId));

        if (isFinal(request)) {
            throw new InvalidStateTransitionException(
                    "Invalid transition: request is in terminal state " + request.getStatus());
        }

        if (request.getStatus() != ExtraCreditRequestStatus.PRE_APPROVED) {
            throw new InvalidStateTransitionException("Invalid status transition.");
        }

        request.setStatus(ExtraCreditRequestStatus.CLOSED);
        return requestRepository.save(request);
    }

    @Override
    public ExtraCreditRequest approveWithPointsRequest(Integer requestId, Integer points, User user) {
        ExtraCreditRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with ID: " + requestId));

        if (isFinal(request)) {
            throw new InvalidStateTransitionException(
                    "Invalid transition: request is in final state " + request.getStatus());
        }

        if (request.getStatus() != ExtraCreditRequestStatus.EVIDENCE_SUBMITTED) {
            throw new InvalidStateTransitionException(
                    "Invalid transition: approval with points requires EVIDENCE_SUBMITTED state.");
        }

        requireRole(user, UserRole.CHAIR);

        userRepository.findByIdForUpdate(request.getStudent().getId())
                .orElseThrow(() -> new UserNotFoundException("Student not found."));

        pointAllocationService.validateAwardAllowed(
                request.getStudent().getId(),
                request.getCourse().getTerm(),
                points);

        request.setAwardedPoints(points);
        request.setStatus(ExtraCreditRequestStatus.APPROVED);
        return requestRepository.save(request);
    }
}
