package edu.franklin.cecas.web;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import edu.franklin.cecas.dto.ExtraCreditRequestCreateDTO;
import edu.franklin.cecas.dto.ExtraCreditResponseDTO;
import edu.franklin.cecas.service.ExtraCreditRequestService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/extra-credit-requests")
public class ExtraCreditRequestController {
        private static final Logger log = LoggerFactory.getLogger(ExtraCreditRequestController.class);

    private final ExtraCreditRequestService extraCreditRequestService;

    public ExtraCreditRequestController(ExtraCreditRequestService extraCreditRequestService) {
        this.extraCreditRequestService = extraCreditRequestService;
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping
    public ResponseEntity<ExtraCreditResponseDTO> createRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ExtraCreditRequestCreateDTO dto
    ) {
               try {
            log.info("createRequest by {} dto={}", userDetails != null ? userDetails.getUsername() : "anonymous", dto);
            ExtraCreditResponseDTO response =
                    extraCreditRequestService.createRequest(userDetails.getUsername(), dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("createRequest failed for user={} dto={}", userDetails != null ? userDetails.getUsername() : "anonymous", dto, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create request");
        }
    }


    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping
    public ResponseEntity<List<ExtraCreditResponseDTO>> getRequests(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<ExtraCreditResponseDTO> response =
                extraCreditRequestService.getRequestsForStudent(
                        userDetails.getUsername());

        return ResponseEntity.ok(response);
    }
}
