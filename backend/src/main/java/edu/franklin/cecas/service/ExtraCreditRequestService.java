package edu.franklin.cecas.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import edu.franklin.cecas.domain.Category;
import edu.franklin.cecas.domain.Course;
import edu.franklin.cecas.domain.ExtraCreditRequest;
import edu.franklin.cecas.domain.ExtraCreditRequestStatus;
import edu.franklin.cecas.domain.User;
import edu.franklin.cecas.domain.UserRole;
import edu.franklin.cecas.dto.ExtraCreditRequestCreateDTO;
import edu.franklin.cecas.dto.ExtraCreditResponseDTO;
import edu.franklin.cecas.exception.InvalidExtraCreditRequestException;
import edu.franklin.cecas.exception.UnauthorizedRoleException;
import edu.franklin.cecas.repository.CategoryRepository;
import edu.franklin.cecas.repository.CourseRepository;
import edu.franklin.cecas.repository.ExtraCreditRequestRepository;
import edu.franklin.cecas.repository.UserRepository;
import jakarta.transaction.Transactional;

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

    // Create and persist a new Extra Credit Request.
    @Transactional
    public ExtraCreditResponseDTO createRequest(String studentEmail, ExtraCreditRequestCreateDTO dto) {
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new InvalidExtraCreditRequestException("Course not found with ID: " + dto.getCourseId()));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new InvalidExtraCreditRequestException("Category not found with ID: " + dto.getCategoryId()));

        User student = userRepository.findByEmailIgnoreCase(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found with Email: " + studentEmail));

        if (student.getRole() != UserRole.STUDENT) {
            throw new UnauthorizedRoleException("Unauthorized: User is not a student");
        }

        int requestedPoints = category.getDefaultPoints() == null ? 0 : category.getDefaultPoints();
        pointAllocationService.validatePendingRequestAllowed(student.getId(), requestedPoints);

        ExtraCreditRequest request = new ExtraCreditRequest();
        request.setCourse(course);
        request.setCategory(category);
        request.setStudent(student);
        request.setDescription(dto.getDescription());
        request.setStatus(ExtraCreditRequestStatus.PENDING);

        ExtraCreditRequest savedRequest = requestRepository.save(request);
        return new ExtraCreditResponseDTO(savedRequest);
    }

    // Get a list of all requests for a student
    public List<ExtraCreditResponseDTO> getRequestsForStudent(String studentEmail) {
        User student = userRepository.findByEmailIgnoreCase(studentEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Student not found with Email: " + studentEmail));

        return requestRepository.findByStudent_Id(student.getId()).stream()
                .map(ExtraCreditResponseDTO::new)
                .collect(Collectors.toList());
    }
}
