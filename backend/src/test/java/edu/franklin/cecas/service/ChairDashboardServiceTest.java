package edu.franklin.cecas.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import edu.franklin.cecas.domain.Category;
import edu.franklin.cecas.domain.ChairCourseAssignment;
import edu.franklin.cecas.domain.Course;
import edu.franklin.cecas.domain.ExtraCreditRequest;
import edu.franklin.cecas.domain.ExtraCreditRequestStatus;
import edu.franklin.cecas.domain.User;
import edu.franklin.cecas.dto.ChairDashboardSummaryResponse;
import edu.franklin.cecas.dto.ChairDashboardQueueResponse;
import edu.franklin.cecas.repository.ChairCourseAssignmentRepository;
import edu.franklin.cecas.repository.ExtraCreditRequestRepository;
import edu.franklin.cecas.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class ChairDashboardServiceTest {

    private UserRepository userRepository;
    private ChairCourseAssignmentRepository chairCourseAssignmentRepository;
    private ExtraCreditRequestRepository extraCreditRequestRepository;

    private ChairDashboardService service;

    @Captor
    ArgumentCaptor<List<Integer>> courseListCaptor;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        chairCourseAssignmentRepository = mock(ChairCourseAssignmentRepository.class);
        extraCreditRequestRepository = mock(ExtraCreditRequestRepository.class);

        service = new ChairDashboardService(userRepository, chairCourseAssignmentRepository, extraCreditRequestRepository);
    }

    @Test
    void testGetRequestCountSummaryThrowsWhenUnknownUser() {
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("unknown@example.edu");
        when(userRepository.findByEmailIgnoreCase("unknown@example.edu")).thenReturn(Optional.empty());
        UsernameNotFoundException exception = assertThrows(UsernameNotFoundException.class, () -> service.resolveChair(userDetails));
        assertThat(exception.getMessage()).contains("User not found");
    }

    @Test
    void testSummaryUsesOnlyAssignedCourseIdsAndIgnoresOthers() {
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("chair@example.edu");

        User chair = mock(User.class);
        when(chair.getId()).thenReturn(42);
        when(userRepository.findByEmailIgnoreCase("chair@example.edu")).thenReturn(Optional.of(chair));

        // two assignments -> course ids 1 and 2
        Course c1 = mock(Course.class);
        when(c1.getCourseId()).thenReturn(1);
        ChairCourseAssignment a1 = mock(ChairCourseAssignment.class);
        when(a1.getCourse()).thenReturn(c1);

        Course c2 = mock(Course.class);
        when(c2.getCourseId()).thenReturn(2);
        ChairCourseAssignment a2 = mock(ChairCourseAssignment.class);
        when(a2.getCourse()).thenReturn(c2);

        when(chairCourseAssignmentRepository.findAllByChairId(42)).thenReturn(List.of(a1, a2));

        when(extraCreditRequestRepository.countByCourse_CourseIdInAndStatus(anyList(), eq(ExtraCreditRequestStatus.PENDING)))
                .thenReturn(5L);
        when(extraCreditRequestRepository.countByCourse_CourseIdInAndStatus(anyList(), eq(ExtraCreditRequestStatus.EVIDENCE_SUBMITTED)))
                .thenReturn(2L);
        when(extraCreditRequestRepository.countByCourse_CourseIdInAndStatus(anyList(), eq(ExtraCreditRequestStatus.PRE_APPROVED)))
                .thenReturn(1L);
        when(extraCreditRequestRepository.countByCourse_CourseIdInAndStatus(anyList(), eq(ExtraCreditRequestStatus.REJECTED)))
                .thenReturn(0L);

        ChairDashboardSummaryResponse response = service.getRequestCountSummary(userDetails);

        assertThat(response).isNotNull();
        assertThat(response.getPendingCount()).isEqualTo(5L);
        assertThat(response.getEvidenceSubmittedCount()).isEqualTo(2L);
        assertThat(response.getApprovedCount()).isEqualTo(1L);
        assertThat(response.getRejectedCount()).isEqualTo(0L);

        // verify repository was called with only the two assigned course ids
        verify(extraCreditRequestRepository, times(4)).countByCourse_CourseIdInAndStatus(courseListCaptor.capture(), any());
        List<Integer> captured = courseListCaptor.getAllValues().get(0);
        assertThat(captured).containsExactlyInAnyOrder(1, 2);
    }

    @Test
    void testEmptyAssignmentsReturnZeroAndEmptyQueue() {
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("chair00@example.edu");

        User chair = mock(User.class);
        when(chair.getId()).thenReturn(7);
        when(userRepository.findByEmailIgnoreCase("chair00@example.edu")).thenReturn(Optional.of(chair));

        when(chairCourseAssignmentRepository.findAllByChairId(7)).thenReturn(List.of());

        ChairDashboardSummaryResponse summary = service.getRequestCountSummary(userDetails);
        assertThat(summary.getPendingCount()).isEqualTo(0L);
        assertThat(summary.getEvidenceSubmittedCount()).isEqualTo(0L);
        assertThat(summary.getApprovedCount()).isEqualTo(0L);
        assertThat(summary.getRejectedCount()).isEqualTo(0L);

        List<ChairDashboardQueueResponse> queue = service.getChairReviewQueue(userDetails, ExtraCreditRequestStatus.PENDING);
        assertThat(queue).isEmpty();

        // ensure repo not invoked for counts or find when no assignments
        verifyNoInteractions(extraCreditRequestRepository);
    }

    @Test
    void testQueueAsDescViaUpdatedAt() {
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("chair@example.edu");

        User chair = mock(User.class);
        when(chair.getId()).thenReturn(9);
        when(userRepository.findByEmailIgnoreCase("chair@example.edu")).thenReturn(Optional.of(chair));

        Course course = mock(Course.class);
        when(course.getCourseId()).thenReturn(100);

        Category category = mock(Category.class);
        when(category.getCategoryId()).thenReturn(1);
        when(category.getCategoryName()).thenReturn("Test Category");

        ChairCourseAssignment assignment = mock(ChairCourseAssignment.class);
        when(assignment.getCourse()).thenReturn(course);
        when(chairCourseAssignmentRepository.findAllByChairId(9)).thenReturn(List.of(assignment));

        User student = mock(User.class);
        when(student.getFullName()).thenReturn("Test Student");
        when(student.getEmail()).thenReturn("student@test.edu");
        

        
        ExtraCreditRequest request1 = new ExtraCreditRequest();
        request1.setId(10);
        request1.setStudent(student);
        request1.setCourse(course);
        request1.setCategory(category);
        request1.setDescription("older request");
        request1.setStatus(ExtraCreditRequestStatus.PENDING);
        request1.setAwardedPoints(5);
        request1.setUpdatedAt(LocalDateTime.now().minusMinutes(2));

        ExtraCreditRequest request2 = new ExtraCreditRequest();
        request2.setId(11);
        request2.setStudent(student);
        request2.setCourse(course);
        request2.setCategory(category);
        request2.setDescription("newer request");
        request2.setStatus(ExtraCreditRequestStatus.PENDING);
        request2.setAwardedPoints(20);
        request2.setUpdatedAt(LocalDateTime.now().minusMinutes(1));

        // repository should already return in updatedAt DESC order
        when(extraCreditRequestRepository.findByCourse_CourseIdInAndStatusOrderByUpdatedAtDesc(List.of(100), ExtraCreditRequestStatus.PENDING))
                .thenReturn(List.of(request2, request1));

        List<ChairDashboardQueueResponse> queueList = service.getChairReviewQueue(userDetails, ExtraCreditRequestStatus.PENDING);
        assertThat(queueList).hasSize(2);
        assertThat(queueList.get(0).getRequestId()).isEqualTo(11);
        assertThat(queueList.get(1).getRequestId()).isEqualTo(10);
    }
}