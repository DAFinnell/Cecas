package edu.franklin.cecas.service;

import edu.franklin.cecas.domain.ExtraCreditRequest;
import edu.franklin.cecas.domain.User;
import edu.franklin.cecas.dto.StudentRequestDetailDTO;
import edu.franklin.cecas.exception.StudentNotFoundException;
import edu.franklin.cecas.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class EvidenceSubmissionService {
    private final UserRepository userRepository;
    private final EvidenceStorageService evidenceStorageService;
    private final StateMachineService stateMachineService;

    public EvidenceSubmissionService(
            UserRepository userRepository,
            EvidenceStorageService evidenceStorageService,
            StateMachineService stateMachineService) {
        this.userRepository = userRepository;
        this.evidenceStorageService = evidenceStorageService;
        this.stateMachineService = stateMachineService;
    }

    public StudentRequestDetailDTO submitEvidence(String studentEmail, Integer requestId, MultipartFile evidence) {
        User student = userRepository
                .findByEmailIgnoreCase(studentEmail)
                .orElseThrow(() -> new StudentNotFoundException("Student not found."));

        String relativePath = evidenceStorageService.saveEvidence((requestId), evidence);

        try {
            ExtraCreditRequest updated = stateMachineService.submitEvidenceRequest(requestId, student, relativePath);

            return new StudentRequestDetailDTO(updated);
        } catch (RuntimeException ex) {
            evidenceStorageService.deleteIfExists(relativePath);
            throw ex;
        }
    }
}
