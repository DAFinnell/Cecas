package edu.franklin.cecas.web;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.franklin.cecas.domain.ExtraCreditRequestStatus;
import edu.franklin.cecas.dto.ChairDashboardQueueResponse;
import edu.franklin.cecas.dto.ChairDashboardSummaryResponse;
import edu.franklin.cecas.service.ChairDashboardService;

@RestController
@RequestMapping("/api/chair/dashboard")
public class ChairDashboardController {

    private final ChairDashboardService chairDashboardService;

    public ChairDashboardController(ChairDashboardService chairDashboardService) {
        this.chairDashboardService = chairDashboardService;
    }


/**
     * Get Count Summary of requests for the chair dashboard
     * Returns counts for PENDING, EVIDENCE_SUBMITTED, PRE_APPROVED (approvedCount), and REJECTED
     */
    @PreAuthorize("hasRole('CHAIR')")
    @GetMapping("/summary")
    public ChairDashboardSummaryResponse getRequestCountSummary(@AuthenticationPrincipal UserDetails userDetails) {
        return chairDashboardService.getRequestCountSummary(userDetails);
    }

    /**
     * Get the queue of extra credit requests for the chair's assigned courses.
     * Defaults to status PENDING if not provided.
     */
    @PreAuthorize("hasRole('CHAIR')")
    @GetMapping("/queue")
    public List<ChairDashboardQueueResponse> getChairReviewQueue(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "PENDING") ExtraCreditRequestStatus status) {
        return chairDashboardService.getChairReviewQueue(userDetails, status);
    }
}