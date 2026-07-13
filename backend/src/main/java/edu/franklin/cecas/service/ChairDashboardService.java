package edu.franklin.cecas.service;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.franklin.cecas.domain.ExtraCreditRequest;
import edu.franklin.cecas.domain.ExtraCreditRequestStatus;
import edu.franklin.cecas.domain.User;
import edu.franklin.cecas.dto.ChairDashboardQueueResponse;
import edu.franklin.cecas.dto.ChairDashboardSummaryResponse;
import edu.franklin.cecas.repository.ChairCourseAssignmentRepository;
import edu.franklin.cecas.repository.ExtraCreditRequestRepository;
import edu.franklin.cecas.repository.UserRepository;

@Service
public class ChairDashboardService {

    private final UserRepository userRepository;
    private final ChairCourseAssignmentRepository chairCourseAssignmentRepository;
    private final ExtraCreditRequestRepository extraCreditRequestRepository;

    public ChairDashboardService(UserRepository userRepository, ChairCourseAssignmentRepository chairCourseAssignmentRepository, ExtraCreditRequestRepository extraCreditRequestRepository) {
        this.userRepository = userRepository;
        this.chairCourseAssignmentRepository = chairCourseAssignmentRepository;
        this.extraCreditRequestRepository = extraCreditRequestRepository;
    }

         /**
     * Summary counts for the chair's assigned courses. If the chair has no assignments
     * returns zeros for all counts.
     */
    @Transactional(readOnly = true)
    public ChairDashboardSummaryResponse getRequestCountSummary(UserDetails userDetails) {
        User chair = resolveChair(userDetails);
        List<Integer> assignedCourseIds = getAssignedCourseIds(chair);

        if (assignedCourseIds.isEmpty()) {
            return new ChairDashboardSummaryResponse(0L, 0L, 0L, 0L);
        }

        long pending = extraCreditRequestRepository
                .countByCourse_CourseIdInAndStatus(assignedCourseIds, ExtraCreditRequestStatus.PENDING);
        long evidence = extraCreditRequestRepository
                .countByCourse_CourseIdInAndStatus(assignedCourseIds, ExtraCreditRequestStatus.EVIDENCE_SUBMITTED);
        long approved = extraCreditRequestRepository
                .countByCourse_CourseIdInAndStatus(assignedCourseIds, ExtraCreditRequestStatus.PRE_APPROVED);
        long rejected = extraCreditRequestRepository
                .countByCourse_CourseIdInAndStatus(assignedCourseIds, ExtraCreditRequestStatus.REJECTED);

        return new ChairDashboardSummaryResponse(pending, evidence, approved, rejected);
    }

    /**
     * Queue list for the chair's assigned courses. Defaults to only PENDING when
     * controller passes that status. Returns empty list when no course assignments exist.
     * Results ordered by updatedAt DESC as provided by repository method.
     */
    @Transactional(readOnly = true)
    public List<ChairDashboardQueueResponse> getChairReviewQueue(UserDetails userDetails, ExtraCreditRequestStatus status) {
        User chair = resolveChair(userDetails);
        List<Integer> assignedCourseIds = getAssignedCourseIds(chair);

        if (assignedCourseIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<ExtraCreditRequest> requests = extraCreditRequestRepository
                .findByCourse_CourseIdInAndStatusOrderByUpdatedAtDesc(assignedCourseIds, status);

        return requests.stream()
                .filter(Objects::nonNull)
                .map(ChairDashboardQueueResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Resolves the chair user from the provided UserDetails. Throws an exception if the user is not found.
     * @param userDetails
     * @return
     */
    public User resolveChair(UserDetails userDetails) {
        String username = userDetails.getUsername();
        Optional<User> maybe = userRepository.findByEmailIgnoreCase(username);
        return maybe.orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    // helper method to get assigned course IDs for a chair user
    private List<Integer> getAssignedCourseIds(User chair) {
        // Map chair-course assignments to course IDs.
        return chairCourseAssignmentRepository.findAllByChairId(chair.getId()).stream()
                .filter(Objects::nonNull)
                .map(a -> a.getCourse().getCourseId())
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
    }
}
