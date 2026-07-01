package edu.franklin.cecas.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

import edu.franklin.cecas.domain.ExtraCreditRequest;
import edu.franklin.cecas.domain.ExtraCreditRequestStatus;
import edu.franklin.cecas.dto.StudentPointsDTO;
import edu.franklin.cecas.exception.PointCapExceededException;
import edu.franklin.cecas.repository.ExtraCreditRequestRepository;

@Service
public class PointAllocationService {
    
    private static final int MAX_POINTS = 50;
    
    private final ExtraCreditRequestRepository requestRepository;

    public PointAllocationService(ExtraCreditRequestRepository requestRepository) {
        this.requestRepository = requestRepository;
    }

    public int getUsedPoints(Integer studentId) {
        List<ExtraCreditRequest> approvedRequests =
                requestRepository.findByStudent_IdAndStatus(studentId, ExtraCreditRequestStatus.APPROVED);

        int usedPoints = 0;

        for (ExtraCreditRequest request : approvedRequests) {
            if (request.getAwardedPoints() != null) {
                usedPoints += request.getAwardedPoints();
            }
        }

        return usedPoints;
    }

    public int getRemainingPoints(Integer studentId) {
        return MAX_POINTS - getUsedPoints(studentId);
    }

    public int getPendingPoints(Integer studentId) {
        List<ExtraCreditRequest> pendingRequests =
                requestRepository.findByStudent_IdAndStatus(studentId, ExtraCreditRequestStatus.PENDING);

        int pendingPoints = 0;

        for (ExtraCreditRequest request : pendingRequests) {
            pendingPoints += pointsForRequest(request);
        }

        return pendingPoints;
    }

    public StudentPointsDTO getStudentPoints(Integer studentId) {
        int issued = getUsedPoints(studentId);
        int pending = getPendingPoints(studentId);
        int available = Math.max(MAX_POINTS - issued - pending, 0);

        return new StudentPointsDTO(issued, pending, available);
    }

    public boolean canAwardPoints(Integer studentId, int requestedPoints) {
        return getUsedPoints(studentId) + requestedPoints <= MAX_POINTS;
    }

    public boolean canSubmitPendingRequest(Integer studentId, int requestedPoints) {
        return getUsedPoints(studentId) + getPendingPoints(studentId) + requestedPoints <= MAX_POINTS;
    }

    @Transactional
    public void validatePointAllocation(Integer studentId, int requestedPoints) {
        int usedPoints = getUsedPoints(studentId);

        if (usedPoints + requestedPoints > MAX_POINTS) {
            throw new PointCapExceededException("Student exceeds 50 point maximum.");
        }
    }

    @Transactional
    public void validatePendingRequestAllowed(Integer studentId, int requestedPoints) {
        if (!canSubmitPendingRequest(studentId, requestedPoints)) {
            throw new PointCapExceededException("This request would exceed the 50 point maximum.");
        }
    }

    private int pointsForRequest(ExtraCreditRequest request) {
        if (request.getAwardedPoints() != null) {
            return request.getAwardedPoints();
        }

        if (request.getCategory() != null && request.getCategory().getDefaultPoints() != null) {
            return request.getCategory().getDefaultPoints();
        }

        return 0;
    }
}
