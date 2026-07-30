package edu.franklin.cecas.service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import edu.franklin.cecas.domain.Category;
import edu.franklin.cecas.domain.Course;
import edu.franklin.cecas.domain.ExtraCreditRequest;
import edu.franklin.cecas.domain.ExtraCreditRequestStatus;
import edu.franklin.cecas.domain.User;
import edu.franklin.cecas.domain.UserRole;
import edu.franklin.cecas.dto.ExtraCreditRequestCreateDTO;
import edu.franklin.cecas.dto.StudentRequestDetailDTO;
import edu.franklin.cecas.dto.StudentRequestSummaryDTO;
import edu.franklin.cecas.dto.StudentPointsDTO;
import edu.franklin.cecas.exception.PointCapExceededException;
import edu.franklin.cecas.repository.CategoryRepository;
import edu.franklin.cecas.repository.CourseRepository;
import edu.franklin.cecas.repository.ExtraCreditRequestRepository;
import edu.franklin.cecas.repository.UserRepository;
import edu.franklin.cecas.support.MySqlServiceTest;

@MySqlServiceTest
public class ExtraCreditRequestServiceTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ExtraCreditRequestRepository extraCreditRequestRepository;

    @Autowired
    private ExtraCreditRequestService extraCreditRequestService;

    @Autowired
    private PointAllocationService pointAllocationService;

    private User createTestStudent(String name, String email, Integer studentId) {
        User user = new User();

        user.setFullName(name);
        user.setEmail(email);
        user.setPassword("password");
        user.setStudentId(studentId);
        user.setProgram("Computer Science");
        user.setIsActive(true);
        user.setMustChangePassword(false);
        user.setRole(UserRole.STUDENT);

        return userRepository.save(user);
    }

    private Course createTestCourse() {
        Course course = new Course();

        course.setCourseCode("COMP-110");
        course.setTerm("26/FA");
        course.setSection("H1WW");

        return courseRepository.save(course);
    }

    private Category createTestCategory() {
        Category category = new Category();

        category.setCategoryName("Seminar Attendance");
        category.setDescription("Approved attendance at an academic or professional seminar");
        category.setDefaultPoints(5);

        return categoryRepository.save(category);
    }

    private Course createTestCourse(String courseCode, String term, String section) {
        Course course = new Course();

        course.setCourseCode(courseCode);
        course.setTerm(term);
        course.setSection(section);

        return courseRepository.save(course);
    }

    private Category createTestCategory(String name, int defaultPoints) {
        Category category = new Category();

        category.setCategoryName(name);
        category.setDescription("Extra credit category created for Derek's service test");
        category.setDefaultPoints(defaultPoints);

        return categoryRepository.save(category);
    }

    private ExtraCreditRequest saveRequest(
            User student,
            Course course,
            Category category,
            ExtraCreditRequestStatus status,
            Integer awardedPoints) {
        ExtraCreditRequest request = new ExtraCreditRequest();

        request.setStudent(student);
        request.setCourse(course);
        request.setCategory(category);
        request.setDescription("Derek completed an activity for this extra credit request.");
        request.setStatus(status);
        request.setAwardedPoints(awardedPoints);

        return extraCreditRequestRepository.save(request);
    }

    /**
     * Tests that a student can create an extra credit request successfully.
     */
    @Test
    void TestCreateRequestSuccesfully() {
        User student = createTestStudent("Derek Test", "derek@derek.com", 1001);
        Course course = createTestCourse();
        Category category = createTestCategory();

        ExtraCreditRequestCreateDTO dto = new ExtraCreditRequestCreateDTO();
        dto.setCourseId(course.getCourseId());
        dto.setCategoryId(category.getCategoryId());
        dto.setDescription("I attended an approved academic seminar");

        StudentRequestDetailDTO response = extraCreditRequestService.createRequest(student.getEmail(), dto);

        assertNotNull(response);
        assertNotNull(response.getId());
        assertEquals("COMP-110", response.getCourseCode());
        assertEquals("26/FA", response.getTerm());
        assertEquals("H1WW", response.getSection());
        assertEquals("Seminar Attendance", response.getCategoryName());
        assertEquals("Approved attendance at an academic or professional seminar", response.getCategoryDescription());
        assertEquals("I attended an approved academic seminar", response.getDescription());
        assertEquals(ExtraCreditRequestStatus.PENDING, response.getStatus());
        assertEquals(5, response.getDefaultPoints());

        var savedRequest = extraCreditRequestRepository.findById(response.getId()).orElseThrow();
        assertEquals(ExtraCreditRequestStatus.PENDING, savedRequest.getStatus());
        assertEquals("I attended an approved academic seminar", savedRequest.getDescription());
    }

    /**
     * Tests that an extra credit request cannot be created by a user that is not a student.
     */
    @Test
    void testCreateRequestThrowsWhenUserIsNotAStudent() {
        User faculty = createTestStudent("Derek Chair", "derek-chair@derek.com", 1001);
        faculty.setRole(UserRole.CHAIR);
        userRepository.save(faculty);

        Course course = createTestCourse();
        Category category = createTestCategory();

        ExtraCreditRequestCreateDTO dto = new ExtraCreditRequestCreateDTO();
        dto.setCourseId(course.getCourseId());
        dto.setCategoryId(category.getCategoryId());
        dto.setDescription("Attempt by non-student");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> extraCreditRequestService.createRequest(faculty.getEmail(), dto));

        assertEquals("Unauthorized: User is not a student", ex.getMessage());
    }

    /**
     * Tests that a student's request list only returns their own applications.
     */
    @Test
    void testGetRequestsForStudentReturnsOnlyTheirRequests() {
        User studentA = createTestStudent("Derek Test", "derek-list@derek.com", 2001);
        User studentB = createTestStudent("Student B", "studentB@test.com", 2002);
        Course course = createTestCourse();
        Category category = createTestCategory();

        ExtraCreditRequestCreateDTO dto = new ExtraCreditRequestCreateDTO();
        dto.setCourseId(course.getCourseId());
        dto.setCategoryId(category.getCategoryId());
        dto.setDescription("Derek attended a seminar");

        extraCreditRequestService.createRequest(studentA.getEmail(), dto);

        List<StudentRequestSummaryDTO> requestsA = extraCreditRequestService.getRequestsForStudent(studentA.getEmail());
        assertEquals(1, requestsA.size());
        assertEquals("COMP-110", requestsA.get(0).getCourseCode());
        assertEquals("26/FA", requestsA.get(0).getTerm());
        assertEquals("H1WW", requestsA.get(0).getSection());
        assertEquals("Seminar Attendance", requestsA.get(0).getCategoryName());
        assertEquals(ExtraCreditRequestStatus.PENDING, requestsA.get(0).getStatus());
        assertEquals(5, requestsA.get(0).getDefaultPoints());

        List<StudentRequestSummaryDTO> requestsB = extraCreditRequestService.getRequestsForStudent(studentB.getEmail());
        assertTrue(requestsB.isEmpty());
    }

    /**
     * Tests that applications for students by UserId are successful still while StudentId is null.
     */
    @Test
    public void testGetRequestsForStudentWorksWhenBusinessStudentIdIsNull() {
        User studentA = createTestStudent("Derek Test", "derek-null@derek.com", null);
        User studentB = createTestStudent("Student B", "studentB-null@test.com", null);
        Course course = createTestCourse();
        Category category = createTestCategory();

        ExtraCreditRequestCreateDTO dto = new ExtraCreditRequestCreateDTO();
        dto.setCourseId(course.getCourseId());
        dto.setCategoryId(category.getCategoryId());
        dto.setDescription("Derek attended a seminar without a business student ID");

        extraCreditRequestService.createRequest(studentA.getEmail(), dto);

        List<StudentRequestSummaryDTO> requestsA =
                extraCreditRequestService.getRequestsForStudent(studentA.getEmail());
        assertEquals(1, requestsA.size());

        List<StudentRequestSummaryDTO> requestsB =
                extraCreditRequestService.getRequestsForStudent(studentB.getEmail());
        assertTrue(requestsB.isEmpty());
    }

    /**
     * Verifies the foreign key relationship between ExtraCreditRequest and Course is enforced.
     */
    @Test
    public void testCreateRequestPersistsCourseRelationship() {
        User student = createTestStudent("Derek Finnell", "derek-course@derek.com", 5001);
        Course course = createTestCourse();
        Category category = createTestCategory();

        ExtraCreditRequestCreateDTO dto = new ExtraCreditRequestCreateDTO();
        dto.setCourseId(course.getCourseId());
        dto.setCategoryId(category.getCategoryId());
        dto.setDescription("Testing that the selected course is saved on the request.");

        StudentRequestDetailDTO response = extraCreditRequestService.createRequest(student.getEmail(), dto);

        assertNotNull(response.getId());

        var savedRequest = extraCreditRequestRepository.findById(response.getId()).orElseThrow();

        assertNotNull(savedRequest.getCourse());
        assertEquals(course.getCourseId(), savedRequest.getCourse().getCourseId());
        assertEquals("COMP-110", savedRequest.getCourse().getCourseCode());
        assertEquals("26/FA", savedRequest.getCourse().getTerm());
        assertEquals("H1WW", savedRequest.getCourse().getSection());
    }

    /**
     * Verifies that the selected category and default points are returned in the response dto.
     */
    @Test
    public void testCreateRequestReturnsSelectedCategoryAndDefaultPoints() {
        User student = createTestStudent("Category Student", "category@test.com", 6001);
        Course course = createTestCourse();
        Category category = createTestCategory();

        ExtraCreditRequestCreateDTO dto = new ExtraCreditRequestCreateDTO();
        dto.setCourseId(course.getCourseId());
        dto.setCategoryId(category.getCategoryId());
        dto.setDescription("Testing that the selected category data is returned.");

        StudentRequestDetailDTO response = extraCreditRequestService.createRequest(student.getEmail(), dto);

        assertNotNull(response);
        assertEquals("Seminar Attendance", response.getCategoryName());
        assertEquals("Approved attendance at an academic or professional seminar", response.getCategoryDescription());
        assertEquals(5, response.getDefaultPoints());
        assertEquals(ExtraCreditRequestStatus.PENDING, response.getStatus());

        var savedRequest = extraCreditRequestRepository.findById(response.getId()).orElseThrow();

        assertNotNull(savedRequest.getCategory());
        assertEquals(category.getCategoryId(), savedRequest.getCategory().getCategoryId());
        assertEquals("Seminar Attendance", savedRequest.getCategory().getCategoryName());
        assertEquals(5, savedRequest.getCategory().getDefaultPoints());
    }

    /**
     * Verifies that a pre-approved request tells the student service that
     * evidence can be uploaded when no evidence file has been saved yet.
     */
    @Test
    void testPreApprovedRequestMakesEvidenceUploadAvailable() {
        User student = createTestStudent("Derek Finnell", "derek@derek.com", 7001);
        Course course = createTestCourse();
        Category category = createTestCategory();
        ExtraCreditRequest request = saveRequest(
                student,
                course,
                category,
                ExtraCreditRequestStatus.PRE_APPROVED,
                null);

        StudentRequestDetailDTO response = extraCreditRequestService.getRequestForStudent(
                student.getEmail(),
                request.getId());

        assertEquals(ExtraCreditRequestStatus.PRE_APPROVED, response.getStatus());
        assertTrue(response.isEvidenceUploadAvailable());
        assertFalse(response.isEvidenceFileUploaded());
    }

    /**
     * Verifies that the student request list returns each current workflow
     * status, including a rejected request that must remain clearly identified.
     */
    @Test
    void testGetRequestsForStudentReturnsTrackedStatuses() {
        User student = createTestStudent("Derek Finnell", "derek.status@derek.com", 7002);
        Category category = createTestCategory("Status Test Category", 5);

        saveRequest(student, createTestCourse("COMP-210", "26/FA", "H1WW"),
                category, ExtraCreditRequestStatus.PENDING, null);
        saveRequest(student, createTestCourse("COMP-220", "26/FA", "H2WW"),
                category, ExtraCreditRequestStatus.PRE_APPROVED, null);
        ExtraCreditRequest submitted = saveRequest(
                student,
                createTestCourse("COMP-230", "26/FA", "H3WW"),
                category,
                ExtraCreditRequestStatus.EVIDENCE_SUBMITTED,
                null);
        submitted.setEvidenceFilePath("evidence/request-" + submitted.getId() + "/proof.pdf");
        extraCreditRequestRepository.save(submitted);
        saveRequest(student, createTestCourse("COMP-240", "26/FA", "H4WW"),
                category, ExtraCreditRequestStatus.REJECTED, null);

        Set<ExtraCreditRequestStatus> statuses = extraCreditRequestService
                .getRequestsForStudent(student.getEmail())
                .stream()
                .map(StudentRequestSummaryDTO::getStatus)
                .collect(Collectors.toSet());

        assertEquals(Set.of(
                ExtraCreditRequestStatus.PENDING,
                ExtraCreditRequestStatus.PRE_APPROVED,
                ExtraCreditRequestStatus.EVIDENCE_SUBMITTED,
                ExtraCreditRequestStatus.REJECTED), statuses);
    }

    /**
     * Verifies that approved and in-process points are both counted before a
     * student submits another request that would exceed the semester cap.
     */
    @Test
    void testCreateRequestRejectsWhenApprovedAndPendingPointsExceedCap() {
        User student = createTestStudent("Derek Finnell", "derek.cap@derek.com", 7003);
        Category approvedCategory = createTestCategory("Approved Activity", 30);
        Category pendingCategory = createTestCategory("Pending Activity", 15);
        Category requestedCategory = createTestCategory("Requested Activity", 10);

        saveRequest(student, createTestCourse("COMP-310", "26/FA", "Q1WW"),
                approvedCategory, ExtraCreditRequestStatus.APPROVED, 30);
        saveRequest(student, createTestCourse("COMP-320", "26/FA", "Q2WW"),
                pendingCategory, ExtraCreditRequestStatus.PENDING, null);
        Course requestedCourse = createTestCourse("COMP-330", "26/FA", "Q3WW");

        StudentPointsDTO points = pointAllocationService.getStudentPoints(student.getId(), "26/FA");
        assertEquals(30, points.getIssued());
        assertEquals(15, points.getPending());
        assertEquals(5, points.getAvailable());

        ExtraCreditRequestCreateDTO dto = new ExtraCreditRequestCreateDTO();
        dto.setCourseId(requestedCourse.getCourseId());
        dto.setCategoryId(requestedCategory.getCategoryId());
        dto.setDescription("Derek is requesting points that do not fit under the cap.");

        assertThrows(
                PointCapExceededException.class,
                () -> extraCreditRequestService.createRequest(student.getEmail(), dto));
        assertEquals(2, extraCreditRequestRepository.findByStudent_Id(student.getId()).size());
    }

    /**
     * Verifies that approved points from different courses share one semester
     * cap and leave no room for another request after the student reaches 50.
     */
    @Test
    void testPointCapIsSharedAcrossCoursesInTheSameTerm() {
        User student = createTestStudent("Derek Finnell", "derek.term@derek.com", 7004);
        Category firstCategory = createTestCategory("First Approved Activity", 20);
        Category secondCategory = createTestCategory("Second Approved Activity", 30);
        Category requestedCategory = createTestCategory("Additional Activity", 5);

        saveRequest(student, createTestCourse("COMP-410", "26/FA", "F1WW"),
                firstCategory, ExtraCreditRequestStatus.APPROVED, 20);
        saveRequest(student, createTestCourse("COMP-420", "26/FA", "F2WW"),
                secondCategory, ExtraCreditRequestStatus.APPROVED, 30);
        Course requestedCourse = createTestCourse("COMP-430", "26/FA", "F3WW");

        StudentPointsDTO points = pointAllocationService.getStudentPoints(student.getId(), "26/FA");
        assertEquals(50, points.getIssued());
        assertEquals(0, points.getPending());
        assertEquals(0, points.getAvailable());

        ExtraCreditRequestCreateDTO dto = new ExtraCreditRequestCreateDTO();
        dto.setCourseId(requestedCourse.getCourseId());
        dto.setCategoryId(requestedCategory.getCategoryId());
        dto.setDescription("Derek is attempting another request after reaching 50 points.");

        assertThrows(
                PointCapExceededException.class,
                () -> extraCreditRequestService.createRequest(student.getEmail(), dto));
        assertEquals(2, extraCreditRequestRepository.findByStudent_Id(student.getId()).size());
    }
}
