package edu.franklin.cecas.service;

import edu.franklin.cecas.domain.Category;
import edu.franklin.cecas.domain.Course;
import edu.franklin.cecas.domain.ExtraCreditRequest;
import edu.franklin.cecas.domain.ExtraCreditRequestStatus;
import edu.franklin.cecas.domain.User;
import edu.franklin.cecas.domain.UserRole;
import edu.franklin.cecas.dto.ExtraCreditRequestCreateDTO;
import edu.franklin.cecas.dto.StudentRequestDetailDTO;
import edu.franklin.cecas.dto.StudentRequestSummaryDTO;
import edu.franklin.cecas.exception.InvalidExtraCreditRequestException;
import edu.franklin.cecas.exception.StudentNotFoundException;
import edu.franklin.cecas.exception.UnauthorizedRoleException;
import edu.franklin.cecas.repository.CategoryRepository;
import edu.franklin.cecas.repository.CourseRepository;
import edu.franklin.cecas.repository.ExtraCreditRequestRepository;
import edu.franklin.cecas.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class ExtraCreditRequestService {
    private final ExtraCreditRequestRepository requestRepository;
    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final PointAllocationService pointAllocationService;

    public ExtraCreditRequestService(
            ExtraCreditRequestRepository requestRepository,
            CourseRepository courseRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository,
            PointAllocationService pointAllocationService) {
        this.requestRepository = requestRepository;
        this.courseRepository = courseRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.pointAllocationService = pointAllocationService;
    }

    @Transactional
    public StudentRequestDetailDTO createRequest(String studentEmail, ExtraCreditRequestCreateDTO dto) {
        User student = userRepository
                .findByEmailIgnoreCaseForUpdate(studentEmail)
                .orElseThrow(() -> new StudentNotFoundException("Student not found with Email: " + studentEmail));

        Course course = courseRepository
                .findById(dto.getCourseId())
                .orElseThrow(
                        () -> new InvalidExtraCreditRequestException("Course not found with ID: " + dto.getCourseId()));

        Category category = categoryRepository
                .findById(dto.getCategoryId())
                .orElseThrow(() ->
                        new InvalidExtraCreditRequestException("Category not found with ID: " + dto.getCategoryId()));

        if (student.getRole() != UserRole.STUDENT) {
            throw new UnauthorizedRoleException("Unauthorized: User is not a student");
        }

        int requestedPoints = category.getDefaultPoints() == null ? 0 : category.getDefaultPoints();
        pointAllocationService.validatePendingRequestAllowed(student.getId(), course.getTerm(), requestedPoints);

        ExtraCreditRequest request = new ExtraCreditRequest();
        request.setCourse(course);
        request.setCategory(category);
        request.setStudent(student);
        request.setDescription(dto.getDescription());
        request.setStatus(ExtraCreditRequestStatus.PENDING);

        ExtraCreditRequest savedRequest = requestRepository.save(request);
        return new StudentRequestDetailDTO(savedRequest);
    }

    public List<StudentRequestSummaryDTO> getRequestsForStudent(String studentEmail) {
        User student = userRepository
                .findByEmailIgnoreCase(studentEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Student not found with Email: " + studentEmail));

        return requestRepository.findByStudent_Id(student.getId()).stream()
                .map(StudentRequestSummaryDTO::new)
                .collect(Collectors.toList());
    }

    public StudentRequestDetailDTO getRequestForStudent(String studentEmail, Integer requestId) {
        User student = userRepository
                .findByEmailIgnoreCase(studentEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Student not found with Email: " + studentEmail));

        ExtraCreditRequest request = requestRepository
                .findByIdAndStudent_Id(requestId, student.getId())
                .orElseThrow(() -> new InvalidExtraCreditRequestException("Extra credit request not found."));

        return new StudentRequestDetailDTO(request);
    }
}
