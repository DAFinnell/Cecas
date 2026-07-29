package edu.franklin.cecas.repository;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import edu.franklin.cecas.domain.Category;
import edu.franklin.cecas.domain.Course;
import edu.franklin.cecas.domain.ExtraCreditRequest;
import edu.franklin.cecas.domain.ExtraCreditRequestStatus;
import edu.franklin.cecas.domain.User;
import edu.franklin.cecas.domain.UserRole;
import edu.franklin.cecas.support.MySqlDataJpaTest;

@MySqlDataJpaTest
public class ExtraCreditRequestRepositoryTest {

    @Autowired
    private ExtraCreditRequestRepository extraCreditRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private User createTestStudent() {
        User user = new User();
        user.setFullName("Test Student");
        user.setEmail("student@test.com");
        user.setPassword("123456");
        user.setRole(UserRole.STUDENT);
        user.setStudentId(12345);
        user.setProgram("Computer Science");
        user.setIsActive(true);
        user.setEmailVerified(true);
        user.setMustChangePassword(false);
        return user;
    }

    private Course createTestCourse() {
        Course course = new Course();
        course.setCourseCode("COMP 311"); // cooked class
        course.setTerm("Summer 2026");
        course.setSection("01");
        return course;
    }

    private Category createTestCategory() {
        Category category = new Category();
        category.setCategoryName("Volunteer");
        category.setDescription("Volunteer work");
        category.setDefaultPoints(10);
        return category;
    }

    @Test
    public void testFindByStudent_Id() {

        User student = createTestStudent();
        userRepository.save(student);

        Course course = createTestCourse();
        courseRepository.save(course);

        Category category = createTestCategory();
        categoryRepository.save(category);

        ExtraCreditRequest request = new ExtraCreditRequest();
        request.setDescription("Test request");
        request.setStudent(student);
        request.setCourse(course);
        request.setCategory(category);
        request.setStatus(ExtraCreditRequestStatus.PENDING);

        extraCreditRequestRepository.save(request);

        List<ExtraCreditRequest> result = extraCreditRequestRepository.findByStudent_Id(student.getId());

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStudent().getId()).isEqualTo(student.getId());
    }

    // @Test
    // public void test findByChair_Id()

    @Test
    public void testFindByCourse_CourseId() {

        Course course = createTestCourse();
        courseRepository.save(course);

        User student = createTestStudent();
        userRepository.save(student);

        Category category = createTestCategory();
        categoryRepository.save(category);

        ExtraCreditRequest request = new ExtraCreditRequest();
        request.setDescription("Test request");
        request.setStudent(student);
        request.setCourse(course);
        request.setCategory(category);
        request.setStatus(ExtraCreditRequestStatus.PENDING);

        extraCreditRequestRepository.save(request);

        List<ExtraCreditRequest> result = extraCreditRequestRepository.findByCourse_CourseId(course.getCourseId());

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCourse().getCourseId()).isEqualTo(course.getCourseId());
    }

    @Test
    public void testFindByCategory_CategoryId() {

        Category category = createTestCategory();
        categoryRepository.save(category);

        User student = createTestStudent();
        userRepository.save(student);

        Course course = createTestCourse();
        courseRepository.save(course);

        ExtraCreditRequest request = new ExtraCreditRequest();
        request.setDescription("Test request");
        request.setStudent(student);
        request.setCourse(course);
        request.setCategory(category);
        request.setStatus(ExtraCreditRequestStatus.PENDING);

        extraCreditRequestRepository.save(request);

        List<ExtraCreditRequest> result = extraCreditRequestRepository
                .findByCategory_CategoryId(category.getCategoryId());

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCategory().getCategoryId()).isEqualTo(category.getCategoryId());
    }

    @Test
    public void testFindByStatus() {

        User student = createTestStudent();
        userRepository.save(student);

        Course course = createTestCourse();
        courseRepository.save(course);

        Category category = createTestCategory();
        categoryRepository.save(category);

        ExtraCreditRequest request = new ExtraCreditRequest();
        request.setDescription("Test request");
        request.setStudent(student);
        request.setCourse(course);
        request.setCategory(category);
        request.setStatus(ExtraCreditRequestStatus.EVIDENCE_SUBMITTED);

        extraCreditRequestRepository.save(request);

        List<ExtraCreditRequest> result = extraCreditRequestRepository
                .findByStatus(ExtraCreditRequestStatus.EVIDENCE_SUBMITTED);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(ExtraCreditRequestStatus.EVIDENCE_SUBMITTED);
    }

    @Test
    public void testFindByStudent_IdAndStatus() {

        User student = createTestStudent();
        userRepository.save(student);

        Course course = createTestCourse();
        courseRepository.save(course);

        Category category = createTestCategory();
        categoryRepository.save(category);

        ExtraCreditRequest request = new ExtraCreditRequest();
        request.setDescription("Test request");
        request.setStudent(student);
        request.setCourse(course);
        request.setCategory(category);
        request.setStatus(ExtraCreditRequestStatus.EVIDENCE_SUBMITTED);

        extraCreditRequestRepository.save(request);

        List<ExtraCreditRequest> result = extraCreditRequestRepository
                .findByStudent_IdAndStatus(student.getId(),
                        ExtraCreditRequestStatus.EVIDENCE_SUBMITTED);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStudent().getId()).isEqualTo(student.getId());
        assertThat(result.get(0).getStatus()).isEqualTo(ExtraCreditRequestStatus.EVIDENCE_SUBMITTED);
    }


    @Test
    public void testFindByCourse_CourseIdInAndStatusOrderByUpdatedAtDesc() {
        Course course = createTestCourse();
        courseRepository.save(course);

        User student = createTestStudent();
        userRepository.save(student);

        Category category = createTestCategory();
        categoryRepository.save(category);
        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
        ExtraCreditRequest request1 = new ExtraCreditRequest();
        request1.setDescription("Test request 1");
        request1.setStudent(student);
        request1.setCourse(course);
        request1.setCategory(category);
        request1.setStatus(ExtraCreditRequestStatus.PENDING);
        request1.setUpdatedAt(now.minusHours(1));
        extraCreditRequestRepository.save(request1);

        ExtraCreditRequest request2 = new ExtraCreditRequest();
        request2.setDescription("Test request 2");
        request2.setStudent(student);
        request2.setCourse(course);
        request2.setCategory(category);
        request2.setStatus(ExtraCreditRequestStatus.PENDING);
        request2.setUpdatedAt(now);
        extraCreditRequestRepository.save(request2);

        List<ExtraCreditRequest> result = extraCreditRequestRepository
                .findByCourse_CourseIdInAndStatusOrderByUpdatedAtDesc(
                        List.of(course.getCourseId()), ExtraCreditRequestStatus.PENDING);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getUpdatedAt()).isAfterOrEqualTo(result.get(1).getUpdatedAt().truncatedTo(ChronoUnit.SECONDS));
    }

    @Test
    public void testCountByCourse_CourseIdInAndStatus() {
        Course course = createTestCourse();
        courseRepository.save(course);

        User student = createTestStudent();
        userRepository.save(student);

        Category category = createTestCategory();
        categoryRepository.save(category);

        ExtraCreditRequest request1 = new ExtraCreditRequest();
        request1.setDescription("Test request 1");
        request1.setStudent(student);
        request1.setCourse(course);
        request1.setCategory(category);
        request1.setStatus(ExtraCreditRequestStatus.PENDING);
        extraCreditRequestRepository.save(request1);

        ExtraCreditRequest request2 = new ExtraCreditRequest();
        request2.setDescription("Test request 2");
        request2.setStudent(student);
        request2.setCourse(course);
        request2.setCategory(category);
        request2.setStatus(ExtraCreditRequestStatus.PENDING);
        extraCreditRequestRepository.save(request2);

        long count = extraCreditRequestRepository
                .countByCourse_CourseIdInAndStatus(List.of(course.getCourseId()), ExtraCreditRequestStatus.PENDING);

        assertThat(count).isEqualTo(2);
    }
}