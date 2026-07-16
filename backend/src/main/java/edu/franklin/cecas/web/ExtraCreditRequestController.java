package edu.franklin.cecas.web;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import edu.franklin.cecas.dto.ExtraCreditRequestCreateDTO;
import edu.franklin.cecas.dto.StudentRequestDetailDTO;
import edu.franklin.cecas.dto.StudentRequestSummaryDTO;
import edu.franklin.cecas.service.EvidenceSubmissionService;
import edu.franklin.cecas.service.ExtraCreditRequestService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/extra-credit-requests")
public class ExtraCreditRequestController {
    private final ExtraCreditRequestService extraCreditRequestService;
    private final EvidenceSubmissionService evidenceSubmissionService;

    public ExtraCreditRequestController(ExtraCreditRequestService extraCreditRequestService,
            EvidenceSubmissionService evidenceSubmissionService) {
        this.extraCreditRequestService = extraCreditRequestService;
        this.evidenceSubmissionService = evidenceSubmissionService;
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping
    public ResponseEntity<StudentRequestDetailDTO> createRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ExtraCreditRequestCreateDTO dto) {
        StudentRequestDetailDTO response = extraCreditRequestService.createRequest(userDetails.getUsername(), dto);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping
    public ResponseEntity<List<StudentRequestSummaryDTO>> getRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<StudentRequestSummaryDTO> response = extraCreditRequestService.getRequestsForStudent(
                userDetails.getUsername());

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/{requestId}")
    public ResponseEntity<StudentRequestDetailDTO> getRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer requestId) {
        StudentRequestDetailDTO response = extraCreditRequestService.getRequestForStudent(
                userDetails.getUsername(),
                requestId);

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping(value = "/{requestId}/evidence", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StudentRequestDetailDTO> uploadEvidence(@AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer requestId, @RequestPart("evidence") MultipartFile evidence) {
        StudentRequestDetailDTO response = evidenceSubmissionService.submitEvidence(userDetails.getUsername(), requestId, evidence);

        return ResponseEntity.ok(response);
    }
}
