package edu.franklin.cecas.web;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import edu.franklin.cecas.exception.EmailAlreadyExistsException;
import edu.franklin.cecas.exception.EvidenceUploadException;
import edu.franklin.cecas.exception.ExtraCreditRequestNotFoundException;
import edu.franklin.cecas.exception.InvalidCredentialsException;
import edu.franklin.cecas.exception.InvalidExtraCreditRequestException;
import edu.franklin.cecas.exception.InvalidPasswordException;
import edu.franklin.cecas.exception.InvalidStateTransitionException;
import edu.franklin.cecas.exception.PasswordChangeNotRequiredException;
import edu.franklin.cecas.exception.PasswordMismatchException;
import edu.franklin.cecas.exception.PointCapExceededException;
import edu.franklin.cecas.exception.RegistrationNotAllowedException;
import edu.franklin.cecas.exception.ResourceNotFoundException;
import edu.franklin.cecas.exception.StudentNotFoundException;
import edu.franklin.cecas.exception.UnauthorizedRoleException;
import edu.franklin.cecas.exception.UserNotFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ProblemDetail handleEmailAlreadyExists(EmailAlreadyExistsException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.CONFLICT);
        problem.setTitle("Email already exists");
        problem.setDetail(ex.getMessage());
        problem.setProperty("errorCode", "AUTH_EMAIL_EXISTS");
        return problem;
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ProblemDetail handleInvalidCredentials(InvalidCredentialsException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.UNAUTHORIZED);
        problem.setTitle("Invalid Credentials");
        problem.setDetail(ex.getMessage());
        problem.setProperty("errorCode", "AUTH_INVALID_CREDENTIALS");
        return problem;
    }

    @ExceptionHandler(RegistrationNotAllowedException.class)
    public ProblemDetail handleRegistrationNotAllowed(RegistrationNotAllowedException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setTitle("Registration not allowed");
        problem.setDetail(ex.getMessage());
        problem.setProperty("errorCode", "AUTH_REGISTRATION_NOT_ALLOWED");
        return problem;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setTitle("Validation failed");
        problem.setDetail("One or more request fields are invalid.");

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));

        problem.setProperty("errorCode", "VALIDATION_FAILED");
        problem.setProperty("errors", errors);
        return problem;
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ProblemDetail handleAccessDenied(AccessDeniedException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.FORBIDDEN);
        problem.setTitle("Forbidden");
        problem.setDetail("You do not have permission to access this resource.");
        problem.setProperty("errorCode", "ACCESS_DENIED");
        return problem;
    }

    @ExceptionHandler(InvalidExtraCreditRequestException.class)
    public ProblemDetail handleInvalidExtraCreditRequest(InvalidExtraCreditRequestException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setTitle("Invalid extra credit request");
        problem.setDetail(ex.getMessage());
        problem.setProperty("errorCode", "EXTRA_CREDIT_REQUEST_INVALID");
        return problem;
    }

    @ExceptionHandler(InvalidPasswordException.class)
    public ProblemDetail handleInvalidPassword(Exception ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setTitle("Invalid Password");
        problem.setDetail(ex.getMessage());
        problem.setProperty("errorCode", "PASSWORD_INVALID");
        return problem;
    }

    @ExceptionHandler(PasswordMismatchException.class)
    public ProblemDetail handlePasswordMismatch(Exception ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setTitle("Password Mismatch");
        problem.setDetail(ex.getMessage());
        problem.setProperty("errorCode", "PASSWORD_MISMATCH");
        return problem;
    }

    @ExceptionHandler(PasswordChangeNotRequiredException.class)
    public ProblemDetail handleNotRequired(Exception ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setTitle("Password Change Not Required");
        problem.setDetail(ex.getMessage());
        problem.setProperty("errorCode", "PASSWORD_CHANGE_NOT_REQUIRED");
        return problem;
    }

    @ExceptionHandler(UnauthorizedRoleException.class)
    public ProblemDetail handleUnauthorizedRole(Exception ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.FORBIDDEN);
        problem.setTitle("Unauthorized Role");
        problem.setDetail(ex.getMessage());
        problem.setProperty("errorCode", "UNAUTHORIZED_ROLE");
        return problem;
    }

    @ExceptionHandler(PointCapExceededException.class)
    public ProblemDetail handlePointCapExceeded(PointCapExceededException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setTitle("Point cap exceeded");
        problem.setDetail(ex.getMessage());
        problem.setProperty("errorCode", "POINT_CAP_EXCEEDED");
        return problem;
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleResourceNotFound(ResourceNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
        problem.setTitle("Not Found");
        problem.setDetail(ex.getMessage());
        problem.setProperty("errorCode", "RESOURCE_NOT_FOUND");
        return problem;
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ProblemDetail handleUserNotFound(UserNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
        problem.setTitle("User Not Found");
        problem.setDetail(ex.getMessage());
        problem.setProperty("errorCode", "USER_NOT_FOUND");
        return problem;
    }

    @ExceptionHandler(InvalidStateTransitionException.class)
    public ProblemDetail handleInvalidTransition(InvalidStateTransitionException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.CONFLICT);
        problem.setTitle("Invalid state transition");
        problem.setDetail(ex.getMessage());
        problem.setProperty("errorCode", "INVALID_TRANSITION");
        return problem;
    }

    @ExceptionHandler(StudentNotFoundException.class)
    public ProblemDetail handleStudentNotFoundException(StudentNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
        problem.setTitle("Student Not Found");
        problem.setDetail(ex.getMessage());
        problem.setProperty("errorCode", "STUDENT_NOT_FOUND");
        return problem;
    }

    @ExceptionHandler(ExtraCreditRequestNotFoundException.class)
    public ProblemDetail handleExtraCreditRequestNotFoundException(ExtraCreditRequestNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
        problem.setTitle("Extra Credit Request Not Found");
        problem.setDetail(ex.getMessage());
        problem.setProperty("errorCode", "EXTRA_CREDIT_REQUEST_NOT_FOUND");
        return problem;
    }

    @ExceptionHandler(EvidenceUploadException.class)
    public ProblemDetail handleEvidenceUploadException(EvidenceUploadException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setTitle("Invalid Evidence Upload");
        problem.setDetail(ex.getMessage());
        problem.setProperty("errorCode", "EVIDENCE_UPLOAD_INVALID");
        return problem;
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ProblemDetail handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setTitle("Invalid evidence upload");
        problem.setDetail("Evidence file must be 10 MB or smaller.");
        problem.setProperty("errorCode", "EVIDENCE_UPLOAD_TOO_LARGE");
        return problem;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGenericException(Exception ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        problem.setTitle("Internal Server Error");
        problem.setDetail("An unexpected error occurred.");
        return problem;
    }
}
