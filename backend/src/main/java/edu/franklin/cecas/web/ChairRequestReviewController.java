package edu.franklin.cecas.web;

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
import org.springframework.web.bind.annotation.RestController;

import edu.franklin.cecas.dto.ChairPreReviewDTO;
import edu.franklin.cecas.dto.ChairRejectRequestDTO;
import edu.franklin.cecas.dto.ChairRequestActionDTO;
import edu.franklin.cecas.service.ChairRequestReviewService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/chair/requests")
@Validated
public class ChairRequestReviewController {

    private final ChairRequestReviewService chairRequestReviewService;

    public ChairRequestReviewController(
            ChairRequestReviewService chairRequestReviewService) {
        this.chairRequestReviewService = chairRequestReviewService;
    }

    @PreAuthorize("hasRole('CHAIR')")
    @GetMapping("/{requestId}/pre-review")
    public ResponseEntity<ChairPreReviewDTO> preReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer requestId) {

        ChairPreReviewDTO response = chairRequestReviewService.getPendingRequestForReview(
                userDetails.getUsername(),
                requestId);

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('CHAIR')")
    @PostMapping("/{requestId}/pre-approve")
    public ResponseEntity<ChairRequestActionDTO> preApprove(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer requestId) {

        ChairRequestActionDTO response = chairRequestReviewService.preApprove(
                userDetails.getUsername(),
                requestId);

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('CHAIR')")
    @PostMapping("/{requestId}/reject")
    public ResponseEntity<ChairRequestActionDTO> reject(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer requestId,
            @Valid @RequestBody ChairRejectRequestDTO request) {

        ChairRequestActionDTO response = chairRequestReviewService.reject(
                userDetails.getUsername(),
                requestId,
                request.getFeedback());

        return ResponseEntity.ok(response);
    }
}
