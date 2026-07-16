package edu.franklin.cecas.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import edu.franklin.cecas.domain.Category;
import edu.franklin.cecas.domain.Course;
import edu.franklin.cecas.domain.ExtraCreditRequest;
import edu.franklin.cecas.domain.ExtraCreditRequestStatus;
import edu.franklin.cecas.domain.User;
import edu.franklin.cecas.domain.UserRole;
import edu.franklin.cecas.dto.StudentRequestDetailDTO;
import edu.franklin.cecas.exception.InvalidStateTransitionException;
import edu.franklin.cecas.exception.StudentNotFoundException;
import edu.franklin.cecas.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class EvidenceSubmissionServiceTest {
    private UserRepository userRepository;
    private EvidenceStorageService evidenceStorageService;
    private StateMachineService stateMachineService;
    private EvidenceSubmissionService evidenceSubmissionService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        evidenceStorageService = mock(EvidenceStorageService.class);
        stateMachineService = mock(StateMachineService.class);
        evidenceSubmissionService = new EvidenceSubmissionService(
                userRepository,
                evidenceStorageService,
                stateMachineService);
    }

    private User createStudent() {
        User student = new User();
        student.setFullName("Derek Test");
        student.setEmail("derek@derek.com");
        student.setPassword("password");
        student.setStudentId(1001);
        student.setProgram("Computer Science");
        student.setIsActive(true);
        student.setMustChangePassword(false);
        student.setRole(UserRole.STUDENT);
        return student;
    }

    private ExtraCreditRequest createSubmittedRequest(User student) {
        Course course = new Course();
        course.setCourseCode("COMP-110");
        course.setTerm("26/FA");
        course.setSection("H1WW");

        Category category = new Category();
        category.setCategoryName("Seminar Attendance");
        category.setDescription("Approved attendance at an academic or professional seminar");
        category.setDefaultPoints(5);

        ExtraCreditRequest request = new ExtraCreditRequest();
        request.setId(42);
        request.setStudent(student);
        request.setCourse(course);
        request.setCategory(category);
        request.setDescription("I attended an approved academic seminar");
        request.setStatus(ExtraCreditRequestStatus.EVIDENCE_SUBMITTED);
        request.setEvidenceFilePath("evidence/request-42/test.pdf");
        return request;
    }

    private MockMultipartFile createFile() {
        return new MockMultipartFile(
                "evidence",
                "proof.pdf",
                "application/pdf",
                "%PDF-1.7 test".getBytes());
    }

    @Test
    void testSubmitEvidenceReturnsUpdatedRequest() {
        User student = createStudent();
        MockMultipartFile file = createFile();
        ExtraCreditRequest updatedRequest = createSubmittedRequest(student);

        when(userRepository.findByEmailIgnoreCase("derek@derek.com")).thenReturn(Optional.of(student));
        when(evidenceStorageService.saveEvidence(42, file)).thenReturn("evidence/request-42/test.pdf");
        when(stateMachineService.submitEvidenceRequest(42, student, "evidence/request-42/test.pdf"))
                .thenReturn(updatedRequest);

        StudentRequestDetailDTO response = evidenceSubmissionService.submitEvidence("derek@derek.com", 42, file);

        assertNotNull(response);
        assertEquals(42, response.getId());
        assertEquals(ExtraCreditRequestStatus.EVIDENCE_SUBMITTED, response.getStatus());
        assertEquals("test.pdf", response.getEvidenceFileName());
        assertEquals(true, response.isEvidenceFileUploaded());
        assertEquals(false, response.isEvidenceUploadAvailable());

        verify(evidenceStorageService, never()).deleteIfExists(anyString());
    }

    @Test
    void testSubmitEvidenceThrowsWhenStudentIsMissing() {
        MockMultipartFile file = createFile();

        when(userRepository.findByEmailIgnoreCase("derek@derek.com")).thenReturn(Optional.empty());

        assertThrows(
                StudentNotFoundException.class,
                () -> evidenceSubmissionService.submitEvidence("derek@derek.com", 42, file));

        verifyNoInteractions(evidenceStorageService);
        verifyNoInteractions(stateMachineService);
    }

    @Test
    void testSubmitEvidenceDeletesFileWhenTransitionFails() {
        User student = createStudent();
        MockMultipartFile file = createFile();

        when(userRepository.findByEmailIgnoreCase("derek@derek.com")).thenReturn(Optional.of(student));
        when(evidenceStorageService.saveEvidence(42, file)).thenReturn("evidence/request-42/test.pdf");
        when(stateMachineService.submitEvidenceRequest(eq(42), eq(student), anyString()))
                .thenThrow(new InvalidStateTransitionException("Invalid transition"));

        assertThrows(
                InvalidStateTransitionException.class,
                () -> evidenceSubmissionService.submitEvidence("derek@derek.com", 42, file));

        verify(evidenceStorageService).deleteIfExists("evidence/request-42/test.pdf");
        verify(stateMachineService).submitEvidenceRequest(eq(42), eq(student), anyString());
    }
}
