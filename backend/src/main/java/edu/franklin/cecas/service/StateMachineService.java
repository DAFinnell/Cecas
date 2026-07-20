package edu.franklin.cecas.service;

import edu.franklin.cecas.domain.ExtraCreditRequest;
import edu.franklin.cecas.domain.User;

public interface StateMachineService {

    /**
     * PENDING -> PRE_APPROVED
     * Chair Only
     */
    ExtraCreditRequest preApproveRequest(Integer requestId, User chair);
    
    /**
     * PENDING -> REJECTED (Pre-Review)
     * EVIDENCE_SUBMITTED -> REJECTED (Final Review)
     * Chair Only
     */
    ExtraCreditRequest rejectRequest(Integer requestId, String feedback, User chair);
    
    /**
     * PRE_APPROVED -> EVIDENCE_SUBMITTED 
     * Student Only
     */
    ExtraCreditRequest submitEvidenceRequest(Integer requestId, User student, String evidenceFilePath);

    /**
     * PRE_APPROVED -> CLOSED 
     * Automated
     */
    ExtraCreditRequest passDeadlineRequest(Integer requestId);

    /**
     * EVIDENCE_SUBMITTED -> APPROVED 
     * Chair Only
     */
    ExtraCreditRequest approveWithPointsRequest(Integer requestId, Integer points, User chair);
}
