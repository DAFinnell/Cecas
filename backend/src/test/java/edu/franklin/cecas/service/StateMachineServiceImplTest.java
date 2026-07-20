package edu.franklin.cecas.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import edu.franklin.cecas.domain.Category;
import edu.franklin.cecas.domain.Course;
import edu.franklin.cecas.domain.ExtraCreditRequest;
import edu.franklin.cecas.domain.ExtraCreditRequestStatus;
import edu.franklin.cecas.domain.User;
import edu.franklin.cecas.domain.UserRole;
import edu.franklin.cecas.exception.EvidenceUploadException;
import edu.franklin.cecas.exception.InvalidStateTransitionException;
import edu.franklin.cecas.exception.PointCapExceededException;
import edu.franklin.cecas.exception.UnauthorizedRoleException;
import edu.franklin.cecas.repository.CategoryRepository;
import edu.franklin.cecas.repository.CourseRepository;
import edu.franklin.cecas.repository.ExtraCreditRequestRepository;
import edu.franklin.cecas.repository.UserRepository;
import edu.franklin.cecas.support.MySqlServiceTest;


@MySqlServiceTest
class StateMachineServiceImplTest {
    @Autowired
    private StateMachineService stateMachineService;

    @Autowired
    private ExtraCreditRequestRepository requestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private User chairUser;
    private User studentUser;
    private ExtraCreditRequest savedRequest;

    @BeforeEach
    void setUp() {
        chairUser = new User();
        chairUser.setFullName("Chair User");
        chairUser.setEmail("chair@test.com");
        chairUser.setPassword("password1!");
        chairUser.setRole(UserRole.CHAIR);
        chairUser.setIsActive(true);
        chairUser.setEmailVerified(true);
        chairUser.setMustChangePassword(false);
        chairUser.setProgram("N/A");
        chairUser = userRepository.save(chairUser);

        studentUser = new User();
        studentUser.setFullName("Student User");
        studentUser.setEmail("student@test.com");
        studentUser.setPassword("password2!");
        studentUser.setRole(UserRole.STUDENT);
        studentUser.setStudentId(1001);
        studentUser.setProgram("Computer Science");
        studentUser.setIsActive(true);
        studentUser.setEmailVerified(true);
        studentUser.setMustChangePassword(false);
        studentUser = userRepository.save(studentUser);

        Course course = new Course();
        course.setCourseCode("COMP-311");
        course.setTerm("26/SU");
        course.setSection("Q1WW");
        course = courseRepository.save(course);

        Category category = new Category();
        category.setCategoryName("Seminar");
        category.setDescription("Seminar attendance");
        category.setDefaultPoints(10);
        category = categoryRepository.save(category);

        ExtraCreditRequest request = new ExtraCreditRequest();
        request.setDescription("Attended an approved seminar and requesting pre-approval.");
        request.setStudent(studentUser);
        request.setCourse(course);
        request.setCategory(category);
        request.setStatus(ExtraCreditRequestStatus.PENDING);
        savedRequest = requestRepository.save(request);
    }

    private String evidencePath() {
        return "evidence/request-" + savedRequest.getId() + "/test.pdf";
    }

    /**
     * Verifies that a pending request can be pre-approved and then submitted
     * with evidence by the student.
     */
    @Test
    void testPendingRequestCanBePreApprovedByChairThenStudentCanSubmitEvidence() {
        // prepare: ensure request is PENDING and owned by studentUser
        savedRequest.setStatus(ExtraCreditRequestStatus.PENDING);
        savedRequest = requestRepository.save(savedRequest);

        // chair pre-approves
        ExtraCreditRequest preApproved = stateMachineService.preApproveRequest(savedRequest.getId(), chairUser);
        assertThat(preApproved.getStatus()).isEqualTo(ExtraCreditRequestStatus.PRE_APPROVED);

        // student submits evidence (ownership enforced by service)
        ExtraCreditRequest evidenceSubmitted = stateMachineService.submitEvidenceRequest(savedRequest.getId(), studentUser, evidencePath());
        assertThat(evidenceSubmitted.getStatus()).isEqualTo(ExtraCreditRequestStatus.EVIDENCE_SUBMITTED);
        assertThat(evidenceSubmitted.getEvidenceFilePath()).isEqualTo(evidencePath());

        ExtraCreditRequest db = requestRepository.findById(savedRequest.getId()).orElseThrow();
        assertThat(db.getStatus()).isEqualTo(ExtraCreditRequestStatus.EVIDENCE_SUBMITTED);
        assertThat(db.getEvidenceFilePath()).isEqualTo(evidencePath());
    }

    @Test
    void testPendingRequestIsRejectedByChairWithFeedback() {
        savedRequest.setStatus(ExtraCreditRequestStatus.PENDING);
        savedRequest = requestRepository.save(savedRequest);

        String feedback = "Not eligible";
        ExtraCreditRequest rejected = stateMachineService.rejectRequest(savedRequest.getId(), feedback, chairUser);

        assertThat(rejected.getStatus()).isEqualTo(ExtraCreditRequestStatus.REJECTED);
        assertThat(rejected.getChairFeedback()).isEqualTo(feedback);

        ExtraCreditRequest db = requestRepository.findById(savedRequest.getId()).orElseThrow();
        assertThat(db.getStatus()).isEqualTo(ExtraCreditRequestStatus.REJECTED);
        assertThat(db.getChairFeedback()).isEqualTo(feedback);
        assertThat(rejected.getChair()).isNotNull();
        assertThat(rejected.getChair().getId()).isEqualTo(chairUser.getId());
        assertThat(db.getChair()).isNotNull();
        assertThat(db.getChair().getId()).isEqualTo(chairUser.getId());
    }

    @Test
    void testPreApproveRequest() {
        ExtraCreditRequest result = stateMachineService.preApproveRequest(savedRequest.getId(), chairUser);

        assertThat(result.getStatus()).isEqualTo(ExtraCreditRequestStatus.PRE_APPROVED);

        ExtraCreditRequest databaseCheck =
            requestRepository.findById(savedRequest.getId()).orElseThrow();

        assertThat(databaseCheck.getStatus()).isEqualTo(ExtraCreditRequestStatus.PRE_APPROVED);

        assertThat(result.getChair()).isNotNull();
        assertThat(result.getChair().getId())
            .isEqualTo(chairUser.getId());

        assertThat(databaseCheck.getChair()).isNotNull();
        assertThat(databaseCheck.getChair().getId())
            .isEqualTo(chairUser.getId());
    }

    @Test
    void testPreApproveRequestShouldThrowException() {
        assertThatThrownBy(() -> stateMachineService.preApproveRequest(savedRequest.getId(), studentUser))
            .isInstanceOf(UnauthorizedRoleException.class)
            .hasMessageContaining("required role");
    }
    /**
     * Verifies that evidence must be submitted before the chair can approve or
     * reject from final review.
     */
    @Test
    void testPreApprovedRequiresEvidenceThenChairCanApproveOrRejectFromEvidenceSubmitted() {
        // happy path: submit evidence then approve
        savedRequest.setStatus(ExtraCreditRequestStatus.PRE_APPROVED);
        savedRequest = requestRepository.save(savedRequest);

        ExtraCreditRequest evidence = stateMachineService.submitEvidenceRequest(savedRequest.getId(), studentUser, evidencePath());
        assertThat(evidence.getStatus()).isEqualTo(ExtraCreditRequestStatus.EVIDENCE_SUBMITTED);

        int award = 3;
        ExtraCreditRequest approved = stateMachineService.approveWithPointsRequest(savedRequest.getId(), award, chairUser);
        assertThat(approved.getStatus()).isEqualTo(ExtraCreditRequestStatus.APPROVED);
        assertThat(approved.getAwardedPoints()).isEqualTo(award);

        // reject-from-evidence path
        // create fresh request fixture to avoid interfering with approved one
        savedRequest.setStatus(ExtraCreditRequestStatus.EVIDENCE_SUBMITTED);
        savedRequest.setAwardedPoints(null);
        savedRequest = requestRepository.save(savedRequest);

        String chairFeedback = "Insufficient evidence";
        ExtraCreditRequest rejected = stateMachineService.rejectRequest(savedRequest.getId(), chairFeedback, chairUser);
        assertThat(rejected.getStatus()).isEqualTo(ExtraCreditRequestStatus.REJECTED);
        assertThat(rejected.getChairFeedback()).isEqualTo(chairFeedback);
    }

    @Test
    void testPreApprovedRequestBecomesClosedOnDeadline() {
        savedRequest.setStatus(ExtraCreditRequestStatus.PRE_APPROVED);
        savedRequest = requestRepository.save(savedRequest);

        ExtraCreditRequest closed = stateMachineService.passDeadlineRequest(savedRequest.getId());
        assertThat(closed.getStatus()).isEqualTo(ExtraCreditRequestStatus.CLOSED);

        ExtraCreditRequest db = requestRepository.findById(savedRequest.getId()).orElseThrow();
        assertThat(db.getStatus()).isEqualTo(ExtraCreditRequestStatus.CLOSED);
    }

    // Success: Chair approves evidence-submitted request with points
    @Test
    void testApproveWithPointsRequest() {
        // prepare: set request to EVIDENCE_SUBMITTED
        savedRequest.setStatus(ExtraCreditRequestStatus.EVIDENCE_SUBMITTED);
        savedRequest = requestRepository.save(savedRequest);

        int pointsToAward = 5;
        ExtraCreditRequest result = stateMachineService.approveWithPointsRequest(savedRequest.getId(), pointsToAward, chairUser);

        assertThat(result.getStatus()).isEqualTo(ExtraCreditRequestStatus.APPROVED);
        assertThat(result.getAwardedPoints()).isEqualTo(pointsToAward);

        ExtraCreditRequest databaseCheck = requestRepository.findById(savedRequest.getId()).orElseThrow();
        assertThat(databaseCheck.getStatus()).isEqualTo(ExtraCreditRequestStatus.APPROVED);
        assertThat(databaseCheck.getAwardedPoints()).isEqualTo(pointsToAward);
    }

    // Failure: student (unauthorized) attempts to approve
    @Test
    void testApproveWithPointsRequestShouldThrowException() {
        // prepare: ensure request is in EVIDENCE_SUBMITTED
        savedRequest.setStatus(ExtraCreditRequestStatus.EVIDENCE_SUBMITTED);
        savedRequest = requestRepository.save(savedRequest);

        assertThatThrownBy(() -> stateMachineService.approveWithPointsRequest(savedRequest.getId(), 5, studentUser))
            .isInstanceOf(UnauthorizedRoleException.class)
            .hasMessageContaining("required role");
    }

    // Failure: cannot approve unless state is EVIDENCE_SUBMITTED
    @Test
    void testApproveWithPointsRequestShouldThrowExceptionWhenRequestNotInEvidenceSubmittedState() {
        // prepare: set to PRE_APPROVED (not allowed)
        savedRequest.setStatus(ExtraCreditRequestStatus.PRE_APPROVED);
        savedRequest = requestRepository.save(savedRequest);

        assertThatThrownBy(() -> stateMachineService.approveWithPointsRequest(savedRequest.getId(), 5, chairUser))
            .isInstanceOf(InvalidStateTransitionException.class)
            .hasMessageContaining("EVIDENCE_SUBMITTED");
    }

    /**
     * Verifies that the owning student can submit evidence for a pre-approved
     * request.
     */
    @Test
    void testSubmitEvidenceRequest() {
        // prepare: set to PRE_APPROVED
        savedRequest.setStatus(ExtraCreditRequestStatus.PRE_APPROVED);
        savedRequest = requestRepository.save(savedRequest);

        ExtraCreditRequest result = stateMachineService.submitEvidenceRequest(savedRequest.getId(), studentUser, evidencePath());

        assertThat(result.getStatus()).isEqualTo(ExtraCreditRequestStatus.EVIDENCE_SUBMITTED);
        assertThat(result.getEvidenceFilePath()).isEqualTo(evidencePath());

        ExtraCreditRequest db = requestRepository.findById(savedRequest.getId()).orElseThrow();
        assertThat(db.getStatus()).isEqualTo(ExtraCreditRequestStatus.EVIDENCE_SUBMITTED);
        assertThat(db.getEvidenceFilePath()).isEqualTo(evidencePath());
    }

    /**
     * Verifies that evidence cannot be submitted before pre-approval.
     */
    @Test
    void testSubmitEvidenceRequestShouldThrowWhenNotPreApproved() {
        // ensure not PRE_APPROVED (use PENDING)
        savedRequest.setStatus(ExtraCreditRequestStatus.PENDING);
        savedRequest = requestRepository.save(savedRequest);

        assertThatThrownBy(() -> stateMachineService.submitEvidenceRequest(savedRequest.getId(), studentUser, evidencePath()))
            .isInstanceOf(InvalidStateTransitionException.class)
            .hasMessageContaining("PRE_APPROVED");
    }

    /**
     * Verifies that a student cannot submit evidence for another student's
     * request.
     */
    @Test
    void testSubmitEvidenceRequestShouldThrowWhenNotOwningStudent() {
        // prepare: PRE_APPROVED but different student actor
        savedRequest.setStatus(ExtraCreditRequestStatus.PRE_APPROVED);
        savedRequest = requestRepository.save(savedRequest);

        final User otherStudent = new User();
        otherStudent.setFullName("Other Student");
        otherStudent.setEmail("other@student.com");
        otherStudent.setPassword("password!");
        otherStudent.setRole(UserRole.STUDENT);
        otherStudent.setStudentId(9999);
        otherStudent.setIsActive(true);
        otherStudent.setMustChangePassword(false);
        otherStudent.setProgram("Computer Science");
        otherStudent.setEmailVerified(false);
        userRepository.save(otherStudent);

        assertThatThrownBy(() -> stateMachineService.submitEvidenceRequest(savedRequest.getId(), otherStudent, evidencePath()))
            .isInstanceOf(UnauthorizedRoleException.class)
            .hasMessageContaining("owning");
    }

    /**
     * Verifies that a request cannot receive more than one evidence file.
     */
    @Test
    void testSubmitEvidenceRequestShouldThrowWhenEvidenceAlreadyExists() {
        savedRequest.setStatus(ExtraCreditRequestStatus.PRE_APPROVED);
        savedRequest.setEvidenceFilePath("evidence/request-1/existing.pdf");
        savedRequest = requestRepository.save(savedRequest);

        assertThatThrownBy(() -> stateMachineService.submitEvidenceRequest(savedRequest.getId(), studentUser, evidencePath()))
            .isInstanceOf(EvidenceUploadException.class)
            .hasMessageContaining("already");
    }

    // Deadline behavior: PRE_APPROVED -> CLOSED
    @Test
    void testPassDeadlineRequestShouldCloseWhenPreApproved() {
        savedRequest.setStatus(ExtraCreditRequestStatus.PRE_APPROVED);
        savedRequest = requestRepository.save(savedRequest);

        ExtraCreditRequest result = stateMachineService.passDeadlineRequest(savedRequest.getId());

        assertThat(result.getStatus()).isEqualTo(ExtraCreditRequestStatus.CLOSED);

        ExtraCreditRequest db = requestRepository.findById(savedRequest.getId()).orElseThrow();
        assertThat(db.getStatus()).isEqualTo(ExtraCreditRequestStatus.CLOSED);
    }

    @Test
    void testPassDeadlineRequestShouldThrowWhenNotPreApproved() {
        savedRequest.setStatus(ExtraCreditRequestStatus.PENDING);
        savedRequest = requestRepository.save(savedRequest);

        assertThatThrownBy(() -> stateMachineService.passDeadlineRequest(savedRequest.getId()))
            .isInstanceOf(InvalidStateTransitionException.class);
    }

    // Rejected is final: cannot transition a REJECTED request anymore
    @Test
    void testRejectRequestMakesRequestFinalDisallowFurtherTransitions() {
        // reject from PENDING
        savedRequest.setStatus(ExtraCreditRequestStatus.PENDING);
        savedRequest = requestRepository.save(savedRequest);

        ExtraCreditRequest rejected = stateMachineService.rejectRequest(savedRequest.getId(), "Not eligible", chairUser);
        assertThat(rejected.getStatus()).isEqualTo(ExtraCreditRequestStatus.REJECTED);

        // any attempt to pre-approve (or other transitions) should fail with invalid transition
        assertThatThrownBy(() -> stateMachineService.preApproveRequest(savedRequest.getId(), chairUser))
            .isInstanceOf(InvalidStateTransitionException.class)
            .hasMessageContaining("final state");

        assertThat(rejected.getChair()).isNotNull();
        assertThat(rejected.getChair().getId()).isEqualTo(chairUser.getId());
    }

    /**
     * Verifies that rejected, approved, and closed requests cannot transition
     * again.
     */
    @Test
    void testRejectedApprovedClosedAreFinalNoFurtherTransitionsAllowed() {
        // REJECTED = Final
        savedRequest.setStatus(ExtraCreditRequestStatus.REJECTED);
        savedRequest = requestRepository.save(savedRequest);
        assertThatThrownBy(() -> stateMachineService.preApproveRequest(savedRequest.getId(), chairUser))
            .isInstanceOf(InvalidStateTransitionException.class)
            .hasMessageContaining("final");

        // APPROVED = Final
        savedRequest.setStatus(ExtraCreditRequestStatus.APPROVED);
        savedRequest = requestRepository.save(savedRequest);
        assertThatThrownBy(() -> stateMachineService.preApproveRequest(savedRequest.getId(), chairUser))
            .isInstanceOf(InvalidStateTransitionException.class);

        // CLOSED = Final
        savedRequest.setStatus(ExtraCreditRequestStatus.CLOSED);
        savedRequest = requestRepository.save(savedRequest);
        assertThatThrownBy(() -> stateMachineService.submitEvidenceRequest(savedRequest.getId(), studentUser, evidencePath()))
            .isInstanceOf(InvalidStateTransitionException.class);
    }

    @Test
    void testApproveWithPointsShouldThrowWhenCapExceeded() {
        savedRequest.setStatus(ExtraCreditRequestStatus.EVIDENCE_SUBMITTED);
        savedRequest = requestRepository.save(savedRequest);

        // simulate student already used near-cap 
        ExtraCreditRequest preApprovedRequest = new ExtraCreditRequest();
        preApprovedRequest.setStudent(savedRequest.getStudent());
        preApprovedRequest.setCourse(savedRequest.getCourse());
        preApprovedRequest.setCategory(savedRequest.getCategory());
        preApprovedRequest.setStatus(ExtraCreditRequestStatus.APPROVED);
        preApprovedRequest.setDescription("Previously approved request");
        preApprovedRequest.setAwardedPoints(48);
        requestRepository.save(preApprovedRequest);

        // attempting to award 5 should exceed default cap (50)
        assertThatThrownBy(() -> stateMachineService.approveWithPointsRequest(savedRequest.getId(), 5, chairUser))
            .isInstanceOf(PointCapExceededException.class);
    }
}
