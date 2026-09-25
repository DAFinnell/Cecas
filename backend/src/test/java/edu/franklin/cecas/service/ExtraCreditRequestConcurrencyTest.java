package edu.franklin.cecas.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import edu.franklin.cecas.domain.Category;
import edu.franklin.cecas.domain.Course;
import edu.franklin.cecas.domain.ExtraCreditRequest;
import edu.franklin.cecas.domain.ExtraCreditRequestStatus;
import edu.franklin.cecas.domain.User;
import edu.franklin.cecas.domain.UserRole;
import edu.franklin.cecas.dto.ExtraCreditRequestCreateDTO;
import edu.franklin.cecas.dto.StudentPointsDTO;
import edu.franklin.cecas.exception.PointCapExceededException;
import edu.franklin.cecas.repository.CategoryRepository;
import edu.franklin.cecas.repository.CourseRepository;
import edu.franklin.cecas.repository.ExtraCreditRequestRepository;
import edu.franklin.cecas.repository.UserRepository;
import edu.franklin.cecas.support.MySqlTestcontainers;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.context.ImportTestcontainers;

@SpringBootTest
@ImportTestcontainers(MySqlTestcontainers.class)
class ExtraCreditRequestConcurrencyTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ExtraCreditRequestRepository requestRepository;

    @Autowired
    private ExtraCreditRequestService requestService;

    @Autowired
    private UserService userService;

    @AfterEach
    void cleanDatabaseState() {
        requestRepository.deleteAll();
        userRepository.deleteAll();
        categoryRepository.deleteAll();
        courseRepository.deleteAll();
    }

    private Course saveCourse(String code, String section) {
        Course course = new Course();
        course.setCourseCode(code);
        course.setTerm("26/FA");
        course.setSection(section);
        return courseRepository.save(course);
    }

    private Category saveCategory(String name, int points) {
        Category category = new Category();
        category.setCategoryName(name);
        category.setDescription("Extra credit category used by Derek's concurrency test");
        category.setDefaultPoints(points);
        return categoryRepository.save(category);
    }

    private ExtraCreditRequestCreateDTO createRequestDto(Course course, Category category) {
        ExtraCreditRequestCreateDTO dto = new ExtraCreditRequestCreateDTO();
        dto.setCourseId(course.getCourseId());
        dto.setCategoryId(category.getCategoryId());
        dto.setDescription("Derek submitted this request during the concurrency test.");
        return dto;
    }

    private boolean submitAtTheSameTime(
            String email, ExtraCreditRequestCreateDTO dto, CountDownLatch ready, CountDownLatch start)
            throws InterruptedException {
        ready.countDown();

        if (!start.await(5, TimeUnit.SECONDS)) {
            throw new IllegalStateException("Concurrent submissions did not start in time.");
        }

        try {
            requestService.createRequest(email, dto);
            return true;
        } catch (PointCapExceededException ex) {
            return false;
        }
    }

    /**
     * Verifies that two concurrent submissions for the same student cannot
     * bypass the semester point cap when only one request still fits.
     */
    @Test
    void testConcurrentSubmissionsCannotBypassPointCap() throws Exception {
        User student = new User();
        student.setFullName("Derek Finnell");
        student.setEmail("derek@derek.com");
        student.setPassword("password");
        student.setStudentId(8001);
        student.setProgram("Computer Science");
        student.setIsActive(true);
        student.setMustChangePassword(false);
        student.setRole(UserRole.STUDENT);
        User savedStudent = userRepository.save(student);

        Category approvedCategory = saveCategory("Previously Approved Activity", 30);
        Category requestedCategory = saveCategory("Concurrent Activity", 20);
        Course approvedCourse = saveCourse("COMP-450", "C1WW");
        Course firstCourse = saveCourse("COMP-460", "C2WW");
        Course secondCourse = saveCourse("COMP-470", "C3WW");

        ExtraCreditRequest approvedRequest = new ExtraCreditRequest();
        approvedRequest.setStudent(savedStudent);
        approvedRequest.setCourse(approvedCourse);
        approvedRequest.setCategory(approvedCategory);
        approvedRequest.setDescription("Derek already earned 30 points this semester.");
        approvedRequest.setStatus(ExtraCreditRequestStatus.APPROVED);
        approvedRequest.setAwardedPoints(30);
        requestRepository.saveAndFlush(approvedRequest);

        ExtraCreditRequestCreateDTO firstDto = createRequestDto(firstCourse, requestedCategory);
        ExtraCreditRequestCreateDTO secondDto = createRequestDto(secondCourse, requestedCategory);
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(2);

        try {
            Future<Boolean> first =
                    executor.submit(() -> submitAtTheSameTime(savedStudent.getEmail(), firstDto, ready, start));
            Future<Boolean> second =
                    executor.submit(() -> submitAtTheSameTime(savedStudent.getEmail(), secondDto, ready, start));

            assertTrue(ready.await(5, TimeUnit.SECONDS));
            start.countDown();

            List<Boolean> results = List.of(first.get(10, TimeUnit.SECONDS), second.get(10, TimeUnit.SECONDS));
            long successfulSubmissions =
                    results.stream().filter(Boolean::booleanValue).count();

            assertEquals(1, successfulSubmissions);
            assertEquals(
                    2, requestRepository.findByStudent_Id(savedStudent.getId()).size());

            StudentPointsDTO points = userService.getStudentPoints(savedStudent.getEmail(), "26/FA");
            assertEquals(30, points.getIssued());
            assertEquals(20, points.getPending());
            assertEquals(0, points.getAvailable());
        } finally {
            executor.shutdownNow();
        }
    }
}
