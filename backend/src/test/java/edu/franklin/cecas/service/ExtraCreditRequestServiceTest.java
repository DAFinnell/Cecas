package edu.franklin.cecas.service;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import edu.franklin.cecas.domain.Category;
import edu.franklin.cecas.domain.Course;
import edu.franklin.cecas.domain.ExtraCreditRequestStatus;
import edu.franklin.cecas.domain.User;
import edu.franklin.cecas.domain.UserRole;
import edu.franklin.cecas.dto.ExtraCreditRequestCreateDTO;
import edu.franklin.cecas.dto.StudentRequestDetailDTO;
import edu.franklin.cecas.dto.StudentRequestSummaryDTO;
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
}
