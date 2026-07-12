package edu.franklin.cecas.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.franklin.cecas.domain.ExtraCreditRequest;
import edu.franklin.cecas.domain.ExtraCreditRequestStatus;
import edu.franklin.cecas.dto.StudentPointsDTO;
import edu.franklin.cecas.exception.PointCapExceededException;
import edu.franklin.cecas.repository.ExtraCreditRequestRepository;
import edu.franklin.cecas.config.ExtraCreditProperties;

@Service
public class PointAllocationService {

    private final ExtraCreditRequestRepository requestRepository;
    private final ExtraCreditProperties extraCreditProperties;

    public PointAllocationService(ExtraCreditRequestRepository requestRepository,
            ExtraCreditProperties extraCreditProperties) {
        this.requestRepository = requestRepository;
        this.extraCreditProperties = extraCreditProperties;
    }

    public int getUsedPoints(Integer studentId, String term) {
        List<ExtraCreditRequest> approvedRequests = requestRepository.findByStudent_IdAndCourse_TermAndStatus(studentId,
                term, ExtraCreditRequestStatus.APPROVED);

        int usedPoints = 0;

        for (ExtraCreditRequest request : approvedRequests) {
            if (request.getAwardedPoints() != null) {
                usedPoints += request.getAwardedPoints();
            }
        }

        return usedPoints;
    }

    public int getRemainingPoints(Integer studentId, String term) {
        return extraCreditProperties.cap() - getUsedPoints(studentId, term);
    }

    public int getPendingPoints(Integer studentId, String term) {
        List<ExtraCreditRequest> pendingRequests = requestRepository.findByStudent_IdAndCourse_TermAndStatusIn(
                studentId, term, List.of(ExtraCreditRequestStatus.PENDING, ExtraCreditRequestStatus.PRE_APPROVED));

        int pendingPoints = 0;

        for (ExtraCreditRequest request : pendingRequests) {
            pendingPoints += pointsForRequest(request);
        }

        return pendingPoints;
    }

    public StudentPointsDTO getStudentPoints(Integer studentId, String term) {
        int issued = getUsedPoints(studentId, term);
        int pending = getPendingPoints(studentId, term);
        int available = Math.max(extraCreditProperties.cap() - issued - pending, 0);

        return new StudentPointsDTO(issued, pending, available);
    }

    public boolean canAwardPoints(Integer studentId, String term, int requestedPoints) {
        return getUsedPoints(studentId, term) + requestedPoints <= extraCreditProperties.cap();
    }

    public boolean canSubmitPendingRequest(Integer studentId, String term, int requestedPoints) {
        return getUsedPoints(studentId, term) + getPendingPoints(studentId, term)
                + requestedPoints <= extraCreditProperties.cap();
    }

    @Transactional
    public void validatePendingRequestAllowed(Integer studentId, String term, int requestedPoints) {
        if (!canSubmitPendingRequest(studentId, term, requestedPoints)) {
            throw new PointCapExceededException("This request would exceed the " + extraCreditProperties.cap() + " point maximum.");
        }
    }

    @Transactional
    public void validateAwardAllowed(Integer studentId, String term, int requestedPoints) {
        if (!canAwardPoints(studentId, term, requestedPoints)) {
            throw new PointCapExceededException("This award would exceed the " + extraCreditProperties.cap() + " point maximum.");
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
