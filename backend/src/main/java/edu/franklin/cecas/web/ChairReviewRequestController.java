package edu.franklin.cecas.web;

import edu.franklin.cecas.dto.ChairApproveRequestDTO;
import edu.franklin.cecas.dto.ChairRejectRequestDTO;
import edu.franklin.cecas.dto.ChairRequestActionDTO;
import edu.franklin.cecas.dto.ChairReviewDTO;
import edu.franklin.cecas.service.ChairReviewRequestService;
import edu.franklin.cecas.service.EvidenceStorageService.StoredEvidence;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chair/requests")
@Validated
public class ChairReviewRequestController {

    private final ChairReviewRequestService chairRequestReviewService;

    public ChairReviewRequestController(ChairReviewRequestService chairRequestReviewService) {
        this.chairRequestReviewService = chairRequestReviewService;
    }

    @PreAuthorize("hasRole('CHAIR')")
    @GetMapping("/{requestId}/review")
    public ResponseEntity<ChairReviewDTO> getRequestForReview(
            @AuthenticationPrincipal UserDetails userDetails, @PathVariable Integer requestId) {

        ChairReviewDTO response = chairRequestReviewService.getRequestForReview(userDetails.getUsername(), requestId);

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('CHAIR')")
    @PostMapping("/{requestId}/pre-approve")
    public ResponseEntity<ChairRequestActionDTO> preApprove(
            @AuthenticationPrincipal UserDetails userDetails, @PathVariable Integer requestId) {

        ChairRequestActionDTO response = chairRequestReviewService.preApprove(userDetails.getUsername(), requestId);

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('CHAIR')")
    @PostMapping("/{requestId}/reject")
    public ResponseEntity<ChairRequestActionDTO> reject(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer requestId,
            @Valid @RequestBody ChairRejectRequestDTO request) {

        ChairRequestActionDTO response =
                chairRequestReviewService.reject(userDetails.getUsername(), requestId, request.getFeedback());

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('CHAIR')")
    @PostMapping("/{requestId}/approve")
    public ResponseEntity<ChairRequestActionDTO> approve(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer requestId,
            @Valid @RequestBody ChairApproveRequestDTO request) {
        ChairRequestActionDTO response = chairRequestReviewService.approve(
                userDetails.getUsername(), requestId, request.getPoints(), request.getFeedback());

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('CHAIR')")
    @GetMapping("/{requestId}/evidence")
    public ResponseEntity<Resource> getEvidence(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer requestId,
            @RequestParam(defaultValue = "false") boolean download) {
        StoredEvidence evidence = chairRequestReviewService.getEvidence(userDetails.getUsername(), requestId);

        ContentDisposition disposition = download
                ? ContentDisposition.attachment().filename(evidence.fileName()).build()
                : ContentDisposition.inline().filename(evidence.fileName()).build();

        return ResponseEntity.ok()
                .contentType(evidence.contentType())
                .contentLength(evidence.size())
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(evidence.resource());
    }
}
